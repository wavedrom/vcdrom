'use strict';

// const loadWasm = require('vcd2/lib/load-wasm.js');
// const initVcdWorkerState = require('vcd2/lib/init-vcd-worker-state.js');
// const vcd2wasm = require('vcd2/vcd2.wasm.js');

const {
  loadWasm,
  initVcdWorkerState,
  vcd2wasm,
  addWasmMemoryViews
} = require('vcd2');

const streamData = require('./stream-data.js');

const main = async () => {
  const {crossOriginIsolated} = self;
  if (!crossOriginIsolated) {
    console.error({crossOriginIsolated});
  }

  const t0 = Date.now();
  const $ = initVcdWorkerState();

  $.didEndDefinitions = () => {
    // console.log('didEndDefinitions');
    postMessage({cmd: 'enddefinitions', data: {
      wires: $.wires,
      timescale: $.timescale
    }});
  };

  const handlers = {
    loadWasm: async () => {
      console.log('rx: loadWasm');
      await loadWasm($, vcd2wasm);
      postMessage({cmd: 'wasmMemory', data: $.memory});
    },
    loadVcd: async (e) => {
      console.log('rx: loadVcd');
      const stats = await streamData($, e.data.data);
      postMessage({cmd: 'loadVcdDone', data: stats});
    }
  };

  onmessage = async (e) => {
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
};

main();

/* eslint-env worker */
/* eslint no-console: 0 */
