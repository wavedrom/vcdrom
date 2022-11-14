'use strict';

const processMessage = require('./processMessage.js');
const _ = require('lodash');

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
    const content = wso.cm
      .getView()
      .state.doc.toString()
      .replaceAll('\n', '<br>');
    websocket.send(
      JSON.stringify({
        command: 'saveWaveql',
        content: content
      })
    );

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

let timeoutId = null;
let previousCursors = [];
const cursorRegex = /^@(?<time>\d+)(?<unit>[a-z]+)(?:\s+:(?<label>(\w| )+))*/;

const cursorUpdateListener = (e) => {
  if (timeoutId != null) clearTimeout(timeoutId);
  timeoutId = setTimeout(() => {
    timeoutId = null;

    let doc = e.state.doc;
    let lines = doc.lines;

    let cursors = [];

    // Gather all the cursor markers, except the cc cursor.
    for (let ln = 0; ln < lines; ln++) {
      let line = doc.line(ln + 1).text;
      if (line.startsWith('@') && !line.endsWith(':cc')) {
        let matches = line.match(cursorRegex);
        if (matches != null) {
          cursors.push({
            time: matches.groups.time,
            unit: matches.groups.unit,
            label: matches.groups.label
          });
        }
      }
    }
    cursors.sort();

    let sendUpdate = false;

    // First the "easy and quick" test
    sendUpdate = cursors.length != previousCursors.length;

    if (!sendUpdate) {
      // Compare to see if there are any changes
      sendUpdate = !_.isEqual(cursors, previousCursors);
    }

    if (sendUpdate) {
      let msg = JSON.stringify({
        command: 'cursorsUpdate',
        cursors: cursors
      });
      console.log('cursorsUpdate', msg);
      websocket.send(msg);
      previousCursors = cursors;
    }
  }, 750);
};

const setup = (stuffWeNeed) => {
  wso = stuffWeNeed;
  wso.container.addEventListener('click', cursorClickHandler());
  wso.container.addEventListener('click', instClickHandler());
};

const renderPlugin = (desc, pstate /* , els */) => {
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

const findExistingClickCursor = () => {
  const { cm } = wso;
  let doc = cm.getView().state.doc;
  let lines = doc.lines;

  for (let ln = 0; ln < lines; ln++) {
    let line = doc.line(ln + 1).text;
    if (line.startsWith('@') && line.endsWith(':cc')) {
      return doc.line(ln + 1);
    }
  }
  return null;
};

const cursorClickHandler = () => (event) => {
  const x = wso.pstate.xCursor;
  const time = getT(x, wso.pstate);

  const ccText = '@' + String(time) + 'ns :cc';
  let docText;

  let from = -1;
  let to = -1;

  let line = findExistingClickCursor();
  if (line != null) {
    /*
     * Replace the existing :cc cursor
     */
    docText = ccText;
    from = line.from;
    to = line.to;
  }

  if (from == -1) {
    /*
     * Try to insert at the fop of DIZ block
     */
    let insertAt = wso.cm.getView().state.doc.toString().indexOf('(DIZ');
    if (insertAt > -1) {
      docText = ccText + '\n';
      from = insertAt;
      to = insertAt;
    }
  }

  if (from == -1) {
    /*
     * Last resort, insert to the top of the doc
     */
    docText = ccText + '\n';
    from = 0;
    to = 0;
  }

  if (from > -1) {
    wso.cm.getView().dispatch({
      changes: { from: from, to: to, insert: docText }
    });
  }
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
  const json = JSON.stringify(cmd);
  console.log('insts', json);
  websocket.send(json);
};

module.exports = {
  init,
  setup,
  renderPlugin,
  cursorUpdateListener,
  keyPlugin
};
