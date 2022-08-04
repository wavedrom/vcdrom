'use strict';

const genResizeHandler = pstate =>
  (width, height) => {
    let {xScale, yStep, yOffset, time, sidebarWidth, numLanes} = pstate;

    pstate.width = width;
    pstate.height = height;

    const yOffsetMax = (numLanes + 2) * yStep / height - 2;
    if (yOffsetMax < 0) { yOffset = 0; } else
    if (yOffset > yOffsetMax) { yOffset = yOffsetMax; }
    pstate.yOffset = yOffset;

    const xScaleMin = pstate.xScaleMin = (2 * (width - sidebarWidth)) / time;
    if (xScale < xScaleMin) { xScale = xScaleMin; }
    pstate.xScale = xScale;

    pstate.sidebarOffset = 2 * sidebarWidth / width;
    pstate.xOffset = pstate.xOffset || pstate.sidebarOffset;
  };

module.exports = genResizeHandler;
