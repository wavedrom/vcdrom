'use strict';
const statusBox = require('./statusBox.js');
const action = require('./doppler/action.js');

let updateStatusBoxVisibility = (pstate) => {
  let statusBar = document.getElementById('statusBarContainer');
  statusBar.childNodes.forEach(function (item) {
    if (item instanceof HTMLElement) {
      let isMulti = item.getAttribute('data-multi');
      let isVisible =
        (isMulti === 'false') | ((isMulti === 'true') & pstate.multidoc);
      item.style.visibility = isVisible ? 'visible' : 'hidden';
    }
  });
};

let createStatusBars = (pstate, cm) => {
  let sDiv = document.createElement('div');
  sDiv.innerHTML = `<div id="statusBars" onload="'./statusBox.js'">
      <div id="statusBarContainer" class="status" >
      </div>
    </div>`;
  document.getElementsByClassName('wd-container')[0].appendChild(sDiv);

  statusBox.addStatusBox(statusBox.EDITMODE).addEventListener('click', () => {
    action.toggleEditMode(cm);
  });

  statusBox.addStatusBox(statusBox.GOTO);
  statusBox.addStatusBox(statusBox.CMODE);
  statusBox.addStatusBox(statusBox.NSYNC, true);
  statusBox.addStatusBox(statusBox.CSYNC, true);
};

module.exports = {
  createStatusBars,
  updateStatusBoxVisibility,
};
