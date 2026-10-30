// Generates SQL seed files for the Supabase (Postgres) database from the
// reference tables and the upstream snapshot. Run: npx tsx scripts/gen-seed-sql.ts
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { CITIES } from "../lib/cities";
import { SPECIES_CATALOG } from "../lib/species-catalog";

const OUT = path.join(process.cwd(), "prisma", "_seed");
const SNAPSHOT = path.join(process.cwd(), "data", "upstream-snapshot.json");
const BATCH = 200;

const q = (s: string) => `'${s.replace(/'/g, "''")}'`;

async function main() {
  await mkdir(OUT, { recursive: true });

  // Reference data: regions + species (idempotent via ON CONFLICT).
  const regionValues = CITIES.map(
    (c) => `(gen_random_uuid()::text, ${q(c.name)}, ${c.lat}, ${c.lng})`,
  ).join(",\n");
  const speciesValues = SPECIES_CATALOG.map(
    (s) =>
      `(gen_random_uuid()::text, ${q(s.slug)}, ${q(s.name)}, ${q(s.latinName)}, ${q(s.riskLevel)}, ${q(s.description)}, ${q(s.identificationTips)}, ${q(`/images/species-${s.slug}.jpg`)})`,
  ).join(",\n");

  const reference = `INSERT INTO "Region" (id, name, lat, lng) VALUES
${regionValues}
ON CONFLICT (name) DO NOTHING;

INSERT INTO "Species" (id, slug, name, "latinName", "riskLevel", description, "identificationTips", "imageUrl") VALUES
${speciesValues}
ON CONFLICT (slug) DO NOTHING;`;
  await writeFile(path.join(OUT, "00-reference.sql"), reference);

  // Sightings from the snapshot, deduped by upstream id (matches ingest.ts).
  const raw = JSON.parse(await readFile(SNAPSHOT, "utf8")) as Array<{
    id: string;
    date: string;
    location: string;
    species: string;
  }>;
  const seen = new Set<string>();
  const rows: string[] = [];
  for (const r of raw) {
    if (!r?.id || !r.date || !r.location || !r.species) continue;
    if (seen.has(r.id)) continue;
    seen.add(r.id);
    const obs = r.date.replace(/Z$/, "");
    rows.push(`(${q(r.id)}, ${q(r.species)}, ${q(r.location)}, ${q(obs)})`);
  }

  let fileIndex = 1;
  for (let i = 0; i < rows.length; i += BATCH) {
    const batch = rows.slice(i, i + BATCH);
    const sql = `INSERT INTO "Sighting" (id, "upstreamId", "speciesId", "regionId", "observedAt", source, "updatedAt")
SELECT gen_random_uuid()::text, v.uid, sp.id, r.id, v.obs::timestamp, 'upstream', now()
FROM (VALUES
${batch.join(",\n")}
) AS v(uid, sname, rname, obs)
JOIN "Species" sp ON sp.name = v.sname
JOIN "Region" r ON r.name = v.rname
ON CONFLICT ("upstreamId") DO NOTHING;`;
    await writeFile(path.join(OUT, `${String(fileIndex).padStart(2, "0")}-sightings.sql`), sql);
    fileIndex += 1;
  }

  console.log(`Wrote reference + ${fileIndex - 1} sighting batches (${rows.length} rows) to prisma/_seed`);
}

main();
