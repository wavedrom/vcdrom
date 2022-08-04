'use strict';

function* sampler (wave) {
  let t1, v0, v1;
  [t1, v1] = wave[0]; // initial state
  let t = 0;
  for (let i = 1; i < wave.length; i++) {
    v0 = v1;
    [t1, v1] = wave[i]; // next change
    while (true) {
      if (t >= t1) {
        break;
      }
      t = yield v0;
    }
  }
  while(true) { // to the end of time
    yield v0;
  }
}

module.exports = sampler;
