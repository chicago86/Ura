/* public/swirl/swirl-hero.js */
'use strict';

const particleCount = 650; // можно 400 на слабых ПК/мобилках
const particlePropCount = 9;
const particlePropsLength = particleCount * particlePropCount;
const rangeY = 100;
const baseTTL = 50;
const rangeTTL = 150;
const baseSpeed = 0.1;
const rangeSpeed = 2;
const baseRadius = 1;
const rangeRadius = 4;
const baseHue = 220;
const rangeHue = 100;
const noiseSteps = 8;
const xOff = 0.00125;
const yOff = 0.00125;
const zOff = 0.0005;
const backgroundColor = 'hsla(260,40%,5%,1)';

let container;
let canvas;
let ctx;
let center;
let tick;
let simplex;
let particleProps;

let running = false;
let rafId = 0;

function setup() {
  const ok = createCanvas();
  if (!ok) return;

  resize();
  initParticles();
  draw();
}

function initParticles() {
  tick = 0;
  simplex = new SimplexNoise();
  particleProps = new Float32Array(particlePropsLength);

  for (let i = 0; i < particlePropsLength; i += particlePropCount) {
    initParticle(i);
  }
}

function initParticle(i) {
  const x = rand(canvas.a.width);
  const y = center[1] + randRange(rangeY);
  const vx = 0;
  const vy = 0;
  const life = 0;
  const ttl = baseTTL + rand(rangeTTL);
  const speed = baseSpeed + rand(rangeSpeed);
  const radius = baseRadius + rand(rangeRadius);
  const hue = baseHue + rand(rangeHue);

  particleProps.set([x, y, vx, vy, life, ttl, speed, radius, hue], i);
}

function drawParticles() {
  for (let i = 0; i < particlePropsLength; i += particlePropCount) {
    updateParticle(i);
  }
}

function updateParticle(i) {
  const i2 = 1 + i,
    i3 = 2 + i,
    i4 = 3 + i,
    i5 = 4 + i,
    i6 = 5 + i,
    i7 = 6 + i,
    i8 = 7 + i,
    i9 = 8 + i;

  let x = particleProps[i];
  let y = particleProps[i2];

  const n = simplex.noise3D(x * xOff, y * yOff, tick * zOff) * noiseSteps * TAU;

  const vx = lerp(particleProps[i3], cos(n), 0.5);
  const vy = lerp(particleProps[i4], sin(n), 0.5);

  let life = particleProps[i5];
  const ttl = particleProps[i6];
  const speed = particleProps[i7];
  const radius = particleProps[i8];
  const hue = particleProps[i9];

  const x2 = x + vx * speed;
  const y2 = y + vy * speed;

  drawParticle(x, y, x2, y2, life, ttl, radius, hue);

  life++;

  particleProps[i] = x2;
  particleProps[i2] = y2;
  particleProps[i3] = vx;
  particleProps[i4] = vy;
  particleProps[i5] = life;

  (checkBounds(x2, y2) || life > ttl) && initParticle(i);
}

function drawParticle(x, y, x2, y2, life, ttl, radius, hue) {
  ctx.a.save();
  ctx.a.lineCap = 'round';
  ctx.a.lineWidth = radius;
  ctx.a.strokeStyle = `hsla(${hue},100%,60%,${fadeInOut(life, ttl)})`;
  ctx.a.beginPath();
  ctx.a.moveTo(x, y);
  ctx.a.lineTo(x2, y2);
  ctx.a.stroke();
  ctx.a.closePath();
  ctx.a.restore();
}

function checkBounds(x, y) {
  return x > canvas.a.width || x < 0 || y > canvas.a.height || y < 0;
}

function createCanvas() {
  container = document.querySelector('.hero__bg--swirl');
  if (!container) return false;

  // уже смонтировано
  if (canvas?.b && canvas.b.isConnected) return true;

  canvas = { a: document.createElement('canvas'), b: document.createElement('canvas') };

  canvas.b.style = `
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
  `;
  container.appendChild(canvas.b);

  ctx = { a: canvas.a.getContext('2d'), b: canvas.b.getContext('2d') };
  center = [];
  return true;
}

function resize() {
  if (!container || !canvas || !ctx) return;

  const r = container.getBoundingClientRect();
  const w = Math.max(1, Math.floor(r.width));
  const h = Math.max(1, Math.floor(r.height));

  canvas.a.width = w;
  canvas.a.height = h;

  // сохранить кадр
  ctx.a.drawImage(canvas.b, 0, 0);

  canvas.b.width = w;
  canvas.b.height = h;

  ctx.b.drawImage(canvas.a, 0, 0);

  center[0] = 0.5 * canvas.a.width;
  center[1] = 0.5 * canvas.a.height;
}

function renderGlow() {
  ctx.b.save();
  ctx.b.filter = 'blur(8px) brightness(200%)';
  ctx.b.globalCompositeOperation = 'lighter';
  ctx.b.drawImage(canvas.a, 0, 0);
  ctx.b.restore();

  ctx.b.save();
  ctx.b.filter = 'blur(4px) brightness(200%)';
  ctx.b.globalCompositeOperation = 'lighter';
  ctx.b.drawImage(canvas.a, 0, 0);
  ctx.b.restore();
}

function renderToScreen() {
  ctx.b.save();
  ctx.b.globalCompositeOperation = 'lighter';
  ctx.b.drawImage(canvas.a, 0, 0);
  ctx.b.restore();
}

function draw() {
  if (!running) return;

  tick++;

  ctx.a.clearRect(0, 0, canvas.a.width, canvas.a.height);

  ctx.b.fillStyle = backgroundColor;
  ctx.b.fillRect(0, 0, canvas.a.width, canvas.a.height);

  drawParticles();
  renderGlow();
  renderToScreen();

  rafId = window.requestAnimationFrame(draw);
}

function mount() {
  if (running) return;
  running = true;

  setup();
  window.addEventListener('resize', resize);
}

function unmount() {
  running = false;
  window.removeEventListener('resize', resize);

  if (rafId) {
    cancelAnimationFrame(rafId);
    rafId = 0;
  }

  try {
    if (canvas?.b?.parentNode) canvas.b.parentNode.removeChild(canvas.b);
  } catch (_) {}

  container = null;
  canvas = null;
  ctx = null;
  center = null;
  tick = null;
  simplex = null;
  particleProps = null;
}

window.SwirlHero = { mount, unmount };
