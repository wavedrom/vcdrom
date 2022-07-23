'use strict';

const GOTO = 'goto';

const CMODE = 'cmode';

const NSYNC = 'navsync';

const CSYNC = 'cursync';

const labelMap = new Map();
labelMap.set(GOTO, 'Goto: ');
labelMap.set(CMODE, '(m)CMode: ');
labelMap.set(NSYNC, '(n)NavSync: ');
labelMap.set(CSYNC, '(\\)CurSync: ');

let setMessage = (idName, message) => {
  const content = labelMap.get(idName) + message;
  document.getElementById(idName).innerHTML = content;
};

let addStatusBox = (idName, multi = false) => {
  var statusDiv = document.createElement('div');
  // set the id name
  statusDiv.setAttribute('id', idName);
  statusDiv.setAttribute('data-multi', multi ? 'true' : 'false');

  // now append the div to the parent div
  document.getElementsByClassName('status')[0].appendChild(statusDiv);
};

module.exports = {
  setMessage,
  addStatusBox,
  GOTO,
  CMODE,
  NSYNC,
  CSYNC,
};