'use strict';

const CodeMirror = require('codemirror');
const waveql = require('./waveql.js');

require('codemirror/addon/fold/foldcode.js');
require('codemirror/addon/fold/foldgutter.js');
require('codemirror/addon/fold/brace-fold.js');
require('codemirror/addon/hint/show-hint.js');
// require('codemirror/addon/fold/xml-fold.js');

const genKeyHandler = require('./gen-key-handler.js');
const genRenderWavesGL = require('./gen-render-waves-gl.js');
const genOnWheel = require('./gen-on-wheel.js');
const renderCursor = require('./render-cursor.js');
const genResizeHandler = require('./gen-resize-handler.js');
const tAtX = require('./t-at-x.js');
const xOffsetAtT = require('./xofs-at-t.js');

const ws = require('../ws-endpoint.js');
const timeAtCursor = require('./time-at-cursor.js');
// eslint-disable-next-line no-unused-vars
const { last } = require('lodash');

//const genWsHandler = require('./gen-ws-handler.js');

const setupMouseHandlers = (cursor, content, pstate /* , render */) => {
  const moveHandler = (event) => {
    if (pstate.markmode) {
      return;
    }
    const x = (pstate.xCursor = event.clientX);
    pstate.yCursor = event.clientY;
    cursor.style.left = (x - pstate.cursorXmargin) + 'px';
    cursor.innerHTML = renderCursor({}, pstate);
  };

  const clickHandler = (event) => {
    if (!pstate.markmode) {
      return;
    }
    const x = pstate.xCursor = event.clientX;
    pstate.yCursor = event.clientY;
    cursor.style.left = x - pstate.cursorXmargin + 'px';
    cursor.innerHTML = renderCursor({}, pstate);
  };
  moveHandler({clientX: pstate.width / 2});
  content.addEventListener('mousemove', moveHandler);
  content.addEventListener('click', clickHandler);
};

const createElements = els => {
  const names = Object.keys(els);
  return names.reduce((res, name) => {
    const ml = els[name];
    const el = document.createElement(ml[0]);
    const attr = (typeof ml[1] === 'object') ? ml[1] : {};
    attr.class && el.classList.add(attr.class);
    attr.style && el.setAttribute('style', attr.style);
    res[name] = el;
    return res;
  }, {});
};

const getFullView = desc => {
  if (desc.waveql) {
    return;
  }

  const arr = [];

  const rec = obj => {
    Object.keys(obj).map(name => {
      const ref = obj[name];
      if (typeof ref === 'object') {
        arr.push(name);
        rec(ref);
        arr.push('..');
        return;
      }
      if (typeof ref !== 'string') {
        throw new Error();
      }
      arr.push(name);
    });
  };

  rec(desc.wires);

  desc.waveql = arr.join('\n');
};

module.exports = (content, desc /* , opt */) => {

  getFullView(desc);

  // console.log(desc);

  desc.t0 = desc.t0 || 0;
  // kjm: using 40 because it seems to be a good size for pipeline blocks
  desc.xScale = 40;
  const pstate = {
    width: 1024,
    height: 1024,
    tgcd: desc.tgcd,
    timescale: desc.timescale,
    xScale: desc.xScale,
    xScaleMax: 1000,
    // xScaleMin: 1,
    xOffset: 0,
    yOffset: 0,
    yStep: 48,
    yDuty: 0.7,
    sidebarWidth: 320,
    numLanes: desc.view.length,
    t0: desc.t0,
    time: desc.time,
    bookmarks: [],
    markmode: true,
    abmarks: { a: -1, b: -1, c: -1, d: -1 },
    cursorXmargin: 60,
    cursorFontHeight: 20,
    cursorFontWidth: 12
  };
  // pstate.xOffset = (2 * (pstate.width - pstate.sidebarWidth)) / pstate.time;

  // const {timetopSVG, timebotSVG} = timeline(desc);

  const els = createElements({
    container: [
      'div',
      {
        class: 'wd-container'
      }
    ],
    view0: [
      'div',
      {
        class: 'wd-view',
        style: 'position: absolute; left: 0px;' // z-index: -10'
      }
    ],
    values: [
      'div',
      {
        class: 'wd-values',
        style: 'position: absolute; left: 0px;' // z-index: -9'
      }
    ],
    cursor: [
      'div',
      {
        class: 'wd-cursor'
        // style: 'position: absolute; top: 0px; left: 0px;'
        // style: 'overflow: hidden; position: absolute; top: 0px; left: 0px;'
      }
    ],
    marka: [
      'div',
      {
        class: 'wd-markab'
      }
    ],
    markb: [
      'div',
      {
        class: 'wd-markab'
      }
    ],
    markc: [
      'div',
      {
        class: 'wd-markcd'
      }
    ],
    markd: [
      'div',
      {
        class: 'wd-markcd'
      }
    ],
    sidebar: ['textarea', {}]
  });

  [
    els.values,
    els.view0,
    els.cursor,
    els.marka,
    els.markb,
    els.markc,
    els.markd,
    els.sidebar
  ].map((e) => els.container.appendChild(e));

  content.appendChild(els.container);

  let render2 = genRenderWavesGL(
    els.view0,
    els.sidebar,
    els.values,
    els.marka,
    els.markb,
    els.markc,
    els.markd
  );
  let render1 = render2(desc);
  let render = render1(pstate);

  //  => {
  //   const t0 = Date.now();
  //   mainGL(desc, pstate, els.view0);
  //   console.log('render time: ' + (Date.now() - t0));
  // };

  els.sidebar.innerHTML = desc.waveql;

  // console.log(foldGutter); // (CodeMirror);

  waveql.cmMode(CodeMirror, desc);
  // waveql.cmHint(CodeMirror, desc);

  const cm = CodeMirror.fromTextArea(els.sidebar, {
    extraKeys: {'Ctrl-Space': 'autocomplete'},
    theme: 'waveql',
    mode: 'text/x-waveql',
    // lineNumbers: true,
    lineWrapping: false,
    tabSize: 2,
    autofocus: true,
    scrollbarStyle: null,
    styleActiveSelected: true,
    // styleActiveLine: true,
    styleActiveLine: {nonEmpty: true},
    // styleSelectedText: true,
    viewportMargin: Infinity,
    foldGutter: true,
    hintOptions: {hint: waveql.cmHint(CodeMirror, desc)},
    gutters: ['CodeMirror-linenumbers', 'CodeMirror-foldgutter']
  });

  // cm.on('cursorActivity', cm => {
  //   //console.log(cm.cursorCoords());
  //   var line = cm.getDoc().getCursor().line;
  //   console.log(cm.getDoc().getLine(line));
  // });

  cm.on('scroll', cm => {
    const info = cm.getScrollInfo();
    // console.log(info);
    pstate.yOffset = 2 * info.top / info.clientHeight;
    render();
  });

  const parser = waveql.parser(desc.wires);

  const onCmChange = cm => {
    const str = cm.getValue();
    desc.view = parser(str);
    render();
  };

  cm.on('change', onCmChange);
  onCmChange(cm);

  els.container.tabIndex = '0';
  els.container.addEventListener('keydown', genKeyHandler(content, pstate, render, cm, ws));
  els.container.addEventListener('wheel', genOnWheel(content, pstate, render, cm));

  // place a ref to ws into pstate so it is accessible whereever pstate is.
  pstate.ws = ws;
  // Tell ws about pstate and the render function.  There is probably a more
  // javascripty way of diong this...
  ws.init(pstate, els.cursor, render, cm);
  
  // ws.onmessage = (e) => {
  //   console.log('dom-container recieved: ' + e.data);
  // };

  function handleVisibilityChange() {
    if (document.visibilityState === 'visible') {
      ws.sendmsg('visible');
    } 
  }

  document.addEventListener('visibilitychange', handleVisibilityChange, false);

  els.container.addEventListener('focus', handleVisibilityChange, false);
  
  var hoverTimeout = null;
  var lastHoverTime = -1;
  var lastAddr = '';
  els.container.addEventListener('mousemove', () => {
    if (hoverTimeout != null) {
      clearTimeout(hoverTimeout);
    }

    hoverTimeout = setTimeout(() => {
      const t = timeAtCursor(pstate);
      var pcAddrs = document.getElementsByClassName('pc-addr');

      const count = pcAddrs.length;
      var addr = '';
      for (let i = 0; i < count; i++) {
        let y1 = pcAddrs[i].getBoundingClientRect().top;
        let y2 = pcAddrs[i].getBoundingClientRect().bottom;
        //console.log(pstate.yCursor, y);
        if (pstate.yCursor >= y1 && pstate.yCursor <= y2) {
          addr = pcAddrs[i].textContent.trim();
        }
      }
      if (t != lastHoverTime || addr != lastAddr) {
        ws.sendmsg('hoverat ' + t + ' ' + addr);
        lastHoverTime = t;
        lastAddr = addr;
      }
    }, 250);

  }, false);

  const resizeHandler = genResizeHandler(pstate);

  const resizeObserver = new ResizeObserver(entries => {
    // Grab the current time at the left edge...
    let t0 = tAtX(pstate.sidebarWidth, pstate);
    for (let entry of entries) {
      const {width, height} = entry.contentRect;
      resizeHandler(width, height);
    }
    // Compute the xOffset to restore the t0 state
    pstate.xOffset = xOffsetAtT(t0, pstate);
    render();
    els.cursor.innerHTML = renderCursor({}, pstate);

  });

  resizeObserver.observe(els.container);

  // pinchAndZoom(els.container, content, pstate, render);
  resizeHandler(els.container.clientWidth, els.container.clientHeight);
  setupMouseHandlers(els.cursor, els.container, pstate, render);
  render();
};

/* eslint-env browser */
