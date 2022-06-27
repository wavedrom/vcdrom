'use strict';

const timeAtCursor = require('./time-at-cursor.js');

const bookmark = (content, pstate, ws) => {
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

const showsource = (content, pstate, ws) => {
  var pcAddrs = document.getElementsByClassName("pc-addr");

  const count = pcAddrs.length;
  for (let i=0; i<count; i++) {
    let y1 = pcAddrs[i].getBoundingClientRect().top;
    let y2 = pcAddrs[i].getBoundingClientRect().bottom;
    //console.log(pstate.yCursor, y);
    if (pstate.yCursor >= y1 && pstate.yCursor <= y2) {
      const cmd = "showsource " + pcAddrs[i].textContent.trim();
      ws.sendmsg(cmd);
      return true;
    }
  }
  return true;
};

module.exports = {
  'b': bookmark,
  's': showsource,
  nop: () => false
};
