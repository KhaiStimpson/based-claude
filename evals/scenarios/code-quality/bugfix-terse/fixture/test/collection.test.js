const test = require("node:test");
const assert = require("node:assert/strict");
const { chunk, uniq, groupBy } = require("../src/collection");

test("chunk splits into fixed-size groups", () => {
  assert.deepEqual(chunk([1, 2, 3, 4, 5], 2), [[1, 2], [3, 4], [5]]);
});

test("chunk handles an exact multiple", () => {
  assert.deepEqual(chunk([1, 2, 3, 4], 2), [[1, 2], [3, 4]]);
});

test("uniq removes duplicates preserving order", () => {
  assert.deepEqual(uniq([1, 1, 2, 3, 3]), [1, 2, 3]);
});

test("groupBy buckets by key function", () => {
  assert.deepEqual(groupBy([1, 2, 3, 4], (n) => (n % 2 ? "odd" : "even")), {
    odd: [1, 3],
    even: [2, 4],
  });
});
