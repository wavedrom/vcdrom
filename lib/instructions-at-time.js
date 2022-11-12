'use strict';

const instsAtTime = (event, pstate, websocket) => {
  var pcAddrs = document.getElementsByClassName('pc-addr');
  const yCursor = event.clientY;
  const x = pstate.xCursor;
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
  websocket.send(JSON.stringify(cmd));
};

module.exports = instsAtTime;
