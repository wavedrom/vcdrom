'use strict';

const pkg = require('../package.json');

const createVCD = require('vcd-stream/out/vcd.js');
const webVcdParser = require('vcd-stream/lib/web-vcd-parser.js');

const stringify = require('onml/stringify.js');

const {StyleModule} = require('style-mod');

const {
  domContainer,
  pluginRenderValues,
  pluginRenderTimeGrid,
  keyBindo,
  mountTree,
  // renderMenu,
  // mountCodeMirror5,
  genKeyHandler,
  genOnWheel,
  themeAll,
  helpPanel
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
      ],
      pluginRightPanel: (elo) => {
        elo.rightPanel.innerHTML = stringify(helpPanel.mlPanel(keyBindo));
      }
    });

    const {render} = container.start(content, deso);

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


    const cm = mountCodeMirror6(
      container.elo.waveqlPanel,
      deso,
      container.pstate,
      render
    );
    container.elo.container.addEventListener('keydown', genKeyHandler.genKeyHandler(content, container.pstate, render, cm, keyBindo));
    container.elo.container.addEventListener('wheel', genOnWheel(content, container.pstate, render, cm, keyBindo));
    // console.log(cm);
    cm.view.focus();

  });

  await getVcd(readers, content, inst);

};

global.VCDrom = async (divName, vcdPath) => {
  console.log(pkg.name, pkg.version, vcdPath);
  const content = getElement(divName);

  const themeAllMod = new StyleModule(themeAll);
  StyleModule.mount(document, themeAllMod);

  content.innerHTML = stringify(dropZone({width: 2048, height: 2048}));
  const mod = await createVCD();
  let inst = await webVcdParser(mod); // VCD parser instance
  const handler = getHandler(content, inst);
  await getReaders(handler, vcdPath);
  // console.log(content);

  if (window.showOpenFilePicker == undefined) {
    return;
  }
  setInterval(async () => {
    getReaders.watchFiles.map(
      async ({fileHandle, files}) => {
        const newFiles = await Promise.all(fileHandle.map(async file => {
          return await file.getFile();
        }));
        const allEq = newFiles.every((newFile, i) => {
          const file = files[i];
          const eq = newFile.lastModified === file.lastModified;
          getReaders.watchFiles[i].files = newFiles;
          return eq;
        });
        if (!allEq) {
          inst = await webVcdParser(mod);
          const handler = getHandler(content, inst);
          await getReaders.handleFiles({files: newFiles}, handler)();
        }
      });
  }, 1000);
};

/* eslint-env browser */
