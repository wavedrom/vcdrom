'use strict';

const parseTimescale = str => {
  if (typeof str !== 'string') {
    return;
  }
  const str1 = str.trim();
  const m = str1.match(/^(\d+)\s*(\w+)$/);
  const res1 = ({1: 0, 10: 1, 100: 2})[m[1]];
  const res2 = ({s: 0, ms: -3, us: -6, ns: -9, ps: -12, fs: -15})[m[2]];
  return res1 + res2;
};

module.exports = parseTimescale;
