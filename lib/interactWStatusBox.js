'use strict';

/* USAGE
1. import the module 
2. addStatusBox: adds a status box to the main parent class. Takes in the input parameter of a div ID
3. addMessageInStatus: adds a message to be displayed to a particular status bar. 
Takes in the div ID and the message to be displayed 

Example usage :
const interact = require('./interactWStatusBox.js');
interact.addStatusBox(11);
interact.addMessageInStatus(11, 'this is a message');
*/

let addMessage = (divID, message) => {
  document.getElementById(divID).innerHTML = message;
};

//default value in case user doesn't provide id
let CountID = 1;

let addBox = (idName = CountID) => {
  var Sdiv = document.createElement('div');
  // let idName = 'statusBox' + cOUNTER;
  // set the id name
  Sdiv.setAttribute('id', idName);

  // now append the div to the parent div
  document.getElementsByClassName('status')[0].appendChild(Sdiv);
  CountID++;
};

module.exports = { addMessageInStatus: addMessage, addStatusBox: addBox };
