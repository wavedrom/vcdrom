'use strict';
let state = 0;

function setStatusBarVisibility(visible) {
  state = visible ? 0 : 1;
  toggleStatus();
}

function toggleStatus() {
  if (state == 0) {
    state = 1;
    document.getElementById('statusBars').classList.toggle('show');
  } else {
    document.getElementById('statusBars').classList.toggle('hide');
  }
}

let setupStatusBarListener = () => {
  document.addEventListener('keydown', (event) => {
    if (event.shiftKey && event.key == 'S') {
      toggleStatus();
    }
  });
};

module.exports = {
  setupStatusBarListener,
  setStatusBarVisibility,
};
