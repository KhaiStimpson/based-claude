const chunk = (items, size) => {
  const out = [];
  for (let i = 0; i < items.length; i += size) {
    out.push(items.slice(i, size));
  }
  return out;
};

const uniq = (items) => [...new Set(items)];

const groupBy = (items, key) =>
  items.reduce((acc, item) => {
    const bucket = key(item);
    (acc[bucket] ??= []).push(item);
    return acc;
  }, {});

module.exports = { chunk, uniq, groupBy };
