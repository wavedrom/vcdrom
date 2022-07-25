'use strict';

let createTimedMessageBox = () => {
  let msgBox = document.createElement('div');
  console.log(msgBox);
  msgBox.innerHTML = `<div class="outer">
      <div id="messageBox"></div>
    </div>`;
  document.getElementsByClassName('wd-container')[0].appendChild(msgBox);
};

let timedMessage = (time, message) => {
  document.getElementById('messageBox').innerHTML = message;
  const mBox = document.getElementById('messageBox');
  mBox.style.display = 'block';

  setTimeout(() => {
    // 👇️ removes element from DOM
    mBox.style.display = 'none';

    // 👇️ hides element (still takes up space on page)
    mBox.style.visibility = 'hidden';
  }, time);
};

let createXMessageBox = () => {
  let XmsgBox = document.createElement('div');
  console.log(XmsgBox);
  XmsgBox.innerHTML = `<div class="outer1">
      <div id="messageBox1">
         <span id="close" onclick=" this.parentNode.parentNode.parentNode.removeChild(this.parentNode.parentNode);
  return false;">X</span>
    </div>`;
  document.getElementsByClassName('wd-container')[0].appendChild(XmsgBox);
};

module.exports = {
  timedMessage,
  createTimedMessageBox,
  createXMessageBox,
};
