'use strict';

const lister = require('./lister.js');

const getListing = async (readers) => {
  let listing = [];
  const r = readers.find(reader => reader.ext === 'lst');
  if (r) {
    // console.log('LST', r);
    const utf8Decoder = new TextDecoder('utf-8');
    const list = lister();
    for (let i = 0; i < 10; i++) {
      const { done, value } = await r.reader.read();
      list.onChunk(value ? utf8Decoder.decode(value, {stream: true}) : '');
      if (done) {
        listing = list.getTrace();
        break;
      }
    }
  }
  return listing;
};

module.exports = getListing;
