'use strict';

let createStatusBars = () => {
  let sDiv = document.createElement('div');
  sDiv.innerHTML = `<div id="statusBars">
      <div class="status">
        <div id="statusBox1">1</div>
        <div id="statusBox2">2</div>
        <div id="statusBox3">3</div>
      </div>
    </div>`;
  document.getElementsByClassName('wd-container')[0].appendChild(sDiv);
};

module.exports = createStatusBars;
