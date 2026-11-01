import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";
import { SPECIES_CATALOG } from "../lib/species-catalog";

type UpstreamRow = {
  id: string;
  date: string;
  location: string;
  species: string;
  latinName: string;
};

const rows = JSON.parse(fs.readFileSync("data/upstream-snapshot.json", "utf8")) as UpstreamRow[];

test("snapshot species names match the guide exactly", () => {
  const fromFeed = [...new Set(rows.map((row) => `${row.species}|${row.latinName}`))].sort();
  const fromGuide = SPECIES_CATALOG.map((species) => `${species.name}|${species.latinName}`).sort();
  assert.deepEqual(fromFeed, fromGuide);
});

test("snapshot is the 2012–2024 Elanco feed", () => {
  assert.equal(rows.length, 1000);
  assert.equal(new Set(rows.map((row) => row.id)).size, 1000);
  const years = rows.map((row) => row.date.slice(0, 4));
  assert.equal(Math.min(...years.map(Number)), 2012);
  assert.equal(Math.max(...years.map(Number)), 2024);
  assert.equal(years.includes("2025"), false);
  assert.equal(years.includes("2026"), false);
  assert.equal(rows.some((row) => row.date.startsWith("2012-")), true);
  assert.equal(new Set(rows.map((row) => row.location)).size, 14);
});
