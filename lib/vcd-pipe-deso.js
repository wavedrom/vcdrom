'use strict';

const parseTimescale = str => {
  if (typeof str !== 'string') {
    return;
  }
  const str1 = str.trim();
  const m = str1.match(/^(\d+)\s*(\w+)$/);
  const res1 = ({1: 0, 10: 1, 100: 2})[m[1]];
  const res2 = ({s: 0, ms: -3, us: -6, ns: -9, ps: -12, fs: -15})[m[2]];
  return res1 + res2;
};

const numberOrString = val => {
  if (val < (2n ** 52n)) {
    return Number(val);
  }
  return '0x' + val.toString(16);
};

const gcd = (a, b) => {
  let r;
  while (b !== 0) {
    r = a % b;
    a = b;
    b = r;
  }
  return (a < 0) ? -a : a;
};

const tNorm = o => {
  const {tgcd, chango} = o;
  Object.keys(chango).map(key => {
    const {wave} = chango[key];
    wave.map(e => {
      e[0] /= tgcd;
    });
  });
  return o;
};

module.exports = async (deso, inst, done) => {
  const chango = {};
  let tgcd = 1000000;
  deso.chango = chango;
  deso.view = [];

  inst.on('$enddefinitions', () => {
    deso.wires = inst.info.wires;
    deso.timescale = parseTimescale(inst.info.timescale);
  });

  inst.change.any((id, time, cmd, value, mask) => {
    // console.log(time);
    tgcd = gcd(tgcd, time);
    chango[id] = chango[id] || {wave: []};
    if ((cmd === 14) || (cmd === 15) || (cmd === 16) || (cmd === 17) || (cmd === 18)) {
      chango[id].kind = 'bit';
      chango[id].wave.push([time, cmd - 14]);
    } else {
      chango[id].kind = 'vec';
      const point = [time, numberOrString(value)];
      if (mask !== 0n) {
        point.push(numberOrString(mask));
      }
      chango[id].wave.push(point);
    }
  });

  inst.on('finish', () => {
    deso.tgcd = tgcd;
    deso.t0 = inst.info.t0 / tgcd;
    deso.time = Number(inst.getTime()) / tgcd;
    tNorm(deso);
    done(deso);
  });

};
