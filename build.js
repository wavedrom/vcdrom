#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const process = require('process');

const commander = require('commander');
const chokidar = require('chokidar');
const browserify = require('browserify');
const terser = require('terser');

const runBrowserify = (files) => new Promise((resolve /* , reject */) => {
  const b = browserify(files, {
    detectGlobals: true
  });
  b.bundle((err, buff) => {
    if (err) {
      throw new Error(err);
    }
    resolve(buff.toString());
  });
});

const writeFileExtra = (opts) => async (fname, fbody) => {
  await fs.promises.writeFile(fname, fbody);
  if (opts.verbose) {
    console.log(fname, fbody.length);
  }
  return fbody;
};

const run = async (opts) => {
  if (opts.verbose) {
    console.log('run');
  }

  const wfe = writeFileExtra(opts);

  const workerCode = await wfe('./vcdrom-worker.js',
    await runBrowserify('./lib/vcdrom-worker.js'));

  /* const workerCodeMin = */ await wfe('./vcdrom-worker.min.js',
    (await terser.minify(workerCode, {compress: {}})).code);

  await wfe('./vcdrom-worker.uri.json',
    `"${Buffer.from(workerCode, 'utf8').toString('base64')}"`);

  const mainCode = await wfe('./app/vcdrom.js',
    await runBrowserify('./lib/vcdrom.js'));

  await wfe('./vcdrom.min.js',
    (await terser.minify(mainCode, {compress: {}})).code);
};

const build = async () => {
  const program = new commander.Command();

  program
    .option('-v, --verbose', 'verbosity that can be increased', (_, v) => v + 1, 0)
    .option('-w, --watch', 'keep watching for source file changes')
    .parse(process.argv);

  const opts = program.opts();

  await run(opts);

  if (opts.watch) {
    const fullWatchPoints = ['./lib/', './build.js'].map(p => path.resolve(p));
    const watcher = chokidar.watch(fullWatchPoints, {
      ignored: /(^|[/\\])\../, // ignore dotfiles
      persistent: true
    });
    watcher.on('change', async (filename) => {
      if (opts.verbose) {
        process.stdout.write(`File ${filename} changed : `);
      }
      await run(opts);
    });
  }
};

build();

/* eslint no-console: 0 */
