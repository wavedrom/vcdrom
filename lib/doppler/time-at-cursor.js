'use strict';

/** Returns the time value of the current cursor position */
const timeAtCursor = (pstate) => {
  const { width, xScale, xOffset, tgcd, xCursor } = pstate;
  return Math.round(((xCursor - (xOffset * width) / 2) / xScale) * 2) * tgcd;
};

module.exports = timeAtCursor;
