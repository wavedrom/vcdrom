'use strict';

function* unlimiter (wave) {
  for (let i = 0; i < wave.length; i++) {
    yield i;
  }
}

module.exports = unlimiter;
