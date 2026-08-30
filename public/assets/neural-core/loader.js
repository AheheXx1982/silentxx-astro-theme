/* SilentXx Neural Core — 终端加载器
 * 用法：<script src="/assets/neural-core/themes.js"></script><script src="/assets/neural-core/loader.js"></script>
 * 自动：创建 importmap → 选今日主题 → 动态 import engine.js → 引擎渲染到 #nc-canvas
 * 地球模式：window.NCSetEarth(true/false)
 * 状态联动：window.NCSetMode('idle'|'flow'|'alert') — Hermes/TWS 联动预留
 * 手动换主题：window.NCSetTheme('a'..'h') — localStorage 记忆，刷新生效
 */
(function () {
  var KEY = 'ncThemeManual';
  var earthMode = false;
  var engineReady = false;
  var wrap = null;
  var canvas = null;

  function ensureImportMap() {
    if (document.querySelector('script[type="importmap"]')) return;
    var im = document.createElement('script');
    im.type = 'importmap';
    im.textContent = JSON.stringify({
      imports: {
        three: 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js',
        'three/addons/': 'https://cdn.jsdelivr.net/npm/three@0.160.0/examples/jsm/',
      },
    });
    document.head.appendChild(im);
  }

  function pickTheme() {
    var manual = null;
    try {
      manual = localStorage.getItem(KEY) || null;
    } catch (e) {}
    if (manual) {
      for (var i = 0; i < window.NC_THEMES.length; i++) if (window.NC_THEMES[i].id === manual) return window.NC_THEMES[i];
    }
    return window.NC_PickToday();
  }

  function boot() {
    if (engineReady) return;
    engineReady = true;

    var core = document.querySelector('.jv-core');
    if (!core) return;
    wrap = document.createElement('div');
    wrap.id = 'nc-wrap';
    wrap.style.cssText =
      'position:absolute;inset:0;display:flex;align-items:center;justify-content:center;pointer-events:none;z-index:3;opacity:1;transition:opacity .6s ease;';
    canvas = document.createElement('canvas');
    canvas.id = 'gl';
    canvas.style.cssText = 'width:min(380px,74%);aspect-ratio:1;border-radius:50%;display:block;';
    wrap.appendChild(canvas);
    core.appendChild(wrap);

    var theme = pickTheme();
    window.NC_CONFIG = theme.config;
    window.NC_CONFIG.applyBg = false; // 终端背景保持原有
    window.NC_SETUP = theme.setup;
    if (earthMode) wrap.style.opacity = '0';

    ensureImportMap();
    var base =
      document.currentScript && document.currentScript.src
        ? document.currentScript.src.replace(/[^/]*$/, '')
        : '/assets/neural-core/';
    // NC 模式默认隐藏地球层（金色轨道黄虚线），避免透出在核心后方
    setEarthLayer(!earthMode);
    // 等 importmap 就位后再动态 import
    setTimeout(function () {
      import(base + 'engine.js?v=2').catch(function (err) {
        console.error('[NeuralCore] engine load failed', err);
      });
    }, 50);
  }

  function setEarthLayer(hidden) {
    // Neural Core 模式：彻底隐藏地球层（含金色轨道黄虚线），避免透出
    var ew = document.querySelector('.jv-earth-wrap');
    if (ew) ew.style.display = hidden ? 'none' : '';
  }
  window.NCInit = boot;
  window.NCSetEarth = function (on) {
    earthMode = !!on;
    if (wrap) wrap.style.opacity = earthMode ? '0' : '1';
    setEarthLayer(!earthMode); // NC 开 → 隐藏地球；地球模式 → 显示
  };
  window.NCGetEarth = function () {
    return earthMode;
  };
  window.NCSetTheme = function (id) {
    try {
      localStorage.setItem(KEY, id);
    } catch (e) {}
    // 切换主题的重载不应重播开机视频（正常刷新/冷启动仍播放）
    try {
      sessionStorage.setItem('ncSkipIntro', '1');
    } catch (e) {}
    location.reload();
  };
  window.NCSetMode = function (m) {
    if (window.NCSetModeReal) window.NCSetModeReal(m);
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
