import { buildExtendedRows } from "./extend-plan";
import { prisma } from "./db";

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
  const rows = buildExtendedRows(regions, speciesRows);

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
