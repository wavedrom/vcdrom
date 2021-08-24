#!/usr/bin/bash

mkdir -p app

cp node_modules/codemirror/lib/codemirror.css app
cp node_modules/codemirror/theme/blackboard.css app

cp node_modules/vcd-stream/out/vcd.wasm app

cp src/vcdrom.html app/index.html
cp src/vcdrom.css app
cp src/vcdrom.ico app
cp src/*.woff2 app

browserify ./lib/vcdrom.js | terser --compress -o app/vcdrom.js
