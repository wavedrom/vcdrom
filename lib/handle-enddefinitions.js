'use strict';

const memmap = require('vcd2/lib/memmap.js');

const parseTimescale = require('./parse-time-scale.js');

/**
 * Returns a function that handles the 'enddefinitions' message from the VCD worker.
 * 
 * When the worker sends this message, it indicates that the VCD parser has finished
 * processing the definitions section (everything before $enddefinitions), containing
 * signal hierarchy and metadata.
 * 
 * @param {Object} $ - Application context object
 * @param {Object} $.cnt1 - Container object with parser state
 * @param {Object} $.cnt1.pstate - Parser state object
 * @param {Object} $.memI64 - BigInt64Array view of WASM memory
 * @param {Object} $.state - Application state object
 * @param {boolean} $.state.vcdDefinitionsParsed - Flag indicating definitions are parsed
 * 
 * Handler Behavior:
 * 1. Receives VCD definitions data (signal hierarchy, timescale, etc.)
 * 2. Stores definitions in application context
 * 3. Configures parser state with timing information
 * 4. Updates time values from WASM memory
 * 5. Sets definitions parsed flag
 * 
 * @example
 * ```javascript
 * const $ = appContext();
 * $.workerHandlo = {};
 * $.workerHandlo.enddefinitions = handleEnddefinitions($);
 * 
 * // Handler will be called when worker sends:
 * // postMessage({
 * //   cmd: 'enddefinitions', 
 * //   data: {
 * //     wires: {...},      // Signal hierarchy
 * //     timescale: '1ns'   // Time unit
 * //   }
 * // });
 * ```
 * 
 * Data Structure:
 * The enddefinitions data typically contains:
 * - `wires`: Hierarchical signal definitions
 * - `timescale`: VCD timescale specification (e.g., "1ns", "1ps")
 */
const handleEnddefinitions = ($) => async (e) => {
  console.log('rx: enddefinitions'); // eslint-disable-line no-console
  
  // Extract definitions data from worker message
  const {data} = e.data;
  
  // Store definitions in application context for later use
  $.enddefinitions = data;
  
  // Configure parser state with timing information
  $.cnt1.pstate.timescale = parseTimescale(data.timescale);

  // tgcd is the Time Greatest Common Denominator
  $.cnt1.pstate.tgcd = 1; // TODO calculate proper value

  // Update time values from WASM memory
  // t0 is the start time of the simulation
  $.cnt1.pstate.t0 = Number($.memI64[memmap.t0]);
  // time is the current simulation time
  $.cnt1.pstate.time = Number($.memI64[memmap.time]);

  // Signal that VCD definitions have been successfully parsed
  $.state.vcdDefinitionsParsed = true;
};

module.exports = handleEnddefinitions;
