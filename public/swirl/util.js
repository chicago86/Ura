/* public/swirl/util.js
   Helpers expected by swirl-hero.js:
   rand, randRange, lerp, fadeInOut, TAU, cos, sin
*/
(function (global) {
  "use strict";

  const TAU = Math.PI * 2;

  const cos = Math.cos.bind(Math);
  const sin = Math.sin.bind(Math);

  // [0..n)
  function rand(n) {
    return Math.random() * n;
  }

  // [-n/2 .. +n/2]
  function randRange(n) {
    return n - rand(n * 2);
  }

  // linear interpolation
  function lerp(a, b, t) {
    return a + (b - a) * t;
  }

  // nice alpha curve 0->1->0
  function fadeInOut(t, m) {
    const hm = 0.5 * m;
    return Math.abs(((t + hm) % m) - hm) / hm;
  }

  global.TAU = TAU;
  global.cos = cos;
  global.sin = sin;
  global.rand = rand;
  global.randRange = randRange;
  global.lerp = lerp;
  global.fadeInOut = fadeInOut;
})(typeof window !== "undefined" ? window : this);
