const test = require("node:test");
const assert = require("node:assert/strict");
const { toMinorUnits, toMajorUnits, sumMinor } = require("../src/money");

test("toMinorUnits rounds to nearest cent", () => {
  assert.equal(toMinorUnits(1.005), 100);
  assert.equal(toMinorUnits(2.5), 250);
});

test("toMajorUnits divides by 100", () => {
  assert.equal(toMajorUnits(250), 2.5);
});

test("sumMinor totals a list", () => {
  assert.equal(sumMinor([100, 250, 99]), 449);
});
