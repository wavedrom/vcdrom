"use strict";

const genSVG = require("onml/gen-svg.js");
const stringify = require("onml/stringify.js");
const formatTime = require("./format-time.js");
const timeAtCursor = require("./time-at-cursor.js");
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
      "line",
      {
        class: "wd-cursor-line",
        x1: xmargin + 0.5,
        x2: xmargin + 0.5,
        y1: 0,
        y2: height,
      },
    ],
    // top time label
    [
      "rect",
      {
        class: "wd-cursor-time",
        x: xmargin - lWidth / 2,
        y: yMargin,
        width: lWidth,
        height: fontHeight * 1.25,
      },
    ],
    [
      "text",
      {
        class: "wd-cursor-time",
        x: xmargin,
        y: yMargin + fontHeight,
      },
      label,
    ],
    // bottom time label
    [
      "rect",
      {
        class: "wd-cursor-time",
        x: xmargin - lWidth / 2,
        y: height - yMargin - fontHeight * 1.25 - 25,
        width: lWidth,
        height: fontHeight * 1.25,
      },
    ],
    [
      "text",
      {
        class: "wd-cursor-time",
        x: xmargin,
        y: height - (yMargin + fontHeight * 0.25) - 25,
      },
      label,
    ],
  ];
  if (pstate.markmode && send) {
    // const t = timeAtCursor(pstate);
    var pcAddrs = document.getElementsByClassName("pc-addr");

    const count = pcAddrs.length;
    var addr = "unknown";
    for (let i = 0; i < count; i++) {
      let y1 = pcAddrs[i].getBoundingClientRect().top;
      let y2 = pcAddrs[i].getBoundingClientRect().bottom;
      if (pstate.yCursor >= y1 && pstate.yCursor <= y2) {
        addr = pcAddrs[i].textContent.trim();
      }
    }
    pstate.ws.sendmsg("marked " + xx + " " + addr);
  }
  return stringify(genSVG(2 * xmargin, height).concat(body));
};

module.exports = renderCursor;
