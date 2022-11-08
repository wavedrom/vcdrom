'use strict';

let processMessage = require('./processMessage.js');

let websocket;

let wsClientInitialize = () => {
  websocket = new WebSocket('ws://' + location.host);
  websocket.onopen = () => {
    websocket.send('iam pv2');
  };
  websocket.onmessage = (msg) => {
    // on getting a message from FS
    processMessage.processMessages(msg.data.toString());
  };
  websocket.onclose = () => {
    window.close();
  };

  return websocket;
};

module.exports = { wsClientInitialize };
