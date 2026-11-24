// Astronomical Color System — single shared source of truth for the 3D Explorer, HUD, legend and studio.
// Pure data and pure functions (no imports, no DOM), so every renderer and the bare-V8 checks load it alike.
//
// Two physically grounded scales:
//   1. Planckian thermal scale (stars, Galactic populations, accretion disks, the Sun).
//   2. Solar System radial scale: warm rocky inner worlds -> amber gas giants -> cyan/cerulean icy
//      outer worlds -> cool silver Oort halo. Observatory gold is reserved for the optional survey layer.

export const DISCOVERY_GOLD = "#f4b942";
export const SUN_COLOR = "#ffd97d";

export const CATEGORY_COLORS = {
  all: "#94a3b8",
  discoveries: DISCOVERY_GOLD,
  galactic: "#8ca4d8",
  spacecraft: "#54b6de",
  planets: "#74b3e7",
  moons_l2: "#b4c3d8",
  dwarf_planets: "#93a8d8",
  asteroids: "#c4a46b",
  comets_centaurs: "#4ec4bd",
  interstellar: "#e07b6d",
  kuiper_etnos: "#5d92d6",
  oort_cloud: "#9db4ce",
  star: SUN_COLOR
};

export const PLANET_COLORS = {
  MERCURY: "#b8b2a6",
  VENUS: "#e9cf96",
  EARTH: "#4ca6ec",
  MARS: "#de764a",
  JUPITER: "#dfa66a",
  SATURN: "#e4c482",
  URANUS: "#6cc8d8",
  NEPTUNE: "#4f84db"
};

// Milky Way landmarks and compact objects, by physical type.
export const GALACTIC_COLORS = {
  smbh: "#e8a248",
  xray_binary: "#6bb8f0",
  dormant: "#8ca4d8",
  globular_cluster: "#e6cf98",
  open_cluster: "#d88484",
  satellite_galaxy: "#9eb8de"
};

// Reference distance rings follow the same radial scheme as the bodies that live there.
export const RING_COLORS = {
  au1: "#4ca6ec",
  jupiter: "#dfa66a",
  neptune: "#4f84db",
  kuiperCliff: "#5d92d6",
  mmr: DISCOVERY_GOLD,
  sednoid: "#93a8d8",
  hills: "#9db4ce",
  outerOort: "#c2d2e3"
};

// Earth-orbit operator families (index order = build_spacecraft_and_constellations FAMILY_DEFS 0..11).
export const SAT_FAMILY_COLORS_HEX = [
  "#54b6de", // 0: SpaceX Starlink
  "#5fc3cf", // 1: SpaceX Starshield / Swarm / Dragon
  "#8fa3d4", // 2: Eutelsat OneWeb
  "#5bb8a8", // 3: Amazon Kuiper
  "#c9a56a", // 4: CN commercial constellations
  "#62a99a", // 5: Direct-to-device / voice / IoT
  "#6f9bd1", // 6: Earth observation / SAR
  "#a7b0c4", // 7: GEO / MEO communications
  "#cf9f62", // 8: GNSS
  "#e6d39a", // 9: Space stations
  "#58c2b4", // 10: Space telescopes
  "#94a3b8"  // 11: Civil / weather / academic
];

export function hexToRGB01(hex, out = [0, 0, 0], offset = 0) {
  let h = String(hex || "").trim();
  if (h.charCodeAt(0) === 35) h = h.slice(1);
  if (h.length === 3) h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2];
  const n = parseInt(h, 16);
  if (h.length !== 6 || !Number.isFinite(n)) {
    out[offset] = 0.58;
    out[offset + 1] = 0.64;
    out[offset + 2] = 0.72;
    return out;
  }
  out[offset] = ((n >> 16) & 255) / 255;
  out[offset + 1] = ((n >> 8) & 255) / 255;
  out[offset + 2] = (n & 255) / 255;
  return out;
}

function rgb01ToHex(r, g, b) {
  const c = (v) => {
    const i = Math.max(0, Math.min(255, Math.round(v * 255)));
    return (i < 16 ? "0" : "") + i.toString(16);
  };
  return "#" + c(r) + c(g) + c(b);
}

export const SAT_FAMILY_COLORS_RGB = SAT_FAMILY_COLORS_HEX.map((h) => hexToRGB01(h));

// GPU belt particle palettes (two tones each, 0..1 RGB).
export const BELT_PALETTES = {
  mainBelt: [hexToRGB01("#b89b68"), hexToRGB01("#9a825b")],
  trojans: [hexToRGB01("#a08a66"), hexToRGB01("#86765c")],
  kuiper: [hexToRGB01("#5688cc"), hexToRGB01("#7daee0")],
  hillsOort: [hexToRGB01("#9db4ce"), hexToRGB01("#86a2c4")],
  outerOort: [hexToRGB01("#c2d2e3"), hexToRGB01("#a9bdd4")]
};

// ---------------------------------------------------------------------------
// Planckian thermal scale
// ---------------------------------------------------------------------------
// Perceptual blackbody anchors (display-referred, slightly saturated for dark-sky legibility):
// M/K giants ember-amber, solar G2V warm cream, F/A white, O/B azure-white.
// Flat table: log10(T), r, g, b.
const PLANCK_ANCHORS = new Float64Array([
  Math.log10(2400.0), 0xdc / 255, 0x84 / 255, 0x56 / 255,
  Math.log10(3500.0), 0xe5 / 255, 0x93 / 255, 0x64 / 255,
  Math.log10(4500.0), 0xf3 / 255, 0xbd / 255, 0x7d / 255,
  Math.log10(5772.0), 0xff / 255, 0xe8 / 255, 0xba / 255,
  Math.log10(8000.0), 0xf4 / 255, 0xf7 / 255, 0xff / 255,
  Math.log10(15000.0), 0x9b / 255, 0xc4 / 255, 0xff / 255,
  Math.log10(30000.0), 0x7a / 255, 0xb0 / 255, 0xff / 255
]);
const PLANCK_N = PLANCK_ANCHORS.length / 4;

export function temperatureToRGB(tempK, out = [0, 0, 0], offset = 0) {
  const t = Number.isFinite(tempK) && tempK > 0 ? tempK : 5772.0;
  const lt = Math.log10(t);
  const A = PLANCK_ANCHORS;
  if (lt <= A[0]) {
    out[offset] = A[1];
    out[offset + 1] = A[2];
    out[offset + 2] = A[3];
    return out;
  }
  const last = (PLANCK_N - 1) * 4;
  if (lt >= A[last]) {
    out[offset] = A[last + 1];
    out[offset + 1] = A[last + 2];
    out[offset + 2] = A[last + 3];
    return out;
  }
  let k = 0;
  while (k < PLANCK_N - 2 && lt > A[(k + 1) * 4]) k++;
  const i0 = k * 4;
  const i1 = i0 + 4;
  const u = (lt - A[i0]) / (A[i1] - A[i0]);
  out[offset] = A[i0 + 1] + (A[i1 + 1] - A[i0 + 1]) * u;
  out[offset + 1] = A[i0 + 2] + (A[i1 + 2] - A[i0 + 2]) * u;
  out[offset + 2] = A[i0 + 3] + (A[i1 + 3] - A[i0 + 3]) * u;
  return out;
}

const _hexScratch = [0, 0, 0];

export function temperatureToHex(tempK) {
  temperatureToRGB(tempK, _hexScratch, 0);
  return rgb01ToHex(_hexScratch[0], _hexScratch[1], _hexScratch[2]);
}

// Gaia DR3 BP-RP -> effective temperature. Monotonic colour-temperature relation of the form
// 5040 / T = c0 + c1 (BP-RP) + c2 (BP-RP)^2, zero-pointed so the solar colour 0.82 gives 5772 K.
export function bpRpToTemperatureK(bpRp) {
  const c = Number.isFinite(bpRp) ? Math.max(-0.6, Math.min(3.2, bpRp)) : 0.82;
  const theta = 0.47945 + 0.5092 * c - 0.0353 * c * c;
  return 5040.0 / theta;
}

export function bpRpToPlanckRGB(bpRp, out = [0, 0, 0], offset = 0) {
  return temperatureToRGB(bpRpToTemperatureK(bpRp), out, offset);
}

// ---------------------------------------------------------------------------
// Solar System object colours
// ---------------------------------------------------------------------------
function hashId(str) {
  let h = 2166136261;
  const s = String(str || "");
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

// Small deterministic per-object variation (lightness within +/-8 %, a faint warm/cool tilt) so that
// neighbouring orbits of one category stay distinguishable without leaving the category hue.
function varyHex(hex, id) {
  const rgb = hexToRGB01(hex);
  const h = hashId(id);
  const light = 1.0 + (((h & 1023) / 1023.0) * 2.0 - 1.0) * 0.08;
  const tilt = ((((h >>> 10) & 1023) / 1023.0) * 2.0 - 1.0) * 0.03;
  return rgb01ToHex(
    Math.min(1.0, rgb[0] * light * (1.0 + tilt)),
    Math.min(1.0, rgb[1] * light),
    Math.min(1.0, rgb[2] * light * (1.0 - tilt))
  );
}

export function resolveObjectColor(obj) {
  if (!obj) return CATEGORY_COLORS.all;
  const id = String(obj.id || "").toUpperCase();
  const cat = obj.category;
  const vt = String(obj.visual_type || "");
  if (id === "SUN" || cat === "star" || vt === "sun") return SUN_COLOR;
  if (obj.is_new_discovery) return DISCOVERY_GOLD;
  if (PLANET_COLORS[id] && !obj.parent_id) return PLANET_COLORS[id];
  if (cat === "spacecraft" || vt.startsWith("spacecraft")) return varyHex(CATEGORY_COLORS.spacecraft, id);
  if (cat === "planets") return CATEGORY_COLORS.planets;
  if (cat === "moons_l2" || (obj.parent_id && !CATEGORY_COLORS[cat])) return varyHex(CATEGORY_COLORS.moons_l2, id);
  const base = cat !== "discoveries" && cat !== "all" && CATEGORY_COLORS[cat] ? CATEGORY_COLORS[cat] : CATEGORY_COLORS.asteroids;
  return varyHex(base, id);
}

// ---------------------------------------------------------------------------
// Outreach colour key
// ---------------------------------------------------------------------------
export const LEGEND_SOLAR_SYSTEM = [
  { key: "sun", color: SUN_COLOR, label_en: "Sun (G2V star)" },
  { key: "rocky", color: PLANET_COLORS.MARS, label_en: "Rocky inner planets" },
  { key: "asteroids", color: CATEGORY_COLORS.asteroids, label_en: "Asteroids & main belt" },
  { key: "gas_giants", color: PLANET_COLORS.JUPITER, label_en: "Gas giants" },
  { key: "ice_giants", color: PLANET_COLORS.URANUS, label_en: "Ice giants" },
  { key: "moons", color: CATEGORY_COLORS.moons_l2, label_en: "Natural moons" },
  { key: "comets", color: CATEGORY_COLORS.comets_centaurs, label_en: "Comets & Centaurs" },
  { key: "dwarfs", color: CATEGORY_COLORS.dwarf_planets, label_en: "Dwarf planets" },
  { key: "kuiper", color: CATEGORY_COLORS.kuiper_etnos, label_en: "Kuiper belt & distant objects" },
  { key: "oort", color: CATEGORY_COLORS.oort_cloud, label_en: "Oort cloud" },
  { key: "interstellar", color: CATEGORY_COLORS.interstellar, label_en: "Interstellar visitors" },
  { key: "spacecraft", color: CATEGORY_COLORS.spacecraft, label_en: "Spacecraft & satellites" },
  { key: "discoveries", color: DISCOVERY_GOLD, label_en: "Survey discoveries (optional layer)" }
];

export const LEGEND_STELLAR = [
  { key: "m_giants", tempK: 3500, color: temperatureToHex(3500), label_en: "M giants · 3,500 K" },
  { key: "k_stars", tempK: 4500, color: temperatureToHex(4500), label_en: "K stars · 4,500 K" },
  { key: "g2v", tempK: 5772, color: temperatureToHex(5772), label_en: "Sun-like G2V · 5,772 K" },
  { key: "fa", tempK: 8000, color: temperatureToHex(8000), label_en: "F / A stars · 8,000 K" },
  { key: "b_stars", tempK: 15000, color: temperatureToHex(15000), label_en: "B stars · 15,000 K" },
  { key: "o_stars", tempK: 30000, color: temperatureToHex(30000), label_en: "O stars · 30,000 K+" }
];

export const LEGEND_GALACTIC = [
  { key: "smbh", color: GALACTIC_COLORS.smbh, label_en: "Sgr A* (central black hole)" },
  { key: "xray_binary", color: GALACTIC_COLORS.xray_binary, label_en: "Accreting X-ray binaries" },
  { key: "dormant", color: GALACTIC_COLORS.dormant, label_en: "Dormant black holes (Gaia)" },
  { key: "globular_cluster", color: GALACTIC_COLORS.globular_cluster, label_en: "Globular clusters" },
  { key: "open_cluster", color: GALACTIC_COLORS.open_cluster, label_en: "Star-forming HII regions" },
  { key: "satellite_galaxy", color: GALACTIC_COLORS.satellite_galaxy, label_en: "Magellanic Clouds" }
];
