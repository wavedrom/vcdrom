'use strict';

const xAtT = require('./get-x.js');

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

  if (blockAddresses.length > 0) {
    console.log(blockAddresses.join(' '));
    pstate.ws.sendmsg('cursor_blocks ' + t + ' ' + blockAddresses.join(' '));
  }
};

module.exports = InstsAtTime;
