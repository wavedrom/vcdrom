'use strict';

const xOffsetAtT = require('./xofs-at-t.js');
const tAtX = require('./t-at-x.js');
const refreshCursor = require('./refresh-cursor.js');
const getX = require('./get-x.js');

const isNumber = function isNumber(value) {
  const n = parseInt(value);
  return typeof n === 'number' && isFinite(n);
};

const gotoTime = function gotoTime(time, pstate, cursor, centerCursor, render) {
  const xStartExact = tAtX(pstate.sidebarWidth, pstate);
  const xFinishExact = tAtX(pstate.width, pstate);
  const midOfs = (xFinishExact - xStartExact) / 2;

  if (time == -1 || !isNumber(time)) {
    return true;
  }

  const isVisible = xStartExact <= time && time <= xFinishExact;
  if (!isVisible || centerCursor == 'true') {
    pstate.xOffset = xOffsetAtT(time - midOfs, pstate);
  }

  render();
  pstate.xCursor = getX(pstate, time);
  refreshCursor(cursor, pstate, true);
};


module.exports = gotoTime;
