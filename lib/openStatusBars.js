'use strict';
let state = 0;
let openStatusBars = () => {
  document.addEventListener('keydown', (event) => {
    if (event.shiftKey && event.key == 'S') {
      if (state == 0) {
        state = 1;
        document.getElementById('statusBars').classList.toggle('show');
      } else {
        document.getElementById('statusBars').classList.toggle('hide');
      }
    }
  });
};

module.exports = openStatusBars;
