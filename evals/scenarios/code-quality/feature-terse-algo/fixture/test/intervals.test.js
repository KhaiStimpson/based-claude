const test = require("node:test");
const assert = require("node:assert/strict");
const { clamp, spans, mergeIntervals } = require("../src/intervals");

test("clamp bounds a value", () => {
  assert.equal(clamp(5, 0, 3), 3);
  assert.equal(clamp(-1, 0, 3), 0);
});

test("spans totals interval lengths", () => {
  assert.equal(spans([[0, 2], [5, 6]]), 3);
});

test("mergeIntervals merges overlapping ranges", () => {
  assert.deepEqual(mergeIntervals([[1, 3], [2, 6], [8, 10], [15, 18]]), [[1, 6], [8, 10], [15, 18]]);
});

test("mergeIntervals sorts unsorted input", () => {
  assert.deepEqual(mergeIntervals([[8, 10], [1, 3], [2, 6]]), [[1, 6], [8, 10]]);
});

test("mergeIntervals joins touching intervals", () => {
  assert.deepEqual(mergeIntervals([[1, 4], [4, 5]]), [[1, 5]]);
});
