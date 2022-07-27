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
  XmsgBox.innerHTML = `<div class="outer1">
      <div id="messageBox1">
         <span id="close" onclick=" this.parentNode.parentNode.parentNode.removeChild(this.parentNode.parentNode);
  return false;">&#10006;</span>
    </div>`;
  document.getElementsByClassName('wd-container')[0].appendChild(XmsgBox);
};

let createDialogueBox = () => {
  let DmsgBox = document.createElement('div');
  DmsgBox.innerHTML = `<div class="confirm">
      <h1 id="CTitle"></h1>
      <p id="bodyText"></p>
      <button id="CancelButton"></button>
      <button
        id="ConfirmButton"
        onclick=" this.parentNode.parentNode.parentNode.removeChild(this.parentNode.parentNode);"
      ></button>
    </div>
  </body>`;
  document.getElementsByClassName('wd-container')[0].appendChild(DmsgBox);
};

let makeDialogueBox = (DTitle, BodyText, buttonName1, buttonName2) => {
  document.getElementById('CTitle').innerHTML = DTitle;
  document.getElementById('bodyText').innerHTML = BodyText;
  document.getElementById('CancelButton').innerHTML = buttonName1;
  document.getElementById('ConfirmButton').innerHTML = buttonName2;
};

module.exports = {
  timedMessage,
  createTimedMessageBox,
  createXMessageBox,
  createDialogueBox,
  makeDialogueBox,
};
