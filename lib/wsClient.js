'use strict';

const processMessage = require('./processMessage.js');

const { getT } = require('../../doppler/lib');

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

const setup = (stuffWeNeed) => {
  wso = stuffWeNeed;
  wso.container.addEventListener('click', cursorClickHandler());
  wso.container.addEventListener('click', instClickHandler());
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

const keyPlugin = (key /*, event */) => {
  console.log('wsKeyPlugin', key);
  websocket.send(
    JSON.stringify({
      command: 'keyAction',
      key: key
    })
  );
};

const cursorClickHandler = () => (event) => {
  const x = wso.pstate.xCursor;
  const time = getT(x, wso.pstate);
  console.log('cursor click at', x, time);
};

const instClickHandler = () => (event) => {
  var pcAddrs = document.getElementsByClassName('pc-addr');
  const yCursor = event.clientY;
  const x = wso.pstate.xCursor;
  const count = pcAddrs.length;
  var addrCursor = 'unknown';
  const stageAttr = 'data-stage';
  let blockAddresses = [];
  //console.time();
  for (let i = 0; i < count; i++) {
    let y1 = pcAddrs[i].getBoundingClientRect().top;
    let y2 = pcAddrs[i].getBoundingClientRect().bottom;
    let addrBlock = pcAddrs[i].textContent.trim();
    if (yCursor >= y1 && yCursor <= y2) {
      addrCursor = addrBlock;
    }

    const elms = document.elementsFromPoint(x, y1 + (y2 - y1) / 2);
    const blocks = elms.filter((elm) => {
      // if (elm.className instanceof SVGAnimatedString) {
      return elm.nodeName == 'rect' && elm.hasAttribute(stageAttr);
    });

    if (blocks.length != 0) {
      let block = blocks[0];
      //console.log(window.getComputedStyle(block).fill); //.backgroundColor;);
      let obj = {
        stage: block.getAttribute(stageAttr),
        address: addrBlock,
        color: window.getComputedStyle(block).fill
      };
      blockAddresses.push(obj);
    }
  }

  let cmd = {
    command: 'reportcursorstages',
    address: addrCursor,
    stages: blockAddresses
  };

  //console.timeEnd();
  websocket.send(JSON.stringify(cmd));
};

module.exports = {
  init,
  setup,
  wsRenderPlugin,
  keyPlugin
};
