'use strict';

// JSONL / NDJSON log files
const getJsonls = async (readers) => {
  const jsonls = [];
  const utf8Decoder = new TextDecoder('utf-8');
  for (const r of readers) {
    if ((r.ext !== 'jsonl') && (r.ext !== 'jsonl')) {
      continue;
    }
    // console.log('JSONL', r);
    let tail = '';
    const data = r.data = [];
    let lineNumber = 0;
    for (let i = 0; i < 1e5; i++) {
      const { done, value } = await r.reader.read();
      tail += value ? utf8Decoder.decode(value) : '';
      const lines = tail.split(/\n/);
      // console.log(i, lines.length);
      for (let j = 0; j < (lines.length - 1); j++) {
        lineNumber++;
        try {
          data.push(JSON.parse(lines[j]));
        } catch (err) {
          console.log('line: ' + lineNumber + ' chunk:' + i, lines[j], err);
        }
        tail = lines[lines.length - 1];
      }
      if (done) {
        if (tail === '') {
          break;
        }
        try {
          data.push(JSON.parse(tail));
        } catch (err) {
          console.log(i, 'tail', err);
        }
        break;
      }
    }
    jsonls.push(r);
  }
  // console.log(jsonls);
  return jsonls;
};

module.exports = getJsonls;
