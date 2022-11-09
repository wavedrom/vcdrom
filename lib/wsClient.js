'use strict';

let processMessage = require('./processMessage.js');

let websocket;

var wso = {};

let init = (state) => {
  wso = state;

  websocket = new WebSocket('ws://' + location.host);
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

  return websocket;
};

const wsRenderPlugin = (desc, pstate /* , els */) => {
  console.log('wsRenderPlugin');
};

module.exports = { init, wsRenderPlugin };
