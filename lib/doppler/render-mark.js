'use strict';

const genSVG = require('onml/gen-svg.js');
const stringify = require('onml/stringify.js');
const tAtX = require('./t-at-x.js');
const xAtT = require('./get-x.js');

const markXMargin = 40;
const markFontHeight = 20;
const markFontWidth = markFontHeight / 2;
const yMargin = 20;

function getMarkClase(mark) {
  switch (mark) {
  case 'a':
  case 'b':
    return 'markab';
  case 'c':
  case 'd':
    return 'markcd';  
  }
  return '';
}

const renderMark = (div, key, pstate) => {
  const tStartExact = tAtX(pstate.sidebarWidth, pstate);
  const tFinishExact = tAtX(pstate.width, pstate);
  const tMark = pstate.abmarks[key];
  if (tMark == -1) {
    // No mark set yet.
    // console.log("mark " + key + " not set yet");
    div.innerHTML = '';
    return;
  }

  const isVisible = tStartExact <= tMark && tMark <= tFinishExact;
  if (!isVisible) {
    // Not visible in this window.
    // console.log("mark " + key + " not visible", tStartExact, tMark, tFinishExact);
    div.innerHTML = '';
    return;
  }


  const markLabel = key;

  const markClass = getMarkClase(markLabel);
  const {height} = pstate;

  const label = markLabel;

  //console.log('render mark ', markLabel, markClass, tMark);

  const lWidth = (label.length + 1) * markFontWidth;

  const body = [
    // vertical line
    [
      'line',
      {
        class: 'wd-' + markClass + '-line',
        x1: markXMargin + 0.5,
        x2: markXMargin + 0.5,
        y1: 0,
        y2: height
      }
    ],
    // top time label
    [
      'rect',
      {
        class: 'wd-' + markClass + '-time',
        x: markXMargin - lWidth / 2,
        y: yMargin,
        width: lWidth,
        height: markFontHeight * 1.25
      }
    ],
    [
      'text',
      {
        class: 'wd-' + markClass + '-time',
        x: markXMargin,
        y: yMargin + markFontHeight
      },
      label
    ],
    // bottom time label
    [
      'rect',
      {
        class: 'wd-' + markClass + '-time',
        x: markXMargin - lWidth / 2,
        y: height - yMargin - markFontHeight * 1.25,
        width: lWidth,
        height: markFontHeight * 1.25
      }
    ],
    [
      'text',
      {
        class: 'wd-' + markClass + '-time',
        x: markXMargin,
        y: height - (yMargin + markFontHeight * 0.25)
      },
      label
    ]
  ];
  const x = xAtT(pstate, tMark);
  div.style.left = (x - markXMargin) + 'px';
  div.innerHTML = stringify(genSVG(2 * markXMargin, height).concat(body));
};

module.exports = renderMark;
