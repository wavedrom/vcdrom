#!/usr/bin/bash
debug=false

while getopts dj flag
do
    case "${flag}" in
        d) 
            debug=true ;;
    esac
done

if [ ! -d "node_modules" ]; then
    npm i
fi

mkdir -p app

cp node_modules/vcd-stream/out/vcd.wasm app

cp -r src/favicon app
cp src/pv.html app/index.html
cp src/vcdrom.css app
cp src/*.woff2 app


if [ "${debug}" == "true" ]
then
    # When debugging don't tersify and do generate source maps.
    ./node_modules/.bin/browserify -d ./lib/vcdrom.js >app/vcdrom.js
else
    ./node_modules/.bin/browserify ./lib/vcdrom.js | ./node_modules/.bin/terser --compress -o app/vcdrom.js
fi


