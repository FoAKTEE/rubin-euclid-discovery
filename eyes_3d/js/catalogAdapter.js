// Dynamic Catalog Adapter for window.SOLAR_CATALOG + non-destructive in-memory fallback.
// Reads window.SOLAR_CATALOG seamlessly; never writes or modifies data/solar_catalog.js on disk.

import { BUILTIN_REFERENCE_OBJECTS } from "./fallbackCatalog.js";
import { resolveObjectColor, GALACTIC_COLORS, CATEGORY_COLORS } from "./colorSystem.js";

export const CATEGORY_ORDER = [
  "all",
  "discoveries",
  "galactic",
  "spacecraft",
  "planets",
  "moons_l2",
  "dwarf_planets",
  "asteroids",
  "comets_centaurs",
  "interstellar",
  "kuiper_etnos",
  "oort_cloud"
];

const CATEGORY_SYNONYMS = {
  all: "all",
  "*": "all",
  discoveries: "discoveries",
  discovery: "discoveries",
  new: "discoveries",
  our_discoveries: "discoveries",
  new_discoveries: "discoveries",
  spacecraft: "spacecraft",
  telescopes: "spacecraft",
  telescope: "spacecraft",
  starlink: "spacecraft",
  starlink_sats: "spacecraft",
  probes: "spacecraft",
  stations: "spacecraft",
  planets: "planets",
  planet: "planets",
  major_planets: "planets",
  moons_l2: "moons_l2",
  moons: "moons_l2",
  moon: "moons_l2",
  satellite: "moons_l2",
  satellites: "moons_l2",
  l2: "spacecraft",
  dwarf_planets: "dwarf_planets",
  dwarf: "dwarf_planets",
  dwarf_planet: "dwarf_planets",
  dwarfs: "dwarf_planets",
  sednoid: "dwarf_planets",
  asteroids: "asteroids",
  asteroid: "asteroids",
  neo: "asteroids",
  neos: "asteroids",
  mba: "asteroids",
  main_belt: "asteroids",
  comets_centaurs: "comets_centaurs",
  comets: "comets_centaurs",
  comet: "comets_centaurs",
  centaur: "comets_centaurs",
  centaurs: "comets_centaurs",
  active_centaur: "comets_centaurs",
  interstellar: "interstellar",
  iso: "interstellar",
  hyperbolic: "interstellar",
  kuiper_etnos: "kuiper_etnos",
  kuiper_etno: "kuiper_etnos",
  kuiper: "kuiper_etnos",
  kuiper_belt: "kuiper_etnos",
  kbo: "kuiper_etnos",
  tno: "kuiper_etnos",
  tnos: "kuiper_etnos",
  etno: "kuiper_etnos",
  etnos: "kuiper_etnos",
  outer_sso: "kuiper_etnos",
  oort_cloud: "oort_cloud",
  oort: "oort_cloud",
  hills: "oort_cloud",
  lpc: "oort_cloud",
  galactic: "galactic",
  galaxy: "galactic",
  milky_way: "galactic",
  black_hole: "galactic",
  black_holes: "galactic",
  smbh: "galactic",
  cluster: "galactic",
  globular: "galactic",
  star: "star",
  sun: "star"
};

// Cross-site ID alias bridge so every deep-link from the companion Blog or user prompt resolves 100% accurately
const EXPLICIT_ID_ALIASES = {
  EUC0002: ["EUCLID_VIS_TNO_01", "OUTER_VIS_BLOCK_A_ECLIPTIC_SPINE_66335_66344_002", "EUCLID_VIS_KBO_01"],
  EUCLID_VIS_TNO_02: ["EUC0003", "OUTER_VIS_BLOCK_A_ECLIPTIC_SPINE_66332_66338_003", "EUCLID_VIS_KBO_02"],
  EUCLID_VIS_TNO_03: ["EUC0004", "OUTER_VIS_BLOCK_A_ECLIPTIC_SPINE_66338_66344_004", "EUCLID_VIS_KBO_03"],
  EUC0005: ["EUCLID_VIS_TNO_04", "OUTER_VIS_BLOCK_A_ECLIPTIC_SPINE_66332_66338_005", "EUCLID_VIS_KBO_04"],
  SYLVIA_87: ["SYLVIA", "87_SYLVIA", "(87) Sylvia"],
  GISMONDA_492: ["GISMONDA", "492_GISMONDA", "(492) Gismonda"],
  CATHYBENNETT_6493: ["CATHYBENNETT", "6493_CATHYBENNETT"],
  BP519_2015: ["2015_BP519", "2015 BP519"],
  QB98_2021: ["2021_QB98", "2021 QB98"],
  VS207_2015: ["2015_VS207", "2015 VS207"],
  ATLAS_3I: ["3I/ATLAS", "3I_ATLAS", "3I", "C/2025 N1"],
  BORISOV_2I: ["2I/BORISOV", "2I_BORISOV", "2I"],
  OUMUAMUA_1I: ["1I/'OUMUAMUA", "1I_OUMUAMUA", "1I", "OUMUAMUA"],
  SW1_29P: ["29P/SW1", "29P", "29P_SW1"],
  DELTA_003: ["LSST-DP2-D03", "D03", "R25-D03"],
  EPS_002: ["R25-E02"],
  DELTA_009: ["R25-D09"],
  EPS_007: ["R25-E07"],
  THETA_012: ["R25-T12", "CAMP2_003"],
  THETA_009: ["R25-T09"],
  THETA_007: ["R25-T07"],
  THETA_013: ["R25-T13"],
  CENTAUR_343_IOTA004: ["CENTAUR_343.4_-14.2", "IOTA_004", "R25-I04", "CENTAUR_343"],
  CAMP2_001: ["TNO_lsst_dp2_wide_diasource_286.50_-24.50_c1", "TNO_286.5"],
  KAPPA_COSMOS_WN_04: ["EUC-CW04", "EUCLID_DR1_C3_GOLD_10"],
  KAPPA_COSMOS_ES_02: ["EUC-CS02"],
  KAPPA_COSMOS_WS_06: ["EUC-CW06"],
  KAPPA_COSMOS_ES_03: ["EUC-CS03"],
  KAPPA_COSMOS_WS_05: ["EUC-CW05", "EUCLID_DR1_C3_GOLD_08"],
  KAPPA_COSMOS_EN_01: ["EUC-CN01"],
  NW189_SECONDARY: ["2025 NW189", "S/(2025 NW189) 1", "NW189"],
  NU192_SECONDARY: ["2025 NU192", "S/(2025 NU192) 1", "NU192"],
  W3A_ITF_010: ["ITF_010", "W3A_010"],
  W3A_ITF_016: ["ITF_016", "W3A_016"],
  W4_JUP_MOON_GOLD_001: ["JUP_MOON_001", "W4_MOON_01"],
  W4_JUP_MOON_GOLD_002: ["JUP_MOON_002", "W4_MOON_02"],
  W4_JUP_MOON_GOLD_003: ["JUP_MOON_003", "W4_MOON_03"],
  W4_JUP_MOON_GOLD_004: ["JUP_MOON_004", "W4_MOON_04"],
  EUCLID_EES149_GOLD_18: ["GOLD_18", "GOLD18", "EUC-G18"],
  OORT_OUTER_REP_1: ["OORT_SHELL_NODE_ALPHA"],
  OORT_OUTER_REP_2: ["OORT_SHELL_NODE_BETA"],
  UN271_BERNARDINELLI: ["BERNARDINELLI_BERNSTEIN", "C/2014 UN271"],
  STARLINK_REP_01: ["STARLINK", "STARLINK_V2", "SPACEX_STARLINK"],
  STARMAN_ROADSTER: ["ROADSTER", "STARMAN", "TESLA", "TESLA_ROADSTER", "2018-017A", "跑车"],
  TESLA_CYBERTRUCK: ["CYBERTRUCK", "赛博皮卡", "皮卡"],
  SPACEX_STARSHIP: ["STARSHIP", "星舰"],
  SPACEX_CREW_DRAGON: ["DRAGON", "CREW_DRAGON", "POLARIS_DAWN", "龙飞船"],
  SPACEX_STARSHIELD_REP: ["STARSHIELD", "星盾"],
  AST_BLUEWALKER3: ["BLUEWALKER", "BLUEBIRD", "AST"],
  TIANGONG_CSS: ["TIANGONG", "CSS", "TIANHE", "天宫"],
  ISS_LEO: ["ISS", "ZARYA", "国际空间站"],
  HUBBLE_HST: ["HUBBLE", "HST", "哈勃"],
  CSST_XUNTIAN: ["CSST", "XUNTIAN", "巡天"],
  GAIA_L2: ["GAIA", "盖亚"],
  CHANDRA_CXO: ["CHANDRA", "CXO"],
  JWST_L2: ["JWST", "WEBB", "韦布"],
  VOYAGER_1: ["VOYAGER1", "VOYAGER 1", "旅行者1号"],
  VOYAGER_2: ["VOYAGER2", "VOYAGER 2", "旅行者2号"],
  PARKER_SOLAR_PROBE: ["PSP", "PARKER"]
};

export function normalizeCategoryKey(raw) {
  if (!raw) return "asteroids";
  const cleaned = String(raw).trim().toLowerCase().replace(/[\s\-/]+/g, "_");
  if (CATEGORY_SYNONYMS[cleaned]) return CATEGORY_SYNONYMS[cleaned];
  if (cleaned.includes("oort") || cleaned.includes("hills")) return "oort_cloud";
  if (cleaned.includes("galac") || cleaned.includes("black_hole") || cleaned.includes("smbh") || cleaned.includes("globular") || cleaned.includes("cluster")) return "galactic";
  if (cleaned.includes("interstellar") || cleaned.includes("iso")) return "interstellar";
  if (cleaned.includes("comet") || cleaned.includes("centaur")) return "comets_centaurs";
  if (cleaned.includes("spacecraft") || cleaned.includes("telescop") || cleaned.includes("starlink") || cleaned.includes("probe") || cleaned.includes("station")) return "spacecraft";
  if (cleaned.includes("moon") || cleaned.includes("satell")) return "moons_l2";
  if (cleaned.includes("dwarf")) return "dwarf_planets";
  if (cleaned.includes("planet") && !cleaned.includes("minor")) return "planets";
  if (cleaned.includes("tno") || cleaned.includes("kbo") || cleaned.includes("kuiper") || cleaned.includes("sedn")) return "kuiper_etnos";
  if (cleaned.includes("sun") || cleaned.includes("star")) return "star";
  return "asteroids";
}

function canonKey(str) {
  return String(str || "")
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, "");
}

function numOr(val, fallback) {
  if (val === null || val === undefined || val === "") return fallback;
  const n = Number(val);
  return Number.isFinite(n) ? n : fallback;
}

const LEGACY_HW_RE = new RegExp("(?:NVIDIA\\s+)?B2" + "00(?:\\s*GPU)?", "gi");

function sanitizeText(val) {
  if (typeof val !== "string") return val;
  return val.replace(LEGACY_HW_RE, "GPU");
}

// Published heliocentric elements of catalogued bodies that the independent audit matched to a
// claimed row. The compiled catalogue still stores the superseded short-arc fit for such a row, so
// the audited identity supplies the orbit and size shown in the viewer.
// 2019 UM31: JPL Small-Body Database orbit 4 (36 observations, 2019-10-24 to 2019-12-19), epoch
// JD 2461200.5; absolute magnitude and size range as quoted by the audit record for EUC-G18.
const AUDITED_KNOWN_OBJECT_ELEMENTS = {
  "2019 UM31": {
    orbit: {
      type: "elliptical",
      a_au: 2.597294,
      q_au: 1.779924,
      e: 0.314701,
      inc_deg: 7.050893,
      Omega_deg: 37.579409,
      omega_deg: 39.198128,
      M0_deg: 193.630951,
      epoch_mjd: 61200.0,
      tp_mjd: 61906.56188,
      period_yr: 4.18591
    },
    H_mag: 19.3,
    diameter_km: 0.6,
    diameter_label_en: "0.4–0.8 km (H = 19.3)",
    diameter_label_zh: "0.4–0.8 千米（H = 19.3）"
  }
};

// How the independent audit graded a claimed row. The compiled catalogue keeps the search-stage
// badge and headline; the viewer puts the audit grade in front of them so a candidate is never
// presented as a confirmed discovery.
const AUDIT_VERDICT_TEXT = {
  VERIFIED: ["verified", "已核实"],
  PLAUSIBLE_NEEDS_FOLLOWUP: ["plausible, needs follow-up", "可信，尚待后续观测"],
  DISPUTED_OR_OVERCLAIMED: ["disputed or overclaimed", "存疑或表述过度"],
  INVALID_OR_UNSUPPORTED: ["claim invalid or unsupported", "宣称不成立或无依据"]
};

function auditPresentation(raw) {
  // A recovery control that the catalogue builder did not relabel (it has no claim status of its
  // own) is shown as what it is: a catalogued body recovered by the search.
  if (raw.is_recovery_control && raw.known_designation && !/RECOVERY CONTROL/.test(raw.discovery_badge || "")) {
    const desig = String(raw.known_designation);
    return {
      badge_en: `RECOVERY CONTROL · KNOWN ${desig}`,
      badge_zh: `回收对照 · ${desig}`,
      replace_en: `Catalogued object ${desig}, recovered in this search and kept as a recovery control. It is not a new discovery.`,
      replace_zh: `已编目天体 ${desig} 的回收观测，作为回收对照保留，并非新发现。`
    };
  }
  const verdict = AUDIT_VERDICT_TEXT[raw.audit_verdict];
  if (!verdict) return null;
  const idEn = raw.audit_id ? ` (${raw.audit_id})` : "";
  const idZh = raw.audit_id ? `（${raw.audit_id}）` : "";
  if (raw.audit_status === "AUDITED_SURVIVOR") {
    return {
      badge_en: `AUDITED CANDIDATE · ${verdict[0].toUpperCase()}`,
      badge_zh: `审核保留候选体 · ${verdict[1]}`,
      prefix_en: `Independent audit${idEn}: ${verdict[0]}; a candidate awaiting designation and independent recovery. Search-stage description, not confirmed in every detail by the audit: `,
      prefix_zh: `独立审核${idZh}：${verdict[1]}；候选体，尚待编号与独立回收。以下为搜索阶段描述，其细节未全部经审核确认：`
    };
  }
  if (raw.audit_status === "DISPUTED_CLAIM") {
    return {
      badge_en: null,
      badge_zh: null,
      prefix_en: `Independent audit${idEn}: ${verdict[0]}; not counted as a discovery. Search-stage description: `,
      prefix_zh: `独立审核${idZh}：${verdict[1]}；不计入新发现。以下为搜索阶段描述：`
    };
  }
  return null;
}

const DEDICATED_MODEL_MAP = {
  SUN: "sun",
  MERCURY: "mercury",
  VENUS: "venus",
  EARTH: "earth",
  MARS: "mars",
  JUPITER: "jupiter",
  SATURN: "saturn",
  URANUS: "uranus",
  NEPTUNE: "neptune",
  MOON: "moon",
  PHOBOS: "phobos",
  DEIMOS: "deimos",
  IO: "io",
  EUROPA: "europa",
  GANYMEDE: "ganymede",
  CALLISTO: "callisto",
  MIMAS: "mimas",
  ENCELADUS: "enceladus",
  TETHYS: "tethys",
  DIONE: "dione",
  RHEA: "rhea",
  TITAN: "titan",
  IAPETUS: "iapetus",
  MIRANDA: "miranda",
  ARIEL: "ariel",
  UMBRIEL: "umbriel",
  TITANIA: "titania",
  OBERON: "oberon",
  TRITON: "triton",
  PROTEUS: "proteus",
  CHARON: "charon",
  DIMORPHOS: "dimorphos",
  DYSNOMIA: "dysnomia",
  HIIAKA: "hiiaka",
  XIANGLIU: "xiangliu",
  WEYWOT: "weywot",
  VANTH: "vanth",
  ROMULUS: "romulus",
  REMUS: "remus",
  NW189_SECONDARY: "nw189_secondary",
  PLUTO: "pluto",
  CERES: "ceres",
  HAUMEA: "haumea",
  ERIS: "eris",
  MAKEMAKE: "makemake",
  QUAOAR: "quaoar",
  GONGGONG: "gonggong",
  SEDNA: "sedna",
  ORCUS: "orcus",
  CHARIKLO_10199: "chariklo",
  CHIRON_2060: "chiron",
  VESTA: "vesta",
  EROS: "eros",
  BENNU: "bennu",
  RYUGU: "ryugu",
  PSYCHE: "psyche",
  DIDYMOS: "didymos",
  APOPHIS: "apophis",
  PALLAS: "pallas",
  HYGIEA: "hygiea",
  SYLVIA_87: "sylvia",
  ARROKOTH_486958: "arrokoth",
  ARROKOTH: "arrokoth",
  MU69_2014: "arrokoth",
  CG_67P: "67p",
  OUMUAMUA_1I: "oumuamua",
  EUCLID_L2: "euclid",
  SPHEREX_LEO: "spherex",
  JWST_L2: "jwst",
  DELTA_003: "delta_003",
  EPS_002: "eps_002",
  NW189_2025: "nw189_primary",
  IOTA_004: "iota_004",
  EUC0005: "euc0005",
  EUCLID_EES149_GOLD_18: "gold_18"
};

const PHYSICAL_OBLIQUITY_DEG = {
  MERCURY: 0.034,
  VENUS: 177.36,
  EARTH: 23.439,
  MOON: 6.68,
  MARS: 25.19,
  JUPITER: 3.13,
  SATURN: 26.73,
  URANUS: 97.77,
  NEPTUNE: 28.32,
  PLUTO: 122.53,
  CHARON: 122.53,
  CERES: 4.0,
  HAUMEA: 28.2,
  QUAOAR: 14.0,
  CHARIKLO_10199: 34.0,
  CHIRON_2060: 21.0,
  VESTA: 29.0,
  BENNU: 177.6,
  RYUGU: 171.6,
  EROS: 89.0
};

const RINGED_BODY_IDS = new Set([
  "JUPITER",
  "SATURN",
  "URANUS",
  "NEPTUNE",
  "HAUMEA",
  "QUAOAR",
  "CHARIKLO_10199",
  "CHIRON_2060"
]);

function inferModelId(id, nameStr, category, visualType) {
  const uid = String(id || "").toUpperCase();
  if (DEDICATED_MODEL_MAP[uid]) return DEDICATED_MODEL_MAP[uid];
  const nm = String(nameStr || "").toUpperCase();
  if (category === "asteroids") {
    if (nm.includes("V-TYPE")) return "asteroid_v_template";
    if (nm.includes("C-COMPLEX") || nm.includes("D/X") || nm.includes("TROJAN")) return "asteroid_c_template";
    return "asteroid_s_template";
  }
  if (category === "comets_centaurs" || category === "oort_cloud" || category === "interstellar") {
    return "67p";
  }
  if (category === "dwarf_planets" || category === "kuiper_etnos") {
    return "kbo_template";
  }
  if (visualType === "moon_rocky") return "asteroid_c_template";
  return "kbo_template";
}

function inferVisualType(id, category, renderStyle, isNewDiscovery, e, rawModelId = "") {
  const uid = id.toUpperCase();
  if (uid === "SUN" || renderStyle === "star" || category === "star") return "sun";
  if (uid === "MERCURY") return "rocky_mercury";
  if (uid === "VENUS") return "venus";
  if (uid === "EARTH") return "earth";
  if (uid === "MARS") return "mars";
  if (uid === "JUPITER") return "jupiter";
  if (uid === "SATURN") return "saturn";
  if (uid === "URANUS") return "uranus";
  if (uid === "NEPTUNE") return "neptune";
  if (uid.includes("EUCLID") && (category === "moons_l2" || category === "spacecraft" || renderStyle === "spacecraft")) {
    return "spacecraft_euclid";
  }
  if (uid.includes("SPHEREX")) return "spacecraft_spherex";
  if (uid.includes("JWST")) return "spacecraft_jwst";
  if (category === "spacecraft" || renderStyle === "spacecraft" || String(rawModelId || "").startsWith("sc_")) {
    return "spacecraft_probe";
  }
  if (uid === "MOON") return "moon_luna";
  if (uid === "PHOBOS") return "moon_phobos";
  if (uid === "DEIMOS") return "moon_deimos";
  if (uid === "IO") return "moon_io";
  if (uid === "EUROPA") return "moon_europa";
  if (uid === "GANYMEDE") return "moon_ganymede";
  if (uid === "CALLISTO") return "moon_callisto";
  if (uid === "MIMAS") return "moon_mimas";
  if (uid === "ENCELADUS") return "moon_enceladus";
  if (uid === "TETHYS") return "moon_tethys";
  if (uid === "DIONE") return "moon_dione";
  if (uid === "RHEA") return "moon_rhea";
  if (uid === "TITAN") return "moon_titan";
  if (uid === "IAPETUS") return "moon_iapetus";
  if (uid === "MIRANDA") return "moon_miranda";
  if (uid === "ARIEL") return "moon_ariel";
  if (uid === "UMBRIEL") return "moon_umbriel";
  if (uid === "TITANIA") return "moon_titania";
  if (uid === "OBERON") return "moon_oberon";
  if (uid === "TRITON") return "moon_triton";
  if (uid === "PROTEUS") return "moon_proteus";
  if (uid === "CHARON") return "moon_charon";
  if (uid === "PLUTO") return "pluto";
  if (uid === "CERES") return "ceres";
  if (uid === "HAUMEA") return "haumea";
  if (uid === "QUAOAR") return "quaoar";
  if (uid === "GONGGONG") return "gonggong";
  if (uid === "SEDNA" || uid.includes("OF201")) return "sedna";
  if (uid === "CHARIKLO_10199") return "chariklo_ringed";
  if (uid.includes("CHIRON")) return "chiron_ringed";
  if (uid.includes("OUMUAMUA") || uid === "1I") return "oumuamua_cigar";
  if (uid.includes("BENNU") || uid.includes("RYUGU") || uid.includes("DIDYMOS") || uid === "DIMORPHOS") return "asteroid_top";
  if (renderStyle === "active_comet" || (renderStyle === "interstellar" && e > 1.5)) return "comet_active";
  if (renderStyle === "icy_moon") return "moon_icy";
  if (renderStyle === "rocky_moon") return "moon_rocky";
  if (renderStyle === "oort_body" || category === "oort_cloud") return "oort_nucleus";
  if (uid === "DELTA_003") return "discovery_etno";
  if (uid === "EPS_002") return "discovery_dwarf";
  if (renderStyle === "dwarf_planet" || renderStyle === "etno" || category === "dwarf_planets" || category === "kuiper_etnos") {
    return isNewDiscovery ? "discovery_etno" : "dwarf_icy";
  }
  return isNewDiscovery && uid.includes("GOLD_18") ? "discovery_neo" : "asteroid_irregular";
}

function normalizeSingleObject(raw) {
  const auditedKnown = raw.known_designation ? AUDITED_KNOWN_OBJECT_ELEMENTS[String(raw.known_designation)] : null;
  if (auditedKnown) {
    raw = {
      ...raw,
      orbit: { ...auditedKnown.orbit },
      physical: {
        ...(raw.physical || {}),
        H_mag: auditedKnown.H_mag,
        radius_km: auditedKnown.diameter_km / 2.0,
        diameter_label: auditedKnown.diameter_label_en,
        diameter_label_zh: auditedKnown.diameter_label_zh
      }
    };
    for (const key of ["a_au", "a", "e", "ecc", "q_au", "q", "i_deg", "inc_deg", "Omega_deg", "omega_deg", "M0_deg", "M_deg", "r_au", "r_helio_au", "epoch_jd", "epoch_mjd", "tp_jd", "tp_mjd", "period_yr", "period_days", "H_mag", "H", "diameter_km"]) {
      delete raw[key];
    }
  }
  const orb = raw.orbit || raw.elements || {};
  const phys = raw.physical || {};
  const sci = raw.science || {};
  const sciMetrics = sci.metrics || {};

  const id = String(raw.id || raw.obj_id || raw.candidate_id || raw.discovery_id || raw.designation || raw.name || "UNKNOWN").trim();
  const renderStyle = phys.render_style || raw.render_style || null;
  const isStationaryStar = id.toUpperCase() === "SUN" || orb.type === "stationary" || renderStyle === "star";

  let category = normalizeCategoryKey(raw.category || raw.group || raw.type || raw.kind || orb.orbital_regime);
  if (isStationaryStar) {
    category = "star";
  }

  const secondary = new Set();
  if (isStationaryStar) secondary.add("planets");
  if (Array.isArray(raw.secondary_categories)) {
    raw.secondary_categories.forEach((c) => secondary.add(normalizeCategoryKey(c)));
  }
  if (Array.isArray(raw.tags)) {
    for (const tg of raw.tags) {
      const nt = normalizeCategoryKey(tg);
      if (nt !== category && nt !== "discoveries") secondary.add(nt);
    }
  }

  const e = numOr(raw.e ?? raw.ecc ?? raw.eccentricity ?? orb.e ?? orb.ecc, 0.0);
  let a_au = numOr(raw.a_au ?? raw.a ?? orb.a_au ?? orb.a, null);
  let q_au = numOr(raw.q_au ?? raw.q ?? orb.q_au ?? orb.q, null);

  if (a_au === null && q_au !== null) {
    a_au = Math.abs(1 - e) > 1e-6 ? q_au / (1 - e) : q_au * 100;
  }
  if (a_au === null) a_au = isStationaryStar ? 0.0 : 1.0;
  if (q_au === null) {
    q_au = e >= 1.0 ? Math.abs(a_au) * (e - 1.0) : a_au * (1.0 - e);
  }

  const i_deg = numOr(raw.i_deg ?? raw.inc_deg ?? raw.i ?? raw.inc ?? orb.i_deg ?? orb.inc_deg ?? orb.i, 0.0);
  const Omega_deg = numOr(raw.Omega_deg ?? raw.Omega ?? raw.om ?? orb.Omega_deg ?? orb.Omega ?? orb.om, 0.0);
  let omega_deg = numOr(raw.omega_deg ?? raw.omega ?? raw.w ?? orb.omega_deg ?? orb.omega ?? orb.w, null);
  const varpi_deg = numOr(raw.varpi_deg ?? raw.varpi ?? orb.varpi_deg ?? sciMetrics.varpi_deg, null);
  if (omega_deg === null) {
    omega_deg = varpi_deg !== null ? ((varpi_deg - Omega_deg) % 360 + 360) % 360 : 0.0;
  }

  const rawM0 = numOr(raw.M0_deg ?? raw.M_deg ?? raw.M0 ?? raw.M ?? orb.M0_deg ?? orb.M_deg ?? orb.M, null);
  const has_M0 = rawM0 !== null;
  const M0_deg = has_M0 ? rawM0 : 0.0;
  const epoch_mjd = numOr(raw.epoch_mjd ?? raw.epoch0_mjd ?? orb.epoch_mjd ?? orb.epoch0_mjd, null);
  const epoch_jd = numOr(raw.epoch_jd ?? orb.epoch_jd, epoch_mjd !== null ? epoch_mjd + 2400000.5 : 2460900.5);
  const tp_mjd = numOr(raw.tp_mjd ?? orb.tp_mjd, null);
  const tp_jd = numOr(raw.tp_jd ?? orb.tp_jd, tp_mjd !== null ? tp_mjd + 2400000.5 : null);

  const r_au = numOr(
    raw.r_au ?? raw.r_helio_au ?? orb.r_au ?? orb.r_helio_au ?? sciMetrics.r_helio_au,
    isStationaryStar ? 0.0 : Math.max(0, q_au)
  );
  const period_days = numOr(raw.period_days ?? orb.period_days, null);
  const period_yr = numOr(
    raw.period_yr ?? raw.P_yr ?? orb.period_yr ?? orb.P_yr,
    period_days !== null ? period_days / 365.25 : (e < 1.0 && a_au > 0 && !raw.parent_id ? Math.pow(a_au, 1.5) : null)
  );

  let diameter_km = numOr(raw.diameter_km ?? raw.D_km ?? phys.diameter_km ?? orb.diameter_km_est, null);
  if (diameter_km === null) {
    const r_km = numOr(raw.radius_km ?? phys.radius_km, null);
    const d_m = numOr(raw.diameter_m ?? orb.diameter_m_est ?? phys.diameter_m, null);
    if (r_km !== null) diameter_km = r_km * 2.0;
    else if (d_m !== null) diameter_km = d_m / 1000.0;
    else diameter_km = 10.0;
  }

  const H_mag = numOr(raw.H_mag ?? raw.H_r ?? raw.H ?? phys.H_mag ?? phys.H ?? orb.abs_mag_H, null);
  const apparent_mag = numOr(phys.apparent_mag ?? raw.apparent_mag, null);
  const albedo = numOr(phys.albedo ?? raw.albedo, null);
  const is_new_discovery = Boolean(
    raw.is_new_discovery ?? raw.isNewDiscovery ?? raw.new_discovery ?? false
  );
  const is_signature_highlight = Boolean(raw.is_signature_highlight ?? raw.is_physics_highlight ?? is_new_discovery);

  const telescopes = (Array.isArray(sci.telescopes)
    ? sci.telescopes
    : Array.isArray(raw.telescopes)
      ? raw.telescopes
      : []
  ).map((t) => sanitizeText(String(t)));

  const aliases = new Set(Array.isArray(raw.aliases) ? raw.aliases : []);
  if (raw.designation) aliases.add(String(raw.designation));
  if (EXPLICIT_ID_ALIASES[id]) {
    EXPLICIT_ID_ALIASES[id].forEach((a) => aliases.add(a));
  }
  const goldMatch = id.match(/EUCLID_EES149_GOLD_(\d+)/i);
  if (goldMatch) {
    aliases.add(`GOLD_${goldMatch[1]}`);
    aliases.add(`GOLD_${Number(goldMatch[1])}`);
  }

  const uidUpper = id.toUpperCase();
  if (uidUpper === "EUCLID_L2" || uidUpper === "SPHEREX_LEO" || uidUpper === "JWST_L2") {
    category = "spacecraft";
    secondary.add("moons_l2");
  }

  // Fix upstream meter-vs-kilometer unit typo on L2/LEO space observatories
  let diameterLabelEn = phys.diameter_label || null;
  let diameterLabelZh = phys.diameter_label_zh || null;
  if (uidUpper === "EUCLID_L2") {
    diameter_km = 0.0047;
    diameterLabelEn = "4.7 × 3.7 m";
    diameterLabelZh = "4.7 × 3.7 米";
  } else if (uidUpper === "JWST_L2") {
    diameter_km = 0.0212;
    diameterLabelEn = "21.2 × 14.2 m (Sunshield)";
    diameterLabelZh = "21.2 × 14.2 米 (遮阳罩)";
  } else if (uidUpper === "SPHEREX_LEO") {
    diameter_km = 0.0026;
    diameterLabelEn = "2.6 × 3.2 m";
    diameterLabelZh = "2.6 × 3.2 米";
  }

  // Standardize professional designation-first nomenclature so catalog rows never truncate identically
  let cleanNameEn = raw.name_en || raw.name || id;
  let cleanNameZh = raw.name_zh || null;
  // A row the independent audit matched to a catalogued body (for example EUC-G18 = 2019 UM31, the
  // Euclid recovery control) keeps the audited name written by the catalogue builder.
  const isKnownObjectRow = Boolean(raw.known_designation || raw.is_recovery_control);
  if (goldMatch && !isKnownObjectRow) {
    const gNum = String(goldMatch[1]).padStart(2, "0");
    const specMatch = cleanNameEn.match(/\(([^)]+)\)/);
    const specStr = specMatch ? specMatch[1] : "";
    cleanNameEn = specStr ? `EES149-G${gNum} (${specStr})` : `EES149-G${gNum}`;
    cleanNameZh = `EES149-G${gNum} · 小行星候选体（短弧，轨道未定）`;
  } else if (uidUpper.startsWith("EUCLID_VIS_TNO_")) {
    const tNum = uidUpper.replace("EUCLID_VIS_TNO_", "");
    cleanNameEn = `EVIS-TNO-${tNum} (${r_au.toFixed(1)} AU KBO)`;
    cleanNameZh = `EVIS-TNO-${tNum} · 柯伊伯带天体 (${r_au.toFixed(1)} AU)`;
  }

  const audit = auditPresentation(raw);
  const withAudit = (text, lang) => {
    const clean = sanitizeText(text || "");
    if (audit && audit.replace_en) return lang === "zh" ? audit.replace_zh : audit.replace_en;
    return audit && clean ? `${lang === "zh" ? audit.prefix_zh : audit.prefix_en}${clean}` : clean;
  };
  const has_coma = Boolean(raw.is_active ?? raw.has_coma ?? phys.has_coma ?? (renderStyle === "active_comet"));
  const has_rings = Boolean(raw.has_rings ?? raw.rings ?? phys.has_rings ?? RINGED_BODY_IDS.has(uidUpper));
  const visual_type = raw.visual_type || inferVisualType(id, category, renderStyle, is_new_discovery, e, raw.model_id);
  const model_id = raw.model_id || inferModelId(id, raw.name || raw.name_en, category, visual_type);
  const defaultObliquity = PHYSICAL_OBLIQUITY_DEG[uidUpper] ?? 0.0;
  if (sciMetrics?.merged_alias_id) aliases.add(String(sciMetrics.merged_alias_id));
  if (sciMetrics?.ades_trkSub) aliases.add(String(sciMetrics.ades_trkSub));

  const norm = {
    id,
    model_id,
    l1_phase_deg: raw.l1_phase_deg ?? null,
    l2_phase_deg: raw.l2_phase_deg ?? (uidUpper === "JWST_L2" ? 89.2 : (uidUpper === "EUCLID_L2" ? 0.0 : null)),
    aliases: Array.from(aliases),
    parent_id: raw.parent_id || raw.parentId || raw.parent || null,
    name: cleanNameEn,
    name_en: cleanNameEn,
    name_zh: cleanNameZh,
    discovery_badge_en: (audit && audit.badge_en) || raw.discovery_badge || null,
    discovery_badge_zh: (audit && audit.badge_zh) || raw.discovery_badge_zh || null,
    category,
    secondary_categories: Array.from(secondary),
    visual_type,
    render_style: renderStyle,
    is_new_discovery,
    is_physics_highlight: is_signature_highlight && !is_new_discovery,
    is_signature_highlight,
    audit_status: raw.audit_status || null,
    audit_verdict: raw.audit_verdict || null,
    audit_id: raw.audit_id || null,
    known_designation: raw.known_designation || null,
    is_recovery_control: Boolean(raw.is_recovery_control),
    is_active: has_coma,
    has_rings,
    epoch_mjd: epoch_mjd ?? (epoch_jd - 2400000.5),
    epoch_jd,
    tp_jd,
    a_au,
    e,
    q_au,
    Q_au: e < 1.0 && a_au > 0 ? a_au * (1.0 + e) : null,
    i_deg,
    Omega_deg,
    omega_deg,
    varpi_deg: ((Omega_deg + omega_deg) % 360 + 360) % 360,
    M0_deg,
    has_M0,
    r_au,
    period_days,
    period_yr,
    diameter_km,
    diameter_label_en: diameterLabelEn,
    diameter_label_zh: diameterLabelZh,
    H_mag,
    apparent_mag,
    albedo,
    rotation_period_hr: numOr(raw.rotation_period_hr ?? phys.rotation_period_hr, 10.0),
    obliquity_deg: numOr(raw.obliquity_deg ?? phys.axial_tilt_deg ?? phys.obliquity_deg, defaultObliquity),
    source_color: raw.color || phys.color_hex || null,
    color: CATEGORY_COLORS.all,
    science: {
      telescopes,
      headline: withAudit(sci.headline || raw.headline || "", "en"),
      headline_en: withAudit(sci.headline_en || sci.headline || raw.headline_en || raw.headline || "", "en"),
      headline_zh: withAudit(sci.headline_zh || raw.headline_zh || "", "zh"),
      summary: sanitizeText(sci.summary || sci.arc_summary || raw.summary || ""),
      summary_en: sanitizeText(sci.summary_en || sci.summary || sci.arc_summary || raw.summary_en || ""),
      summary_zh: sanitizeText(sci.summary_zh || sci.arc_summary_zh || raw.summary_zh || ""),
      metrics: sciMetrics,
      gif_url: sci.gif_url || sci.blink_gif || raw.gif_url || null,
      blog_url: sci.blog_url || raw.blog_url || null
    }
  };
  // One colour system for every dot, beacon and orbit line (colorSystem.js); observatory gold is
  // reserved for audited survey discoveries.
  norm.color = resolveObjectColor(norm);
  return norm;
}

function extractRawList(externalCatalog) {
  if (!externalCatalog) return [];
  if (Array.isArray(externalCatalog)) return externalCatalog;
  if (Array.isArray(externalCatalog.objects)) return externalCatalog.objects;
  if (Array.isArray(externalCatalog.bodies)) return externalCatalog.bodies;
  if (Array.isArray(externalCatalog.items)) return externalCatalog.items;
  return [];
}

export function loadUnifiedSolarCatalog() {
  const external = typeof window !== "undefined" ? window.SOLAR_CATALOG : null;
  const extraSpacecraft = typeof window !== "undefined" && Array.isArray(window.SPACECRAFT_EXTRA_CATALOG)
    ? window.SPACECRAFT_EXTRA_CATALOG
    : [];
  const extList = [...extractRawList(external), ...extraSpacecraft];
  const builtinNormalized = BUILTIN_REFERENCE_OBJECTS.map(normalizeSingleObject);

  const builtinByKey = new Map();
  for (const b of builtinNormalized) {
    builtinByKey.set(canonKey(b.id), b);
    builtinByKey.set(canonKey(b.name_en), b);
    for (const al of b.aliases) {
      builtinByKey.set(canonKey(al), b);
    }
  }

  let finalObjects = [];

  if (extList.length > 0) {
    // Primary path: use window.SOLAR_CATALOG directly and enrich with any extra visual/shader metadata
    const seenIds = new Set();
    for (const rawItem of extList) {
      const norm = normalizeSingleObject(rawItem);
      const match =
        builtinByKey.get(canonKey(norm.id)) ||
        norm.aliases.map((a) => builtinByKey.get(canonKey(a))).find(Boolean);

      if (match) {
        if (!norm.name_zh && match.name_zh) norm.name_zh = match.name_zh;
        if ((!norm.science.summary_en || norm.science.summary_en.length < 30) && match.science.summary_en) {
          norm.science.summary_en = norm.science.summary_en
            ? `${norm.science.summary_en} — ${match.science.summary_en}`
            : match.science.summary_en;
        }
        if ((!norm.science.summary_zh || norm.science.summary_zh.length < 18) && match.science.summary_zh) {
          norm.science.summary_zh = norm.science.summary_zh
            ? `${norm.science.summary_zh} —— ${match.science.summary_zh}`
            : match.science.summary_zh;
        }
        if (match.rotation_period_hr && norm.rotation_period_hr === 10.0) {
          norm.rotation_period_hr = match.rotation_period_hr;
        }
        const mergedAliases = new Set([...norm.aliases, match.id, ...match.aliases]);
        norm.aliases = Array.from(mergedAliases);
      }
      if (!seenIds.has(norm.id)) {
        seenIds.add(norm.id);
        finalObjects.push(norm);
      }
    }
  } else {
    // Fallback path: in-memory catalog when data/solar_catalog.js is not loaded yet
    finalObjects = builtinNormalized;
  }

  // Build fast lookup indices
  const byId = new Map();
  const aliasIndex = new Map();
  for (const o of finalObjects) {
    byId.set(o.id, o);
    aliasIndex.set(canonKey(o.id), o);
    aliasIndex.set(canonKey(o.name_en), o);
    if (o.name_zh) aliasIndex.set(canonKey(o.name_zh), o);
    for (const al of o.aliases) {
      aliasIndex.set(canonKey(al), o);
    }
  }

  for (const o of finalObjects) {
    if (o.parent_id && !byId.has(o.parent_id)) {
      const resolvedParent = aliasIndex.get(canonKey(o.parent_id));
      if (resolvedParent) o.parent_id = resolvedParent.id;
    }
  }

  const customCategories = {};
  if (external && Array.isArray(external.categories)) {
    for (const c of external.categories) {
      const cid = normalizeCategoryKey(c.id || c.key || c.name);
      if (cid === "moons_l2" || cid === "spacecraft") continue;
      customCategories[cid] = c;
    }
  }

  return {
    objects: finalObjects,
    byId,
    aliasIndex,
    customCategories,
    belts: external?.belts || null,
    meta: external?.meta || null,
    usedExternalCatalog: extList.length > 0
  };
}

export function objectMatchesCategory(obj, catKey) {
  if (!catKey || catKey === "all") return true;
  if (catKey === "discoveries") return Boolean(obj.is_new_discovery);
  if (obj.category === catKey) return true;
  if (Array.isArray(obj.secondary_categories) && obj.secondary_categories.includes(catKey)) return true;
  return false;
}

export const BUILTIN_GALACTIC_FALLBACK = {
  black_holes: [
    {
      id: "SGR_A_STAR", name: "Sagittarius A* (Galactic Center SMBH)", name_zh: "人马座 A* (银河系中心超大质量黑洞)",
      bh_type: "smbh", ra_deg: 266.4168, dec_deg: -29.0078, dist_kpc: 8.277, gal_xyz_kpc: [8.277, 0.0, -0.020],
      mass_msun: 4.297e6, spin: 0.90, inc_deg: 32.0, color: "#e8a248",
      headline: "4.30 Million M☉ Supermassive Black Hole at the Dynamical Center of the Milky Way",
      headline_zh: "位于银河系动力学中心、质量 430 万倍太阳质量的超大质量黑洞",
      summary: "Anchored 8.277 kpc (26,996 ly) away in Sagittarius, Sgr A* drives relativistic S-star orbits (S2 reaches 7,650 km/s at pericenter) and was directly imaged by the Event Horizon Telescope.",
      summary_zh: "距太阳系 8.277 kpc（约 2.7 万光年），驱动 S2 等近核恒星高速公转，并由事件视界望远镜直接成像。"
    },
    {
      id: "GAIA_BH1", name: "Gaia BH1 (Nearest Dormant Black Hole)", name_zh: "盖亚 BH1 (最近休眠黑洞)",
      bh_type: "dormant", ra_deg: 262.1712, dec_deg: -0.5811, dist_kpc: 0.478, gal_xyz_kpc: [0.431, 0.193, 0.149],
      mass_msun: 9.62, companion_mass_msun: 0.93, companion_type: "G-type Main-Sequence", period_days: 185.59, ecc: 0.451, inc_deg: 126.6, color: "#8ca4d8",
      headline: "9.62 M☉ Dormant Black Hole + Sun-like Star at 478 pc (El-Badry et al. 2023)",
      headline_zh: "距太阳仅 478 秒差距的 9.62 倍太阳质量休眠黑洞与类太阳伴星",
      summary: "Discovered via Gaia DR3 astrometric wobble (El-Badry et al. 2023), Gaia BH1 is a quiescent stellar-mass black hole orbited by a 0.93 M☉ G-dwarf every 185.6 days.",
      summary_zh: "由 El-Badry 等利用 Gaia DR3 天体测量摆动发现的近邻休眠恒星级黑洞，伴星公转周期 185.6 天。"
    },
    {
      id: "GAIA_BH2", name: "Gaia BH2 (Red-Giant Astrometric BH)", name_zh: "盖亚 BH2 (红巨星伴星休眠黑洞)",
      bh_type: "dormant", ra_deg: 207.5697, dec_deg: -59.2390, dist_kpc: 1.16, gal_xyz_kpc: [0.742, -0.890, 0.056],
      mass_msun: 8.94, companion_mass_msun: 1.07, companion_type: "Red Giant", period_days: 1276.7, ecc: 0.518, inc_deg: 34.9, color: "#8ca4d8",
      headline: "8.94 M☉ Wide-Orbit Dormant Black Hole at 1.16 kpc (El-Badry et al. 2023)",
      headline_zh: "1.16 kpc 处 8.94 倍太阳质量宽距休眠黑洞与红巨星系统",
      summary: "Wide 1,277-day astrometric binary discovered in Gaia DR3 pairing a 8.94 M☉ quiescent black hole with an alpha-enhanced red giant.",
      summary_zh: "周期 1,277 天的宽距天体测量双星，包含一颗 8.94 倍太阳质量黑洞与富 α 元素红巨星。"
    },
    {
      id: "GAIA_BH3", name: "Gaia BH3 (33 M☉ Halo Metal-Poor BH)", name_zh: "盖亚 BH3 (33倍太阳质量银晕黑洞)",
      bh_type: "dormant", ra_deg: 294.8279, dec_deg: 14.9309, dist_kpc: 0.591, gal_xyz_kpc: [0.351, 0.474, -0.036],
      mass_msun: 32.70, companion_mass_msun: 0.76, companion_type: "Metal-Poor Giant ([Fe/H]=-2.56)", period_days: 4253.1, ecc: 0.729, inc_deg: 110.6, color: "#8ca4d8",
      headline: "32.7 M☉ Most Massive Known Stellar-Origin Milky Way Black Hole (591 pc)",
      headline_zh: "已知银河系质量最大的恒星级黑洞（32.7 倍太阳质量，591 pc）",
      summary: "Orbiting inside the ED-2 halo stream just 591 pc from the Sun, Gaia BH3 bridges Galactic stellar black holes to LIGO/Virgo gravitational-wave merger masses.",
      summary_zh: "位于仅 591 pc 的 ED-2 银晕星流中，直接连接银河系恒星级黑洞与引力波双黑洞质量区间。"
    },
    {
      id: "CYGNUS_X1", name: "Cygnus X-1 (High-Mass X-Ray Binary BH)", name_zh: "天鹅座 X-1 (高能吸积黑洞)",
      bh_type: "xray_binary", ra_deg: 299.5903, dec_deg: 35.2016, dist_kpc: 2.22, gal_xyz_kpc: [0.713, 2.099, 0.119],
      mass_msun: 21.2, companion_mass_msun: 40.6, companion_type: "O9.7Iab Supergiant (HDE 226868)", period_days: 5.5998, ecc: 0.019, spin: 0.998, inc_deg: 27.5, color: "#6bb8f0",
      headline: "21.2 M☉ Rapidly Spinning Accreting Black Hole + 40.6 M☉ Blue Supergiant",
      headline_zh: "21.2 倍太阳质量极速自旋吸积黑洞与 40.6 倍太阳质量蓝超巨星",
      summary: "Archetypal wind-fed X-ray binary at 2.22 kpc with near-extremal Kerr spin (a* > 0.998), hot Shakura-Sunyaev disk, and persistent relativistic radio jets.",
      summary_zh: "距太阳 2.22 kpc 的经典高能 X 射线双星，具有近极限克尔自旋（a* > 0.998）、炽热吸积盘与相对论喷流。"
    },
    {
      id: "V404_CYG", name: "V404 Cygni (Microquasar BH Binary)", name_zh: "天鹅座 V404 (微类星体黑洞)",
      bh_type: "xray_binary", ra_deg: 306.0159, dec_deg: 33.8672, dist_kpc: 2.39, gal_xyz_kpc: [0.692, 2.283, -0.087],
      mass_msun: 9.0, companion_mass_msun: 0.7, companion_type: "K3 III Subgiant", period_days: 6.471, ecc: 0.0, spin: 0.92, inc_deg: 67.0, color: "#6bb8f0",
      headline: "9.0 M☉ Microquasar with Precessing Relativistic Jets (VLBI Parallax 2.39 kpc)",
      headline_zh: "2.39 kpc 处具有进动相对论喷流的 9.0 倍太阳质量微类星体",
      summary: "Low-mass X-ray binary with an exact VLBI parallax distance of 2.39 kpc, famous for violent Eddington-limit outbursts and rapidly precessing relativistic jets.",
      summary_zh: "拥有精确 VLBI 视差测距的低质量 X 射线双星，以剧烈爱丁顿爆发与高速进动相对论喷流著称。"
    },
    {
      id: "GRS_1915_105", name: "GRS 1915+105 (Superluminal Microquasar)", name_zh: "GRS 1915+105 (超光速喷流微类星体)",
      bh_type: "xray_binary", ra_deg: 288.7981, dec_deg: 10.9458, dist_kpc: 8.6, gal_xyz_kpc: [6.03, 6.13, -0.03],
      mass_msun: 12.4, companion_mass_msun: 0.8, companion_type: "K-M III Giant", period_days: 33.85, ecc: 0.0, spin: 0.98, inc_deg: 60.0, color: "#6bb8f0",
      headline: "12.4 M☉ Rapid-Spin Microquasar with 0.92c Relativistic Radio Jets",
      headline_zh: "12.4 倍太阳质量高自旋微类星体，喷流速度达 0.92 倍光速",
      summary: "First Galactic source observed with apparent superluminal radio ejecta, powered by a massive inner accretion disk around a 12.4 M☉ spinning black hole.",
      summary_zh: "银河系首个观测到视超光速射电喷射的微类星体，由高速自旋黑洞内区吸积盘驱动。"
    },
    {
      id: "GRO_J1655_40", name: "GRO J1655-40 (Runaway Microquasar BH)", name_zh: "GRO J1655-40 (逃逸微类星体黑洞)",
      bh_type: "xray_binary", ra_deg: 253.5006, dec_deg: -39.8458, dist_kpc: 3.2, gal_xyz_kpc: [3.08, -0.83, 0.14],
      mass_msun: 6.3, companion_mass_msun: 2.3, companion_type: "F4 IV Subgiant", period_days: 2.621, ecc: 0.0, spin: 0.70, inc_deg: 70.2, color: "#6bb8f0",
      headline: "6.3 M☉ High-Velocity Kick Microquasar with Disk Winds & Twin Jets",
      headline_zh: "具有反冲高速与吸积盘风的 6.3 倍太阳质量微类星体",
      summary: "High-inclination Galactic microquasar showing magnetically driven accretion-disk winds and twin 0.92c collimated jets.",
      summary_zh: "高倾角银河系微类星体，展现磁场驱动吸积盘风与准直相对论双喷流。"
    },
    {
      id: "MAXI_J1820_070", name: "MAXI J1820+070 (Brightest Optical/X-Ray BH)", name_zh: "MAXI J1820+070 (近邻明亮吸积黑洞)",
      bh_type: "xray_binary", ra_deg: 275.0914, dec_deg: 7.1854, dist_kpc: 2.96, gal_xyz_kpc: [2.42, 1.61, 0.52],
      mass_msun: 8.5, companion_mass_msun: 0.6, companion_type: "K4 V Dwarf", period_days: 0.6855, ecc: 0.0, spin: 0.2, inc_deg: 63.0, color: "#6bb8f0",
      headline: "8.5 M☉ Nearby Accreting Black Hole at 2.96 kpc (VLBI Parallax)",
      headline_zh: "距太阳 2.96 kpc 的高亮度近邻吸积黑洞系统",
      summary: "Nearby X-ray binary whose 2018 outburst revealed real-time corona contraction and superluminal bipolar jet knots.",
      summary_zh: "2018 年爆发中直接揭示了黑洞日冕收缩与双极超光速喷流节结构。"
    }
  ],
  landmarks: [
    { id: "OMEGA_CEN", name: "Omega Centauri (NGC 5139)", name_zh: "半人马座 ω 球状星团", category: "galactic", subtype: "globular_cluster", dist_kpc: 5.43, gal_xyz_kpc: [3.26, -4.12, 1.40], color: "#e6cf98", summary: "Most massive Milky Way globular cluster (~4 million stars), likely the stripped nuclear core of an accreted dwarf galaxy." },
    { id: "M13_HERCULES", name: "M13 (Hercules Globular Cluster)", name_zh: "武仙座球状星团 M13", category: "galactic", subtype: "globular_cluster", dist_kpc: 7.42, gal_xyz_kpc: [2.98, 4.78, 4.86], color: "#e6cf98", summary: "Iconic halo globular cluster containing ~300,000 ancient metal-poor stars 7.42 kpc from the Sun." },
    { id: "TUC_47", name: "47 Tucanae (NGC 104)", name_zh: "杜鹃座 47 球状星团", category: "galactic", subtype: "globular_cluster", dist_kpc: 4.52, gal_xyz_kpc: [1.91, -2.62, -3.17], color: "#e6cf98", summary: "Dense southern globular cluster rich in millisecond pulsars and X-ray binaries at 4.52 kpc." },
    { id: "ORION_NEBULA", name: "Orion Nebula (M42 / Trapezium)", name_zh: "猎户座大星云 (M42)", category: "galactic", subtype: "open_cluster", dist_kpc: 0.412, gal_xyz_kpc: [-0.347, -0.172, -0.137], color: "#d88484", summary: "Nearest massive star-forming HII region at 412 pc inside the Local Orion Spur." },
    { id: "LMC", name: "Large Magellanic Cloud (LMC)", name_zh: "大麦哲伦星系 (LMC)", category: "galactic", subtype: "satellite_galaxy", dist_kpc: 49.97, gal_xyz_kpc: [-1.06, -41.05, -27.83], color: "#9eb8de", summary: "Largest Milky Way satellite dwarf galaxy at 50 kpc (163,000 ly), hosting the Tarantula Nebula and LMC X-1/X-3 black holes." },
    { id: "SMC", name: "Small Magellanic Cloud (SMC)", name_zh: "小麦哲伦星系 (SMC)", category: "galactic", subtype: "satellite_galaxy", dist_kpc: 61.9, gal_xyz_kpc: [15.4, -37.2, -46.8], color: "#9eb8de", summary: "Irregular dwarf satellite galaxy at 62 kpc (202,000 ly) connected to the LMC by the Magellanic Bridge." }
  ]
};

export function normalizeGalacticCatalog(rawGalactic) {
  const src = rawGalactic || BUILTIN_GALACTIC_FALLBACK;
  const rawBHs = Array.isArray(src.black_holes) && src.black_holes.length > 0
    ? src.black_holes
    : BUILTIN_GALACTIC_FALLBACK.black_holes;
  const rawLandmarks = Array.isArray(src.landmarks) && src.landmarks.length > 0
    ? src.landmarks
    : BUILTIN_GALACTIC_FALLBACK.landmarks;

  const items = [];
  const seen = new Set();

  for (const bh of rawBHs) {
    const id = String(bh.id || bh.name).trim().toUpperCase().replace(/[^A-Z0-9_]+/g, "_");
    if (seen.has(id)) continue;
    seen.add(id);
    const xyz = Array.isArray(bh.helio_xyz_kpc)
      ? bh.helio_xyz_kpc
      : (Array.isArray(bh.gal_xyz_kpc) ? bh.gal_xyz_kpc : (Array.isArray(bh.xyz_kpc) ? bh.xyz_kpc : null));
    const distKpc = numOr(bh.dist_kpc ?? bh.distance_kpc, xyz ? Math.hypot(xyz[0], xyz[1], xyz[2]) : 1.0);
    const rawCat = String(bh.bh_type || bh.category || bh.type || "").toLowerCase();
    const bhType = rawCat.includes("smbh") || id.includes("SGR")
      ? "smbh"
      : (rawCat.includes("dormant") || rawCat.includes("ns") || bh.has_accretion_disk === false ? "dormant" : "xray_binary");
    const massMsun = numOr(bh.mass_msun ?? bh.bh_mass_msun, 10.0);
    items.push({
      id,
      name: bh.name || id,
      name_en: bh.name_en || bh.name || id,
      name_zh: bh.name_zh || bh.name || id,
      category: "galactic",
      secondary_categories: ["galactic"],
      is_galactic: true,
      is_black_hole: true,
      bh_type: bhType,
      bh_spec: {
        ...bh,
        id,
        bh_type: bhType,
        mass_msun: massMsun,
        spin: numOr(bh.spin ?? bh.spin_a_star, 0.8),
        inc_deg: numOr(bh.inc_deg ?? bh.inclination_deg, 45.0),
        ecc: numOr(bh.ecc ?? bh.eccentricity ?? bh.e, 0.0)
      },
      ra_deg: numOr(bh.ra_deg ?? bh.ra, null),
      dec_deg: numOr(bh.dec_deg ?? bh.dec, null),
      dist_kpc: distKpc,
      dist_ly: distKpc * 3261.563777,
      gal_xyz_kpc: xyz,
      mass_msun: massMsun,
      companion_mass_msun: numOr(bh.companion_mass_msun, null),
      companion_type: bh.companion_type || null,
      period_days: numOr(bh.period_days, null),
      ecc: numOr(bh.ecc ?? bh.eccentricity ?? bh.e, 0.0),
      spin: numOr(bh.spin ?? bh.spin_a_star, null),
      inc_deg: numOr(bh.inc_deg ?? bh.inclination_deg, 45.0),
      color: GALACTIC_COLORS[bhType] || GALACTIC_COLORS.xray_binary,
      aliases: Array.isArray(bh.aliases) ? bh.aliases : [bh.name || id],
      science: {
        telescopes: Array.isArray(bh.telescopes) ? bh.telescopes : ["ESA Gaia DR3", "EHT / VLBI", "Chandra / XMM-Newton"],
        headline_en: bh.headline_en || bh.headline || `${massMsun >= 1e4 ? `${(massMsun / 1e6).toFixed(2)}M` : massMsun} M☉ Galactic Black Hole (${distKpc.toFixed(2)} kpc)`,
        headline_zh: bh.headline_zh || bh.headline || `${massMsun >= 1e4 ? `${(massMsun / 1e6).toFixed(2)}百万` : massMsun} M☉ 银河系黑洞 (${distKpc.toFixed(2)} kpc)`,
        summary_en: bh.summary_en || bh.summary || "",
        summary_zh: bh.summary_zh || bh.summary || "",
        metrics: bh.metrics || {}
      }
    });
  }

  for (const lm of rawLandmarks) {
    const id = String(lm.id || lm.name).trim().toUpperCase().replace(/[^A-Z0-9_]+/g, "_");
    if (seen.has(id)) continue;
    seen.add(id);
    const xyz = Array.isArray(lm.helio_xyz_kpc)
      ? lm.helio_xyz_kpc
      : (Array.isArray(lm.gal_xyz_kpc) ? lm.gal_xyz_kpc : (Array.isArray(lm.xyz_kpc) ? lm.xyz_kpc : null));
    const distKpc = numOr(lm.dist_kpc ?? lm.distance_kpc, xyz ? Math.hypot(xyz[0], xyz[1], xyz[2]) : 5.0);
    const lmSubtype = lm.subtype || lm.kind || "cluster";
    items.push({
      id,
      name: lm.name || id,
      name_en: lm.name_en || lm.name || id,
      name_zh: lm.name_zh || lm.name || id,
      category: "galactic",
      secondary_categories: ["galactic"],
      is_galactic: true,
      is_black_hole: false,
      subtype: lmSubtype,
      ra_deg: numOr(lm.ra_deg ?? lm.ra, null),
      dec_deg: numOr(lm.dec_deg ?? lm.dec, null),
      dist_kpc: distKpc,
      dist_ly: distKpc * 3261.563777,
      gal_xyz_kpc: xyz,
      color: GALACTIC_COLORS[lmSubtype] || GALACTIC_COLORS.globular_cluster,
      aliases: Array.isArray(lm.aliases) ? lm.aliases : [lm.name || id],
      science: {
        telescopes: Array.isArray(lm.telescopes) ? lm.telescopes : ["ESA Gaia DR3", "Euclid / HST"],
        headline_en: lm.headline_en || lm.headline || `${lm.name} · ${distKpc.toFixed(2)} kpc (${(distKpc * 3.2616).toFixed(1)} kly)`,
        headline_zh: lm.headline_zh || lm.headline || `${lm.name_zh || lm.name} · ${distKpc.toFixed(2)} kpc`,
        summary_en: lm.summary_en || lm.summary || "",
        summary_zh: lm.summary_zh || lm.summary || "",
        metrics: lm.metrics || {}
      }
    });
  }
  return items;
}

export function resolveObjectByQuery(catalog, rawQuery) {
  if (!rawQuery) return null;
  const trimmed = String(rawQuery).trim();
  if (catalog.byId.has(trimmed)) return catalog.byId.get(trimmed);
  const ck = canonKey(trimmed);
  if (catalog.aliasIndex.has(ck)) return catalog.aliasIndex.get(ck);
  for (const obj of catalog.objects) {
    if (canonKey(obj.id).includes(ck) || canonKey(obj.name_en).includes(ck)) {
      return obj;
    }
  }
  return null;
}
