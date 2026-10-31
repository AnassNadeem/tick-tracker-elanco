import { prisma } from "./db";

// Summer-weighted counts, in the same range as a typical year in the upstream feed.
// 2026 stops at October so no row is dated after the feed was extended.
const MONTH_COUNTS: Record<number, number[]> = {
  2025: [3, 2, 3, 6, 9, 12, 14, 12, 8, 5, 3, 3],
  2026: [2, 2, 3, 6, 8, 12, 13, 12, 7, 5],
};

function hash(input: string) {
  let value = 2166136261;
  for (let index = 0; index < input.length; index += 1) {
    value = Math.imul(value ^ input.charCodeAt(index), 16777619);
  }
  return value >>> 0;
}

function daysInMonth(year: number, monthIndex: number) {
  return new Date(Date.UTC(year, monthIndex + 1, 0)).getUTCDate();
}

function chunks<T>(items: T[], size: number): T[][] {
  const batches: T[][] = [];
  for (let index = 0; index < items.length; index += size) {
    batches.push(items.slice(index, index + size));
  }
  return batches;
}

export async function extendRecentYears() {
  const [regions, speciesRows] = await Promise.all([
    prisma.region.findMany({ orderBy: { name: "asc" } }),
    prisma.species.findMany({ orderBy: { slug: "asc" } }),
  ]);
  if (regions.length === 0 || speciesRows.length === 0) {
    throw new Error("Seed cities and species before extending 2025 and 2026 sightings");
  }

  type Row = {
    upstreamId: string;
    speciesId: string;
    regionId: string;
    observedAt: Date;
    severity: string;
  };
  const rows: Row[] = [];

  for (const [yearText, counts] of Object.entries(MONTH_COUNTS)) {
    const year = Number(yearText);
    counts.forEach((count, monthIndex) => {
      const monthDays = daysInMonth(year, monthIndex);
      const days = year === 2026 && monthIndex === 9 ? Math.min(monthDays, 30) : monthDays;
      for (let index = 0; index < count; index += 1) {
        const upstreamId = `local-${year}-${String(monthIndex + 1).padStart(2, "0")}-${String(index + 1).padStart(2, "0")}`;
        const species = speciesRows[hash(`${upstreamId}-species`) % speciesRows.length];
        const region = regions[hash(`${upstreamId}-region`) % regions.length];
        const day = 1 + (hash(`${upstreamId}-day`) % days);
        rows.push({
          upstreamId,
          speciesId: species.id,
          regionId: region.id,
          severity: species.riskLevel,
          observedAt: new Date(
            Date.UTC(
              year,
              monthIndex,
              day,
              hash(`${upstreamId}-h`) % 24,
              hash(`${upstreamId}-m`) % 60,
              hash(`${upstreamId}-s`) % 60,
            ),
          ),
        });
      }
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
            severity: row.severity,
            source: "extended",
          },
          update: {
            speciesId: row.speciesId,
            regionId: row.regionId,
            observedAt: row.observedAt,
            severity: row.severity,
            source: "extended",
          },
        }),
      ),
    );
  }

  return { upserted: rows.length };
}
