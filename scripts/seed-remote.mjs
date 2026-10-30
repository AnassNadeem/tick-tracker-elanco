// One-off seed of the live Supabase project from data/upstream-snapshot.json.
// Uses the public anon key against PostgREST (RLS is off during the initial seed).
// Run: SUPABASE_URL=... SUPABASE_ANON_KEY=... node scripts/seed-remote.mjs
import { randomUUID } from "node:crypto";
import { readFile } from "node:fs/promises";

const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_ANON_KEY;
if (!url || !key) {
  console.error("Set SUPABASE_URL and SUPABASE_ANON_KEY");
  process.exit(1);
}

async function rest(path, options = {}) {
  const response = await fetch(`${url}/rest/v1/${path}`, {
    ...options,
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
      ...(options.headers ?? {}),
    },
  });
  if (!response.ok) {
    throw new Error(`${response.status} ${path}: ${await response.text()}`);
  }
  if (response.status === 204) return null;
  const text = await response.text();
  return text ? JSON.parse(text) : null;
}

const [species, regions, snapshot] = await Promise.all([
  rest("Species?select=id,name"),
  rest("Region?select=id,name"),
  readFile("data/upstream-snapshot.json", "utf8").then(JSON.parse),
]);

const speciesId = new Map(species.map((row) => [row.name, row.id]));
const regionId = new Map(regions.map((row) => [row.name, row.id]));

const seen = new Set();
const rows = [];
for (const record of snapshot) {
  if (!record?.id || seen.has(record.id)) continue;
  seen.add(record.id);
  const speciesRow = speciesId.get(record.species);
  const regionRow = regionId.get(record.location);
  if (!speciesRow || !regionRow || !record.date) continue;
  const observedAt = /(?:Z|[+-]\d{2}:\d{2})$/.test(record.date) ? record.date : `${record.date}Z`;
  rows.push({
    id: randomUUID(),
    upstreamId: record.id,
    speciesId: speciesRow,
    regionId: regionRow,
    observedAt,
    source: "upstream",
    updatedAt: new Date().toISOString(),
  });
}

let inserted = 0;
for (let index = 0; index < rows.length; index += 100) {
  const batch = rows.slice(index, index + 100);
  await rest("Sighting?on_conflict=upstreamId", {
    method: "POST",
    headers: { Prefer: "resolution=ignore-duplicates,return=minimal" },
    body: JSON.stringify(batch),
  });
  inserted += batch.length;
  console.log(`sent ${inserted}/${rows.length}`);
}

const count = await rest("Sighting?select=id", {
  headers: { Prefer: "count=exact", Range: "0-0" },
});
console.log("sample page", Array.isArray(count) ? count.length : 0);
