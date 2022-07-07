'use strict';

/** Returns a model x-offset for the specified time value */
const xOffsetAtT = (t, pstate) => {
  const {sidebarWidth, xScale, width, tgcd } = pstate;
  return -2 * (xScale * t * tgcd / 2 - sidebarWidth) / width;
};

module.exports = xOffsetAtT;
