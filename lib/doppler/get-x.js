'use strict';

const getX = (pstate, time) => {
  const { width, xOffset, xScale } = pstate;
  const x = (time * xScale + xOffset * width) / 2;
  return x;
};

module.exports = getX;
