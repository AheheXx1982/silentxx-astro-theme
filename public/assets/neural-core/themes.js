/* SilentXx Neural Core — 8 套主题定义
 * 每套: { id, name, en, config, setup(NC) }
 * loader.js 按日期随机选一套，设置 window.NC_CONFIG / NC_SETUP 后加载 engine.js
 */
/* 全局状态桥：engine.js 状态切换时调用 window.NCOnState(m)（boot/idle/flow/alert）
 * 主题 C「问心剑」用它让涟漪与 flow 剑光（3.2s 周期）精确同步 */
window.__ncMode = 'boot';
window.NCOnState = function (m) {
  window.__ncMode = m;
};

window.NC_THEMES = [
  {
    id: 'a',
    name: '神经球体',
    en: 'Neural Sphere',
    config: {
      colors: { primary: 0x22d3ee, accent: 0x818cf8, alert: 0xf472b6, link: 0x22d3ee },
      bg: ['#081226', '#040a18', '#02040c'],
      swordColor: 0xe0faff,
      dustColor: 0x38bdf8,
      pulseColors: [0xa5f3fc, 0x22d3ee, 0xc084fc],
      breath: 1.6,
      pulseRate: { idle: 1.2, flow: 9, alert: 16 },
      flowSpeed: 0.12,
      swordBoot: true,
      swordOnFlow: true,
      fog: 0.12,
    },
    setup(NC) {
      const N = 240,
        baseR = 2.15;
      for (let i = 0; i < N; i++) {
        const y = 1 - (i / (N - 1)) * 2;
        const r = Math.sqrt(1 - y * y);
        const th = i * 2.399963229728653;
        const rr = baseR * (0.9 + 0.12 * Math.sin(i * 1.7));
        NC.addNode(Math.cos(th) * r * rr, y * rr, Math.sin(th) * r * rr);
      }
      for (let i = 0; i < N; i++)
        for (let j = i + 1; j < N; j++) {
          const a = NC.nodes[i].base,
            b = NC.nodes[j].base;
          const d2 = (a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2 + (a[2] - b[2]) ** 2;
          if (d2 < 1.05 * 1.05) NC.addLink(i, j);
        }
    },
  },
  {
    id: 'b',
    name: '太极环流',
    en: 'Zen Rings',
    config: {
      colors: { primary: 0x22d3ee, accent: 0xfbbf24, alert: 0xf472b6, link: 0xfbbf24 },
      bg: ['#0a1226', '#060d20', '#02040c'],
      swordColor: 0xfde68a,
      dustColor: 0x22d3ee,
      pulseColors: [0x22d3ee, 0xfbbf24, 0xa855f7],
      breath: 1.1,
      pulseRate: { idle: 0.8, flow: 7, alert: 14 },
      flowSpeed: 0.09,
      swordBoot: true,
      swordOnFlow: true,
      fog: 0.1,
    },
    setup(NC) {
      const T = window.THREE;
      const RINGS = [
        { n: 42, r: 1.35, tilt: 0.35, speed: 0.16 },
        { n: 30, r: 2.0, tilt: -0.55, speed: -0.11 },
        { n: 24, r: 2.7, tilt: 0.85, speed: 0.07 },
      ];
      let off = 0;
      const per = [];
      RINGS.forEach((R, ri) => {
        const start = off;
        for (let i = 0; i < R.n; i++) {
          const a = (i / R.n) * Math.PI * 2;
          NC.addNode(Math.cos(a) * R.r, 0, Math.sin(a) * R.r);
          per.push({ idx: off, ring: ri, baseA: a, R });
          off++;
        }
        for (let i = 0; i < R.n; i++) NC.addLink(start + i, start + ((i + 1) % R.n));
      });
      for (let i = 0; i < 26; i++)
        NC.addLink(Math.floor(Math.random() * RINGS[0].n), RINGS[0].n + Math.floor(Math.random() * RINGS[1].n));
      NC.customUpdate = (i, t, activity, n) => {
        const p = per[i];
        if (!p) return null;
        const a = p.baseA + t * p.R.speed;
        const x = Math.cos(a) * p.R.r,
          z = Math.sin(a) * p.R.r;
        const y = Math.sin(a * 2 + p.R.tilt) * 0.22 * (p.R.r / 2.7);
        return [x - n.base[0], y, z - n.base[2]];
      };
      const c2 = new T.Mesh(
        new T.TorusGeometry(0.66, 0.012, 8, 64),
        new T.MeshBasicMaterial({ color: 0xa855f7, transparent: true, opacity: 0.5, blending: T.AdditiveBlending }),
      );
      c2.rotation.x = Math.PI / 2.3;
      NC.scene.add(c2);
      const c3 = new T.Mesh(
        new T.TorusGeometry(0.78, 0.008, 8, 64),
        new T.MeshBasicMaterial({ color: 0x22d3ee, transparent: true, opacity: 0.4, blending: T.AdditiveBlending }),
      );
      c3.rotation.x = Math.PI / 2.3;
      c3.rotation.z = 0.5;
      NC.scene.add(c3);
      NC.extraSpawn = (nc) => {
        nc._rings = [c2, c3];
      };
      const t0 = performance.now();
      setInterval(() => {
        if (!NC._rings) return;
        const k = (performance.now() - t0) / 1000;
        NC._rings[0].rotation.z = k * 0.12;
        NC._rings[1].rotation.z = -k * 0.16;
      }, 33);
    },
  },
  {
    id: 'c',
    name: '问心剑',
    en: 'Sword Spirit',
    config: {
      colors: { primary: 0x67e8f9, accent: 0xc084fc, alert: 0xf472b6, link: 0x22d3ee },
      bg: ['#0d0a24', '#07051a', '#02030c'],
      swordColor: 0xf0fdff,
      dustColor: 0xa855f7,
      pulseColors: [0xe0faff, 0x67e8f9, 0xc084fc],
      breath: 1.4,
      pulseRate: { idle: 1.0, flow: 8, alert: 15 },
      flowSpeed: 0.11,
      swordBoot: true,
      swordOnFlow: true,
      fog: 0.11,
    },
    setup(NC) {
      const T = window.THREE;
      /* ── 剑身：46 节点粒子光剑（锋）── */
      const SWORD_N = 46;
      const per = [];
      for (let i = 0; i < SWORD_N; i++) {
        const yy = (i / (SWORD_N - 1)) * 2.6 - 1.3;
        const w = 0.055 + 0.035 * Math.abs(Math.sin(i * 0.9));
        NC.addNode(Math.sin(i * 1.7) * w, yy, Math.cos(i * 1.7) * w);
        per.push({ i, baseY: yy });
      }
      for (let i = 0; i < SWORD_N - 1; i++) NC.addLink(i, i + 1);

      /* ── 双螺旋：26 节点环绕剑身，留一道断口（执念之环被斩）── */
      const HELIX = 26;
      const GAP_AT = 12; // 断口：第 12→13 段不连线
      const helIdx = [];
      for (let i = 0; i < HELIX; i++) {
        const a = (i / HELIX) * Math.PI * 4;
        const r = 1.5 + 0.5 * Math.sin(i * 1.3);
        NC.addNode(Math.cos(a) * r, (i / HELIX) * 2.8 - 1.4, Math.sin(a) * r);
        helIdx.push(NC.nodes.length - 1);
      }
      for (let i = 0; i < HELIX; i++) {
        if (i === GAP_AT) continue; // 断口：此段斩断
        NC.addLink(helIdx[i], helIdx[(i + 1) % HELIX]);
      }
      for (let i = 0; i < HELIX; i += 2) NC.addLink(helIdx[i], Math.floor(Math.random() * SWORD_N));

      /* ── 剑尖光点（锋之端点）── */
      const tip = new T.Mesh(
        new T.SphereGeometry(0.05, 12, 12),
        new T.MeshBasicMaterial({ color: 0xf0fdff, transparent: true, opacity: 0.95 }),
      );
      tip.position.set(0, 1.55, 0);
      NC.scene.add(tip);

      /* ── 心镜：剑格处水平半透明镜面（以心为镜）── */
      const mirror = new T.Mesh(
        new T.CircleGeometry(0.62, 56),
        new T.MeshBasicMaterial({
          color: 0xc084fc,
          transparent: true,
          opacity: 0.13,
          side: T.DoubleSide,
          blending: T.AdditiveBlending,
          depthWrite: false,
        }),
      );
      mirror.rotation.x = Math.PI / 2;
      mirror.position.set(0, -1.32, 0);
      NC.scene.add(mirror);
      const mirrorRing = new T.Mesh(
        new T.RingGeometry(0.64, 0.72, 56),
        new T.MeshBasicMaterial({
          color: 0x67e8f9,
          transparent: true,
          opacity: 0.35,
          side: T.DoubleSide,
          blending: T.AdditiveBlending,
          depthWrite: false,
        }),
      );
      mirrorRing.rotation.x = Math.PI / 2;
      mirrorRing.position.set(0, -1.3, 0);
      NC.scene.add(mirrorRing);
      const heartCore = new T.Mesh(
        new T.SphereGeometry(0.04, 12, 12),
        new T.MeshBasicMaterial({ color: 0xf0fdff, transparent: true, opacity: 0.9 }),
      );
      heartCore.position.set(0, -1.28, 0);
      NC.scene.add(heartCore);

      /* ── 倒影：镜面下映出剑身下段的反像（镜照剑）── */
      const REFL_N = 8;
      const refl = [];
      for (let i = 0; i < REFL_N; i++) {
        const src = Math.min(SWORD_N - 1, Math.floor((i / (REFL_N - 1)) * (SWORD_N * 0.45)));
        const yy = -1.32 - (per[src].baseY + 1.32) * 0.45;
        const w = 0.055 + 0.035 * Math.abs(Math.sin(src * 0.9));
        const idx = NC.addNode(Math.sin(src * 1.7) * w, yy, Math.cos(src * 1.7) * w);
        refl.push({ src, idx });
      }
      for (let i = 0; i < REFL_N - 1; i++) NC.addLink(refl[i].idx, refl[i + 1].idx);

      /* ── 涟漪：问心之问（flow 剑光 3.2s 周期同步荡开）── */
      const ripples = [];
      for (let q = 0; q < 2; q++) {
        const r = new T.Mesh(
          new T.RingGeometry(1.0, 1.14, 56),
          new T.MeshBasicMaterial({
            color: 0x67e8f9,
            transparent: true,
            opacity: 0,
            side: T.DoubleSide,
            blending: T.AdditiveBlending,
            depthWrite: false,
          }),
        );
        r.rotation.x = Math.PI / 2;
        r.position.set(0, -1.3, 0);
        r.visible = false;
        NC.scene.add(r);
        ripples.push({ mesh: r, active: false, s: 0, o: 0 });
      }

      NC.extraSpawn = (nc) => {
        nc._tip = tip;
        nc._mirror = mirror;
        nc._mirrorRing = mirrorRing;
        nc._heartCore = heartCore;
        nc._ripples = ripples;
      };

      const helStart = helIdx[0];
      NC.customUpdate = (i, t, activity, n) => {
        /* 剑身：震颤如锋鸣 */
        const p = per[i];
        if (p) {
          const drift = Math.sin(t * 1.2 + i * 0.35) * 0.012 * activity;
          return [drift, 0, 0];
        }
        /* 倒影：随剑身镜像轻颤（虚影弱化） */
        for (let ri = 0; ri < refl.length; ri++) {
          if (refl[ri].idx === i) {
            const drift = Math.sin(t * 1.2 + refl[ri].src * 0.35) * 0.012 * activity * 0.8;
            return [drift, 0, 0];
          }
        }
        /* 螺旋：断口节点在剑光时刻被弹开（斩执念），随后衰减归位 */
        if (i >= helStart) {
          const idx = i - helStart;
          if (idx >= GAP_AT && idx <= GAP_AT + 3) {
            const k = t % 3.2;
            const burst = Math.max(0, 1 - Math.abs(k - 0.5) / 0.4);
            if (burst > 0 && window.__ncMode === 'flow') {
              const b = n.base;
              const len = Math.max(0.3, Math.hypot(b[0], b[2]));
              const amp = 0.32 * burst * activity;
              return [(b[0] / len) * amp, 0.06 * amp, (b[2] / len) * amp];
            }
          }
          const wave = 0.02 * Math.sin(t * 0.9 + idx * 0.7) * activity;
          return [wave * Math.sin(idx), wave * Math.cos(idx * 0.6), wave * Math.cos(idx * 1.2)];
        }
        return null;
      };

      const t0 = performance.now();
      let lastBeat = -1;
      setInterval(() => {
        const k = (performance.now() - t0) / 1000;
        /* 剑尖呼吸 */
        const s = 1 + 0.02 * Math.sin(k * 1.8);
        if (NC._tip) NC._tip.scale.setScalar(s);
        /* 镜心心跳（问） */
        if (NC._heartCore) {
          NC._heartCore.scale.setScalar(1 + 0.14 * Math.sin(k * 2.2));
          NC._heartCore.material.opacity = 0.65 + 0.3 * Math.sin(k * 2.2 + 0.5);
        }
        /* 涟漪推进 */
        for (const rp of ripples) {
          if (!rp.active) continue;
          rp.s += 0.075;
          rp.o -= 0.03;
          if (rp.o <= 0) {
            rp.active = false;
            rp.mesh.visible = false;
            continue;
          }
          rp.mesh.scale.setScalar(rp.s);
          rp.mesh.material.opacity = Math.max(0, rp.o);
        }
        /* 与 engine 剑光同周期（flow 每 3.2s 一次）：一剑起，一涟漪 */
        if (window.__ncMode === 'flow') {
          const beat = Math.floor(k / 3.2);
          if (beat !== lastBeat) {
            lastBeat = beat;
            const idle = ripples.find((rp) => !rp.active);
            if (idle) {
              idle.active = true;
              idle.s = 0.4;
              idle.o = 0.85;
              idle.mesh.visible = true;
            }
          }
        } else {
          lastBeat = -1;
        }
      }, 33);
    },
  },
  {
    id: 'd',
    name: '寂静猎手',
    en: 'Signal Hunter',
    config: {
      colors: { primary: 0x3b82f6, accent: 0xfb7185, alert: 0xfb7185, link: 0x60a5fa },
      bg: ['#0a1226', '#060a18', '#02040c'],
      swordColor: 0xbfdbfe,
      dustColor: 0x60a5fa,
      pulseColors: [0x93c5fd, 0x60a5fa, 0xfb7185],
      breath: 1.8,
      pulseRate: { idle: 1.6, flow: 12, alert: 18 },
      flowSpeed: 0.28,
      swordBoot: true,
      swordOnFlow: true,
      fog: 0.16,
    },
    setup(NC) {
      const T = window.THREE;
      const N = 340;
      for (let i = 0; i < N; i++) {
        const y = 1 - (i / (N - 1)) * 2;
        const r = Math.sqrt(1 - y * y);
        const th = i * 2.399963229728653;
        const rr = 1.2 + Math.pow(Math.random(), 1.6) * 2.4;
        NC.addNode(Math.cos(th) * r * rr, y * rr * 0.9, Math.sin(th) * r * rr);
      }
      for (let i = 0; i < N; i++)
        for (let j = i + 1; j < N; j++) {
          const a = NC.nodes[i].base,
            b = NC.nodes[j].base;
          const d2 = (a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2 + (a[2] - b[2]) ** 2;
          if (d2 < 0.72) NC.addLink(i, j);
        }
      for (let k = 0; k < 5; k++) {
        const idx = Math.floor(Math.random() * N);
        let best = idx;
        for (let i = 0; i < N; i++) if (Math.abs(NC.nodes[i].base[1]) < Math.abs(NC.nodes[best].base[1])) best = i;
        NC.addLink(idx, best);
      }
      NC.customUpdate = (i, t, activity, n) => [
        Math.sin(t * 0.8 + i * 0.13) * 0.03 * activity,
        Math.cos(t * 0.6 + i * 0.17) * 0.03 * activity,
        Math.sin(t * 0.7 + i * 0.11) * 0.03 * activity,
      ];
      const cone = new T.Mesh(
        new T.ConeGeometry(0.16, 0.5, 24),
        new T.MeshBasicMaterial({ color: 0xe0faff, transparent: true, opacity: 0.8 }),
      );
      cone.position.y = 0.25;
      NC.scene.add(cone);
      NC.extraSpawn = (nc) => {
        nc._cone = cone;
      };
      const t0 = performance.now();
      setInterval(() => {
        if (!NC._cone) return;
        NC._cone.rotation.y = ((performance.now() - t0) / 1000) * 1.2;
      }, 33);
    },
  },
  {
    id: 'e',
    name: '星空',
    en: 'Starlight',
    config: {
      colors: { primary: 0xfef3c7, accent: 0xfbbf24, alert: 0xf472b6, link: 0x94a3b8 },
      bg: ['#0b1026', '#06081a', '#01020a'],
      swordColor: 0xfff7d6,
      dustColor: 0xe2e8f0,
      pulseColors: [0xfef3c7, 0xfbbf24, 0x93c5fd],
      breath: 1.2,
      pulseRate: { idle: 0.6, flow: 6, alert: 13 },
      flowSpeed: 0.03,
      swordBoot: true,
      swordOnFlow: true,
      fog: 0.05,
    },
    setup(NC) {
      const T = window.THREE;
      const STARS = 420;
      const per = [];
      for (let i = 0; i < STARS; i++) {
        const rr = 1.3 + Math.pow(Math.random(), 1.8) * 2.8;
        const th = Math.random() * Math.PI * 2;
        const ph = Math.acos(2 * Math.random() - 1);
        NC.addNode(Math.sin(ph) * Math.cos(th) * rr, Math.sin(ph) * Math.sin(th) * rr * 0.9, Math.cos(ph) * rr);
        per.push({ i, th, ph, rr, tw: 0.5 + Math.random() * 1.5 });
      }
      for (let i = 0; i < STARS; i++)
        for (let j = i + 1; j < STARS; j++) {
          const a = NC.nodes[i].base,
            b = NC.nodes[j].base;
          const d2 = (a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2 + (a[2] - b[2]) ** 2;
          if (d2 < 0.4) NC.addLink(i, j);
        }
      NC.customUpdate = (i, t, activity, n) => {
        const p = per[i];
        if (!p) return null;
        const w = Math.sin(t * p.tw + p.th * 7) * 0.02 * activity;
        return [w, w * 0.6, -w * 0.8];
      };
      const star = new T.Mesh(new T.SphereGeometry(0.16, 24, 24), new T.MeshBasicMaterial({ color: 0xf0f9ff }));
      NC.scene.add(star);
      const halo2 = new T.Mesh(
        new T.SphereGeometry(0.3, 16, 16),
        new T.MeshBasicMaterial({ color: 0x93c5fd, transparent: true, opacity: 0.25 }),
      );
      NC.scene.add(halo2);
      NC.extraSpawn = (nc) => {
        nc._star = star;
        nc._halo2 = halo2;
      };
      const t0 = performance.now();
      setInterval(() => {
        if (!NC._halo2) return;
        NC._halo2.scale.setScalar(1 + 0.1 * Math.sin(((performance.now() - t0) / 1000) * 1.5));
      }, 33);
    },
  },
  {
    id: 'f',
    name: '极光',
    en: 'Aurora',
    config: {
      colors: { primary: 0x4ade80, accent: 0xa78bfa, alert: 0xfb7185, link: 0x34d399 },
      bg: ['#06281f', '#041a15', '#010b08'],
      swordColor: 0x86efac,
      dustColor: 0x6ee7b7,
      pulseColors: [0x6ee7b7, 0x4ade80, 0xa78bfa],
      breath: 1.7,
      pulseRate: { idle: 1.0, flow: 8, alert: 15 },
      flowSpeed: 0.15,
      swordBoot: true,
      swordOnFlow: true,
      fog: 0.12,
    },
    setup(NC) {
      const T = window.THREE;
      const CURTAINS = [
        { n: 64, r: 2.1, amp: 0.55, hue: 0x4ade80, spd: 0.8 },
        { n: 48, r: 2.7, amp: 0.8, hue: 0xa78bfa, spd: -0.55 },
        { n: 40, r: 3.3, amp: 0.4, hue: 0x2dd4bf, spd: 0.35 },
      ];
      let off = 0;
      const per = [];
      CURTAINS.forEach((C, ci) => {
        const start = off;
        for (let i = 0; i < C.n; i++) {
          const a = (i / C.n) * Math.PI * 2;
          NC.addNode(Math.cos(a) * C.r, 0, Math.sin(a) * C.r);
          per.push({ idx: off, baseA: a, C, ci });
          off++;
        }
        for (let i = 0; i < C.n; i++) NC.addLink(start + i, start + ((i + 1) % C.n));
      });
      for (let i = 0; i < 22; i++)
        NC.addLink(Math.floor(Math.random() * CURTAINS[0].n), CURTAINS[0].n + Math.floor(Math.random() * CURTAINS[1].n));
      NC.customUpdate = (i, t, activity, n) => {
        const p = per[i];
        if (!p) return null;
        const a = p.baseA + t * p.C.spd * 0.1;
        const wave = Math.sin(a * 3 + t * p.C.spd * 2) * p.C.amp * activity;
        const x = Math.cos(a) * p.C.r,
          z = Math.sin(a) * p.C.r;
        return [x - n.base[0], wave - n.base[1], z - n.base[2]];
      };
      const aurCore = new T.Mesh(new T.SphereGeometry(0.28, 32, 32), new T.MeshBasicMaterial({ color: 0x6ee7b7 }));
      NC.scene.add(aurCore);
      const aurHalo = new T.Mesh(
        new T.SphereGeometry(0.6, 24, 24),
        new T.MeshBasicMaterial({ color: 0xa78bfa, transparent: true, opacity: 0.14 }),
      );
      NC.scene.add(aurHalo);
      NC.extraSpawn = (nc) => {
        nc._aurCore = aurCore;
        nc._aurHalo = aurHalo;
      };
      const t0 = performance.now();
      setInterval(() => {
        if (!NC._aurHalo) return;
        NC._aurHalo.scale.setScalar(1 + 0.08 * Math.sin(((performance.now() - t0) / 1000) * 1.2));
      }, 33);
    },
  },
  {
    id: 'g',
    name: '银河系',
    en: 'Galaxy',
    config: {
      colors: { primary: 0x818cf8, accent: 0xc4b5fd, alert: 0xfb7185, link: 0x6366f1 },
      bg: ['#12102e', '#0a0820', '#030212'],
      swordColor: 0xddd6fe,
      dustColor: 0xa5b4fc,
      pulseColors: [0xc4b5fd, 0x818cf8, 0x38bdf8],
      breath: 1.4,
      pulseRate: { idle: 0.9, flow: 7, alert: 14 },
      flowSpeed: 0.1,
      swordBoot: true,
      swordOnFlow: true,
      fog: 0.14,
    },
    setup(NC) {
      const T = window.THREE;
      const ARMS = 2,
        PER_ARM = 60;
      const per = [];
      for (let arm = 0; arm < ARMS; arm++) {
        const phase0 = (arm / ARMS) * Math.PI;
        for (let i = 0; i < PER_ARM; i++) {
          const k = i / (PER_ARM - 1);
          const r = 0.5 + k * 2.8;
          const a = phase0 + k * 3.6;
          const spread = 0.18 + k * 0.3;
          const aa = a + (Math.random() - 0.5) * spread;
          const rr = r + (Math.random() - 0.5) * 0.35;
          const y = (Math.random() - 0.5) * 0.5 * k;
          NC.addNode(Math.cos(aa) * rr, y, Math.sin(aa) * rr);
          per.push({ i, arm, k });
        }
      }
      for (let arm = 0; arm < ARMS; arm++)
        for (let i = 0; i < PER_ARM - 1; i++) NC.addLink(arm * PER_ARM + i, arm * PER_ARM + i + 1);
      for (let i = 0; i < 12; i++)
        NC.addLink(Math.floor(Math.random() * PER_ARM), PER_ARM + Math.floor(Math.random() * PER_ARM));
      NC.customUpdate = (i, t, activity, n) => {
        const p = per[i];
        if (!p) return null;
        const spin = t * 0.12 * (0.5 + activity);
        const x = n.base[0] * Math.cos(spin) - n.base[2] * Math.sin(spin);
        const z = n.base[0] * Math.sin(spin) + n.base[2] * Math.cos(spin);
        const y = n.base[1] + Math.sin(t * 0.5 + i * 0.4) * 0.04 * activity;
        return [x - n.base[0], y - n.base[1], z - n.base[2]];
      };
      const core2 = new T.Mesh(new T.SphereGeometry(0.3, 32, 32), new T.MeshBasicMaterial({ color: 0xe0f2fe }));
      NC.scene.add(core2);
      const disk = new T.Mesh(
        new T.TorusGeometry(0.65, 0.02, 8, 48),
        new T.MeshBasicMaterial({ color: 0x818cf8, transparent: true, opacity: 0.5, blending: T.AdditiveBlending }),
      );
      disk.rotation.x = Math.PI / 2;
      NC.scene.add(disk);
      NC.extraSpawn = (nc) => {
        nc._galCore = core2;
        nc._disk = disk;
      };
      const t0 = performance.now();
      setInterval(() => {
        if (!NC._disk) return;
        NC._disk.rotation.z = ((performance.now() - t0) / 1000) * 0.3;
      }, 33);
    },
  },
  {
    id: 'h',
    name: '黑洞',
    en: 'Black Hole',
    config: {
      colors: { primary: 0xc87030, accent: 0xc9a06a, alert: 0xc04038, link: 0x6a5ac0 },
      bg: ['#07060a', '#040308', '#000000'],
      swordColor: 0xc08850,
      dustColor: 0x8a5a32,
      pulseColors: [0xc87030, 0xc9a06a, 0xc04038],
      breath: 0.7,
      pulseRate: { idle: 0.4, flow: 5, alert: 14 },
      flowSpeed: 0.05,
      swordBoot: true,
      swordOnFlow: true,
      fog: 0.08,
    },
    setup(NC) {
      const T = window.THREE;
      // 隐藏共用 X 形核心与光环（黑洞以黑洞本体为中心，去掉橙色 X 十字干扰）
      if (NC.core) NC.core.visible = false;
      if (NC.coreHalo) NC.coreHalo.visible = false;

      const CLUSTERS = 9;
      const per = [];
      const centers = [];
      const sizes = [];
      for (let c = 0; c < CLUSTERS; c++) {
        const th = Math.random() * Math.PI * 2,
          ph = Math.acos(2 * Math.random() - 1);
        const rr = 1.8 + Math.random() * 2.4;
        centers.push({
          x: Math.sin(ph) * Math.cos(th) * rr,
          y: Math.sin(ph) * Math.sin(th) * rr * 0.8,
          z: Math.cos(ph) * rr,
        });
        const CN = 22 + Math.floor(Math.random() * 14);
        sizes.push(CN);
        for (let i = 0; i < CN; i++) {
          NC.addNode(
            centers[c].x + (Math.random() - 0.5) * 1.1,
            centers[c].y + (Math.random() - 0.5) * 0.9,
            centers[c].z + (Math.random() - 0.5) * 1.1,
          );
          per.push({ c, i });
        }
      }
      let base = 0;
      for (let c = 0; c < CLUSTERS; c++) {
        for (let i = 0; i < sizes[c]; i++)
          for (let j = i + 1; j < sizes[c]; j++) {
            const a = NC.nodes[base + i].base,
              b = NC.nodes[base + j].base;
            const d2 = (a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2 + (a[2] - b[2]) ** 2;
            if (d2 < 0.5) NC.addLink(base + i, base + j);
          }
        base += sizes[c];
      }
      for (let i = 0; i < 14; i++) NC.addLink(Math.floor(Math.random() * 240), Math.floor(Math.random() * 240));
      // 引力涡旋：节点随活动度向中心聚拢（吸积感）
      NC.customUpdate = (i, t, activity, n) => {
        const p = per[i];
        if (!p) return null;
        const c = centers[p.c];
        const dx = Math.sin(t * 0.2 + p.c * 1.7) * 0.06 * activity;
        const dy = Math.cos(t * 0.15 + p.c * 2.3) * 0.06 * activity;
        const pull = -0.02 * activity;
        return [dx + c.x * pull * 0.04, dy + c.y * pull * 0.04, c.z * pull * 0.04];
      };

      // 事件视界：纯黑球体（加大，形成黑洞本体）
      const eh = new T.Mesh(new T.SphereGeometry(0.55, 64, 64), new T.MeshBasicMaterial({ color: 0x000000 }));
      NC.scene.add(eh);

      // 光子环：紧贴事件视界的明亮细环（引力透镜标志，勾出黑洞轮廓）
      const photon = new T.Mesh(
        new T.RingGeometry(0.58, 0.66, 128),
        new T.MeshBasicMaterial({
          color: 0xe2d3b8,
          transparent: true,
          opacity: 0.82,
          blending: T.AdditiveBlending,
          side: T.DoubleSide,
          depthWrite: false,
        }),
      );
      photon.rotation.x = Math.PI / 2.4;
      NC.scene.add(photon);

      // 吸积盘：橙→白热温度梯度 + 多普勒增亮（一侧亮一侧暗）
      const disk = new T.Mesh(
        new T.RingGeometry(0.72, 1.95, 128, 1, 0, Math.PI),
        new T.MeshBasicMaterial({
          color: 0x9a5826,
          transparent: true,
          opacity: 0.38,
          blending: T.AdditiveBlending,
          side: T.DoubleSide,
          depthWrite: false,
        }),
      );
      disk.rotation.x = Math.PI / 2.4;
      NC.scene.add(disk);
      const diskBright = new T.Mesh(
        new T.RingGeometry(0.72, 1.95, 128, 1, Math.PI, Math.PI),
        new T.MeshBasicMaterial({
          color: 0xb8783c,
          transparent: true,
          opacity: 0.58,
          blending: T.AdditiveBlending,
          side: T.DoubleSide,
          depthWrite: false,
        }),
      );
      diskBright.rotation.x = Math.PI / 2.4;
      NC.scene.add(diskBright);
      // 内侧高温盘（亮橙，靠近事件视界最热）
      const hot = new T.Mesh(
        new T.RingGeometry(0.6, 0.78, 96, 1),
        new T.MeshBasicMaterial({
          color: 0xd0a064,
          transparent: true,
          opacity: 0.68,
          blending: T.AdditiveBlending,
          side: T.DoubleSide,
          depthWrite: false,
        }),
      );
      hot.rotation.x = Math.PI / 2.4;
      NC.scene.add(hot);

      // 背景辉光：柔和橙金光晕，衬托黑洞轮廓
      const glow = new T.Mesh(
        new T.SphereGeometry(1.05, 32, 32),
        new T.MeshBasicMaterial({
          color: 0x7c3f1c,
          transparent: true,
          opacity: 0.07,
          blending: T.AdditiveBlending,
          depthWrite: false,
        }),
      );
      NC.scene.add(glow);

      // 吸入粒子流：螺旋坠入事件视界的亮粒子（吸积感）
      const INF = 280;
      const inflowPos = new Float32Array(INF * 3);
      const inflowSeed = [];
      for (let i = 0; i < INF; i++) {
        const r = 0.7 + Math.random() * 2.3;
        const th = Math.random() * Math.PI * 2;
        const y = (Math.random() - 0.5) * 0.55;
        inflowPos[i * 3] = r * Math.cos(th);
        inflowPos[i * 3 + 1] = y;
        inflowPos[i * 3 + 2] = r * Math.sin(th);
        inflowSeed.push({ r, th, y, spd: 0.6 + Math.random() * 1.4 });
      }
      const inflowGeo = new T.BufferGeometry();
      inflowGeo.setAttribute('position', new T.BufferAttribute(inflowPos, 3));
      const inflow = new T.Points(
        inflowGeo,
        new T.PointsMaterial({
          color: 0xc8a078,
          size: 0.032,
          transparent: true,
          opacity: 0.68,
          blending: T.AdditiveBlending,
          depthWrite: false,
        }),
      );
      NC.scene.add(inflow);

      NC.extraSpawn = (nc) => {
        nc._eh = eh;
        nc._photon = photon;
        nc._disk = disk;
        nc._diskBright = diskBright;
        nc._hot = hot;
        nc._glow = glow;
        nc._inflow = inflow;
        nc._inflowGeo = inflowGeo;
        nc._inflowSeed = inflowSeed;
      };

      // 自转 + 粒子螺旋坠落（setInterval 33ms，与引擎同节奏）
      const t0 = performance.now();
      setInterval(() => {
        if (!NC._disk) return;
        const sp = (performance.now() - t0) / 1000;
        NC._photon.rotation.z = sp * 0.7;
        NC._disk.rotation.z = sp * 0.3;
        NC._diskBright.rotation.z = sp * 0.3;
        NC._hot.rotation.z = sp * 0.5;
        const arr = NC._inflowGeo.attributes.position.array;
        for (let i = 0; i < NC._inflowSeed.length; i++) {
          const s = NC._inflowSeed[i];
          s.r -= s.spd * 0.013;
          s.th += s.spd * 0.045;
          if (s.r < 0.56) {
            s.r = 2.5 + Math.random() * 0.8;
            s.y = (Math.random() - 0.5) * 0.55;
          }
          arr[i * 3] = s.r * Math.cos(s.th);
          arr[i * 3 + 1] = s.y;
          arr[i * 3 + 2] = s.r * Math.sin(s.th);
        }
        NC._inflowGeo.attributes.position.needsUpdate = true;
      }, 33);
    },
  },
  {
    id: 'i',
    name: '纯血天蝎',
    en: 'Pure Scorpio',
    config: {
      colors: { primary: 0xff3b5c, accent: 0xa78bfa, alert: 0xf472b6, link: 0xff3b5c },
      bg: ['#0d0817', '#070410', '#020108'],
      swordColor: 0xffd0da,
      dustColor: 0xa78bfa,
      pulseColors: [0xff3b5c, 0xa78bfa, 0xec4899],
      breath: 1.3,
      pulseRate: { idle: 0.8, flow: 8, alert: 15 },
      flowSpeed: 0.1,
      swordBoot: true,
      swordOnFlow: true,
      fog: 0.13,
    },
    setup(NC) {
      const T = window.THREE;
      const per = [];
      // 天蝎座符号 ♏：M 形双峰身体 + 弯尾 + 毒针
      // 身体（三峰两谷勾勒 M 形）
      const BODY = [
        [-1.3, 0.0, 0.0],
        [-0.95, 1.1, 0.05],
        [-0.6, -0.15, 0.0],
        [-0.2, 1.25, 0.05],
        [0.2, -0.15, 0.0],
        [0.6, 1.1, 0.05],
        [0.95, 0.0, 0.0],
      ];
      let prev = -1;
      for (let i = 0; i < BODY.length; i++) {
        const b = BODY[i];
        NC.addNode(b[0], b[1], b[2]);
        per.push({ i: NC.nodes.length - 1 });
        if (prev >= 0) NC.addLink(prev, NC.nodes.length - 1);
        prev = NC.nodes.length - 1;
      }
      // 弯尾：从身体右端向下卷曲，末端向内钩（蝎尾）
      const TAIL = [
        [1.35, -0.35, 0.03],
        [1.55, -0.85, 0.05],
        [1.45, -1.3, 0.02],
        [1.15, -1.5, -0.02],
        [0.85, -1.45, -0.05],
        [0.7, -1.2, -0.03],
        [0.75, -0.95, 0.0],
      ];
      for (let i = 0; i < TAIL.length; i++) {
        const t = TAIL[i];
        NC.addNode(t[0], t[1], t[2]);
        per.push({ i: NC.nodes.length - 1 });
        NC.addLink(prev, NC.nodes.length - 1);
        prev = NC.nodes.length - 1;
      }
      // 毒针：蝎尾末端血红发光球
      const stinger = new T.Mesh(
        new T.SphereGeometry(0.08, 12, 12),
        new T.MeshBasicMaterial({ color: 0xff3b5c, transparent: true, opacity: 0.95 }),
      );
      stinger.position.set(0.75, -0.95, 0.0);
      NC.scene.add(stinger);
      const stingerHalo = new T.Mesh(
        new T.SphereGeometry(0.22, 16, 16),
        new T.MeshBasicMaterial({ color: 0xa78bfa, transparent: true, opacity: 0.2 }),
      );
      stingerHalo.position.copy(stinger.position);
      NC.scene.add(stingerHalo);
      // 星座散星：围绕符号的星点（轻微呼吸）
      const STARS = 44;
      for (let i = 0; i < STARS; i++) {
        const a = Math.random() * Math.PI * 2;
        const r = 1.25 + Math.random() * 1.55;
        NC.addNode(Math.cos(a) * r * 1.2, Math.sin(a) * r * 0.85, (Math.random() - 0.5) * 0.4);
        per.push({ i: NC.nodes.length - 1, star: true });
      }
      NC.extraSpawn = (nc) => {
        nc._stinger = stinger;
        nc._stingerHalo = stingerHalo;
      };
      NC.customUpdate = (i, t, activity, n) => {
        const p = per[i];
        if (!p) return null;
        const w = Math.sin(t * 0.9 + i * 0.21) * 0.015 * activity;
        return [w, w * 0.5, -w * 0.4];
      };
      const t0 = performance.now();
      setInterval(() => {
        if (!NC._stinger || !NC._stingerHalo) return;
        const k = (performance.now() - t0) / 1000;
        const s = 1 + 0.28 * Math.sin(k * 2.4);
        NC._stinger.scale.setScalar(s);
        NC._stingerHalo.scale.setScalar(1 + 0.22 * Math.sin(k * 1.7));
      }, 33);
    },
  },
  {
    id: 'j',
    name: '心流',
    en: 'Flow State',
    config: {
      colors: { primary: 0x38bdf8, accent: 0x818cf8, alert: 0xf472b6, link: 0x22d3ee },
      bg: ['#06121f', '#040b16', '#01040a'],
      swordColor: 0xe0f2fe,
      dustColor: 0x38bdf8,
      pulseColors: [0x38bdf8, 0x818cf8, 0x22d3ee],
      breath: 1.5,
      pulseRate: { idle: 1.0, flow: 10, alert: 15 },
      flowSpeed: 0.18,
      swordBoot: true,
      swordOnFlow: true,
      fog: 0.12,
    },
    setup(NC) {
      const T = window.THREE;
      const per = [];
      // 主螺旋：向上流动的光流
      const SPIRAL_N = 110;
      for (let i = 0; i < SPIRAL_N; i++) {
        const k = i / (SPIRAL_N - 1);
        const a = k * Math.PI * 5;
        const r = 0.5 + k * 1.5;
        const y = -1.4 + k * 2.8;
        NC.addNode(Math.cos(a) * r, y, Math.sin(a) * r);
        per.push({ i, t: 'spiral' });
      }
      for (let i = 0; i < SPIRAL_N - 1; i++) NC.addLink(i, i + 1);
      // 涟漪环：三圈波动
      const RING_N = 3;
      for (let ring = 0; ring < RING_N; ring++) {
        const start = NC.nodes.length;
        const n = 32;
        for (let i = 0; i < n; i++) {
          const a = (i / n) * Math.PI * 2;
          const rr = 1.6 + ring * 0.6;
          NC.addNode(Math.cos(a) * rr, (ring - 1) * 0.7, Math.sin(a) * rr);
          if (i > 0) NC.addLink(start + i - 1, start + i);
          per.push({ i: start + i, t: 'wave' });
        }
        NC.addLink(start + n - 1, start);
      }
      // 核心光球：心流之眼
      const flowCore = new T.Mesh(new T.SphereGeometry(0.3, 32, 32), new T.MeshBasicMaterial({ color: 0x38bdf8 }));
      NC.scene.add(flowCore);
      const flowHalo = new T.Mesh(
        new T.SphereGeometry(0.55, 24, 24),
        new T.MeshBasicMaterial({ color: 0x818cf8, transparent: true, opacity: 0.15 }),
      );
      NC.scene.add(flowHalo);
      NC.extraSpawn = (nc) => {
        nc._flowCore = flowCore;
        nc._flowHalo = flowHalo;
      };
      NC.customUpdate = (i, t, activity, n) => {
        const p = per[i];
        if (!p) return null;
        if (p.t === 'wave') {
          return [0, Math.sin(t * 0.6 + i * 0.2) * 0.06 * activity, 0];
        }
        const spin = t * 0.15 * (0.5 + activity);
        const x = n.base[0] * Math.cos(spin) - n.base[2] * Math.sin(spin);
        const z = n.base[0] * Math.sin(spin) + n.base[2] * Math.cos(spin);
        const y = n.base[1] + Math.sin(t * 0.8 + i * 0.12) * 0.05 * activity;
        return [x - n.base[0], y - n.base[1], z - n.base[2]];
      };
      const t0 = performance.now();
      setInterval(() => {
        if (!NC._flowHalo) return;
        NC._flowHalo.scale.setScalar(1 + 0.12 * Math.sin(((performance.now() - t0) / 1000) * 1.4));
      }, 33);
    },
  },
];

/* 每日选择：日期种子 → 8 套中随机定一套（当天固定，跨天变化） */
window.NC_PickToday = function () {
  const now = new Date();
  const seed = now.getFullYear() * 10000 + (now.getMonth() + 1) * 100 + now.getDate();
  return window.NC_THEMES[seed % window.NC_THEMES.length];
};
