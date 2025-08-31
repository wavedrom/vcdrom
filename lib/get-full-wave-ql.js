'use strict';

const getFullWaveQL = (wires) => {
  const arr = [];

  const rec = ero => {
    if (ero.kind === 'scope') {
      arr.push(ero.name);
      ero.body.map(rec);
      arr.push('..');
      return;
    }
    if (ero.kind === 'var') {
      arr.push(ero.name);
      return;
    }
    console.error(ero); // eslint-disable-line no-console
    throw new Error();
  };

  rec(wires);
  return arr.join('\n');
};

module.exports = getFullWaveQL;
