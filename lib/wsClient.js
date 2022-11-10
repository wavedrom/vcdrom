'use strict';

let processMessage = require('./processMessage.js');

let websocket;

var wso = {};
var firstRender = true;

let init = () => {
  websocket = new WebSocket('ws://' + location.host);
  wso.websocket = websocket;

  websocket.onopen = () => {
    websocket.send('iam pv2');
  };

  websocket.onmessage = (msg) => {
    // on getting a message from FS
    processMessage.processMessages(msg.data.toString(), wso);
  };

  websocket.onclose = () => {
    window.close();
  };

  window.addEventListener('beforeunload', () => {
    websocket.send(
      JSON.stringify({
        command: 'closing',
        xScale: wso.pstate.xScale,
        xOffset: wso.pstate.xOffset,
        windowOuterWidth: window.outerWidth,
        windowOuterHeight: window.outerHeight,
        windowX: window.screenLeft,
        windowY: window.screenTop
      })
    );
    console.log(wso.cm);
  });

  waitForSocketConnection(websocket);

  return websocket;
};

function waitForSocketConnection(socket, callback) {
  setTimeout(function () {
    if (socket.readyState === 1) {
      if (callback != null) {
        callback();
      }
    } else {
      waitForSocketConnection(socket, callback);
    }
  }, 10); // wait a bit longer for the connection...
}

const setup = (state) => {
  wso = state;
};

const wsRenderPlugin = (desc, pstate /* , els */) => {
  if (firstRender && websocket != null && websocket.readyState) {
    firstRender = false;
    websocket.send(
      JSON.stringify({
        command: 'onfirstrender'
      })
    );
  }
};

const keyPlugin = (key, event) => {
  console.log(key);
  websocket.send(
    JSON.stringify({
      command: 'keyAction',
      key: key
    })
  );
};

module.exports = { init, wsRenderPlugin, keyPlugin, setup };
