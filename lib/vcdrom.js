/* eslint-disable no-console */
'use strict';

const pkg = require('../package.json');
const createVCD = require('vcd-stream/out/vcd.js');
const webVcdParser = require('vcd-stream/lib/web-vcd-parser.js');
const stringify = require('onml/stringify.js');
const domContainer = require('./doppler/dom-container.js');
const getReaders = require('./get-readers.js');
const vcdPipeDeso = require('./vcd-pipe-deso.js');
const dropZone = require('./drop-zone.js');
const lister = require('./lister.js');

const getPathBaseName = (path) => {
  // Split windows or linux style paths strings
  const p = path.split(/[\\/]/);
  // Pop the vcd filename off the array
  p.pop();
  // Pop and return the folder name
  return p.pop();
};

const getElement = (divName) => {
  if (typeof divName === 'string') {
    const c = document.getElementById(divName);
    if (c === null) {
      throw new Error('<div> element width Id: "' + divName + '" not found');
    }
    return c;
  }
  return divName;
};

const getHandler = (content, inst) => async (readers) => {
  // console.log(readers);

  let waveql;
  {
    const r = readers.find((reader) => reader.ext === 'waveql');
    if (r && r.reader) {
      // console.log('WaveQL', r);
      const utf8Decoder = new TextDecoder('utf-8');
      waveql = '';
      for (let i = 0; i < 1e5; i++) {
        const { done, value } = await r.reader.read();
        waveql += value ? utf8Decoder.decode(value, { stream: true }) : '';
        if (done) {
          break;
        }
      }
    }
  }

  let listing;
  {
    const r = readers.find((reader) => reader.ext === 'lst');
    if (r) {
      // console.log('LST', r);
      const utf8Decoder = new TextDecoder('utf-8');
      const list = lister();
      for (let i = 0; i < 10; i++) {
        const { done, value } = await r.reader.read();
        list.onChunk(value ? utf8Decoder.decode(value, { stream: true }) : '');
        if (done) {
          listing = list.getTrace();
          break;
        }
      }
    }
  }

  vcdPipeDeso({}, inst, (deso) => {
    // console.log('parsed', deso);
    content.innerHTML = '';
    deso.waveql = waveql;
    deso.listing = listing;
    domContainer(content, deso);

    // add a new div once the pipeline view is loaded
    let exaDiv = document.createElement('div');
    // add the rest of div which contains the inside of the ui handler
    exaDiv.innerHTML = `<div id="helpButton">Click ? to Open</div>
<div id="welcomeDiv">
<form class="form">
  <div class="shortcut-helper-menu hidden">
    <h1 class="header">
      <img src="Freedom.svg">
    </h1>

    <h3 class="header">Keyboard Shortcuts</h3>
    <div class="shortcut">
      <div class="label">Move Up</div>
      <div class="key-command">
        <span class="key key-16"> <big><b> &#8593;</big> </b>UP-Arrow </span>
      </div>
    </div>
    <div class="shortcut">
      <div class="label">Move Down</div>
      <div class="key-command">
        <span class="key key-16"><big><b>&#8595;</big> </b>Down Arrow</span>
      </div>
    </div>
    <div class="shortcut">
      <div class="label">Move Right</div>
      <div class="key-command">
        <span class="key key-16"><big><b>&#8594;</big> </b>Right Arrow</span>
      </div>
    </div>
      <div class="shortcut">
      <div class="label">Move Left</div>
      <div class="key-command">
        <span class="key key-16"><big><b>&#8592;</big> </b>Left Arrow</span>
      </div>
    </div>

          <div class="shortcut">
      <div class="label">Zooms All</div>
      <div class="key-command">
        <span class="key key-16">F</span>
      </div>
    </div>
      <div class="shortcut">
      <div class="label">Zoom in</div>
      <div class="key-command">
        <span class="key key-16"><big><b>&#x2b;</big> </b></span>
      </div>
    </div>
          <div class="shortcut">
      <div class="label">Zoom out</div>
      <div class="key-command">
        <span class="key key-16"><big><b>&#x2212;</big> </b></span>
      </div>
    </div>
              <div class="shortcut">
      <div class="label">Goto Start</div>
      <div class="key-command">
        <span class="key key-16">home</span>
      </div>
    </div>
                              <div class="shortcut">
      <div class="label">Goes to End</div>
      <div class="key-command">
        <span class="key key-16">end</span>
      </div>
    </div>
                              <div class="shortcut">
      <div class="label">Page Up</div>
      <div class="key-command">
        <span class="key key-16">page up</span>
      </div>
    </div>
    <div class="shortcut">
      <div class="label">Page Down</div>
      <div class="key-command">
        <span class="key key-16">page down</span>
      </div>
    </div>
    <div class="shortcut">
      <div class="label">Create Bookmark</div>
      <div class="key-command">
        <span class="key key-16"><b>i</b></span>
      </div>
    </div>
        <div class="shortcut">
      <div class="label">Goto Bookmark</div>
      <div class="key-command">
        <span class="key key-16"><b>&#x31; &#x2212; &#57;</b></span>
      </div>
    </div>
        <div class="shortcut">
      <div class="label">Show Source </div>
      <div class="key-command">
        <span class="key key-16"><b>s</b></span>
      </div>
    </div>
            <div class="shortcut">
      <div class="label">Set Marks </div>
      <div class="key-command">
        <span class="key key-16"><b>a/b c/d</b></span>
      </div>
    </div>

     <h3 class="header">Mouse Shortcuts</h3>
    <div class="shortcut">
      <div class="label">Zoom in/out</div>
      <div class="key-command">
        <span class="key key-16">Ctrl</span> + <span class="key key-39">Mouse Wheel</span>
      </div>
    </div>
        <div class="shortcut">
      <div class="label">Scroll Time</div>
      <div class="key-command">
        <span class="key key-16">Shift</span> + <span class="key key-39">Mouse Wheel</span>
      </div>
    </div>
  </div>
  </form>
  </div>
<!--  -->
<script>`;

    document.getElementsByClassName('wd-container')[0].appendChild(exaDiv);
  });

  {
    const r = readers.find((reader) => reader.ext === 'vcd');
    if (r) {
      document.title = getPathBaseName(r.value);
      content.innerHTML = '<div class="wd-progress">LOADING...</div>';
      let total = 0;
      const maxChunkLength = 300000;
      outerLoop: for (let i = 0; i < 1e5; i++) {
        const { done, value } = await r.reader.read();
        const len = (value || '').length;

        if (done && len === 0) {
          // console.log('the end');
          inst.end();
          break outerLoop;
        }

        for (let j = 0; j < len; j += maxChunkLength) {
          const value1 = value.slice(j, j + maxChunkLength);
          const len1 = value1.length;
          total += len1;
          // console.log({len1, done, total});
          content.innerHTML =
            '<div class="wd-progress">' + total.toLocaleString() + '</div>';
          if (done && j + maxChunkLength >= len) {
            // console.log('last chunk');
            inst.end(value1);
            break outerLoop;
          }
          inst.write(value1);
        }
      }
    }
  }
};

// state
let state = 0;
// event listener for keyboard press of the ?
document.addEventListener('keydown', (event) => {
  if (event.key == '/') {
    if (state == 0) {
      console.log(' i am clicked');

      state = 1;
      document.getElementById('welcomeDiv').classList.toggle('show');
      document.getElementById('helpButton').innerHTML = 'Click ? to Close';
    } else {
      console.log('state was 1 and i did not create another one ', state);
      document.getElementById('welcomeDiv').classList.toggle('hide');
      document.getElementById('helpButton').innerHTML = 'Click ? to Open';
    }
  }
});

global.VCDrom = async (divName, vcdPath) => {
  console.log(pkg.name, pkg.version);
  const content = getElement(divName);
  content.innerHTML = stringify(dropZone({ width: 2048, height: 2048 }));
  const mod = await createVCD();
  const inst = await webVcdParser(mod); // VCD parser instance
  const handler = getHandler(content, inst);
  await getReaders(handler, vcdPath);
};

/* eslint-env browser */
