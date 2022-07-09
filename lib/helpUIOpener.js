"use strict";
let state = 0;

let listenForUI = () => {
  document.addEventListener("keydown", (event) => {
    if (event.key == "F1") {
      event.preventDefault();
      if (state == 0) {
        state = 1;
        document.getElementById("openDiv").classList.toggle("show");
      } else {
        document.getElementById("openDiv").classList.toggle("hide");
      }
    }
  });
};

module.exports = listenForUI;
