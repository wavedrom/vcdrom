"use strict";

module.exports = () => {
  const trace = {};
  return {
    onChunk: (chunk) => {
      chunk.split("\n").map((row) => {
        const m = row.match(/\s*([0-9a-f]+):\s*([0-9a-f]+)\s+(.+)/);
        if (m) {
          const pc = parseInt(m[1], 16);
          const op = m[2];
          const asm = m[3].replace(/\t/, " ");
          trace[pc] = { op, asm };
        }
      });
    },
    getTrace: () => trace,
  };
};
