'use strict';

const stringify = require('onml/stringify.js');
const memmap = require('vcd2/lib/memmap.js');

const {
  domContainer,
  pluginRenderValues,
  pluginRenderTimeGrid,
  keyBindo,
  mountTree,
  genKeyHandler,
  genOnWheel,
  helpPanel,
  statusPanel
} = require('@wavedrom/doppler');

const {
  createCodeMirrorState,
  mountCodeMirror6
} = require('waveql');

const pkg = require('../package.json');

const dropZone = require('./drop-zone.js');
const pluginLocalStore = require('./plugin-local-store.js');
const fileInUrl = require('./file-in-url.js');
const getFullWaveQL = require('./get-full-wave-ql.js');
const parseTimescale = require('./parse-time-scale.js');

const genStats = ($, statPanelDiv) => async (e) => {
  // console.log('rx: stats', $);
  const {data} = e.data;
  let timeStamp = '?';
  if ($.enddefinitions) {
    const timescaleString = $.enddefinitions.timescale;
    const m = timescaleString.trim().match(/^(\d+)\s*(\w+)$/);
    const time = $.memI64[memmap.time] * BigInt(m[1]);
    timeStamp = time.toLocaleString() + ' ' + m[2];
    $.cnt1.pstate.time = Number(time);
  }
  statPanelDiv.innerHTML = stringify(statusPanel.mlStats($, data, timeStamp));
};

const genLoadVcdDone = ($, statPanelDiv) => async () => {
  console.log('rx: loadVcdDone');
  statPanelDiv.innerHTML = stringify(statusPanel.mlDone());
  // traceGlPages($);
};

const handleVcdParserReady = ($) => async () => {
  const vcdUrl = fileInUrl(['vcd']);
  const waveqlUrl = fileInUrl(['waveql']);

  if (!vcdUrl) {
    $.rootDiv.innerHTML = stringify(dropZone({width: 2048, height: 2048}));
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
  $.cnt1 = cnt1;
  $.rootDiv.appendChild(cnt1.pstate.container);
  cnt1.elo.menu.innerHTML = stringify(helpPanel.mlIcon('https://github.com/wavedrom/vcdrom/blob/trunk/help.md'));
  cnt1.elo.menu.addEventListener('click', () => helpPanel.toggle(cnt1.pstate));
  $.workerHandlo.stats = genStats($, cnt1.elo.status);
  $.workerHandlo.loadVcdDone = genLoadVcdDone($, cnt1.elo.status);
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
    // console.log($.enddefinitions);
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
      // console.log('sub.set.after: waveqlUrl -> deso.vcdDefinitionsParsed');
      restartCm();
    });
  } else {
    $.sub.set.after('vcdDefinitionsParsed', async () => {
    // console.log('sub.set.after: vcdDefinitionsParsed');
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
  cnt1.elo.container.addEventListener('keydown', genKeyHandler.genKeyHandler($.rootDiv, cnt1.pstate, deso, cm, keyBindo));
  cnt1.elo.container.addEventListener('wheel', genOnWheel($.rootDiv, cnt1.pstate, deso, cm, keyBindo));
  cm.view.focus();

  // cnt1.start(deso);
  if (vcdUrl) {
    $.state.loadVcdT0 = Date.now();
    $.vcdromWorker.postMessage({cmd: 'loadVcd', data: vcdUrl});
  }
};

module.exports = handleVcdParserReady;
