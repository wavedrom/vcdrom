'use strict';

module.exports = () => {
  const trace = {};
  let tail = '';
  return {
    onChunk: (chunk) => {
      const rows = (tail + chunk).split('\n');
      // console.log('chunk:', chunk.length, 'tail:', tail.length, 'rows:', rows.length);
      tail = rows.pop();
      rows.map(row => {
        const m = row.match(/\s*([0-9a-f]+):\s*([0-9a-f]+)\s+(.+)/);
        if (m) {
          const pc = parseInt(m[1], 16);
          const op = m[2];
          const asm = m[3].replace(/\t/, ' ');
          trace[pc] = {op, asm};
        }
      });
    },
    getTrace: () => trace
  };
};
