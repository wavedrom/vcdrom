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
    console.log('ws-endpoint recieved: ' + e.data);

    const cmdArray = e.data.toString().split(' ');
    switch (cmdArray[0]) {
    case 'goto':
      pstate.xOffset = xOffsetAtT(parseInt(cmdArray[1]), pstate);
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
