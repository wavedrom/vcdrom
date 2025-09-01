'use strict';

const pluginLocalStore = (desc, pstate /* , els */) => {
  let {xOffset, xScale, width, sidebarWidth, time} = pstate;
  // xOffset = xOffset || 320;
  // if (
  //   (xScale === undefined) ||
  //   isNaN(xScale) ||
  //   (xScale === 0) ||
  //   (xScale === null) ||
  //   (xScale === -Infinity) ||
  //   (xScale === Infinity)
  // ) {
  //   xScale = 8;
  // }
  const obj = {xOffset, xScale, width, sidebarWidth, time};
  console.log(obj);
  // localStorage.setItem('vcdrom', JSON.stringify(obj));
};

module.exports = pluginLocalStore;
