/* SilentXx Neural Core — 共享渲染引擎
 * 用法：HTML 中先定义 window.NC_CONFIG 与 window.NC_SETUP，再 <script type="module" src="./engine.js">
 * NC_SETUP(NC) 中通过 NC.addNode / NC.addLink 布局，用 NC.customUpdate 做每帧定制。
 */
import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
window.THREE = THREE; // 供变体 NC_SETUP 使用

const cfg = Object.assign(
  {
    colors: { primary: 0x22d3ee, accent: 0x818cf8, alert: 0xf472b6, link: 0x22d3ee },
    bg: ['#081226', '#040a18', '#02040c'], // body 背景渐变（三段）
    swordColor: 0xe0faff, // 剑光颜色
    dustColor: 0x38bdf8, // 星尘颜色
    pulseColors: [0xa5f3fc, 0x22d3ee, 0xc084fc],
    breath: 1.6, // 待机呼吸速度
    pulseRate: { idle: 1.2, flow: 9, alert: 16 },
    flowSpeed: 0.12, // 数据流
    swordBoot: true, // boot 是否出现剑光
    swordOnFlow: false, // flow 模式是否周期性出现剑光
    applyBg: true, // 是否修改 body 背景（终端嵌入设 false）
    fog: 0.12,
  },
  window.NC_CONFIG || {},
);

// 应用背景渐变（终端嵌入可关闭）
if (cfg.applyBg && Array.isArray(cfg.bg) && cfg.bg.length >= 3) {
  document.body.style.background = `radial-gradient(ellipse at 50% 45%, ${cfg.bg[0]} 0%, ${cfg.bg[1]} 45%, ${cfg.bg[2]} 100%)`;
}

const canvas = document.getElementById('gl');
const wrap = document.getElementById('core-wrap') || (canvas && canvas.parentElement) || document.body;
const stateEl = document.getElementById('state');

const W = (canvas && (canvas.clientWidth || canvas.width)) || wrap.clientWidth || 300;
const H = (canvas && (canvas.clientHeight || canvas.height)) || wrap.clientHeight || 300;
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
renderer.setSize(W, H, false);
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.toneMapping = THREE.ACESFilmicToneMapping;

const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0x030712, cfg.fog);
const camera = new THREE.PerspectiveCamera(50, W / H, 0.1, 40);
camera.position.set(0, 0, 7.2);

/* ── 中心核心（X 形，所有主题共用）── */
function makeXCore(color, opacity, scale) {
  const g = new THREE.Group();
  const mat = new THREE.MeshBasicMaterial({ color, transparent: opacity < 1, opacity });
  const geo = new THREE.BoxGeometry(0.26, 0.9, 0.12);
  const barA = new THREE.Mesh(geo, mat);
  const barB = new THREE.Mesh(geo, mat);
  barA.rotation.z = Math.PI / 4;
  barB.rotation.z = -Math.PI / 4;
  g.add(barA);
  g.add(barB);
  if (scale) g.scale.setScalar(scale);
  return g;
}
const core = makeXCore(cfg.colors.primary, 1, 1);
scene.add(core);
const coreHalo = makeXCore(0x0ea5b7, 0.16, 1.5);
scene.add(coreHalo);
const coreLight = new THREE.PointLight(cfg.colors.primary, 2.4, 8);
scene.add(coreLight);

/* ── 背景星尘 ── */
const DUST = 1200;
const dustPos = new Float32Array(DUST * 3);
const dustSpd = [];
for (let i = 0; i < DUST; i++) {
  const r = 2.6 + Math.random() * 7;
  const th = Math.random() * Math.PI * 2,
    ph = Math.acos(2 * Math.random() - 1);
  dustPos[i * 3] = r * Math.sin(ph) * Math.cos(th);
  dustPos[i * 3 + 1] = r * Math.sin(ph) * Math.sin(th) * 0.7;
  dustPos[i * 3 + 2] = r * Math.cos(ph);
  dustSpd.push(0.004 + Math.random() * 0.012);
}
const dustGeo = new THREE.BufferGeometry();
dustGeo.setAttribute('position', new THREE.Float32BufferAttribute(dustPos, 3));
const dust = new THREE.Points(
  dustGeo,
  new THREE.PointsMaterial({
    color: cfg.dustColor,
    size: 0.016,
    transparent: true,
    opacity: 0.5,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  }),
);
scene.add(dust);

/* ── 数据流粒子（从外向内汇聚）── */
const FLOW = 220;
const flowPos = new Float32Array(FLOW * 3);
const flowSeed = [];
for (let i = 0; i < FLOW; i++) {
  const r = 2.6 + Math.random() * 6;
  const th = Math.random() * Math.PI * 2,
    ph = Math.acos(2 * Math.random() - 1);
  flowPos[i * 3] = r * Math.sin(ph) * Math.cos(th);
  flowPos[i * 3 + 1] = r * Math.sin(ph) * Math.sin(th) * 0.8;
  flowPos[i * 3 + 2] = r * Math.cos(ph);
  flowSeed.push({ r, th, ph });
}
const flowGeo = new THREE.BufferGeometry();
flowGeo.setAttribute('position', new THREE.Float32BufferAttribute(flowPos, 3));
const flowPts = new THREE.Points(
  flowGeo,
  new THREE.PointsMaterial({
    color: cfg.colors.accent,
    size: 0.02,
    transparent: true,
    opacity: 0.7,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  }),
);
scene.add(flowPts);

/* ── 节点 / 连线（由 NC_SETUP 填充）── */
const NC = {
  cfg,
  scene,
  camera,
  renderer,
  core,
  coreHalo,
  coreLight,
  dust,
  flowPts,
  nodes: [],
  links: [],
  nodeGeo: null,
  nodeMat: null,
  nodePoints: null,
  linkGeo: null,
  linkMat: null,
  linkLines: null,
  customUpdate: null, // (dt, t, activity, grow) => {}
  extraSpawn: null, // 变体额外挂载（mesh 加入 scene）
  addNode(x, y, z) {
    const idx = this.nodes.length;
    this.nodes.push({ base: [x, y, z], phase: Math.random() * Math.PI * 2, amp: 0.05 + Math.random() * 0.08, alive: 0 });
    return idx;
  },
  addLink(a, b) {
    this.links.push({ a, b });
  },
  buildNodes() {
    const N = this.nodes.length;
    if (!N) return;
    const positions = new Float32Array(N * 3);
    const nodeGeo = new THREE.BufferGeometry();
    nodeGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const nodeMat = new THREE.PointsMaterial({
      color: cfg.colors.primary,
      size: 0.045,
      transparent: true,
      opacity: 0.9,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    this.nodeGeo = nodeGeo;
    this.nodeMat = nodeMat;
    this.nodePoints = new THREE.Points(nodeGeo, nodeMat);
    scene.add(this.nodePoints);

    const linkPts = [];
    const L = this.links.length;
    for (let i = 0; i < L; i++) {
      const l = this.links[i];
      linkPts.push(this.nodes[l.a].base[0], this.nodes[l.a].base[1], this.nodes[l.a].base[2]);
      linkPts.push(this.nodes[l.b].base[0], this.nodes[l.b].base[1], this.nodes[l.b].base[2]);
    }
    const linkGeo = new THREE.BufferGeometry();
    linkGeo.setAttribute('position', new THREE.Float32BufferAttribute(linkPts, 3));
    const linkMat = new THREE.LineBasicMaterial({
      color: cfg.colors.link,
      transparent: true,
      opacity: 0.22,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    this.linkGeo = linkGeo;
    this.linkMat = linkMat;
    this.linkLines = new THREE.LineSegments(linkGeo, linkMat);
    scene.add(this.linkLines);
  },
  spawnPulse() {
    if (!this.links.length) return;
    const l = this.links[Math.floor(Math.random() * this.links.length)];
    this.pulses.push({ a: l.a, b: l.b, t: 0, spd: 0.35 + Math.random() * 0.2 });
  },
  pulses: [],
};

/* ── 脉冲网格 ── */
const pulseGeo = new THREE.SphereGeometry(0.035, 8, 8);
const pulseMats = cfg.pulseColors.map((c) => new THREE.MeshBasicMaterial({ color: c }));
const pulseMeshes = [];
for (let i = 0; i < 14; i++) {
  const m = new THREE.Mesh(pulseGeo, pulseMats[i % 3]);
  m.visible = false;
  scene.add(m);
  pulseMeshes.push(m);
}

/* ── 剑光（boot 横扫）── */
const swordPts = [new THREE.Vector3(0, -4, 0.01), new THREE.Vector3(0, 4, 0.01)];
const swordGeo = new THREE.BufferGeometry().setFromPoints(swordPts);
const swordMat = new THREE.LineBasicMaterial({
  color: cfg.swordColor,
  transparent: true,
  opacity: 0,
  blending: THREE.AdditiveBlending,
  depthWrite: false,
});
const sword = new THREE.Line(swordGeo, swordMat);
sword.position.x = 6;
scene.add(sword);
const swordCore = new THREE.Mesh(
  new THREE.SphereGeometry(0.05, 8, 8),
  new THREE.MeshBasicMaterial({ color: cfg.swordColor, transparent: true, opacity: 0 }),
);
scene.add(swordCore);

/* ── Bloom ── */
const composer = new EffectComposer(renderer);
composer.addPass(new RenderPass(scene, camera));
composer.addPass(new UnrealBloomPass(new THREE.Vector2(W, H), 1.15, 0.55, 0.12));

/* ── 状态机 ── */
let MODE = 'boot',
  bootT = 0,
  breath = 0,
  elapsed = 0,
  swordEvent = null;
const STATE_TEXT = { boot: 'NEURAL BOOT', idle: 'NEURAL STANDBY', flow: 'FLOW STATE', alert: 'RISK ALERT' };
function setMode(m) {
  MODE = m;
  document.querySelectorAll('#panel button').forEach((b) => b.classList.remove('on', 'warn'));
  const map = { idle: 'b-idle', flow: 'b-flow', alert: 'b-alert' };
  if (map[m]) {
    const el = document.getElementById(map[m]);
    el.classList.add('on');
    if (m === 'alert') el.classList.add('warn');
  }
  if (stateEl) stateEl.textContent = STATE_TEXT[m] || '';
  if (window.NCOnState) window.NCOnState(m);
}
window.NCSetMode = setMode;
window.NCSetModeReal = setMode;
if (document.getElementById('b-idle')) document.getElementById('b-idle').onclick = () => setMode('idle');
if (document.getElementById('b-flow')) document.getElementById('b-flow').onclick = () => setMode('flow');
if (document.getElementById('b-alert')) document.getElementById('b-alert').onclick = () => setMode('alert');

/* ── 变体布局钩子 ── */
if (typeof window.NC_SETUP === 'function') window.NC_SETUP(NC);
NC.buildNodes();
if (NC.extraSpawn) NC.extraSpawn(NC);
setMode('boot');

const clock = new THREE.Clock();
function animate() {
  requestAnimationFrame(animate);
  const dt = Math.min(clock.getDelta(), 0.05);
  elapsed += dt;
  breath += dt;
  const t = elapsed;

  let activity = 0,
    grow = 1,
    pulseRate = 0;
  if (MODE === 'boot') {
    bootT += dt;
    if (bootT < 3) {
      activity = (bootT / 3) * 0.15;
      grow = 0.1;
    } else if (bootT < 9) {
      const k = (bootT - 3) / 6;
      activity = 0.25 + 0.55 * k;
      grow = 0.1 + 0.9 * k;
      pulseRate = 2 + k * 5;
    } else if (bootT < 12) {
      activity = 0.85 + 0.15 * Math.sin(t * 2.2);
      pulseRate = 9;
    } else if (bootT < 15) {
      activity = 1.0;
      pulseRate = 10;
      if (!swordEvent && cfg.swordBoot) swordEvent = { x: -5 };
    } else {
      activity = Math.max(0.15, 1.0 - (bootT - 15) / 3);
      pulseRate = 1;
      if (bootT > 17.5) {
        bootT = 0;
        swordEvent = null;
      }
    }
  } else if (MODE === 'idle') {
    activity = 0.2 + 0.1 * Math.sin(t * 0.7);
    pulseRate = cfg.pulseRate.idle;
  } else if (MODE === 'flow') {
    activity = 0.8 + 0.2 * Math.sin(t * 2.6);
    pulseRate = cfg.pulseRate.flow;
  } else if (MODE === 'alert') {
    activity = 0.55 + 0.45 * Math.abs(Math.sin(t * 5.2));
    pulseRate = cfg.pulseRate.alert;
  }

  /* 核心呼吸 */
  const breathScale = 1 + 0.06 * Math.sin(breath * (MODE === 'alert' ? 6.5 : cfg.breath));
  core.scale.setScalar(Math.max(0.5, activity) * breathScale);
  coreHalo.scale.setScalar(Math.max(0.6, activity) * breathScale * 1.5);
  coreLight.intensity = 1.2 + activity * 2.6;
  const coreColor = MODE === 'alert' ? cfg.colors.alert : cfg.colors.primary;
  core.traverse((o) => {
    if (o.isMesh) o.material.color.setHex(coreColor);
  });
  coreHalo.traverse((o) => {
    if (o.isMesh) o.material.color.setHex(MODE === 'alert' ? cfg.colors.alert : 0x0ea5b7);
  });

  /* 节点呼吸（变体可覆盖） */
  if (NC.nodeGeo && NC.nodes.length) {
    const posAttr = NC.nodeGeo.attributes.position;
    const custom = NC.customUpdate;
    for (let i = 0; i < NC.nodes.length; i++) {
      const n = NC.nodes[i];
      n.alive = Math.min(1, n.alive + dt * (grow * 1.5 + 0.3));
      let x = n.base[0] * n.alive,
        y = n.base[1] * n.alive,
        z = n.base[2] * n.alive;
      if (custom) {
        const r = custom(i, t, activity, n);
        if (r) {
          x += r[0];
          y += r[1];
          z += r[2];
        }
      } else {
        const wave = n.amp * Math.sin(t * 1.4 + n.phase) * activity;
        x += wave * Math.sin(n.phase);
        y += wave * Math.cos(n.phase * 0.7);
        z += wave * Math.sin(n.phase * 1.3);
      }
      posAttr.array[i * 3] = x;
      posAttr.array[i * 3 + 1] = y;
      posAttr.array[i * 3 + 2] = z;
    }
    posAttr.needsUpdate = true;
    NC.nodeMat.opacity = 0.25 + activity * 0.7;
    if (NC.linkMat) NC.linkMat.opacity = 0.05 + activity * 0.3;
  }

  /* 数据流 */
  const fp = flowGeo.attributes.position.array;
  for (let i = 0; i < FLOW; i++) {
    const s = flowSeed[i];
    const rr = Math.max(0.7, s.r - ((t * cfg.flowSpeed) % (s.r - 0.7)));
    const th = s.th + t * 0.12;
    fp[i * 3] = rr * Math.sin(s.ph) * Math.cos(th);
    fp[i * 3 + 1] = rr * Math.sin(s.ph) * Math.sin(th) * 0.8;
    fp[i * 3 + 2] = rr * Math.cos(s.ph);
  }
  fp.needsUpdate = true;
  flowPts.material.opacity = 0.2 + activity * 0.55;

  /* 星尘 */
  const dp = dustGeo.attributes.position.array;
  for (let i = 0; i < DUST; i++) {
    dp[i * 3] += dustSpd[i] * 0.5;
    if (dp[i * 3] > 10) dp[i * 3] = -10;
  }
  dp.needsUpdate = true;

  /* 脉冲 */
  if (Math.random() < dt * pulseRate) NC.spawnPulse();
  const maxPulses = Math.min(pulseMeshes.length, Math.max(2, Math.floor(pulseRate * 1.5)));
  for (let i = NC.pulses.length - 1; i >= 0; i--) {
    NC.pulses[i].t += dt * NC.pulses[i].spd * (0.6 + activity);
    if (NC.pulses[i].t >= 1) NC.pulses.splice(i, 1);
  }
  while (NC.pulses.length > maxPulses) NC.pulses.shift();
  for (let i = 0; i < pulseMeshes.length; i++) {
    const m = pulseMeshes[i];
    if (i < NC.pulses.length) {
      const p = NC.pulses[i],
        na = NC.nodes[p.a].base,
        nb = NC.nodes[p.b].base;
      m.position.set(na[0] + (nb[0] - na[0]) * p.t, na[1] + (nb[1] - na[1]) * p.t, na[2] + (nb[2] - na[2]) * p.t);
      m.visible = true;
      m.material.opacity = 0.9 * Math.sin(Math.PI * p.t) * activity;
    } else m.visible = false;
  }

  /* 剑光：boot 一次 + flow 周期性（可选） */
  if (MODE === 'flow' && cfg.swordOnFlow) {
    // flow 模式：每 3.2 秒一次剑光
    if (Math.floor(t / 3.2) !== Math.floor((t - dt) / 3.2)) swordEvent = { x: -5 };
  }
  if (swordEvent && (cfg.swordBoot || MODE === 'flow')) {
    swordEvent.x += dt * 10;
    if (swordEvent.x < 5) {
      sword.position.x = swordEvent.x;
      const fade = Math.sin(Math.min(1, Math.max(0, (swordEvent.x + 5) / 10)) * Math.PI);
      swordMat.opacity = 0.95 * fade;
      swordCore.position.set(swordEvent.x, 0, 0.1);
      swordCore.material.opacity = fade;
      swordCore.visible = true;
    } else {
      swordMat.opacity = 0;
      swordCore.visible = false;
      swordEvent = null;
    }
  } else {
    swordMat.opacity = 0;
    swordCore.visible = false;
  }

  /* 相机微动 */
  camera.position.x = Math.sin(t * 0.06) * 0.35;
  camera.position.y = Math.cos(t * 0.05) * 0.2;
  camera.lookAt(0, 0, 0);

  composer.render();
}
animate();

window.addEventListener('resize', () => {
  const w = (canvas && (canvas.clientWidth || canvas.width)) || wrap.clientWidth || 300;
  const h = (canvas && (canvas.clientHeight || canvas.height)) || wrap.clientHeight || 300;
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
  renderer.setSize(w, h, false);
  composer.setSize(w, h);
});
