'use strict';
const renderCursor = require('./render-cursor.js');

const refreshCursor = (cursor, pstate) => {
  console.log("refresh cursor");
  cursor.style.left = pstate.xCursor - pstate.cursorXmargin + 'px';
  cursor.innerHTML = renderCursor({}, pstate);
};

module.exports = refreshCursor;
