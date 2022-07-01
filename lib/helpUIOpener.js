let state = 0;

let listenForUI = () => {
  document.addEventListener('keydown', (event) => {
    if (event.key == '/' || event.key == '?') {
      if (state == 0) {
        state = 1;
        document.getElementById('openDiv').classList.toggle('show');
      } else {
        document.getElementById('openDiv').classList.toggle('hide');
      }
    }
  });
};

module.exports = listenForUI;
