'use strict';

/** Returns the time value for a given x (px) screen coordinate */
const tAtX = (x, pstate) => {
  const { xOffset, xScale, width, tgcd } = pstate;
  return Math.round((x / xScale * 2) - (xOffset * width / xScale)) * tgcd;
};

module.exports = tAtX;
