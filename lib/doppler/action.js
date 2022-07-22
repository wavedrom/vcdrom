/* eslint-disable no-unused-vars */
'use strict';
const timeAtCursor = require('./time-at-cursor.js');
const xOffsetAtT = require('./xofs-at-t.js');
const tAtX = require('./t-at-x.js');
const refreshCursor = require('./refresh-cursor.js');
const _ = require('lodash');
const getX = require('./get-x.js');
const gotoTime = require('./goto-time.js');
const statusBox = require('../statusBox.js');

const createBookmarkAtCursor = (event, content, cursor, pstate, ws, render) => {
  // Create a new bookmark from the PV.
  const t = timeAtCursor(pstate).toString();
  const cmd = 'bookmark ' + ' ' + t;
  // Add to the PV bookmark array.
  pstate.bookmarks.push({
    time: t,
    note: '',
  });
  // Tell FS about it.
  ws.sendmsg(cmd);
  render();
  refreshCursor(cursor, pstate);
  return true;
};

const clearBookmarksAtCusor = (event, content, cursor, pstate, ws, render) => {
  const t = timeAtCursor(pstate);
  const deletes = [];
  for (let index = 0; index < pstate.bookmarks.length; ++index) {
    const b = pstate.bookmarks[index];
    if (b.time == t) {
      deletes.push(index);
    }
  }
  deletes.forEach((index) => {
    console.log('Remove bookmark ' + index);
    _.pullAt(pstate.bookmarks, parseInt(index));
    ws.sendcmd(['clear-bookmark', index.toString()]);
  });

  return true;
};

const showsource = (event, content, cursor, pstate, ws, render) => {
  // eslint-disable-next-line no-undef
  var pcAddrs = document.getElementsByClassName('pc-addr');

  const count = pcAddrs.length;
  for (let i = 0; i < count; i++) {
    let y1 = pcAddrs[i].getBoundingClientRect().top;
    let y2 = pcAddrs[i].getBoundingClientRect().bottom;
    if (pstate.yCursor >= y1 && pstate.yCursor <= y2) {
      const cmd = 'showsource ' + pcAddrs[i].textContent.trim();
      ws.sendmsg(cmd);
      return true;
    }
  }
  return true;
};

const markmode = (event, content, cursor, pstate, ws, render) => {
  const t = timeAtCursor(pstate);
  pstate.markmode = !pstate.markmode;
  // Tell FS about it.
  ws.sendmsg('markmode ' + ' ' + pstate.markmode + ' ' + t);
  statusBox.setMessage(statusBox.CMODE, pstate.markmode ? 'click' : 'follow');
  return true;
};

const setAbMarkAtCursor = (event, content, cursor, pstate, ws, render) => {
  // Create a new ab mark from the PV.

  const mark = event.key.toLowerCase();
  const t = timeAtCursor(pstate);

  const pt = pstate.abmarks[mark];

  if (pt == t) {
    // remove the mark
    pstate.abmarks[mark] = -1;
  } else {
    // Store the mark
    pstate.abmarks[mark] = t;
  }

  // Tell FS about it.
  ws.sendcmd(['setmark', mark, pstate.abmarks[mark]]);

  // Let rendering commence.
  render();
  refreshCursor(cursor, pstate);
  return true;
};

const clearAbMarksAtCursor = (event, content, cursor, pstate, ws, render) => {
  // Create a new ab mark from the PV.
  const t = timeAtCursor(pstate);

  for (const [key, value] of Object.entries(pstate.abmarks)) {
    if (value > 0 && value == t) {
      pstate.abmarks[key] = -1;

      // Tell FS about it.
      ws.sendcmd(['setmark', key, pstate.abmarks[key]]);

      // Let rendering commence.
      render();
      refreshCursor(cursor, pstate);
    }
  }
  return true;
};

const clearAllAbMarks = (event, content, cursor, pstate, ws, render) => {
  for (const [key, value] of Object.entries(pstate.abmarks)) {
    pstate.abmarks[event.key] = -1;
    // Tell FS about it.
    ws.sendcmd(['setmark', key, pstate.abmarks[key]]);
  }
  // Let rendering commence.
  render();
  refreshCursor(cursor, pstate);
  return true;
};

const gotoAbMark = (event, content, cursor, pstate, ws, render) => {
  const xStartExact = tAtX(pstate.sidebarWidth, pstate);
  const xFinishExact = tAtX(pstate.width, pstate);
  const midOfs = (xFinishExact - xStartExact) / 2;

  const mark = event.key.toLowerCase();
  const pt = pstate.abmarks[mark];
  if (pt == -1) {
    // Mark not set.  We should tell the user
    return true;
  }
  pstate.xOffset = xOffsetAtT(pt - midOfs, pstate);
  render();
  refreshCursor(cursor, pstate);
  return true;
};

const cursorsyncmode = (event, content, cursor, pstate, ws, render) => {
  // console.log("cursor sync mode");
  ws.sendcmd(['cursorsyncmode']);
  return true;
};

const togglenavsync = (event, content, cursor, pstate, ws, render) => {
  ws.sendcmd(['togglenavsync']);
  return true;
};

const iter = (event, content, cursor, pstate, ws, render) => {
  ws.sendcmd(['iter', event.key, event.shiftKey, event.ctrlKey]);
  return true;
};

const centercursor = (event, content, cursor, pstate, ws, render) => {
  ws.sendcmd(['centercursor']);
  return true;
};

const stepinst = (event, content, cursor, pstate, ws, render) => {
  // Send the message to FS, then FS will send a "goto" with the time of the
  // next instruction.
  const t = timeAtCursor(pstate);
  if (event.shiftKey == true) {
    ws.sendcmd(['stepinst', 'prev', event.shiftKey, event.ctrlKey, t]);
  } else {
    ws.sendcmd(['stepinst', 'next', event.shiftKey, event.ctrlKey, t]);
  }
  return true;
};

const deleteMarker = (event, content, cursor, pstate, ws, render) => {
  // Delete any markers that appear under the cursor.
  clearAbMarksAtCursor(event, content, cursor, pstate, ws, render);
  clearBookmarksAtCusor(event, content, cursor, pstate, ws, render);
  render();
  return true;
};

const TIMEPROMPT = '???';

let timeStr = '';
const userGotoTime = (event, content, cursor, pstate, ws, render) => {
  // A place to put code to test so you can test by hitting the t key.
  console.log(event);
  if (event.key.match(/[0-9]/i)) {
    if (timeStr === TIMEPROMPT) {
      timeStr = '';
    }
    timeStr += event.key;
  } else if (event.key === 'Enter') {
    if (!isNaN(timeStr)) {
      gotoTime(parseInt(timeStr), pstate, cursor, true, render);
      timeStr = TIMEPROMPT;
    }
  } else if (event.key === 'Backspace') {
    if (timeStr.length > 0) {
      timeStr = timeStr.slice(0, -1);
      if (timeStr === '') {
        timeStr = TIMEPROMPT;
      }
    }
  }
  statusBox.setMessage(statusBox.GOTO, timeStr);
  return true;
};

const test = (event, content, cursor, pstate, ws, render) => {
  // A place to put code to test so you can test by hitting the t key.
  return true;
};

module.exports = {
  i: createBookmarkAtCursor,
  s: showsource,
  m: markmode,
  A: setAbMarkAtCursor,
  B: setAbMarkAtCursor,
  C: setAbMarkAtCursor,
  D: setAbMarkAtCursor,
  a: gotoAbMark,
  b: gotoAbMark,
  c: gotoAbMark,
  d: gotoAbMark,
  x: clearAbMarksAtCursor,
  X: clearAllAbMarks,
  t: test,
  '\\': cursorsyncmode,
  '|': centercursor,
  n: togglenavsync,
  '>': iter,
  '.': iter,
  '<': iter,
  ',': iter,
  ' ': stepinst,
  Delete: deleteMarker,
  0: userGotoTime,
  1: userGotoTime,
  2: userGotoTime,
  3: userGotoTime,
  4: userGotoTime,
  5: userGotoTime,
  6: userGotoTime,
  7: userGotoTime,
  8: userGotoTime,
  9: userGotoTime,
  Enter: userGotoTime,
  Backspace: userGotoTime,
  nop: () => false,
};
