'use strict';

let createTimedMessageBox = () => {
  let msgBox = document.createElement('div');
  console.log(msgBox);
  msgBox.innerHTML = `<div class="outer">
      <div id="messageBox"></div>
    </div>`;
  console.log('here', msgBox);
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

module.exports = {
  timedMessage,
  createTimedMessageBox,
};
