'use strict';

const scale = require('./scale.js');
const action = require('./action.js');

const genKeyHandler = (div, pstate, render, cm, ws) => {
  return event => {
    if (cm.hasFocus()) {
      return;
    }

    if ((action[event.key] || action.nop)(event.key, div, pstate, ws, render)) {
      event.preventDefault();
      return;
    }

    (scale[event.key] || scale.nop)(pstate, cm) && event.preventDefault() && render();
  };
};

module.exports = genKeyHandler;
