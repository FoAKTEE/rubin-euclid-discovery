import * as THREE from "../vendor/three.module.js";
import { temperatureToRGB, temperatureToHex, GALACTIC_COLORS } from "./colorSystem.js?v=20261124_v32";

const DEG2RAD = Math.PI / 180.0;
const TWO_PI = Math.PI * 2.0;

export const BLACK_HOLE_PRESETS = {
  SGR_A_STAR: {
    id: "SGR_A_STAR",
    name: "Sagittarius A* (Sgr A*)",
    bh_type: "smbh",
    mass_msun: 4.297e6,
    spin: 0.90,
    inc_deg: 46.0,
    dist_kpc: 8.277,
    palette_mode: 1,
    disk_temp_scale: 0.92,
    jet_power: 0.26,
    s_stars: [
      { name: "S2", a_rel: 1.48, e: 0.88465, i_deg: 133.92, Omega_deg: 228.07, omega_deg: 66.25, period_yr: 16.052, M0_deg: 25.0, teff: 25000 },
      { name: "S38", a_rel: 1.66, e: 0.8201, i_deg: 171.10, Omega_deg: 101.10, omega_deg: 17.99, period_yr: 19.20, M0_deg: 140.0, teff: 15000 },
      { name: "S55", a_rel: 1.28, e: 0.7209, i_deg: 150.10, Omega_deg: 325.50, omega_deg: 331.50, period_yr: 12.80, M0_deg: 235.0, teff: 19000 },
      { name: "S62", a_rel: 1.08, e: 0.9760, i_deg: 72.76, Omega_deg: 122.60, omega_deg: 42.60, period_yr: 9.90, M0_deg: 82.0, teff: 11000 }
    ]
  },
  CYGNUS_X1: {
    id: "CYGNUS_X1",
    name: "Cygnus X-1",
    bh_type: "xray_binary",
    mass_msun: 21.2,
    spin: 0.998,
    inc_deg: 27.5,
    dist_kpc: 2.22,
    companion_mass_msun: 40.6,
    companion_type: "O9.7 Iab",
    companion_teff: 31000,
    period_days: 5.5998,
    ecc: 0.018,
    palette_mode: 2,
    disk_temp_scale: 1.35,
    jet_power: 0.88
  },
  V404_CYG: {
    id: "V404_CYG",
    name: "V404 Cygni",
    bh_type: "xray_binary",
    mass_msun: 9.0,
    spin: 0.92,
    inc_deg: 67.0,
    dist_kpc: 2.39,
    companion_mass_msun: 0.7,
    companion_type: "K0 IV",
    companion_teff: 4800,
    period_days: 6.4714,
    ecc: 0.01,
    palette_mode: 0,
    disk_temp_scale: 1.18,
    jet_power: 0.92
  },
  GRS_1915: {
    id: "GRS_1915",
    name: "GRS 1915+105",
    bh_type: "xray_binary",
    mass_msun: 12.4,
    spin: 0.98,
    inc_deg: 66.0,
    dist_kpc: 8.60,
    companion_mass_msun: 0.8,
    companion_type: "K1 III",
    companion_teff: 4600,
    period_days: 33.85,
    ecc: 0.02,
    palette_mode: 2,
    disk_temp_scale: 1.30,
    jet_power: 1.0
  },
  GRO_J1655: {
    id: "GRO_J1655",
    name: "GRO J1655-40",
    bh_type: "xray_binary",
    mass_msun: 6.6,
    spin: 0.72,
    inc_deg: 70.2,
    dist_kpc: 3.20,
    companion_mass_msun: 2.3,
    companion_type: "F6 IV",
    companion_teff: 6300,
    period_days: 2.6216,
    ecc: 0.01,
    palette_mode: 2,
    disk_temp_scale: 1.24,
    jet_power: 0.86
  },
  MAXI_J1820: {
    id: "MAXI_J1820",
    name: "MAXI J1820+070",
    bh_type: "xray_binary",
    mass_msun: 8.48,
    spin: 0.79,
    inc_deg: 63.0,
    dist_kpc: 2.96,
    companion_mass_msun: 0.61,
    companion_type: "K4 V",
    companion_teff: 4500,
    period_days: 0.6855,
    ecc: 0.0,
    palette_mode: 0,
    disk_temp_scale: 1.22,
    jet_power: 0.82
  },
  SS_433: {
    id: "SS_433",
    name: "SS 433",
    bh_type: "xray_binary",
    mass_msun: 11.0,
    spin: 0.90,
    inc_deg: 78.8,
    dist_kpc: 5.50,
    companion_mass_msun: 21.0,
    companion_type: "A4 I",
    companion_teff: 8500,
    period_days: 13.082,
    ecc: 0.05,
    palette_mode: 2,
    disk_temp_scale: 1.32,
    jet_power: 1.0,
    precessing_jet: true
  },
  LMC_X1: {
    id: "LMC_X1",
    name: "LMC X-1",
    bh_type: "xray_binary",
    mass_msun: 10.9,
    spin: 0.92,
    inc_deg: 36.4,
    dist_kpc: 48.1,
    companion_mass_msun: 31.8,
    companion_type: "O7 III",
    companion_teff: 35000,
    period_days: 3.909,
    ecc: 0.02,
    palette_mode: 2,
    disk_temp_scale: 1.38,
    jet_power: 0.58
  },
  GAIA_BH1: {
    id: "GAIA_BH1",
    name: "Gaia BH1",
    bh_type: "dormant",
    mass_msun: 9.62,
    spin: 0.52,
    inc_deg: 126.7,
    dist_kpc: 0.478,
    companion_mass_msun: 0.93,
    companion_type: "G5 V",
    companion_teff: 5850,
    period_days: 185.59,
    ecc: 0.451,
    palette_mode: 3,
    disk_temp_scale: 0.55,
    jet_power: 0.0
  },
  GAIA_BH2: {
    id: "GAIA_BH2",
    name: "Gaia BH2",
    bh_type: "dormant",
    mass_msun: 8.94,
    spin: 0.50,
    inc_deg: 34.9,
    dist_kpc: 1.16,
    companion_mass_msun: 1.07,
    companion_type: "K2 III",
    companion_teff: 4604,
    period_days: 1276.7,
    ecc: 0.518,
    palette_mode: 3,
    disk_temp_scale: 0.52,
    jet_power: 0.0
  },
  GAIA_BH3: {
    id: "GAIA_BH3",
    name: "Gaia BH3",
    bh_type: "dormant",
    mass_msun: 32.70,
    spin: 0.60,
    inc_deg: 110.6,
    dist_kpc: 0.590,
    companion_mass_msun: 0.76,
    companion_type: "G III (metal-poor)",
    companion_teff: 5212,
    period_days: 4253.1,
    ecc: 0.729,
    palette_mode: 3,
    disk_temp_scale: 0.50,
    jet_power: 0.0
  }
};

const PRESET_ALIASES = {
  SGRA: "SGR_A_STAR",
  SGR_A: "SGR_A_STAR",
  "SGR A*": "SGR_A_STAR",
  CYG_X1: "CYGNUS_X1",
  "CYGNUS X-1": "CYGNUS_X1",
  V404_CYGNI: "V404_CYG",
  "V404 CYGNI": "V404_CYG",
  GRS_1915_105: "GRS_1915",
  "GRS 1915+105": "GRS_1915",
  GRO_J1655_40: "GRO_J1655",
  "GRO J1655-40": "GRO_J1655",
  MAXI_J1820_070: "MAXI_J1820",
  "MAXI J1820+070": "MAXI_J1820",
  "GAIA BH1": "GAIA_BH1",
  "GAIA BH2": "GAIA_BH2",
  "GAIA BH3": "GAIA_BH3"
};

export function isBlackHoleObject(obj) {
  if (!obj) return false;
  if (obj.bh_type) return true;
  const cat = String(obj.category || obj.visual_type || "").toLowerCase();
  if (cat.includes("black_hole") || cat.includes("dormant_bh") || cat.includes("accreting_bh") || cat === "bh" || cat === "smbh" || cat === "pulsar") return true;
  const key = String(obj.id || obj.name || "").toUpperCase().replace(/[^A-Z0-9]+/g, "_").replace(/^_|_$/g, "");
  if (BLACK_HOLE_PRESETS[key] || PRESET_ALIASES[key]) return true;
  return /(SGR_A|GAIA_BH|GAIA_NS|2M05215658|HD_130298|CYGNUS_X|V404_CYG|GRS_1915|GRO_J1655|MAXI_J1820|SS_433|LMC_X1|LMC_X3|A0620|GX_339|XTE_J1118|4U_1543|VFTS_243|CRAB_PULSAR|VELA_PULSAR)/.test(key);
}

function inferCompanionTeff(compType = "") {
  const s = String(compType).trim();
  if (/^O\d|O-type|O9|O7|O6/i.test(s)) return 32000;
  if (/^B\d|B-type/i.test(s)) return 18500;
  if (/^A\d|A-type/i.test(s)) return 8500;
  if (/^F\d|F-type/i.test(s)) return 6400;
  if (/^G\d|G-type|metal-poor halo/i.test(s)) return 5650;
  if (/Red giant|M\d|K7/i.test(s)) return 4100;
  if (/^K\d|K-type/i.test(s)) return 4650;
  return 5600;
}

function resolveSpec(rawSpec = {}) {
  const rawId = String(rawSpec.id || rawSpec.name || "CYGNUS_X1").toUpperCase().trim();
  const normKey = rawId.replace(/[^A-Z0-9]+/g, "_").replace(/^_|_$/g, "");
  const presetKey = BLACK_HOLE_PRESETS[normKey]
    ? normKey
    : PRESET_ALIASES[rawId] || PRESET_ALIASES[normKey] || (rawSpec.bh_type === "smbh" ? "SGR_A_STAR" : rawSpec.bh_type === "dormant" ? "GAIA_BH1" : "CYGNUS_X1");
  const base = BLACK_HOLE_PRESETS[presetKey] || BLACK_HOLE_PRESETS.CYGNUS_X1;
  const cleanRaw = {};
  for (const [k, v] of Object.entries(rawSpec)) {
    if (v !== null && v !== undefined) cleanRaw[k] = v;
  }
  const merged = { ...base, ...cleanRaw };
  if (!rawSpec.companion_teff && rawSpec.companion_type) {
    merged.companion_teff = inferCompanionTeff(rawSpec.companion_type);
  }
  if (rawSpec.eccentricity != null && rawSpec.ecc == null) merged.ecc = rawSpec.eccentricity;
  if (rawSpec.inclination_deg != null && rawSpec.inc_deg == null) merged.inc_deg = rawSpec.inclination_deg;
  if (rawSpec.spin_a_star != null && rawSpec.spin == null) merged.spin = rawSpec.spin_a_star;
  if (rawSpec.has_jet === false && rawSpec.jet_power == null) merged.jet_power = 0.0;
  if (merged.bh_type === "pulsar") {
    merged.palette_mode = 2;
    merged.disk_temp_scale = 1.42;
    merged.jet_power = 1.0;
    merged.precessing_jet = true;
  } else if (merged.bh_type === "smbh") {
    merged.palette_mode = merged.palette_mode ?? 1;
  } else if (merged.bh_type === "dormant") {
    merged.palette_mode = 3;
  } else {
    merged.palette_mode = merged.palette_mode ?? (merged.companion_teff > 12000 ? 2 : 0);
  }
  return merged;
}

// Companion and S-star colours come from the shared Planckian scale (colorSystem.js).
const _teffRGB = [0, 0, 0];
function teffToColor(teff = 5800) {
  temperatureToRGB(Number(teff) || 5800, _teffRGB, 0);
  return new THREE.Color().setRGB(_teffRGB[0], _teffRGB[1], _teffRGB[2], THREE.SRGBColorSpace);
}

function solveKeplerElliptic(M, e) {
  let m = ((M % TWO_PI) + TWO_PI) % TWO_PI;
  if (m > Math.PI) m -= TWO_PI;
  let E = m + e * Math.sin(m);
  for (let i = 0; i < 8; i++) {
    const f = E - e * Math.sin(E) - m;
    const fp = 1.0 - e * Math.cos(E);
    E -= f / Math.max(1e-6, fp);
  }
  return E;
}

const LENSING_VERTEX_SHADER = `
  #include <common>
  #include <logdepthbuf_pars_vertex>
  varying vec3 vLocalPos;
  void main() {
    vLocalPos = position;
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    gl_Position = projectionMatrix * mvPosition;
    #include <logdepthbuf_vertex>
  }
`;

const LENSING_FRAGMENT_SHADER = `
  #include <common>
  #include <logdepthbuf_pars_fragment>

  uniform vec3 uCamLocal;
  uniform float uTime;
  uniform float uRs;
  uniform float uRIn;
  uniform float uROut;
  uniform float uTempScale;
  uniform float uDiskEnabled;
  uniform float uDormantMode;
  uniform float uPaletteMode;
  uniform float uOpacity;
  varying vec3 vLocalPos;

  float hash21(vec2 p) {
    p = fract(p * vec2(123.34, 456.21));
    p += dot(p, p + 45.32);
    return fract(p.x * p.y);
  }

  float noise2(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    float a = hash21(i);
    float b = hash21(i + vec2(1.0, 0.0));
    float c = hash21(i + vec2(0.0, 1.0));
    float d = hash21(i + vec2(1.0, 1.0));
    return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
  }

  float fbmDisk(vec2 p) {
    float v = 0.0;
    float a = 0.54;
    for (int i = 0; i < 4; i++) {
      v += a * noise2(p);
      p = p * 2.07 + vec2(17.1, 31.7);
      a *= 0.5;
    }
    return v;
  }

  vec3 diskThermalSpectrum(float tempNorm, float doppler, float mode) {
    float tShift = clamp(tempNorm * pow(max(doppler, 0.15), 0.85), 0.0, 2.4);
    vec3 cOuter, cMid, cInner, cHot;
    if (mode > 1.5 && mode < 2.5) {
      cOuter = vec3(0.72, 0.30, 0.14);
      cMid   = vec3(0.95, 0.74, 0.49);
      cInner = vec3(0.96, 0.97, 1.00);
      cHot   = vec3(0.48, 0.72, 0.96);
    } else if (mode > 0.5 && mode < 1.5) {
      cOuter = vec3(0.50, 0.17, 0.05);
      cMid   = vec3(0.91, 0.54, 0.20);
      cInner = vec3(0.96, 0.74, 0.44);
      cHot   = vec3(1.00, 0.91, 0.73);
    } else {
      cOuter = vec3(0.62, 0.22, 0.09);
      cMid   = vec3(0.95, 0.62, 0.34);
      cInner = vec3(1.00, 0.91, 0.73);
      cHot   = vec3(0.80, 0.90, 1.00);
    }
    vec3 col = mix(cOuter, cMid, smoothstep(0.05, 0.42, tShift));
    col = mix(col, cInner, smoothstep(0.42, 0.92, tShift));
    col = mix(col, cHot, smoothstep(0.92, 1.55, tShift));
    return col;
  }

  void sampleAccretionDisk(vec3 hitPos, vec3 rayVel, int orderIdx, inout vec3 accumCol, inout float accumAlpha) {
    float rHit = length(hitPos.xz);
    if (rHit < uRIn || rHit > uROut) return;

    float uRad = clamp((rHit - uRIn) / max(1e-4, uROut - uRIn), 0.0, 1.0);
    float innerTaper = smoothstep(0.0, 0.045, uRad);
    float outerTaper = 1.0 - smoothstep(0.68, 1.0, uRad);
    float profile = pow(max(uRIn / rHit, 0.02), 0.78) * pow(max(0.001, 1.0 - sqrt(uRIn * 0.94 / rHit)), 0.25);

    float phi = atan(hitPos.z, hitPos.x);
    float logR = log(rHit / uRIn);
    float omega = pow(uRIn / rHit, 1.5);

    float phA = fract(uTime * 0.14);
    float phB = fract(uTime * 0.14 + 0.5);
    float wA = sin(phA * PI);
    float wB = sin(phB * PI);
    float shearA = phi + omega * phA * 5.2 + 7.5 * logR;
    float shearB = phi + omega * phB * 5.2 + 7.5 * logR;
    float turbA = fbmDisk(vec2(logR * 5.6, shearA * 1.45));
    float turbB = fbmDisk(vec2(logR * 5.6 + 4.3, shearB * 1.45));
    float mri = (wA * turbA + wB * turbB) / max(0.001, wA + wB);

    float spiralArms = 0.5 + 0.5 * cos(2.0 * phi + 8.8 * logR - uTime * 2.1);
    float rings = 0.5 + 0.5 * sin(logR * 22.0 - uTime * 1.2 + mri * 3.4);
    float structure = mix(0.55, 1.42, 0.52 * mri + 0.28 * spiralArms + 0.20 * rings);

    vec3 tang = normalize(vec3(-hitPos.z, 0.0, hitPos.x));
    float beta = clamp(sqrt(0.5 * uRs / max(rHit, 1.45 * uRs)), 0.0, 0.58);
    float cosTheta = dot(tang, -rayVel);
    float gravRed = sqrt(clamp(1.0 - uRs / max(rHit, 1.08 * uRs), 0.08, 1.0));
    float doppler = (sqrt(1.0 - beta * beta) / max(0.22, 1.0 - beta * cosTheta)) * gravRed;
    float beamBoost = pow(clamp(doppler, 0.28, 2.35), 3.05);

    float tempNorm = profile * uTempScale * (0.84 + 0.30 * mri);
    vec3 col = diskThermalSpectrum(tempNorm, doppler, uPaletteMode);

    float orderAtten = orderIdx == 0 ? 1.0 : 0.72;
    float density = innerTaper * outerTaper * structure * orderAtten;
    float emitStrength = density * beamBoost * (1.35 + 1.45 * pow(1.0 - uRad, 1.6));
    float stepAlpha = clamp(density * (0.86 - 0.38 * uRad), 0.0, 0.94);

    if (uDormantMode > 0.5) {
      col = mix(vec3(0.46, 0.56, 0.86), vec3(0.80, 0.86, 0.98), mri);
      emitStrength *= 0.09;
      stepAlpha *= 0.12;
    }

    float trans = 1.0 - accumAlpha;
    accumCol += trans * col * emitStrength;
    accumAlpha += trans * stepAlpha;
  }

  void main() {
    vec3 rd = normalize(vLocalPos - uCamLocal);
    float bDot = dot(uCamLocal, rd);
    float cVal = dot(uCamLocal, uCamLocal) - 1.0;
    float disc = bDot * bDot - cVal;
    if (disc <= 0.0) discard;

    float tNear = max(0.0, -bDot - sqrt(disc));
    vec3 pos = uCamLocal + rd * tNear;
    vec3 vel = rd;

    vec3 Lvec = cross(pos, vel);
    float L2 = dot(Lvec, Lvec);
    float bImpact = sqrt(L2);
    float bCrit = 2.598076 * uRs;

    vec3 accumCol = vec3(0.0);
    float accumAlpha = 0.0;
    bool hitHorizon = false;
    int crossings = 0;

    for (int i = 0; i < 54; i++) {
      float r2 = dot(pos, pos);
      float r = sqrt(r2);
      if (r <= uRs * 1.02) {
        hitHorizon = true;
        break;
      }
      if (i > 4 && r > 1.025 && dot(pos, vel) > 0.0) {
        break;
      }

      float dtStep = clamp(0.082 * (r - 0.62 * uRs), 0.0048, 0.052);
      vec3 acc = (-1.5 * uRs * L2 / (r2 * r2 * r)) * pos;
      vec3 nextVel = normalize(vel + acc * dtStep);
      vec3 nextPos = pos + 0.5 * (vel + nextVel) * dtStep;

      if (uDiskEnabled > 0.5 && pos.y * nextPos.y <= 0.0 && crossings < 3) {
        float frac = abs(pos.y) / max(1e-6, abs(pos.y - nextPos.y));
        vec3 hitPos = mix(pos, nextPos, frac);
        sampleAccretionDisk(hitPos, nextVel, crossings, accumCol, accumAlpha);
        crossings++;
      }

      if (uPaletteMode > 0.5 && uPaletteMode < 1.5 && r < uROut * 0.62 && r > uRs * 1.35) {
        float hFrac = abs(pos.y) / max(1e-4, r);
        float torus = exp(-hFrac * hFrac * 6.5) * exp(-pow((r - uRIn * 1.35) / (uROut * 0.28), 2.0));
        vec3 riafCol = vec3(0.96, 0.62, 0.24) * torus * dtStep * 1.35;
        accumCol += (1.0 - accumAlpha) * riafCol;
      }

      pos = nextPos;
      vel = nextVel;
    }

    float ringDelta = abs(bImpact - bCrit) / uRs;
    if (ringDelta < 0.35) {
      vec3 spinAxis = vec3(0.0, 1.0, 0.0);
      vec3 approachAxis = normalize(cross(spinAxis, rd) + vec3(1e-5, 0.0, 0.0));
      float sideSign = dot(normalize(pos - dot(pos, rd) * rd + vec3(1e-5)), approachAxis);
      float ringAsym = clamp(1.0 + 0.52 * sideSign, 0.42, 1.68);
      float photonRing = exp(-pow(ringDelta / 0.052, 2.0)) * ringAsym;
      vec3 ringCol = uDormantMode > 0.5
        ? vec3(0.64, 0.74, 0.96) * (0.88 * photonRing)
        : mix(vec3(1.0, 0.78, 0.42), vec3(0.84, 0.94, 1.0), clamp(0.5 + 0.5 * sideSign, 0.0, 1.0)) * (1.25 * photonRing * float(uDiskEnabled > 0.5 ? 1.0 : 0.35));
      accumCol += (1.0 - accumAlpha * 0.65) * ringCol;
      accumAlpha = max(accumAlpha, clamp(photonRing * 0.55, 0.0, 0.85));
    }

    if (!hitHorizon && uDormantMode > 0.5) {
      float deflect = 1.0 - clamp(dot(vel, rd), -1.0, 1.0);
      float einstein = smoothstep(0.04, 0.85, deflect) * exp(-max(0.0, bImpact - bCrit) * 4.5);
      float shimmer = 0.72 + 0.28 * sin(atan(vel.z, vel.x) * 7.0 + uTime * 1.3);
      accumCol += (1.0 - accumAlpha) * vec3(0.55, 0.66, 0.90) * einstein * shimmer * 0.75;
      accumAlpha = max(accumAlpha, einstein * 0.42);
    }

    float finalAlpha = hitHorizon ? 1.0 : clamp(accumAlpha, 0.0, 0.95);
    if (finalAlpha < 0.003 && dot(accumCol, accumCol) < 1e-6) discard;
    // Soft shoulder for the Doppler-boosted side of the disc: it approaches white, keeping its
    // warm-to-hot gradient, instead of clipping to a flat white patch.
    accumCol = vec3(1.0) - exp(-accumCol * 0.9);

    #include <logdepthbuf_fragment>
    gl_FragColor = vec4(accumCol * uOpacity, finalAlpha * uOpacity);
  }
`;

const JET_VERTEX_SHADER = `
  #include <common>
  #include <logdepthbuf_pars_vertex>
  varying vec2 vUv;
  varying vec3 vNormalView;
  varying vec3 vViewDir;
  void main() {
    vUv = uv;
    vec4 mvPos = modelViewMatrix * vec4(position, 1.0);
    vNormalView = normalize(normalMatrix * normal);
    vViewDir = normalize(-mvPos.xyz);
    gl_Position = projectionMatrix * mvPos;
    #include <logdepthbuf_vertex>
  }
`;

const JET_FRAGMENT_SHADER = `
  #include <common>
  #include <logdepthbuf_pars_fragment>
  uniform float uTime;
  uniform float uPower;
  uniform float uOpacity;
  varying vec2 vUv;
  varying vec3 vNormalView;
  varying vec3 vViewDir;
  void main() {
    float axial = vUv.y;
    float baseFade = smoothstep(0.0, 0.14, axial);
    float tipFade = 1.0 - smoothstep(0.45, 1.0, axial);
    float fresnel = pow(abs(dot(normalize(vNormalView), normalize(vViewDir))), 1.55);
    float helix1 = 0.5 + 0.5 * sin(vUv.x * 18.8495 - axial * 16.0 + uTime * 5.4);
    float helix2 = 0.5 + 0.5 * cos(vUv.x * 12.5663 + axial * 22.0 - uTime * 7.2);
    float knots = 0.55 + 0.45 * sin(axial * 26.0 - uTime * 8.5);
    float intensity = baseFade * tipFade * fresnel * (0.48 + 0.52 * helix1 * helix2) * knots * uPower;
    if (intensity < 0.004) discard;
    vec3 col = mix(vec3(0.42, 0.72, 0.94), vec3(0.90, 0.95, 1.0), (1.0 - axial) * 0.75 + 0.25 * knots);
    #include <logdepthbuf_fragment>
    gl_FragColor = vec4(col * intensity * 1.45 * uOpacity, clamp(intensity * uOpacity, 0.0, 0.85));
  }
`;

function createBeaconTexture() {
  const size = 64;
  const c = document.createElement("canvas");
  c.width = size;
  c.height = size;
  const ctx = c.getContext("2d");
  const g = ctx.createRadialGradient(size / 2, size / 2, 0.5, size / 2, size / 2, size / 2);
  g.addColorStop(0.0, "rgba(255, 255, 255, 1.0)");
  g.addColorStop(0.22, "rgba(235, 245, 255, 0.72)");
  g.addColorStop(0.52, "rgba(148, 205, 255, 0.18)");
  g.addColorStop(1.0, "rgba(0, 0, 0, 0.0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, size, size);
  const tex = new THREE.CanvasTexture(c);
  tex.needsUpdate = true;
  return tex;
}

let _sharedBeaconTex = null;

export function createBlackHoleSystem(rawSpec = {}, options = {}) {
  const spec = resolveSpec(rawSpec);
  const radius = Math.max(1e-5, Number(options.radius ?? 1.0));
  const isDormant = spec.bh_type === "dormant";
  const isSMBH = spec.bh_type === "smbh";

  const group = new THREE.Group();
  group.name = `blackHole_${spec.id}`;
  group.scale.setScalar(radius);

  const spinClamp = Math.min(0.998, Math.max(0.0, Number(spec.spin ?? 0.85)));
  const rsNorm = 0.105;
  const rInNorm = rsNorm * (3.0 - 2.0 * Math.pow(spinClamp, 0.65));
  const rOutNorm = isSMBH ? 0.84 : 0.92;

  const tiltGroup = new THREE.Group();
  const incRad = ((spec.inc_deg ?? 60.0) - 90.0) * DEG2RAD;
  tiltGroup.rotation.z = Math.max(-1.25, Math.min(1.25, incRad * 0.45));
  tiltGroup.rotation.x = 0.22;
  group.add(tiltGroup);

  const coreUniforms = {
    uCamLocal: { value: new THREE.Vector3(0, 0.35, 3.5) },
    uTime: { value: 0.0 },
    uRs: { value: rsNorm },
    uRIn: { value: rInNorm },
    uROut: { value: rOutNorm },
    uTempScale: { value: Number(spec.disk_temp_scale ?? 1.15) },
    uDiskEnabled: { value: options.showDisk === false ? 0.0 : 1.0 },
    uDormantMode: { value: isDormant && !options.forceActiveDisk ? 1.0 : 0.0 },
    uPaletteMode: { value: Number(spec.palette_mode ?? 0) },
    uOpacity: { value: 1.0 }
  };

  const coreGeom = new THREE.SphereGeometry(1.0, 56, 40);
  const coreMat = new THREE.ShaderMaterial({
    uniforms: coreUniforms,
    vertexShader: LENSING_VERTEX_SHADER,
    fragmentShader: LENSING_FRAGMENT_SHADER,
    side: THREE.BackSide,
    transparent: true,
    depthTest: true,
    depthWrite: false,
    blending: THREE.CustomBlending,
    blendEquation: THREE.AddEquation,
    blendSrc: THREE.OneFactor,
    blendDst: THREE.OneMinusSrcAlphaFactor,
    blendEquationAlpha: THREE.AddEquation,
    blendSrcAlpha: THREE.OneFactor,
    blendDstAlpha: THREE.OneMinusSrcAlphaFactor
  });
  const coreMesh = new THREE.Mesh(coreGeom, coreMat);
  coreMesh.frustumCulled = false;
  coreMesh.renderOrder = 5;
  tiltGroup.add(coreMesh);

  const disposables = [coreGeom, coreMat];

  // Relativistic bipolar jets
  const jetsGroup = new THREE.Group();
  const jetPower = Number(spec.jet_power ?? (isDormant ? 0.0 : 0.75));
  const jetUniforms = {
    uTime: { value: 0.0 },
    uPower: { value: jetPower },
    uOpacity: { value: 1.0 }
  };
  if (jetPower > 0.05) {
    const jetLen = isSMBH ? 1.35 : 1.85;
    const jetRadTop = isSMBH ? 0.24 : 0.19;
    const jetGeom = new THREE.CylinderGeometry(jetRadTop, rsNorm * 0.65, jetLen, 32, 24, true);
    const jetMat = new THREE.ShaderMaterial({
      uniforms: jetUniforms,
      vertexShader: JET_VERTEX_SHADER,
      fragmentShader: JET_FRAGMENT_SHADER,
      side: THREE.DoubleSide,
      transparent: true,
      depthTest: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending
    });
    const northJet = new THREE.Mesh(jetGeom, jetMat);
    northJet.position.y = rsNorm * 1.4 + jetLen * 0.5;
    northJet.renderOrder = 5;
    const southJet = new THREE.Mesh(jetGeom, jetMat);
    southJet.rotation.z = Math.PI;
    southJet.position.y = -(rsNorm * 1.4 + jetLen * 0.5);
    southJet.renderOrder = 5;
    jetsGroup.add(northJet, southJet);
    disposables.push(jetGeom, jetMat);
  }
  jetsGroup.visible = options.showJets !== false && jetPower > 0.05;
  tiltGroup.add(jetsGroup);

  // Companion donor star + Roche-lobe mass transfer stream (for stellar-mass BHs)
  let companionRig = null;
  let donorMesh = null;
  let donorMatRef = null;
  let orbMatRef = null;
  let haloMatRef = null;
  const baseOrbOpacity = isDormant ? 0.48 : 0.28;
  let streamMat = null;
  let sGroupRef = null;
  const sStarEntries = [];

  const hasBinaryCompanion =
    !isSMBH &&
    spec.bh_type !== "pulsar" &&
    options.showCompanion !== false &&
    !/isolated/i.test(String(spec.companion_type || ""));

  if (hasBinaryCompanion) {
    companionRig = new THREE.Group();
    const aRel = isDormant ? 1.62 : 1.44;
    const ecc = Math.min(0.82, Math.max(0.0, Number(spec.ecc ?? 0.02)));

    const orbPts = [];
    const bRel = aRel * Math.sqrt(1.0 - ecc * ecc);
    for (let k = 0; k < 160; k++) {
      const E = (TWO_PI * k) / 160;
      orbPts.push(new THREE.Vector3(aRel * (Math.cos(E) - ecc), 0.0, bRel * Math.sin(E)));
    }
    const orbGeom = new THREE.BufferGeometry().setFromPoints(orbPts);
    const orbMat = new THREE.LineBasicMaterial({
      color: teffToColor(spec.companion_teff),
      transparent: true,
      opacity: baseOrbOpacity,
      depthTest: true,
      depthWrite: false
    });
    orbMatRef = orbMat;
    const orbLoop = new THREE.LineLoop(orbGeom, orbMat);
    orbLoop.renderOrder = 5;
    companionRig.add(orbLoop);
    disposables.push(orbGeom, orbMat);

    const starColor = teffToColor(spec.companion_teff);
    const donorRadius = spec.companion_teff > 15000 ? 0.165 : (isDormant ? 0.095 : 0.125);
    const donorGeom = new THREE.SphereGeometry(donorRadius, 28, 20);
    const donorMat = new THREE.MeshBasicMaterial({
      color: starColor,
      transparent: true,
      opacity: 1.0,
      depthTest: true,
      depthWrite: true
    });
    donorMatRef = donorMat;
    donorMesh = new THREE.Mesh(donorGeom, donorMat);
    if (!isDormant) {
      donorMesh.scale.set(1.26, 0.94, 0.94);
    }

    if (typeof document !== "undefined") {
      if (!_sharedBeaconTex) _sharedBeaconTex = createBeaconTexture();
      const haloMat = new THREE.SpriteMaterial({
        map: _sharedBeaconTex,
        color: starColor,
        transparent: true,
        opacity: 0.72,
        blending: THREE.AdditiveBlending,
        depthTest: true,
        depthWrite: false
      });
      haloMatRef = haloMat;
      const haloSprite = new THREE.Sprite(haloMat);
      haloSprite.scale.setScalar(donorRadius * 4.4);
      haloSprite.renderOrder = 5;
      donorMesh.add(haloSprite);
      disposables.push(haloMat);
    }

    companionRig.add(donorMesh);

    if (!isDormant) {
      const curvePts = [];
      for (let i = 0; i <= 36; i++) {
        const u = i / 36;
        const rCur = (aRel - donorRadius * 1.1) * (1.0 - u) + (rOutNorm * 0.80) * u;
        const ang = -u * 1.38;
        curvePts.push(new THREE.Vector3(rCur * Math.cos(ang), 0.012 * Math.sin(u * Math.PI), rCur * Math.sin(ang)));
      }
      const streamCurve = new THREE.CatmullRomCurve3(curvePts);
      const streamGeom = new THREE.TubeGeometry(streamCurve, 44, 0.016, 8, false);
      streamMat = new THREE.ShaderMaterial({
        uniforms: {
          uTime: { value: 0.0 },
          uColorA: { value: starColor.clone() },
          uColorB: { value: teffToColor(4200) },
          uOpacity: { value: 1.0 }
        },
        vertexShader: `
          #include <common>
          #include <logdepthbuf_pars_vertex>
          varying vec2 vUv;
          void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            #include <logdepthbuf_vertex>
          }
        `,
        fragmentShader: `
          #include <common>
          #include <logdepthbuf_pars_fragment>
          uniform float uTime;
          uniform vec3 uColorA;
          uniform vec3 uColorB;
          uniform float uOpacity;
          varying vec2 vUv;
          void main() {
            float flow = 0.62 + 0.38 * sin(vUv.x * 24.0 - uTime * 6.5);
            float edge = sin(vUv.y * PI);
            float alpha = flow * edge * 0.76 * uOpacity;
            if (alpha < 0.003) discard;
            vec3 col = mix(uColorA, uColorB, vUv.x);
            #include <logdepthbuf_fragment>
            gl_FragColor = vec4(col * 1.35 * uOpacity, alpha);
          }
        `,
        transparent: true,
        depthTest: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending
      });
      const streamMesh = new THREE.Mesh(streamGeom, streamMat);
      streamMesh.renderOrder = 5;
      companionRig.add(streamMesh);
      disposables.push(streamGeom, streamMat);
    }

    companionRig.userData = { aRel, ecc, periodDays: Math.max(0.3, Number(spec.period_days || 6.0)) };
    tiltGroup.add(companionRig);
    disposables.push(donorGeom, donorMat);
  }

  // S-Star cluster 3D Keplerian orbits around Sgr A*
  if (isSMBH && Array.isArray(spec.s_stars)) {
    const sGroup = new THREE.Group();
    sGroupRef = sGroup;
    const starSphereGeom = new THREE.SphereGeometry(0.026, 14, 10);
    disposables.push(starSphereGeom);

    for (let sIdx = 0; sIdx < spec.s_stars.length; sIdx++) {
      const st = spec.s_stars[sIdx];
      const a = Number(st.a_rel ?? (st.a_au ? (st.a_au / 1000.0) * 1.42 : 1.4));
      const e = Math.min(0.98, Math.max(0.0, Number(st.e ?? st.eccentricity ?? 0.8)));
      const inc = Number(st.i_deg ?? st.inc_deg ?? 130) * DEG2RAD;
      const Om = Number(st.Omega_deg ?? 200) * DEG2RAD;
      const om = Number(st.omega_deg ?? 60) * DEG2RAD;
      // S-stars are early B dwarfs: hot azure-white on the Planckian scale, spread by temperature.
      const sTeffs = [25000, 15000, 19000, 11000];
      const stColor = st.color || temperatureToHex(Number(st.teff) || sTeffs[sIdx % sTeffs.length]);
      const cO = Math.cos(Om), sO = Math.sin(Om);
      const co = Math.cos(om), so = Math.sin(om);
      const ci = Math.cos(inc), si = Math.sin(inc);

      const basis = {
        Px: cO * co - sO * so * ci,
        Py: sO * co + cO * so * ci,
        Pz: so * si,
        Qx: -cO * so - sO * co * ci,
        Qy: -sO * so + cO * co * ci,
        Qz: co * si
      };

      const pts = [];
      const bFac = Math.sqrt(1.0 - e * e);
      for (let k = 0; k < 180; k++) {
        const theta = (TWO_PI * k) / 180;
        const E = theta - 0.28 * e * Math.sin(theta);
        const xO = a * (Math.cos(E) - e);
        const yO = a * bFac * Math.sin(E);
        pts.push(new THREE.Vector3(
          basis.Px * xO + basis.Qx * yO,
          basis.Pz * xO + basis.Qz * yO,
          -(basis.Py * xO + basis.Qy * yO)
        ));
      }
      const lineGeom = new THREE.BufferGeometry().setFromPoints(pts);
      const sCol = new THREE.Color(stColor);
      const lineMat = new THREE.LineBasicMaterial({
        color: sCol,
        transparent: true,
        opacity: 0.46,
        depthTest: true,
        depthWrite: false
      });
      const sLine = new THREE.LineLoop(lineGeom, lineMat);
      sLine.renderOrder = 5;
      sGroup.add(sLine);

      const sMat = new THREE.MeshBasicMaterial({
        color: sCol,
        transparent: true,
        opacity: 1.0,
        depthTest: true,
        depthWrite: true
      });
      const sMesh = new THREE.Mesh(starSphereGeom, sMat);
      sGroup.add(sMesh);
      disposables.push(lineGeom, lineMat, sMat);

      sStarEntries.push({
        mesh: sMesh,
        lineMat,
        sMat,
        a,
        e,
        bFac,
        basis,
        periodYr: Math.max(2.0, Number(st.period_yr || 16.0)),
        m0Rad: Number(st.M0_deg || 0.0) * DEG2RAD
      });
    }
    group.add(sGroup);
  }

  // Long-range Galactic beacon sprite when BH subtends < 3 px
  // Compensate parent group.scale (radius) so sizeAttenuation:false stays ~10-16 px on screen (never radius * 0.018!)
  const baseBeaconScreenSize = isSMBH ? 0.016 : (isDormant ? 0.010 : 0.013);
  let beaconSprite = null;
  if (typeof document !== "undefined") {
    if (!_sharedBeaconTex) _sharedBeaconTex = createBeaconTexture();
    const bMat = new THREE.SpriteMaterial({
      map: _sharedBeaconTex,
      color: new THREE.Color(isDormant ? GALACTIC_COLORS.dormant : (isSMBH ? GALACTIC_COLORS.smbh : GALACTIC_COLORS.xray_binary)),
      transparent: true,
      opacity: 0.0,
      blending: THREE.AdditiveBlending,
      depthTest: true,
      depthWrite: false,
      sizeAttenuation: false
    });
    beaconSprite = new THREE.Sprite(bMat);
    beaconSprite.scale.set(baseBeaconScreenSize / radius, baseBeaconScreenSize / radius, 1.0);
    beaconSprite.renderOrder = 5;
    beaconSprite.visible = false;
    group.add(beaconSprite);
    disposables.push(bMat);
  }

  // Preallocated scratch vectors (zero per-frame GC allocations)
  const _camLocal = new THREE.Vector3();
  const _worldCenter = new THREE.Vector3();

  let spinRate = 1.0;
  let simClock = 0.0;
  let userOpacity = 1.0;
  let effectiveOpacity = 1.0;

  function applyEffectiveOpacity(eff) {
    coreUniforms.uOpacity.value = eff;
    jetUniforms.uOpacity.value = eff;
    if (streamMat) streamMat.uniforms.uOpacity.value = eff;
    if (orbMatRef) orbMatRef.opacity = baseOrbOpacity * eff;
    if (donorMatRef) {
      donorMatRef.opacity = eff;
      donorMatRef.depthWrite = eff > 0.95;
    }
    if (haloMatRef) haloMatRef.opacity = 0.72 * eff;
    for (let i = 0; i < sStarEntries.length; i++) {
      sStarEntries[i].lineMat.opacity = 0.46 * eff;
      sStarEntries[i].sMat.opacity = eff;
      sStarEntries[i].sMat.depthWrite = eff > 0.95;
    }
  }

  function update(dt = 0.016, camera = null, scaleInfo = null) {
    let distGate = 1.0;
    const isFocusedHere = Boolean(
      scaleInfo?.focusedOnBlackHole ||
      (scaleInfo?.focusedObjectId && scaleInfo.focusedObjectId === spec.id)
    );
    if (!isFocusedHere && scaleInfo && (scaleInfo.cameraDistScene !== undefined || scaleInfo.cameraDistPc !== undefined)) {
      const dPc = scaleInfo.cameraDistPc !== undefined
        ? Number(scaleInfo.cameraDistPc)
        : Number(scaleInfo.cameraDistScene) / 200.0;
      const lb = scaleInfo.logBlend !== undefined ? Number(scaleInfo.logBlend) : 1.0;
      const startPc = 300.0 + (50.0 - 300.0) * lb;
      const endPc = 800.0 + (100.0 - 800.0) * lb;
      if (dPc < startPc) {
        distGate = 0.0;
      } else if (dPc < endPc) {
        const u = (dPc - startPc) / Math.max(1.0, endPc - startPc);
        distGate = u * u * (3.0 - 2.0 * u);
      }
    }

    effectiveOpacity = userOpacity * distGate;
    applyEffectiveOpacity(effectiveOpacity);
    group.visible = effectiveOpacity > 0.001;
    if (!group.visible) {
      if (beaconSprite) {
        beaconSprite.material.opacity = 0.0;
        beaconSprite.visible = false;
      }
      return;
    }

    const clampedDt = Math.min(0.1, Math.max(0.0, Number(dt) || 0.016));
    simClock += clampedDt * spinRate;

    coreUniforms.uTime.value = simClock;
    jetUniforms.uTime.value = simClock;
    if (streamMat) streamMat.uniforms.uTime.value = simClock;

    if (spec.precessing_jet && jetsGroup.visible) {
      jetsGroup.rotation.x = Math.sin(simClock * 0.55) * 0.34;
      jetsGroup.rotation.z = Math.cos(simClock * 0.55) * 0.34;
    }

    let apparentRatio = 4.0;
    if (camera) {
      const invScale = 1.0 / Math.max(1e-6, group.scale.x);
      group.getWorldPosition(_worldCenter);
      const dist = camera.position.distanceTo(_worldCenter);
      apparentRatio = dist * invScale;

      coreMesh.updateWorldMatrix(true, false);
      _camLocal.copy(camera.position);
      coreMesh.worldToLocal(_camLocal);
      coreUniforms.uCamLocal.value.copy(_camLocal);

      if (beaconSprite) {
        beaconSprite.scale.set(baseBeaconScreenSize * invScale, baseBeaconScreenSize * invScale, 1.0);
        const galFade = scaleInfo?.galacticFactor !== undefined ? Number(scaleInfo.galacticFactor) : 1.0;
        const maxBeaconAlpha = isSMBH ? 0.58 : (isDormant ? 0.24 : 0.38);
        const rawBeacon = apparentRatio > 28.0
          ? Math.min(maxBeaconAlpha, ((apparentRatio - 28.0) / 85.0) * maxBeaconAlpha * galFade)
          : 0.0;
        beaconSprite.material.opacity = rawBeacon * effectiveOpacity;
        beaconSprite.visible = beaconSprite.material.opacity > 0.008;
      }
    }

    const showFineOrbiters = apparentRatio < 65.0;
    if (companionRig) {
      companionRig.visible = showFineOrbiters;
      if (showFineOrbiters && donorMesh) {
        const { aRel, ecc, periodDays } = companionRig.userData;
        const orbRate = isDormant ? 0.28 : Math.min(1.6, 3.2 / Math.sqrt(periodDays));
        const M = simClock * orbRate * spinRate;
        if (ecc < 0.05) {
          companionRig.rotation.y = M;
          donorMesh.position.set(aRel, 0, 0);
        } else {
          const E = solveKeplerElliptic(M, ecc);
          const xO = aRel * (Math.cos(E) - ecc);
          const zO = aRel * Math.sqrt(1.0 - ecc * ecc) * Math.sin(E);
          companionRig.rotation.y = 0.0;
          donorMesh.position.set(xO, 0.0, zO);
        }
      }
    }

    if (sGroupRef) {
      sGroupRef.visible = showFineOrbiters;
      if (showFineOrbiters) {
        for (let i = 0; i < sStarEntries.length; i++) {
          const st = sStarEntries[i];
          const M = st.m0Rad + simClock * (4.8 / st.periodYr) * spinRate;
          const E = solveKeplerElliptic(M, st.e);
          const xO = st.a * (Math.cos(E) - st.e);
          const yO = st.a * st.bFac * Math.sin(E);
          st.mesh.position.set(
            st.basis.Px * xO + st.basis.Qx * yO,
            st.basis.Pz * xO + st.basis.Qz * yO,
            -(st.basis.Py * xO + st.basis.Qy * yO)
          );
        }
      }
    }
  }

  function setDiskVisible(visible) {
    coreUniforms.uDiskEnabled.value = visible ? 1.0 : 0.0;
    if (isDormant) {
      coreUniforms.uDormantMode.value = visible && options.forceActiveDisk ? 0.0 : 1.0;
    }
  }

  function setJetsVisible(visible) {
    jetsGroup.visible = Boolean(visible) && jetPower > 0.05;
  }

  function setSpinRate(rate) {
    spinRate = Math.max(0.0, Number(rate) || 0.0);
  }

  function setInclination(deg) {
    const rad = (Number(deg) - 90.0) * DEG2RAD;
    tiltGroup.rotation.z = Math.max(-1.35, Math.min(1.35, rad * 0.55));
  }

  function setAccretionRate(rate) {
    const r = Math.max(0.0, Number(rate) || 0.0);
    coreUniforms.uTempScale.value = Math.max(0.15, r);
    if (isDormant && r > 0.85) coreUniforms.uDormantMode.value = 0.0;
  }

  function setOpacity(alpha) {
    userOpacity = Math.max(0.0, Math.min(1.0, Number(alpha)));
    effectiveOpacity = Math.min(effectiveOpacity, userOpacity);
    applyEffectiveOpacity(userOpacity);
    if (userOpacity <= 0.001) {
      group.visible = false;
      if (beaconSprite) {
        beaconSprite.material.opacity = 0.0;
        beaconSprite.visible = false;
      }
    }
  }

  function getOpacity() {
    return effectiveOpacity;
  }

  function setMaskPassActive(active) {
    if (active) {
      coreUniforms.uOpacity.value = 1.0;
    } else {
      coreUniforms.uOpacity.value = effectiveOpacity;
    }
  }

  function dispose() {
    for (const d of disposables) {
      if (d && typeof d.dispose === "function") d.dispose();
    }
  }

  return {
    group,
    spec,
    coreMesh,
    jetsGroup,
    beaconSprite,
    update,
    setDiskVisible,
    setJetsVisible,
    setSpinRate,
    setInclination,
    setAccretionRate,
    setOpacity,
    getOpacity,
    setMaskPassActive,
    dispose
  };
}
