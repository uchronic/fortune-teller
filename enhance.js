/**
 * 命理深算 - 增强脚本
 * 注入玄学风格背景、装饰图、优化视觉体验
 * MutationObserver 持续监听，适配 React 重渲染
 */
(function () {
  "use strict";

  // ============ 图片资源 ============
  const BG_URL = "https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?w=1200&q=80";
  const HEADER_BG = "https://images.unsplash.com/photo-1462332420958-a05d1e002413?w=800&q=80";
  const CARD_BG = "https://images.unsplash.com/photo-1534796636912-3b95b3ab5986?w=600&q=80";

  const applied = new WeakSet();

  // ============ 注入所有增强 ============
  function applyEnhancements() {
    var app = document.querySelector(".app");
    if (!app || applied.has(app)) return;
    applied.add(app);

    // 1. 全局星空背景
    document.documentElement.style.backgroundImage =
      "url('" + BG_URL + "')";
    document.documentElement.style.backgroundSize = "cover";
    document.documentElement.style.backgroundPosition = "center";
    document.documentElement.style.backgroundAttachment = "fixed";
    document.body.style.background =
      "linear-gradient(180deg, rgba(15,15,26,0.92) 0%, rgba(26,26,46,0.88) 50%, rgba(15,15,26,0.95) 100%), url('" +
      BG_URL + "')";
    document.body.style.backgroundSize = "cover";
    document.body.style.backgroundPosition = "center";
    document.body.style.backgroundAttachment = "fixed";

    // 2. Header 背景叠加
    var header = document.querySelector("header");
    if (header) {
      header.style.position = "relative";
      header.style.padding = "32px 0 28px";
      header.style.background =
        "linear-gradient(180deg, rgba(201,169,110,0.08), transparent)";
      header.style.borderBottom = "1px solid rgba(201,169,110,0.15)";
    }

    // 3. 给标题添加装饰
    var h1 = document.querySelector("header h1");
    if (h1) {
      h1.style.textShadow = "0 0 30px rgba(201,169,110,0.4), 0 0 60px rgba(201,169,110,0.2)";
      h1.style.letterSpacing = "0.08em";
    }

    // 4. tagline 增强
    var tagline = document.querySelector(".tagline");
    if (tagline) {
      tagline.style.letterSpacing = "0.15em";
      tagline.style.color = "rgba(201,169,110,0.6)";
    }

    // 5. 表单卡片装饰
    document.querySelectorAll(".form-card, .result-card").forEach(function (card) {
      if (applied.has(card)) return;
      card.style.position = "relative";
      card.style.overflow = "hidden";
      card.style.backdropFilter = "blur(8px)";
      card.style.background = "rgba(30,30,53,0.85)";
      card.style.boxShadow = "0 8px 32px rgba(0,0,0,0.3), inset 0 1px 0 rgba(201,169,110,0.1)";
      applied.add(card);
    });

    // 6. Tab 栏增强
    var tabs = document.querySelector(".tabs");
    if (tabs && !applied.has(tabs)) {
      tabs.style.boxShadow = "0 4px 16px rgba(0,0,0,0.2)";
      applied.add(tabs);
    }

    // 7. 分析区域增强
    document.querySelectorAll(".analysis").forEach(function (el) {
      if (applied.has(el)) return;
      el.style.borderTop = "1px solid rgba(201,169,110,0.2)";
      applied.add(el);
    });

    // 8. 按钮增强
    document.querySelectorAll(".btn-primary").forEach(function (btn) {
      if (applied.has(btn)) return;
      btn.style.boxShadow = "0 4px 20px rgba(201,169,110,0.3)";
      btn.style.textShadow = "0 1px 2px rgba(0,0,0,0.3)";
      applied.add(btn);
    });

    // 9. Footer 增强
    var footer = document.querySelector("footer");
    if (footer && !applied.has(footer)) {
      footer.style.borderTop = "1px solid rgba(201,169,110,0.1)";
      footer.style.color = "rgba(201,169,110,0.4)";
      footer.style.letterSpacing = "0.2em";
      applied.add(footer);
    }

    // 10. 添加浮动装饰粒子
    if (!document.getElementById("mystic-particles")) {
      var particleContainer = document.createElement("div");
      particleContainer.id = "mystic-particles";
      particleContainer.style.cssText =
        "position:fixed;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:0;overflow:hidden";
      for (var i = 0; i < 20; i++) {
        var p = document.createElement("div");
        var size = 2 + Math.random() * 3;
        p.style.cssText =
          "position:absolute;width:" + size + "px;height:" + size + "px;" +
          "background:radial-gradient(circle,rgba(201,169,110,0.8),transparent);" +
          "border-radius:50%;left:" + (Math.random() * 100) + "%;" +
          "top:" + (Math.random() * 100) + "%;" +
          "animation:twinkle " + (3 + Math.random() * 4) + "s ease-in-out infinite;" +
          "animation-delay:" + (Math.random() * 5) + "s";
        particleContainer.appendChild(p);
      }
      document.body.appendChild(particleContainer);
    }
  }

  // ============ 注入动画样式 ============
  function injectStyles() {
    if (document.getElementById("mystic-enhance-styles")) return;
    var style = document.createElement("style");
    style.id = "mystic-enhance-styles";
    style.textContent = [
      "@keyframes twinkle{0%,100%{opacity:0.2;transform:scale(1)}50%{opacity:1;transform:scale(1.5)}}",
      "@keyframes glowPulse{0%,100%{box-shadow:0 0 20px rgba(201,169,110,0.1)}50%{box-shadow:0 0 30px rgba(201,169,110,0.25)}}",
      ".form-card,.result-card{animation:fadeIn .5s ease-out}",
      "@keyframes fadeIn{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}",
      ".palace{transition:all .3s ease}",
      ".palace:hover{background:rgba(201,169,110,0.12)!important;border-color:rgba(201,169,110,0.4)!important;transform:translateY(-2px)}",
      ".pillar{transition:all .3s ease}",
      ".pillar:hover{background:rgba(201,169,110,0.15)!important;transform:translateY(-3px);box-shadow:0 4px 16px rgba(201,169,110,0.2)}",
      ".star.major{animation:glowPulse 3s ease-in-out infinite}",
      ".btn-primary{transition:all .2s ease}",
      ".btn-primary:hover{transform:translateY(-2px);box-shadow:0 8px 28px rgba(201,169,110,0.4)!important}",
      ".tabs button{transition:all .25s ease}",
      ".tabs button:hover{background:rgba(201,169,110,0.15)}",
      ".yao-row{transition:all .3s ease}",
      ".yao-row:hover{background:rgba(201,169,110,0.12)!important}",
      "header h1{transition:text-shadow .3s ease}",
      "header h1:hover{text-shadow:0 0 40px rgba(201,169,110,0.6),0 0 80px rgba(201,169,110,0.3)!important}",
    ].join("");
    document.head.appendChild(style);
  }

  // ============ MutationObserver ============
  function startObserver() {
    var root = document.getElementById("root");
    if (!root) return;

    var timer = null;
    var observer = new MutationObserver(function () {
      clearTimeout(timer);
      timer = setTimeout(applyEnhancements, 80);
    });

    observer.observe(root, { childList: true, subtree: true });
    applyEnhancements();
    injectStyles();
  }

  // ============ 启动 ============
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", startObserver);
  } else {
    startObserver();
  }
})();
