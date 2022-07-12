"use strict";

const xOffsetAtT = require("./doppler/xofs-at-t.js");
const tAtX = require("./doppler/t-at-x.js");
const getX = require("./doppler/get-x.js");
const timeAtCursor = require("./doppler/time-at-cursor.js");
const refreshCursor = require("./doppler/refresh-cursor.js");
const scale = require("./doppler/scale.js");
const _ = require("lodash");

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
    console.log("websocket: " + websocket.url);
  };

  var isNumber = function isNumber(value) {
    const n = parseInt(value);
    return typeof n === "number" && isFinite(n);
  };

  var gotoTime = function gotoTime(time, pstate, cursor, centerCursor) {
    //console.log('gotoTime ' + time);
    const xStartExact = tAtX(pstate.sidebarWidth, pstate);
    const xFinishExact = tAtX(pstate.width, pstate);
    const midOfs = (xFinishExact - xStartExact) / 2;

    if (time == -1 || !isNumber(time)) {
      return true;
    }

    const isVisible = xStartExact <= time && time <= xFinishExact;
    //console.log(isVisible, centerCursor);
    if (!isVisible || centerCursor == "true") {
      // If not visible, reposition the display to put the target in the center
      pstate.xOffset = xOffsetAtT(time - midOfs, pstate);
    }

    render();
    pstate.xCursor = getX(pstate, time);
    refreshCursor(cursor, pstate);
  };

  websocket.onmessage = (msg) => {
    const cmd = msg.data.toString().trim();
    //console.log("Message: " + cmd);
    if (!cmd.includes("<cmd>")) {
      processCommand(cmd);
    }
    const cmdArray = cmd.split("<cmd>");
    cmdArray.forEach((c) => {
      processCommand(c.trim());
    });
  };

  /**
   * Joins all paramters starting at specified
   * index into a single string.  Used to provide
   * a string paramter that contains spaces. Note
   * this must be the last parameter.
   * @param {string[]} arr The command parameter string array
   * @param {int} i The starting index to join
   * @returns A string of joined parameters
   */
  const theRest = (arr, i) => {
    return _.join(_.slice(arr, i), " ");
  };

  const processCommand = (cmd) => {
    const cmdArray = cmd.split(" ");
    console.log("Command: " + cmd);
    switch (cmdArray[0]) {
      case "set-render":
        pstate.doRender = cmdArray[1] === "true";
        if (pstate.doRender) {
          render();
        }
        return;

      case "centercursor": {
        const time = tAtX(pstate.xCursor, pstate);
        gotoTime(time, pstate, cursor, true);
        return;
      }

      case "update-bookmark": {
        const index = parseInt(cmdArray[1]);
        pstate.bookmarks[index].note = theRest(cmdArray, 2);
        render();
        return;
      }

      case "remove-bookmark":
        _.pullAt(pstate.bookmarks, parseInt(cmdArray[1]));
        render();
        return;

      case "navkey":
        {
          let keystring = cmdArray[1];
          switch (keystring) {
            case "<space>":
              keystring = " ";
              break;
          }
          const event = {
            key: keystring,
            shiftKey: cmdArray[2] === "true",
            ctrlKey: cmdArray[3] === "true",
          };

          (scale[event.key] || scale.nop)(pstate, event, editor) &&
            finish(render, cursor, pstate);
        }
        return;
      case "goto": {
        gotoTime(cmdArray[1], pstate, cursor, cmdArray[2]);
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
          let note = theRest(cmdArray, 2);
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
