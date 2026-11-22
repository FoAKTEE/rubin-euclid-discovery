import * as THREE from "../vendor/three.module.js";

export const GALAXY_SCENE_PER_PC = 200.0;
export const GALAXY_SCENE_PER_KPC = 200000.0;
const DEG2RAD = Math.PI / 180.0;
const TWO_PI = Math.PI * 2.0;
const OBLIQUITY_RAD = 23.439291111 * DEG2RAD;
const COS_EPS = Math.cos(OBLIQUITY_RAD);
const SIN_EPS = Math.sin(OBLIQUITY_RAD);

// Columns: Col0 = +X_gal (l=0,b=0), Col1 = +Y_gal (l=90,b=0), Col2 = +Z_gal (NGP b=+90) -> Three.js Scene
const G0 = [-0.05487566, -0.09647669, +0.99382137];
const G1 = [+0.49410944, +0.86228586, +0.11099084];
const G2 = [-0.86766614, +0.49714721, +0.00035154];

const R0_KPC = 8.277;
const Z_SUN_KPC = 0.0208;

// Reid et al. (2019) VLBI maser logarithmic spiral arms: [betaRefRad, rRefKpc, tanPitch, widthKpc, amp, h2Boost]
const REID_ARMS = [
  [0.314, 4.46, Math.tan(19.3 * DEG2RAD), 0.42, 0.88, 0.75], // Norma-Outer
  [0.482, 4.91, Math.tan(13.1 * DEG2RAD), 0.52, 1.12, 1.00], // Scutum-Centaurus
  [0.419, 6.04, Math.tan(12.1 * DEG2RAD), 0.48, 0.96, 0.92], // Sagittarius-Carina
  [0.122, 8.26, Math.tan(11.4 * DEG2RAD), 0.31, 0.68, 0.65], // Local (Orion) Spur
  [0.698, 8.87, Math.tan(9.4 * DEG2RAD),  0.54, 1.04, 0.88]  // Perseus
];

function mulberry32(seed) {
  let a = seed >>> 0;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function helioGalacticKpcToScene(xg, yg, zg, outArr, offset = 0) {
  const s = GALAXY_SCENE_PER_KPC;
  outArr[offset]     = (G0[0] * xg + G1[0] * yg + G2[0] * zg) * s;
  outArr[offset + 1] = (G0[1] * xg + G1[1] * yg + G2[1] * zg) * s;
  outArr[offset + 2] = (G0[2] * xg + G1[2] * yg + G2[2] * zg) * s;
}

function bpRpToRGB(bpRp, outArr, offset = 0) {
  const c = Number.isFinite(bpRp) ? Math.max(-0.6, Math.min(3.2, bpRp)) : 0.82;
  let r, g, b;
  if (c < 0.0) {
    const u = (c + 0.6) / 0.6;
    r = 0.58 + 0.22 * u;
    g = 0.72 + 0.18 * u;
    b = 1.00;
  } else if (c < 0.55) {
    const u = c / 0.55;
    r = 0.80 + 0.19 * u;
    g = 0.90 + 0.08 * u;
    b = 1.00 - 0.06 * u;
  } else if (c < 1.15) {
    const u = (c - 0.55) / 0.60;
    r = 0.99 + 0.01 * u;
    g = 0.98 - 0.12 * u;
    b = 0.94 - 0.28 * u;
  } else if (c < 1.85) {
    const u = (c - 1.15) / 0.70;
    r = 1.00;
    g = 0.86 - 0.22 * u;
    b = 0.66 - 0.28 * u;
  } else {
    const u = Math.min(1.0, (c - 1.85) / 1.35);
    r = 1.00;
    g = 0.64 - 0.18 * u;
    b = 0.38 - 0.16 * u;
  }
  outArr[offset] = r;
  outArr[offset + 1] = g;
  outArr[offset + 2] = b;
}

const STAR_VERTEX_SHADER = `
  #include <common>
  #include <logdepthbuf_pars_vertex>
  attribute vec3 aColor;
  attribute float aAbsMag;
  attribute float aPopBoost;
  uniform float uPixelRatio;
  uniform float uGalacticFactor;
  uniform float uOpacity;
  varying vec3 vColor;
  varying float vAlpha;

  void main() {
    vColor = aColor;
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    float dScene = max(1.0, length(mvPosition.xyz));
    float dPc = max(0.02, dScene / 200.0);

    float isFarCompletion = step(aPopBoost, 0.0);
    float boostMag = abs(aPopBoost);
    float selWeight = clamp(boostMag, 0.003, 1.5);

    float appMag = aAbsMag + 2.1714724 * log(dPc * 0.1);
    float flux = pow(10.0, -0.4 * (appMag - 4.5));
    float skySize = 1.25 + 2.65 * clamp(pow(flux, 0.30), 0.0, 2.2);

    float galBright = clamp((13.5 - aAbsMag) * 0.11, 0.22, 1.45) * max(0.35, selWeight);
    float farAtten = 1.0 / (1.0 + dPc * 0.000055);
    float galSize = clamp(1.05 + 1.95 * galBright * farAtten * min(1.0, selWeight + 0.25), 1.0, 4.6);

    float ptSize = mix(skySize, max(skySize * 0.82, galSize), uGalacticFactor);
    gl_PointSize = clamp(ptSize * uPixelRatio, 1.0, 8.5);

    float skyAlpha = (1.0 - isFarCompletion) * clamp(0.18 + 0.82 * pow(flux, 0.38), 0.06, 0.95);
    float edgeCrowdDamp = mix(1.0, 0.68, smoothstep(22000.0, 75000.0, dPc));
    float galAlpha = clamp((0.18 + 0.50 * galBright * farAtten) * edgeCrowdDamp * min(1.0, selWeight), 0.001, 0.85);
    float farGate = mix(1.0, smoothstep(0.15, 0.75, uGalacticFactor), isFarCompletion);
    vAlpha = mix(skyAlpha * 0.72, galAlpha, uGalacticFactor) * farGate * uOpacity;

    gl_Position = projectionMatrix * mvPosition;
    #include <logdepthbuf_vertex>
  }
`;

const STAR_FRAGMENT_SHADER = `
  #include <common>
  #include <logdepthbuf_pars_fragment>
  varying vec3 vColor;
  varying float vAlpha;

  void main() {
    vec2 uv = gl_PointCoord - vec2(0.5);
    float d2 = dot(uv, uv);
    if (d2 > 0.25) discard;
    float core = exp(-d2 * 18.0);
    float halo = 0.34 * exp(-d2 * 6.0);
    float a = (core + halo) * vAlpha;
    if (a < 0.004) discard;
    #include <logdepthbuf_fragment>
    gl_FragColor = vec4(vColor * (0.85 + 0.55 * core), clamp(a, 0.0, 1.0));
  }
`;

const DISK_SLAB_VERTEX_SHADER = `
  #include <common>
  #include <logdepthbuf_pars_vertex>
  varying vec3 vLocalKpc;
  void main() {
    vLocalKpc = position;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    #include <logdepthbuf_vertex>
  }
`;

const DISK_SLAB_FRAGMENT_SHADER = `
  #include <common>
  #include <logdepthbuf_pars_fragment>

  uniform vec3 uCamLocalKpc;
  uniform float uTime;
  uniform float uOpacity;
  uniform float uDiskRadiusKpc;
  uniform float uDiskHalfHeightKpc;
  varying vec3 vLocalKpc;

  float hash31(vec3 p) {
    p = fract(p * vec3(0.1031, 0.1030, 0.0973));
    p += dot(p, p.yxz + 33.33);
    return fract((p.x + p.y) * p.z);
  }

  float noise3(vec3 p) {
    vec3 i = floor(p);
    vec3 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    return mix(
      mix(mix(hash31(i), hash31(i + vec3(1, 0, 0)), f.x),
          mix(hash31(i + vec3(0, 1, 0)), hash31(i + vec3(1, 1, 0)), f.x), f.y),
      mix(mix(hash31(i + vec3(0, 0, 1)), hash31(i + vec3(1, 0, 1)), f.x),
          mix(hash31(i + vec3(0, 1, 1)), hash31(i + vec3(1, 1, 1)), f.x), f.y),
      f.z
    );
  }

  float fbm3(vec3 p) {
    float v = 0.0;
    float a = 0.55;
    for (int i = 0; i < 3; i++) {
      v += a * noise3(p);
      p = p * 2.06 + vec3(7.3, 13.1, 5.7);
      a *= 0.5;
    }
    return v;
  }

  float armProfile(float rKpc, float beta, float betaRef, float rRef, float tanPsi, float widthKpc) {
    float best = 0.0;
    for (int k = -1; k <= 1; k++) {
      float bUnwrap = beta + float(k) * 6.2831853;
      float rArm = rRef * exp(-(bUnwrap - betaRef) * tanPsi);
      float dr = (rKpc - rArm) / widthKpc;
      best = max(best, exp(-0.5 * dr * dr));
    }
    return best;
  }

  void evalGalaxyField(vec3 pLoc, out vec3 emitRGB, out float dustExt) {
    // pLoc: x = X_gc (-8.277 at Sun), y = Z_gc (vertical kpc), z = -Y_gc
    float xGc = pLoc.x;
    float yGc = -pLoc.z;
    float zGc = pLoc.y;
    float rCyl = length(vec2(xGc, yGc));

    if (rCyl > uDiskRadiusKpc || abs(zGc) > uDiskHalfHeightKpc) {
      emitRGB = vec3(0.0);
      dustExt = 0.0;
      return;
    }

    // Galactic Bar + Boxy/Peanut Bulge rotated +27 deg (near tip in Quadrant I: xGc < 0, yGc > 0)
    float cB = 0.8910, sB = 0.4540;
    float xBar = -xGc * cB + yGc * sB;
    float yBar =  xGc * sB + yGc * cB;
    float barEllip = sqrt((xBar / 4.3) * (xBar / 4.3) + (yBar / 1.55) * (yBar / 1.55) + (zGc / 0.78) * (zGc / 0.78));
    float peanutCore = exp(-length(vec3(xGc * 0.62, yGc * 0.62, zGc * 1.05)) * 0.88);
    float barGlow = exp(-barEllip * barEllip * 1.25) + 0.78 * peanutCore;

    // 5 Reid+2019 Logarithmic Spiral Arms + Outer Cygnus-Norma wrap for full 360-deg disk symmetry
    float beta = atan(yGc, -xGc);
    float armSum = 0.0;
    armSum += 0.86 * armProfile(rCyl, beta, 0.314, 4.46, 0.3502, 0.52); // Norma-Outer
    armSum += 1.10 * armProfile(rCyl, beta, 0.482, 4.91, 0.2327, 0.58); // Scutum-Centaurus
    armSum += 0.96 * armProfile(rCyl, beta, 0.419, 6.04, 0.2144, 0.54); // Sagittarius-Carina
    armSum += 0.65 * armProfile(rCyl, beta, 0.122, 8.26, 0.2016, 0.38); // Local Orion Spur
    armSum += 1.04 * armProfile(rCyl, beta, 0.698, 8.87, 0.1655, 0.60); // Perseus
    armSum += 0.88 * armProfile(rCyl, beta, 2.280, 7.65, 0.1950, 0.62); // Outer / Far-Side Cygnus wrap

    float ringFade = smoothstep(2.3, 3.9, rCyl) * (1.0 - smoothstep(13.6, uDiskRadiusKpc * 0.97, rCyl));
    armSum *= ringFade;

    float turb = fbm3(vec3(xGc * 0.48, yGc * 0.48, zGc * 1.9 + 2.1));
    float fineClump = noise3(vec3(xGc * 1.45 + uTime * 0.004, yGc * 1.45, zGc * 3.8));

    float zGas = exp(-(zGc * zGc) / (2.0 * 0.24 * 0.24));
    float zWarm = exp(-(zGc * zGc) / (2.0 * 0.55 * 0.55));
    float zDust = exp(-(zGc * zGc) / (2.0 * 0.095 * 0.095));

    // Smooth boundary apodization so cylinder edges never produce geometric discontinuities
    float boundaryFade = (1.0 - smoothstep(uDiskRadiusKpc * 0.84, uDiskRadiusKpc, rCyl))
                       * (1.0 - smoothstep(uDiskHalfHeightKpc * 0.78, uDiskHalfHeightKpc, abs(zGc)));

    // Dark midplane molecular dust lanes along inner edge of spiral arms & molecular ring (1.4-15 kpc)
    float molRing = smoothstep(1.4, 3.6, rCyl) * (1.0 - smoothstep(10.0, 15.2, rCyl));
    float dustStructure = smoothstep(0.26, 0.78, 1.0 - turb * 0.62);

    // Clear subtle Local Bubble cavity around Sun (-8.277, +0.0208, 0) so immediate solar neighborhood stays transparent
    float dSunKpc = length(pLoc - vec3(-8.277, 0.0208, 0.0));
    float sunClear = smoothstep(0.06, 0.38, dSunKpc) * boundaryFade;

    dustExt = (0.42 * molRing + 0.62 * armSum) * zDust * dustStructure * sunClear;
    float dustShield = exp(-dustExt * 1.18);

    float diskBase = 0.28 * exp(-rCyl / 4.8) * zWarm;
    float spiralGas = armSum * zGas * (0.42 + 0.90 * turb) * dustShield;
    float hiiKnots = armSum * zDust * smoothstep(0.62, 0.88, fineClump) * smoothstep(0.42, 0.75, turb) * dustShield;

    vec3 colBulge = vec3(1.00, 0.76, 0.40) * (barGlow * 0.62 * mix(0.35, 1.0, dustShield));
    vec3 colDisk  = vec3(0.58, 0.70, 0.96) * (diskBase * dustShield);
    vec3 colArm   = mix(vec3(0.34, 0.66, 0.99), vec3(0.76, 0.88, 1.00), turb) * (spiralGas * 0.36);
    vec3 colHII   = mix(vec3(0.96, 0.34, 0.58), vec3(0.30, 0.88, 0.96), fract(fineClump * 3.7)) * (hiiKnots * 0.62);
    vec3 colDustRim = vec3(0.48, 0.24, 0.09) * (dustExt * (1.0 - zDust * 0.55) * 0.22);

    emitRGB = (colBulge + colDisk + colArm + colHII + colDustRim) * sunClear;
  }

  void main() {
    vec3 ro = uCamLocalKpc;
    vec3 rd = normalize(vLocalKpc - ro);

    // Ray-cylinder intersection: x^2 + z^2 <= R^2, |y| <= H
    float R = uDiskRadiusKpc;
    float H = uDiskHalfHeightKpc;
    float a = dot(rd.xz, rd.xz);
    float b = dot(ro.xz, rd.xz);
    float c = dot(ro.xz, ro.xz) - R * R;

    float tMin = 0.0;
    float tMax = 1e5;
    if (a > 1e-7) {
      float disc = b * b - a * c;
      if (disc < 0.0) discard;
      float sq = sqrt(disc);
      tMin = max(tMin, (-b - sq) / a);
      tMax = min(tMax, (-b + sq) / a);
    } else if (c > 0.0) {
      discard;
    }

    if (abs(rd.y) > 1e-6) {
      float ty1 = (-H - ro.y) / rd.y;
      float ty2 = ( H - ro.y) / rd.y;
      tMin = max(tMin, min(ty1, ty2));
      tMax = min(tMax, max(ty1, ty2));
    } else if (abs(ro.y) > H) {
      discard;
    }

    if (tMax <= tMin) discard;

    // 44 uniform jittered steps eliminate edge-on Mach banding across the thin 95 pc dust plane
    float span = min(tMax - tMin, 39.0);
    const int STEPS = 44;
    float ds = span / float(STEPS);
    float jitter = fract(sin(dot(gl_FragCoord.xy, vec2(12.9898, 78.233))) * 43758.5453);

    vec3 accumLight = vec3(0.0);
    float transmittance = 1.0;

    for (int i = 0; i < STEPS; i++) {
      float t = tMin + (float(i) + jitter) * ds;
      vec3 p = ro + rd * t;
      vec3 emitRGB;
      float dustExt;
      evalGalaxyField(p, emitRGB, dustExt);
      float stepTrans = exp(-dustExt * ds * 0.92);
      accumLight += transmittance * emitRGB * ds * 0.40;
      transmittance *= stepTrans;
      if (transmittance < 0.025) break;
    }

    // Pure dust-extinction alpha attenuates background stars behind dark midplane lanes while keeping dust-free bulge emission purely additive
    float dustAlpha = clamp((1.0 - transmittance) * 0.88, 0.0, 0.88);
    if (dustAlpha < 0.002 && dot(accumLight, accumLight) < 1e-6) discard;

    #include <logdepthbuf_fragment>
    gl_FragColor = vec4(accumLight * uOpacity, dustAlpha * uOpacity);
  }
`;

const CLOUD_PUFF_VERTEX_SHADER = `
  #include <common>
  #include <logdepthbuf_pars_vertex>
  attribute vec3 aColor;
  attribute float aSizeKpc;
  attribute float aAlpha;
  uniform float uScaleScenePerKpc;
  uniform float uViewportH;
  uniform float uOpacity;
  varying vec3 vColor;
  varying float vAlpha;

  void main() {
    vColor = aColor;
    vec4 mvPos = modelViewMatrix * vec4(position, 1.0);
    float dist = max(50.0, -mvPos.z);
    float px = (aSizeKpc * uScaleScenePerKpc / dist) * (uViewportH * 0.85);
    gl_PointSize = clamp(px, 1.5, 110.0);
    float nearFade = smoothstep(4000.0, 36000.0, dist);
    vAlpha = aAlpha * nearFade * uOpacity;
    gl_Position = projectionMatrix * mvPos;
    #include <logdepthbuf_vertex>
  }
`;

const CLOUD_PUFF_FRAGMENT_SHADER = `
  #include <common>
  #include <logdepthbuf_pars_fragment>
  varying vec3 vColor;
  varying float vAlpha;
  void main() {
    vec2 uv = gl_PointCoord - vec2(0.5);
    float d2 = dot(uv, uv);
    if (d2 > 0.25) discard;
    float w = exp(-d2 * 10.5) - exp(-0.25 * 10.5);
    float a = w * vAlpha;
    if (a < 0.002) discard;
    #include <logdepthbuf_fragment>
    gl_FragColor = vec4(vColor * a, a * 0.45);
  }
`;

const FERMI_VERTEX_SHADER = `
  #include <common>
  #include <logdepthbuf_pars_vertex>
  varying vec3 vNormalView;
  varying vec3 vViewDir;
  varying float vLocalY;
  void main() {
    vLocalY = position.y;
    vec4 mvPos = modelViewMatrix * vec4(position, 1.0);
    vNormalView = normalize(normalMatrix * normal);
    vViewDir = normalize(-mvPos.xyz);
    gl_Position = projectionMatrix * mvPos;
    #include <logdepthbuf_vertex>
  }
`;

const FERMI_FRAGMENT_SHADER = `
  #include <common>
  #include <logdepthbuf_pars_fragment>
  uniform float uOpacity;
  varying vec3 vNormalView;
  varying vec3 vViewDir;
  varying float vLocalY;
  void main() {
    float ndv = abs(dot(normalize(vNormalView), normalize(vViewDir)));
    float shell = pow(1.0 - ndv, 1.65) * 0.65 + 0.18 * ndv;
    float baseTaper = smoothstep(0.0, 1.2, abs(vLocalY));
    float intensity = shell * baseTaper * 0.16 * uOpacity;
    if (intensity < 0.002) discard;
    vec3 col = mix(vec3(0.68, 0.36, 0.92), vec3(0.42, 0.72, 1.0), clamp(abs(vLocalY) / 9.0, 0.0, 1.0));
    #include <logdepthbuf_fragment>
    gl_FragColor = vec4(col * intensity, intensity * 0.35);
  }
`;

function buildProceduralSeedStars(count = 42000) {
  const rng = mulberry32(20261119);
  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);
  const absMags = new Float32Array(count);
  const popBoost = new Float32Array(count);

  for (let i = 0; i < count; i++) {
    let xg, yg, zg, bpRp, mG, boost = 1.0;
    const u = rng();

    if (u < 0.24) {
      // Local Solar Neighborhood (< 450 pc)
      const rKpc = 0.004 + 0.45 * Math.pow(rng(), 0.62);
      const phi = rng() * TWO_PI;
      const cosT = 2.0 * rng() - 1.0;
      const sinT = Math.sqrt(Math.max(0.0, 1.0 - cosT * cosT));
      xg = rKpc * sinT * Math.cos(phi);
      yg = rKpc * sinT * Math.sin(phi);
      zg = rKpc * cosT * 0.65;
      bpRp = -0.25 + 2.4 * Math.pow(rng(), 1.15);
      mG = -1.5 + 9.0 * rng();
    } else if (u < 0.74) {
      // Full 360-deg Spiral Arm + Thin Disk tracers around Sgr A*
      const arm = REID_ARMS[Math.floor(rng() * REID_ARMS.length)];
      const rTarget = 2.8 + 12.6 * Math.pow(rng(), 0.82);
      const betaBase = arm[0] - Math.log(rTarget / arm[1]) / arm[2];
      const rKpc = Math.max(2.5, Math.min(16.4, rTarget + (rng() + rng() - 1.0) * arm[3] * 2.0));
      const xGc = -rKpc * Math.cos(betaBase);
      const yGc = rKpc * Math.sin(betaBase);
      xg = R0_KPC + xGc;
      yg = yGc;
      zg = -Z_SUN_KPC + (rng() + rng() - 1.0) * 0.22;
      const isOB = rng() < 0.36;
      bpRp = isOB ? -0.32 + 0.55 * rng() : 0.5 + 1.6 * rng();
      mG = isOB ? -4.2 + 3.2 * rng() : -1.0 + 3.5 * rng();
      boost = isOB ? 1.15 : 0.88;
    } else if (u < 0.91) {
      // Galactic Bar & Bulge Giants
      const rBulge = 3.8 * Math.pow(rng(), 0.78);
      const ang = rng() * TWO_PI;
      const xBar = rBulge * Math.cos(ang);
      const yBar = rBulge * 0.38 * Math.sin(ang);
      const cB = 0.8910, sB = 0.4540;
      const xGc = -xBar * cB + yBar * sB;
      const yGc = xBar * sB + yBar * cB;
      xg = R0_KPC + xGc;
      yg = yGc;
      zg = -Z_SUN_KPC + (rng() + rng() - 1.0) * 0.62;
      bpRp = 1.05 + 1.15 * rng();
      mG = -2.2 + 2.6 * rng();
      boost = 1.18;
    } else {
      // Halo + LMC (l=280.5, b=-32.9, d=50 kpc) + SMC (l=302.8, b=-44.3, d=62.4 kpc)
      const sub = rng();
      if (sub < 0.48) {
        const l = 280.47 * DEG2RAD, b = -32.89 * DEG2RAD, d = 49.97;
        xg = d * Math.cos(b) * Math.cos(l) + (rng() - 0.5) * 3.8;
        yg = d * Math.cos(b) * Math.sin(l) + (rng() - 0.5) * 3.8;
        zg = d * Math.sin(b) + (rng() - 0.5) * 1.6;
        bpRp = -0.2 + 1.6 * rng();
        mG = -4.8 + 2.5 * rng();
        boost = 1.45;
      } else if (sub < 0.72) {
        const l = 302.81 * DEG2RAD, b = -44.33 * DEG2RAD, d = 62.44;
        xg = d * Math.cos(b) * Math.cos(l) + (rng() - 0.5) * 2.4;
        yg = d * Math.cos(b) * Math.sin(l) + (rng() - 0.5) * 2.4;
        zg = d * Math.sin(b) + (rng() - 0.5) * 1.4;
        bpRp = -0.15 + 1.5 * rng();
        mG = -4.5 + 2.5 * rng();
        boost = 1.40;
      } else {
        const rHalo = 4.0 + 24.0 * rng();
        const phi = rng() * TWO_PI;
        const cosT = 2.0 * rng() - 1.0;
        const sinT = Math.sqrt(Math.max(0.0, 1.0 - cosT * cosT));
        xg = R0_KPC + rHalo * sinT * Math.cos(phi);
        yg = rHalo * sinT * Math.sin(phi);
        zg = rHalo * cosT;
        bpRp = 0.65 + 0.9 * rng();
        mG = -2.4 + 2.2 * rng();
      }
    }

    helioGalacticKpcToScene(xg, yg, zg, positions, i * 3);
    bpRpToRGB(bpRp, colors, i * 3);
    absMags[i] = mG;
    popBoost[i] = boost;
  }

  return { positions, colors, absMags, popBoost, count };
}

function buildVolumetricCloudPuffs() {
  const rng = mulberry32(9021042);
  const count = 3400;
  const posScene = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);
  const sizeKpc = new Float32Array(count);
  const alphas = new Float32Array(count);

  for (let i = 0; i < count; i++) {
    const u = rng();
    let xg, yg, zg, r, g, b, sKpc, alpha;

    if (u < 0.72) {
      // Full 360-deg HII star-forming & molecular gas knots along the 5 Reid+2019 spiral arms
      const arm = REID_ARMS[Math.floor(rng() * REID_ARMS.length)];
      const rTarget = 3.0 + 12.2 * Math.pow(rng(), 0.84);
      const beta = arm[0] - Math.log(rTarget / arm[1]) / arm[2];
      const rCyl = Math.max(2.8, Math.min(15.8, rTarget + (rng() + rng() - 1.0) * arm[3] * 1.15));
      xg = R0_KPC - rCyl * Math.cos(beta);
      yg = rCyl * Math.sin(beta);
      zg = -Z_SUN_KPC + (rng() + rng() - 1.0) * 0.16;

      // Avoid placing bright puffs directly on top of the Sun
      if (Math.hypot(xg, yg, zg) < 0.35) xg += 0.65;

      const isHII = rng() < 0.34;
      if (isHII) {
        r = 0.95; g = 0.32 + 0.18 * rng(); b = 0.62 + 0.25 * rng();
        sKpc = 0.28 + 0.42 * rng();
        alpha = 0.22 + 0.18 * rng();
      } else {
        r = 0.28 + 0.22 * rng(); g = 0.58 + 0.22 * rng(); b = 0.98;
        sKpc = 0.55 + 0.85 * rng();
        alpha = 0.11 + 0.10 * rng();
      }
    } else if (u < 0.86) {
      // Warm Galactic Bar & Central Molecular Zone glow
      const rad = 3.6 * Math.pow(rng(), 0.75);
      const ang = rng() * TWO_PI;
      const xb = rad * Math.cos(ang);
      const yb = rad * 0.36 * Math.sin(ang);
      const cB = 0.8910, sB = 0.4540;
      xg = R0_KPC - xb * cB + yb * sB;
      yg = xb * sB + yb * cB;
      zg = -Z_SUN_KPC + (rng() + rng() - 1.0) * 0.38;
      r = 1.00; g = 0.72 + 0.14 * rng(); b = 0.40 + 0.15 * rng();
      sKpc = 0.60 + 0.95 * rng();
      alpha = 0.12 + 0.10 * rng();
    } else {
      // LMC (with 30 Doradus Tarantula HII region) & SMC 3D nebular bodies
      const isLMC = rng() < 0.68;
      const l = (isLMC ? 280.47 : 302.81) * DEG2RAD;
      const bLat = (isLMC ? -32.89 : -44.33) * DEG2RAD;
      const d = isLMC ? 49.97 : 62.44;
      const spread = isLMC ? 2.6 : 1.6;
      xg = d * Math.cos(bLat) * Math.cos(l) + (rng() + rng() - 1.0) * spread;
      yg = d * Math.cos(bLat) * Math.sin(l) + (rng() + rng() - 1.0) * spread;
      zg = d * Math.sin(bLat) + (rng() + rng() - 1.0) * (spread * 0.55);
      const isTarantula = isLMC && rng() < 0.22;
      if (isTarantula) {
        r = 0.98; g = 0.36; b = 0.68;
        sKpc = 0.85 + 0.75 * rng();
        alpha = 0.28;
      } else {
        r = 0.48 + 0.25 * rng(); g = 0.70 + 0.18 * rng(); b = 1.00;
        sKpc = 1.2 + 1.6 * rng();
        alpha = 0.16 + 0.10 * rng();
      }
    }

    helioGalacticKpcToScene(xg, yg, zg, posScene, i * 3);
    colors[i * 3] = r;
    colors[i * 3 + 1] = g;
    colors[i * 3 + 2] = b;
    sizeKpc[i] = sKpc;
    alphas[i] = alpha;
  }

  const geom = new THREE.BufferGeometry();
  geom.setAttribute("position", new THREE.BufferAttribute(posScene, 3));
  geom.setAttribute("aColor", new THREE.BufferAttribute(colors, 3));
  geom.setAttribute("aSizeKpc", new THREE.BufferAttribute(sizeKpc, 1));
  geom.setAttribute("aAlpha", new THREE.BufferAttribute(alphas, 1));
  geom.boundingSphere = new THREE.Sphere(new THREE.Vector3(0, 0, 0), 2.0e7);

  const uniforms = {
    uScaleScenePerKpc: { value: GALAXY_SCENE_PER_KPC },
    uViewportH: { value: typeof window !== "undefined" ? window.innerHeight : 900 },
    uOpacity: { value: 0.0 }
  };

  const mat = new THREE.ShaderMaterial({
    uniforms,
    vertexShader: CLOUD_PUFF_VERTEX_SHADER,
    fragmentShader: CLOUD_PUFF_FRAGMENT_SHADER,
    transparent: true,
    depthTest: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending
  });

  const points = new THREE.Points(geom, mat);
  points.frustumCulled = false;
  points.renderOrder = 3;
  return { points, geom, mat, uniforms };
}

function parseBinaryStarsBuffer(arrayBuffer, catalogJson = null) {
  const f32 = new Float32Array(arrayBuffer);
  const schema = catalogJson?.stars_binary_schema || catalogJson?.binary_schema || {};
  const fields = Array.isArray(schema.fields)
    ? schema.fields
    : ["x", "y", "z", "bp_rp", "mag_g", "pop_code"];
  const stride = Number(schema.stride_floats || fields.length || 6);
  const count = Math.floor(f32.length / stride);
  if (count <= 0) return null;

  const frame = String(schema.frame || "heliocentric_galactic_kpc").toLowerCase();
  const idxX = Math.max(0, fields.findIndex((f) => /^(x|xg|x_kpc|x_pc|x_ecl)/i.test(f)));
  const idxY = fields.findIndex((f) => /^(y|yg|y_kpc|y_pc|y_ecl)/i.test(f));
  const idxZ = fields.findIndex((f) => /^(z|zg|z_kpc|z_pc|z_ecl)/i.test(f));
  const useY = idxY >= 0 ? idxY : 1;
  const useZ = idxZ >= 0 ? idxZ : 2;
  const idxBpRp = fields.findIndex((f) => /bp_rp|color/i.test(f));
  const idxAbsMag = fields.findIndex((f) => /^(m_g|abs_mag|mg_abs)/i.test(f));
  const idxAppMag = fields.findIndex((f) => /^(g_mag|mag_g|phot_g|g$|app_mag)/i.test(f));
  const idxPop = fields.findIndex((f) => /pop|cluster|arm|type|flag/i.test(f));

  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);
  const absMags = new Float32Array(count);
  const popBoost = new Float32Array(count);

  const isPc = frame.includes("_pc") && !frame.includes("kpc");
  const isAU = frame.includes("_au");
  const isGalactocentric = frame.startsWith("galactocentric");
  const isEcliptic = frame.includes("ecliptic");
  const isICRS = frame.includes("icrs") || frame.includes("equatorial");

  for (let i = 0; i < count; i++) {
    const base = i * stride;
    let x = f32[base + idxX];
    let y = f32[base + useY];
    let z = f32[base + useZ];

    let sx, sy, sz;
    if (isEcliptic) {
      const unitScale = isAU ? (GALAXY_SCENE_PER_PC / 206264.806247) : (isPc ? GALAXY_SCENE_PER_PC : GALAXY_SCENE_PER_KPC);
      sx = x * unitScale;
      sy = z * unitScale;
      sz = -y * unitScale;
    } else if (isICRS) {
      const unitScale = isPc ? GALAXY_SCENE_PER_PC : GALAXY_SCENE_PER_KPC;
      const xEcl = x;
      const yEcl = y * COS_EPS + z * SIN_EPS;
      const zEcl = -y * SIN_EPS + z * COS_EPS;
      sx = xEcl * unitScale;
      sy = zEcl * unitScale;
      sz = -yEcl * unitScale;
    } else {
      let xgKpc = isPc ? x * 0.001 : x;
      let ygKpc = isPc ? y * 0.001 : y;
      let zgKpc = isPc ? z * 0.001 : z;
      if (isGalactocentric) {
        xgKpc += R0_KPC;
        zgKpc -= Z_SUN_KPC;
      }
      sx = (G0[0] * xgKpc + G1[0] * ygKpc + G2[0] * zgKpc) * GALAXY_SCENE_PER_KPC;
      sy = (G0[1] * xgKpc + G1[1] * ygKpc + G2[1] * zgKpc) * GALAXY_SCENE_PER_KPC;
      sz = (G0[2] * xgKpc + G1[2] * ygKpc + G2[2] * zgKpc) * GALAXY_SCENE_PER_KPC;
    }

    positions[i * 3] = sx;
    positions[i * 3 + 1] = sy;
    positions[i * 3 + 2] = sz;

    const dPc = Math.max(0.1, Math.hypot(sx, sy, sz) / GALAXY_SCENE_PER_PC);
    const bpRp = idxBpRp >= 0 ? f32[base + idxBpRp] : 0.82;
    bpRpToRGB(bpRp, colors, i * 3);

    let mAbs;
    if (idxAbsMag >= 0 && Number.isFinite(f32[base + idxAbsMag])) {
      mAbs = f32[base + idxAbsMag];
    } else if (idxAppMag >= 0 && Number.isFinite(f32[base + idxAppMag])) {
      mAbs = f32[base + idxAppMag] - 5.0 * Math.log10(Math.max(0.1, dPc) / 10.0);
    } else if (stride >= 5 && Number.isFinite(f32[base + 4])) {
      const v4 = f32[base + 4];
      mAbs = v4 > 6.5 && dPc > 100.0 ? v4 - 5.0 * Math.log10(dPc / 10.0) : v4;
    } else {
      mAbs = 1.5;
    }
    absMags[i] = Math.max(-9.5, Math.min(16.5, mAbs));

    const popVal = idxPop >= 0 ? Math.round(f32[base + idxPop]) : 0;
    // Inverse-selection-function weighting for external Galactic view (uGalacticFactor -> 1; zero effect on Earth/Solar skyAlpha):
    // prevents 62k local (<1.5 kpc) + 12k Baade's-Window TAP-cone stars from collapsing into an overexposed spike at the Sun!
    if (popVal === 4 || popVal === 6) {
      popBoost[i] = 1.32;
    } else if (popVal === 2) {
      popBoost[i] = 0.018;
    } else {
      popBoost[i] = 0.004 + 0.36 * Math.min(1.0, Math.pow(dPc / 4500.0, 1.85));
    }
  }

  // Append 28,000 full-360° Galactocentric far-side disk/bulge/halo completion tracers (encoded with negative aPopBoost
  // so they have strictly ZERO alpha from Earth/Solar System uGalacticFactor=0, while completing the far-side Milky Way at 10-80 kpc!)
  const farExtra = 28000;
  const rngFar = mulberry32(20261120);
  const total = count + farExtra;
  const fullPos = new Float32Array(total * 3);
  const fullCol = new Float32Array(total * 3);
  const fullMag = new Float32Array(total);
  const fullBoost = new Float32Array(total);
  fullPos.set(positions, 0);
  fullCol.set(colors, 0);
  fullMag.set(absMags, 0);
  fullBoost.set(popBoost, 0);

  for (let k = 0; k < farExtra; k++) {
    const idx = count + k;
    const u = rngFar();
    let xg, yg, zg, bpRp, mG, bMag;
    if (u < 0.56) {
      const arm = REID_ARMS[Math.floor(rngFar() * REID_ARMS.length)];
      const rTarget = 2.6 + 12.8 * Math.pow(rngFar(), 0.86);
      const armOffset = (rngFar() < 0.25 ? Math.PI : 0.0) + (rngFar() - 0.5) * 0.42;
      const beta = arm[0] - Math.log(rTarget / arm[1]) / arm[2] + armOffset;
      const radialSpread = (rngFar() + rngFar() + rngFar() - 1.5) * arm[3] * 1.85;
      const rCyl = Math.max(2.2, Math.min(16.8, rTarget + radialSpread));
      xg = R0_KPC - rCyl * Math.cos(beta);
      yg = rCyl * Math.sin(beta);
      zg = -Z_SUN_KPC + (rngFar() + rngFar() - 1.0) * (0.18 + 0.014 * rCyl);
      const isOB = rngFar() < 0.40;
      bpRp = isOB ? -0.32 + 0.55 * rngFar() : 0.50 + 1.45 * rngFar();
      mG = isOB ? -3.8 + 2.8 * rngFar() : -0.8 + 3.0 * rngFar();
      bMag = isOB ? 0.88 : 0.64;
    } else if (u < 0.72) {
      // Smooth underlying exponential stellar disk (scale length 3.2 kpc) connecting the spiral arms seamlessly
      const rDisk = -3.2 * Math.log(Math.max(1e-4, 1.0 - 0.985 * rngFar()));
      const phi = rngFar() * TWO_PI;
      xg = R0_KPC - rDisk * Math.cos(phi);
      yg = rDisk * Math.sin(phi);
      zg = -Z_SUN_KPC + (rngFar() + rngFar() - 1.0) * 0.34;
      bpRp = 0.55 + 1.35 * rngFar();
      mG = -1.2 + 2.8 * rngFar();
      bMag = 0.58;
    } else if (u < 0.91) {
      const rBulge = 3.5 * Math.pow(rngFar(), 0.74);
      const ang = rngFar() * TWO_PI;
      const xBar = rBulge * Math.cos(ang);
      const yBar = rBulge * 0.42 * Math.sin(ang);
      const cB = 0.8910, sB = 0.4540;
      xg = R0_KPC - xBar * cB + yBar * sB;
      yg = xBar * sB + yBar * cB;
      zg = -Z_SUN_KPC + (rngFar() + rngFar() - 1.0) * (0.72 * Math.exp(-rBulge / 3.4) + 0.22);
      bpRp = 1.15 + 1.05 * rngFar();
      mG = -2.1 + 2.3 * rngFar();
      bMag = 0.80;
    } else {
      const rHalo = 4.0 + 26.0 * Math.pow(rngFar(), 1.2);
      const phi = rngFar() * TWO_PI;
      const cosT = 2.0 * rngFar() - 1.0;
      const sinT = Math.sqrt(Math.max(0.0, 1.0 - cosT * cosT));
      xg = R0_KPC + rHalo * sinT * Math.cos(phi);
      yg = rHalo * sinT * Math.sin(phi);
      zg = rHalo * cosT * 0.76;
      bpRp = 0.68 + 0.85 * rngFar();
      mG = -2.2 + 2.0 * rngFar();
      bMag = 0.58;
    }
    helioGalacticKpcToScene(xg, yg, zg, fullPos, idx * 3);
    bpRpToRGB(bpRp, fullCol, idx * 3);
    fullMag[idx] = mG;
    fullBoost[idx] = -bMag;
  }

  return { positions: fullPos, colors: fullCol, absMags: fullMag, popBoost: fullBoost, count };
}

export function createGalaxyLayer(options = {}) {
  const group = new THREE.Group();
  group.name = "milkyWayGalaxyLayer";

  // 1. Gaia DR3 3D Starfield (seeded immediately, upgraded atomically via loadData / loadFromUrls)
  const seed = buildProceduralSeedStars(options.seedStarCount || 42000);
  const starGeom = new THREE.BufferGeometry();
  starGeom.setAttribute("position", new THREE.BufferAttribute(seed.positions, 3));
  starGeom.setAttribute("aColor", new THREE.BufferAttribute(seed.colors, 3));
  starGeom.setAttribute("aAbsMag", new THREE.BufferAttribute(seed.absMags, 1));
  starGeom.setAttribute("aPopBoost", new THREE.BufferAttribute(seed.popBoost, 1));
  starGeom.boundingSphere = new THREE.Sphere(new THREE.Vector3(0, 0, 0), 2.5e7);

  const starUniforms = {
    uPixelRatio: { value: typeof window !== "undefined" ? Math.min(window.devicePixelRatio || 1, 2) : 1.0 },
    uGalacticFactor: { value: 0.0 },
    uOpacity: { value: 1.0 }
  };

  const starMat = new THREE.ShaderMaterial({
    uniforms: starUniforms,
    vertexShader: STAR_VERTEX_SHADER,
    fragmentShader: STAR_FRAGMENT_SHADER,
    transparent: true,
    depthTest: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending
  });

  const starPoints = new THREE.Points(starGeom, starMat);
  starPoints.frustumCulled = false;
  starPoints.renderOrder = 2;
  group.add(starPoints);

  // 2. Galactocentric Volumetric Gas, Dust, Bar, Spiral Arms & Fermi Bubbles (centered on Sgr A*)
  const gasGroup = new THREE.Group();
  gasGroup.name = "milkyWayVolumetricGas";
  group.add(gasGroup);

  const mwCenterNode = new THREE.Group();
  const sgrScene = [0, 0, 0];
  helioGalacticKpcToScene(R0_KPC, 0.0, -Z_SUN_KPC, sgrScene, 0);
  mwCenterNode.position.set(sgrScene[0], sgrScene[1], sgrScene[2]);

  // Right-handed Galactocentric kpc basis: e_x = +G0, e_y = +G2 (NGP), e_z = -G1 (det = +1)
  const rotMat4 = new THREE.Matrix4().makeBasis(
    new THREE.Vector3(G0[0], G0[1], G0[2]),
    new THREE.Vector3(G2[0], G2[1], G2[2]),
    new THREE.Vector3(-G1[0], -G1[1], -G1[2])
  );
  mwCenterNode.quaternion.setFromRotationMatrix(rotMat4);
  mwCenterNode.scale.setScalar(GALAXY_SCENE_PER_KPC);
  gasGroup.add(mwCenterNode);

  const diskRadiusKpc = 18.5;
  const diskHalfHeightKpc = 2.15;
  const slabGeom = new THREE.CylinderGeometry(diskRadiusKpc, diskRadiusKpc, diskHalfHeightKpc * 2.0, 72, 1, false);
  const slabUniforms = {
    uCamLocalKpc: { value: new THREE.Vector3(-R0_KPC, Z_SUN_KPC, 0.0) },
    uTime: { value: 0.0 },
    uOpacity: { value: 0.0 },
    uDiskRadiusKpc: { value: diskRadiusKpc },
    uDiskHalfHeightKpc: { value: diskHalfHeightKpc }
  };

  const slabMat = new THREE.ShaderMaterial({
    uniforms: slabUniforms,
    vertexShader: DISK_SLAB_VERTEX_SHADER,
    fragmentShader: DISK_SLAB_FRAGMENT_SHADER,
    side: THREE.BackSide,
    transparent: true,
    depthTest: true,
    depthWrite: false,
    blending: THREE.CustomBlending,
    blendEquation: THREE.AddEquation,
    blendSrc: THREE.OneFactor,
    blendDst: THREE.OneMinusSrcAlphaFactor,
    blendEquationAlpha: THREE.AddEquation,
    blendSrcAlpha: THREE.ZeroFactor,
    blendDstAlpha: THREE.OneFactor
  });

  const slabMesh = new THREE.Mesh(slabGeom, slabMat);
  slabMesh.frustumCulled = false;
  slabMesh.renderOrder = 4;
  mwCenterNode.add(slabMesh);

  // Bipolar Gamma-Ray / X-Ray Fermi Bubbles (±9.5 kpc above & below Sgr A*)
  const fermiGeom = new THREE.SphereGeometry(1.0, 32, 24);
  const fermiUniforms = { uOpacity: { value: 0.0 } };
  const fermiMat = new THREE.ShaderMaterial({
    uniforms: fermiUniforms,
    vertexShader: FERMI_VERTEX_SHADER,
    fragmentShader: FERMI_FRAGMENT_SHADER,
    side: THREE.FrontSide,
    transparent: true,
    depthTest: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending
  });
  const fermiNorth = new THREE.Mesh(fermiGeom, fermiMat);
  fermiNorth.scale.set(3.8, 4.75, 3.8);
  fermiNorth.position.set(0, 4.75, 0);
  fermiNorth.renderOrder = 4;
  const fermiSouth = new THREE.Mesh(fermiGeom, fermiMat);
  fermiSouth.scale.set(3.8, 4.75, 3.8);
  fermiSouth.position.set(0, -4.75, 0);
  fermiSouth.renderOrder = 4;
  fermiNorth.frustumCulled = false;
  fermiSouth.frustumCulled = false;
  mwCenterNode.add(fermiNorth, fermiSouth);

  // 3D HII Star-Forming Cloud Knots + LMC/SMC Nebulae
  const cloudLayer = buildVolumetricCloudPuffs();
  gasGroup.add(cloudLayer.points);

  const disposables = [
    starGeom,
    starMat,
    slabGeom,
    slabMat,
    fermiGeom,
    fermiMat,
    cloudLayer.geom,
    cloudLayer.mat
  ];

  const _camKpc = new THREE.Vector3();
  let masterOpacity = 1.0;
  let gasEnabled = options.showGas !== false;
  let simTime = 0.0;
  let catalogMetadata = null;
  let loadedStarCount = seed.count;

  function loadData(arrayBuffer, catalogJson = null) {
    if (catalogJson) catalogMetadata = catalogJson;
    if (!arrayBuffer) return loadedStarCount;
    const parsed = parseBinaryStarsBuffer(arrayBuffer, catalogJson);
    if (!parsed) return loadedStarCount;

    starGeom.setAttribute("position", new THREE.BufferAttribute(parsed.positions, 3));
    starGeom.setAttribute("aColor", new THREE.BufferAttribute(parsed.colors, 3));
    starGeom.setAttribute("aAbsMag", new THREE.BufferAttribute(parsed.absMags, 1));
    starGeom.setAttribute("aPopBoost", new THREE.BufferAttribute(parsed.popBoost, 1));
    starGeom.computeBoundingSphere();
    starGeom.boundingSphere.radius = Math.max(2.5e7, starGeom.boundingSphere.radius);
    loadedStarCount = parsed.count;
    return loadedStarCount;
  }

  async function loadFromUrls(
    binUrl = "./data/galactic_stars.bin",
    jsonUrl = "./data/galactic_catalog.json"
  ) {
    try {
      const [binRes, jsonRes] = await Promise.all([
        fetch(binUrl),
        jsonUrl ? fetch(jsonUrl).catch(() => null) : Promise.resolve(null)
      ]);
      const json = jsonRes && jsonRes.ok ? await jsonRes.json() : null;
      if (binRes && binRes.ok) {
        const buf = await binRes.arrayBuffer();
        loadData(buf, json);
      } else if (json) {
        catalogMetadata = json;
      }
      return { starCount: loadedStarCount, catalog: catalogMetadata };
    } catch (_) {
      return { starCount: loadedStarCount, catalog: catalogMetadata };
    }
  }

  function update(dt = 0.016, camera = null, scaleInfo = null) {
    simTime += Math.min(0.1, Math.max(0.0, Number(dt) || 0.016));
    slabUniforms.uTime.value = simTime;

    if (typeof window !== "undefined") {
      starUniforms.uPixelRatio.value = Math.min(window.devicePixelRatio || 1, 2);
      cloudLayer.uniforms.uViewportH.value = window.innerHeight || 900;
    }

    let camDistScene = scaleInfo?.cameraDistScene;
    if (camDistScene === undefined && camera) {
      camDistScene = camera.position.length();
    }
    camDistScene = Number(camDistScene || 60.0);

    const galFactor = scaleInfo?.galacticFactor !== undefined
      ? Math.max(0.0, Math.min(1.0, Number(scaleInfo.galacticFactor)))
      : Math.max(0.0, Math.min(1.0, (camDistScene - 140.0) / 1800.0));

    starUniforms.uGalacticFactor.value = galFactor;
    starUniforms.uOpacity.value = masterOpacity;

    // Keep Solar System & Oort Cloud (< 320 scene units in Log mode) crystal clear; fade in volumetric gas smoothly beyond Oort Cloud
    const insideTrueScaleSolar =
      scaleInfo?.logBlend !== undefined &&
      Number(scaleInfo.logBlend) < 0.5 &&
      scaleInfo?.cameraDistAU !== undefined &&
      Number(scaleInfo.cameraDistAU) < 110000.0;
    const gasRamp = insideTrueScaleSolar ? 0.0 : Math.max(0.0, Math.min(1.0, (camDistScene - 320.0) / 2400.0));
    const effectiveGasOpacity = gasEnabled ? Math.max(galFactor * 0.92, gasRamp) * masterOpacity : 0.0;

    slabUniforms.uOpacity.value = effectiveGasOpacity;
    fermiUniforms.uOpacity.value = effectiveGasOpacity * Math.max(0.0, Math.min(1.0, (camDistScene - 18000.0) / 160000.0));
    cloudLayer.uniforms.uOpacity.value = effectiveGasOpacity;
    gasGroup.visible = effectiveGasOpacity > 0.003;

    if (camera && gasGroup.visible) {
      slabMesh.updateWorldMatrix(true, false);
      _camKpc.copy(camera.position);
      slabMesh.worldToLocal(_camKpc);
      slabUniforms.uCamLocalKpc.value.copy(_camKpc);
    }
  }

  function setVisible(visible) {
    group.visible = Boolean(visible);
  }

  function setGasVisible(visible) {
    gasEnabled = Boolean(visible);
    if (!gasEnabled) gasGroup.visible = false;
  }

  function setOpacity(alpha) {
    masterOpacity = Math.max(0.0, Math.min(1.0, Number(alpha)));
  }

  function getCatalog() {
    return catalogMetadata;
  }

  function dispose() {
    for (const d of disposables) {
      if (d && typeof d.dispose === "function") d.dispose();
    }
  }

  return {
    group,
    starPoints,
    gasGroup,
    loadData,
    loadFromUrls,
    update,
    setVisible,
    setGasVisible,
    setOpacity,
    getCatalog,
    dispose
  };
}
