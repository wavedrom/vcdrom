'use strict';

const pkg = require('../package.json');
const createVCD = require('vcd-stream/out/vcd.js');
const webVcdParser = require('vcd-stream/lib/web-vcd-parser.js');
const stringify = require('onml/stringify.js');
const domContainer = require('@wavedrom/doppler/lib/dom-container.js');
const renderValues = require('@wavedrom/doppler/lib/render-values.js');
const defaultKeyBindo = require('@wavedrom/doppler/lib/key-bindo.js');

const getReaders = require('./get-readers.js');
const vcdPipeDeso = require('./vcd-pipe-deso.js');
const dropZone = require('./drop-zone.js');
const getWaveql = require('./get-waveql.js');
const getListing = require('./get-listing.js');
const getVcd = require('./get-vcd.js');
const getJsonls = require('./get-jsonls.js');

// const u8toStr = (u8) => {
//   let res = '';
//   for (let i = 0; i < u8.length; i++) {
//     res += String.fromCharCode(u8[i]);
//   }
//   return res;
// };

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

  const waveql = await getWaveql(readers);
  const listing = await getListing(readers);
  const jsonls = await getJsonls(readers);

  let timeOpt = readers.find(row => row.key === 'time');

  vcdPipeDeso({}, inst, deso => {
    // console.log('parsed', deso);
    content.innerHTML = '';
    deso.waveql = waveql;
    deso.listing = listing;
    deso.timeOpt = timeOpt;
    deso.jsonls = jsonls;

    const container = domContainer();

    // container.pstate.mySecret = 42;
    // container.elemento
    // container.layers
    // container.renderPlugins.push(...)

    Object.assign(container.keyBindo, defaultKeyBindo /* , additionalKeyBindings */ );

    container.renderPlugins.push(
      (desc, pstate, els) => {
        const gen = renderValues(desc, pstate);
        for (let i = 0; i < 1e6; i++) {
          const iter = gen.next();
          if (iter.done) {
            els.values.innerHTML = iter.value;
            break;
          }
        }
      }
    );

    /* const {render} = */ container.start(content, deso);

  });

  await getVcd(readers, content, inst);

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
