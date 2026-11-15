/* =========================================================
   Shared behaviour for every page.
   All editable text/photos/config live in /content.json —
   this file just fetches it and renders each page.
   ========================================================= */
(function () {
  "use strict";

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const page = document.body.getAttribute("data-page") || "";

  /* ---------- helpers ---------- */
  function getPath(obj, path) {
    return path.split(".").reduce((o, k) => (o && o[k] !== undefined ? o[k] : undefined), obj);
  }
  function interpolate(str, site) {
    if (typeof str !== "string" || !site) return str;
    return str.replace(/\{\{(\w+)\}\}/g, (_, k) => (site[k] !== undefined ? site[k] : ""));
  }
  function el(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  }

  /* ---------- 1. Ambient floating hearts & sparkles ---------- */
  function spawnAmbient(container, count) {
    if (!container || reduceMotion) return;
    const glyphs = ["heart", "sparkle", "star", "balloon", "ribbon"];
    for (let i = 0; i < count; i++) {
      const span = document.createElement("span");
      span.className = "ambient-bit";
      const name = glyphs[Math.floor(Math.random() * glyphs.length)];
      span.innerHTML = '<svg><use href="#icon-' + name + '"></use></svg>';
      span.style.left = Math.random() * 100 + "%";
      span.style.setProperty("--dur", 8 + Math.random() * 10 + "s");
      span.style.setProperty("--delay", Math.random() * 10 + "s");
      span.style.setProperty("--drift", (Math.random() * 80 - 40) + "px");
      span.style.setProperty("--size", 0.7 + Math.random() * 1.4 + "rem");
      span.style.opacity = 0.35 + Math.random() * 0.5;
      container.appendChild(span);
    }
  }

  /* ---------- 2. Scroll reveal (call again after dynamic content is added) ---------- */
  function initReveal() {
    const items = document.querySelectorAll(".reveal:not([data-reveal-bound])");
    if (!items.length) return;
    items.forEach((it) => it.setAttribute("data-reveal-bound", "1"));
    if (reduceMotion) {
      items.forEach((it) => it.classList.add("in-view"));
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("in-view");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 }
    );
    items.forEach((it) => io.observe(it));
  }

  /* ---------- 3. Mobile nav toggle ---------- */
  function initNav() {
    const toggle = document.querySelector(".nav-toggle");
    const menu = document.querySelector(".nav-links");
    if (!toggle || !menu) return;
    toggle.addEventListener("click", () => {
      const open = menu.classList.toggle("open");
      toggle.setAttribute("aria-expanded", open);
    });
    menu.querySelectorAll("a").forEach((a) =>
      a.addEventListener("click", () => menu.classList.remove("open"))
    );
  }

  /* ---------- 4. Persistent background music ---------- */
  const STORAGE_KEY = "bday_audio_state_v1";
  function getSavedState() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY)) || { time: 0, playing: false };
    } catch (e) {
      return { time: 0, playing: false };
    }
  }
  function saveState(state) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {}
  }

  function initAudio(songPath) {
    const audio = document.getElementById("bgm");
    const toggleBtn = document.querySelector(".music-toggle");
    if (!audio) return null;

    audio.src = songPath || "assets/audio/song.mp3";
    audio.loop = true;

    const saved = getSavedState();
    if (saved.time) {
      audio.addEventListener(
        "loadedmetadata",
        () => {
          try { audio.currentTime = saved.time; } catch (e) {}
        },
        { once: true }
      );
    }

    function reflectPlaying(isPlaying) {
      if (toggleBtn) toggleBtn.classList.toggle("is-playing", isPlaying);
    }
    function tryPlay() {
      const p = audio.play();
      if (p && p.catch) p.then(() => reflectPlaying(true)).catch(() => reflectPlaying(false));
    }
    if (saved.playing) tryPlay();

    audio.addEventListener("play", () => { saveState({ time: audio.currentTime, playing: true }); reflectPlaying(true); });
    audio.addEventListener("pause", () => { saveState({ time: audio.currentTime, playing: false }); reflectPlaying(false); });
    audio.addEventListener("timeupdate", () => {
      if (Math.floor(audio.currentTime) % 2 === 0) saveState({ time: audio.currentTime, playing: !audio.paused });
    });
    window.addEventListener("beforeunload", () => saveState({ time: audio.currentTime, playing: !audio.paused }));

    if (toggleBtn) {
      toggleBtn.addEventListener("click", () => (audio.paused ? tryPlay() : audio.pause()));
    }
    return audio;
  }

  /* ---------- 5. Flip cards ---------- */
  function initFlipCards() {
    document.querySelectorAll(".flip-card:not([data-flip-bound])").forEach((card) => {
      card.setAttribute("data-flip-bound", "1");
      card.addEventListener("click", () => card.classList.toggle("flipped"));
    });
  }

  /* ---------- 6. Heart-burst ---------- */
  window.heartBurst = function (x, y) {
    if (reduceMotion) return;
    const n = 8;
    for (let i = 0; i < n; i++) {
      const bit = document.createElement("span");
      bit.className = "burst-bit";
      bit.innerHTML = '<svg><use href="#icon-heart"></use></svg>';
      const angle = (Math.PI * 2 * i) / n + Math.random() * 0.4;
      const dist = 40 + Math.random() * 30;
      bit.style.left = x + "px";
      bit.style.top = y + "px";
      bit.style.setProperty("--tx", Math.cos(angle) * dist + "px");
      bit.style.setProperty("--ty", Math.sin(angle) * dist + "px");
      document.body.appendChild(bit);
      setTimeout(() => bit.remove(), 900);
    }
  };

  /* ---------- 7. The cover "gate" (index.html only) ---------- */
  /* ---------- Countdown timer to next birthday ---------- */
  function initCountdown() {
    const daysEl = document.getElementById("cdDays");
    const hoursEl = document.getElementById("cdHours");
    const minsEl = document.getElementById("cdMinutes");
    const secsEl = document.getElementById("cdSeconds");
    if (!daysEl || !hoursEl || !minsEl || !secsEl) return;

    const monthDay = (window.SITE_CONTENT && window.SITE_CONTENT.site && window.SITE_CONTENT.site.birthMonthDay) || "01.01";
    const parts = monthDay.split(".");
    const month = parseInt(parts[0], 10) - 1;
    const day = parseInt(parts[1], 10);

    function nextBirthday() {
      const now = new Date();
      let target = new Date(now.getFullYear(), month, day, 0, 0, 0, 0);
      if (target <= now) target = new Date(now.getFullYear() + 1, month, day, 0, 0, 0, 0);
      return target;
    }

    function pad(n) { return String(n).padStart(2, "0"); }

    function tick() {
      const diff = nextBirthday().getTime() - Date.now();
      const totalSeconds = Math.max(0, Math.floor(diff / 1000));
      const days = Math.floor(totalSeconds / 86400);
      const hours = Math.floor((totalSeconds % 86400) / 3600);
      const mins = Math.floor((totalSeconds % 3600) / 60);
      const secs = totalSeconds % 60;
      daysEl.textContent = pad(days);
      hoursEl.textContent = pad(hours);
      minsEl.textContent = pad(mins);
      secsEl.textContent = pad(secs);
    }

    tick();
    setInterval(tick, 1000);
  }

  function initGate() {
    const gate = document.getElementById("gate");
    const openBtn = document.getElementById("openBtn");
    const audio = document.getElementById("bgm");
    if (!gate || !openBtn) return;
    openBtn.addEventListener("click", () => {
      if (audio) {
        const forceRestart = () => {
          try { audio.currentTime = 0; } catch (e) {}
        };
        // initAudio() may have already queued a loadedmetadata listener that
        // resumes an old saved position. Ours is added after, so it runs
        // after that one and wins, guaranteeing a true restart from 0.
        audio.addEventListener("loadedmetadata", forceRestart, { once: true });
        forceRestart();
        audio.play().then(forceRestart).catch(() => {});
      }
      const rect = openBtn.getBoundingClientRect();
      window.heartBurst(rect.left + rect.width / 2, rect.top + rect.height / 2);
      gate.classList.add("gate-open");
      document.body.classList.add("gate-dismissed");
      saveState({ time: 0, playing: true });
      setTimeout(() => gate.setAttribute("aria-hidden", "true"), 900);
    });
  }

  /* ---------- 8. Apply simple [data-content="a.b.c"] text bindings ---------- */
  function applySimpleContent(data) {
    document.querySelectorAll("[data-content]").forEach((node) => {
      const path = node.getAttribute("data-content");
      const val = getPath(data, path);
      if (val !== undefined) node.textContent = interpolate(val, data.site);
    });
    if (data.site) document.title = interpolate(document.title, data.site);
  }

  /* ---------- 9. Page-specific dynamic sections ---------- */
  function renderHome(data) {
    const home = data.home;
    if (!home) return;
    const photo = document.getElementById("heroPhoto");
    if (photo && home.ribbon) {
      photo.src = home.ribbon.photoSrc || "assets/images/hero.jpg";
      photo.alt = "A favorite photo of her";
    }
    const grid = document.getElementById("ctaGrid");
    if (grid && Array.isArray(home.cta)) {
      grid.innerHTML = "";
      home.cta.forEach((item, i) => {
        const a = el("a", "cta-card reveal" + (i === 1 ? " delay-1" : i === 2 ? " delay-2" : ""));
        a.href = item.link || "#";
        a.setAttribute("data-transition", "");
        a.innerHTML =
          '<div class="icon"><svg><use href="#icon-' + item.icon + '"></use></svg></div>' +
          "<h3>" + item.title + "</h3>" +
          "<p>" + item.text + "</p>";
        grid.appendChild(a);
      });
    }
  }

  function renderWishes(data) {
    const w = data.wishes;
    if (!w) return;
    const letterBody = document.getElementById("letterBody");
    if (letterBody && Array.isArray(w.letter)) {
      letterBody.innerHTML = "";
      w.letter.forEach((p) => letterBody.appendChild(el("p", null, interpolate(p, data.site))));
    }
    const signoff = document.getElementById("letterSignoff");
    if (signoff && w.signoff) signoff.textContent = interpolate(w.signoff, data.site);

    const grid = document.getElementById("miniWishGrid");
    if (grid && Array.isArray(w.miniWishes)) {
      grid.innerHTML = "";
      const icons = ["heart", "sparkle", "star", "ribbon", "flower", "balloon"];
      w.miniWishes.forEach((text, i) => {
        const cls = "mini-wish reveal" + (i % 3 === 1 ? " delay-1" : i % 3 === 2 ? " delay-2" : "");
        const div = el("div", cls);
        div.innerHTML =
          '<span class="mini-wish-icon"><svg><use href="#icon-' + icons[i % icons.length] + '"></use></svg></span>' +
          '<span>' + text + '</span>';
        grid.appendChild(div);
      });
    }
  }

  function renderStory(data) {
    const s = data.story;
    if (!s) return;
    const list = document.getElementById("timelineList");
    if (list && Array.isArray(s.chapters)) {
      list.innerHTML = "";
      s.chapters.forEach((ch, i) => {
        const item = el("div", "timeline-item reveal");
        const card = el("div", "story-card");
        card.innerHTML =
          '<span class="tab">' + ch.tab + "</span>" +
          "<h3>" + ch.title + "</h3>" +
          "<p>" + ch.text + "</p>";
        const dotVal = ch.dot || String(i + 1);
        const dot = el("div", "dot");
        if (/^[a-z]+$/i.test(dotVal)) {
          dot.innerHTML = '<svg style="width:1.1rem;height:1.1rem;"><use href="#icon-' + dotVal + '"></use></svg>';
        } else {
          dot.textContent = dotVal;
        }
        const spacer = el("div", "spacer");
        if (i % 2 === 0) { item.append(card, dot, spacer); }
        else { item.append(spacer, dot, card); }
        list.appendChild(item);
      });
    }
    const photos = document.getElementById("storyPhotos");
    if (photos && Array.isArray(s.photos)) {
      photos.innerHTML = "";
      s.photos.forEach((p) => {
        const wrap = el("div", "polaroid");
        wrap.innerHTML =
          '<div class="frame"><img src="' + p.src + '" alt="A memory together"></div>' +
          '<p class="caption">' + p.caption + "</p>";
        photos.appendChild(wrap);
      });
    }
  }

  function renderLove(data) {
    const l = data.love;
    if (!l) return;
    const grid = document.getElementById("loveGrid");
    if (grid && Array.isArray(l.reasons)) {
      grid.innerHTML = "";
      l.reasons.forEach((r, i) => {
        const num = "REASON " + String(i + 1).padStart(2, "0");
        const card = el("div", "flip-card reveal" + (i % 3 === 1 ? " delay-1" : i % 3 === 2 ? " delay-2" : ""));
        const isImage = /\.(png|jpg|jpeg|webp)$/i.test(r.icon || "");
        const iconMarkup = isImage
          ? '<img src="' + r.icon + '" alt="">'
          : '<svg><use href="#icon-' + r.icon + '"></use></svg>';
        card.innerHTML =
          '<div class="flip-card-inner">' +
            '<div class="flip-card-front">' +
              '<div class="num">' + num + "</div>" +
              '<div class="icon">' + iconMarkup + "</div>" +
              "<h3>" + r.title + "</h3>" +
              '<div class="flip-hint">tap to flip</div>' +
            "</div>" +
            '<div class="flip-card-back">' + r.back + "</div>" +
          "</div>";
        grid.appendChild(card);
      });
    }
  }

  /* ---------- Init ---------- */
  document.addEventListener("DOMContentLoaded", () => {
    document.querySelectorAll("[data-ambient]").forEach((n) =>
      spawnAmbient(n, parseInt(n.getAttribute("data-ambient"), 10) || 12)
    );
    initNav();

    const data = window.SITE_CONTENT;
    if (data) {
      applySimpleContent(data);
      if (page === "home") renderHome(data);
      if (page === "wishes") renderWishes(data);
      if (page === "story") renderStory(data);
      if (page === "love") renderLove(data);
      initAudio(data.site && data.site.songPath);
    } else {
      console.warn("content.js did not load — check that the <script src=\"content.js\"> tag is present and loads before main.js.");
      initAudio();
    }
    initReveal();
    initCountdown();
    initFlipCards();
    initGate();

    // gentle fade on internal nav clicks
    document.querySelectorAll("a[data-transition]").forEach((link) => {
      link.addEventListener("click", (e) => {
        const href = link.getAttribute("href");
        if (!href || href.startsWith("#")) return;
        if (document.startViewTransition) return;
        e.preventDefault();
        document.body.classList.add("page-fade-out");
        setTimeout(() => (window.location.href = href), 220);
      });
    });
  });
})();
