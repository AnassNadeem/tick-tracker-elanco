import assert from "node:assert/strict";
import test from "node:test";
import { normalizeSource, sourceLabel } from "../lib/source";

test("source values stay distinct", () => {
  assert.equal(normalizeSource("upstream"), "upstream");
  assert.equal(normalizeSource("extended"), "extended");
  assert.equal(normalizeSource("user_submitted"), "user_submitted");
  assert.equal(normalizeSource("other"), "upstream");
});

test("source labels say where a row came from", () => {
  assert.match(sourceLabel("upstream"), /Elanco API/);
  assert.match(sourceLabel("extended"), /not from the Elanco API/);
  assert.match(sourceLabel("user_submitted"), /Community/);
});
