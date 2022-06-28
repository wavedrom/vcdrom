/* eslint-disable no-unused-vars */
'use strict';

const timeAtCursor = require('./time-at-cursor.js');
const xOffsetAtT = require('./xofs-at-t.js'); 
const tAtX = require('./t-at-x.js');


const bookmark = (key, content, pstate, ws, render) => {
  // Create a new bookmark from the PV.
  const t = timeAtCursor(pstate);
  const id = pstate.bookmarks.length + 1;
  const cmd = 'bookmark ' + id + ' ' + t; 
  // Add to the PV bookmark array.
  pstate.bookmarks.push({
    id: id,
    time: t,
    note: ''
  });
  // Tell FS about it.
  ws.sendmsg(cmd);
  return true;
};

const showsource = (key, content, pstate, ws, render) => {
  // eslint-disable-next-line no-undef
  var pcAddrs = document.getElementsByClassName('pc-addr');

  const count = pcAddrs.length;
  for (let i=0; i<count; i++) {
    let y1 = pcAddrs[i].getBoundingClientRect().top;
    let y2 = pcAddrs[i].getBoundingClientRect().bottom;
    //console.log(pstate.yCursor, y);
    if (pstate.yCursor >= y1 && pstate.yCursor <= y2) {
      const cmd = 'showsource ' + pcAddrs[i].textContent.trim();
      ws.sendmsg(cmd);
      return true;
    }
  }
  return true;
};

const markmode = (key, content, pstate, ws, render) => {
  // Create a new bookmark from the PV.
  const t = timeAtCursor(pstate);
  pstate.markmode = !pstate.markmode;
  // Tell FS about it.
  ws.sendmsg('markmode ' + ' ' + pstate.markmode + ' ' + t);
  return true;
};

const setmark = (key, content, pstate, ws, render) => {
  // Create a new ab mark from the PV.
  const mark = key.toLowerCase();
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
  return true;
};

const gotomark = (key, content, pstate, ws, render) => {
  //console.log('gotomark ' + key);
  const xStartExact = tAtX(pstate.sidebarWidth, pstate);
  const xFinishExact = tAtX(pstate.width, pstate);
  const midOfs = (xFinishExact - xStartExact)/2;

  const mark = key.toLowerCase();
  const pt = pstate.abmarks[mark];
  if (pt == -1) {
    // Mark not set.  We should tell the user
    return;
  }
  pstate.xOffset = xOffsetAtT(pt - midOfs, pstate);
  render();
};

module.exports = {
  i: bookmark,
  s: showsource,
  m: markmode,
  A: setmark,
  B: setmark,
  C: setmark,
  D: setmark,
  a: gotomark,
  b: gotomark,
  c: gotomark,
  d: gotomark,
  nop: () => false
};
