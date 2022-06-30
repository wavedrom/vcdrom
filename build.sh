#!/bin/bash

mkdir -p app

cp node_modules/codemirror/lib/codemirror.css app

cp node_modules/vcd-stream/out/vcd.wasm app

cp src/vcdrom.html app/index.html
cp -r src/favicon app
cp src/vcdrom.css app
cp src/*.woff2 app
cp src/PipelineViewer.svg app/PipelineViewer.svg


./node_modules/.bin/browserify ./lib/vcdrom.js | ./node_modules/.bin/terser --compress -o app/vcdrom.js
