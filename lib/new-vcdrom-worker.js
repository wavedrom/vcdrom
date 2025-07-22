'use strict';

const base64JsBlob = require('./base64-js-blob.js');
const vcdromWorkerUri = require('../vcdrom-worker.uri.json');

const newVcdromWorker = () =>
  new Worker(base64JsBlob(vcdromWorkerUri));

module.exports = newVcdromWorker;

/* eslint-env browser */
