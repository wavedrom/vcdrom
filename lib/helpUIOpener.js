'use strict';
// const interact = require('./interactWStatusBox.js');
let state = 0;

let listenForUI = () => {
  document.addEventListener('keydown', (event) => {
    if (event.key == 'F1') {
      event.preventDefault();
      if (state == 0) {
        state = 1;
        document.getElementById('openDiv').classList.toggle('show');
      } else {
        document.getElementById('openDiv').classList.toggle('hide');
      }
    }
  });
  // interact.addMessageInStatus();
  // interact.addStatusBox();
};

module.exports = listenForUI;
