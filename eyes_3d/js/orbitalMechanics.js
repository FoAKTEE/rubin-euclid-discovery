// 3D J2000 Ecliptic, Planetary & Galactic Orbital Mechanics Engine
// Machine-precision (1e-13) Elliptic, Near-Parabolic (Barker/Stumpff), and Hyperbolic solvers.

import * as THREE from "../vendor/three.module.js";

export const DEG2RAD = Math.PI / 180.0;
export const RAD2DEG = 180.0 / Math.PI;
export const TWO_PI = Math.PI * 2.0;

export const GAUSS_K = 0.01720209895; // AU^(3/2) / day
export const GM_SUN = 2.959122082855911e-4; // GAUSS_K^2, AU^3 / day^2
export const J2000_JD = 2451545.0;
export const MJD_TO_JD = 2400000.5;
export const DISCOVERY_EPOCH_MJD = 60900.0; // 2025-08-13 00:00:00 TDB (solar_catalog.json)
export const DISCOVERY_EPOCH_JD = DISCOVERY_EPOCH_MJD + MJD_TO_JD; // 2460900.5

export const OBLIQUITY_J2000_DEG = 23.439291111;
export const OBLIQUITY_J2000_RAD = OBLIQUITY_J2000_DEG * DEG2RAD;
const COS_OBLIQ = Math.cos(OBLIQUITY_J2000_RAD);
const SIN_OBLIQ = Math.sin(OBLIQUITY_J2000_RAD);

export const AU_KM = 149597870.7;
export const AU_PER_PC = 206264.80624709636;
export const PC_TO_LY = 3.261563777167433;
export const AU_PER_LY = AU_PER_PC / PC_TO_LY;

// Deep-Space Log Scale for Solar System (r <= 100,000 AU)
export const LOG_R0 = 1.2;
export const LOG_S0 = 14.0;

// Linear 3D Euclidean Galactic Scale (zero spiral-arm distortion; Proxima 1.3 pc = 260 > 158.6 Oort)
export const GALAXY_SCENE_PER_PC = 200.0;
export const GALAXY_SCENE_PER_KPC = 200000.0;
export const GALAXY_SCENE_PER_LY = GALAXY_SCENE_PER_PC / PC_TO_LY;

// Exact IAU/DE441 planet-to-Sun mass ratios for heliocentric two-body reduced mass
export const PLANET_MASS_RATIOS = {
  MERCURY: 1.6601e-7,
  VENUS: 2.4478383e-6,
  EARTH: 3.0404326e-6,
  MARS: 3.227151e-7,
  JUPITER: 9.5479194e-4,
  SATURN: 2.8588598e-4,
  URANUS: 4.366244e-5,
  NEPTUNE: 5.151389e-5
};

// Exact host-body GM in AU^3 / day^2 for planetocentric moons & binary companions
export const HOST_GM_AU3_DAY2 = {
  SUN: GM_SUN,
  MERCURY: GM_SUN / 6023600.0,
  VENUS: GM_SUN / 408523.71,
  EARTH: GM_SUN / 332946.0487,
  MOON: GM_SUN / (332946.0487 * 81.300568),
  MARS: GM_SUN / 3098703.59,
  JUPITER: GM_SUN / 1047.348644,
  SATURN: GM_SUN / 3497.898,
  URANUS: GM_SUN / 22902.98,
  NEPTUNE: GM_SUN / 19412.24,
  PLUTO: GM_SUN / 1.352e8,
  ERIS: GM_SUN / 1.191e8,
  HAUMEA: GM_SUN / 4.96e8,
  QUAOAR: GM_SUN / 1.65e9,
  ORCUS: GM_SUN / 3.12e9,
  GONGGONG: GM_SUN / 1.13e9,
  SYLVIA_87: GM_SUN / 1.34e11,
  DIDYMOS: GM_SUN / 3.76e18,
  NW189_2025: 1.028e-16,
  NU192_2025: 7.772e-17
};

const PAIR_SYSTEM_GM = {
  MOON: HOST_GM_AU3_DAY2.EARTH + HOST_GM_AU3_DAY2.MOON,
  CHARON: HOST_GM_AU3_DAY2.PLUTO * 1.1218
};

// Exact IAU/Hipparcos J2000 Heliocentric Galactic (+X=GC, +Y=l90, +Z=NGP) -> Three.js Scene
// Scene axes: X = x_ecl, Y = z_ecl (North Ecliptic Pole), Z = -y_ecl (det = +1.0)
export const GALACTIC_TO_SCENE_MAT3 = [
  -0.0548756577, 0.494109437, -0.867666138,
  -0.0964766946, 0.862285856,  0.497147212,
   0.993821367,  0.110990841,  0.00035154181
];

export const NEAR_PARABOLIC_EPS = 1e-4;
const KEPLER_TOL = 1e-13;

// Euclidean norm of two or three components. Math.hypot allocates a temporary array in V8 on every
// call, which the per-frame ephemeris path must not do.
function hypotN(x, y, z = 0.0) {
  return Math.sqrt(x * x + y * y + z * z);
}

export function mapRadiusAU(rAU, logBlend) {
  if (rAU <= 1e-12) return 0.0;
  const rLog = LOG_S0 * Math.log(1.0 + rAU / LOG_R0);
  return rAU * (1.0 - logBlend) + rLog * logBlend;
}

export function helioAUToSceneInto(xEcl, yEcl, zEcl, logBlend, outVec3) {
  const rAU = hypotN(xEcl, yEcl, zEcl);
  if (rAU <= 1e-12) return outVec3.set(0, 0, 0);
  const scale = mapRadiusAU(rAU, logBlend) / rAU;
  return outVec3.set(xEcl * scale, zEcl * scale, -yEcl * scale);
}

export function icrsToEclipticInto(xEq, yEq, zEq, outArr3) {
  outArr3[0] = xEq;
  outArr3[1] = yEq * COS_OBLIQ + zEq * SIN_OBLIQ;
  outArr3[2] = -yEq * SIN_OBLIQ + zEq * COS_OBLIQ;
  return outArr3;
}

export function eclipticToIcrsInto(xEcl, yEcl, zEcl, outArr3) {
  outArr3[0] = xEcl;
  outArr3[1] = yEcl * COS_OBLIQ - zEcl * SIN_OBLIQ;
  outArr3[2] = yEcl * SIN_OBLIQ + zEcl * COS_OBLIQ;
  return outArr3;
}

export function equatorialToSceneInto(xEq, yEq, zEq, outVec3) {
  const yEcl = yEq * COS_OBLIQ + zEq * SIN_OBLIQ;
  const zEcl = -yEq * SIN_OBLIQ + zEq * COS_OBLIQ;
  return outVec3.set(xEq, zEcl, -yEcl);
}

export function galacticKpcToSceneInto(xGalKpc, yGalKpc, zGalKpc, outVec3, unitsPerKpc = GALAXY_SCENE_PER_KPC) {
  const m = GALACTIC_TO_SCENE_MAT3;
  const sx = (m[0] * xGalKpc + m[1] * yGalKpc + m[2] * zGalKpc) * unitsPerKpc;
  const sy = (m[3] * xGalKpc + m[4] * yGalKpc + m[5] * zGalKpc) * unitsPerKpc;
  const sz = (m[6] * xGalKpc + m[7] * yGalKpc + m[8] * zGalKpc) * unitsPerKpc;
  return outVec3.set(sx, sy, sz);
}

export function eclipticPcToSceneInto(xEclPc, yEclPc, zEclPc, outVec3, unitsPerPc = GALAXY_SCENE_PER_PC) {
  return outVec3.set(xEclPc * unitsPerPc, zEclPc * unitsPerPc, -yEclPc * unitsPerPc);
}

export function icrsPcToSceneInto(xIcrsPc, yIcrsPc, zIcrsPc, outVec3, unitsPerPc = GALAXY_SCENE_PER_PC) {
  const yEcl = yIcrsPc * COS_OBLIQ + zIcrsPc * SIN_OBLIQ;
  const zEcl = -yIcrsPc * SIN_OBLIQ + zIcrsPc * COS_OBLIQ;
  return outVec3.set(xIcrsPc * unitsPerPc, zEcl * unitsPerPc, -yEcl * unitsPerPc);
}

export function raDecDistPcToSceneInto(raDeg, decDeg, distPc, outVec3, unitsPerPc = GALAXY_SCENE_PER_PC) {
  const ra = raDeg * DEG2RAD;
  const dec = decDeg * DEG2RAD;
  const cd = Math.cos(dec);
  return icrsPcToSceneInto(
    distPc * cd * Math.cos(ra),
    distPc * cd * Math.sin(ra),
    distPc * Math.sin(dec),
    outVec3,
    unitsPerPc
  );
}

export function sceneDistToDisplayString(distScene, logBlend = 1.0) {
  if (!Number.isFinite(distScene) || distScene <= 0) return "0 m";
  if (distScene >= 220.0 && logBlend > 0.5) {
    const pc = distScene / GALAXY_SCENE_PER_PC;
    const ly = pc * PC_TO_LY;
    if (ly >= 1000.0) return `${(ly / 1000.0).toFixed(2)} kly (${(pc / 1000.0).toFixed(2)} kpc)`;
    if (ly >= 10.0) return `${ly.toFixed(1)} ly (${pc.toFixed(1)} pc)`;
    return `${ly.toFixed(2)} ly (${pc.toFixed(2)} pc)`;
  }
  const rAU = logBlend > 0.5 ? LOG_R0 * (Math.exp(distScene / LOG_S0) - 1.0) : distScene;
  if (rAU >= 100000.0) {
    const pc = distScene / GALAXY_SCENE_PER_PC;
    const ly = pc * PC_TO_LY;
    return `${(ly / 1000.0).toFixed(2)} kly`;
  }
  if (rAU >= 1000.0) return `${Math.round(rAU).toLocaleString("en-US")} AU`;
  if (rAU >= 10.0) return `${rAU.toFixed(1)} AU`;
  if (rAU >= 0.01) return `${rAU.toFixed(3)} AU`;
  const km = rAU * AU_KM;
  if (km >= 10.0) return `${Math.round(km).toLocaleString("en-US")} km`;
  return `${Math.round(km * 1000.0).toLocaleString("en-US")} m`;
}

// Stumpff functions C(z) and S(z) with smooth series expansion near z = 0
export function stumpffCS(z) {
  if (z > 1e-2) {
    const sz = Math.sqrt(z);
    return {
      c: (1.0 - Math.cos(sz)) / z,
      s: (sz - Math.sin(sz)) / (sz * z)
    };
  }
  if (z < -1e-2) {
    const sz = Math.sqrt(-z);
    return {
      c: (Math.cosh(sz) - 1.0) / (-z),
      s: (Math.sinh(sz) - sz) / (sz * (-z))
    };
  }
  const z2 = z * z;
  const z3 = z2 * z;
  const z4 = z2 * z2;
  return {
    c: 0.5 - z / 24.0 + z2 / 720.0 - z3 / 40320.0 + z4 / 3628800.0,
    s: 1.0 / 6.0 - z / 120.0 + z2 / 5040.0 - z3 / 362880.0 + z4 / 39916800.0
  };
}

// Stumpff C(z), S(z) into out2 = [c, s] (no allocation).
function stumpffCSInto(z, out2) {
  _csZ[0] = z;
  stumpffCSScratch(out2);
  return out2;
}

const _csZ = new Float64Array(1);

function stumpffCSScratch(out2) {
  const z = _csZ[0];
  if (z > 1e-2) {
    const sz = Math.sqrt(z);
    out2[0] = (1.0 - Math.cos(sz)) / z;
    out2[1] = (sz - Math.sin(sz)) / (sz * z);
  } else if (z < -1e-2) {
    const sz = Math.sqrt(-z);
    out2[0] = (Math.cosh(sz) - 1.0) / (-z);
    out2[1] = (Math.sinh(sz) - sz) / (sz * (-z));
  } else {
    const z2 = z * z;
    const z3 = z2 * z;
    const z4 = z2 * z2;
    out2[0] = 0.5 - z / 24.0 + z2 / 720.0 - z3 / 40320.0 + z4 / 3628800.0;
    out2[1] = 1.0 / 6.0 - z / 120.0 + z2 / 5040.0 - z3 / 362880.0 + z4 / 39916800.0;
  }
}

// Elliptic Kepler solver (e < 1): Halley's method safeguarded by strict [lo, hi] bracketing
// V8 boxes a double returned by a function it does not inline, one small heap object per call.
// The per-frame path therefore uses the *Into / scratch variants below, which return nothing; the
// exported value-returning functions wrap them for every other caller.
// A double passed to a function that is not inlined is boxed the same way, so those variants take
// their inputs from scratch slots too, and the date of the frame is read from FRAME_CLOCK[0]
// (written once per frame by the application) instead of being passed down call by call.
const _kep1 = new Float64Array(1);
const _kepIn = new Float64Array(2);
// FRAME_CLOCK[0] = date of the frame (JD, TDB); FRAME_CLOCK[1] = days of integration lead wanted.
export const FRAME_CLOCK = new Float64Array([DISCOVERY_EPOCH_JD, 30.0]);

export function solveEllipticalKepler(M, e) {
  _kepIn[0] = M;
  _kepIn[1] = e;
  solveEllipticalKeplerScratch();
  return _kep1[0];
}

function solveEllipticalKeplerScratch() {
  const M = _kepIn[0];
  const e = _kepIn[1];
  let m = ((M % TWO_PI) + TWO_PI) % TWO_PI;
  if (m > Math.PI) m -= TWO_PI;
  if (Math.abs(m) < 1e-15) {
    _kep1[0] = 0.0;
    return;
  }
  const sign = m < 0 ? -1.0 : 1.0;
  m = Math.abs(m);

  let E;
  if (e < 0.8) {
    E = m + e * Math.sin(m) + 0.5 * e * e * Math.sin(2.0 * m);
  } else {
    const k = 0.85;
    E = m < 0.25 ? Math.min(Math.PI, Math.cbrt(6.0 * m)) : Math.min(Math.PI, m + k * e);
  }
  let lo = 0.0;
  let hi = Math.PI;
  if (E <= lo || E >= hi) E = 0.5 * (lo + hi);

  for (let iter = 0; iter < 32; iter++) {
    const sinE = Math.sin(E);
    const cosE = Math.cos(E);
    const f = E - e * sinE - m;
    if (Math.abs(f) < KEPLER_TOL) break;
    if (f < 0.0) lo = E;
    else hi = E;

    const fp = 1.0 - e * cosE;
    const fpp = e * sinE;
    const denom = fp - 0.5 * f * (fpp / Math.max(fp, 1e-14));
    let nextE = Math.abs(denom) > 1e-14 ? E - f / denom : 0.5 * (lo + hi);
    if (nextE <= lo || nextE >= hi || !Number.isFinite(nextE)) {
      nextE = 0.5 * (lo + hi);
    }
    const step = Math.abs(nextE - E);
    E = nextE;
    if (step < KEPLER_TOL) break;
  }
  _kep1[0] = sign * E;
}

// Hyperbolic Kepler solver (e > 1): Halley's method with monotonic bracketing
export function solveHyperbolicKepler(M, e) {
  _kepIn[0] = M;
  _kepIn[1] = e;
  solveHyperbolicKeplerScratch();
  return _kep1[0];
}

function solveHyperbolicKeplerScratch() {
  const M = _kepIn[0];
  const e = _kepIn[1];
  if (Math.abs(M) < 1e-15) {
    _kep1[0] = 0.0;
    return;
  }
  const sign = M < 0 ? -1.0 : 1.0;
  const absM = Math.abs(M);

  let H;
  if (absM < 1.0 && e < 1.5) {
    H = Math.cbrt((6.0 * absM) / e);
  } else if (absM < 4.0 * e) {
    H = Math.asinh(absM / e);
  } else {
    H = Math.log((2.0 * absM) / e + 1.8);
  }

  let lo = 0.0;
  let hi = 1e300;
  const tol = KEPLER_TOL * Math.max(1.0, absM);

  for (let iter = 0; iter < 40; iter++) {
    const sinhH = Math.sinh(H);
    const coshH = Math.cosh(H);
    const f = e * sinhH - H - absM;
    if (Math.abs(f) < tol) break;
    if (f < 0.0) lo = Math.max(lo, H);
    else hi = Math.min(hi, H);

    const fp = e * coshH - 1.0;
    const fpp = e * sinhH;
    const denom = fp - 0.5 * f * (fpp / Math.max(fp, 1e-14));
    let dH = Math.abs(denom) > 1e-14 ? f / denom : f / Math.max(fp, 1e-14);
    if (!(dH > -1e300 && dH < 1e300)) dH = 0.0;
    dH = Math.max(-5.0, Math.min(5.0, dH));
    let nextH = H - dH;
    if (nextH <= lo || nextH >= hi) {
      nextH = hi < 1e299 ? 0.5 * (lo + hi) : Math.max(lo + 0.5, H * 1.5 + 0.1);
    }
    const step = Math.abs(nextH - H);
    H = nextH;
    if (step < KEPLER_TOL * Math.max(1.0, Math.abs(H))) break;
  }
  _kep1[0] = sign * H;
}

// Near-parabolic & universal-variable Kepler solver from periapsis (Barker cubic seed + Stumpff Halley)
// Exact across e = 1 - eps, e = 1.0, and e = 1 + eps without singularity or cancellation.
export function solveUniversalPeriapsisOrbitalXY(dtDays, qAU, e, gm) {
  if (Math.abs(dtDays) < 1e-15) {
    return { xOrb: qAU, yOrb: 0.0, r: qAU, chi: 0.0 };
  }
  const sqrtMu = Math.sqrt(gm);
  const alpha = (1.0 - e) / qAU;
  const target = sqrtMu * dtDays;

  // Exact closed-form Barker parabolic solution as initial universal anomaly chi0
  const W = 1.5 * Math.sqrt(gm / (2.0 * qAU * qAU * qAU)) * dtDays;
  const Y = Math.cbrt(W + hypotN(W, 1.0));
  const D = Math.abs(Y) > 1e-14 ? Y - 1.0 / Y : 0.0;
  let chi = Math.sqrt(2.0 * qAU) * D;

  const tol = KEPLER_TOL * Math.max(1.0, Math.abs(target));
  for (let iter = 0; iter < 36; iter++) {
    const chi2 = chi * chi;
    const z = alpha * chi2;
    const { c, s } = stumpffCS(z);
    const f = qAU * chi + e * chi2 * chi * s - target;
    if (Math.abs(f) < tol) break;
    const fp = qAU + e * chi2 * c;
    const fpp = e * chi * (1.0 - z * s);
    const denom = fp - 0.5 * f * (fpp / Math.max(fp, 1e-14));
    const dChi = Math.abs(denom) > 1e-14 ? f / denom : f / Math.max(fp, 1e-14);
    chi -= dChi;
    if (Math.abs(dChi) < KEPLER_TOL * Math.max(1.0, Math.abs(chi))) break;
  }

  const chi2 = chi * chi;
  const z = alpha * chi2;
  const { c, s } = stumpffCS(z);
  const xOrb = qAU - chi2 * c;
  const yOrb = Math.sqrt((1.0 + e) / qAU) * (qAU * chi - (1.0 - e) * chi2 * chi * s);
  return { xOrb, yOrb, r: hypotN(xOrb, yOrb), chi };
}

const _cs2 = new Float64Array(2);
const _uni2 = new Float64Array(2);

// Same solution as solveUniversalPeriapsisOrbitalXY, written to out2 = [xOrb, yOrb] without
// allocating; used by the per-frame position update of near-parabolic orbits.
function solveUniversalPeriapsisInto(dtDays, qAU, e, gm, out2) {
  _uniIn[0] = dtDays;
  _uniIn[1] = qAU;
  _uniIn[2] = e;
  _uniIn[3] = gm;
  solveUniversalPeriapsisScratch(out2);
  return out2;
}

const _uniIn = new Float64Array(4);

function solveUniversalPeriapsisScratch(out2) {
  const dtDays = _uniIn[0], qAU = _uniIn[1], e = _uniIn[2], gm = _uniIn[3];
  if (Math.abs(dtDays) < 1e-15) {
    out2[0] = qAU;
    out2[1] = 0.0;
    return out2;
  }
  const alpha = (1.0 - e) / qAU;
  const target = Math.sqrt(gm) * dtDays;
  const W = 1.5 * Math.sqrt(gm / (2.0 * qAU * qAU * qAU)) * dtDays;
  const Y = Math.cbrt(W + Math.sqrt(W * W + 1.0));
  const D = Math.abs(Y) > 1e-14 ? Y - 1.0 / Y : 0.0;
  let chi = Math.sqrt(2.0 * qAU) * D;
  const tol = KEPLER_TOL * Math.max(1.0, Math.abs(target));
  for (let iter = 0; iter < 36; iter++) {
    const chi2 = chi * chi;
    const z = alpha * chi2;
    _csZ[0] = z;
    stumpffCSScratch(_cs2);
    const f = qAU * chi + e * chi2 * chi * _cs2[1] - target;
    if (Math.abs(f) < tol) break;
    const fp = qAU + e * chi2 * _cs2[0];
    const fpp = e * chi * (1.0 - z * _cs2[1]);
    const denom = fp - 0.5 * f * (fpp / Math.max(fp, 1e-14));
    const dChi = Math.abs(denom) > 1e-14 ? f / denom : f / Math.max(fp, 1e-14);
    chi -= dChi;
    if (Math.abs(dChi) < KEPLER_TOL * Math.max(1.0, Math.abs(chi))) break;
  }
  const chi2 = chi * chi;
  _csZ[0] = alpha * chi2;
  stumpffCSScratch(_cs2);
  out2[0] = qAU - chi2 * _cs2[0];
  out2[1] = Math.sqrt((1.0 + e) / qAU) * (qAU * chi - (1.0 - e) * chi2 * chi * _cs2[1]);
  return out2;
}

// Effective GM of an object's orbit. The elements of a catalogue object never change, so the
// value is computed once per object (the id normalisation below would allocate on every call).
export function getEffectiveGM(obj) {
  if (obj._gmCache !== undefined) return obj._gmCache;
  const gm = computeEffectiveGM(obj);
  obj._gmCache = gm;
  return gm;
}

function computeEffectiveGM(obj) {
  if (obj.parent_id) {
    const uid = String(obj.id || "").toUpperCase();
    if (PAIR_SYSTEM_GM[uid]) return PAIR_SYSTEM_GM[uid];
    const pid = String(obj.parent_id).toUpperCase();
    if (HOST_GM_AU3_DAY2[pid]) return HOST_GM_AU3_DAY2[pid];
    if (obj.period_days > 0 && obj.a_au > 0) {
      const n = TWO_PI / obj.period_days;
      return n * n * obj.a_au * obj.a_au * obj.a_au;
    }
    return HOST_GM_AU3_DAY2.EARTH;
  }
  const uid = String(obj.id || "").toUpperCase();
  const mRat = PLANET_MASS_RATIOS[uid] || 0.0;
  return GM_SUN * (1.0 + mRat);
}

export function getMeanMotionRadPerDay(obj) {
  if (obj._nRadDayCache !== undefined) return obj._nRadDayCache;
  const n = computeMeanMotionRadPerDay(obj);
  obj._nRadDayCache = n;
  return n;
}

function computeMeanMotionRadPerDay(obj) {
  const aAbs = obj.q_au > 0 && Math.abs(1.0 - (obj.e || 0)) >= NEAR_PARABOLIC_EPS && (obj.e || 0) >= 1.0
    ? obj.q_au / ((obj.e || 0) - 1.0)
    : Math.max(1e-12, Math.abs(obj.a_au || 1.0));

  if (obj.parent_id) {
    if (obj.period_days && obj.period_days > 0) {
      return TWO_PI / obj.period_days;
    }
    const uid = String(obj.id || "").toUpperCase();
    const pid = String(obj.parent_id).toUpperCase();
    // Use exact host GM when a_au has adequate precision (>= 0.002 AU) or period_yr is absent
    const hostGm = PAIR_SYSTEM_GM[uid] || HOST_GM_AU3_DAY2[pid];
    if (hostGm && (!obj.period_yr || aAbs >= 0.002)) {
      return Math.sqrt(hostGm / (aAbs * aAbs * aAbs));
    }
    if (obj.period_yr && obj.period_yr > 0) {
      return TWO_PI / (obj.period_yr * 365.25);
    }
    return Math.sqrt((hostGm || HOST_GM_AU3_DAY2.EARTH) / (aAbs * aAbs * aAbs));
  }

  const gm = getEffectiveGM(obj);
  return Math.sqrt(gm / (aAbs * aAbs * aAbs));
}

export function getOrbitalBasisVectors(obj) {
  if (obj._basisCache) return obj._basisCache;
  const inc = (obj.i_deg || 0) * DEG2RAD;
  const Om = (obj.Omega_deg || 0) * DEG2RAD;
  const om = (obj.omega_deg || 0) * DEG2RAD;

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
  obj._basisCache = basis;
  return basis;
}

export function computeLocalKeplerianEclipticAU(obj, jd, outArr3) {
  computeLocalKeplerianInto(obj, jd, outArr3);
  return hypotN(outArr3[0], outArr3[1], outArr3[2]);
}

// Position on the object's Keplerian orbit at jd into outArr3 (local ecliptic AU); returns nothing.
export function computeLocalKeplerianInto(obj, jd, outArr3) {
  const saved = FRAME_CLOCK[0];
  FRAME_CLOCK[0] = jd;
  computeLocalKeplerianAtFrameJD(obj, outArr3);
  FRAME_CLOCK[0] = saved;
}

// Per-frame entry point: the same position at the date in FRAME_CLOCK[0]. Allocates nothing.
export function computeLocalKeplerianAtFrameJD(obj, outArr3) {
  const jd = FRAME_CLOCK[0];
  if (obj.category === "star" || (Math.abs(obj.a_au) < 1e-12 && !obj.q_au && !obj.parent_id)) {
    outArr3[0] = 0;
    outArr3[1] = 0;
    outArr3[2] = 0;
    return;
  }

  const e = Math.max(0.0, obj.e || 0.0);
  const basis = getOrbitalBasisVectors(obj);
  const epoch = obj.epoch_jd ?? DISCOVERY_EPOCH_JD;
  const hasExplicitM0 = obj.has_M0 !== undefined ? obj.has_M0 : (obj.M0_deg !== null && obj.M0_deg !== undefined);
  let xOrb = 0.0;
  let yOrb = 0.0;

  if (Math.abs(1.0 - e) < NEAR_PARABOLIC_EPS) {
    // Near-parabolic & exact parabolic regime via Barker/Stumpff universal variable solver
    const q = obj.q_au > 0 ? obj.q_au : Math.abs(obj.a_au) * Math.abs(1.0 - e);
    if (obj._gmCache === undefined) getEffectiveGM(obj);
    const gm = obj._gmCache;
    let dtFromTp;
    if (obj.tp_jd !== null && obj.tp_jd !== undefined) {
      dtFromTp = jd - obj.tp_jd;
    } else {
      if (obj._nRadDayCache === undefined) getMeanMotionRadPerDay(obj);
      const nEst = obj._nRadDayCache;
      let m0 = (obj.M0_deg || 0.0) * DEG2RAD;
      if (e < 1.0 && m0 > Math.PI) m0 -= TWO_PI;
      dtFromTp = (jd - epoch) + m0 / Math.max(nEst, 1e-15);
    }
    _uniIn[0] = dtFromTp;
    _uniIn[1] = Math.max(1e-9, q);
    _uniIn[2] = e;
    _uniIn[3] = gm;
    solveUniversalPeriapsisScratch(_uni2);
    xOrb = _uni2[0];
    yOrb = _uni2[1];
  } else if (e >= 1.0 + NEAR_PARABOLIC_EPS) {
    // Hyperbolic trajectory (1I/'Oumuamua, 2I/Borisov, 3I/ATLAS, Voyager/Pioneer/New Horizons)
    const aAbs = obj.q_au > 0 ? obj.q_au / (e - 1.0) : Math.abs(obj.a_au);
    if (obj._gmCache === undefined) getEffectiveGM(obj);
    const gm = obj._gmCache;
    const n = Math.sqrt(gm / (aAbs * aAbs * aAbs));
    let M;
    if (obj.tp_jd !== null && obj.tp_jd !== undefined && !hasExplicitM0) {
      M = n * (jd - obj.tp_jd);
    } else if (hasExplicitM0) {
      M = obj.M0_deg * DEG2RAD + n * (jd - epoch);
    } else {
      M = n * (jd - (obj.tp_jd ?? epoch));
    }
    _kepIn[0] = M;
    _kepIn[1] = e;
    solveHyperbolicKeplerScratch();
    const H = _kep1[0];
    xOrb = aAbs * (e - Math.cosh(H));
    yOrb = aAbs * Math.sqrt(e * e - 1.0) * Math.sinh(H);
  } else {
    // Elliptical orbit (planets, moons, asteroids, TNOs, eTNOs, Oort comets)
    const a = Math.max(1e-10, Math.abs(obj.a_au));
    if (obj._nRadDayCache === undefined) getMeanMotionRadPerDay(obj);
    const n = obj._nRadDayCache;
    let M;
    if (hasExplicitM0) {
      M = obj.M0_deg * DEG2RAD + n * (jd - epoch);
    } else if (obj.tp_jd !== null && obj.tp_jd !== undefined) {
      M = n * (jd - obj.tp_jd);
    } else {
      M = n * (jd - epoch);
    }
    _kepIn[0] = M;
    _kepIn[1] = e;
    solveEllipticalKeplerScratch();
    const E = _kep1[0];
    xOrb = a * (Math.cos(E) - e);
    yOrb = a * Math.sqrt(Math.max(0.0, 1.0 - e * e)) * Math.sin(E);
  }

  outArr3[0] = basis.Px * xOrb + basis.Qx * yOrb;
  outArr3[1] = basis.Py * xOrb + basis.Qy * yOrb;
  outArr3[2] = basis.Pz * xOrb + basis.Qz * yOrb;
}

export function computeEuclidL2LocalOffsetEclipticAU(earthEcl3, jd, outArr3, phaseDeg = 0.0, isL1 = false) {
  computeLagrangeHaloOffsetInto(earthEcl3, jd, outArr3, phaseDeg, isL1);
  return hypotN(outArr3[0], outArr3[1], outArr3[2]);
}

// Sun-Earth L1/L2 halo offset from the Earth (ecliptic AU) into outArr3; returns nothing.
export function computeLagrangeHaloOffsetInto(earthEcl3, jd, outArr3, phaseDeg, isL1) {
  const saved = FRAME_CLOCK[0];
  FRAME_CLOCK[0] = jd;
  _haloPhase[0] = phaseDeg || 0.0;
  lagrangeHaloCore(earthEcl3, outArr3, isL1);
  FRAME_CLOCK[0] = saved;
}

// Per-frame entry point: halo offset of a catalogue spacecraft (l1_phase_deg or l2_phase_deg) at
// the date in FRAME_CLOCK[0]. Allocates nothing.
export function computeLagrangeHaloOffsetAtFrameJD(earthEcl3, outArr3, childObj, isL1) {
  _haloPhase[0] = (isL1 ? childObj.l1_phase_deg : childObj.l2_phase_deg) || 0.0;
  lagrangeHaloCore(earthEcl3, outArr3, isL1);
}

const _haloPhase = new Float64Array(1);

function lagrangeHaloCore(earthEcl3, outArr3, isL1) {
  const jd = FRAME_CLOCK[0];
  const phaseDeg = _haloPhase[0];
  const rx = earthEcl3[0], ry = earthEcl3[1], rz = earthEcl3[2];
  const r = hypotN(rx, ry, rz) || 1.0;
  const ux = rx / r, uy = ry / r, uz = rz / r;
  const tLen = hypotN(-uy, ux) || 1.0;
  const tx = -uy / tLen, ty = ux / tLen;

  const phase = TWO_PI * ((jd - DISCOVERY_EPOCH_JD) / 178.4) + (phaseDeg || 0.0) * DEG2RAD;
  const radialCenter = isL1 ? -0.01002 : 0.01002;
  const haloAmpT = 0.0031 * Math.cos(phase);
  const haloAmpR = 0.0014 * Math.sin(phase);
  // In-plane and out-of-plane motion share one period (a halo orbit, not a Lissajous), so the
  // drawn ring is closed and the spacecraft stays on it at every epoch.
  const haloAmpZ = 0.0024 * Math.sin(phase + 0.6);

  outArr3[0] = ux * (radialCenter + haloAmpR) + tx * haloAmpT;
  outArr3[1] = uy * (radialCenter + haloAmpR) + ty * haloAmpT;
  outArr3[2] = uz * (radialCenter + haloAmpR) + haloAmpZ;
}

// Camera view-field state for view-anchored orbit polygon tessellation:
// [0..2] = camPosScene (x, y, z), [3] = dFloorScene, [4] = logBlend (0..1), [5] = initialized (0|1)
export const ORBIT_VIEW_STATE = new Float64Array([0.0, 26.0, 56.0, 2.0, 1.0, 0.0]);
// Index of the vertex pinned to the object's live position in the most recent sample*OrbitRawAU call
export const LAST_ORBIT_OBJ_VERT_IDX = new Int32Array([160]);

const CDF_STEPS = 384;
const _cdfParam = new Float64Array(CDF_STEPS + 1);
const _cdfW = new Float64Array(CDF_STEPS + 1);

function mapRawAUToSceneXYZ(xE, zE, negYE, logBlend, out3) {
  const r = Math.hypot(xE, zE, negYE);
  if (r < 1e-12) {
    out3[0] = 0.0; out3[1] = 0.0; out3[2] = 0.0;
    return;
  }
  const rLog = LOG_S0 * Math.log(1.0 + r / LOG_R0);
  const sc = (r + (rLog - r) * logBlend) / r;
  out3[0] = xE * sc;
  out3[1] = zE * sc;
  out3[2] = negYE * sc;
}

const _cdfSceneCur = new Float64Array(3);
const _cdfScenePrev = new Float64Array(3);

function resampleClosedEllipseViewAnchored(a, e, Px, Py, Pz, Qx, Qy, Qz, dx0, dy0, dz0, Enow, arr) {
  const steps = (arr.length / 3) | 0;
  const bFac = Math.sqrt(Math.max(1e-12, 1.0 - e * e));
  const halfRatioPow = Math.pow(Math.max(1e-7, (1.0 - e) / (1.0 + e)), 0.25);
  const camX = ORBIT_VIEW_STATE[0], camY = ORBIT_VIEW_STATE[1], camZ = ORBIT_VIEW_STATE[2];
  const dFloor = Math.max(1e-5, ORBIT_VIEW_STATE[3] || 1.0);
  const logBlend = ORBIT_VIEW_STATE[4];

  let prevE = -Math.PI;
  let prevV = -Math.PI;
  _cdfParam[0] = -Math.PI;
  _cdfW[0] = 0.0;

  for (let m = 0; m <= CDF_STEPS; m++) {
    let E;
    if (m === 0) E = -Math.PI;
    else if (m === CDF_STEPS) E = Math.PI;
    else {
      const theta = -Math.PI + (TWO_PI * m) / CDF_STEPS;
      E = 2.0 * Math.atan(halfRatioPow * Math.tan(theta * 0.5));
    }
    const cosE = Math.cos(E), sinE = Math.sin(E);
    const xOrb = a * (cosE - e);
    const yOrb = a * bFac * sinE;
    const v = Math.atan2(bFac * sinE, cosE - e);
    const xE = Px * xOrb + Qx * yOrb + dx0;
    const yE = Py * xOrb + Qy * yOrb + dy0;
    const zE = Pz * xOrb + Qz * yOrb + dz0;
    mapRawAUToSceneXYZ(xE, zE, -yE, logBlend, _cdfSceneCur);

    if (m > 0) {
      const dE = Math.abs(E - prevE);
      let dV = Math.abs(v - prevV);
      if (dV > Math.PI) dV = TWO_PI - dV;
      const ds = Math.hypot(
        _cdfSceneCur[0] - _cdfScenePrev[0],
        _cdfSceneCur[1] - _cdfScenePrev[1],
        _cdfSceneCur[2] - _cdfScenePrev[2]
      );
      const mx = 0.5 * (_cdfSceneCur[0] + _cdfScenePrev[0]);
      const my = 0.5 * (_cdfSceneCur[1] + _cdfScenePrev[1]);
      const mz = 0.5 * (_cdfSceneCur[2] + _cdfScenePrev[2]);
      const dCam = Math.max(dFloor, Math.hypot(mx - camX, my - camY, mz - camZ));
      const dThetaCam = ds / dCam;
      _cdfParam[m] = E;
      _cdfW[m] = _cdfW[m - 1] + 0.30 * dE + 0.55 * dV + 2.40 * dThetaCam;
    }
    prevE = E;
    prevV = v;
    _cdfScenePrev[0] = _cdfSceneCur[0];
    _cdfScenePrev[1] = _cdfSceneCur[1];
    _cdfScenePrev[2] = _cdfSceneCur[2];
  }

  let eNorm = ((Enow + Math.PI) % TWO_PI);
  if (eNorm < 0.0) eNorm += TWO_PI;
  const eTarget = eNorm - Math.PI;

  const totalW = Math.max(1e-12, _cdfW[CDF_STEPS]);
  let mPtr = 1;
  let bestK = 0;
  let bestEDiff = 1e9;

  for (let k = 0; k < steps; k++) {
    const wTarget = (k / steps) * totalW;
    while (mPtr < CDF_STEPS && _cdfW[mPtr] < wTarget) mPtr++;
    const w0 = _cdfW[mPtr - 1], w1 = _cdfW[mPtr];
    const frac = w1 > w0 ? (wTarget - w0) / (w1 - w0) : 0.0;
    const E = _cdfParam[mPtr - 1] + frac * (_cdfParam[mPtr] - _cdfParam[mPtr - 1]);
    let diff = Math.abs(E - eTarget);
    if (diff > Math.PI) diff = TWO_PI - diff;
    if (diff < bestEDiff) {
      bestEDiff = diff;
      bestK = k;
    }
    const xOrb = a * (Math.cos(E) - e);
    const yOrb = a * bFac * Math.sin(E);
    arr[k * 3 + 0] = Px * xOrb + Qx * yOrb + dx0;
    arr[k * 3 + 1] = Pz * xOrb + Qz * yOrb + dz0;
    arr[k * 3 + 2] = -(Py * xOrb + Qy * yOrb + dy0);
  }

  // Pin vertex bestK to the exact live anomaly Enow so the orbit passes directly through the object
  const xNow = a * (Math.cos(eTarget) - e);
  const yNow = a * bFac * Math.sin(eTarget);
  arr[bestK * 3 + 0] = Px * xNow + Qx * yNow + dx0;
  arr[bestK * 3 + 1] = Pz * xNow + Qz * yNow + dz0;
  arr[bestK * 3 + 2] = -(Py * xNow + Qy * yNow + dy0);
  LAST_ORBIT_OBJ_VERT_IDX[0] = bestK;
  return arr;
}

// Sample raw scene-oriented AU coordinates [xE, zE, -yE, ...] into a Float32Array (zero Vector3 churn).
// Anchors polygon vertex density on the current camera view field + true anomaly around the Sun while
// pinning the nearest vertex to the object's exact live position at `jd`.
export function sampleHeliocentricOrbitRawAU(obj, jd = null, outPositions = null) {
  if (obj.category === "star" || obj.parent_id) return { positions: new Float32Array(0), closed: false };
  const evalJD = jd === null ? (FRAME_CLOCK[0] || DISCOVERY_EPOCH_JD) : jd;
  const e = Math.max(0.0, obj.e || 0.0);
  const basis = getOrbitalBasisVectors(obj);
  const epoch = obj.epoch_jd ?? DISCOVERY_EPOCH_JD;
  const hasExplicitM0 = obj.has_M0 !== undefined ? obj.has_M0 : (obj.M0_deg !== null && obj.M0_deg !== undefined);
  const camX = ORBIT_VIEW_STATE[0], camY = ORBIT_VIEW_STATE[1], camZ = ORBIT_VIEW_STATE[2];
  const dFloor = Math.max(1e-5, ORBIT_VIEW_STATE[3] || 1.0);
  const logBlend = ORBIT_VIEW_STATE[4];

  if (Math.abs(1.0 - e) < NEAR_PARABOLIC_EPS) {
    const q = Math.max(1e-6, obj.q_au > 0 ? obj.q_au : Math.abs(obj.a_au) * Math.abs(1.0 - e));
    if (obj._gmCache === undefined) getEffectiveGM(obj);
    const gm = obj._gmCache;
    let dtFromTp;
    if (obj.tp_jd !== null && obj.tp_jd !== undefined) {
      dtFromTp = evalJD - obj.tp_jd;
    } else {
      if (obj._nRadDayCache === undefined) getMeanMotionRadPerDay(obj);
      const nEst = obj._nRadDayCache;
      let m0 = (obj.M0_deg || 0.0) * DEG2RAD;
      if (e < 1.0 && m0 > Math.PI) m0 -= TWO_PI;
      dtFromTp = (evalJD - epoch) + m0 / Math.max(nEst, 1e-15);
    }
    _uniIn[0] = dtFromTp;
    _uniIn[1] = Math.max(1e-9, q);
    _uniIn[2] = e;
    _uniIn[3] = gm;
    solveUniversalPeriapsisScratch(_uni2);
    const Dnow = _uni2[1] / Math.max(1e-9, 2.0 * q);

    const rMaxAU = Math.max(120.0, q * 40.0);
    const dMax = Math.max(Math.abs(Dnow) + 0.5, Math.sqrt(Math.max(0.5, rMaxAU / q - 1.0)));
    let prevD = -dMax;
    let prevV = 2.0 * Math.atan(-dMax);
    _cdfParam[0] = -dMax;
    _cdfW[0] = 0.0;

    for (let m = 0; m <= CDF_STEPS; m++) {
      const u = (2.0 * m) / CDF_STEPS - 1.0;
      const D = dMax * (0.20 * u + 0.80 * u * u * u);
      const xOrb = q * (1.0 - D * D);
      const yOrb = 2.0 * q * D;
      const v = 2.0 * Math.atan(D);
      const xE = basis.Px * xOrb + basis.Qx * yOrb;
      const yE = basis.Py * xOrb + basis.Qy * yOrb;
      const zE = basis.Pz * xOrb + basis.Qz * yOrb;
      mapRawAUToSceneXYZ(xE, zE, -yE, logBlend, _cdfSceneCur);
      if (m > 0) {
        const dV = Math.abs(v - prevV);
        const ds = Math.hypot(
          _cdfSceneCur[0] - _cdfScenePrev[0],
          _cdfSceneCur[1] - _cdfScenePrev[1],
          _cdfSceneCur[2] - _cdfScenePrev[2]
        );
        const dCam = Math.max(dFloor, Math.hypot(_cdfSceneCur[0] - camX, _cdfSceneCur[1] - camY, _cdfSceneCur[2] - camZ));
        _cdfParam[m] = D;
        _cdfW[m] = _cdfW[m - 1] + 0.25 * (Math.abs(D - prevD) / dMax) + 0.65 * dV + 2.40 * (ds / dCam);
      }
      prevD = D;
      prevV = v;
      _cdfScenePrev[0] = _cdfSceneCur[0];
      _cdfScenePrev[1] = _cdfSceneCur[1];
      _cdfScenePrev[2] = _cdfSceneCur[2];
    }

    const steps = 256;
    const arr = outPositions && outPositions.length === (steps + 1) * 3 ? outPositions : new Float32Array((steps + 1) * 3);
    const totalW = Math.max(1e-12, _cdfW[CDF_STEPS]);
    let mPtr = 1, bestK = 0, bestDiff = 1e9;
    for (let k = 0; k <= steps; k++) {
      const wTarget = (k / steps) * totalW;
      while (mPtr < CDF_STEPS && _cdfW[mPtr] < wTarget) mPtr++;
      const w0 = _cdfW[mPtr - 1], w1 = _cdfW[mPtr];
      const frac = w1 > w0 ? (wTarget - w0) / (w1 - w0) : 0.0;
      const D = _cdfParam[mPtr - 1] + frac * (_cdfParam[mPtr] - _cdfParam[mPtr - 1]);
      const diff = Math.abs(D - Dnow);
      if (diff < bestDiff) { bestDiff = diff; bestK = k; }
      const xOrb = q * (1.0 - D * D);
      const yOrb = 2.0 * q * D;
      arr[k * 3 + 0] = basis.Px * xOrb + basis.Qx * yOrb;
      arr[k * 3 + 1] = basis.Pz * xOrb + basis.Qz * yOrb;
      arr[k * 3 + 2] = -(basis.Py * xOrb + basis.Qy * yOrb);
    }
    const xNow = q * (1.0 - Dnow * Dnow);
    const yNow = 2.0 * q * Dnow;
    arr[bestK * 3 + 0] = basis.Px * xNow + basis.Qx * yNow;
    arr[bestK * 3 + 1] = basis.Pz * xNow + basis.Qz * yNow;
    arr[bestK * 3 + 2] = -(basis.Py * xNow + basis.Qy * yNow);
    LAST_ORBIT_OBJ_VERT_IDX[0] = bestK;
    return { positions: arr, closed: false };
  }

  if (e >= 1.0 + NEAR_PARABOLIC_EPS) {
    const aAbs = obj.q_au > 0 ? obj.q_au / (e - 1.0) : Math.abs(obj.a_au);
    if (obj._gmCache === undefined) getEffectiveGM(obj);
    const gm = obj._gmCache;
    const n = Math.sqrt(gm / (aAbs * aAbs * aAbs));
    let M;
    if (obj.tp_jd !== null && obj.tp_jd !== undefined && !hasExplicitM0) {
      M = n * (evalJD - obj.tp_jd);
    } else if (hasExplicitM0) {
      M = obj.M0_deg * DEG2RAD + n * (evalJD - epoch);
    } else {
      M = n * (evalJD - (obj.tp_jd ?? epoch));
    }
    _kepIn[0] = M;
    _kepIn[1] = e;
    solveHyperbolicKeplerScratch();
    const Hnow = _kep1[0];

    const isOutboundProbe = obj.category === "spacecraft" || obj.visual_type?.startsWith("spacecraft");
    const rMaxAU = isOutboundProbe ? 195.0 : 135.0;
    const coshMax = Math.max(1.05, (rMaxAU / aAbs + 1.0) / e);
    const hMax = Math.max(Math.abs(Hnow) + 0.25, Math.acosh(Math.min(coshMax, 1200.0)));
    const hMin = isOutboundProbe ? Math.min(0.0, Hnow) : -hMax;
    const sqrtE2m1 = Math.sqrt(e * e - 1.0);

    let prevH = hMin;
    let prevV = Math.atan2(sqrtE2m1 * Math.sinh(hMin), e - Math.cosh(hMin));
    _cdfParam[0] = hMin;
    _cdfW[0] = 0.0;

    for (let m = 0; m <= CDF_STEPS; m++) {
      let H;
      if (isOutboundProbe) {
        const u = m / CDF_STEPS;
        H = hMin + (hMax - hMin) * (0.20 * u + 0.80 * u * u);
      } else {
        const u = (2.0 * m) / CDF_STEPS - 1.0;
        H = hMax * (0.18 * u + 0.82 * u * u * u);
      }
      const xOrb = aAbs * (e - Math.cosh(H));
      const yOrb = aAbs * sqrtE2m1 * Math.sinh(H);
      const v = Math.atan2(yOrb, xOrb);
      const xE = basis.Px * xOrb + basis.Qx * yOrb;
      const yE = basis.Py * xOrb + basis.Qy * yOrb;
      const zE = basis.Pz * xOrb + basis.Qz * yOrb;
      mapRawAUToSceneXYZ(xE, zE, -yE, logBlend, _cdfSceneCur);
      if (m > 0) {
        const dV = Math.abs(v - prevV);
        const ds = Math.hypot(
          _cdfSceneCur[0] - _cdfScenePrev[0],
          _cdfSceneCur[1] - _cdfScenePrev[1],
          _cdfSceneCur[2] - _cdfScenePrev[2]
        );
        const dCam = Math.max(dFloor, Math.hypot(_cdfSceneCur[0] - camX, _cdfSceneCur[1] - camY, _cdfSceneCur[2] - camZ));
        _cdfParam[m] = H;
        _cdfW[m] = _cdfW[m - 1] + 0.25 * (Math.abs(H - prevH) / Math.max(1e-4, hMax - hMin)) + 0.65 * dV + 2.40 * (ds / dCam);
      }
      prevH = H;
      prevV = v;
      _cdfScenePrev[0] = _cdfSceneCur[0];
      _cdfScenePrev[1] = _cdfSceneCur[1];
      _cdfScenePrev[2] = _cdfSceneCur[2];
    }

    const steps = 256;
    const arr = outPositions && outPositions.length === (steps + 1) * 3 ? outPositions : new Float32Array((steps + 1) * 3);
    const totalW = Math.max(1e-12, _cdfW[CDF_STEPS]);
    let mPtr = 1, bestK = 0, bestDiff = 1e9;
    for (let k = 0; k <= steps; k++) {
      const wTarget = (k / steps) * totalW;
      while (mPtr < CDF_STEPS && _cdfW[mPtr] < wTarget) mPtr++;
      const w0 = _cdfW[mPtr - 1], w1 = _cdfW[mPtr];
      const frac = w1 > w0 ? (wTarget - w0) / (w1 - w0) : 0.0;
      const H = _cdfParam[mPtr - 1] + frac * (_cdfParam[mPtr] - _cdfParam[mPtr - 1]);
      const diff = Math.abs(H - Hnow);
      if (diff < bestDiff) { bestDiff = diff; bestK = k; }
      const xOrb = aAbs * (e - Math.cosh(H));
      const yOrb = aAbs * sqrtE2m1 * Math.sinh(H);
      arr[k * 3 + 0] = basis.Px * xOrb + basis.Qx * yOrb;
      arr[k * 3 + 1] = basis.Pz * xOrb + basis.Qz * yOrb;
      arr[k * 3 + 2] = -(basis.Py * xOrb + basis.Qy * yOrb);
    }
    const xNow = aAbs * (e - Math.cosh(Hnow));
    const yNow = aAbs * sqrtE2m1 * Math.sinh(Hnow);
    arr[bestK * 3 + 0] = basis.Px * xNow + basis.Qx * yNow;
    arr[bestK * 3 + 1] = basis.Pz * xNow + basis.Qz * yNow;
    arr[bestK * 3 + 2] = -(basis.Py * xNow + basis.Qy * yNow);
    LAST_ORBIT_OBJ_VERT_IDX[0] = bestK;
    return { positions: arr, closed: false };
  }

  const a = Math.max(1e-6, Math.abs(obj.a_au));
  if (obj._nRadDayCache === undefined) getMeanMotionRadPerDay(obj);
  const n = obj._nRadDayCache;
  let M;
  if (hasExplicitM0) {
    M = obj.M0_deg * DEG2RAD + n * (evalJD - epoch);
  } else if (obj.tp_jd !== null && obj.tp_jd !== undefined) {
    M = n * (evalJD - obj.tp_jd);
  } else {
    M = n * (evalJD - epoch);
  }
  _kepIn[0] = M;
  _kepIn[1] = e;
  solveEllipticalKeplerScratch();
  const Enow = _kep1[0];

  const steps = 320;
  const arr = outPositions && outPositions.length === steps * 3 ? outPositions : new Float32Array(steps * 3);
  resampleClosedEllipseViewAnchored(
    a, e,
    basis.Px, basis.Py, basis.Pz,
    basis.Qx, basis.Qy, basis.Qz,
    0.0, 0.0, 0.0,
    Enow, arr
  );
  return { positions: arr, closed: true };
}

export function sampleHeliocentricOrbitScenePoints(obj, logBlend) {
  const { positions } = sampleHeliocentricOrbitRawAU(obj);
  const n = positions.length / 3;
  const pts = new Array(n);
  for (let i = 0; i < n; i++) {
    const x = positions[i * 3];
    const y = positions[i * 3 + 1];
    const z = positions[i * 3 + 2];
    const r = hypotN(x, y, z);
    const sc = r > 1e-12 ? mapRadiusAU(r, logBlend) / r : 0.0;
    pts[i] = new THREE.Vector3(x * sc, y * sc, z * sc);
  }
  return pts;
}

// ==================== SOLAR SYSTEM N-BODY ENGINE ====================
// Sun + Mercury, Venus, Earth-Moon barycentre (EMB), Mars, Jupiter, Saturn, Uranus, Neptune and
// Pluto as point masses in the barycentric J2000 ecliptic frame. Newtonian mutual gravity plus the
// first post-Newtonian (Schwarzschild) term of the Sun on every planet, advanced with a 4th-order
// Yoshida composition. The scheme is symmetric, so one engine runs forward and backward from the
// epoch. States are stored every NBODY_CHECKPOINT_DAYS and read back by cubic Hermite interpolation.

export const NBODY_EPOCH_JD = DISCOVERY_EPOCH_JD;
// 0.25 d (about 352 steps per Mercury orbit): at 0.5 d the energy error of the composition, set by
// Mercury, oscillates at 1e-9 of the total; at 0.25 d it stays below 1e-10.
export const NBODY_STEP_DAYS = 0.25;
export const NBODY_CHECKPOINT_DAYS = 2.0;
export const NBODY_MAX_SPAN_DAYS = 250.0 * 365.25;
export const C_AU_PER_DAY = 173.144632674240;
export const MOON_EMB_MASS_FRACTION = 1.0 / 82.300568;
export const NBODY_BODY_IDS = ["SUN", "MERCURY", "VENUS", "EMB", "MARS", "JUPITER", "SATURN", "URANUS", "NEPTUNE", "PLUTO"];

const NB = 10;
const NB3 = NB * 3;
const NB_STRIDE = NB * 6;
const IDX_EMB = 3;
const NBODY_INDEX = { SUN: 0, MERCURY: 1, VENUS: 2, EMB: 3, EARTH: 3, MARS: 4, JUPITER: 5, SATURN: 6, URANUS: 7, NEPTUNE: 8, PLUTO: 9 };

// JPL DE440/DE441 gravitational parameters (km^3 s^-2; planet values are system barycentres).
const KM3S2_TO_AU3D2 = (86400.0 * 86400.0) / (AU_KM * AU_KM * AU_KM);
export const NBODY_GM_AU3_DAY2 = new Float64Array([
  132712440041.279419 * KM3S2_TO_AU3D2,
  22031.868551 * KM3S2_TO_AU3D2,
  324858.592 * KM3S2_TO_AU3D2,
  403503.235625 * KM3S2_TO_AU3D2,
  42828.375816 * KM3S2_TO_AU3D2,
  126712764.1 * KM3S2_TO_AU3D2,
  37940584.8418 * KM3S2_TO_AU3D2,
  5794556.4 * KM3S2_TO_AU3D2,
  6836527.10058 * KM3S2_TO_AU3D2,
  975.5 * KM3S2_TO_AU3D2
]);

// Barycentric state vectors at MJD 60900.0 TDB (JD 2460900.5), ecliptic of J2000.0, AU and AU/day.
// Source: JPL Horizons, planetary ephemeris DE441. MOON_GEO is the Moon relative to the Earth.
// The catalogue carries the same table in meta.nbody_epoch_states.
export const NBODY_DEFAULT_EPOCH_STATES = {
  SUN: { r: [-0.004100491143254442, -0.005455613625839122, 0.0001511142155887652], v: [7.382711815475322e-06, -1.341624887140344e-06, -1.383494633380314e-07] },
  MERCURY: { r: [0.3536470142125167, -0.0327432392284334, -0.03489151870346571], v: [-0.003291300945264216, 0.02930915121928493, 0.00269773651620066] },
  VENUS: { r: [0.4603599781781486, 0.5477365569452901, -0.0190484566722815], v: [-0.01554600114815238, 0.01291722280211089, 0.001074774828734086] },
  EMB: { r: [0.7739172485374551, -0.6544627229688449, 0.0001855034312878807], v: [0.01074898139825623, 0.01314540970772339, -9.769572646250516e-07] },
  MARS: { r: [-1.402022789330124, -0.7844066147449401, 0.01810761099451529], v: [0.007343037215225864, -0.01102855066214437, -0.0004111133093478321] },
  JUPITER: { r: [-0.6502888230195482, 5.114496470243971, -0.006659495224519167], v: [-0.007573986652279561, -0.0005929474678437262, 0.0001719431427990764] },
  SATURN: { r: [9.536205780686759, -0.5324189202920308, -0.3704300984688264], v: [2.226094905647103e-06, 0.005558292551943721, -9.674878484157688e-05] },
  URANUS: { r: [10.35536996604341, 16.53255093706936, -0.07275465996902498], v: [-0.003362194411994761, 0.001904476168874739, 5.062844423887587e-05] },
  NEPTUNE: { r: [29.87627716066936, 0.0681885941527061, -0.6899334958780279], v: [-2.78534176530314e-05, 0.003157741062259068, -6.43862612870342e-05] },
  PLUTO: { r: [18.83986660739385, -29.79822139863732, -2.26101962390781], v: [0.002739351958093101, 0.000981034324290918, -0.0008973582756088387] },
  MOON_GEO: { r: [0.0024528474562841573, 0.00032462436707680897, 7.512915600191262e-05], v: [-8.974915863271989e-05, 0.0006040205260495115, 5.237391598759604e-05] }
};

// Mean sidereal motions (rad/day; J2000 mean-longitude rates of the standard planetary elements).
// Used only beyond the integrated span: the frontier orbit keeps its osculating shape, and its
// mean anomaly advances at this long-term rate, so the continuation does not jitter while the
// frontier moves (osculating mean motions fluctuate by 1e-5 to 1e-4 with planetary perturbations).
const NBODY_MEAN_MOTION_RAD_DAY = new Float64Array([
  0.0, 149472.67411175, 58517.81538729, 35999.37244981, 19140.30268499,
  3034.74612775, 1222.49362201, 428.48202785, 218.45945325, 145.20780515
].map((degPerCentury) => (degPerCentury * DEG2RAD) / 36525.0));

const Y_CBRT2 = Math.cbrt(2.0);
const Y_W1 = 1.0 / (2.0 - Y_CBRT2);
const Y_W0 = -Y_CBRT2 / (2.0 - Y_CBRT2);
const Y_C1 = 0.5 * Y_W1;
const Y_C2 = 0.5 * (Y_W0 + Y_W1);

export class SolarSystemNBodyEngine {
  constructor(epochStates = NBODY_DEFAULT_EPOCH_STATES, options = null) {
    this.epochJD = NBODY_EPOCH_JD;
    this.dt = NBODY_STEP_DAYS;
    this.stepsPerCheckpoint = Math.round(NBODY_CHECKPOINT_DAYS / NBODY_STEP_DAYS);
    this.h = NBODY_CHECKPOINT_DAYS;
    this.maxIndex = Math.floor(((options && options.maxSpanDays) || NBODY_MAX_SPAN_DAYS) / this.h);
    this.grEnabled = !(options && options.relativity === false);
    this.gm = NBODY_GM_AU3_DAY2;
    this.invC2 = 1.0 / (C_AU_PER_DAY * C_AU_PER_DAY);

    this._acc = new Float64Array(NB3);
    this._gr = new Float64Array(NB3);
    this._vn = new Float64Array(NB3);
    this._xF = new Float64Array(NB3);
    this._vF = new Float64Array(NB3);
    this._xB = new Float64Array(NB3);
    this._vB = new Float64Array(NB3);
    this._kr = new Float64Array(3);
    this._kv = new Float64Array(3);
    this._jd = new Float64Array(2); // [0] date being evaluated, [1] date coverage is wanted for
    // Sub-step lengths of the composition for +dt (slots 0..3) and -dt (slots 4..7): C1, W1, C2, W0.
    // The stepping routines take the slot index, so no floating-point value is passed per call.
    this._sub = new Float64Array([
      Y_C1 * this.dt, Y_W1 * this.dt, Y_C2 * this.dt, Y_W0 * this.dt,
      -Y_C1 * this.dt, -Y_W1 * this.dt, -Y_C2 * this.dt, -Y_W0 * this.dt
    ]);

    const initCap = Math.min(this.maxIndex + 2, 6000);
    this.fw = new Float64Array(initCap * NB_STRIDE);
    this.bw = new Float64Array(initCap * NB_STRIDE);
    this.capFw = initCap;
    this.capBw = initCap;
    this.nFw = 1;
    this.nBw = 1;
    this.totalSteps = 0;
    this.reset(epochStates);
  }

  reset(epochStates) {
    const src = epochStates || NBODY_DEFAULT_EPOCH_STATES;
    for (let b = 0; b < NB; b++) {
      const st = src[NBODY_BODY_IDS[b]] || NBODY_DEFAULT_EPOCH_STATES[NBODY_BODY_IDS[b]];
      for (let k = 0; k < 3; k++) {
        this._xF[b * 3 + k] = st.r[k];
        this._vF[b * 3 + k] = st.v[k];
      }
    }
    this._xB.set(this._xF);
    this._vB.set(this._vF);
    this.fw.set(this._xF, 0);
    this.fw.set(this._vF, NB3);
    this.bw.set(this._xF, 0);
    this.bw.set(this._vF, NB3);
    this.nFw = 1;
    this.nBw = 1;
    this.totalSteps = 0;
  }

  _accelNewton(x) {
    const a = this._acc;
    const g = this.gm;
    a.fill(0.0);
    for (let i = 0; i < NB; i++) {
      const io = i * 3;
      const xi = x[io], yi = x[io + 1], zi = x[io + 2];
      const gi = g[i];
      for (let j = i + 1; j < NB; j++) {
        const jo = j * 3;
        const dx = x[jo] - xi, dy = x[jo + 1] - yi, dz = x[jo + 2] - zi;
        const r2 = dx * dx + dy * dy + dz * dz;
        const inv = 1.0 / (r2 * Math.sqrt(r2));
        const si = g[j] * inv;
        const sj = gi * inv;
        a[io] += si * dx;
        a[io + 1] += si * dy;
        a[io + 2] += si * dz;
        a[jo] -= sj * dx;
        a[jo + 1] -= sj * dy;
        a[jo + 2] -= sj * dz;
      }
    }
  }

  // Velocity update over hk days. The 1PN term depends on velocity, so it is evaluated at the
  // midpoint velocity, predicted from the Newtonian kick. The neglected part of the midpoint is
  // hk times the 1PN acceleration itself (1e-8 of v), so the step stays symmetric to rounding.
  _kick(x, v, slot) {
    const hk = this._sub[slot];
    this._accelNewton(x);
    const a = this._acc, vn = this._vn, gr = this._gr, g = this.gm;
    for (let i = 0; i < NB3; i++) vn[i] = v[i] + hk * a[i];
    if (this.grEnabled) {
      const gmS = g[0];
      const kc = gmS * this.invC2;
      {
        const svx = 0.5 * (v[0] + vn[0]), svy = 0.5 * (v[1] + vn[1]), svz = 0.5 * (v[2] + vn[2]);
        let sx = 0.0, sy = 0.0, sz = 0.0;
        for (let b = 1; b < NB; b++) {
          const o = b * 3;
          const rx = x[o] - x[0], ry = x[o + 1] - x[1], rz = x[o + 2] - x[2];
          const ux = 0.5 * (v[o] + vn[o]) - svx;
          const uy = 0.5 * (v[o + 1] + vn[o + 1]) - svy;
          const uz = 0.5 * (v[o + 2] + vn[o + 2]) - svz;
          const r2 = rx * rx + ry * ry + rz * rz;
          const r = Math.sqrt(r2);
          const k = kc / (r2 * r);
          const A = 4.0 * gmS / r - (ux * ux + uy * uy + uz * uz);
          const B = 4.0 * (rx * ux + ry * uy + rz * uz);
          const gx = k * (A * rx + B * ux);
          const gy = k * (A * ry + B * uy);
          const gz = k * (A * rz + B * uz);
          gr[o] = gx;
          gr[o + 1] = gy;
          gr[o + 2] = gz;
          const mr = g[b] / gmS;
          sx -= mr * gx;
          sy -= mr * gy;
          sz -= mr * gz;
        }
        gr[0] = sx;
        gr[1] = sy;
        gr[2] = sz;
        for (let i = 0; i < NB3; i++) vn[i] = v[i] + hk * (a[i] + gr[i]);
      }
    }
    for (let i = 0; i < NB3; i++) v[i] = vn[i];
  }

  _drift(x, v, slot) {
    const hd = this._sub[slot];
    for (let i = 0; i < NB3; i++) x[i] += hd * v[i];
  }

  // One 4th-order Yoshida step: drift C1, kick W1, drift C2, kick W0, drift C2, kick W1, drift C1.
  // o = 0 steps forward by this.dt, o = 4 steps backward.
  _stepSlots(x, v, o) {
    this._drift(x, v, o);
    this._kick(x, v, o + 1);
    this._drift(x, v, o + 2);
    this._kick(x, v, o + 3);
    this._drift(x, v, o + 2);
    this._kick(x, v, o + 1);
    this._drift(x, v, o);
    this.totalSteps++;
  }

  // One step of +this.dt or -this.dt (the sign of dt selects the direction).
  _step(x, v, dt) {
    this._stepSlots(x, v, dt >= 0.0 ? 0 : 4);
  }

  _grow(forward, needed) {
    const cap = forward ? this.capFw : this.capBw;
    if (needed <= cap) return;
    const newCap = Math.min(this.maxIndex + 2, Math.max(needed, cap * 2));
    const next = new Float64Array(newCap * NB_STRIDE);
    next.set(forward ? this.fw : this.bw);
    if (forward) {
      this.fw = next;
      this.capFw = newCap;
    } else {
      this.bw = next;
      this.capBw = newCap;
    }
  }

  // Extend the stored span toward jd by at most maxCheckpoints checkpoints (bounded work per
  // call). Returns true when jd is bracketed by stored checkpoints.
  ensureCoverage(jd, maxCheckpoints = 1e9) {
    this._jd[1] = jd;
    return this._ensure(maxCheckpoints);
  }

  // Same, for the date in this._jd[1] (no number is passed, so nothing is boxed per frame).
  _ensure(maxCheckpoints) {
    const tau = this._jd[1] - this.epochJD;
    const forward = tau >= 0.0;
    const want = Math.min(this.maxIndex + 1, Math.floor(Math.abs(tau) / this.h) + 2);
    let n = forward ? this.nFw : this.nBw;
    if (n >= want) return Math.abs(tau) <= (n - 1) * this.h;
    this._grow(forward, want);
    const x = forward ? this._xF : this._xB;
    const v = forward ? this._vF : this._vB;
    const buf = forward ? this.fw : this.bw;
    const slot0 = forward ? 0 : 4;
    let budget = maxCheckpoints;
    while (n < want && budget > 0) {
      for (let s = 0; s < this.stepsPerCheckpoint; s++) this._stepSlots(x, v, slot0);
      const off = n * NB_STRIDE;
      buf.set(x, off);
      buf.set(v, off + NB3);
      n++;
      budget--;
    }
    if (forward) this.nFw = n;
    else this.nBw = n;
    return Math.abs(tau) <= (n - 1) * this.h;
  }

  coveredSpanDays(forward = true) {
    return ((forward ? this.nFw : this.nBw) - 1) * this.h;
  }

  isCovered(jd) {
    const tau = jd - this.epochJD;
    return Math.abs(tau) <= ((tau >= 0.0 ? this.nFw : this.nBw) - 1) * this.h;
  }

  // Barycentric state of body b at jd by cubic Hermite interpolation; false when jd is outside
  // the stored span. No allocation.
  evalBarycentric(b, jd, outR, outV = null) {
    this._jd[0] = jd;
    return this._evalBary(b, outR, outV);
  }

  _evalBary(b, outR, outV) {
    const tau = this._jd[0] - this.epochJD;
    const forward = tau >= 0.0;
    const n = forward ? this.nFw : this.nBw;
    const s = Math.abs(tau) / this.h;
    let k = Math.floor(s) | 0;
    if (k >= n - 1) {
      if (s > n - 1) return false;
      k = n - 2;
      if (k < 0) {
        const buf0 = forward ? this.fw : this.bw;
        for (let c = 0; c < 3; c++) {
          outR[c] = buf0[b * 3 + c];
          if (outV) outV[c] = buf0[NB3 + b * 3 + c];
        }
        return true;
      }
    }
    const u = s - k;
    const hs = forward ? this.h : -this.h;
    const buf = forward ? this.fw : this.bw;
    const o0 = k * NB_STRIDE + b * 3;
    const o1 = o0 + NB_STRIDE;
    const u2 = u * u, u3 = u2 * u;
    const h00 = 2.0 * u3 - 3.0 * u2 + 1.0;
    const h10 = (u3 - 2.0 * u2 + u) * hs;
    const h01 = -2.0 * u3 + 3.0 * u2;
    const h11 = (u3 - u2) * hs;
    for (let c = 0; c < 3; c++) {
      outR[c] = h00 * buf[o0 + c] + h10 * buf[o0 + NB3 + c] + h01 * buf[o1 + c] + h11 * buf[o1 + NB3 + c];
    }
    if (outV) {
      const d00 = (6.0 * u2 - 6.0 * u) / hs;
      const d10 = 3.0 * u2 - 4.0 * u + 1.0;
      const d11 = 3.0 * u2 - 2.0 * u;
      for (let c = 0; c < 3; c++) {
        outV[c] = d00 * (buf[o0 + c] - buf[o1 + c]) + d10 * buf[o0 + NB3 + c] + d11 * buf[o1 + NB3 + c];
      }
    }
    return true;
  }

  // Heliocentric state of body b at jd. Inside the stored span this is the integrated solution;
  // outside it (beyond the maximum span, or while a large jump is still being integrated) the
  // osculating two-body orbit of the nearest stored checkpoint is used, which joins continuously.
  evalHeliocentric(b, jd, outR, outV = null) {
    this._jd[0] = jd;
    return this._evalHelio(b, outR, outV);
  }

  _evalHelio(b, outR, outV) {
    if (b === 0) {
      outR[0] = 0.0; outR[1] = 0.0; outR[2] = 0.0;
      if (outV) { outV[0] = 0.0; outV[1] = 0.0; outV[2] = 0.0; }
      return true;
    }
    const sr = this._kr, sv = this._kv;
    if (this._evalBary(0, sr, outV ? sv : null)) {
      this._evalBary(b, outR, outV);
      outR[0] -= sr[0]; outR[1] -= sr[1]; outR[2] -= sr[2];
      if (outV) { outV[0] -= sv[0]; outV[1] -= sv[1]; outV[2] -= sv[2]; }
      return true;
    }
    const tau = this._jd[0] - this.epochJD;
    const forward = tau >= 0.0;
    const n = forward ? this.nFw : this.nBw;
    const buf = forward ? this.fw : this.bw;
    const off = (n - 1) * NB_STRIDE;
    const o = off + b * 3;
    const rx = buf[o] - buf[off], ry = buf[o + 1] - buf[off + 1], rz = buf[o + 2] - buf[off + 2];
    const vx = buf[o + NB3] - buf[off + NB3], vy = buf[o + NB3 + 1] - buf[off + NB3 + 1], vz = buf[o + NB3 + 2] - buf[off + NB3 + 2];
    const dtK = tau - (forward ? 1.0 : -1.0) * (n - 1) * this.h;
    propagateTwoBodyInto(rx, ry, rz, vx, vy, vz, this.gm[0] + this.gm[b], dtK, outR, outV, NBODY_MEAN_MOTION_RAD_DAY[b]);
    return false;
  }

  // Conserved energy of the model (Newtonian N-body plus the solar 1PN terms), in AU^5 day^-4
  // (masses expressed as GM). Used by the verification script.
  energyAt(jd) {
    const x = this._acc, v = this._gr;
    for (let b = 0; b < NB; b++) {
      this._jd[0] = jd;
      if (!this._evalBary(b, this._kr, this._kv)) return NaN;
      for (let c = 0; c < 3; c++) {
        x[b * 3 + c] = this._kr[c];
        v[b * 3 + c] = this._kv[c];
      }
    }
    const g = this.gm;
    let e = 0.0;
    for (let i = 0; i < NB; i++) {
      const io = i * 3;
      e += 0.5 * g[i] * (v[io] * v[io] + v[io + 1] * v[io + 1] + v[io + 2] * v[io + 2]);
      for (let j = i + 1; j < NB; j++) {
        const jo = j * 3;
        e -= (g[i] * g[j]) / hypotN(x[jo] - x[io], x[jo + 1] - x[io + 1], x[jo + 2] - x[io + 2]);
      }
    }
    if (this.grEnabled) {
      const gmS = g[0];
      for (let b = 1; b < NB; b++) {
        const o = b * 3;
        const r = hypotN(x[o] - x[0], x[o + 1] - x[1], x[o + 2] - x[2]);
        const ux = v[o] - v[0], uy = v[o + 1] - v[1], uz = v[o + 2] - v[2];
        const u2 = ux * ux + uy * uy + uz * uz;
        e += g[b] * this.invC2 * (0.375 * u2 * u2 + (1.5 * gmS * u2) / r + (0.5 * gmS * gmS) / (r * r));
      }
    }
    return e;
  }
}

// Two-body propagation of a bound state (r, v) by dtDays (f and g functions in the eccentric
// anomaly difference). Whole revolutions are removed first, so dtDays may be arbitrarily large.
// meanMotionOverride (rad/day), when positive, replaces the osculating mean motion in the phase.
export function propagateTwoBodyInto(rx, ry, rz, vx, vy, vz, gm, dtDays, outR, outV = null, meanMotionOverride = 0.0) {
  const r0 = hypotN(rx, ry, rz);
  const v2 = vx * vx + vy * vy + vz * vz;
  const invA = 2.0 / r0 - v2 / gm;
  if (!(invA > 1e-12)) {
    outR[0] = rx + vx * dtDays; outR[1] = ry + vy * dtDays; outR[2] = rz + vz * dtDays;
    if (outV) { outV[0] = vx; outV[1] = vy; outV[2] = vz; }
    return;
  }
  const a = 1.0 / invA;
  const n = Math.sqrt(gm / (a * a * a));
  let dM = ((meanMotionOverride > 0.0 ? meanMotionOverride : n) * dtDays) % TWO_PI;
  if (dM > Math.PI) dM -= TWO_PI;
  else if (dM < -Math.PI) dM += TWO_PI;
  const ec = 1.0 - r0 / a;
  const es = (rx * vx + ry * vy + rz * vz) / (n * a * a);
  let dE = dM;
  for (let it = 0; it < 12; it++) {
    const sE = Math.sin(dE), cE = Math.cos(dE);
    const f = dE - ec * sE + es * (1.0 - cE) - dM;
    const fp = 1.0 - ec * cE + es * sE;
    const step = f / Math.max(1e-9, fp);
    dE -= step;
    if (Math.abs(step) < 1e-14) break;
  }
  const sE = Math.sin(dE), cE = Math.cos(dE);
  const fF = 1.0 - (a / r0) * (1.0 - cE);
  const gF = dM / n + (sE - dE) / n;
  outR[0] = fF * rx + gF * vx;
  outR[1] = fF * ry + gF * vy;
  outR[2] = fF * rz + gF * vz;
  if (outV) {
    const r1 = a * (1.0 - ec * cE + es * sE);
    const fD = (-a * a * n * sE) / (r1 * r0);
    const gD = 1.0 - (a / r1) * (1.0 - cE);
    outV[0] = fD * rx + gD * vx;
    outV[1] = fD * ry + gD * vy;
    outV[2] = fD * rz + gD * vz;
  }
}

// ==================== PERTURBED LUNAR EPHEMERIS ====================
// Truncated lunar theory in the Delaunay arguments D, M (Sun), M' (Moon), F (after Meeus,
// Astronomical Algorithms ch. 47; ELP-2000/82 main terms): equation of centre, evection, variation,
// annual equation, reduction to the ecliptic and the larger remaining terms, with the secular node
// regression (18.6 yr) and apsidal advance (8.85 yr) carried by the mean arguments. Longitude is
// reduced from the equinox of date to J2000 by the general precession. A correction that fades
// within about three weeks ties position and velocity to the ephemeris state at the epoch.
// Rows: D, M, M', F multipliers and the coefficient (1e-6 deg for longitude and latitude, m for distance).
const MOON_LON_TERMS = new Float64Array([
  0, 0, 1, 0, 6288774, 2, 0, -1, 0, 1274027, 2, 0, 0, 0, 658314, 0, 0, 2, 0, 213618,
  0, 1, 0, 0, -185116, 0, 0, 0, 2, -114332, 2, 0, -2, 0, 58793, 2, -1, -1, 0, 57066,
  2, 0, 1, 0, 53322, 2, -1, 0, 0, 45758, 0, 1, -1, 0, -40923, 1, 0, 0, 0, -34720,
  0, 1, 1, 0, -30383, 2, 0, 0, -2, 15327, 0, 0, 1, 2, -12528, 0, 0, 1, -2, 10980,
  4, 0, -1, 0, 10675, 0, 0, 3, 0, 10034, 4, 0, -2, 0, 8548, 2, 1, -1, 0, -7888,
  2, 1, 0, 0, -6766, 1, 0, -1, 0, -5163, 1, 1, 0, 0, 4987, 2, -1, 1, 0, 4036,
  2, 0, 2, 0, 3994, 4, 0, 0, 0, 3861, 2, 0, -3, 0, 3665
]);
const MOON_DIST_TERMS = new Float64Array([
  0, 0, 1, 0, -20905355, 2, 0, -1, 0, -3699111, 2, 0, 0, 0, -2955968, 0, 0, 2, 0, -569925,
  0, 1, 0, 0, 48888, 0, 0, 0, 2, -3149, 2, 0, -2, 0, 246158, 2, -1, -1, 0, -152138,
  2, 0, 1, 0, -170733, 2, -1, 0, 0, -204586, 0, 1, -1, 0, -129620, 1, 0, 0, 0, 108743,
  0, 1, 1, 0, 104755, 2, 0, 0, -2, 10321, 0, 0, 1, -2, 79661, 4, 0, -1, 0, -34782,
  0, 0, 3, 0, -23210, 4, 0, -2, 0, -21636, 2, 1, -1, 0, 24208, 2, 1, 0, 0, 30824,
  1, 0, -1, 0, -8379, 1, 1, 0, 0, -16675, 2, -1, 1, 0, -12831, 2, 0, 2, 0, -10445,
  4, 0, 0, 0, -11650, 2, 0, -3, 0, 14403
]);
const MOON_LAT_TERMS = new Float64Array([
  0, 0, 0, 1, 5128122, 0, 0, 1, 1, 280602, 0, 0, 1, -1, 277693, 2, 0, 0, -1, 173237,
  2, 0, -1, 1, 55413, 2, 0, -1, -1, 46271, 2, 0, 0, 1, 32573, 0, 0, 2, 1, 17198,
  2, 0, 1, -1, 9266, 0, 0, 2, -1, 8822, 2, -1, 0, -1, 8216, 2, 0, -2, -1, 4324,
  2, 0, 1, 1, 4200, 2, 1, 0, -1, -3359, 2, -1, -1, 1, 2463, 2, -1, 0, 1, 2211,
  2, -1, -1, -1, 2065, 0, 1, -1, -1, -1870, 4, 0, -1, -1, 1828, 0, 1, 0, 1, -1794
]);
const MOON_ANCHOR_FADE_DAYS = 6.0;
const _moonAnchor = new Float64Array(7); // dr(3), dv(3), active flag
const _moonTmpA = new Float64Array(3);
const _moonTmpB = new Float64Array(3);

const _moonSum = new Float64Array(1);
const _moonArgs = new Float64Array(5); // D, M, M', F, E

function moonSeriesSum(terms, useCos) {
  const D = _moonArgs[0], M = _moonArgs[1], Mp = _moonArgs[2], F = _moonArgs[3], E = _moonArgs[4];
  let sum = 0.0;
  for (let i = 0; i < terms.length; i += 5) {
    const m = terms[i + 1];
    const arg = terms[i] * D + m * M + terms[i + 2] * Mp + terms[i + 3] * F;
    let c = terms[i + 4];
    if (m !== 0) c *= (m === 1 || m === -1) ? E : E * E;
    sum += c * (useCos ? Math.cos(arg) : Math.sin(arg));
  }
  _moonSum[0] = sum;
}

// Geocentric Moon from the analytic theory alone (J2000 ecliptic, AU). Returns the distance.
export function computeMoonTheoryEclipticAU(jd, outArr3) {
  moonTheoryInto(jd, outArr3);
  return hypotN(outArr3[0], outArr3[1], outArr3[2]);
}

function moonTheoryInto(jd, outArr3) {
  _moonJD[0] = jd;
  moonTheoryCore(outArr3);
}

const _moonJD = new Float64Array(1);

function moonTheoryCore(outArr3) {
  const T = (_moonJD[0] - J2000_JD) / 36525.0;
  const Lp = (218.3164477 + 481267.88123421 * T - 0.0015786 * T * T) * DEG2RAD;
  const D = (297.8501921 + 445267.1114034 * T - 0.0018819 * T * T) * DEG2RAD;
  const M = (357.5291092 + 35999.0502909 * T - 0.0001536 * T * T) * DEG2RAD;
  const Mp = (134.9633964 + 477198.8675055 * T + 0.0087414 * T * T) * DEG2RAD;
  const F = (93.272095 + 483202.0175233 * T - 0.0036539 * T * T) * DEG2RAD;
  const E = 1.0 - 0.002516 * T - 0.0000074 * T * T;
  _moonArgs[0] = D;
  _moonArgs[1] = M;
  _moonArgs[2] = Mp;
  _moonArgs[3] = F;
  _moonArgs[4] = E;
  moonSeriesSum(MOON_LON_TERMS, false);
  const lonDate = Lp + _moonSum[0] * 1e-6 * DEG2RAD;
  moonSeriesSum(MOON_LAT_TERMS, false);
  const lat = _moonSum[0] * 1e-6 * DEG2RAD;
  moonSeriesSum(MOON_DIST_TERMS, true);
  const rAU = (385000.56 + _moonSum[0] * 1e-3) / AU_KM;
  // Equinox of date -> J2000: general precession in longitude (IAU 1976).
  const lon = lonDate - (1.396971278 * T + 0.0003086 * T * T) * DEG2RAD;
  const cb = Math.cos(lat);
  outArr3[0] = rAU * cb * Math.cos(lon);
  outArr3[1] = rAU * cb * Math.sin(lon);
  outArr3[2] = rAU * Math.sin(lat);
}

function setMoonAnchor(moonGeo) {
  _moonAnchor.fill(0.0);
  if (!moonGeo || !Array.isArray(moonGeo.r) || !Array.isArray(moonGeo.v)) return;
  const hh = 1.0 / 1024.0;
  computeMoonTheoryEclipticAU(NBODY_EPOCH_JD, _moonTmpA);
  for (let c = 0; c < 3; c++) _moonAnchor[c] = moonGeo.r[c] - _moonTmpA[c];
  computeMoonTheoryEclipticAU(NBODY_EPOCH_JD + hh, _moonTmpA);
  computeMoonTheoryEclipticAU(NBODY_EPOCH_JD - hh, _moonTmpB);
  for (let c = 0; c < 3; c++) _moonAnchor[3 + c] = moonGeo.v[c] - (_moonTmpA[c] - _moonTmpB[c]) / (2.0 * hh);
  _moonAnchor[6] = 1.0;
}

// Geocentric Moon (J2000 ecliptic, AU): analytic theory plus the epoch tie. Equals the ephemeris
// position and velocity at the epoch. Returns the distance. No allocation.
export function computeMoonGeocentricEclipticAU(jd, outArr3) {
  computeMoonGeocentricInto(jd, outArr3);
  return hypotN(outArr3[0], outArr3[1], outArr3[2]);
}

// Same position, returning nothing.
export function computeMoonGeocentricInto(jd, outArr3) {
  _moonJD[0] = jd;
  moonGeocentricCore(outArr3);
}

// Per-frame entry point: the Moon at the date in FRAME_CLOCK[0]. Allocates nothing.
export function computeMoonGeocentricAtFrameJD(outArr3) {
  _moonJD[0] = FRAME_CLOCK[0];
  moonGeocentricCore(outArr3);
}

function moonGeocentricCore(outArr3) {
  moonTheoryCore(outArr3);
  if (_moonAnchor[6] > 0.5) {
    const tau = _moonJD[0] - NBODY_EPOCH_JD;
    const q = tau / MOON_ANCHOR_FADE_DAYS;
    if (q > -6.0 && q < 6.0) {
      const w = Math.exp(-q * q);
      outArr3[0] += (_moonAnchor[0] + _moonAnchor[3] * tau) * w;
      outArr3[1] += (_moonAnchor[1] + _moonAnchor[4] * tau) * w;
      outArr3[2] += (_moonAnchor[2] + _moonAnchor[5] * tau) * w;
    }
  }
}

export function computeMoonGeocentricVelAUPerDay(jd, outArr3) {
  const hh = 1.0 / 256.0;
  computeMoonGeocentricEclipticAU(jd + hh, _moonTmpA);
  computeMoonGeocentricEclipticAU(jd - hh, _moonTmpB);
  for (let c = 0; c < 3; c++) outArr3[c] = (_moonTmpA[c] - _moonTmpB[c]) / (2.0 * hh);
  return outArr3;
}

// ==================== SHARED ENGINE INSTANCE & HELIOCENTRIC ACCESSORS ====================
let _sharedNBody = null;
const _nbR = new Float64Array(3);
const _nbV = new Float64Array(3);
const _nbMoon = new Float64Array(3);
const _oscEl = new Float64Array(10); // a, e, Px, Py, Pz, Qx, Qy, Qz, M, Ecc

export function getSolarSystemNBody() {
  if (!_sharedNBody) {
    _sharedNBody = new SolarSystemNBodyEngine(NBODY_DEFAULT_EPOCH_STATES);
    setMoonAnchor(NBODY_DEFAULT_EPOCH_STATES.MOON_GEO);
  }
  return _sharedNBody;
}

// Start the shared engine from the catalogue table (meta.nbody_epoch_states). A missing or
// malformed table leaves the built-in defaults in place. Returns true when the table was used.
export function initNBodyFromCatalogMeta(states) {
  const eng = getSolarSystemNBody();
  if (!states || typeof states !== "object") return false;
  const src = states.bodies && typeof states.bodies === "object" ? states.bodies : states;
  if (states.epoch_jd_tdb !== undefined && Math.abs(Number(states.epoch_jd_tdb) - NBODY_EPOCH_JD) > 1e-6) return false;
  for (const id of NBODY_BODY_IDS) {
    const st = src[id];
    if (!st || !Array.isArray(st.r) || !Array.isArray(st.v) || st.r.length < 3 || st.v.length < 3) return false;
    for (let k = 0; k < 3; k++) {
      if (!Number.isFinite(st.r[k]) || !Number.isFinite(st.v[k])) return false;
    }
  }
  eng.reset(src);
  setMoonAnchor(src.MOON_GEO || NBODY_DEFAULT_EPOCH_STATES.MOON_GEO);
  return true;
}

export function isNBodyBodyId(id) {
  return NBODY_INDEX[id] !== undefined;
}

export function getNBodyIndex(id) {
  const idx = NBODY_INDEX[id];
  return idx === undefined ? -1 : idx;
}

// Checkpoints integrated per animation frame at most (120 checkpoints = 240 days of orbit, about
// 3 ms). Faster playback than that outruns the integration for a moment; the accessors below then
// continue the frontier state on its two-body orbit until the integration catches up.
export const NBODY_FRAME_BUDGET_CHECKPOINTS = 120;

// Bounded per-frame integration toward the playhead, then toward jd + leadDays with what is left
// of the budget. Returns true when jd itself is inside the integrated span.
export function prepareSolarSystemNBody(jd, leadDays = 30.0, maxCheckpoints = NBODY_FRAME_BUDGET_CHECKPOINTS) {
  const s0 = FRAME_CLOCK[0], s1 = FRAME_CLOCK[1];
  FRAME_CLOCK[0] = jd;
  FRAME_CLOCK[1] = leadDays;
  const covered = prepareSolarSystemNBodyAtFrameJD(maxCheckpoints);
  FRAME_CLOCK[0] = s0;
  FRAME_CLOCK[1] = s1;
  return covered;
}

// Per-frame entry point: date in FRAME_CLOCK[0], lead in FRAME_CLOCK[1]. Allocates nothing unless
// a checkpoint buffer has to grow (a handful of times in a session).
export function prepareSolarSystemNBodyAtFrameJD(maxCheckpoints = NBODY_FRAME_BUDGET_CHECKPOINTS) {
  const eng = getSolarSystemNBody();
  const before = eng.nFw + eng.nBw;
  eng._jd[1] = FRAME_CLOCK[0];
  const covered = eng._ensure(maxCheckpoints);
  if (covered && FRAME_CLOCK[1] !== 0.0) {
    const left = maxCheckpoints - (eng.nFw + eng.nBw - before);
    if (left > 0) {
      eng._jd[1] = FRAME_CLOCK[0] + FRAME_CLOCK[1];
      eng._ensure(left);
    }
  }
  return covered;
}

// Heliocentric J2000 ecliptic position (AU). EARTH is the Earth itself: the integrated Earth-Moon
// barycentre minus the Moon's share of the geocentric lunar vector. Returns the distance, or -1
// for an id the engine does not carry.
export function evaluateNBodyHeliocentricEclipticAU(id, jd, outArr3) {
  const idx = NBODY_INDEX[id];
  if (idx === undefined) return -1.0;
  getSolarSystemNBody();
  evaluateNBodyHeliocentricInto(idx, id === "EARTH", jd, outArr3);
  return hypotN(outArr3[0], outArr3[1], outArr3[2]);
}

// Engine index (getNBodyIndex), whether the body is the Earth itself (the barycentre minus the
// Moon's share) and the date; writes outArr3 and returns nothing.
export function evaluateNBodyHeliocentricInto(idx, isEarth, jd, outArr3) {
  const saved = FRAME_CLOCK[0];
  FRAME_CLOCK[0] = jd;
  evaluateNBodyHeliocentricAtFrameJD(idx, isEarth, outArr3);
  FRAME_CLOCK[0] = saved;
}

// Per-frame entry point: the same at the date in FRAME_CLOCK[0]. Inside the integrated span the
// Hermite interpolation of body and Sun is done here in one block, so nothing is allocated.
export function evaluateNBodyHeliocentricAtFrameJD(idx, isEarth, outArr3) {
  const eng = _sharedNBody;
  const jd = FRAME_CLOCK[0];
  const tau = jd - eng.epochJD;
  const forward = tau >= 0.0;
  const n = forward ? eng.nFw : eng.nBw;
  const sIdx = Math.abs(tau) / eng.h;
  let k = Math.min(Math.floor(sIdx), 1e9) | 0;
  if (n >= 2 && sIdx <= n - 1) {
    if (k > n - 2) k = n - 2;
    const u = sIdx - k;
    const hs = forward ? eng.h : -eng.h;
    const buf = forward ? eng.fw : eng.bw;
    const s0 = k * NB_STRIDE;
    const s1 = s0 + NB_STRIDE;
    const b0 = s0 + idx * 3;
    const b1 = b0 + NB_STRIDE;
    const u2 = u * u, u3 = u2 * u;
    const h00 = 2.0 * u3 - 3.0 * u2 + 1.0;
    const h10 = (u3 - 2.0 * u2 + u) * hs;
    const h01 = -2.0 * u3 + 3.0 * u2;
    const h11 = (u3 - u2) * hs;
    for (let c = 0; c < 3; c++) {
      outArr3[c] =
        h00 * (buf[b0 + c] - buf[s0 + c]) + h10 * (buf[b0 + NB3 + c] - buf[s0 + NB3 + c]) +
        h01 * (buf[b1 + c] - buf[s1 + c]) + h11 * (buf[b1 + NB3 + c] - buf[s1 + NB3 + c]);
    }
  } else {
    eng._jd[0] = jd;
    eng._evalHelio(idx, outArr3, null);
  }
  if (isEarth) {
    _moonJD[0] = jd;
    moonGeocentricCore(_nbMoon);
    outArr3[0] -= MOON_EMB_MASS_FRACTION * _nbMoon[0];
    outArr3[1] -= MOON_EMB_MASS_FRACTION * _nbMoon[1];
    outArr3[2] -= MOON_EMB_MASS_FRACTION * _nbMoon[2];
  }
}

export function evaluateNBodyHeliocentricVelAUPerDay(id, jd, outArr3) {
  const idx = NBODY_INDEX[id];
  if (idx === undefined) return null;
  getSolarSystemNBody().evalHeliocentric(idx, jd, _nbR, outArr3);
  if (id === "EARTH") {
    computeMoonGeocentricVelAUPerDay(jd, _nbMoon);
    outArr3[0] -= MOON_EMB_MASS_FRACTION * _nbMoon[0];
    outArr3[1] -= MOON_EMB_MASS_FRACTION * _nbMoon[1];
    outArr3[2] -= MOON_EMB_MASS_FRACTION * _nbMoon[2];
  }
  return outArr3;
}

// Osculating heliocentric ellipse of body idx at jd into _oscEl. EARTH uses the Earth-Moon
// barycentre, whose orbit is free of the monthly lunar wobble.
function osculatingEllipseAt(idx, jd) {
  getSolarSystemNBody()._jd[0] = jd;
  return osculatingEllipseAtSlot(idx);
}

// Same for the date already stored in the engine's evaluation slot.
function osculatingEllipseAtSlot(idx) {
  const eng = _sharedNBody;
  eng._evalHelio(idx, _nbR, _nbV);
  const gm = eng.gm[0] + eng.gm[idx];
  const rx = _nbR[0], ry = _nbR[1], rz = _nbR[2];
  const vx = _nbV[0], vy = _nbV[1], vz = _nbV[2];
  const r = hypotN(rx, ry, rz);
  const v2 = vx * vx + vy * vy + vz * vz;
  const rv = rx * vx + ry * vy + rz * vz;
  const hx = ry * vz - rz * vy, hy = rz * vx - rx * vz, hz = rx * vy - ry * vx;
  const hN = hypotN(hx, hy, hz) || 1.0;
  let ex = ((v2 - gm / r) * rx - rv * vx) / gm;
  let ey = ((v2 - gm / r) * ry - rv * vy) / gm;
  let ez = ((v2 - gm / r) * rz - rv * vz) / gm;
  let e = hypotN(ex, ey, ez);
  if (e < 1e-10) {
    ex = rx / r; ey = ry / r; ez = rz / r;
    e = 0.0;
  } else {
    ex /= e; ey /= e; ez /= e;
  }
  const a = 1.0 / (2.0 / r - v2 / gm);
  const qx = (hy * ez - hz * ey) / hN, qy = (hz * ex - hx * ez) / hN, qz = (hx * ey - hy * ex) / hN;
  const bF = Math.sqrt(Math.max(1e-12, 1.0 - e * e));
  const cosE = (rx * ex + ry * ey + rz * ez) / a + e;
  const sinE = (rx * qx + ry * qy + rz * qz) / (a * bF);
  const Ecc = Math.atan2(sinE, cosE);
  _oscEl[0] = a;
  _oscEl[1] = e;
  _oscEl[2] = ex; _oscEl[3] = ey; _oscEl[4] = ez;
  _oscEl[5] = qx; _oscEl[6] = qy; _oscEl[7] = qz;
  _oscEl[8] = Ecc - e * Math.sin(Ecc);
  _oscEl[9] = Ecc;
  return _oscEl;
}

// Mean longitude (rad, 0..2pi) of a planet from its osculating orbit at jd; -1 for unknown ids.
export function getPlanetMeanLongitudeRad(id, jd) {
  const idx = NBODY_INDEX[id];
  if (idx === undefined || idx === 0) return -1.0;
  const el = osculatingEllipseAt(idx, jd);
  let lam = (Math.atan2(el[3], el[2]) + el[8]) % TWO_PI;
  if (lam < 0.0) lam += TWO_PI;
  return lam;
}

// Osculating elements at jd as [a_au, e, period_days] in a caller-supplied array (no allocation).
export function getNBodyOsculatingShapeInto(id, jd, out3) {
  const idx = NBODY_INDEX[id];
  if (idx === undefined || idx === 0) return null;
  const el = osculatingEllipseAt(idx, jd);
  const eng = getSolarSystemNBody();
  out3[0] = el[0];
  out3[1] = el[1];
  out3[2] = TWO_PI / Math.sqrt((eng.gm[0] + eng.gm[idx]) / (el[0] * el[0] * el[0]));
  return out3;
}

// Vertices of the osculating ellipse at jd in scene-oriented AU [xE, zE, -yE, ...], sampled like
// sampleHeliocentricOrbitRawAU. Pass an existing Float32Array to refresh it in place, and jd = null
// to use the date in FRAME_CLOCK[0] (the per-frame refresh does both and allocates nothing).
export function sampleNBodyOsculatingOrbitRawAU(id, jd, outPositions = null) {
  const idx = NBODY_INDEX[id];
  if (idx === undefined || idx === 0) return null;
  const evalJD = jd === null ? FRAME_CLOCK[0] : jd;
  getSolarSystemNBody()._jd[0] = evalJD;
  const el = osculatingEllipseAtSlot(idx);
  const a = el[0], e = el[1], Enow = el[9];
  const arr = outPositions || new Float32Array(320 * 3);
  let dxEarth = 0.0, dyEarth = 0.0, dzEarth = 0.0;
  if (id === "EARTH") {
    _moonJD[0] = evalJD;
    moonGeocentricCore(_nbMoon);
    dxEarth = -MOON_EMB_MASS_FRACTION * _nbMoon[0];
    dyEarth = -MOON_EMB_MASS_FRACTION * _nbMoon[1];
    dzEarth = -MOON_EMB_MASS_FRACTION * _nbMoon[2];
  }
  return resampleClosedEllipseViewAnchored(
    a, e,
    el[2], el[3], el[4],
    el[5], el[6], el[7],
    dxEarth, dyEarth, dzEarth,
    Enow, arr
  );
}

export function jdToUTCString(jd) {
  let z = Math.floor(jd + 0.5);
  let f = jd + 0.5 - z;
  let totalSec = Math.round(f * 86400);
  if (totalSec >= 86400) {
    totalSec -= 86400;
    z += 1;
  }
  let alpha = z;
  if (z >= 2299161) {
    const a = Math.floor((z - 1867216.25) / 36524.25);
    alpha = z + 1 + a - Math.floor(a / 4);
  }
  const b = alpha + 1524;
  const c = Math.floor((b - 122.1) / 365.25);
  const d = Math.floor(365.25 * c);
  const e = Math.floor((b - d) / 30.6001);

  const day = b - d - Math.floor(30.6001 * e);
  const month = e < 14 ? e - 1 : e - 13;
  const year = month > 2 ? c - 4716 : c - 4715;

  const hh = String(Math.floor(totalSec / 3600) % 24).padStart(2, "0");
  const mm = String(Math.floor((totalSec % 3600) / 60)).padStart(2, "0");
  const ss = String(totalSec % 60).padStart(2, "0");
  const monStr = String(month).padStart(2, "0");
  const dayStr = String(day).padStart(2, "0");
  const yrStr = year < 0 ? `${year}` : String(year).padStart(4, "0");
  return `${yrStr}-${monStr}-${dayStr} ${hh}:${mm}:${ss} UTC`;
}
