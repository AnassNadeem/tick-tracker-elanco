import assert from "node:assert/strict";
import test from "node:test";
import { jitteredPosition } from "../lib/jitter";

test("city-centre jitter is stable and stays near the city", () => {
  const first = jitteredPosition("02WNholuSg6ndCk4c1dA", 53.48, -2.24);
  const second = jitteredPosition("02WNholuSg6ndCk4c1dA", 53.48, -2.24);
  assert.deepEqual(first, second);
  assert.ok(Math.abs(first.lat - 53.48) < 0.02);
  assert.ok(Math.abs(first.lng - -2.24) < 0.02);
  assert.notDeepEqual(first, jitteredPosition("other-id", 53.48, -2.24));
});
