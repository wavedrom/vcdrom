'use strict';

const get = require('lodash.get');

exports.parser = wires => str => {
  const arr = str.split('\n');
  const path = [];
  const labelo = {};
  let nRow;
  let mat;

  const res = arr.map((row, rowIdx) => {
    row = row.trim();

    // Section with Parentheses

    if (row[0] === '(') {
      const cols = row.slice(1).split(/\s+/);
      if (cols[0] === 'DIZ') {

        const levelo = get(wires, path, false);

        const arg1 = cols[1]; // commits

        const othero = Object.keys(levelo).reduce((res, key) => {
          const m = key.match(arg1);
          if (m) {
            const id = m.groups.id;
            const name = m[0];
            const desc = {name, m, ref: levelo[name]};
            const role = m.groups.valid ? 'valid' : m.groups.addr ? 'addr' : 'undef';
            res[id] = res[id] || {};
            res[id][role] = desc;
          }
          return res;
        }, {});

        console.log(othero);

        const arg2 = cols[2]; // pipeline stages
        const keys = Object.keys(levelo).filter(key => key.match(arg2));

        const signals = keys.map(key => ({
          name: key,
          label: (key.match(arg2)[1] || key).toUpperCase(),
          ref: levelo[key]
        }));

        nRow = {kind: 'DIZ', idx: rowIdx, regexp: arg2, signals, othero, clock: {name: 'clock', ref: levelo.clock}};
        return nRow;
      }
    }

    if (row[0] === ')') {
      if (nRow !== undefined) {
        nRow.len = rowIdx - nRow.idx + 1;
        nRow = undefined;
      }
      return {};
    }

    const rowo = {};
    const cols = row.split(/\s+/);
    cols.map(col => {
      if (col === '...') { path.pop(); path.pop(); return; }
      if (col === '..')  { path.pop(); return; }
      if (col === '.')   { return; }
      if (col === '/')   { path.length = 0; return; }

      mat = col.match(/^:(\S+)$/); if (mat) {
        labelo[mat[1]] = rowo;
        return;
      }

      mat = col.match(/^(\{)([^}]+)(\})$/); if (mat) {
        const a = mat[2];
        const b = a.split(',');
        rowo.kind = 'brace';
        rowo.body = b.reduce((res, e) => {
          const ee = e.split(':');
          if (ee.length === 2) {
            const key = ee[0];
            const val = labelo[ee[1]] || Number(ee[1]);
            res[key] = val;
          } else
          if (ee.length === 1) {
            res[ee[0]] = labelo[ee[0]] || {};
          } else {
            console.error(ee);
          }
          return res;
        }, {});
        return;
      }

      mat = col.match(/^%([<>^])?([+-])?([su])?([bodhHac])$/); if (mat) {
        rowo.format = {
          align: mat[1],
          plus:  mat[2],
          sign:  mat[3],
          radix: mat[4]
        };
        return;
      }

      const newPath = path.concat(col);
      const ref = get(wires, newPath, false);

      if (typeof ref === 'string') {
        rowo.name = col;
        rowo.ref = ref;
      } else
      if (typeof ref === 'object') {
        path.push(col);
      }
    });
    return rowo;
  });
  return res;
};

exports.cmMode = function(CodeMirror, desc) {
  const { wires } = desc;
  CodeMirror.defineMode('waveql', function() {
    return {
      startState: function() {
        return {path: []};
      },
      token: function (stream, stt) {
        // const line = stream.lineOracle.line;
        let mat;

        if (stream.eatSpace()) { return null; }

        mat = stream.match(/^\.\.\.(\s+|$)/); if (mat) { stt.path.pop(); stt.path.pop(); return 'punct'; }
        mat = stream.match(/^\.\.(\s+|$)/);   if (mat) { stt.path.pop(); return 'punct'; }
        mat = stream.match(/^\.(\s+|$)/);     if (mat) { return 'punct'; }
        mat = stream.match(/^\/(\s+|$)/);     if (mat) { stt.path.length = 0; return 'punct'; }

        mat = stream.match(/^:(\S+)(\s+|$)/); if (mat) {
          return 'label';
        }

        mat = stream.match(/^\{[^}]+\}(\s+|$)/); if (mat) {
          return 'mark';
        }

        mat = stream.match(/^%([<>^])?([+-])?([su])?([bodhHac])(\s+|$)/); if (mat) {
          return 'format';
        }

        mat = stream.match(/^(\S+)(\s+|$)/); if (mat) {
          const sigName = mat[1];
          const newPath = stt.path.concat(sigName);
          const ref = get(wires, newPath, false);
          if (typeof ref === 'string') {
            return 'signal';
          }
          if (typeof ref === 'object') {
            stt.path = newPath;
            return 'path';
          }
          return 'comment';
        }
      }
    };
  });
  CodeMirror.defineMIME('text/x-waveql', 'waveql');
};

exports.cmHint = (CodeMirror, desc) => {
  const { wires } = desc;
  return async (cm /*, options */) => {
    const cursor = cm.getCursor();
    const token = cm.getTokenAt(cursor);
    const line = cm.getLine(cursor.line);
    let start = cursor.ch;
    let end = cursor.ch;
    while (start && /\w/.test(line.charAt(start - 1))) --start;
    while (end < line.length && /\w/.test(line.charAt(end))) ++end;
    const cur = token.string.trim();
    const list = get(wires, token.state.path, {});
    const alls = ['/', '..'].concat(Object.keys(list));
    const hints = alls.filter(e => e.match(cur));
    // console.log(token);
    return {
      list: hints,
      from: CodeMirror.Pos(cursor.line, start),
      to: CodeMirror.Pos(cursor.line, end)
    };
  };
};
