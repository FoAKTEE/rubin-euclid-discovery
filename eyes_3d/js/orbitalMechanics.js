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

export function mapRadiusAU(rAU, logBlend) {
  if (rAU <= 1e-12) return 0.0;
  const rLog = LOG_S0 * Math.log(1.0 + rAU / LOG_R0);
  return rAU * (1.0 - logBlend) + rLog * logBlend;
}

export function helioAUToSceneInto(xEcl, yEcl, zEcl, logBlend, outVec3) {
  const rAU = Math.hypot(xEcl, yEcl, zEcl);
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

// Elliptic Kepler solver (e < 1): Halley's method safeguarded by strict [lo, hi] bracketing
export function solveEllipticalKepler(M, e) {
  let m = ((M % TWO_PI) + TWO_PI) % TWO_PI;
  if (m > Math.PI) m -= TWO_PI;
  if (Math.abs(m) < 1e-15) return 0.0;
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
  return sign * E;
}

// Hyperbolic Kepler solver (e > 1): Halley's method with monotonic bracketing
export function solveHyperbolicKepler(M, e) {
  if (Math.abs(M) < 1e-15) return 0.0;
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
  let hi = Infinity;
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
    if (!Number.isFinite(dH)) dH = 0.0;
    dH = Math.max(-5.0, Math.min(5.0, dH));
    let nextH = H - dH;
    if (nextH <= lo || nextH >= hi) {
      nextH = Number.isFinite(hi) ? 0.5 * (lo + hi) : Math.max(lo + 0.5, H * 1.5 + 0.1);
    }
    const step = Math.abs(nextH - H);
    H = nextH;
    if (step < KEPLER_TOL * Math.max(1.0, Math.abs(H))) break;
  }
  return sign * H;
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
  const Y = Math.cbrt(W + Math.hypot(W, 1.0));
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
  return { xOrb, yOrb, r: Math.hypot(xOrb, yOrb), chi };
}

export function getEffectiveGM(obj) {
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
  if (obj.category === "star" || (Math.abs(obj.a_au) < 1e-12 && !obj.q_au && !obj.parent_id)) {
    outArr3[0] = 0;
    outArr3[1] = 0;
    outArr3[2] = 0;
    return 0.0;
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
    const gm = getEffectiveGM(obj);
    let dtFromTp;
    if (obj.tp_jd !== null && obj.tp_jd !== undefined) {
      dtFromTp = jd - obj.tp_jd;
    } else {
      const nEst = getMeanMotionRadPerDay(obj);
      let m0 = (obj.M0_deg || 0.0) * DEG2RAD;
      if (e < 1.0 && m0 > Math.PI) m0 -= TWO_PI;
      dtFromTp = (jd - epoch) + m0 / Math.max(nEst, 1e-15);
    }
    const sol = solveUniversalPeriapsisOrbitalXY(dtFromTp, Math.max(1e-9, q), e, gm);
    xOrb = sol.xOrb;
    yOrb = sol.yOrb;
  } else if (e >= 1.0 + NEAR_PARABOLIC_EPS) {
    // Hyperbolic trajectory (1I/'Oumuamua, 2I/Borisov, 3I/ATLAS, Voyager/Pioneer/New Horizons)
    const aAbs = obj.q_au > 0 ? obj.q_au / (e - 1.0) : Math.abs(obj.a_au);
    const gm = getEffectiveGM(obj);
    const n = Math.sqrt(gm / (aAbs * aAbs * aAbs));
    let M;
    if (obj.tp_jd !== null && obj.tp_jd !== undefined && !hasExplicitM0) {
      M = n * (jd - obj.tp_jd);
    } else if (hasExplicitM0) {
      M = obj.M0_deg * DEG2RAD + n * (jd - epoch);
    } else {
      M = n * (jd - (obj.tp_jd ?? epoch));
    }
    const H = solveHyperbolicKepler(M, e);
    xOrb = aAbs * (e - Math.cosh(H));
    yOrb = aAbs * Math.sqrt(e * e - 1.0) * Math.sinh(H);
  } else {
    // Elliptical orbit (planets, moons, asteroids, TNOs, eTNOs, Oort comets)
    const a = Math.max(1e-10, Math.abs(obj.a_au));
    const n = getMeanMotionRadPerDay(obj);
    let M;
    if (hasExplicitM0) {
      M = obj.M0_deg * DEG2RAD + n * (jd - epoch);
    } else if (obj.tp_jd !== null && obj.tp_jd !== undefined) {
      M = n * (jd - obj.tp_jd);
    } else {
      M = n * (jd - epoch);
    }
    const E = solveEllipticalKepler(M, e);
    xOrb = a * (Math.cos(E) - e);
    yOrb = a * Math.sqrt(Math.max(0.0, 1.0 - e * e)) * Math.sin(E);
  }

  outArr3[0] = basis.Px * xOrb + basis.Qx * yOrb;
  outArr3[1] = basis.Py * xOrb + basis.Qy * yOrb;
  outArr3[2] = basis.Pz * xOrb + basis.Qz * yOrb;
  return Math.hypot(outArr3[0], outArr3[1], outArr3[2]);
}

export function computeEuclidL2LocalOffsetEclipticAU(earthEcl3, jd, outArr3, phaseDeg = 0.0, isL1 = false) {
  const rx = earthEcl3[0], ry = earthEcl3[1], rz = earthEcl3[2];
  const r = Math.hypot(rx, ry, rz) || 1.0;
  const ux = rx / r, uy = ry / r, uz = rz / r;
  const tLen = Math.hypot(-uy, ux) || 1.0;
  const tx = -uy / tLen, ty = ux / tLen;

  const phase = TWO_PI * ((jd - DISCOVERY_EPOCH_JD) / 178.4) + (phaseDeg || 0.0) * DEG2RAD;
  const radialCenter = isL1 ? -0.01002 : 0.01002;
  const haloAmpT = 0.0031 * Math.cos(phase);
  const haloAmpR = 0.0014 * Math.sin(phase);
  const haloAmpZ = 0.0024 * Math.sin(phase * 0.985 + 0.6);

  outArr3[0] = ux * (radialCenter + haloAmpR) + tx * haloAmpT;
  outArr3[1] = uy * (radialCenter + haloAmpR) + ty * haloAmpT;
  outArr3[2] = uz * (radialCenter + haloAmpR) + haloAmpZ;
  return Math.hypot(outArr3[0], outArr3[1], outArr3[2]);
}

// Sample raw scene-oriented AU coordinates [xE, zE, -yE, ...] into a Float32Array (zero Vector3 churn)
export function sampleHeliocentricOrbitRawAU(obj) {
  if (obj.category === "star" || obj.parent_id) return { positions: new Float32Array(0), closed: false };
  const e = Math.max(0.0, obj.e || 0.0);
  const basis = getOrbitalBasisVectors(obj);

  if (Math.abs(1.0 - e) < NEAR_PARABOLIC_EPS) {
    const q = Math.max(1e-6, obj.q_au > 0 ? obj.q_au : Math.abs(obj.a_au) * Math.abs(1.0 - e));
    const rMaxAU = Math.max(120.0, q * 40.0);
    const dMax = Math.sqrt(Math.max(0.5, rMaxAU / q - 1.0));
    const steps = 256;
    const arr = new Float32Array((steps + 1) * 3);
    for (let k = 0; k <= steps; k++) {
      const u = (2.0 * k) / steps - 1.0;
      const D = dMax * (0.4 * u + 0.6 * u * u * u);
      const xOrb = q * (1.0 - D * D);
      const yOrb = 2.0 * q * D;
      const xE = basis.Px * xOrb + basis.Qx * yOrb;
      const yE = basis.Py * xOrb + basis.Qy * yOrb;
      const zE = basis.Pz * xOrb + basis.Qz * yOrb;
      arr[k * 3] = xE;
      arr[k * 3 + 1] = zE;
      arr[k * 3 + 2] = -yE;
    }
    return { positions: arr, closed: false };
  }

  if (e >= 1.0 + NEAR_PARABOLIC_EPS) {
    const aAbs = obj.q_au > 0 ? obj.q_au / (e - 1.0) : Math.abs(obj.a_au);
    const isOutboundProbe = obj.category === "spacecraft" || obj.visual_type?.startsWith("spacecraft");
    const rMaxAU = isOutboundProbe ? 195.0 : 135.0;
    const coshMax = Math.max(1.05, (rMaxAU / aAbs + 1.0) / e);
    const hMax = Math.acosh(Math.min(coshMax, 1200.0));
    const steps = 240;
    const arr = new Float32Array((steps + 1) * 3);
    const sqrtE2m1 = Math.sqrt(e * e - 1.0);
    for (let k = 0; k <= steps; k++) {
      const u = isOutboundProbe ? k / steps : (2.0 * k) / steps - 1.0;
      const uWarped = isOutboundProbe ? 0.45 * u + 0.55 * u * u : 0.42 * u + 0.58 * u * u * u;
      const H = hMax * uWarped;
      const xOrb = aAbs * (e - Math.cosh(H));
      const yOrb = aAbs * sqrtE2m1 * Math.sinh(H);
      const xE = basis.Px * xOrb + basis.Qx * yOrb;
      const yE = basis.Py * xOrb + basis.Qy * yOrb;
      const zE = basis.Pz * xOrb + basis.Qz * yOrb;
      arr[k * 3] = xE;
      arr[k * 3 + 1] = zE;
      arr[k * 3 + 2] = -yE;
    }
    return { positions: arr, closed: false };
  }

  const a = Math.max(1e-6, Math.abs(obj.a_au));
  const steps = e > 0.72 ? 320 : 200;
  const bFac = Math.sqrt(Math.max(0.0, 1.0 - e * e));
  const warpAmp = 0.30 * Math.min(0.95, e);
  const arr = new Float32Array(steps * 3);
  for (let k = 0; k < steps; k++) {
    const theta = (TWO_PI * k) / steps;
    const E = theta - warpAmp * Math.sin(theta);
    const xOrb = a * (Math.cos(E) - e);
    const yOrb = a * bFac * Math.sin(E);
    const xE = basis.Px * xOrb + basis.Qx * yOrb;
    const yE = basis.Py * xOrb + basis.Qy * yOrb;
    const zE = basis.Pz * xOrb + basis.Qz * yOrb;
    arr[k * 3] = xE;
    arr[k * 3 + 1] = zE;
    arr[k * 3 + 2] = -yE;
  }
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
    const r = Math.hypot(x, y, z);
    const sc = r > 1e-12 ? mapRadiusAU(r, logBlend) / r : 0.0;
    pts[i] = new THREE.Vector3(x * sc, y * sc, z * sc);
  }
  return pts;
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
