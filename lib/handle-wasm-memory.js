'use strict';

const addWasmMemoryViews = require('vcd2/lib/add-wasm-memory-views.js');

/**
 * Returns a function that handles the 'wasmMemory' message from the VCD worker.
 * 
 * When the worker sends this message, it indicates that the WASM module has been
 * loaded and shared memory is available for communication.
 * 
 * @returns {Function} - Function that handles the 'wasmMemory' message
 * 
 * @param {Object} $ - Application context object
 * @param {Object} $.memory - Shared memory object
 * @param {Object} $.state - Application state object
 * @param {boolean} $.state.vcdParserReady - Flag indicating parser readiness
 * 
 * Handler Behavior:
 * 1. Receives shared memory reference from worker
 * 2. Adds typed array views to the memory for efficient access
 * 3. Sets parser ready flag to enable VCD loading
 * 
 * @example
 * ```javascript
 * const $ = appContext();
 * $.workerHandlo = {};
 * $.workerHandlo.wasmMemory = handleWasmMemory($);
 * 
 * // Handler will be called when worker sends:
 * // postMessage({cmd: 'wasmMemory', data: wasmMemory});
 * ```
 */
const handleWasmMemory = ($) => async (e) => {
  console.log('rx: wasmMemory'); // eslint-disable-line no-console
  
  // Store the shared memory reference from the worker
  $.memory = e.data.data;
  
  // Add typed array views (Uint8Array, Uint32Array, etc.) to the
  // shared memory object for efficient access to different data types
  addWasmMemoryViews($);
  
  // Signal that the VCD parser is ready to process files
  $.state.vcdParserReady = true;
};

module.exports = handleWasmMemory;
