'use strict';

const scale = require('./scale.js');
const refreshCursor = require('./refresh-cursor.js');
const ws = require('../ws-endpoint.js');

function finish(render, cursor, pstate) {
  render();
  refreshCursor(cursor, pstate);
}

const genOnWheel = (element, cursor, pstate, render, cm) => (event) => {
  event.preventDefault();
  if (cm.hasFocus()) {
    return;
  }
  const { deltaY } = event;
  if (event.ctrlKey) {
    event.key = deltaY < 0 ? '+' : deltaY > 0 ? '-' : 'nop';
    scale[event.key](pstate) && finish(render, cursor, pstate);
  } else if (event.shiftKey) {
    event.key = deltaY < 0 ? 'ArrowLeft' : deltaY > 0 ? 'ArrowRight' : 'nop';
    scale[event.key](pstate) && finish(render, cursor, pstate);
  } else {
    event.key = deltaY < 0 ? 'ArrowUp' : deltaY > 0 ? 'ArrowDown' : 'nop';
    scale[event.key](pstate, event, cm) && finish(render, cursor, pstate);
  }
  ws.sendmsg('navkey ' + event.key + ' false ' + event.ctrlKey);
};

module.exports = genOnWheel;
