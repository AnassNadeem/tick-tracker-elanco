import { Prisma } from "@prisma/client";
import { prisma } from "./db";
import type {
  MonthlyCount,
  SightingDto,
  SightingListResponse,
  SightingSource,
  Severity,
  TimelineEntry,
} from "./types";
import { normalizeSource } from "./source";
import { parseDateBound, type SightingQuery } from "./validators";

const SEVERITY_VALUES = new Set<Severity>(["low", "medium", "high"]);

export const sightingInclude = {
  species: true,
  region: true,
} satisfies Prisma.SightingInclude;

type SightingRecord = Prisma.SightingGetPayload<{ include: typeof sightingInclude }>;

function asSeverity(value: string | null): Severity | null {
  if (value && SEVERITY_VALUES.has(value as Severity)) return value as Severity;
  return null;
}

function asSource(value: string): SightingSource {
  return normalizeSource(value);
}

export function toSightingDto(row: SightingRecord): SightingDto {
  return {
    id: row.id,
    upstreamId: row.upstreamId,
    observedAt: row.observedAt.toISOString(),
    species: {
      slug: row.species.slug,
      name: row.species.name,
      latinName: row.species.latinName,
      riskLevel: row.species.riskLevel,
    },
    region: {
      id: row.region.id,
      name: row.region.name,
      lat: row.region.lat,
      lng: row.region.lng,
    },
    severity: asSeverity(row.severity),
    locationLabel: row.locationLabel,
    lat: row.lat,
    lng: row.lng,
    reporterNote: row.reporterNote,
    imageUrl: row.imageUrl,
    source: asSource(row.source),
    coordinatesAreApproximate: row.lat === null || row.lng === null,
    createdAt: row.createdAt.toISOString(),
  };
}

function boundsWhere(query: SightingQuery): Prisma.SightingWhereInput | null {
  if (
    query.north === undefined ||
    query.south === undefined ||
    query.east === undefined ||
    query.west === undefined
  ) {
    return null;
  }
  const pad = 0.05;
  const north = query.north + pad;
  const south = query.south - pad;
  const east = query.east + pad;
  const west = query.west - pad;
  const inView = { lat: { gte: south, lte: north }, lng: { gte: west, lte: east } };
  return {
    OR: [
      inView,
      {
        AND: [
          { OR: [{ lat: null }, { lng: null }] },
          { region: inView },
        ],
      },
    ],
  };
}

export function sightingWhere(query: SightingQuery): Prisma.SightingWhereInput {
  const and: Prisma.SightingWhereInput[] = [];

  const from = query.from ? parseDateBound(query.from, "start") : null;
  const to = query.to ? parseDateBound(query.to, "end") : null;
  if (from || to) {
    and.push({
      observedAt: {
        ...(from ? { gte: from } : {}),
        ...(to ? { lte: to } : {}),
      },
    });
  }

  if (query.region) {
    and.push({ region: { name: query.region } });
  }

  if (query.species) {
    and.push({
      OR: [{ species: { slug: query.species } }, { species: { name: query.species } }],
    });
  }

  if (query.severity === "unrated") {
    and.push({ severity: null });
  } else if (query.severity) {
    and.push({ severity: query.severity });
  }

  const bounds = boundsWhere(query);
  if (bounds) and.push(bounds);

  return and.length > 0 ? { AND: and } : {};
}

export const RECENT_WINDOW_DAYS = 14;

export async function recentCutoff(): Promise<Date | null> {
  const maxRow = await prisma.sighting.aggregate({ _max: { observedAt: true } });
  const max = maxRow._max.observedAt;
  if (!max) return null;
  return new Date(max.getTime() - RECENT_WINDOW_DAYS * 24 * 60 * 60 * 1000);
}

export async function listSightings(query: SightingQuery): Promise<SightingListResponse> {
  const baseWhere = sightingWhere(query);
  let where = baseWhere;

  if (query.recent) {
    const cutoff = await recentCutoff();
    if (cutoff) {
      const recentWhere: Prisma.SightingWhereInput = { observedAt: { gte: cutoff } };
      where =
        Object.keys(baseWhere).length > 0 ? { AND: [baseWhere, recentWhere] } : recentWhere;
    }
  }

  const [total, rows] = await Promise.all([
    prisma.sighting.count({ where }),
    prisma.sighting.findMany({
      where,
      include: sightingInclude,
      orderBy: { observedAt: "desc" },
      skip: (query.page - 1) * query.limit,
      take: query.limit,
    }),
  ]);

  return {
    data: rows.map(toSightingDto),
    page: query.page,
    limit: query.limit,
    total,
    hasMore: query.page * query.limit < total,
  };
}

export async function getSighting(id: string) {
  const row = await prisma.sighting.findUnique({
    where: { id },
    include: sightingInclude,
  });
  if (!row) return null;

  const [timelineRows, monthlyRows] = await Promise.all([
    prisma.sighting.findMany({
      where: { regionId: row.regionId },
      include: sightingInclude,
      orderBy: { observedAt: "desc" },
      take: 40,
    }),
    prisma.$queryRaw<Array<{ periodStart: string | null; count: bigint | number }>>`
      SELECT to_char(date_trunc('month', "observedAt"), 'YYYY-MM-01"T00:00:00.000Z"') AS "periodStart",
             COUNT(*)::int AS count
      FROM "Sighting"
      WHERE "regionId" = ${row.regionId}
      GROUP BY date_trunc('month', "observedAt")
      ORDER BY date_trunc('month', "observedAt") ASC
    `,
  ]);

  const timeline: TimelineEntry[] = timelineRows.map((entry) => ({
    id: entry.id,
    observedAt: entry.observedAt.toISOString(),
    speciesName: entry.species.name,
    speciesSlug: entry.species.slug,
    severity: asSeverity(entry.severity),
    source: asSource(entry.source),
  }));

  const monthlyCounts: MonthlyCount[] = monthlyRows
    .filter((entry) => entry.periodStart)
    .map((entry) => ({
      periodStart: entry.periodStart ?? "",
      count: Number(entry.count),
    }));

  return {
    sighting: toSightingDto(row),
    timeline,
    monthlyCounts,
  };
}
