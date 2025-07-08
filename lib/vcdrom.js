'use strict';

const memmap = require('vcd2/lib/memmap.js');
// const initState = require('vcd2/lib/init-state.js');
const addWasmMemoryViews = require('vcd2/lib/add-wasm-memory-views.js');
// const traceGlPages = require('./trace-gl-pages.js');
const vcdromWorkerUri = require('../vcdrom-worker.uri.json');
const base64JsBlob = require('./base64-js-blob.js');

global.VCDrom = async () => {
  // need to be true
  console.log({crossOriginIsolated: window.crossOriginIsolated});

  document.body.innerHTML = '<div id="container"></div>';
  const container = document.getElementById('container');
  const urlSearchParams = new URLSearchParams(window.location.search);

  const vcdWorker = new Worker(base64JsBlob(vcdromWorkerUri));

  const $ = {}; // empty state

  const handlers = {
    wasmMemory: async (e) => {
      console.log('wasmMemory');
      $.memory = e.data.data;
      addWasmMemoryViews($);
      for (const [key, value] of urlSearchParams) {
        if (key === 'vcd') { // ...:8080/?vcd=foo.vcd
          console.log(window.location);
          vcdWorker.postMessage({
            cmd: 'loadVcd',
            data: value
          });
          break;
        }
      }
    },
    enddefinitions: async (e) => {
      $.enddefinitions = e.data.data;
      console.log(e.data);
    },
    stats: async () => {
      if ($.enddefinitions) {
        const timescaleString = $.enddefinitions.timescale;
        const m = timescaleString.trim().match(/^(\d+)\s*(\w+)$/);
        const time = $.memI64[memmap.time] * BigInt(m[1]);
        container.innerHTML = time.toLocaleString() + ' ' + m[2];
      } else {
        container.innerHTML = '0';
      }
    },
    loadVcdDone: async () => {
      // traceGlPages($);
    }
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

  vcdWorker.postMessage({cmd: 'loadWasm'});

};

/* eslint-env browser */
