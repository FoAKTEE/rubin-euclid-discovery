/* ==========================================================================
   Real-Pixel Multi-Epoch Movie Gallery
   Reads the two manifests under ../outputs/, joins them by target_id and renders
   filterable cards plus a provenance lightbox. No dependency, no build step.

   Every asset path is relative to the folder above this one, so the page works
   unchanged at https://<host>/<any-subpath>/movie_gallery/ and from a local
   static server. Only WebP, PNG, PDF and JSON files are requested; the GIF
   copies listed in the manifest are not published and are never fetched.
   ========================================================================== */
(function () {
  "use strict";

  const MOVIE_MANIFEST_URL = "../outputs/movies/movie_gallery_manifest.json";
  const CUTOUT_MANIFEST_URL = "../outputs/real_cutouts/real_cutouts_manifest.json";
  const THEME_KEY = "rubin_euclid_portal_theme";

  const GROUP_ORDER = ["group1", "group2", "group5", "galactic", "controls"];
  const GROUP_LABELS = {
    group1: "Group I · Rubin + DECam",
    group2: "Group II · Euclid TNO candidates",
    group5: "Group V · Euclid asteroid candidates",
    galactic: "Galactic · high-proper-motion stars",
    controls: "Recovery controls"
  };
  const GROUP_SHORT = { group1: "Group I", group2: "Group II", group5: "Group V", galactic: "Galactic", controls: "Controls" };

  const VERDICT_LABELS = {
    VERIFIED: "Verified",
    PLAUSIBLE_NEEDS_FOLLOWUP: "Plausible · needs follow-up",
    DISPUTED_OR_OVERCLAIMED: "Disputed or overclaimed",
    INVALID_OR_UNSUPPORTED: "Claim invalid or unsupported"
  };
  const VERDICT_CLASS = {
    VERIFIED: "v-verified",
    PLAUSIBLE_NEEDS_FOLLOWUP: "v-plausible",
    DISPUTED_OR_OVERCLAIMED: "v-disputed",
    INVALID_OR_UNSUPPORTED: "v-invalid"
  };
  const PER_CLAIM = "PER_CLAIM";

  const SORTS = {
    default: { label: "Default (Group & ID)", cmp: (a, b) => groupRank(a) - groupRank(b) || a.target_id.localeCompare(b.target_id) },
    id: { label: "Target ID A→Z", cmp: (a, b) => a.target_id.localeCompare(b.target_id) },
    frames: { label: "Most Frames", cmp: (a, b) => b.n_frames - a.n_frames || a.target_id.localeCompare(b.target_id) },
    single: { label: "Single-Epoch Frames", cmp: (a, b) => b.n_single_epoch_frames - a.n_single_epoch_frames || a.target_id.localeCompare(b.target_id) },
    baseline: { label: "Longest Baseline", cmp: (a, b) => (b.baseline_days || 0) - (a.baseline_days || 0) || a.target_id.localeCompare(b.target_id) }
  };

  const DEFAULT_FILTERS = { group: "all", verdict: "all", survey: "all", coverage: "all", q: "", sort: "default", view: "sheets" };

  const state = {
    targets: [],
    byId: new Map(),
    totals: null,
    filters: Object.assign({}, DEFAULT_FILTERS),
    visible: [],
    modalId: null,
    modalTab: "movie",
    modalToken: 0,
    metadataCache: new Map(),
    lastFocus: null
  };

  /* ------------------------------------------------------------------ helpers */

  /** Path stored in a manifest (repository-relative) -> URL relative to this page. */
  function relRoot(p) {
    return `../${String(p).replace(/^\/+/, "")}`;
  }

  function groupRank(t) {
    const i = GROUP_ORDER.indexOf(t.group);
    return i === -1 ? GROUP_ORDER.length : i;
  }

  /** "Euclid DR1 VIS [euclid]" -> "Euclid DR1 VIS". */
  function normalizeSurvey(name) {
    return String(name || "").replace(/\s*\[[^\]]*\]\s*$/, "").trim();
  }

  function formatBaseline(days) {
    if (days === null || days === undefined || !Number.isFinite(Number(days))) return "baseline n/a";
    const d = Number(days);
    if (d < 2) return `${(d * 24).toFixed(1)} h baseline`;
    if (d < 90) return `${d.toFixed(1)} d baseline`;
    return `${(d / 365.25).toFixed(1)} yr baseline`;
  }

  function formatNumber(value, digits) {
    if (value === null || value === undefined || value === "" || !Number.isFinite(Number(value))) return "—";
    return Number(value).toFixed(digits);
  }

  function plural(n, one, many) {
    return `${n} ${n === 1 ? one : many}`;
  }

  /** Accept the paper id, the display name or an internal pipeline id in ?target=. */
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
    // Internal ids used by the 3D explorer and the monograph (DELTA_003 -> R25-D03, EUC0005 -> EUC-S05).
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

  /** Join the movie manifest with the cutout manifest; the movie row wins for display fields. */
  function joinManifests(movieManifest, cutoutManifest) {
    const cutouts = new Map((cutoutManifest.targets || []).map((t) => [t.target_id, t]));
    const targets = (movieManifest.movies || []).map((m) => {
      const c = cutouts.get(m.target_id) || {};
      const claimVerdicts = Array.isArray(c.claim_verdicts) ? c.claim_verdicts.filter((x) => x && x.verdict) : [];
      const surveys = (Array.isArray(m.surveys) && m.surveys.length ? m.surveys : c.surveys || []).map(normalizeSurvey);
      return {
        target_id: m.target_id,
        display_id: m.display_id || c.display_id || m.target_id,
        group: m.group || c.group || "unknown",
        object_class: m.object_class || c.object_class || "",
        is_control: Boolean(m.is_control || c.is_control),
        known_designation: c.known_designation || null,
        audit_verdict: typeof c.audit_verdict === "string" ? c.audit_verdict : null,
        audit_verdict_scope: c.audit_verdict_scope || null,
        audit_claim_id: c.audit_claim_id || null,
        claim_verdicts: claimVerdicts,
        synthetic: Boolean(m.synthetic) || Boolean(c.synthetic),
        n_frames: Number(m.n_frames) || 0,
        n_single_epoch_frames: Number(m.n_single_epoch_frames) || 0,
        n_detection_epoch_frames: Number(m.n_detection_epoch_frames) || 0,
        detection_epoch_note: m.detection_epoch_note || c.detection_epoch_note || null,
        surveys: Array.from(new Set(surveys)),
        has_difference_panels: Boolean(m.has_difference_panels),
        baseline_days: m.baseline_days === undefined ? null : m.baseline_days,
        frame_dimensions_px: Array.isArray(m.frame_dimensions_px) ? m.frame_dimensions_px : null,
        webp_path: m.webp_path || null,
        contact_sheet_png_path: m.contact_sheet_png_path || null,
        contact_sheet_pdf_path: m.contact_sheet_pdf_path || null,
        metadata_path: c.metadata_path || null,
        sha256: m.sha256 || {},
        metadata_sha256: c.metadata_sha256 || null,
        skipped_frames: Array.isArray(c.skipped_frames) ? c.skipped_frames : [],
        n_frames_from_derived_cache: Number(c.n_frames_from_derived_cache) || 0,
        max_padded_fraction: c.max_padded_fraction === undefined ? null : c.max_padded_fraction
      };
    });
    const totals = {
      targets: targets.length,
      frames: targets.reduce((s, t) => s + t.n_frames, 0),
      single: targets.reduce((s, t) => s + t.n_single_epoch_frames, 0),
      controls: targets.filter((t) => t.is_control).length,
      noEpoch: targets.filter((t) => t.n_detection_epoch_frames === 0).length,
      anySynthetic: targets.some((t) => t.synthetic) || movieManifest.synthetic === true || cutoutManifest.synthetic === true,
      gaps: Number(cutoutManifest.n_coverage_gaps) || (cutoutManifest.coverage_gaps || []).length || 0
    };
    return { targets, totals };
  }

  function verdictsOf(t) {
    const out = new Set();
    if (t.audit_verdict) out.add(t.audit_verdict);
    t.claim_verdicts.forEach((c) => out.add(c.verdict));
    return out;
  }

  function matchesVerdict(t, verdict) {
    if (verdict === "all") return true;
    if (verdict === PER_CLAIM) return !t.audit_verdict && t.claim_verdicts.length > 0;
    return verdictsOf(t).has(verdict);
  }

  function matchesCoverage(t, coverage) {
    if (coverage === "detection") return t.n_detection_epoch_frames > 0;
    if (coverage === "context") return t.n_detection_epoch_frames === 0;
    if (coverage === "controls") return t.is_control;
    return true;
  }

  function searchText(t) {
    return [
      t.target_id, t.display_id, t.object_class, t.known_designation, t.audit_claim_id,
      t.audit_verdict, t.claim_verdicts.map((c) => c.id).join(" "), t.surveys.join(" "), t.detection_epoch_note
    ].filter(Boolean).join(" ").toLowerCase();
  }

  function applyFilters(targets, f) {
    const q = String(f.q || "").trim().toLowerCase();
    const terms = q ? q.split(/\s+/) : [];
    const out = targets.filter((t) => {
      if (f.group !== "all" && t.group !== f.group) return false;
      if (!matchesVerdict(t, f.verdict)) return false;
      if (f.survey !== "all" && !t.surveys.includes(f.survey)) return false;
      if (!matchesCoverage(t, f.coverage)) return false;
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
    if (f.view !== "movies") f.view = "sheets";
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

  /** Verdict badge text. A verdict can grade the object itself or one claim about it. */
  function verdictSummary(t) {
    if (t.audit_verdict) {
      const label = VERDICT_LABELS[t.audit_verdict] || t.audit_verdict;
      const scope = t.audit_claim_id ? ` · ${t.audit_claim_id}` : "";
      return { text: `${label}${scope}`, cls: VERDICT_CLASS[t.audit_verdict] || "v-none" };
    }
    if (t.claim_verdicts.length) {
      const n = (v) => t.claim_verdicts.filter((c) => c.verdict === v).length;
      return { text: `Graded per claim · ${n("VERIFIED")} verified, ${n("DISPUTED_OR_OVERCLAIMED")} disputed`, cls: "v-claim" };
    }
    return { text: "No audit verdict", cls: "v-none" };
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
    while (el.firstChild) el.removeChild(el.firstChild);
  }

  function badge(text, cls) {
    return h("span", { class: `badge ${cls || ""}`.trim(), text });
  }

  function badgesFor(t) {
    const v = verdictSummary(t);
    return [
      badge(GROUP_SHORT[t.group] || t.group, `g-${t.group}`),
      t.is_control ? badge("CONTROL", "b-control") : null,
      badge(v.text, v.cls),
      t.has_difference_panels ? badge("Reference + difference", "b-quiet") : null
    ];
  }

  /* ------------------------------------------------------------------- theme */

  function applyTheme(theme) {
    document.documentElement.setAttribute("data-theme", theme);
    const btn = $("theme-toggle");
    if (btn) btn.textContent = theme === "dark" ? "Light theme" : "Dark theme";
  }

  function initTheme() {
    let saved = null;
    try {
      saved = window.localStorage.getItem(THEME_KEY);
    } catch (_) { /* storage unavailable */ }
    applyTheme(saved === "light" ? "light" : "dark");
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
    clear(el);
    options.forEach(([val, label]) => el.appendChild(h("option", { value: val, text: label })));
    el.value = options.some(([val]) => val === value) ? value : options[0][0];
    return el.value;
  }

  function buildControls() {
    const f = state.filters;
    const count = (pred) => state.targets.filter(pred).length;

    const verdictOptions = [["all", "All verdicts"]];
    Object.keys(VERDICT_LABELS).forEach((v) => {
      const n = count((t) => matchesVerdict(t, v));
      if (n) verdictOptions.push([v, `${VERDICT_LABELS[v]} (${n})`]);
    });
    const nClaim = count((t) => matchesVerdict(t, PER_CLAIM));
    if (nClaim) verdictOptions.push([PER_CLAIM, `Graded per claim (${nClaim})`]);
    f.verdict = fillSelect($("filter-verdict"), verdictOptions, f.verdict);

    const surveys = Array.from(new Set(state.targets.flatMap((t) => t.surveys))).sort();
    const surveyOptions = [["all", "All surveys"]].concat(surveys.map((s) => [s, `${s} (${count((t) => t.surveys.includes(s))})`]));
    f.survey = fillSelect($("filter-survey"), surveyOptions, f.survey);

    f.coverage = fillSelect($("filter-coverage"), [
      ["all", "All"],
      ["detection", `Has detection-epoch pixels (${count((t) => matchesCoverage(t, "detection"))})`],
      ["context", `Context / coadd epochs only (${count((t) => matchesCoverage(t, "context"))})`],
      ["controls", `Recovery controls (${count((t) => matchesCoverage(t, "controls"))})`]
    ], f.coverage);

    f.sort = fillSelect($("filter-sort"), Object.keys(SORTS).map((k) => [k, SORTS[k].label]), f.sort);
    $("filter-q").value = f.q;

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
    $("filter-verdict").value = f.verdict;
    $("filter-survey").value = f.survey;
    $("filter-coverage").value = f.coverage;
    $("filter-sort").value = f.sort;
    if ($("filter-q").value !== f.q) $("filter-q").value = f.q;
    const chips = $("group-chips").childNodes;
    for (let i = 0; i < chips.length; i += 1) {
      const chip = chips[i];
      const active = chip.getAttribute("data-group") === f.group;
      chip.setAttribute("aria-pressed", String(active));
      chip.classList.toggle("active", active);
    }
    ["sheets", "movies"].forEach((v) => {
      const btn = $(`view-${v}`);
      btn.classList.toggle("active", f.view === v);
      btn.setAttribute("aria-pressed", String(f.view === v));
    });
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

  function cardFor(t) {
    const sheet = t.contact_sheet_png_path ? relRoot(t.contact_sheet_png_path) : null;
    const movie = t.webp_path ? relRoot(t.webp_path) : null;
    const sheetsView = state.filters.view === "sheets";
    const initial = sheetsView ? (sheet || movie) : (movie || sheet);
    const dims = t.frame_dimensions_px;

    const img = h("img", {
      class: "card-img",
      src: initial,
      alt: `${t.display_id}: ${sheetsView ? "contact sheet" : "animated movie"} of ${plural(t.n_frames, "real archival frame", "real archival frames")}`,
      loading: "lazy",
      decoding: "async",
      width: dims ? dims[0] : null,
      height: dims ? dims[1] : null
    });
    const open = h("button", { type: "button", class: "card-media", "aria-label": `Open ${t.display_id}` }, [
      img,
      sheetsView && movie ? h("span", { class: "hover-hint", text: "hover: play WebP" }) : null
    ]);
    if (sheetsView && sheet && movie) {
      // The movie is fetched only when the pointer or keyboard focus reaches the card.
      const play = () => { if (img.getAttribute("src") !== movie) img.setAttribute("src", movie); };
      const still = () => { if (img.getAttribute("src") !== sheet) img.setAttribute("src", sheet); };
      open.addEventListener("mouseenter", play);
      open.addEventListener("mouseleave", still);
      open.addEventListener("focus", play);
      open.addEventListener("blur", still);
    }
    open.addEventListener("click", () => openModal(t.target_id));

    const facts = [
      plural(t.n_frames, "frame", "frames"),
      plural(t.n_single_epoch_frames, "single exposure", "single exposures"),
      formatBaseline(t.baseline_days)
    ];
    return h("article", { class: `card${t.is_control ? " card-control" : ""}`, "data-target": t.target_id }, [
      open,
      h("div", { class: "card-body" }, [
        h("div", { class: "badge-row" }, badgesFor(t)),
        h("h3", { class: "card-title", text: t.display_id }),
        h("p", { class: "card-class", text: t.object_class }),
        t.detection_epoch_note ? h("p", { class: "card-note", text: `Note: ${t.detection_epoch_note}` }) : null,
        h("p", { class: "card-facts", text: facts.join(" · ") }),
        h("p", { class: "card-surveys", text: t.surveys.join(" · ") })
      ])
    ]);
  }

  function renderSummary() {
    const totals = state.totals;
    $("stat-showing").textContent = `${state.visible.length} of ${totals.targets}`;
    $("stat-showing-label").textContent = `Showing ${state.visible.length} of ${totals.targets} targets`;
    $("stat-synthetic").textContent = `synthetic: ${totals.anySynthetic}`;
    $("stat-frames").textContent = `${totals.frames} real frames`;
    $("stat-single").textContent = `${totals.single} single exposures`;
    $("stat-gaps").textContent = `${totals.gaps} coverage gaps`;
    $("stat-split").textContent = `${totals.targets - totals.controls} + ${totals.controls}`;
    $("no-epoch-count").textContent = String(totals.noEpoch);
    $("no-epoch-callout").hidden = totals.noEpoch === 0;
    $("no-epoch-filter-btn").textContent = state.filters.coverage === "context" ? "Show all targets" : "Show only these targets";
  }

  function render() {
    state.visible = applyFilters(state.targets, state.filters);
    syncControlState();
    renderSummary();
    const grid = $("grid");
    clear(grid);
    grid.className = `grid view-${state.filters.view}`;
    const frag = document.createDocumentFragment();
    state.visible.forEach((t) => frag.appendChild(cardFor(t)));
    grid.appendChild(frag);
    const frames = state.visible.reduce((s, t) => s + t.n_frames, 0);
    $("status").textContent = state.visible.length
      ? `Showing ${state.visible.length} of ${state.totals.targets} targets (${frames} frames in view).`
      : "No target matches these filters.";
    writeUrl();
  }

  /* -------------------------------------------------------------------- modal */

  function linkButton(label, href, download) {
    return h("a", { class: "btn", href, target: "_blank", rel: "noopener", download: download || null, text: label });
  }

  function renderModalMedia(t) {
    const img = $("modal-media");
    const isMovie = state.modalTab === "movie";
    const path = isMovie ? (t.webp_path || t.contact_sheet_png_path) : (t.contact_sheet_png_path || t.webp_path);
    img.setAttribute("src", path ? relRoot(path) : "");
    img.setAttribute("alt", `${t.display_id}: ${isMovie ? "animated movie" : "contact sheet"}`);
    ["movie", "sheet"].forEach((tab) => {
      const btn = $(`tab-${tab}`);
      btn.classList.toggle("active", state.modalTab === tab);
      btn.setAttribute("aria-selected", String(state.modalTab === tab));
    });
  }

  function renderModalAudit(t) {
    const box = $("modal-audit");
    clear(box);
    const v = verdictSummary(t);
    const lines = [h("p", {}, [badge(v.text, v.cls)])];
    if (t.audit_verdict) {
      const scope = t.audit_verdict_scope === "claim"
        ? `This verdict grades the claim ${t.audit_claim_id || ""} about the target, not the target's existence as a catalogued body.`
        : "This verdict grades the object itself (detection, novelty and attribution).";
      lines.push(h("p", { class: "muted", text: scope }));
    }
    if (t.is_control) {
      lines.push(h("p", { class: "muted", text: `Recovery control: the catalogued object ${t.known_designation || ""} recovered by the search. It is not a discovery.` }));
    }
    if (t.claim_verdicts.length) {
      const list = h("ul", { class: "claim-list" });
      t.claim_verdicts.forEach((c) => {
        list.appendChild(h("li", {}, [
          badge(VERDICT_LABELS[c.verdict] || c.verdict, VERDICT_CLASS[c.verdict] || "v-none"),
          h("code", { text: c.id || "" }),
          c.claim ? h("span", { class: "claim-text", text: c.claim }) : null
        ]));
      });
      lines.push(h("p", { class: "muted", text: "The audit grades this group claim by claim; no single verdict covers the object." }));
      lines.push(list);
    }
    lines.forEach((el) => box.appendChild(el));
  }

  function renderDigests(t) {
    const dl = $("modal-digests");
    clear(dl);
    [
      ["webp", t.sha256.webp],
      ["contact_sheet_png", t.sha256.contact_sheet_png],
      ["contact_sheet_pdf", t.sha256.contact_sheet_pdf],
      ["metadata.json", t.metadata_sha256]
    ].forEach(([name, digest]) => {
      if (!digest) return;
      dl.appendChild(h("dt", { text: name }));
      dl.appendChild(h("dd", {}, [h("code", { text: digest })]));
    });
  }

  function copyText(text, button) {
    const done = () => {
      const prev = button.textContent;
      button.textContent = "copied";
      window.setTimeout(() => { button.textContent = prev; }, 1200);
    };
    if (window.navigator && window.navigator.clipboard && window.navigator.clipboard.writeText) {
      window.navigator.clipboard.writeText(text).then(done, () => {});
    }
  }

  function archiveCell(frame) {
    const uri = frame.archive_uri;
    if (typeof uri === "string" && /^https:\/\//.test(uri)) {
      return h("a", { href: uri, target: "_blank", rel: "noopener noreferrer", text: "archive ↗", title: uri });
    }
    const cache = frame.derived_cache_source;
    if (cache && typeof cache === "object") {
      const service = typeof cache.archive_service === "string" && /^https:\/\//.test(cache.archive_service) ? cache.archive_service : null;
      return h("span", { class: "muted", title: cache.note || "" }, [
        "derived cache",
        service ? " · " : null,
        service ? h("a", { href: service, target: "_blank", rel: "noopener noreferrer", text: "service ↗" }) : null
      ]);
    }
    return h("span", { class: "muted", text: "—" });
  }

  function frameRow(frame) {
    const sha = typeof frame.source_sha256 === "string" ? frame.source_sha256 : "";
    const shaCell = h("td", {});
    if (sha) {
      const btn = h("button", { type: "button", class: "sha-btn", title: `${sha} (click to copy)`, text: `${sha.slice(0, 10)}…` });
      btn.addEventListener("click", () => copyText(sha, btn));
      shaCell.appendChild(btn);
    } else {
      shaCell.textContent = "—";
    }
    const survey = [frame.survey, frame.band].filter(Boolean).join(" · ") || "—";
    const role = String(frame.role || "—").replace(/_/g, " ");
    const kind = String(frame.epoch_kind || "—").replace(/_/g, " ");
    const expected = frame.target_expected_in_frame === false ? " (target not expected in frame)" : "";
    return h("tr", {}, [
      h("td", { class: "mono", text: frame.array_key || "—" }),
      h("td", { text: `${role}${expected}`, title: frame.marker_note || "" }),
      h("td", { text: kind, title: frame.epoch_note || frame.epoch_source || "" }),
      h("td", { class: "mono", text: frame.utc_iso ? String(frame.utc_iso).replace("T", " ").replace(/\.\d+Z$/, "Z") : "—" }),
      h("td", { class: "mono", text: formatNumber(frame.mjd_utc, 5) }),
      h("td", { text: survey, title: frame.product_subtype || "" }),
      h("td", { class: "mono", text: formatNumber(frame.exptime_s, 1) }),
      h("td", { class: "mono", text: formatNumber(frame.pixel_scale_arcsec, 3) }),
      h("td", { class: "mono", text: formatNumber(frame.aperture_snr, 2) }),
      h("td", { class: "mono", text: formatNumber(frame.padded_fraction, 3) }),
      h("td", { text: frame.centering || "—" }),
      shaCell,
      h("td", {}, [archiveCell(frame)])
    ]);
  }

  function renderFrames(metadata) {
    const frames = Array.isArray(metadata && metadata.frames) ? metadata.frames : [];
    const body = $("modal-frames-body");
    clear(body);
    frames.forEach((frame) => body.appendChild(frameRow(frame || {})));
    $("modal-frames").hidden = frames.length === 0;
    const nCache = frames.filter((f) => f && f.derived_cache_source).length;
    $("modal-frames-status").textContent = frames.length
      ? `${plural(frames.length, "frame", "frames")} · bundle synthetic flag: ${metadata.synthetic === true}`
        + (nCache ? ` · ${plural(nCache, "frame was", "frames were")} read from a locally cached archival stamp and carry no archive URI` : "")
      : "The metadata file lists no frames.";
  }

  function loadMetadata(t) {
    const token = ++state.modalToken;
    $("modal-frames").hidden = true;
    clear($("modal-frames-body"));
    if (!t.metadata_path) {
      $("modal-frames-status").textContent = "The manifest lists no metadata file for this target.";
      return Promise.resolve();
    }
    const cached = state.metadataCache.get(t.target_id);
    if (cached) {
      renderFrames(cached);
      return Promise.resolve();
    }
    $("modal-frames-status").textContent = "Loading metadata.json…";
    return fetch(relRoot(t.metadata_path))
      .then((resp) => {
        if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
        return resp.json();
      })
      .then((metadata) => {
        state.metadataCache.set(t.target_id, metadata);
        // A slower reply for a target the reader has already left must not overwrite the table.
        if (token === state.modalToken && state.modalId === t.target_id) renderFrames(metadata);
      })
      .catch((err) => {
        if (token === state.modalToken && state.modalId === t.target_id) {
          $("modal-frames-status").textContent = `Could not load metadata.json (${err && err.message ? err.message : "network error"}).`;
        }
      });
  }

  function renderModal() {
    const t = state.byId.get(state.modalId);
    if (!t) return;
    const badges = $("modal-badges");
    clear(badges);
    badgesFor(t).forEach((b) => { if (b) badges.appendChild(b); });
    $("modal-title").textContent = t.display_id;
    $("modal-sub").textContent = [
      t.object_class,
      plural(t.n_frames, "real archival frame", "real archival frames"),
      plural(t.n_single_epoch_frames, "single exposure", "single exposures"),
      formatBaseline(t.baseline_days),
      t.surveys.join(", ")
    ].filter(Boolean).join(" · ");

    const note = $("modal-epoch-note");
    note.hidden = !t.detection_epoch_note;
    note.textContent = t.detection_epoch_note
      ? `Detection epoch: ${t.detection_epoch_note}. The frames show static sky at the detection position, not the moving object.`
      : "";

    const idx = state.visible.findIndex((x) => x.target_id === t.target_id);
    $("modal-pos").textContent = idx >= 0 ? `${idx + 1} / ${state.visible.length}` : "outside current filters";
    $("modal-prev").disabled = state.visible.length < 2;
    $("modal-next").disabled = state.visible.length < 2;

    renderModalMedia(t);

    const links = $("modal-links");
    clear(links);
    const base = t.target_id;
    if (t.webp_path) links.appendChild(linkButton("Open movie (.webp)", relRoot(t.webp_path), `${base}_movie.webp`));
    if (t.contact_sheet_png_path) links.appendChild(linkButton("Open contact sheet (.png)", relRoot(t.contact_sheet_png_path), `${base}_contact_sheet.png`));
    if (t.contact_sheet_pdf_path) links.appendChild(linkButton("Vector contact sheet (.pdf)", relRoot(t.contact_sheet_pdf_path)));
    if (t.metadata_path) links.appendChild(linkButton("Raw metadata.json", relRoot(t.metadata_path)));

    renderModalAudit(t);

    const skipped = $("modal-skipped");
    clear(skipped);
    t.skipped_frames.forEach((s) => skipped.appendChild(h("li", { text: String(s) })));
    $("modal-skipped-section").hidden = t.skipped_frames.length === 0;

    renderDigests(t);
    loadMetadata(t);
  }

  function openModal(targetId) {
    if (!state.byId.has(targetId)) return;
    if (!state.modalId) state.lastFocus = document.activeElement || null;
    state.modalId = targetId;
    state.modalTab = "movie";
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
    state.modalToken += 1;
    $("modal").hidden = true;
    $("modal-media").setAttribute("src", "");
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
    state.modalTab = "movie";
    renderModal();
    writeUrl();
  }

  /* --------------------------------------------------------------------- init */

  function wireEvents() {
    $("filter-verdict").addEventListener("change", (ev) => setFilter("verdict", ev.target.value));
    $("filter-survey").addEventListener("change", (ev) => setFilter("survey", ev.target.value));
    $("filter-coverage").addEventListener("change", (ev) => setFilter("coverage", ev.target.value));
    $("filter-sort").addEventListener("change", (ev) => setFilter("sort", ev.target.value));
    let typing = null;
    $("filter-q").addEventListener("input", (ev) => {
      const value = ev.target.value;
      window.clearTimeout(typing);
      typing = window.setTimeout(() => setFilter("q", value), 120);
    });
    ["sheets", "movies"].forEach((v) => $(`view-${v}`).addEventListener("click", () => setFilter("view", v)));
    $("reset-filters").addEventListener("click", () => {
      state.filters = Object.assign({}, DEFAULT_FILTERS, { view: state.filters.view });
      render();
    });
    $("no-epoch-filter-btn").addEventListener("click", () => {
      setFilter("coverage", state.filters.coverage === "context" ? "all" : "context");
    });

    $("modal-close").addEventListener("click", closeModal);
    $("modal-prev").addEventListener("click", () => stepModal(-1));
    $("modal-next").addEventListener("click", () => stepModal(1));
    $("modal").addEventListener("click", (ev) => { if (ev.target === $("modal")) closeModal(); });
    ["movie", "sheet"].forEach((tab) => $(`tab-${tab}`).addEventListener("click", () => {
      state.modalTab = tab;
      const t = state.byId.get(state.modalId);
      if (t) renderModalMedia(t);
    }));
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

  // Pure helpers are exposed for tests and for other pages of the portal.
  window.MovieGallery = {
    relRoot, normalizeSurvey, formatBaseline, joinManifests, applyFilters, matchesVerdict, matchesCoverage,
    filtersFromQuery, queryFromState, resolveTargetId, verdictSummary, DEFAULT_FILTERS, SORTS, PER_CLAIM, state, start
  };

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start);
  else start();
})();
