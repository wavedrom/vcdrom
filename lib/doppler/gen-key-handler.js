'use strict';

const scale = require('./scale.js');

const genKeyHandler = (div, pstate, render, cm) => {
  return event => {
    if (cm.hasFocus()) {
      return;
    }
    event.preventDefault();
    (scale[event.key] || scale.nop)(pstate, cm) && render();
  };
};

module.exports = genKeyHandler;
