/**
 * 命理深算 - 增强脚本
 * 注入玄学风格背景、装饰图、优化视觉体验
 * MutationObserver 持续监听，适配 React 重渲染
 */
(function () {
  "use strict";

  var BG_URL = "https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?w=1200&q=80";
  var applied = new WeakSet();

  function applyEnhancements() {
    // 1. 全局星空背景（只做一次）
    if (!document.body.classList.contains("mystic-bg")) {
      document.body.classList.add("mystic-bg");
      document.documentElement.style.backgroundImage = "url('" + BG_URL + "')";
      document.documentElement.style.backgroundSize = "cover";
      document.documentElement.style.backgroundPosition = "center";
      document.documentElement.style.backgroundAttachment = "fixed";
      document.body.style.background = "linear-gradient(180deg,rgba(15,15,26,0.92),rgba(26,26,46,0.88) 50%,rgba(15,15,26,0.95)),url('" + BG_URL + "')";
      document.body.style.backgroundSize = "cover";
      document.body.style.backgroundPosition = "center";
      document.body.style.backgroundAttachment = "fixed";
    }

    // 2. Header
    var header = document.querySelector("header");
    if (header && !applied.has(header)) {
      header.style.padding = "32px 0 28px";
      header.style.background = "linear-gradient(180deg,rgba(201,169,110,0.08),transparent)";
      header.style.borderBottom = "1px solid rgba(201,169,110,0.15)";
      applied.add(header);
    }

    // 3. 标题
    var h1 = document.querySelector("header h1");
    if (h1 && !applied.has(h1)) {
      h1.style.textShadow = "0 0 30px rgba(201,169,110,0.4),0 0 60px rgba(201,169,110,0.2)";
      h1.style.letterSpacing = "0.08em";
      applied.add(h1);
    }

    // 4. tagline
    var tagline = document.querySelector(".tagline");
    if (tagline && !applied.has(tagline)) {
      tagline.style.letterSpacing = "0.15em";
      tagline.style.color = "rgba(201,169,110,0.6)";
      applied.add(tagline);
    }

    // 5. 卡片
    document.querySelectorAll(".form-card,.result-card").forEach(function (card) {
      if (applied.has(card)) return;
      card.style.backdropFilter = "blur(8px)";
      card.style.background = "rgba(30,30,53,0.85)";
      card.style.boxShadow = "0 8px 32px rgba(0,0,0,0.3),inset 0 1px 0 rgba(201,169,110,0.1)";
      applied.add(card);
    });

    // 6. Tab
    var tabs = document.querySelector(".tabs");
    if (tabs && !applied.has(tabs)) {
      tabs.style.boxShadow = "0 4px 16px rgba(0,0,0,0.2)";
      applied.add(tabs);
    }

    // 7. 分析区域
    document.querySelectorAll(".analysis").forEach(function (el) {
      if (applied.has(el)) return;
      el.style.borderTop = "1px solid rgba(201,169,110,0.2)";
      applied.add(el);
    });

    // 8. 按钮
    document.querySelectorAll(".btn-primary").forEach(function (btn) {
      if (applied.has(btn)) return;
      btn.style.boxShadow = "0 4px 20px rgba(201,169,110,0.3)";
      applied.add(btn);
    });

    // 9. Footer
    var footer = document.querySelector("footer");
    if (footer && !applied.has(footer)) {
      footer.style.borderTop = "1px solid rgba(201,169,110,0.1)";
      footer.style.color = "rgba(201,169,110,0.4)";
      footer.style.letterSpacing = "0.2em";
      applied.add(footer);
    }

    // 10. 六爻爻线修复
    fixYaoLines();

    // 11. 浮动粒子
    if (!document.getElementById("mystic-particles")) {
      var pc = document.createElement("div");
      pc.id = "mystic-particles";
      pc.style.cssText = "position:fixed;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:0;overflow:hidden";
      for (var i = 0; i < 20; i++) {
        var p = document.createElement("div");
        var sz = 2 + Math.random() * 3;
        p.style.cssText = "position:absolute;width:" + sz + "px;height:" + sz + "px;background:radial-gradient(circle,rgba(201,169,110,0.8),transparent);border-radius:50%;left:" + (Math.random() * 100) + "%;top:" + (Math.random() * 100) + "%;animation:twinkle " + (3 + Math.random() * 4) + "s ease-in-out infinite;animation-delay:" + (Math.random() * 5) + "s";
        pc.appendChild(p);
      }
      document.body.appendChild(pc);
    }
  }

  // ============ 六爻爻线修复 ============
  function fixYaoLines() {
    var rows = document.querySelectorAll(".yao-row");
    if (rows.length === 0) return;

    rows.forEach(function (row) {
      var symbol = row.querySelector(".yao-symbol");
      if (!symbol) return;

      // 容器
      symbol.style.display = "flex";
      symbol.style.alignItems = "center";
      symbol.style.justifyContent = "center";
      symbol.style.flex = "1";
      symbol.style.padding = "8px 0";
      symbol.style.letterSpacing = "0";
      symbol.style.fontFamily = "inherit";

      // 爻名
      var name = row.querySelector(".yao-name");
      if (name) {
        name.style.width = "36px";
        name.style.textAlign = "right";
        name.style.paddingRight = "8px";
        name.style.flexShrink = "0";
      }

      // 爻类型
      var type = row.querySelector(".yao-type");
      if (type) {
        type.style.width = "60px";
        type.style.textAlign = "left";
        type.style.paddingLeft = "8px";
        type.style.flexShrink = "0";
      }

      // 行
      row.style.display = "flex";
      row.style.alignItems = "center";
      row.style.gap = "8px";
      row.style.padding = "10px 12px";
      row.style.borderRadius = "8px";
      row.style.marginBottom = "4px";

      // 阳爻
      var yang = symbol.querySelector(".yang-yao");
      if (yang) {
        yang.textContent = "";
        yang.style.display = "block";
        yang.style.width = "100px";
        yang.style.height = "6px";
        yang.style.background = "#c9a96e";
        yang.style.borderRadius = "3px";
        yang.style.boxShadow = "0 0 8px rgba(201,169,110,0.4)";
        yang.style.fontSize = "0";
        yang.style.lineHeight = "0";
      }

      // 阴爻
      var yin = symbol.querySelector(".yin-yao");
      if (yin && !yin.querySelector(".yao-half")) {
        yin.textContent = "";
        yin.style.display = "flex";
        yin.style.alignItems = "center";
        yin.style.justifyContent = "center";
        yin.style.gap = "10px";
        yin.style.width = "100px";
        yin.style.height = "6px";
        yin.style.fontSize = "0";
        yin.style.lineHeight = "0";
        var left = document.createElement("span");
        left.className = "yao-half";
        left.style.cssText = "display:block;width:40px;height:6px;background:#e8e0d0;border-radius:3px";
        var right = document.createElement("span");
        right.className = "yao-half";
        right.style.cssText = "display:block;width:40px;height:6px;background:#e8e0d0;border-radius:3px";
        yin.appendChild(left);
        yin.appendChild(right);
      }
    });
  }

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
      ".yao-row:hover{background:rgba(201,169,110,0.12)!important;transform:translateX(4px)}",
      "header h1{transition:text-shadow .3s ease}",
      "header h1:hover{text-shadow:0 0 40px rgba(201,169,110,0.6),0 0 80px rgba(201,169,110,0.3)!important}",
    ].join("");
    document.head.appendChild(style);
  }

  function startObserver() {
    var root = document.getElementById("root");
    if (!root) return;
    var timer = null;
    var observer = new MutationObserver(function () {
      clearTimeout(timer);
      timer = setTimeout(applyEnhancements, 50);
    });
    observer.observe(root, { childList: true, subtree: true });
    applyEnhancements();
    injectStyles();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", startObserver);
  } else {
    startObserver();
  }
})();
