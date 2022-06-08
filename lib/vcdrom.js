/* eslint-disable no-console */
'use strict';

const pkg = require('../package.json');
const createVCD = require('vcd-stream/out/vcd.js');
const webVcdParser = require('vcd-stream/lib/web-vcd-parser.js');
const stringify = require('onml/stringify.js');
const domContainer = require('@wavedrom/doppler/lib/dom-container.js');
const getReaders = require('./get-readers.js');
const vcdPipeDeso = require('./vcd-pipe-deso.js');
const dropZone = require('./drop-zone.js');
const lister = require('./lister.js');
const ws = require('./ws-endpoint.js');



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
  // console.log(readers);

  let waveql;
  {
    const r = readers.find(reader => reader.ext === 'waveql');
    if (r && (r.reader)) {
      // console.log('WaveQL', r);
      const utf8Decoder = new TextDecoder('utf-8');
      waveql = '';
      for (let i = 0; i < 1e5; i++) {
        const { done, value } = await r.reader.read();
        waveql += value ? utf8Decoder.decode(value, {stream: true}) : '';
        if (done) {
          break;
        }
      }
    }
  }

  let listing;
  {
    const r = readers.find(reader => reader.ext === 'lst');
    if (r) {
      // console.log('LST', r);
      const utf8Decoder = new TextDecoder('utf-8');
      const list = lister();
      for (let i = 0; i < 10; i++) {
        const { done, value } = await r.reader.read();
        list.onChunk(value ? utf8Decoder.decode(value, {stream: true}) : '');
        if (done) {
          listing = list.getTrace();
          break;
        }
      }
    }
  }

  vcdPipeDeso({}, inst, deso => {
    // console.log('parsed', deso);
    content.innerHTML = '';
    deso.waveql = waveql;
    deso.listing = listing;
    domContainer(content, deso);
  });

  {
    const r = readers.find(reader => reader.ext === 'vcd');
    if (r) {
      // console.log('VCD', r);
      document.title = getPathBaseName(r.value);
      content.innerHTML = '<div class="wd-progress">LOADING...</div>';
      let total = 0;
      const maxChunkLength = 300000;
      outerLoop:
      for (let i = 0; i < 1e5; i++) {
        const { done, value } = await r.reader.read();
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
          // console.log({len1, done, total});
          content.innerHTML = '<div class="wd-progress">' + total.toLocaleString() + '</div>';
          if (done && ((j + maxChunkLength) >= len)) {
            // console.log('last chunk');
            inst.end(value1);
            break outerLoop;
          }
          inst.write(value1);
        }
      }
    }
  }
};

document.onclick = function () {
  console.log('clicked');
  ws.sendmsg('clicked');
};

document.onkeydown = function (e) {
  var cmd = '';
  switch (e.key) {
  case 'i':
    cmd = 'showsource 0x2000000d00';
    break;
  }
  if (cmd !== '') {
    ws.sendmsg(cmd);
  }
};

global.VCDrom = async (divName, vcdPath) => {
  console.log(pkg.name, pkg.version);
  const content = getElement(divName);
  content.innerHTML = stringify(dropZone({width: 2048, height: 2048}));
  const mod = await createVCD();
  const inst = await webVcdParser(mod); // VCD parser instance
  const handler = getHandler(content, inst);
  await getReaders(handler, vcdPath);
};


/* eslint-env browser */
