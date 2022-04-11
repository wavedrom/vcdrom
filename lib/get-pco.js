'use strict';

// collect all visible rows

module.exports = (signals, dats, cycles, listing, cursor) => {
  const tStart = dats[cursor].t;
  const pco = {};
  for (let i = 0; i < 1000; i++) {
    if ((cursor + i) > (dats.length - 1)) {
      break;
    }
    const dat = dats[cursor + i];
    const x = dat.t - tStart;
    if (x > cycles) {
      break;
    }
    signals.map(e => {
      const pc = dat[e.id];
      if (pc === undefined) {
        return;
      }
      let lst = listing[pc];
      if (lst !== undefined) {
        pco[pc] = lst;
        return;
      }
      lst = listing[pc - 2];
      if (lst !== undefined) {
        pco[pc - 2] = lst;
        return;
      }
    });
  }

  Object.keys(pco).map((key, idx) => {
    if (pco[key] !== undefined) {
      pco[key].idx = idx;
    }
  });

  return pco;
};
