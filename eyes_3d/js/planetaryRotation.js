// Precision IAU WGCCRE (Archinal et al. 2018) 3D Spin-Pole Orientation & Sidereal Rotation Engine
// Controls exact J2000 Ecliptic axial pole orientation (RA alpha0, Dec delta0) and prime-meridian
// sidereal rotation angle W(d) = W0 + Wdot * (JD - 2451545.0) for the Sun, all 8 Planets,
// Dwarf Planets, Tidally Locked Moons, and Minor Bodies.

import * as THREE from "../vendor/three.module.js";

const DEG2RAD = Math.PI / 180.0;
const RAD2DEG = 180.0 / Math.PI;
const J2000_JD = 2451545.0;
const OBLIQUITY_J2000_RAD = 23.4392911 * DEG2RAD;
const COS_EPS = Math.cos(OBLIQUITY_J2000_RAD);
const SIN_EPS = Math.sin(OBLIQUITY_J2000_RAD);

// Official IAU Working Group on Cartographic Coordinates and Rotational Elements (WGCCRE):
//   raDeg, decDeg : ICRF J2000 North Pole Right Ascension & Declination (degrees)
//   W0            : Prime Meridian angle at J2000.0 (JD 2451545.0, degrees)
//   Wdot          : Sidereal rotation rate (degrees / Julian day; negative = retrograde)
//   obliquityDeg  : True orbital axial tilt for telemetry display
export const IAU_ROTATION_ELEMENTS = {
  SUN:     { raDeg: 286.13,  decDeg: 63.87,   W0: 84.176,  Wdot: 14.1844000,   obliquityDeg: 7.25 },
  MERCURY: { raDeg: 281.010, decDeg: 61.450,  W0: 329.599, Wdot: 6.1385025,    obliquityDeg: 0.034 },
  VENUS:   { raDeg: 272.760, decDeg: 67.160,  W0: 160.200, Wdot: -1.4813688,   obliquityDeg: 177.36 },
  EARTH:   { raDeg: 0.000,   decDeg: 90.000,  W0: 190.147, Wdot: 360.9856235,  obliquityDeg: 23.4393 },
  MARS:    { raDeg: 317.681, decDeg: 52.887,  W0: 176.630, Wdot: 350.89198226, obliquityDeg: 25.19 },
  JUPITER: { raDeg: 268.057, decDeg: 64.495,  W0: 284.950, Wdot: 870.5360000,  obliquityDeg: 3.13 },
  SATURN:  { raDeg: 40.589,  decDeg: 83.537,  W0: 38.900,  Wdot: 810.7939024,  obliquityDeg: 26.73 },
  URANUS:  { raDeg: 257.311, decDeg: -15.175, W0: 203.810, Wdot: -501.1600928, obliquityDeg: 97.77 },
  NEPTUNE: { raDeg: 299.360, decDeg: 43.460,  W0: 253.180, Wdot: 536.3128492,  obliquityDeg: 28.32 },

  // Dwarf Planets, Centaurs & Major Asteroids
  PLUTO:          { raDeg: 132.993, decDeg: -6.163, W0: 302.695, Wdot: -56.3625225, obliquityDeg: 119.59 },
  CERES:          { raDeg: 291.42,  decDeg: 66.76,  W0: 170.65,  Wdot: 952.1532,    obliquityDeg: 4.0 },
  VESTA:          { raDeg: 309.03,  decDeg: 42.23,  W0: 285.39,  Wdot: 1617.3329,   obliquityDeg: 29.0 },
  PALLAS_2:       { raDeg: 33.0,    decDeg: -3.0,   W0: 38.0,    Wdot: 1105.803,    obliquityDeg: 84.0 },
  HYGIEA_10:      { raDeg: 312.0,   decDeg: -39.0,  W0: 115.0,   Wdot: 627.45,      obliquityDeg: 120.0 },
  HAUMEA:         { raDeg: 282.6,   decDeg: -10.9,  W0: 0.0,     Wdot: 2206.68,     obliquityDeg: 126.0 },
  MAKEMAKE:       { raDeg: 295.0,   decDeg: 28.0,   W0: 42.0,    Wdot: 378.506,     obliquityDeg: 29.0 },
  ERIS:           { raDeg: 35.0,    decDeg: -42.0,  W0: 90.0,    Wdot: 333.59,      obliquityDeg: 78.0 },
  QUAOAR:         { raDeg: 258.0,   decDeg: 52.0,   W0: 120.0,   Wdot: 488.72,      obliquityDeg: 14.0 },
  ORCUS:          { raDeg: 195.0,   decDeg: -22.0,  W0: 60.0,    Wdot: 65.8,        obliquityDeg: 98.0 },
  GONGONG:        { raDeg: 310.0,   decDeg: 15.0,   W0: 15.0,    Wdot: 385.7,       obliquityDeg: 45.0 },
  SEDNA:          { raDeg: 55.0,    decDeg: 14.0,   W0: 210.0,   Wdot: 841.04,      obliquityDeg: 18.0 },
  CHARIKLO_10199: { raDeg: 151.3,   decDeg: 41.5,   W0: 85.0,    Wdot: 1233.58,     obliquityDeg: 54.0 },
  CHIRON_2060:    { raDeg: 145.0,   decDeg: 38.0,   W0: 40.0,    Wdot: 1460.0,      obliquityDeg: 32.0 },
  EROS_433:       { raDeg: 11.35,   decDeg: 17.22,  W0: 326.07,  Wdot: 1639.389,    obliquityDeg: 89.0 },
  ITOKAWA_25143:  { raDeg: 90.53,   decDeg: -66.30, W0: 0.0,     Wdot: -712.14,     obliquityDeg: 178.0 },
  BENNU_101955:   { raDeg: 85.65,   decDeg: -60.17, W0: 102.0,   Wdot: -2011.17,    obliquityDeg: 177.6 },
  RYUGU_162173:   { raDeg: 96.40,   decDeg: -66.40, W0: 45.0,    Wdot: -1132.0,     obliquityDeg: 171.6 },
  PSYCHE_16:      { raDeg: 35.0,    decDeg: -7.0,   W0: 180.0,   Wdot: 2059.1,      obliquityDeg: 95.0 },
  ARROKOTH:       { raDeg: 311.0,   decDeg: -25.9,  W0: 20.0,    Wdot: 542.68,      obliquityDeg: 99.0 },
  CG_67P:         { raDeg: 69.54,   decDeg: 64.11,  W0: 50.0,    Wdot: 696.53,      obliquityDeg: 52.0 },
  HALLEY_1P:      { raDeg: 75.0,    decDeg: -25.0,  W0: 15.0,    Wdot: 162.2,       obliquityDeg: 115.0 },
  ATLAS_3I:       { raDeg: 218.0,   decDeg: 34.0,   W0: 40.0,    Wdot: 515.0,       obliquityDeg: 42.0 },
  SW1_29P:        { raDeg: 295.0,   decDeg: 58.0,   W0: 10.0,    Wdot: 7.2,         obliquityDeg: 22.0 },

  // Non-synchronous / irregular natural satellites
  HYPERION: { raDeg: 40.589,  decDeg: 83.537, W0: 60.0,  Wdot: 274.5,   obliquityDeg: 61.0 },
  PHOEBE:   { raDeg: 356.90,  decDeg: 77.80,  W0: 305.0, Wdot: 931.64,  obliquityDeg: 152.1 },
  HIMALIA:  { raDeg: 268.057, decDeg: 64.495, W0: 15.0,  Wdot: 1110.5,  obliquityDeg: 28.0 },
  PASIPHAE: { raDeg: 268.057, decDeg: 64.495, W0: 95.0,  Wdot: -760.0,  obliquityDeg: 145.0 },
  NEREID:   { raDeg: 299.360, decDeg: 43.460, W0: 45.0,  Wdot: 745.47,  obliquityDeg: 12.0 },
  NIX:      { raDeg: 132.993, decDeg: -6.163, W0: 10.0,  Wdot: 196.8,   obliquityDeg: 123.0 },
  HYDRA:    { raDeg: 132.993, decDeg: -6.163, W0: 140.0, Wdot: 838.0,   obliquityDeg: 110.0 }
};

// Tidally locked 1:1 synchronous moons (sub-planet meridian +Z = 0°E continuously faces parent planet!)
export const SYNCHRONOUS_MOONS = new Set([
  "MOON", "PHOBOS", "DEIMOS",
  "IO", "EUROPA", "GANYMEDE", "CALLISTO", "AMALTHEA", "THEBE", "METIS", "ADRASTEA",
  "MIMAS", "ENCELADUS", "TETHYS", "DIONE", "RHEA", "TITAN", "IAPETUS",
  "JANUS", "EPIMETHEUS", "PAN_SATURN", "DAPHNIS", "ATLAS_SATURN",
  "MIRANDA", "ARIEL", "UMBRIEL", "TITANIA", "OBERON", "PUCK",
  "TRITON", "CHARON", "DYSNOMIA", "HIIAKA", "NAMAKA", "VANTH"
]);

export function icrfEquatorialToScene(xEq, yEq, zEq, outVec3 = new THREE.Vector3()) {
  const xEcl = xEq;
  const yEcl = yEq * COS_EPS + zEq * SIN_EPS;
  const zEcl = -yEq * SIN_EPS + zEq * COS_EPS;
  // Scene mapping: X = X_ecl, Y = Z_ecl (North Ecliptic Pole), Z = -Y_ecl
  return outVec3.set(xEcl, zEcl, -yEcl);
}

export function getIAUPoleElements(obj) {
  if (IAU_ROTATION_ELEMENTS[obj.id]) {
    return IAU_ROTATION_ELEMENTS[obj.id];
  }
  if (obj.parent_id && SYNCHRONOUS_MOONS.has(obj.id)) {
    // Moon has its own 6.68°-inclined Cassini pole; other regular moons share parent planet's Laplace/equatorial pole
    if (obj.id === "MOON") {
      return { raDeg: 269.9949, decDeg: 66.5392, W0: 38.3213, Wdot: 13.17635815, obliquityDeg: 6.68, tidalLocked: true };
    }
    const parentEl = IAU_ROTATION_ELEMENTS[obj.parent_id];
    if (parentEl) {
      const pDays = Math.max(0.05, obj.period_days || 1.0);
      return {
        raDeg: parentEl.raDeg,
        decDeg: parentEl.decDeg,
        W0: 0.0,
        Wdot: (obj.i_deg && obj.i_deg > 90 ? -360.0 : 360.0) / pDays,
        obliquityDeg: obj.obliquity_deg || 0.1,
        tidalLocked: true
      };
    }
  }
  // Deterministic physical rotation for minor asteroids/TNOs/comets (typical 6h–18h period)
  let h = 2166136261;
  const s = String(obj.id || "BODY");
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  const u1 = ((h >>> 0) % 10000) / 10000.0;
  const u2 = (((h >>> 8) >>> 0) % 10000) / 10000.0;
  const periodHours = 5.5 + 14.5 * u1;
  return {
    raDeg: u2 * 360.0,
    decDeg: 66.56 - (obj.obliquity_deg || (18.0 * u1)),
    W0: u1 * 360.0,
    Wdot: 360.0 / (periodHours / 24.0),
    obliquityDeg: obj.obliquity_deg ?? Math.round(18.0 * u1 * 10) / 10
  };
}

export function applyIAUPoleOrientationToTiltGroup(tiltGroup, obj) {
  if (obj.category === "spacecraft" || obj.visual_type?.startsWith("spacecraft")) return;
  const el = getIAUPoleElements(obj);
  const a = el.raDeg * DEG2RAD;
  const d = el.decDeg * DEG2RAD;
  const ca = Math.cos(a), sa = Math.sin(a);
  const cd = Math.cos(d), sd = Math.sin(d);

  // ICRF unit basis: N_eq = North Pole (+Y_local), Q_eq = Node (+Z_local at W=0), R_eq = N x Q (+X_local at W=0)
  const colY = icrfEquatorialToScene(cd * ca, cd * sa, sd).normalize();
  const colZ = icrfEquatorialToScene(-sa, ca, 0.0).normalize();
  const colX = new THREE.Vector3().crossVectors(colY, colZ).normalize();
  colZ.crossVectors(colX, colY).normalize();

  const basisMat = new THREE.Matrix4().makeBasis(colX, colY, colZ);
  tiltGroup.rotation.set(0, 0, 0);
  tiltGroup.quaternion.setFromRotationMatrix(basisMat);
  tiltGroup.userData.iauElements = el;
}

const _parentLocalTmp = new THREE.Vector3();

export function updateBodyPhysicalRotation(rt, simJD, parentRt = null) {
  const obj = rt.obj;
  const spinGroup = rt.node.userData.rotatable;
  if (!spinGroup) return;

  if (obj.category === "spacecraft" || obj.visual_type?.startsWith("spacecraft")) {
    // Attitude control for artificial spacecraft: point solar arrays/sunshield cleanly relative to Sun/Nadir
    if (parentRt && obj.l1_phase_deg === null && obj.l2_phase_deg === null) {
      spinGroup.rotation.y = Math.atan2(-rt.worldPos.x, -rt.worldPos.z);
    } else {
      spinGroup.rotation.y = Math.atan2(-rt.worldPos.x, -rt.worldPos.z);
    }
    return;
  }

  // Tidally locked 1:1 synchronous moons: keep +Z (0°E Prime Meridian / Near Side) facing parent body!
  if (parentRt && SYNCHRONOUS_MOONS.has(obj.id) && rt.node.userData.tiltGroup) {
    const tiltGroup = rt.node.userData.tiltGroup;
    tiltGroup.updateWorldMatrix(true, false);
    _parentLocalTmp.copy(parentRt.worldPos);
    tiltGroup.worldToLocal(_parentLocalTmp);
    if (_parentLocalTmp.lengthSq() > 1e-16) {
      spinGroup.rotation.y = Math.atan2(_parentLocalTmp.x, _parentLocalTmp.z);
      return;
    }
  }

  const el = rt.node.userData.tiltGroup?.userData?.iauElements || getIAUPoleElements(obj);
  const d = simJD - J2000_JD;
  // Preserve high precision on large d * Wdot by reducing revolutions cleanly in Float64
  const revPerDay = el.Wdot / 360.0;
  const fracRev = (el.W0 / 360.0) + (d * revPerDay - Math.floor(d * revPerDay));
  const wDeg = ((fracRev * 360.0) % 360.0 + 360.0) % 360.0;
  spinGroup.rotation.y = wDeg * DEG2RAD;
  rt.liveMeridianDeg = wDeg;

  // Drift Earth's synoptic cloud deck gently eastward (mid-latitude Westerlies ~12 m/s) with physical JD!
  const cloudMesh = rt.node.userData.earthCloudMesh;
  if (cloudMesh) {
    cloudMesh.rotation.y = ((d * 0.045) % 1.0) * Math.PI * 2.0;
  }
}

export function formatSiderealPeriod(obj) {
  const el = getIAUPoleElements(obj);
  if (!el || !el.Wdot) return "—";
  const isRetro = el.Wdot < 0;
  const absDays = 360.0 / Math.abs(el.Wdot);
  const retroTag = isRetro ? " (Retrograde)" : "";
  if (SYNCHRONOUS_MOONS.has(obj.id)) {
    const syncTag = " · Synchronous";
    if (absDays >= 2.0) return `${absDays.toFixed(3)} d${retroTag}${syncTag}`;
    return `${(absDays * 24.0).toFixed(2)} h${retroTag}${syncTag}`;
  }
  if (absDays >= 2.0) {
    return `${absDays.toFixed(4)} d${retroTag}`;
  }
  const totalHours = absDays * 24.0;
  const hh = Math.floor(totalHours);
  const remMin = (totalHours - hh) * 60.0;
  const mm = Math.floor(remMin);
  const ss = (remMin - mm) * 60.0;
  return `${hh}h ${String(mm).padStart(2, "0")}m ${ss.toFixed(1)}s${retroTag}`;
}

export function computeEarthSubsolarLatLon(earthRt) {
  if (!earthRt || !earthRt.node.userData.rotatable) return null;
  const spinGroup = earthRt.node.userData.rotatable;
  spinGroup.updateWorldMatrix(true, false);
  // Sun is at world (0,0,0); in spinGroup local coords: +Y = North, +Z = (0°N, 0°E), +X = (0°N, 90°E)
  const sunLocal = new THREE.Vector3(0, 0, 0);
  spinGroup.worldToLocal(sunLocal);
  if (sunLocal.lengthSq() < 1e-12) return null;
  sunLocal.normalize();
  const latDeg = Math.asin(THREE.MathUtils.clamp(sunLocal.y, -1.0, 1.0)) * RAD2DEG;
  const lonDeg = Math.atan2(sunLocal.x, sunLocal.z) * RAD2DEG;
  return { latDeg, lonDeg };
}
