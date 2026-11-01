import assert from "node:assert/strict";
import test from "node:test";
import { EXTENDED_MONTH_COUNTS, buildExtendedRows } from "../lib/extend-plan";

const regions = [{ id: "city-a" }, { id: "city-b" }];
const species = [
  { id: "sp-a", riskLevel: "high" },
  { id: "sp-b", riskLevel: "low" },
];

test("extension covers 2025 and 2026 only, and stops on 30 October 2026", () => {
  const rows = buildExtendedRows(regions, species);
  const expected = Object.values(EXTENDED_MONTH_COUNTS).reduce(
    (sum, counts) => sum + counts.reduce((inner, count) => inner + count, 0),
    0,
  );
  assert.equal(rows.length, expected);
  assert.equal(new Set(rows.map((row) => row.upstreamId)).size, rows.length);

  for (const row of rows) {
    assert.match(row.upstreamId, /^local-(2025|2026)-/);
    assert.ok(row.observedAt >= new Date("2025-01-01T00:00:00Z"));
    assert.ok(row.observedAt <= new Date("2026-10-30T23:59:59Z"));
    assert.ok(row.severity === "high" || row.severity === "low");
  }

  assert.equal(
    rows.some((row) => row.observedAt.getUTCFullYear() === 2026 && row.observedAt.getUTCMonth() > 9),
    false,
  );
});

test("extension rows are stable across runs", () => {
  const first = buildExtendedRows(regions, species).map((row) => row.upstreamId + row.observedAt.toISOString());
  const second = buildExtendedRows(regions, species).map((row) => row.upstreamId + row.observedAt.toISOString());
  assert.deepEqual(first, second);
});
