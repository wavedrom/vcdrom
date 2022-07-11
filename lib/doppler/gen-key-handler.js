'use strict';

const refreshCursor = require('./refresh-cursor.js');
const scale = require('./scale.js');
const action = require('./action.js');

function finish(render, cursor, event, pstate) {
  event.preventDefault();
  render();
  refreshCursor(cursor, pstate);
}

const genKeyHandler = (div, cursor, pstate, render, cm, ws) => {
  return (event) => {
    if (cm.hasFocus()) {
      return;
    }

    // if (!event.key.startsWith('F')) {
    //   event.preventDefault();
    // }

    if (
      (action[event.key] || action.nop)(event, div, cursor, pstate, ws, render)
    ) {
      event.preventDefault();
      return;
    }

    //console.log(event);

    (scale[event.key] || scale.nop)(pstate, event, cm) &&
      finish(render, cursor, event, pstate);
    ws.sendmsg(
      'navkey ' + event.key + ' ' + event.shiftKey + ' ' + event.ctrlKey
    );
  };
};

module.exports = genKeyHandler;
