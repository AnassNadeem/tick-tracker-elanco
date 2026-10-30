import fs from "node:fs/promises";
import path from "node:path";
import { findCity } from "./cities";
import { prisma } from "./db";
import { findSpeciesByName } from "./species-catalog";

const UPSTREAM_URL = "https://dev-task.elancoapps.com/data/tick-sightings";
const SNAPSHOT_PATH = path.join(process.cwd(), "data", "upstream-snapshot.json");

export type UpstreamSighting = {
  id: string;
  date: string;
  location: string;
  species: string;
  latinName: string;
};

export type IngestResult = {
  source: "live" | "snapshot";
  fetched: number;
  upserted: number;
  skippedIncomplete: number;
  skippedUnknown: number;
  skippedBadDate: number;
  latinNameMismatches: string[];
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function asSighting(value: unknown): UpstreamSighting | null {
  if (!isRecord(value)) return null;
  const { id, date, location, species, latinName } = value;
  if (
    typeof id !== "string" ||
    typeof date !== "string" ||
    typeof location !== "string" ||
    typeof species !== "string" ||
    typeof latinName !== "string"
  ) {
    return null;
  }
  if (![id, date, location, species, latinName].every((part) => part.trim())) {
    return null;
  }
  return { id, date, location, species, latinName };
}

async function fetchLivePayload(): Promise<unknown[]> {
  let lastError: unknown;
  for (let attempt = 1; attempt <= 3; attempt += 1) {
    try {
      const response = await fetch(UPSTREAM_URL, {
        signal: AbortSignal.timeout(15_000),
        cache: "no-store",
      });
      if (!response.ok) {
        throw new Error(`Upstream responded ${response.status}`);
      }
      const payload: unknown = await response.json();
      if (!Array.isArray(payload)) {
        throw new Error("Upstream payload was not an array");
      }
      return payload;
    } catch (error) {
      lastError = error;
      if (attempt < 3) {
        await new Promise((resolve) => setTimeout(resolve, 500 * attempt));
      }
    }
  }
  throw lastError instanceof Error ? lastError : new Error("Upstream fetch failed");
}

export async function loadUpstreamSightings(): Promise<{
  source: "live" | "snapshot";
  records: unknown[];
}> {
  try {
    const records = await fetchLivePayload();
    if (records.length === 0) {
      throw new Error("Upstream returned no records");
    }
    return { source: "live", records };
  } catch (error) {
    console.warn(
      `Upstream fetch failed (${error instanceof Error ? error.message : "unknown error"}). Using data/upstream-snapshot.json.`,
    );
    const raw = await fs.readFile(SNAPSHOT_PATH, "utf8");
    const payload: unknown = JSON.parse(raw);
    if (!Array.isArray(payload)) {
      throw new Error("Snapshot payload was not an array");
    }
    return { source: "snapshot", records: payload };
  }
}

function parseObservedAt(value: string): Date | null {
  const normalized = /(?:Z|[+-]\d{2}:\d{2})$/.test(value) ? value : `${value}Z`;
  const date = new Date(normalized);
  return Number.isNaN(date.getTime()) ? null : date;
}

function chunks<T>(items: T[], size: number): T[][] {
  const batches: T[][] = [];
  for (let index = 0; index < items.length; index += size) {
    batches.push(items.slice(index, index + size));
  }
  return batches;
}

export async function ingestUpstream(): Promise<IngestResult> {
  const { source, records } = await loadUpstreamSightings();
  const [regions, speciesRows] = await Promise.all([
    prisma.region.findMany(),
    prisma.species.findMany(),
  ]);
  const regionIdByName = new Map(regions.map((region) => [region.name, region.id]));
  const speciesIdByName = new Map(speciesRows.map((species) => [species.name, species.id]));

  const seen = new Set<string>();
  const latinNameMismatches = new Set<string>();
  let skippedIncomplete = 0;
  let skippedUnknown = 0;
  let skippedBadDate = 0;

  type Row = {
    upstreamId: string;
    speciesId: string;
    regionId: string;
    observedAt: Date;
  };
  const rows: Row[] = [];

  for (const record of records) {
    const sighting = asSighting(record);
    if (!sighting) {
      skippedIncomplete += 1;
      continue;
    }
    if (seen.has(sighting.id)) continue;
    seen.add(sighting.id);

    const city = findCity(sighting.location);
    const species = findSpeciesByName(sighting.species);
    const regionId = regionIdByName.get(sighting.location);
    const speciesId = speciesIdByName.get(sighting.species);
    if (!city || !species || !regionId || !speciesId) {
      skippedUnknown += 1;
      continue;
    }
    if (species.latinName !== sighting.latinName) {
      latinNameMismatches.add(`${sighting.species}: upstream ${sighting.latinName}, seed ${species.latinName}`);
    }
    const observedAt = parseObservedAt(sighting.date);
    if (!observedAt) {
      skippedBadDate += 1;
      continue;
    }
    rows.push({
      upstreamId: sighting.id,
      speciesId,
      regionId,
      observedAt,
    });
  }

  for (const batch of chunks(rows, 50)) {
    await prisma.$transaction(
      batch.map((row) =>
        prisma.sighting.upsert({
          where: { upstreamId: row.upstreamId },
          create: {
            upstreamId: row.upstreamId,
            speciesId: row.speciesId,
            regionId: row.regionId,
            observedAt: row.observedAt,
            severity: null,
            source: "upstream",
          },
          update: {
            speciesId: row.speciesId,
            regionId: row.regionId,
            observedAt: row.observedAt,
            source: "upstream",
          },
        }),
      ),
    );
  }

  return {
    source,
    fetched: records.length,
    upserted: rows.length,
    skippedIncomplete,
    skippedUnknown,
    skippedBadDate,
    latinNameMismatches: [...latinNameMismatches],
  };
}
