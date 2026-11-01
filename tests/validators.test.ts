import assert from "node:assert/strict";
import test from "node:test";
import { parseDateBound, sightingQuerySchema } from "../lib/validators";

test("a date-only bound covers the whole UTC day", () => {
  assert.equal(parseDateBound("2012-01-03", "start")?.toISOString(), "2012-01-03T00:00:00.000Z");
  assert.equal(parseDateBound("2024-12-30", "end")?.toISOString(), "2024-12-30T23:59:59.999Z");
});

test("sighting filters reject an inverted range", () => {
  const parsed = sightingQuerySchema.safeParse({ from: "2024-02-02", to: "2012-01-01" });
  assert.equal(parsed.success, false);
});

test("map bounds must be sent as a full box", () => {
  const parsed = sightingQuerySchema.safeParse({ north: "53", south: "51" });
  assert.equal(parsed.success, false);
});
