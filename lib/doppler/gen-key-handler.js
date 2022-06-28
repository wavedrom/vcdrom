'use strict';

const scale = require('./scale.js');
const action = require('./action.js');

const genKeyHandler = (div, pstate, render, cm, ws) => {
  return event => {
    if (cm.hasFocus()) {
      return;
    }
    event.preventDefault();

    if ((action[event.key] || action.nop)(event.key, div, pstate, ws, render)) {
      // handled!
      return;
    }

    (scale[event.key] || scale.nop)(pstate, cm) && render();
  };
};

module.exports = genKeyHandler;
