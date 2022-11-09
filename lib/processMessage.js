'use strict';

let processMessages = (message, wso) => {
  //console.log('Process msg: ', message);
  try {
    message = JSON.parse(message);

    // Call the function with the same name as the
    // message command
    eval(message.command)(wso, message);
  } catch (error) {
    // Ignore non-JSON commands
  }
};

// eslint-disable-next-line
let close = (wso, message) => {
  window.close();
};

// eslint-disable-next-line
let goto = (wso, message) => {
  const { sidebarWidth, width } = wso.pstate;
  const { xOffsetUpdate, getX, getT, pstate, render } = wso;

  let currentTime = getT(sidebarWidth, pstate);
  let t = Number(message.time);
  let x = getX(pstate, currentTime - t) + width / 2;

  xOffsetUpdate(pstate, x);
  render();
};

module.exports = { processMessages };
