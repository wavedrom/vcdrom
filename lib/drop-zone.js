'use strict';

const tt = require('onml/tt.js');
const genSvg = require('onml/gen-svg.js');

const accept = ['.vcd', '.lst', '.waveql', '.jsonl', '.ndjson'].join(',');

const openText = [
  ['text', {'text-anchor': 'middle', fill:'#fff', y: -30}, 'Drop VCD file here to Open'],
  ['text', {'text-anchor': 'middle', fill:'#fff', y:   0}, 'or Click'],
  ['text', {'text-anchor': 'middle', fill:'#fff', y:  30}, 'or CTRL + O']
];

const wave = cfg => {
  const { width, height } = cfg;
  const defs = ['filter',
    {
      xmlns: 'http://www.w3.org/2000/svg',
      id: 'filter0_d',
      x: -width >> 1,
      y: -height >> 1,
      width, height,
      filterUnits: 'userSpaceOnUse',
      'color-interpolation-filters': 'sRGB'
    },
    ['feFlood', {'flood-opacity': 0, result: 'BackgroundImageFix'}],
    ['feColorMatrix', {in: 'SourceAlpha', type: 'matrix', values: '0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 100 0'}],
    ['feOffset'],
    ['feGaussianBlur', {stdDeviation: 50}],
    ['feColorMatrix', {type: 'matrix', values: '0 0 0 0 0 0 0 0 0 .6 0 0 0 0 1 0 0 0 3 0'}],
    ['feBlend', {mode: 'normal', in2: 'BackgroundImageFix', result: 'effect1_dropShadow'}],
    ['feBlend', {mode: 'normal', in: 'SourceGraphic', in2: 'effect1_dropShadow', result: 'shape'}]
  ];
  const body = ['g', tt(width >> 1, height >> 1, {filter: 'url(#filter0_d)'})];
  for (let y = -1; y < 1; y += .045) {
    const pat = [];
    const bound = 1; //Math.sqrt(1 - Math.pow(y, 2));
    for (let x = -bound; x < bound; x += .05) {
      pat.push('L',
        Math.round(x * width / 6 - y * width / 6 - width / 30 * Math.sin(Math.PI * x)),
        Math.round(y * width / 12 + x * width / 12 + width / 20 * Math.sin(Math.PI * y) / y * Math.sin(Math.PI * x))
      );
    }
    pat[0] = 'M';
    const sw = .7 * (y + 1);
    body.push(['path', {style: 'stroke:hsla(140, 100%, 50%, 0.3);stroke-width:' + sw + 'px;fill:none;', d: pat.join(' ')}]);
  }
  body.push(...openText);
  const input = ['input', {type: 'file', id: 'inputfile', accept, multiple: '', style: 'display:none'}];
  const svg = genSvg(width, height).concat([defs, body]);
  return ['div', {class: 'wd-progress', id: 'drop-zone'}, svg, input];
};

module.exports = wave;
