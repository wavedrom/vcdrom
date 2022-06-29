'use strict';

const scale = require('./scale.js');
const action = require('./action.js');

const genKeyHandler = (div, pstate, render, cm, ws) => {
  return event => {
    if (cm.hasFocus()) {
      return;
    }

    if ((action[event.key] || action.nop)(event.key, div, pstate, ws, render)) {
      // handled!
      event.preventDefault();
      return;
    }

    ((scale[event.key] && event.preventDefault()) || scale.nop)(pstate, cm) && render();
  };
};

module.exports = genKeyHandler;
