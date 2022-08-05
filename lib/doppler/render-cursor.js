'use strict';

const genSVG = require('onml/gen-svg.js');
const stringify = require('onml/stringify.js');
const formatTime = require('./format-time.js');
const timeAtCursor = require('./time-at-cursor.js');
const instsAtTime = require('./instructions-at-time.js');
const yMargin = 20;

const renderCursor = (cfg, pstate, send = false) => {
  const {
    cursorXmargin: xmargin,
    cursorFontHeight: fontHeight,
    cursorFontWidth: fontWidth,
    height,
    timescale,
  } = pstate;
  const xx = timeAtCursor(pstate);
  const label = formatTime(xx, timescale);
  // const tt =
  //   Math.round(((pstate.sidebarWidth - (xOffset * width) / 2) / xScale) * 2) *
  //   tgcd;
  // console.log('sbw=' + pstate.sidebarWidth + ' tgcd=' + tgcd + ' xScale=' + xScale + ' width=' + width + ' xOffset=' + xOffset + ' xCursor=' + xCursor);
  // console.log('tt=' + tt);
  // console.log('xx=' + xx);
  const lWidth = (label.length + 1) * fontWidth;

  const body = [
    // vertical line
    [
      'line',
      {
        class: 'wd-cursor-line',
        x1: xmargin + 0.5,
        x2: xmargin + 0.5,
        y1: 0,
        y2: height - 40,
      },
    ],
    // top time label
    [
      'rect',
      {
        class: 'wd-cursor-time',
        x: xmargin - lWidth / 2,
        y: yMargin,
        width: lWidth,
        height: fontHeight * 1.25,
      },
    ],
    [
      'text',
      {
        class: 'wd-cursor-time',
        x: xmargin,
        y: yMargin + fontHeight,
      },
      label,
    ],
    // bottom time label
    [
      'rect',
      {
        class: 'wd-cursor-time',
        x: xmargin - lWidth / 2,
        y: height - yMargin - fontHeight * 1.25 - pstate.bottomLabelOffset,
        width: lWidth,
        height: fontHeight * 1.25,
      },
    ],
    [
      'text',
      {
        class: 'wd-cursor-time',
        x: xmargin,
        y: height - (yMargin + fontHeight * 0.25) - pstate.bottomLabelOffset,
      },
      label,
    ],
  ];
  if (pstate.markmode && send) {
    instsAtTime(xx, pstate);
  }

  return stringify(genSVG(2 * xmargin, height - 40).concat(body));
};

module.exports = renderCursor;
