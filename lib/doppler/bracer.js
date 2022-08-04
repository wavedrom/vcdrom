'use strict';

const getX = require('./get-x.js');
const surferer = require('./surferer.js');
const unlimiter = require('./unlimiter.js');

const bracer = (lane, desc, pstate) => {
  const body = lane.body;
  const { yStep } = pstate;
  let { clock, valid, ready, up } = body;
  up = up || 1;

  const res = [];
  let count = 0;

  if (clock) {
    const clockWave = desc.chango[clock.ref].wave;
    const clockEr = surferer(clockWave, pstate);
    let tPrevClock = 0;

    if (valid) {
      const validWave = desc.chango[valid.ref].wave;
      const validEr = unlimiter(validWave);
      let iValid = 0;

      if (ready) {
        const readyWave = desc.chango[ready.ref].wave;
        const readyEr = unlimiter(readyWave);
        let iReady = 0;

        for (const iClock of clockEr) {
          const [tClock, vClock] = clockWave[iClock];
          if (vClock) {

            let tValid;
            do {
              [tValid] = validWave[iValid];
              if (tValid >= tClock) {
                break;
              }
              const { value, done } = validEr.next();
              if (done) {
                return res;
              }
              iValid = value;
            } while(true);

            const prevValid = validWave[iValid - 1] || [0, 0];

            let tReady;
            do {
              [tReady] = readyWave[iReady];
              if (tReady >= tClock) {
                break;
              }
              const { value, done } = readyEr.next();
              if (done) {
                return res;
              }
              iReady = value;
            } while(true);

            const prevReady = readyWave[iReady - 1] || [0, 0];

            const xClock = getX(pstate, tClock);
            const xPrevClock = getX(pstate, tPrevClock);

            if (prevValid[1]) {
              if (prevReady[1]) {
                const width = xClock - xPrevClock;
                if (xClock > 0 && xPrevClock > 0 && width > 0) {
                  if (width >= 1) {
                    const height = up * yStep >> 1;
                    res.push(['rect', {fill: 'url(\'#valid&ready\')', width: Math.round(width), height, x: Math.round(xPrevClock), y: -height}]);
                    count++;
                  } else {
                    count += 10;
                  }
                  // res.push(['path', {class: 'event1', d: 'M' + xClock + ' 0l5 10h-10z'}]);
                }
              } else {
                const width = xClock - xPrevClock;
                if (xClock > 0 && xPrevClock > 0 && width > 0) {
                  if (width >= 1) {
                    const height = up * yStep >> 1;
                    res.push(['rect', {fill: 'url(\'#valid&~ready\')', width: Math.round(width), height, x: Math.round(xPrevClock), y: -height}]);
                    count++;
                  } else {
                    count += 10;
                  }
                  // res.push(['path', {class: 'event1', d: 'M' + xClock + ' 0l5 10h-10z'}]);
                }
              }
            }
            tPrevClock = tClock;
            if (count > 500) {
              return res;
            }
          }
        }
        // console.log(res);
      } else {
        for (const iClock of clockEr) {
          const [tClock, vClock] = clockWave[iClock];
          if (vClock) {

            let tValid;
            do {
              [tValid] = validWave[iValid];
              if (tValid >= tClock) {
                break;
              }
              const { value, done } = validEr.next();
              if (done) {
                return res;
              }
              iValid = value;
            } while(true);

            const prevValid = validWave[iValid - 1] || [0, 0];
            const xClock = getX(pstate, tClock);
            const xPrevClock = getX(pstate, tPrevClock);
            if (prevValid[1]) {
              const width = xClock - xPrevClock;
              if (xClock > 0 && xPrevClock > 0 && width > 0) {
                if (width >= 1) {
                  const height = up * yStep >> 1;
                  res.push(['rect', {fill: 'url(\'#valid\')', width: Math.round(width), height, x: Math.round(xPrevClock), y: -height}]);
                  count++;
                } else {
                  count += 10;
                }
                // res.push(['path', {class: 'event1', d: 'M' + xClock + ' 0l5 10h-10z'}]);
              }
            }
            if (count > 500) {
              return res;
            }
            tPrevClock = tClock;
          }
        }
        // console.log(res);
      }
    }
  }
  return res;
};

module.exports = bracer;

/* eslint complexity: [1, 55] */