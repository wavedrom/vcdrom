/* eslint-disable no-console */
'use strict';

const pkg = require('../package.json');
const createVCD = require('vcd-stream/out/vcd.js');
const webVcdParser = require('vcd-stream/lib/web-vcd-parser.js');
const stringify = require('onml/stringify.js');
const domContainer = require('./doppler/dom-container.js');
const getReaders = require('./get-readers.js');
const vcdPipeDeso = require('./vcd-pipe-deso.js');
const dropZone = require('./drop-zone.js');
const lister = require('./lister.js');
const createHelpUI = require('./helpUI.js');
const listenForHelpUI = require('./helpUIOpener.js');
const createStatusBars = require('./createStatusBars.js');
const openStatusBars = require('./openStatusBars.js');

const getPathBaseName = (path) => {
  // Split windows or linux style paths strings
  const p = path.split(/[\\/]/);
  // Pop the vcd filename off the array
  p.pop();
  // Pop and return the folder name
  return p.pop();
};

const maxChunkLength = 1 << 22; // Number.MAX_SAFE_INTEGER; // 5e6; // 300000; // 1 << 23;

const u8toStr = (u8) => {
  let res = '';
  for (let i = 0; i < u8.length; i++) {
    res += String.fromCharCode(u8[i]);
  }
  return res;
};
const getElement = (divName) => {
  if (typeof divName === 'string') {
    const c = document.getElementById(divName);
    if (c === null) {
      throw new Error('<div> element width Id: "' + divName + '" not found');
    }
    return c;
  }
  return divName;
};

const getHandler = (content, inst) => async (readers) => {
  // console.log(readers);

  let waveql;
  {
    const r = readers.find((reader) => reader.ext === 'waveql');
    if (r && r.reader) {
      // console.log('WaveQL', r);
      const utf8Decoder = new TextDecoder('utf-8');
      waveql = '';
      for (let i = 0; i < 1e5; i++) {
        const { done, value } = await r.reader.read();
        waveql += value ? utf8Decoder.decode(value, { stream: true }) : '';
        if (done) {
          break;
        }
      }
    }
  }

  let listing = [];
  {
    const r = readers.find((reader) => reader.ext === 'lst');
    if (r) {
      // console.log('LST', r);
      const utf8Decoder = new TextDecoder('utf-8');
      const list = lister();
      for (let i = 0; i < 10; i++) {
        const { done, value } = await r.reader.read();
        list.onChunk(value ? utf8Decoder.decode(value, { stream: true }) : '');
        if (done) {
          listing = list.getTrace();
          break;
        }
      }
    }
  }

  vcdPipeDeso({}, inst, (deso) => {
    // console.log('parsed', deso);
    content.innerHTML = '';
    deso.waveql = waveql;
    deso.listing = listing;
    domContainer(content, deso);
    // function to create the help UI
    createHelpUI();
    // function to create the status bars
    createStatusBars();
  });

  {
    const r = readers.find((reader) => reader.ext === 'vcd');
    if (r) {
      document.title = getPathBaseName(r.value);
      content.innerHTML = '<div class="wd-progress"></div>';

      let total = 0;
      outerLoop: for (let i = 0; i < 1e5; i++) {
        const { done, value } = await r.reader.read();

        if (done && value === undefined) {
          // console.log('the end');
          inst.end();
          break outerLoop;
        }
        const len = value.length;
        for (let j = 0; j < len; j += maxChunkLength) {
          const value1 = value.slice(j, j + maxChunkLength);
          const len1 = value1.length;
          total += len1;

          // const vh = u8toStr(value1.slice(0, 100));
          // const vt = u8toStr(value1.slice(-100));
          // console.log({len1, done, total, vh, vt});

          content.innerHTML =
            '<div class="wd-progress">' + total.toLocaleString() + '</div>';
          if (done && j + maxChunkLength >= len) {
            console.log('last chunk');
            inst.end(value1);
            break outerLoop;
          }
          inst.write(value1);
        }
      }
    }
  }
};

listenForHelpUI();
openStatusBars();

global.VCDrom = async (divName, vcdPath) => {
  const content = getElement(divName);
  content.innerHTML = stringify(dropZone({ width: 2048, height: 2048 }));
  const mod = await createVCD();
  const inst = await webVcdParser(mod); // VCD parser instance
  const handler = getHandler(content, inst);
  await getReaders(handler, vcdPath);
};

/* eslint-env browser */
