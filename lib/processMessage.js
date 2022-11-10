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

// eslint-disable-next-line no-unused-vars
let close = (wso, message) => {
  window.close();
};

// eslint-disable-next-line no-unused-vars
let setTitle = (wso, message) => {
  window.document.title = message.title;
};

// eslint-disable-next-line no-unused-vars
let goto = (wso, message) => {
  const { sidebarWidth, width } = wso.pstate;
  const { xOffsetUpdate, getX, getT, pstate, render } = wso;

  let currentTime = getT(sidebarWidth, pstate);
  let t = Number(message.time);
  let x = getX(pstate, currentTime - t) + width / 2;

  xOffsetUpdate(pstate, x);
  render();
};

// eslint-disable-next-line no-unused-vars
let keyaction = (wso, message) => {
  wso.genKeyHandler.executeKeyHandler(
    message.key,
    wso.keyBindo,
    wso.pstate,
    wso.cm
  ) && wso.render();
};

module.exports = { processMessages };
