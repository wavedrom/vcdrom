"use strict";

const xOffsetAtT = require("./doppler/xofs-at-t.js");
const tAtX = require("./doppler/t-at-x.js");
const getX = require("./doppler/get-x.js");
const timeAtCursor = require("./doppler/time-at-cursor.js");
const refreshCursor = require("./doppler/refresh-cursor.js");
const scale = require("./doppler/scale.js");

function finish(render, cursor, pstate) {
  render();
  refreshCursor(cursor, pstate);
}

const ws = (function () {
  const websocket = new WebSocket("ws://" + location.host);

  var publicApi = {};

  var render;
  var pstate;
  var cursor;
  var editor;

  websocket.onopen = () => {
    console.log("websocket endpoint connected");
    console.log(websocket.url);
  };

  var isNumber = function isNumber(value) {
    const n = parseInt(value);
    return typeof n === "number" && isFinite(n);
  };

  var gotoTime = function gotoTime(time, pstate, cursor) {
    console.log('gotoTime ' + time);
    const xStartExact = tAtX(pstate.sidebarWidth, pstate);
    const xFinishExact = tAtX(pstate.width, pstate);
    const midOfs = (xFinishExact - xStartExact) / 2;

    if (time == -1 || !isNumber(time)) {
      // Mark not set or bad parameter.  We should tell the user
      console.log("oops " + time);
      return true;
    }

    pstate.xOffset = xOffsetAtT(time - midOfs, pstate);
    render();
    pstate.xCursor = getX(pstate, time);
    refreshCursor(cursor, pstate);
  };

  websocket.onmessage = (e) => {
    const cmdArray = e.data.toString().trim().split(" ");
    console.log("incoming: " + e.data.toString());
    switch (cmdArray[0]) {
      case "centercursor": {
        const time = tAtX(pstate.xCursor, pstate);
        gotoTime(time, pstate, cursor);
        return;
      }

      case "navkey":
        {
          const event = {
            key: cmdArray[1],
            shiftKey: cmdArray[2] === "true",
            ctrlKey: cmdArray[3] === "true",
          };
          (scale[event.key] || scale.nop)(pstate, event, editor) &&
            finish(render, cursor, pstate);
        }
        return;
      case "goto": {
        gotoTime(cmdArray[1], pstate, cursor);
        return true;
      }
      case "close":
        // eslint-disable-next-line no-undef
        window.close();
        break;
      case "setmark":
        //console.log('create mark', cmdArray[1], cmdArray[2]);
        pstate.abmarks[cmdArray[1]] = parseInt(cmdArray[2]);
        break;
      case "setstate":
        //console.log("setstate", cmdArray[1], cmdArray[2]);
        pstate.xOffset = xOffsetAtT(parseInt(cmdArray[1]), pstate);
        pstate.xCursor = getX(pstate, parseInt(cmdArray[2]));
        refreshCursor(cursor, pstate);
        break;
      case "bookmark":
        // FS sends this command when:
        // 1. bookmarks are being restored on a new vieweing session
        // 2. The user has added or updated the note for a bookmark
        if (cmdArray.length > 1) {
          let note = cmdArray.slice(2).join(" ");
          pstate.bookmarks.push({
            time: cmdArray[1],
            note: note,
          });
        } else {
          pstate.bookmarks.push({
            time: cmdArray[1],
            note: "",
          });
        }
        break;
      case "render":
        render();
        refreshCursor(cursor, pstate);
        break;
      case "reportcursorsyncmode":
        //console.log("cursor sync mode: " + cmdArray[1]);
        break;
      case "reportnavsyncmode":
        //console.log("nav sync is " + (cmdArray[1] === "true") ? "on" : "off");
        break;
      case "movecursorto":
        pstate.xCursor = getX(pstate, parseInt(cmdArray[1]));
        //console.log("move cursor to " + cmdArray[1] + " " + pstate.xCursor);
        refreshCursor(cursor, pstate);
        break;
      case "movecursordelta":
        if (!isNaN(cmdArray[1])) {
          pstate.xCursor += parseInt(cmdArray[1]);
          // console.log(
          //   "move cursor delta " + cmdArray[1] + " " + pstate.xCursor
          // );
          refreshCursor(cursor, pstate);
        }
        break;
    }
  };

  // eslint-disable-next-line no-undef
  window.addEventListener("beforeunload", () => {
    const tStartExact = tAtX(pstate.sidebarWidth, pstate);
    const tCursor = timeAtCursor(pstate);
    // Send the content of the cm editor to FS so the waveql file can be
    // updated.
    publicApi.sendcmd([
      "waveql",
      editor.getValue().replace(/[\r\n]/gm, "<l!f>"),
    ]);
    // Send a notification to FS along with the time at the left edge se
    // we can restore to this time position when reopened.
    publicApi.sendcmd(["closingtab", tStartExact, tCursor]);
  });

  publicApi.init = (p, c, r, cm) => {
    //console.log(r);
    render = r;
    cursor = c;
    pstate = p;
    editor = cm;
    publicApi.sendmsg("rendered");
  };

  publicApi.sendmsg = (cmd) => {
    if (websocket !== null) {
      websocket.send(cmd);
    }
  };

  publicApi.sendcmd = (cmd) => {
    if (websocket !== null) {
      websocket.send(cmd.join(" "));
    }
  };

  return publicApi;
})();

module.exports = ws;
