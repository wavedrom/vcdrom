'use strict';

const pkg = require('../package.json');

const createVCD = require('vcd-stream/out/vcd.js');
const webVcdParser = require('vcd-stream/lib/web-vcd-parser.js');
const vcdPipeDeso = require('vcd-stream/lib/vcd-pipe-deso.js');
const getVcd = require('vcd-stream/lib/get-vcd.js');

const stringify = require('onml/stringify.js');

const {StyleModule} = require('style-mod');

const {
  domContainer,
  pluginRenderValues,
  pluginRenderTimeGrid,
  keyBindo,
  mountTree,
  getElement,
  getListing,
  // renderMenu,
  // mountCodeMirror5,
  genKeyHandler,
  genOnWheel,
  themeAll,
  helpPanel
} = require('@wavedrom/doppler');

const {
  createCodeMirrorState,
  mountCodeMirror6
} = require('waveql');

const getReaders = require('./get-readers.js');
const dropZone = require('./drop-zone.js');
const getWaveql = require('./get-waveql.js');
const getJsonls = require('./get-jsonls.js');
const pluginLocalStore = require('./plugin-local-store.js');

const getHandler = (content, inst) => async readers => {

  const waveql = await getWaveql(readers);
  const listing = await getListing(readers);
  const jsonls = await getJsonls(readers);
  const timeOpt = readers.find(row => row.key === 'time');

  vcdPipeDeso({wires: {body: []}}, inst, deso => {
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
      ],
      pluginRightPanel: (elo) => {
        elo.rightPanel.innerHTML = stringify(helpPanel.mlPanel(keyBindo));
      }
    });

    content.appendChild(container.pstate.container);
    container.start(deso);

    container.elo.menu.innerHTML = stringify(helpPanel.mlIcon('https://github.com/wavedrom/vcdrom/blob/trunk/help.md'));
    container.elo.menu.addEventListener('click', () => helpPanel.toggle(container.pstate));

    // ['container', 'cursor', 'view0', 'values', 'waveqlPanel', 'menu']
    //   .map(id => ({id, el: container.elo[id]}))
    //   .concat(
    //     {id: 'document', el: document}
    //   )
    //   .map(o => {
    //     o.el.addEventListener('scroll', () => {
    //       console.log('scroll ' + o.id);
    //     });
    //   });

    deso.hasHistory = true;
    deso.isRO = true;
    deso.updater = ( /* str */ ) => {
      console.log('updater');
    };

    const cmState = createCodeMirrorState(
      deso,
      container.pstate
    );

    const cm = mountCodeMirror6(
      cmState,
      container.elo.waveqlPanel,
      deso,
      container.pstate
    );

    cm.view.dispatch({changes: {from: 0, insert: ' '}});
    cm.view.dispatch({changes: {from: 0, to: 1, insert: ''}});

    container.elo.container.addEventListener('keydown', genKeyHandler.genKeyHandler(content, container.pstate, deso, cm, keyBindo));
    container.elo.container.addEventListener('wheel', genOnWheel(content, container.pstate, deso, cm, keyBindo));
    // console.log(cm);
    cm.view.focus();
  });

  await getVcd(readers, content, inst);
  console.log('getVcd');
};

global.VCDrom = async (divName, vcdPath) => {
  console.log(pkg.name, pkg.version, vcdPath);
  const content = getElement(divName);

  const themeAllMod = new StyleModule(themeAll);
  StyleModule.mount(document, themeAllMod);

  content.innerHTML = stringify(dropZone({width: 2048, height: 2048}));
  const mod = await createVCD();
  const inst = await webVcdParser(mod); // VCD parser instance
  const handler = getHandler(content, inst);
  await getReaders(handler, vcdPath);
  // console.log(content);
};

/* eslint-env browser */
