'use strict';

const pkg = require('../package.json');

const createVCD = require('vcd-stream/out/vcd.js');
const webVcdParser = require('vcd-stream/lib/web-vcd-parser.js');

const stringify = require('onml/stringify.js');

const {
  domContainer,
  pluginRenderValues,
  pluginRenderTimeGrid,
  keyBindo,
  mountTree,
  renderMenu,
  // mountCodeMirror5,
  genKeyHandler,
  genOnWheel,
} = require('@wavedrom/doppler');

const {mountCodeMirror6} = require('waveql');

const getReaders = require('./get-readers.js');
const vcdPipeDeso = require('./vcd-pipe-deso.js');
const dropZone = require('./drop-zone.js');
const getWaveql = require('./get-waveql.js');
const getListing = require('./get-listing.js');
const getVcd = require('./get-vcd.js');
const getJsonls = require('./get-jsonls.js');
const getElement = require('./get-element.js');
const pluginLocalStore = require('./plugin-local-store.js');


const getHandler = (content, inst) => async readers => {
  const waveql = await getWaveql(readers);
  const listing = await getListing(readers);
  const jsonls = await getJsonls(readers);
  const timeOpt = readers.find(row => row.key === 'time');

  vcdPipeDeso({}, inst, deso => {
    // console.log('parsed', deso);
    content.innerHTML = '';
    deso.waveql = waveql;
    deso.listing = listing;
    deso.timeOpt = timeOpt;
    deso.jsonls = jsonls;

    const container = domContainer({
      elemento: mountTree.defaultElemento,
      layers: mountTree.defaultLayers,
      renderPlugins: [
        pluginRenderTimeGrid,
        pluginRenderValues,
        pluginLocalStore
      ]
    });

    const {render} = container.start(content, deso);

    container.elo.menu.innerHTML = renderMenu();

    // ['container', 'cursor', 'view0', 'values', 'sidebar', 'menu']
    //   .map(id => ({id, el: container.elo[id]}))
    //   .concat(
    //     {id: 'document', el: document}
    //   )
    //   .map(o => {
    //     o.el.addEventListener('scroll', () => {
    //       console.log('scroll ' + o.id);
    //     });
    //   });


    const cm = mountCodeMirror6(
      container.elo.sidebar,
      deso,
      container.pstate,
      render
    );
    container.elo.container.addEventListener('keydown', genKeyHandler.genKeyHandler(content, container.pstate, render, cm, keyBindo));
    container.elo.container.addEventListener('wheel', genOnWheel(content, container.pstate, render, cm, keyBindo));
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