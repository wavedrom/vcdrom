'use strict';

const base64JsBlob = (dataBase64) => {
  const dataBytes = atob(dataBase64);
  const len = dataBytes.length;
  const dataU8 = new Uint8Array(dataBytes.length);
  for (let i = 0; i < len; i++) {
    dataU8[i] = dataBytes.charCodeAt(i);
  }
  const blob = new Blob([dataU8.buffer], {type: 'application/javascript'});
  const uri = URL.createObjectURL(blob);
  return uri;
};

module.exports = base64JsBlob;
