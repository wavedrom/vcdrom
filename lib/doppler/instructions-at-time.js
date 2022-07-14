'use strict';

const xAtT = require('./get-x.js');

let lastTime = "";
let lastAddrCursor = "";
/** Returns the time value for a given x (px) screen coordinate */
const InstsAtTime = (t, pstate) => {
  const { xOffset, xScale, width } = pstate;
  var pcAddrs = document.getElementsByClassName('pc-addr');

  const x = parseInt(xAtT(pstate, t));
  const count = pcAddrs.length;
  var addrCursor = 'unknown';
  let blockAddresses = [];
  for (let i = 0; i < count; i++) {
    let y1 = pcAddrs[i].getBoundingClientRect().top;
    let y2 = pcAddrs[i].getBoundingClientRect().bottom;
    let addrBlock = pcAddrs[i].textContent.trim();
    if (pstate.yCursor >= y1 && pstate.yCursor <= y2) {
      addrCursor = addrBlock;
    }

    const elms = document.elementsFromPoint(x, y1 + (y2 - y1) / 2);
    const blocks = elms.filter((elm) => {
      if (elm.className instanceof SVGAnimatedString) {
        //console.log(elm.nodeName);
        return elm.nodeName == 'rect' && elm.className.baseVal.endsWith('_pc');
      }
      return false;
    });

    if (blocks.length != 0) {
      blockAddresses.push(
        blocks[0].className.baseVal.replace('_pc', '') + ' ' + addrBlock
      );
    }
  }

  if (blockAddresses.length > 0 && (t != lastTime || lastAddrCursor != addrCursor)) {
    //console.log(blockAddresses.join(' '));
    pstate.ws.sendmsg('cursor_changed ' + t + ' ' + addrCursor + ' ' + blockAddresses.join(' '));
    lastTime = t;
    lastAddrCursor = addrCursor;
  }
};

module.exports = InstsAtTime;
