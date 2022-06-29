/* eslint-disable no-console */
'use strict';

const xOffsetAtT = require('./doppler/xofs-at-t.js');
const tAtX = require('./doppler/t-at-x.js');
const getX = require('./doppler/get-x.js');
const timeAtCursor = require('./doppler/time-at-cursor.js');
const renderCursor = require('./doppler/render-cursor.js');

// eslint-disable-next-line no-unused-vars
const ws = (function () {
  // eslint-disable-next-line no-undef
  const websocket = new WebSocket('ws://' + location.host);

  var publicApi = {};

  var render;
  var pstate;
  var cursor;
  var editor;

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
    case 'setmark':
      //console.log('create mark', cmdArray[1], cmdArray[2]);
      pstate.abmarks[cmdArray[1]] = parseInt(cmdArray[2]);
      break;
    case 'setstate':
      console.log('setstate', cmdArray[1], cmdArray[2]);
      pstate.xOffset = xOffsetAtT(parseInt(cmdArray[1]), pstate);
      var cTime = parseInt(cmdArray[2]);
      pstate.xCursor = getX(pstate, cTime);
      console.log('set cursor');
      console.log(cmdArray);
      cursor.style.left = getX(pstate, cTime) - pstate.cursorXmargin + 'px';
      
      cursor.innerHTML = renderCursor({}, pstate);
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
      break;
    case 'render':
      render();
      break;
    }
  };

  // eslint-disable-next-line no-undef
  window.addEventListener('beforeunload', () => {
    const tStartExact = tAtX(pstate.sidebarWidth, pstate);
    const tCursor = timeAtCursor(pstate);
    // Send the content of the cm editor to FS so the waveql file can be
    // updated.
    publicApi.sendcmd([
      'waveql',
      editor.getValue().replace(/[\r\n]/gm, '<l!f>'),
    ]);
    // Send a notification to FS along with the time at the left edge se
    // we can restore to this time position when reopened.
    publicApi.sendcmd(['closingtab', tStartExact, tCursor]);
  });

  publicApi.init = (p, c, r, cm) => {
    console.log(r);
    render = r;
    cursor = c;
    pstate = p;
    editor = cm;
    publicApi.sendmsg('rendered');
  };

  publicApi.sendmsg = (cmd) => {
    if (websocket !== null) {
      websocket.send(cmd);
    }
  };

  publicApi.sendcmd = (cmd) => {
    if (websocket !== null) {
      websocket.send(cmd.join(' '));
    }
  };


  return publicApi;
})();

module.exports = ws;
