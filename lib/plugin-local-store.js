'use strict';

const pluginLocalStore = (desc, pstate /* , els */) => {
  localStorage.setItem(
    'vcdrom',
    JSON.stringify({
      // yOffset: pstate.yOffset,
      xOffset: pstate.xOffset,
      xScale: pstate.xScale
    })
  );
};

module.exports = pluginLocalStore;

/* eslint-env browser */
