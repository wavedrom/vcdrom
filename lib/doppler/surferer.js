'use strict';

const tAtX = require('./t-at-x.js');

function* surferer (wave, pstate) {
  const { sidebarWidth, width } = pstate;
  const xStartExact = tAtX(sidebarWidth, pstate);
  const xFinishExact = tAtX(width, pstate);

  let i = 0;
  for (i = 0; i < wave.length; i++) { // seek to the start of viewport
    if ((wave[i] === undefined) || (wave[i][0] >= xStartExact)) {
      break;
    }
  }
  for (; i < wave.length; i++) { // render viewport
    if ((wave[i] === undefined) || (wave[i][0] > xFinishExact)) {
      break;
    }
    yield i;
  }
}

module.exports = surferer;
