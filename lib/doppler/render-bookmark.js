'use strict';

const genSVG = require('onml/gen-svg.js');
const stringify = require('onml/stringify.js');
const tAtX = require('./t-at-x.js');
const xAtT = require('./get-x.js');

//const markXMargin = 40;
const markFontHeight = 20;
const markFontWidth = markFontHeight / 2;
const yMargin = 20;

const renderBookMark = (parent_div, pstate) => {
  // current start and finish times
  const tStartExact = tAtX(pstate.sidebarWidth, pstate);
  const tFinishExact = tAtX(pstate.width, pstate);
  let setBookTime;

  parent_div.innerHTML = '';

  for (let i = 0; i < pstate.bookmarks.length; i++) {
    if (pstate.bookmarks.length == 0) {
      setBookTime = -1;
    } else {
      setBookTime = pstate.bookmarks[i].time;
    }

    const isVisible = tStartExact <= setBookTime && setBookTime <= tFinishExact;
    if (!isVisible) {
      continue;
    }
    var new_row = document.createElement('div');
    new_row.className = 'wd-bookmark';

    const { height } = pstate;

    let note = pstate.bookmarks[i].note;
    if (note.length > 10) {
      note = note.substring(0, 9) + '...';
    }
    const label =
      pstate.bookmarks[i].note == '' ? pstate.bookmarks[i].time : note;

    const lWidth = label.length * markFontWidth + 5;

    const body = [
      // vertical line
      [
        'line',
        {
          class: 'wd-bookmark-line',
          x1: lWidth / 2 + 0.5,
          x2: lWidth / 2 + 0.5,
          y1: 0,
          y2: height,
        },
      ],
      // bottom label
      [
        'rect',
        {
          class: 'wd-bookmark-time',
          x: 0,
          y: height - yMargin - markFontHeight * 1.25 - 25,
          width: lWidth,
          height: markFontHeight * 1.25,
        },
      ],
      [
        'text',
        {
          class: 'wd-bookmark-time',
          x: lWidth / 2,
          y: height - (yMargin + markFontHeight * 0.25) - 25,
        },
        label,
      ],
    ];

    const x = xAtT(pstate, setBookTime);
    new_row.style.left = x - lWidth / 2 + 'px';
    new_row.innerHTML = stringify(genSVG(2 * lWidth, height).concat(body));
    parent_div.appendChild(new_row);
  }
};

module.exports = renderBookMark;