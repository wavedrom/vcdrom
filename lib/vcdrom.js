'use strict';

const styleMod = require('style-mod');

const doppler = require('@wavedrom/doppler');

const pkg = require('../package.json');
const appContext = require('./app-context.js');
const newVcdromWorker = require('./new-vcdrom-worker.js');
const handleWasmMemory = require('./handle-wasm-memory.js');
const handleEnddefinitions = require('./handle-enddefinitions.js');
const onWorkerMessage = require('./on-worker-message.js');
const handleVcdParserReady = require('./handle-vcd-parser-ready.js');

global.VCDrom = async (divName) => {
  const {crossOriginIsolated} = window;
  if (!crossOriginIsolated) {
    console.error({crossOriginIsolated}); // eslint-disable-line no-console
  }
  console.log(pkg.name, pkg.version); // eslint-disable-line no-console

  styleMod.StyleModule.mount(document, new styleMod.StyleModule(doppler.themeAll));

  const $ = appContext();
  $.rootDiv = doppler.getElement(divName); // Root div for the application
  $.rootDiv.innerHTML = ''; // Clear the root div
  $.vcdromWorker = newVcdromWorker(); // VCD worker
  $.workerHandlo = {}; // Object of worker message handlers
  $.workerHandlo.wasmMemory = handleWasmMemory($); // Sets `vcdParserReady` flag
  $.workerHandlo.enddefinitions = handleEnddefinitions($); // Sets `vcdDefinitionsParsed` flag
  $.vcdromWorker.onmessage = onWorkerMessage($.workerHandlo);
  $.sub.set.after('vcdParserReady', handleVcdParserReady($));
  $.vcdromWorker.postMessage({cmd: 'loadWasm'});
};
