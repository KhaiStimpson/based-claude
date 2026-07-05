const node = (value, next = null) => ({ value, next });

const fromArray = (values) => values.reduceRight((next, value) => node(value, next), null);

const toArray = (head) => {
  const out = [];
  for (let cur = head; cur; cur = cur.next) out.push(cur.value);
  return out;
};

module.exports = { node, fromArray, toArray };
