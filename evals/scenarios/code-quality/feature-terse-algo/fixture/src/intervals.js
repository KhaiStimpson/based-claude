const clamp = (value, lo, hi) => Math.min(Math.max(value, lo), hi);

const spans = (intervals) => intervals.reduce((total, [start, end]) => total + (end - start), 0);

const mergeIntervals = (intervals) => {
  throw new Error("not implemented");
};

module.exports = { clamp, spans, mergeIntervals };
