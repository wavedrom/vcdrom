'use strict';

const getWaveql = async (readers) => {
  let waveql;
  const r = readers.find(reader => reader.ext === 'waveql');
  if (r && (r.reader)) {
    // console.log('WaveQL', r);
    const utf8Decoder = new TextDecoder('utf-8');
    waveql = '';
    for (let i = 0; i < 1e5; i++) {
      const { done, value } = await r.reader.read();
      waveql += value ? utf8Decoder.decode(value, {stream: true}) : '';
      if (done) {
        break;
      }
    }
  }
  return waveql;
};

module.exports = getWaveql;
