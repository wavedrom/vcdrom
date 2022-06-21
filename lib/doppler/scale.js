'use strict';

const xOffsetScale = (pstate, n) => {
  const {xOffset, xCursor, width} = pstate;
  return -(n * (-xOffset * width + xCursor * 2) - xCursor * 2) / width;
};

const plus = pstate => {
  const n = 3 / 2;
  let {xScale, xScaleMax, xOffset, sidebarOffset} = pstate;

  if (xScale === xScaleMax) { return false; }

  xScale *= n;
  if (xScale > xScaleMax) { xScale = xScaleMax; }

  xOffset = xOffsetScale(pstate, n);
  if (xOffset > sidebarOffset) { xOffset = sidebarOffset; }

  pstate.xScale = xScale;
  pstate.xOffset = xOffset;
  return true;
};

const minus = pstate => {
  const n = 2 / 3;
  let {xScale, xScaleMin, xOffset, sidebarOffset, time, width} = pstate;
  if (xScale === xScaleMin) { return false; }
  xScale *= n;
  if (xScale < xScaleMin) { xScale = xScaleMin; }

  xOffset = xOffsetScale(pstate, n);

  const xOffsetMin = 2 - xScale * time / width;
  if (xOffset < xOffsetMin) { xOffset = xOffsetMin; }
  if (xOffset > sidebarOffset) { xOffset = sidebarOffset; }

  pstate.xScale = xScale;
  pstate.xOffset = xOffset;
  return true;
};

const full = pstate => {
  const {xScale, xScaleMin, xOffset, sidebarOffset} = pstate;
  if ((xScale === xScaleMin) && (xOffset === sidebarOffset)) { return false; }
  pstate.xScale = xScaleMin;
  pstate.xOffset = sidebarOffset;
  return true;
};

const up = delta => (pstate, cm) => {
  const info = cm.getScrollInfo();
  cm.scrollTo(null, info.top - info.clientHeight * delta);
  // let {yOffset} = pstate;
  // if (yOffset === 0) { return false; }
  // yOffset -= delta;
  // if (yOffset < 0) { yOffset = 0; }
  // pstate.yOffset = yOffset;
  return false;
};

const down = delta => (pstate, cm) => {
  const info = cm.getScrollInfo();
  cm.scrollTo(null, info.top + info.clientHeight * delta);
  // let {yOffset, yStep, numLanes, height} = pstate;
  // const yOffsetMax = (numLanes + 2) * yStep / height - 2;
  // if (yOffset === yOffsetMax) { return false; }
  // yOffset += delta;
  //
  // if (yOffsetMax < 0) { yOffset = 0; } else
  // if (yOffset > yOffsetMax) { yOffset = yOffsetMax; }
  //
  // pstate.yOffset = yOffset;
  return false;
};

module.exports = {
  "+": plus,
  "=": plus,
  "-": minus,
  _: minus,
  f: full,
  F: full,
  Home: (pstate) => {
    let { xOffset, sidebarOffset } = pstate;
    if (xOffset === sidebarOffset) {
      return false;
    }
    pstate.xOffset = sidebarOffset;
    return true;
  },
  End: (pstate) => {
    let { xOffset, xScale, time, width } = pstate;
    const xOffsetMin = 2 - (xScale * time) / width;
    if (xOffset === xOffsetMin) {
      return false;
    }
    pstate.xOffset = xOffsetMin;
    return true;
  },
  ArrowLeft: (pstate) => {
    let { xOffset, sidebarOffset } = pstate;
    if (xOffset === sidebarOffset) {
      return false;
    }
    xOffset += 0.1;
    if (xOffset > sidebarOffset) {
      xOffset = sidebarOffset;
    }
    pstate.xOffset = xOffset;
    return true;
  },
  ArrowRight: (pstate) => {
    let { xOffset, xScale, width, time } = pstate;
    const xOffsetMin = 2 - (xScale * time) / width;
    if (xOffset === xOffsetMin) {
      return false;
    }
    xOffset -= 0.1;
    if (xOffset < xOffsetMin) {
      xOffset = xOffsetMin;
    }
    pstate.xOffset = xOffset;
    return true;
  },
  ArrowUp: up(0.1),
  ArrowDown: down(0.1),
  PageUp: up(1),
  PageDown: down(1),
  nop: () => false
};
