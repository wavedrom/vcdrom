'use strict';

const createVCD = require('vcd-stream/out/vcd.js');
const webVcdParser = require('vcd-stream/lib/web-vcd-parser.js');
const stringify = require('onml/stringify.js');
const domContainer = require('@wavedrom/doppler/lib/dom-container.js');
const getReaders = require('./get-readers.js');
const vcdPipeDeso = require('./vcd-pipe-deso.js');
const dropZone = require('./drop-zone.js');

const getPathBaseName = path => {
  const p1 = path.split('/');
  const res = p1.pop();
  return res;
};

const getElement = divName => {
  if (typeof divName === 'string') {
    const c = document.getElementById(divName);
    if (c === null) {
      throw new Error('<div> element width Id: "' + divName + '" not found');
    }
    return c;
  }
  return divName;
};

const getHandler = (content, inst) => async readers => {
  const [r0, r1] = readers;

  let waveql;
  {
    if (r1 && (r1.reader)) {
      const utf8Decoder = new TextDecoder('utf-8');
      waveql = '';
      for (let i = 0; i < 1e5; i++) {
        const { done, value } = await r1.reader.read();
        waveql += value ? utf8Decoder.decode(value, {stream: true}) : '';
        if (done) {
          break;
        }
      }
    }
  }

  vcdPipeDeso({}, inst, deso => {
    // console.log('parsed', deso);
    content.innerHTML = '';
    deso.waveql = waveql;
    domContainer(content, deso);
  });

  console.log(r0);
  document.title = getPathBaseName(r0.value);
  content.innerHTML = '<div class="wd-progress">LOADING...</div>';
  let total = 0;
  const maxChunkLength = 300000;
  outerLoop:
  for (let i = 0; i < 1e5; i++) {
    const { done, value } = await r0.reader.read();
    const len = (value || '').length;

    if (done && (len === 0)) {
      // console.log('the end');
      inst.end();
      break outerLoop;
    }

    for (let j = 0; j < len; j += maxChunkLength) {
      const value1 = value.slice(j, j + maxChunkLength);
      const len1 = value1.length;
      total += len1;
      console.log({len1, done, total});
      content.innerHTML = '<div class="wd-progress">' + total.toLocaleString() + '</div>';
      if (done && ((j + maxChunkLength) >= len)) {
        console.log('last chunk');
        inst.end(value1);
        break outerLoop;
      }
      inst.write(value1);
    }
  }
};

global.VCDrom = async (divName, vcdPath) => {
  const content = getElement(divName);
  content.innerHTML = stringify(dropZone({width: 2048, height: 2048}));
  const mod = await createVCD();
  const inst = await webVcdParser(mod); // VCD parser instance
  const handler = getHandler(content, inst);
  await getReaders(handler, vcdPath);
};

/* eslint-env browser */
