import { Prisma } from "@prisma/client";
import { findCity } from "./cities";
import { prisma } from "./db";

export type RegionStat = {
  regionId: string;
  region: string;
  count: number;
  lastUpdated: string | null;
};

export async function getRegionStats(): Promise<RegionStat[]> {
  const rows = await prisma.$queryRaw<
    Array<{
      id: string;
      region: string;
      count: bigint | number;
      lastUpdated: Date | string | null;
    }>
  >`
    SELECT r.id AS id,
           r.name AS region,
           COUNT(s.id)::int AS count,
           MAX(s."observedAt") AS "lastUpdated"
    FROM "Region" r
    LEFT JOIN "Sighting" s ON s."regionId" = r.id
    GROUP BY r.id
    ORDER BY count DESC, r.name ASC
  `;

  return rows.map((row) => ({
    regionId: row.id,
    region: row.region,
    count: Number(row.count),
    lastUpdated: row.lastUpdated === null ? null : new Date(row.lastUpdated).toISOString(),
  }));
}

function bucketSql(interval: "week" | "month") {
  if (interval === "month") {
    return Prisma.sql`to_char(date_trunc('month', "observedAt"), 'YYYY-MM-01"T00:00:00.000Z"')`;
  }
  return Prisma.sql`to_char(date_trunc('week', "observedAt"), 'YYYY-MM-DD"T00:00:00.000Z"')`;
}

export async function getTrends(input: {
  interval: "week" | "month";
  region?: string;
  from?: Date | null;
  to?: Date | null;
}) {
  if (input.region && !findCity(input.region)) {
    return { ok: false as const, error: "Unknown city" };
  }

  const filters: Prisma.Sql[] = [];
  if (input.region) {
    filters.push(Prisma.sql`"regionId" = (SELECT id FROM "Region" WHERE name = ${input.region})`);
  }
  if (input.from) filters.push(Prisma.sql`"observedAt" >= ${input.from}`);
  if (input.to) filters.push(Prisma.sql`"observedAt" <= ${input.to}`);

  const where =
    filters.length > 0 ? Prisma.sql`WHERE ${Prisma.join(filters, " AND ")}` : Prisma.empty;
  const bucket = bucketSql(input.interval);

  const rows = await prisma.$queryRaw<Array<{ periodStart: string | null; count: bigint | number }>>`
    SELECT ${bucket} AS "periodStart",
           COUNT(*)::int AS count
    FROM "Sighting"
    ${where}
    GROUP BY ${bucket}
    ORDER BY ${bucket} ASC
  `;

  return {
    ok: true as const,
    interval: input.interval,
    region: input.region ?? null,
    data: rows
      .filter((row) => row.periodStart)
      .map((row) => ({
        periodStart: row.periodStart ?? "",
        count: Number(row.count),
      })),
  };
}

export async function getHealth() {
  let db: "ok" | "error" = "ok";
  let sightings = 0;
  let lastIngestedAt: string | null = null;

  try {
    sightings = await prisma.sighting.count();
    const latest = await prisma.sighting.aggregate({
      _max: { updatedAt: true },
      where: { source: "upstream" },
    });
    lastIngestedAt = latest._max.updatedAt?.toISOString() ?? null;
  } catch (error) {
    console.error(error);
    db = "error";
  }

  let upstream: "ok" | "down" = "down";
  try {
    const response = await fetch("https://dev-task.elancoapps.com/data/health", {
      signal: AbortSignal.timeout(4_000),
      cache: "no-store",
    });
    upstream = response.ok ? "ok" : "down";
  } catch {
    upstream = "down";
  }

  return { db, upstream, sightings, lastIngestedAt };
}
