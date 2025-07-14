'use strict';

const getExt = require('./get-ext.js');
const urlRaw = require('./url-raw.js');

const vcdInUrl = (extentions) => {
  const urlSearchParams = new URLSearchParams(window.location.search);
  for (const [key, val] of urlSearchParams) {
    const basePath = urlRaw[key];
    if (basePath) {
      const ext = getExt(val);
      if (extentions.includes(ext)) {
        if ((basePath !== '.')) {
          return basePath + '/' + val;
        }
        const loc = window.location;
        return loc.origin + loc.pathname + val;
      }
    }
  }
};

module.exports = vcdInUrl;

/* eslint-env browser */
