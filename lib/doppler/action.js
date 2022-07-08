/* eslint-disable no-unused-vars */
"use strict";

const timeAtCursor = require("./time-at-cursor.js");
const xOffsetAtT = require("./xofs-at-t.js");
const tAtX = require("./t-at-x.js");
const refreshCursor = require("./refresh-cursor.js");

const bookmark = (event, content, cursor, pstate, ws, render) => {
  // Create a new bookmark from the PV.
  const t = timeAtCursor(pstate);
  const id = pstate.bookmarks.length + 1;
  const cmd = "bookmark " + id + " " + t;
  // Add to the PV bookmark array.
  pstate.bookmarks.push({
    id: id,
    time: t,
    note: "",
  });
  // console.log(pstate.bookmarks[0].time);
  // Tell FS about it.
  ws.sendmsg(cmd);
  render();
  refreshCursor(cursor, pstate);
  return true;
};

const showsource = (event, content, cursor, pstate, ws, render) => {
  // eslint-disable-next-line no-undef
  var pcAddrs = document.getElementsByClassName("pc-addr");

  const count = pcAddrs.length;
  for (let i = 0; i < count; i++) {
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

const markmode = (event, content, cursor, pstate, ws, render) => {
  // Create a new bookmark from the PV.
  const t = timeAtCursor(pstate);
  pstate.markmode = !pstate.markmode;
  // Tell FS about it.
  ws.sendmsg("markmode " + " " + pstate.markmode + " " + t);
  return true;
};

const setmark = (event, content, cursor, pstate, ws, render) => {
  // Create a new ab mark from the PV.
  console.log("i am here and i am working", event);
  const mark = event.toLowerCase();
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
  ws.sendcmd(["setmark", mark, pstate.abmarks[mark]]);

  // Let rendering commence.
  render();
  refreshCursor(cursor, pstate);
  return true;
};

const clearmark = (event, content, cursor, pstate, ws, render) => {
  // Create a new ab mark from the PV.
  const t = timeAtCursor(pstate);

  for (const [key, value] of Object.entries(pstate.abmarks)) {
    console.log(key, value);
    if (value > 0 && value == t) {
      pstate.abmarks[key] = -1;

      // Tell FS about it.
      ws.sendcmd(["setmark", key, pstate.abmarks[key]]);

      // Let rendering commence.
      render();
      refreshCursor(cursor, pstate);
    }
  }
  return true;
};

const clearallmarks = (event, content, cursor, pstate, ws, render) => {
  for (const [key, value] of Object.entries(pstate.abmarks)) {
    pstate.abmarks[event.key] = -1;
    // Tell FS about it.
    ws.sendcmd(["setmark", key, pstate.abmarks[key]]);
  }
  // Let rendering commence.
  render();
  refreshCursor(cursor, pstate);
  return true;
};

const gotomark = (event, content, cursor, pstate, ws, render) => {
  //console.log('gotomark ' + key);
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
  console.log("cursor sync mode");
  ws.sendcmd(["cursorsyncmode"]);
  return true;
};

const togglenavsync = (event, content, cursor, pstate, ws, render) => {
  // A place to put code to test so you can test by hitting the t key.
  console.log("toggle nav sync");
  ws.sendcmd(["togglenavsync"]);
  return true;
};

const iter = (event, content, cursor, pstate, ws, render) => {
  ws.sendcmd(["iter", event.key, event.shiftKey, event.ctrlKey]);
  return true;
};

const centercursor = (event, content, cursor, pstate, ws, render) => {
  ws.sendcmd(["centercursor"]);
  return true;
};

const test = (event, content, cursor, pstate, ws, render) => {
  // A place to put code to test so you can test by hitting the t key.
  return true;
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
  x: clearmark,
  X: clearallmarks,
  t: test,
  "\\": cursorsyncmode,
  "|": centercursor,
  n: togglenavsync,
  ">": iter,
  ".": iter,
  "<": iter,
  ",": iter,
  nop: () => false,
};
