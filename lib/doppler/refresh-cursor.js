'use strict';
const renderCursor = require('./render-cursor.js');
// console.log('refresh cursor is working');
const refreshCursor = (cursor, pstate, send = false) => {
  // console.log('refresh cursor is working');
  // positing of the vertical cursor line
  cursor.style.left = pstate.xCursor - pstate.cursorXmargin + 'px';
  cursor.innerHTML = renderCursor({}, pstate, send);
};

module.exports = refreshCursor;
