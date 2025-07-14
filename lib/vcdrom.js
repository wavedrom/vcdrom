'use strict';

const {StyleModule} = require('style-mod');
const stringify = require('onml/stringify.js');
// const memmap = require('vcd2/lib/memmap.js');
const addWasmMemoryViews = require('vcd2/lib/add-wasm-memory-views.js');

const {
  createCodeMirrorState,
  mountCodeMirror6
} = require('waveql');

const {
  domContainer,
  pluginRenderValues,
  pluginRenderTimeGrid,
  keyBindo,
  mountTree,
  getElement,
  // getListing,
  // // renderMenu,
  // // mountCodeMirror5,
  genKeyHandler,
  genOnWheel,
  themeAll,
  helpPanel
} = require('@wavedrom/doppler');

const pkg = require('../package.json');
const appContext = require('./app-context.js');
const vcdromWorkerUri = require('../vcdrom-worker.uri.json');
const base64JsBlob = require('./base64-js-blob.js');
const dropZone = require('./drop-zone.js');
const pluginLocalStore = require('./plugin-local-store.js');
const fileInUrl = require('./file-in-url.js');
const getFullWaveQL = require('./get-full-wave-ql.js');
const parseTimescale = require('./parse-time-scale.js');

const genWasmMemory = ($) => async (e) => {
  console.log('rx: wasmMemory');
  $.memory = e.data.data;
  addWasmMemoryViews($);
  $.state.vcdParserReady = true;
};

const genEnddefinitions = ($) => async (e) => {
  console.log('rx: enddefinitions');
  const {data} = e.data;
  $.enddefinitions = data;
  $.state.vcdDefinitionsParsed = true;
  console.log(data);
};

const genStats = (/* $, statBar */) => async (/* e */) => {
  console.log('rx: stats');
  // const {data} = e.data;
  // if ($.enddefinitions) {
  //   const timescaleString = $.enddefinitions.timescale;
  //   const m = timescaleString.trim().match(/^(\d+)\s*(\w+)$/);
  //   const time = $.memI64[memmap.time] * BigInt(m[1]);
  //   // statBar.innerHTML =
  //   //   data.totalLength.toLocaleString() + ' Byte, '
  //   //   + time.toLocaleString() + ' ' + m[2];
  // } else {
  //   // statBar.innerHTML = data.totalLength.toLocaleString();
  // }
};

const genLoadVcdDone = () => async () => {
  console.log('rx: loadVcdDone');
  // traceGlPages($);
};

const installHandlers = ($, vcdWorker, rootDiv) => {

  rootDiv.innerHTML = '';

  const handlers = {
    wasmMemory: genWasmMemory($),
    enddefinitions: genEnddefinitions($),
    stats: genStats($, rootDiv),
    loadVcdDone: genLoadVcdDone()
  };

  vcdWorker.onmessage = async (e) => {
    if (
      (typeof e.data !== 'object') ||
      (e.data === null) ||
      (e.data.constructor.name !== 'Object')
    ) {
      console.log('UNKNOWN MSG', e);
    }
    const handler = handlers[e.data.cmd] || (async () => {
      console.log('UNKNOWN CMD', e.data);
    });
    await handler(e);
  };

  $.sub.set.after('vcdParserReady', async () => {
    const vcdUrl = fileInUrl(['vcd']);
    const waveqlUrl = fileInUrl(['waveql']);

    if (!vcdUrl) {
      rootDiv.innerHTML = stringify(dropZone({width: 2048, height: 2048}));
      return;
    }

    // DOM elements
    const cnt1 = domContainer({
      elemento: mountTree.defaultElemento,
      layers: mountTree.defaultLayers,
      renderPlugins: [
        pluginRenderTimeGrid,
        pluginRenderValues,
        pluginLocalStore
      ],
      pluginRightPanel: (elo) => {
        elo.rightPanel.innerHTML = stringify(helpPanel.mlPanel(keyBindo, pkg.version));
      }
    });
    rootDiv.appendChild(cnt1.pstate.container);

    const updater = (/* str */) => {
      // console.log('updater');
      // deso.waveql = str;
      // vscode.postMessage({
      //   kind: 'waveql.update',
      //   text: str
      // });
    };

    const deso = {
      hasHistory: true,
      // isRO: true,
      wires: {body: []},
      view: [],
      chango: {},
      listing: [],
      render: () => { console.log('dummy render'); },
      updater
    };

    const restartCm = () => {
      cnt1.pstate.waveql = deso.waveql;
      deso.wires = $.enddefinitions.wires;
      deso.timescale = parseTimescale($.enddefinitions.timescale);
      console.log($.enddefinitions);
      cnt1.start(deso);
      deso.render();
      cm.view.dispatch({changes: {
        from: 0, to: cm.view.state.doc.length, insert: deso.waveql
      }});
      cm.view.setState(createCodeMirrorState(
        deso,
        cnt1.pstate
      ));
    };

    if (waveqlUrl) {
      const resp = await fetch(waveqlUrl);
      const text = await resp.text();
      deso.waveql = text;
      $.sub.set.after('vcdDefinitionsParsed', async () => {
        console.log('sub.set.after: waveqlUrl -> deso.vcdDefinitionsParsed');
        restartCm();
      });
    } else {
      $.sub.set.after('vcdDefinitionsParsed', async () => {
        console.log('sub.set.after: vcdDefinitionsParsed');
        const text = getFullWaveQL($.enddefinitions.wires);
        deso.waveql = text;
        restartCm();
      });
    }

    const cmState = createCodeMirrorState(
      deso,
      cnt1.pstate
    );

    const cm = mountCodeMirror6(
      cmState,
      cnt1.elo.waveqlPanel,
      deso,
      cnt1.pstate
    );
    cnt1.elo.container.addEventListener('keydown', genKeyHandler.genKeyHandler(rootDiv, cnt1.pstate, deso, cm, keyBindo));
    cnt1.elo.container.addEventListener('wheel', genOnWheel(rootDiv, cnt1.pstate, deso, cm, keyBindo));
    cm.view.focus();


    // cnt1.start(deso);
    if (vcdUrl) {
      vcdWorker.postMessage({cmd: 'loadVcd', data: vcdUrl});
    }
  });

  vcdWorker.postMessage({cmd: 'loadWasm'});
};

global.VCDrom = async (divName) => {
  const {crossOriginIsolated} = window;
  if (!crossOriginIsolated) {
    console.error({crossOriginIsolated});
  }

  console.log(pkg.name, pkg.version);
  const rootDiv = getElement(divName);

  const themeAllMod = new StyleModule(themeAll);
  StyleModule.mount(document, themeAllMod);

  const vcdWorker = new Worker(base64JsBlob(vcdromWorkerUri));
  const $ = appContext();

  installHandlers($, vcdWorker, rootDiv);

};

/* eslint-env browser */
/* eslint no-console: 0 */
