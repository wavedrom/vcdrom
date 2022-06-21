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

const mouseMoveHandler = (cursor, content, pstate /* , render */) => {
  const xmargin = 40;
  const fontHeight = 20;
  const fontWidth = fontHeight / 2;
  const handler = event => {
    const x = pstate.xCursor = event.clientX;
    cursor.style.left = (x - xmargin) + 'px';
    cursor.innerHTML = renderCursor({xmargin, fontWidth, fontHeight}, pstate);
  };
  handler({clientX: pstate.width / 2});
  content.addEventListener('mousemove', handler);
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
  desc.xScale |= 8;
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
    time: desc.time
  };
  // pstate.xOffset = (2 * (pstate.width - pstate.sidebarWidth)) / pstate.time;

  // const {timetopSVG, timebotSVG} = timeline(desc);

  const els = createElements({
    container: ['div', {
      class: 'wd-container'
    }],
    view0: ['div', {
      class: 'wd-view',
      style: 'position: absolute; left: 0px;' // z-index: -10'
    }],
    values: ['div', {
      class: 'wd-values',
      style: 'position: absolute; left: 0px;' // z-index: -9'
    }],
    cursor: ['div', {
      class: 'wd-cursor'
      // style: 'position: absolute; top: 0px; left: 0px;'
      // style: 'overflow: hidden; position: absolute; top: 0px; left: 0px;'
    }],
    sidebar: ['textarea', {}]
  });

  [
    els.values,
    els.view0,
    els.cursor,
    els.sidebar
  ]
    .map(e => els.container.appendChild(e));

  content.appendChild(els.container);

  let render2 = genRenderWavesGL(els.view0, els.sidebar, els.values);
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
  //   console.log(cm.cursorCoords());
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
  els.container.addEventListener('keydown', genKeyHandler(content, pstate, render, cm));
  els.container.addEventListener('wheel', genOnWheel(content, pstate, render, cm));

  // els.container.addEventListener('mousemove', event => {
  //   console.log(event);
  // }, false);

  const resizeHandler = genResizeHandler(pstate);

  const resizeObserver = new ResizeObserver(entries => {
    for (let entry of entries) {
      const {width, height} = entry.contentRect;
      resizeHandler(width, height);
    }
    render();
  });

  resizeObserver.observe(els.container);

  // pinchAndZoom(els.container, content, pstate, render);
  resizeHandler(els.container.clientWidth, els.container.clientHeight);
  mouseMoveHandler(els.cursor, els.container, pstate, render);
  render();
};

/* eslint-env browser */
