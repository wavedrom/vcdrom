'use strict';

const genSVG = require('onml/gen-svg.js');
const stringify = require('onml/stringify.js');
const formatTime = require('./format-time.js');

const renderCursor = (cfg, pstate) => {
  const {xmargin, fontWidth, fontHeight} = cfg;
  const {width, height, xScale, xOffset, tgcd, timescale, xCursor} = pstate;

  const xx = Math.round((xCursor - xOffset * width / 2) / xScale * 2) * tgcd;
  const label = formatTime(xx, timescale);
  const lWidth = (label.length + 1) * fontWidth;

  const body = [
    // vertical line
    ['line', {
      class: 'wd-cursor-line',
      x1: xmargin + 0.5,
      x2: xmargin + 0.5,
      y1: 0,
      y2: height
    }],
    // top time label
    ['rect', {
      class: 'wd-cursor-time',
      x: xmargin - lWidth / 2,
      y: 0,
      width: lWidth,
      height: fontHeight * 1.25
    }],
    ['text', {
      class: 'wd-cursor-time',
      x: xmargin,
      y: fontHeight
    }, label],
    // bottom time label
    ['rect', {
      class: 'wd-cursor-time',
      x: xmargin - lWidth / 2,
      y: height - fontHeight * 1.25,
      width: lWidth,
      height: fontHeight * 1.25
    }],
    ['text', {
      class: 'wd-cursor-time',
      x: xmargin,
      y: height - fontHeight * .25
    }, label]
  ];
  return stringify(genSVG(2 * xmargin, height).concat(body));
};

module.exports = renderCursor;
