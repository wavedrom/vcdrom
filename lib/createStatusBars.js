'use strict';
const interact = require('./interactWStatusBox.js');
let createStatusBars = () => {
  let sDiv = document.createElement('div');
  sDiv.innerHTML = `<div id="statusBars" onload="'./interactWStatusBox.js'">
      <div class="status" >
      </div>
    </div>`;
  document.getElementsByClassName('wd-container')[0].appendChild(sDiv);

  interact.addStatusBox(3);
  // interact.addMessageInStatus(11, 'this is a message');
};

module.exports = createStatusBars;

// template for status boxes (1)
// <div id="statusBox1">1</div>
// <div id="statusBox2">2</div>
// <div id="statusBox3">3</div>
