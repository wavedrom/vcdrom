/* eslint-disable no-console */
'use strict';

const xOffsetAtT = require('./doppler/xofs-at-t.js');

// eslint-disable-next-line no-unused-vars
const ws = (function () {
  const websocket = new WebSocket('ws://' + location.host);

  var pointerX = -1;
  var pointerY = -1;

  var publicApi = {};

  var render;
  var pstate;

  // eslint-disable-next-line no-undef
  document.onmousemove = (event) => {
    pointerX = event.pageX;
    pointerY = event.pageY;
  };

  websocket.onopen = () => {
    console.log('websocket endpoint connected');
    console.log(websocket.url);
  };

  websocket.onmessage = (e) => {
    const cmdArray = e.data.toString().trim().split(' ');
    console.log('incoming: ' + e.data.toString());
    switch (cmdArray[0]) {
    case 'goto':
      pstate.xOffset = xOffsetAtT(parseInt(cmdArray[1]), pstate);
      render();
      break;
    case 'close':
      // eslint-disable-next-line no-undef
      window.close();
      break;
    case 'bookmark':
      // FS sends this command when:
      // 1. bookmarks are being restored on a new vieweing session
      // 2. The user has added or updated the note for a bookmark
      if (cmdArray.length > 1) {
        let note = cmdArray.slice(2).join(' ');
        pstate.bookmarks.push({
          time: cmdArray[1],
          note: note
        });
      } else {
        pstate.bookmarks.push({
          time: cmdArray[1],
          note: ''
        });
      }
      render();
      break;
    }
  };

  // eslint-disable-next-line no-undef
  window.addEventListener('beforeunload', () => {
    // Linefeed char is absolutely required.
    websocket.send('closingtab');
  });

  publicApi.setRender = (p, r) => {
    console.log(r);
    render = r;
    pstate = p;
    publicApi.sendmsg('rendered');
  };

  publicApi.reportCursorPos = (time) => {
    websocket.send('cursorat ' + pointerX + ' ' + pointerY + ' ' + time + '\n');
  };

  publicApi.sendmsg = (cmd) => {
    if (websocket !== null) {
      websocket.send(cmd);
    }
  };

  return publicApi;
})();

module.exports = ws;
