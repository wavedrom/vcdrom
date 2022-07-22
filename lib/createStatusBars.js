'use strict';
const statusBox = require('./statusBox.js');

let createStatusBars = () => {
  let sDiv = document.createElement('div');
  sDiv.innerHTML = `<div id="statusBars" onload="'./statusBox.js'">
      <div class="status" >
      </div>
    </div>`;
  document.getElementsByClassName('wd-container')[0].appendChild(sDiv);

  statusBox.addStatusBox(statusBox.GOTO);
  statusBox.addStatusBox(statusBox.CMODE);
  statusBox.addStatusBox(statusBox.NSYNC);
  statusBox.addStatusBox(statusBox.CSYNC);
};

module.exports = createStatusBars;
