/* ==========================================================================
   Vibe Discovery — Detection Figure Gallery (PDF-only)
   Reads the two manifests under ../outputs/, joins them by target_id and renders
   filterable cards plus a clean vector PDF lightbox (contact_sheet.pdf).
   No dependency, no build step.
   ========================================================================== */
(function () {
  "use strict";

  const MOVIE_MANIFEST_URL = "../outputs/movies/movie_gallery_manifest.json";
  const CUTOUT_MANIFEST_URL = "../outputs/real_cutouts/real_cutouts_manifest.json";
  const THEME_KEY = "vibe_discovery_gallery_theme";

  const GROUP_ORDER = ["group1", "group2", "group5", "galactic", "controls"];
  const GROUP_LABELS = {
    group1: "Group I · Rubin + DECam",
    group2: "Group II · Euclid TNO candidates",
    group5: "Group V · Euclid asteroid candidates",
    galactic: "Galactic · high-proper-motion stars",
    controls: "Recovery controls"
  };
  const GROUP_SHORT = {
    group1: "Group I",
    group2: "Group II",
    group5: "Group V",
    galactic: "Galactic",
    controls: "Controls"
  };

  const SORTS = {
    default: { label: "Default (Group & ID)", cmp: (a, b) => groupRank(a) - groupRank(b) || a.target_id.localeCompare(b.target_id) },
    id: { label: "Target ID A→Z", cmp: (a, b) => a.target_id.localeCompare(b.target_id) },
    frames: { label: "Most Frames", cmp: (a, b) => b.n_frames - a.n_frames || a.target_id.localeCompare(b.target_id) },
    single: { label: "Single-Epoch Frames", cmp: (a, b) => b.n_single_epoch_frames - a.n_single_epoch_frames || a.target_id.localeCompare(b.target_id) },
    baseline: { label: "Longest Baseline", cmp: (a, b) => (b.baseline_days || 0) - (a.baseline_days || 0) || a.target_id.localeCompare(b.target_id) }
  };

  const DEFAULT_FILTERS = { group: "all", survey: "all", q: "", sort: "default" };

  const state = {
    targets: [],
    byId: new Map(),
    totals: null,
    filters: Object.assign({}, DEFAULT_FILTERS),
    visible: [],
    modalId: null,
    lastFocus: null
  };

  /* ------------------------------------------------------------------ helpers */

  function relRoot(p) {
    return `../${String(p).replace(/^\/+/, "")}`;
  }

  function groupRank(t) {
    const i = GROUP_ORDER.indexOf(t.group);
    return i === -1 ? GROUP_ORDER.length : i;
  }

  function normalizeSurvey(name) {
    return String(name || "").replace(/\s*\[[^\]]*\]\s*$/, "").trim();
  }

  function formatBaseline(days) {
    if (days === null || days === undefined || !Number.isFinite(Number(days))) return null;
    const d = Number(days);
    if (d <= 0) return null;
    if (d < 2) return `${(d * 24).toFixed(1)} h baseline`;
    if (d < 90) return `${d.toFixed(1)} d baseline`;
    return `${(d / 365.25).toFixed(1)} yr baseline`;
  }

  function plural(n, one, many) {
    return `${n} ${n === 1 ? one : many}`;
  }

  function isCatalogFigure(t) {
    return t.figure_mode === "rubin_catalog_detection";
  }

  function isZtfRubinFigure(t) {
    return t.figure_mode === "real_pixel_zoom" && t.n_detection_epoch_frames === 0;
  }

  function resolveTargetId(raw, byId) {
    if (!raw) return null;
    const want = String(raw).trim();
    if (byId.has(want)) return want;
    const norm = (s) => String(s).toUpperCase().replace(/[^A-Z0-9]/g, "");
    const key = norm(want);
    for (const t of byId.values()) {
      if (norm(t.target_id) === key || norm(t.display_id) === key) return t.target_id;
      if (t.known_designation && norm(t.known_designation) === key) return t.target_id;
    }
    let m = key.match(/^(DELTA|EPS|THETA|IOTA)0*(\d{1,2})$/);
    if (m) {
      const alias = `R25-${m[1][0]}${m[2].padStart(2, "0")}`;
      if (byId.has(alias)) return alias;
    }
    m = key.match(/^EUC0*(\d{1,2})$/);
    if (m) {
      const alias = `EUC-S${m[1].padStart(2, "0")}`;
      if (byId.has(alias)) return alias;
    }
    m = key.match(/^(?:EUCLIDEES149GOLD|GOLD|EUCG)0*(\d{1,2})$/);
    if (m) {
      const alias = `EUC-G${m[1].padStart(2, "0")}`;
      if (byId.has(alias)) return alias;
      for (const t of byId.values()) {
        if (t.is_control && t.group === "controls" && /UM31/.test(t.target_id) && m[1] === "18") return t.target_id;
      }
    }
    return null;
  }

  function joinManifests(movieManifest, cutoutManifest) {
    const cutouts = new Map((cutoutManifest.targets || []).map((t) => [t.target_id, t]));
    const targets = (movieManifest.movies || []).map((m) => {
      const c = cutouts.get(m.target_id) || {};
      const surveys = (Array.isArray(m.surveys) && m.surveys.length ? m.surveys : c.surveys || []).map(normalizeSurvey);
      return {
        target_id: m.target_id,
        display_id: m.display_id || c.display_id || m.target_id,
        group: m.group || c.group || "unknown",
        object_class: m.object_class || c.object_class || "",
        is_control: Boolean(m.is_control || c.is_control),
        known_designation: c.known_designation || null,
        figure_mode: m.figure_mode || (Number(m.n_detection_epoch_frames) > 0 ? "real_pixel_zoom" : "rubin_catalog_detection"),
        n_frames: Number(m.n_frames) || 0,
        n_single_epoch_frames: Number(m.n_single_epoch_frames) || 0,
        n_detection_epoch_frames: Number(m.n_detection_epoch_frames) || 0,
        surveys: Array.from(new Set(surveys)),
        baseline_days: m.baseline_days === undefined ? null : m.baseline_days,
        contact_sheet_png_path: m.contact_sheet_png_path || null,
        contact_sheet_pdf_path: m.contact_sheet_pdf_path || null
      };
    });
    const totals = {
      targets: targets.length,
      frames: targets.reduce((s, t) => s + t.n_frames, 0),
      single: targets.reduce((s, t) => s + t.n_single_epoch_frames, 0),
      controls: targets.filter((t) => t.is_control).length
    };
    return { targets, totals };
  }

  function searchText(t) {
    return [
      t.target_id,
      t.display_id,
      t.object_class,
      t.known_designation,
      t.surveys.join(" "),
      isCatalogFigure(t) ? "rubin dp2 track photometry orbit residuals telescope sky" : "real pixel zoom"
    ].filter(Boolean).join(" ").toLowerCase();
  }

  function applyFilters(targets, f) {
    const q = String(f.q || "").trim().toLowerCase();
    const terms = q ? q.split(/\s+/) : [];
    const out = targets.filter((t) => {
      if (f.group !== "all" && t.group !== f.group) return false;
      if (f.survey !== "all" && !t.surveys.includes(f.survey)) return false;
      if (terms.length) {
        const hay = searchText(t);
        if (!terms.every((term) => hay.includes(term))) return false;
      }
      return true;
    });
    out.sort((SORTS[f.sort] || SORTS.default).cmp);
    return out;
  }

  function filtersFromQuery(search) {
    const params = new URLSearchParams(search || "");
    const f = Object.assign({}, DEFAULT_FILTERS);
    Object.keys(DEFAULT_FILTERS).forEach((k) => {
      const v = params.get(k);
      if (v !== null && v !== "") f[k] = v;
    });
    if (!SORTS[f.sort]) f.sort = "default";
    return { filters: f, target: params.get("target") };
  }

  function queryFromState(f, targetId) {
    const params = new URLSearchParams();
    Object.keys(DEFAULT_FILTERS).forEach((k) => {
      if (f[k] !== DEFAULT_FILTERS[k]) params.set(k, f[k]);
    });
    if (targetId) params.set("target", targetId);
    const qs = params.toString();
    return qs ? `?${qs}` : "";
  }

  /* ---------------------------------------------------------------- DOM utils */

  function $(id) {
    return document.getElementById(id);
  }

  function h(tag, attrs, children) {
    const el = document.createElement(tag);
    if (attrs) {
      Object.keys(attrs).forEach((k) => {
        const v = attrs[k];
        if (v === null || v === undefined || v === false) return;
        if (k === "class") el.className = v;
        else if (k === "text") el.textContent = v;
        else if (k === "hidden") el.hidden = Boolean(v);
        else el.setAttribute(k, v === true ? "" : String(v));
      });
    }
    (children || []).forEach((c) => {
      if (c === null || c === undefined || c === false) return;
      el.appendChild(typeof c === "string" ? document.createTextNode(c) : c);
    });
    return el;
  }

  function clear(el) {
    if (!el) return;
    while (el.firstChild) el.removeChild(el.firstChild);
  }

  function badge(text, cls) {
    return h("span", { class: `badge ${cls || ""}`.trim(), text });
  }

  function badgesFor(t) {
    const modeLabel = isZtfRubinFigure(t)
      ? "Palomar ZTF + Rubin DP2"
      : (isCatalogFigure(t) ? "Rubin DP2 Detections" : "Real-Pixel Zoom");
    return [
      badge(GROUP_SHORT[t.group] || t.group, `g-${t.group}`),
      t.is_control ? badge("CONTROL", "b-control") : null,
      badge(modeLabel, "v-verified"),
      badge("contact_sheet.pdf", "b-quiet")
    ];
  }

  /* ------------------------------------------------------------------- theme */

  function applyTheme(theme) {
    document.documentElement.setAttribute("data-theme", theme);
    const btn = $("theme-toggle");
    if (btn) btn.textContent = theme === "dark" ? "☀ Light" : "◐ Dark";
  }

  function initTheme() {
    let saved = null;
    try {
      saved = window.localStorage.getItem(THEME_KEY);
    } catch (_) { /* storage unavailable */ }
    applyTheme(saved === "dark" ? "dark" : "light");
    const btn = $("theme-toggle");
    if (btn) {
      btn.addEventListener("click", () => {
        const next = document.documentElement.getAttribute("data-theme") === "dark" ? "light" : "dark";
        applyTheme(next);
        try {
          window.localStorage.setItem(THEME_KEY, next);
        } catch (_) { /* storage unavailable */ }
      });
    }
  }

  /* ----------------------------------------------------------------- controls */

  function fillSelect(el, options, value) {
    if (!el) return value;
    clear(el);
    options.forEach(([val, label]) => el.appendChild(h("option", { value: val, text: label })));
    el.value = options.some(([val]) => val === value) ? value : options[0][0];
    return el.value;
  }

  function buildControls() {
    const f = state.filters;
    const count = (pred) => state.targets.filter(pred).length;

    const surveys = Array.from(new Set(state.targets.flatMap((t) => t.surveys))).sort();
    const surveyOptions = [["all", "All surveys"]].concat(surveys.map((s) => [s, `${s} (${count((t) => t.surveys.includes(s))})`]));
    f.survey = fillSelect($("filter-survey"), surveyOptions, f.survey);

    f.sort = fillSelect($("filter-sort"), Object.keys(SORTS).map((k) => [k, SORTS[k].label]), f.sort);
    if ($("filter-q")) $("filter-q").value = f.q;

    const groups = GROUP_ORDER.filter((g) => count((t) => t.group === g) > 0)
      .concat(Array.from(new Set(state.targets.map((t) => t.group))).filter((g) => !GROUP_ORDER.includes(g)));
    if (f.group !== "all" && !groups.includes(f.group)) f.group = "all";
    const chips = $("group-chips");
    clear(chips);
    [["all", "All", state.targets.length]].concat(groups.map((g) => [g, GROUP_LABELS[g] || g, count((t) => t.group === g)]))
      .forEach(([val, label, n]) => {
        const chip = h("button", { type: "button", class: "chip", "data-group": val, "aria-pressed": String(f.group === val) }, [
          label, h("span", { class: "chip-count", text: String(n) })
        ]);
        chip.addEventListener("click", () => setFilter("group", val));
        chips.appendChild(chip);
      });
  }

  function syncControlState() {
    const f = state.filters;
    if ($("filter-survey")) $("filter-survey").value = f.survey;
    if ($("filter-sort")) $("filter-sort").value = f.sort;
    if ($("filter-q") && $("filter-q").value !== f.q) $("filter-q").value = f.q;
    const chips = $("group-chips") ? $("group-chips").childNodes : [];
    for (let i = 0; i < chips.length; i += 1) {
      const chip = chips[i];
      const active = chip.getAttribute("data-group") === f.group;
      chip.setAttribute("aria-pressed", String(active));
      chip.classList.toggle("active", active);
    }
  }

  function setFilter(key, value) {
    state.filters[key] = value;
    render();
  }

  function writeUrl() {
    if (!window.history || !window.history.replaceState) return;
    const qs = queryFromState(state.filters, state.modalId);
    window.history.replaceState(null, "", `${window.location.pathname}${qs}`);
  }

  /* -------------------------------------------------------------------- cards */

  function cardFacts(t) {
    if (isZtfRubinFigure(t)) {
      return ["Palomar ZTF real exposures + stack", "Multi-epoch Rubin DP2 detections"];
    }
    if (isCatalogFigure(t)) {
      return ["Multi-epoch Rubin DP2 detections", "Sky track · photometry · orbit fit"];
    }
    return [
      plural(t.n_frames, "real frame", "real frames"),
      t.n_single_epoch_frames ? plural(t.n_single_epoch_frames, "single exposure", "single exposures") : null,
      formatBaseline(t.baseline_days)
    ].filter(Boolean);
  }

  function cardFor(t) {
    const preview = t.contact_sheet_png_path ? relRoot(t.contact_sheet_png_path) : "";
    const img = h("img", {
      class: "card-img",
      src: preview,
      alt: `${t.display_id}: vector detection figure (contact_sheet.pdf)`,
      loading: "lazy",
      decoding: "async"
    });
    const open = h("button", { type: "button", class: "card-media", "aria-label": `Open ${t.display_id} vector PDF figure` }, [
      img,
      h("span", { class: "hover-hint", text: "Open vector PDF" })
    ]);
    open.addEventListener("click", () => openModal(t.target_id));

    return h("article", { class: `card${t.is_control ? " card-control" : ""}`, "data-target": t.target_id }, [
      open,
      h("div", { class: "card-body" }, [
        h("div", { class: "badge-row" }, badgesFor(t)),
        h("h3", { class: "card-title", text: t.display_id }),
        h("p", { class: "card-class", text: t.object_class }),
        h("p", { class: "card-facts", text: cardFacts(t).join(" · ") }),
        h("p", { class: "card-surveys", text: t.surveys.join(" · ") })
      ])
    ]);
  }

  function render() {
    state.visible = applyFilters(state.targets, state.filters);
    syncControlState();
    const grid = $("grid");
    clear(grid);
    grid.className = "grid view-sheets";
    const frag = document.createDocumentFragment();
    state.visible.forEach((t) => frag.appendChild(cardFor(t)));
    grid.appendChild(frag);
    $("status").textContent = state.visible.length
      ? `Showing ${state.visible.length} of ${state.totals.targets} vector detection figures. Click any card to view contact_sheet.pdf.`
      : "No target matches these filters.";
    writeUrl();
  }

  /* -------------------------------------------------------------------- modal */

  function linkButton(label, href) {
    return h("a", { class: "btn", href, target: "_blank", rel: "noopener", text: label });
  }

  function renderModalMedia(t) {
    const pdf = $("modal-pdf");
    if (!pdf) return;
    const src = t.contact_sheet_pdf_path
      ? `${relRoot(t.contact_sheet_pdf_path)}#toolbar=0&navpanes=0&view=FitH`
      : "about:blank";
    pdf.setAttribute("src", src);
    pdf.setAttribute("title", `${t.display_id}: vector detection figure (contact_sheet.pdf)`);
  }

  function renderModal() {
    const t = state.byId.get(state.modalId);
    if (!t) return;
    const badges = $("modal-badges");
    clear(badges);
    badgesFor(t).forEach((b) => { if (b) badges.appendChild(b); });
    $("modal-title").textContent = t.display_id;

    const subParts = isZtfRubinFigure(t)
      ? [t.object_class, "Palomar ZTF real telescope exposures & shift-and-stack + Rubin DP2 multi-epoch detections"]
      : isCatalogFigure(t)
      ? [t.object_class, "Rubin DP2 multi-epoch detections (sky track, photometry, orbit residuals)"]
      : [
          t.object_class,
          plural(t.n_frames, "real archival frame", "real archival frames"),
          t.n_single_epoch_frames ? plural(t.n_single_epoch_frames, "single exposure", "single exposures") : null,
          formatBaseline(t.baseline_days),
          t.surveys.join(", ")
        ];
    $("modal-sub").textContent = subParts.filter(Boolean).join(" · ");

    $("modal-prev").disabled = state.visible.length < 2;
    $("modal-next").disabled = state.visible.length < 2;

    renderModalMedia(t);

    const links = $("modal-links");
    clear(links);
    if (t.contact_sheet_pdf_path) {
      links.appendChild(linkButton("Open Full Vector Figure (PDF) ↗", relRoot(t.contact_sheet_pdf_path)));
    }
  }

  function openModal(targetId) {
    if (!state.byId.has(targetId)) return;
    if (!state.modalId) state.lastFocus = document.activeElement || null;
    state.modalId = targetId;
    $("modal").hidden = false;
    document.body.classList.add("modal-open");
    renderModal();
    writeUrl();
    const dialog = $("modal-dialog");
    if (dialog && dialog.focus) dialog.focus();
  }

  function closeModal() {
    if (!state.modalId) return;
    state.modalId = null;
    $("modal").hidden = true;
    const pdf = $("modal-pdf");
    if (pdf) pdf.setAttribute("src", "about:blank");
    document.body.classList.remove("modal-open");
    writeUrl();
    if (state.lastFocus && state.lastFocus.focus) state.lastFocus.focus();
  }

  function stepModal(delta) {
    const list = state.visible;
    if (!state.modalId || list.length === 0) return;
    const idx = list.findIndex((x) => x.target_id === state.modalId);
    const next = idx === -1 ? 0 : (idx + delta + list.length) % list.length;
    state.modalId = list[next].target_id;
    renderModal();
    writeUrl();
  }

  /* --------------------------------------------------------------------- init */

  function wireEvents() {
    if ($("filter-survey")) $("filter-survey").addEventListener("change", (ev) => setFilter("survey", ev.target.value));
    if ($("filter-sort")) $("filter-sort").addEventListener("change", (ev) => setFilter("sort", ev.target.value));
    let typing = null;
    if ($("filter-q")) {
      $("filter-q").addEventListener("input", (ev) => {
        const value = ev.target.value;
        window.clearTimeout(typing);
        typing = window.setTimeout(() => setFilter("q", value), 120);
      });
    }
    if ($("reset-filters")) {
      $("reset-filters").addEventListener("click", () => {
        state.filters = Object.assign({}, DEFAULT_FILTERS);
        render();
      });
    }

    $("modal-close").addEventListener("click", closeModal);
    $("modal-prev").addEventListener("click", () => stepModal(-1));
    $("modal-next").addEventListener("click", () => stepModal(1));
    $("modal").addEventListener("click", (ev) => { if (ev.target === $("modal")) closeModal(); });
    document.addEventListener("keydown", (ev) => {
      if (!state.modalId) return;
      const tag = ev.target && ev.target.tagName ? ev.target.tagName.toLowerCase() : "";
      if (ev.key === "Escape") {
        ev.preventDefault();
        closeModal();
      } else if (tag !== "input" && tag !== "select" && tag !== "textarea") {
        if (ev.key === "ArrowLeft") { ev.preventDefault(); stepModal(-1); }
        if (ev.key === "ArrowRight") { ev.preventDefault(); stepModal(1); }
      }
    });
  }

  function fetchJson(url) {
    return fetch(url).then((resp) => {
      if (!resp.ok) throw new Error(`${url} answered HTTP ${resp.status}`);
      return resp.json();
    });
  }

  function start() {
    initTheme();
    const fromUrl = filtersFromQuery(window.location.search);
    state.filters = fromUrl.filters;
    wireEvents();
    return Promise.all([fetchJson(MOVIE_MANIFEST_URL), fetchJson(CUTOUT_MANIFEST_URL)])
      .then(([movies, cutouts]) => {
        const joined = joinManifests(movies, cutouts);
        state.targets = joined.targets;
        state.totals = joined.totals;
        state.byId = new Map(joined.targets.map((t) => [t.target_id, t]));
        buildControls();
        render();
        const wanted = resolveTargetId(fromUrl.target, state.byId);
        if (wanted) openModal(wanted);
        else if (fromUrl.target) $("status").textContent += ` No target named "${fromUrl.target}" is in the manifest.`;
      })
      .catch((err) => {
        $("status").textContent = `The gallery manifests could not be loaded (${err && err.message ? err.message : "network error"}). `
          + "This page expects ../outputs/movies/ and ../outputs/real_cutouts/ beside it.";
        $("status").classList.add("status-error");
      });
  }

  window.MovieGallery = {
    relRoot, normalizeSurvey, formatBaseline, joinManifests, applyFilters,
    filtersFromQuery, queryFromState, resolveTargetId, DEFAULT_FILTERS, SORTS, state, start
  };

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start);
  else start();
})();
