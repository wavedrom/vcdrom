'use strict';

const scale = require('./scale.js');

const genOnWheel = (element, pstate, render, cm) =>
  event => {
    event.preventDefault();
    if (cm.hasFocus()) {
      return;
    }
    const {deltaY} = event;
    if (event.ctrlKey) {
      scale[
        (deltaY < 0) ? '+' : ((deltaY > 0) ? '-' : 'nop')
      ](pstate) && render();
    } else
    if (event.shiftKey) {
      scale[
        (deltaY < 0) ? 'ArrowLeft' : ((deltaY > 0) ? 'ArrowRight' : 'nop')
      ](pstate) && render();
    } else {
      scale[
        (deltaY < 0) ? 'ArrowUp' : (deltaY > 0) ? 'ArrowDown' : 'nop'
      ](pstate, cm) && render();
      // const info = cm.getScrollInfo();
      // if (deltaY < 0) {
      //   cm.scrollTo(null, info.top - info.clientHeight / 8);
      //   // ? 'ArrowUp'
      // } else if (deltaY > 0) {
      //   cm.scrollTo(null, info.top + info.clientHeight / 8);
      //   // ? 'ArrowDown' : 'nop'
      // }
    }
  };

module.exports = genOnWheel;
