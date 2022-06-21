'use strict';

const renderValues = require('./render-values.js');

const cColors = new Float32Array([
  0, 0, 0, 0, // 0:
  0, 0, 1, 1, // 1: (Z) high impedance

  0, 1, 0, 1, // 2: strong 0
  0, 1, 1, 1, // 3: strong 1
  1, 0, 0, 1, // 4: (x X) strong unknown

  .5, 1, 1, 1, // 5: vec
  1, 1, 0, 1, // 6: yellow
  1, 0, 1, 1, // 7: strange purple

  0, 1, 0, .5, // 8: (l L) weak 0
  0, 1, 1, .5, // 9: (h H) weak 1
  1, 0, 0, .5, // 10: (w W) weak unknown

  0, 0, 0, 0, // 11:
  0, 0, 0, 0, // 12:
  0, 0, 0, 0, // 13:
  0, 0, 0, 0, // 14:
  0, 0, 0, 0  // 15:
]);

const cTilts = new Float32Array([ // 14
  0,  0,  // 0
  1,  -1, // 1
  1,  0,  // 2
  1,  1,  // 3
  -1, -1, // 4
  -1, 0,  // 5
  -1, 1   // 6
]);

const shaderer = (kind, src) => gl => {
  const vShader = gl.createShader(gl[kind]);
  gl.shaderSource(vShader, src);
  gl.compileShader(vShader);
  return vShader;
};

const vertexShaderScalar = shaderer('VERTEX_SHADER', `#version 300 es
in uvec3 pos;
out vec4 v_color;
uniform vec2 scale;
uniform vec2 offset;
uniform vec4 colors[16];
uniform vec2 tilts[7];
uniform float tilt;
void main() {
  v_color = colors[pos.z];
  vec2 node = tilts[pos.y];
  gl_Position = vec4(
    float(pos.x) * scale.x + offset.x + node[1] * tilt,
    float(node[0]) * scale.y + offset.y,
    1, 1
  );
}
`);

const fragmentShader = shaderer('FRAGMENT_SHADER', `#version 300 es
precision mediump float;
in vec4 v_color;
out vec4 myOutputColor;
void main() {
  myOutputColor = v_color;
}
`);

const initProgram = gl => {
  const program = gl.createProgram();
  gl.attachShader(program, vertexShaderScalar(gl));
  gl.attachShader(program, fragmentShader(gl));
  gl.linkProgram(program);
  gl.useProgram(program);

  return 'colors tilts scale offset tilt'
    .split(/\s+/)
    .reduce((res, name) => Object.assign(res, {
      [name]: gl.getUniformLocation(program, name)
    }), {
      pos: gl.getAttribLocation(program, 'pos'),
      gl
    });
};

const bar = [
  (f, t, a, b, c0, c1) => [].concat( // 0
    (f === 1) ? [a, 2, c1] : [],
                [a, 5, c0],
                [b, 5, c0],
    (t  >  1) ? [b, 0, c0] : []
  ),
  (f, t, a, b, c0, c1) => [].concat( // 1
    (f === 0) ? [a, 5, c0] :
    (f  >  1) ? [a, 0, c0] : [],
                [a, 2, c1],
                [b, 2, c1],
    (t  >  1) ? [b, 0, c0] : []
  ),
  (f, t, a, b, c0, c1) => [a, 0, c0, b, 0, c1] // 2 = Z
];

const brick = [
  (f, t, a, b, c0, c1) => [].concat( // 0
    (f === 0) ? [a, 5, c0] :
    (f === 1) ? [a, 1, c1] : [],
                [a, 6, c0],
    (t === 0) ? [b, 5, c0] :
                [b, 4, c0],
    (t === 3) ? [b, 0, c0] : []
  ),
  (f, t, a, b, c0, c1) => [].concat( // 1
    (f === 0) ? [a, 4, c0, a, 3, c1] :
    (f === 1) ? [a, 2, c1] :
    (f === 2) ? [a, 3, c1] :
                [a, 0, c0, a, 3, c1],
    (t === 1) ? [b, 3, c1] :
                [b, 1, c1],
    (t === 3) ? [b, 0, c0] : []
  ),
  (f, t, a, b, c0, c1) => [].concat( // 2
    (f === 0) ? [a, 4, 0] :
    (f === 1) ? [a, 1, 0] :
                [a, 0, 0],
    (t === 0) ? [b, 6, 0, b, 6, c0] :
    (t === 1) ? [b, 3, 0, b, 3, c1, b, 4, c0] :
                [b, 0, 0, b, 0, c0, b, 4, c0],
    (f === 0) ? [a, 4, c0, a, 3, c1] :
    (f === 1) ? [a, 6, c0, a, 1, c1] :
                [a, 6, c0, a, 0, c0, a, 3, c1],
    (t === 0) ? [b, 1, c1, b, 6, c0] :
    (t === 1) ? [b, 3, c1] :
                [b, 1, c1, b, 0, c0]
  )
];

const wave2vertex = desc => {
  Object.keys(desc.chango).map(ref => {

    const chang = desc.chango[ref];
    const { kind, wave } = chang;

    // desc.view.map(lane => {
    // if (!lane || lane.ref === undefined) { return; }
    // const chang = desc.chango[lane.ref];
    // if (chang === undefined) { return; }
    // const {kind, wave} = chang;
    // lane.kind = kind;
    // lane.wave = wave;

    if (kind === 'bit') {
      const vertices = [];
      const ilen = wave.length;
      for (let i = 0; i < ilen; i++) {
        const f = wave[(i === 0) ? 0 : (i - 1)];
        const [tim, val] = wave[i];
        const t = wave[(i === (ilen - 1)) ? i : (i + 1)];
        const tt = (i === (ilen - 1)) ? desc.time : wave[i + 1][0];

        switch (val) {
        case 0: case 1: // 0 1
          vertices.push(...bar[val](f[1], t[1], tim, tt, 2, 3));
          break;
        case 2: case 3: // x X
          vertices.push(...bar[2](f[1], t[1], tim, tt, 4, 4));
          break;
        case 4: case 5: // z Z
          vertices.push(...bar[2](f[1], t[1], tim, tt, 1, 1));
          break;
        case 6: case 7: // u U uninitialized
          vertices.push(...bar[2](f[1], t[1], tim, tt, 6, 6));
          break;
        case 8: case 9: // w W weak unknown
          vertices.push(...bar[2](f[1], t[1], tim, tt, 10, 10));
          break;
        case 10: case 11: // l L
          vertices.push(...bar[0](f[1], t[1], tim, tt, 8, 9));
          break;
        case 12: case 13: // h H
          vertices.push(...bar[1](f[1], t[1], tim, tt, 8, 9));
          break;
        default:
          vertices.push(...bar[2](f[1], t[1], tim, tt, 7, 7));
          console.log(ref, chang);
            // throw new Error('val is: ' + val);
        }
      }

      chang.vertices = new Uint32Array(vertices); // Uint16Array // 16bit

      // lane.vertices = new Uint16Array(vertices);

    }
    if (kind === 'vec') {
      const vertices = [];
      const ilen = wave.length;
      for (let i = 0; i < ilen; i++) {
        // const f = wave[(i === 0) ? 0 : (i - 1)];
        const [tim, val, msk] = wave[i];
        // const t = wave[(i === (ilen - 1)) ? i : (i + 1)];
        const tt = (i === (ilen - 1)) ? desc.time : wave[i + 1][0];

        if (val) {
          if (msk) {
            vertices.push(...brick[2](2, 2, tim, tt, 4, 4)); // x,z?
          } else {
            // vertices.push(...brick[2](2, 2, tim, tt, 5, 5)); // 2
            vertices.push(
              tim, 0, 0,
              tt, 0, 0, tt, 0, 5, tt, 4, 5,
              tim, 6, 5, tim, 0, 5, tim, 3, 5,
              tt, 1, 5, tt, 0, 5
            );
          }
        } else {
          if (msk) {
            vertices.push(...brick[2](2, 2, tim, tt, 4, 4)); // x
          } else {
            // vertices.push(...brick[0](2, 2, tim, tt, 2, 3)); // 0
            vertices.push(tim, 6, 2, tt, 4, 2);
          }
        }
      }

      chang.vertices = new Uint32Array(vertices); // Uint16Array // 16bit

      // lane.vertices = new Uint16Array(vertices);

    }
  });
};

const initData = (loco, desc) => {

  Object.keys(desc.chango).map(ref => {

    const chang = desc.chango[ref];
    const { vertices } = chang;

    // desc.view.map(lane => {
    // if (!lane) {
    //   return;
    // }
    // const vertices = desc.chango[lane.ref].vertices;
    //
    // if (!vertices) {
    //   return;
    // }

    // if (!lane || lane.vertices === undefined) {
    //   return;
    // }
    // const vertices = lane.vertices;

    const gl = loco.gl;
    const vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

    chang.vao = gl.createVertexArray();
    gl.bindVertexArray(chang.vao);
    gl.vertexAttribIPointer(
      loco.pos,
      3, // number of conponents (x, y, z)
      gl.UNSIGNED_INT, // UNSIGNED_SHORT, // 16bit
      0 /* stride */, 0 /* offset */
    );
    gl.enableVertexAttribArray(loco.pos);

    gl.uniform4fv(loco.colors, cColors);
    gl.uniform2fv(loco.tilts, cTilts);
  });
};

const genRenderWavesGL = (view0, sidebar, values) => {

  const cnvs = document.createElement('canvas');
  view0.replaceChildren(cnvs);
  // cnvs.width = 1024;
  // cnvs.height = 1024;
  // cnvs.style = 'background-color: #111;';
  const glProps = {
    premultipliedAlpha: false,
    alpha: true,
    antialias: false,
    depth: false
  };
  const gl = cnvs.getContext('webgl2', glProps);
  const loco = initProgram(gl);

  return desc => {
    // console.log(desc);
    wave2vertex(desc);
    initData(loco, desc);

    return pstate => {
      // console.log(pstate);

      return () => {
        let {width, height, xScale, xOffset, yOffset, yStep, yDuty} = pstate;
        // console.log(width, height);
        cnvs.width = width;
        cnvs.height = height - 40;
        // const xs = pstate.scale;
        // const xo = -1;
        gl.uniform1f(loco.tilt, 3 / width);
        gl.uniform2f(loco.scale, xScale / width, yStep * yDuty / (height - 40) / 2);
        gl.viewport(0, 0, width, height - 40);
        desc.view.map((lane, idx) => {
          if (!lane) { // || lane.vertices === undefined) {
            return;
          }
          const chang = desc.chango[lane.ref];
          if (chang !== undefined) {
            gl.bindVertexArray(chang.vao);
            gl.uniform2f(loco.offset,
              xOffset - 1,
              yOffset + 1 - ((yStep * idx) + 32) / (height - 40)
            );
            gl.drawArrays(
              gl.LINE_STRIP, // mode
              0, // first
              chang.vertices.length / 3 // count
            );
          }
        });
        const gen = renderValues(desc, pstate);
        for (let i = 0; i < 1e6; i++) {
          const iter = gen.next();
          // console.log(iter);
          if (iter.done) {
            values.innerHTML = iter.value;
            break;
          }
        }
        // sidebar.style.top   = -((yOffset * height * 0.5) |0) + 'px';
        // sidebar.style.width = sidebarWidth + 'px';
        // console.log('RENDER!');
      };
    };
  };
};

module.exports = genRenderWavesGL;

/* eslint-env browser */
/* eslint complexity: [1, 30] */
