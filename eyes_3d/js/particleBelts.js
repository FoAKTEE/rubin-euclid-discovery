// GPU-Accelerated Particle Belts (Main Belt, Trojans, Kuiper Disk, Inner Hills Torus, 85,000 AU Outer Oort Shell)
// + Reference Distance Rings (the Neptune 12:1 MMR ring at 157.62 AU belongs to the opt-in survey
// layer) + Galactic Plane Blind-Spot Band. Main Belt, Trojans and Kuiper Belt move on Keplerian orbits.

import * as THREE from "../vendor/three.module.js";
import { CSS2DObject } from "../vendor/CSS2DRenderer.js";
import {
  DEG2RAD,
  TWO_PI,
  GAUSS_K,
  LOG_R0,
  LOG_S0,
  DISCOVERY_EPOCH_JD,
  GALACTIC_TO_SCENE_MAT3,
  mapRadiusAU,
  solveEllipticalKepler,
  getPlanetMeanLongitudeRad,
  getNBodyIndex,
  evaluateNBodyHeliocentricEclipticAU,
  evaluateNBodyHeliocentricAtFrameJD,
  FRAME_CLOCK
} from "./orbitalMechanics.js?v=20261124_v33";
import { tr } from "./i18n.js?v=20261124_v33";
import { BELT_PALETTES, RING_COLORS, CATEGORY_COLORS, temperatureToRGB } from "./colorSystem.js?v=20261124_v33";

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

function keplerTupleToSceneAU(tuple6) {
  const [a, eRaw, incDeg, OmDeg, omDeg, M0Deg] = tuple6;
  const e = Math.min(0.999, Math.max(0, eRaw));
  const inc = incDeg * DEG2RAD;
  const Om = OmDeg * DEG2RAD;
  const om = omDeg * DEG2RAD;
  const E = solveEllipticalKepler(M0Deg * DEG2RAD, e);

  const xOrb = a * (Math.cos(E) - e);
  const yOrb = a * Math.sqrt(Math.max(0, 1 - e * e)) * Math.sin(E);

  const cO = Math.cos(Om), sO = Math.sin(Om);
  const co = Math.cos(om), so = Math.sin(om);
  const ci = Math.cos(inc), si = Math.sin(inc);

  const xE = (cO * co - sO * so * ci) * xOrb + (-cO * so - sO * co * ci) * yOrb;
  const yE = (sO * co + cO * so * ci) * xOrb + (-sO * so + cO * co * ci) * yOrb;
  const zE = (so * si) * xOrb + (co * si) * yOrb;
  return [xE, zE, -yE];
}

function createGPUBeltPoints(positionsAU, colorsRGB, sizes, baseOpacity = 0.65) {
  const geom = new THREE.BufferGeometry();
  geom.setAttribute("position", new THREE.Float32BufferAttribute(positionsAU, 3));
  geom.setAttribute("aColor", new THREE.Float32BufferAttribute(colorsRGB, 3));
  geom.setAttribute("aSize", new THREE.Float32BufferAttribute(sizes, 1));
  // Large bounding sphere so Three.js never frustum-culls when morphing True <-> Log scale
  geom.boundingSphere = new THREE.Sphere(new THREE.Vector3(0, 0, 0), 200000);

  const uniforms = {
    uLogBlend: { value: 1.0 },
    uOpacity: { value: baseOpacity },
    uPixelRatio: { value: Math.min(window.devicePixelRatio || 1, 2) }
  };

  const mat = new THREE.ShaderMaterial({
    uniforms,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    vertexShader: `
      #include <common>
      #include <logdepthbuf_pars_vertex>
      attribute vec3 aColor;
      attribute float aSize;
      uniform float uLogBlend;
      uniform float uPixelRatio;
      varying vec3 vColor;
      void main() {
        vColor = aColor;
        float r = length(position);
        vec3 dir = r > 1e-8 ? position / r : vec3(0.0);
        float rLog = ${LOG_S0.toFixed(1)} * log(1.0 + r / ${LOG_R0.toFixed(1)});
        float rFinal = mix(r, rLog, uLogBlend);
        vec3 mappedPos = dir * rFinal;
        vec4 mvPosition = modelViewMatrix * vec4(mappedPos, 1.0);
        gl_Position = projectionMatrix * mvPosition;
        gl_PointSize = clamp(aSize * uPixelRatio, 1.1, 6.5);
        #include <logdepthbuf_vertex>
      }
    `,
    fragmentShader: `
      #include <common>
      #include <logdepthbuf_pars_fragment>
      uniform float uOpacity;
      varying vec3 vColor;
      void main() {
        vec2 uv = gl_PointCoord - vec2(0.5);
        float d2 = dot(uv, uv);
        if (d2 > 0.25) discard;
        #include <logdepthbuf_fragment>
        float alpha = exp(-d2 * 13.5) * uOpacity;
        gl_FragColor = vec4(vColor, alpha);
      }
    `
  });

  const pts = new THREE.Points(geom, mat);
  pts.frustumCulled = false;
  pts.userData.uniforms = uniforms;
  pts.userData.baseOpacity = baseOpacity;
  return pts;
}

// Belt whose particles move on their own Keplerian ellipses in the vertex shader. Each particle
// carries (a, e, i, Omega) and (omega, M0, n, trojan flag). Ordinary particles advance their mean
// anomaly by n * uDeltaDays; Trojans advance by the change of Jupiter's heliocentric longitude
// instead, so both swarms keep their 60-degree lead and lag for any date.
function createKeplerBeltPoints(orbA, orbB, colorsRGB, sizes, baseOpacity = 0.65) {
  const count = sizes.length;
  const geom = new THREE.BufferGeometry();
  geom.setAttribute("position", new THREE.Float32BufferAttribute(new Float32Array(count * 3), 3));
  geom.setAttribute("aOrbA", new THREE.Float32BufferAttribute(orbA, 4));
  geom.setAttribute("aOrbB", new THREE.Float32BufferAttribute(orbB, 4));
  geom.setAttribute("aColor", new THREE.Float32BufferAttribute(colorsRGB, 3));
  geom.setAttribute("aSize", new THREE.Float32BufferAttribute(sizes, 1));
  geom.boundingSphere = new THREE.Sphere(new THREE.Vector3(0, 0, 0), 200000);

  const uniforms = {
    uLogBlend: { value: 1.0 },
    uOpacity: { value: baseOpacity },
    uPixelRatio: { value: Math.min(window.devicePixelRatio || 1, 2) },
    uDeltaDays: { value: 0.0 },
    uJupiterDeltaLonRad: { value: 0.0 }
  };

  const mat = new THREE.ShaderMaterial({
    uniforms,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    vertexShader: `
      #include <common>
      #include <logdepthbuf_pars_vertex>
      attribute vec4 aOrbA;
      attribute vec4 aOrbB;
      attribute vec3 aColor;
      attribute float aSize;
      uniform float uLogBlend;
      uniform float uPixelRatio;
      uniform float uDeltaDays;
      uniform float uJupiterDeltaLonRad;
      varying vec3 vColor;
      void main() {
        vColor = aColor;
        float a = aOrbA.x;
        float e = aOrbA.y;
        float M = aOrbB.y + mix(aOrbB.z * uDeltaDays, uJupiterDeltaLonRad, aOrbB.w);
        M = mod(M, 6.28318530718);
        if (M > 3.14159265359) M -= 6.28318530718;
        float E = M + e * sin(M) * (1.0 + e * cos(M));
        for (int it = 0; it < 6; it++) {
          E -= (E - e * sin(E) - M) / max(0.05, 1.0 - e * cos(E));
        }
        float xo = a * (cos(E) - e);
        float yo = a * sqrt(max(0.0, 1.0 - e * e)) * sin(E);
        float cO = cos(aOrbA.w), sO = sin(aOrbA.w);
        float co = cos(aOrbB.x), so = sin(aOrbB.x);
        float ci = cos(aOrbA.z), si = sin(aOrbA.z);
        float xE = (cO * co - sO * so * ci) * xo + (-cO * so - sO * co * ci) * yo;
        float yE = (sO * co + cO * so * ci) * xo + (-sO * so + cO * co * ci) * yo;
        float zE = (so * si) * xo + (co * si) * yo;
        vec3 posAU = vec3(xE, zE, -yE);
        float r = length(posAU);
        vec3 dir = r > 1e-8 ? posAU / r : vec3(0.0);
        float rLog = ${LOG_S0.toFixed(1)} * log(1.0 + r / ${LOG_R0.toFixed(1)});
        vec4 mvPosition = modelViewMatrix * vec4(dir * mix(r, rLog, uLogBlend), 1.0);
        gl_Position = projectionMatrix * mvPosition;
        gl_PointSize = clamp(aSize * uPixelRatio, 1.1, 6.5);
        #include <logdepthbuf_vertex>
      }
    `,
    fragmentShader: `
      #include <common>
      #include <logdepthbuf_pars_fragment>
      uniform float uOpacity;
      varying vec3 vColor;
      void main() {
        vec2 uv = gl_PointCoord - vec2(0.5);
        float d2 = dot(uv, uv);
        if (d2 > 0.25) discard;
        #include <logdepthbuf_fragment>
        float alpha = exp(-d2 * 13.5) * uOpacity;
        gl_FragColor = vec4(vColor, alpha);
      }
    `
  });

  const pts = new THREE.Points(geom, mat);
  pts.frustumCulled = false;
  pts.userData.uniforms = uniforms;
  pts.userData.baseOpacity = baseOpacity;
  pts.userData.isKeplerian = true;
  return pts;
}

export function buildAllParticleBelts(catalogBelts) {
  const rng = mulberry32(20250818);
  const group = new THREE.Group();
  group.name = "particleBelts";

  // 1. Extragalactic Deep-Field Backdrop (outside 50 kpc LMC / Milky Way shell)
  let skyBackdrop = null;
  {
    const nStars = 4500;
    const pos = new Float32Array(nStars * 3);
    const col = new Float32Array(nStars * 3);
    const geom = new THREE.BufferGeometry();
    for (let i = 0; i < nStars; i++) {
      const u = rng() * TWO_PI;
      const v = Math.acos(2 * rng() - 1);
      const R = 42000000 + rng() * 10000000;
      pos[i * 3] = R * Math.sin(v) * Math.cos(u);
      pos[i * 3 + 1] = R * Math.cos(v);
      pos[i * 3 + 2] = R * Math.sin(v) * Math.sin(u);
      const temp = rng();
      const c = temperatureToRGB(temp < 0.2 ? 14000.0 : temp < 0.75 ? 7600.0 : 4300.0, [0, 0, 0]);
      const br = 0.25 + 0.55 * Math.pow(rng(), 2.2);
      col[i * 3] = c[0] * br;
      col[i * 3 + 1] = c[1] * br;
      col[i * 3 + 2] = c[2] * br;
    }
    geom.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    geom.setAttribute("color", new THREE.BufferAttribute(col, 3));
    const starMat = new THREE.PointsMaterial({
      size: 1.3,
      sizeAttenuation: false,
      vertexColors: true,
      transparent: true,
      opacity: 0.55,
      depthWrite: false
    });
    skyBackdrop = new THREE.Points(geom, starMat);
    skyBackdrop.frustumCulled = false;
    group.add(skyBackdrop);
  }

  // Helper to combine catalog Keplerian tuples + rich volumetric cloud fill
  const makeBelt = (tuples, extraCount, generatorFn, palette, baseSize, baseOpacity) => {
    const list = Array.isArray(tuples) ? tuples : [];
    const total = list.length + extraCount;
    const pos = new Float32Array(total * 3);
    const col = new Float32Array(total * 3);
    const siz = new Float32Array(total);

    let idx = 0;
    for (const t6 of list) {
      const [x, y, z] = keplerTupleToSceneAU(t6);
      pos[idx * 3] = x;
      pos[idx * 3 + 1] = y;
      pos[idx * 3 + 2] = z;
      const c = palette(rng());
      col[idx * 3] = c[0];
      col[idx * 3 + 1] = c[1];
      col[idx * 3 + 2] = c[2];
      siz[idx] = baseSize * (0.85 + rng() * 0.75);
      idx++;
    }
    for (let k = 0; k < extraCount; k++) {
      const [x, y, z] = generatorFn(rng);
      pos[idx * 3] = x;
      pos[idx * 3 + 1] = y;
      pos[idx * 3 + 2] = z;
      const c = palette(rng());
      col[idx * 3] = c[0];
      col[idx * 3 + 1] = c[1];
      col[idx * 3 + 2] = c[2];
      siz[idx] = baseSize * (0.65 + rng() * 0.7);
      idx++;
    }
    return createGPUBeltPoints(pos, col, siz, baseOpacity);
  };

  const pick = (pal, t) => {
    const c = t < 0.5 ? pal[0] : pal[1];
    const k = 0.86 + 0.28 * ((t * 7.31) % 1.0);
    return [Math.min(1.0, c[0] * k), Math.min(1.0, c[1] * k), Math.min(1.0, c[2] * k)];
  };

  // Helper for belts in Keplerian motion: catalogue tuples [a, e, i, Omega, omega, M0] (degrees)
  // plus generated tuples of the same form. tuple[6] = 1 marks a Jupiter Trojan.
  const makeKeplerBelt = (tuples, extraCount, tupleFn, paletteFn, baseSize, baseOpacity) => {
    const list = Array.isArray(tuples) ? tuples : [];
    const total = list.length + extraCount;
    const orbA = new Float32Array(total * 4);
    const orbB = new Float32Array(total * 4);
    const col = new Float32Array(total * 3);
    const siz = new Float32Array(total);
    for (let idx = 0; idx < total; idx++) {
      const isCat = idx < list.length;
      const t6 = isCat ? list[idx] : tupleFn(rng);
      const a = Math.max(0.05, t6[0]);
      orbA[idx * 4] = a;
      orbA[idx * 4 + 1] = Math.min(0.97, Math.max(0.0, t6[1]));
      orbA[idx * 4 + 2] = t6[2] * DEG2RAD;
      orbA[idx * 4 + 3] = t6[3] * DEG2RAD;
      orbB[idx * 4] = t6[4] * DEG2RAD;
      orbB[idx * 4 + 1] = t6[5] * DEG2RAD;
      orbB[idx * 4 + 2] = GAUSS_K / (a * Math.sqrt(a));
      orbB[idx * 4 + 3] = t6[6] ? 1.0 : 0.0;
      const c = paletteFn(rng(), Boolean(t6[6]));
      col[idx * 3] = c[0];
      col[idx * 3 + 1] = c[1];
      col[idx * 3 + 2] = c[2];
      siz[idx] = baseSize * (isCat ? 0.85 + rng() * 0.75 : 0.65 + rng() * 0.7);
    }
    return createKeplerBeltPoints(orbA, orbB, col, siz, baseOpacity);
  };
  const tri = (r) => Math.abs(r() + r() + r() - 1.5);

  // 2. Main Asteroid Belt (2.1 - 3.3 AU) + Jupiter Trojans. The L4/L5 points lead and trail the
  // planet itself by 60 degrees, so the camps are centred on Jupiter's true heliocentric longitude
  // from the N-body solution and are carried along with it in the shader. The catalogue tuples
  // were drawn around Jupiter's mean longitude; they are shifted by the difference (the equation
  // of the centre at the epoch).
  const jupXYZ = new Float64Array(3);
  const JUPITER_NBODY_INDEX = getNBodyIndex("JUPITER");
  const jupiterTrueLonRad = (jd) => {
    evaluateNBodyHeliocentricEclipticAU("JUPITER", jd, jupXYZ);
    return Math.atan2(jupXYZ[1], jupXYZ[0]);
  };
  const jupLonRad0 = jupiterTrueLonRad(DISCOVERY_EPOCH_JD);
  const jupLonDeg0 = jupLonRad0 / DEG2RAD;
  const meanToTrueDeg = jupLonDeg0 - getPlanetMeanLongitudeRad("JUPITER", DISCOVERY_EPOCH_JD) / DEG2RAD;
  const catTrojans = (catalogBelts?.jupiter_trojans || []).map((t) => [t[0], t[1], t[2], t[3], t[4], t[5] + meanToTrueDeg, 1]);
  const mainAndTrojans = makeKeplerBelt(
    [...(catalogBelts?.main_belt || []), ...catTrojans],
    5500,
    (r) => {
      const Om = r() * 360.0;
      const om = r() * 360.0;
      if (r() < 0.82) {
        const a = 2.12 + Math.pow(r(), 0.92) * 1.16;
        return [a, 0.02 + 0.2 * r() * r(), tri(r) * 13.0, Om, om, r() * 360.0, 0];
      }
      const lam = jupLonDeg0 + (r() < 0.5 ? 60.0 : -60.0) + (r() - 0.5) * 31.5;
      return [5.2 + (r() - 0.5) * 0.4, 0.01 + 0.11 * r(), tri(r) * 26.0, Om, om, lam - Om - om, 1];
    },
    (t, isTrojan) => pick(isTrojan ? BELT_PALETTES.trojans : BELT_PALETTES.mainBelt, t),
    2.3,
    0.62
  );

  // 3. Classical Cold + Hot/Scattered Kuiper Belt (30 - 125 AU)
  const kuiperCloud = makeKeplerBelt(
    catalogBelts?.kuiper_disk,
    8500,
    (r) => {
      const Om = r() * 360.0;
      const om = r() * 360.0;
      const M0 = r() * 360.0;
      if (r() < 0.32) {
        const a = 40.0 + Math.pow(r(), 1.7) * 82.0;
        const q = 31.5 + r() * (Math.min(46.0, a * 0.94) - 31.5);
        return [a, Math.max(0.0, 1.0 - q / a), tri(r) * 34.0, Om, om, M0, 0];
      }
      return [38.5 + r() * 9.8, 0.01 + 0.1 * r(), tri(r) * 8.0, Om, om, M0, 0];
    },
    (t) => pick(BELT_PALETTES.kuiper, t),
    2.4,
    0.68
  );

  // 4. Hills Inner Oort Torus (2,000 - 20,000 AU flared pancake torus!)
  const hillsInnerOort = makeBelt(
    catalogBelts?.inner_oort_hills,
    9500,
    (r) => {
      const u = r();
      const rad = 2000.0 * Math.pow(10.0, u); // Log-uniform 2,000 -> 20,000 AU
      const ang = r() * TWO_PI;
      // Flared torus: thicker vertical aspect ratio as radius approaches 20,000 AU
      const aspect = 0.24 + 0.48 * u;
      const sinLat = (r() * 2 - 1) * aspect * Math.sin(r() * Math.PI * 0.5);
      const cosLat = Math.sqrt(Math.max(0.01, 1.0 - sinLat * sinLat));
      return [rad * cosLat * Math.cos(ang), rad * sinLat, -rad * cosLat * Math.sin(ang)];
    },
    (t) => pick(BELT_PALETTES.hillsOort, t),
    2.1,
    0.44
  );

  // 5. Spherical Outer Oort Cloud Shell (20,000 - 85,000 AU!)
  const outerOortShell = makeBelt(
    catalogBelts?.outer_oort_shell,
    14000,
    (r) => {
      const u = r();
      const rad = 20000.0 * Math.pow(85000.0 / 20000.0, u); // 20,000 -> 85,000 AU
      const phi = r() * TWO_PI;
      const cosTheta = 2.0 * r() - 1.0;
      const sinTheta = Math.sqrt(Math.max(0.0, 1.0 - cosTheta * cosTheta));
      return [rad * sinTheta * Math.cos(phi), rad * cosTheta, -rad * sinTheta * Math.sin(phi)];
    },
    (t) => pick(BELT_PALETTES.outerOort, t),
    2.15,
    0.46
  );

  group.add(mainAndTrojans, kuiperCloud, hillsInnerOort, outerOortShell);

  const beltNodes = {
    mainBelt: mainAndTrojans,
    kuiper: kuiperCloud,
    hillsOort: hillsInnerOort,
    outerOort: outerOortShell
  };

  // Per-frame clock of the Keplerian belts for the date in FRAME_CLOCK[0]: days since the catalogue
  // epoch and the change of Jupiter's heliocentric longitude since then. Two uniform writes per
  // belt, no allocation.
  function updateBeltDynamics() {
    const dDays = FRAME_CLOCK[0] - DISCOVERY_EPOCH_JD;
    evaluateNBodyHeliocentricAtFrameJD(JUPITER_NBODY_INDEX, false, jupXYZ);
    const dLon = Math.atan2(jupXYZ[1], jupXYZ[0]) - jupLonRad0;
    mainAndTrojans.userData.uniforms.uDeltaDays.value = dDays;
    mainAndTrojans.userData.uniforms.uJupiterDeltaLonRad.value = dLon;
    kuiperCloud.userData.uniforms.uDeltaDays.value = dDays;
    kuiperCloud.userData.uniforms.uJupiterDeltaLonRad.value = dLon;
  }

  return { group, beltNodes, skyBackdrop, updateBeltDynamics };
}

export function buildReferenceOverlays(initialLang) {
  const overlayGroup = new THREE.Group();
  overlayGroup.name = "referenceOverlays";

  // 1. Ecliptic Distance Rings + Highlighted Neptune 12:1 MMR Ring at 157.62 AU!
  const ringsGroup = new THREE.Group();
  const ringDefs = [
    // labelAngle (rad, counter-clockwise from +X in the ecliptic) staggers the labels around the
    // rings: in the log scale the 30 and 50 AU rings are close together, and labels at one common
    // angle would sit on top of each other.
    { rAU: 1.0, key: "ringLabel1AU", color: RING_COLORS.au1, dashed: false, opacity: 0.40, labelAngle: 0.42 },
    { rAU: 5.2, key: "ringLabel5AU", color: RING_COLORS.jupiter, dashed: false, opacity: 0.36, labelAngle: 1.35 },
    { rAU: 30.1, key: "ringLabel30AU", color: RING_COLORS.neptune, dashed: false, opacity: 0.42, labelAngle: 2.45 },
    { rAU: 50.0, key: "ringLabel50AU", color: RING_COLORS.kuiperCliff, dashed: true, opacity: 0.42, labelAngle: 3.75 },
    { rAU: 157.62, key: "ringLabelMMR", color: RING_COLORS.mmr, dashed: true, opacity: 0.78, isMMR: true, labelAngle: 5.2 },
    { rAU: 1000.0, key: "ringLabel1000AU", color: RING_COLORS.sednoid, dashed: true, opacity: 0.36, labelAngle: 0.95 },
    { rAU: 10000.0, key: "ringLabel10000AU", color: RING_COLORS.hills, dashed: true, opacity: 0.38, labelAngle: 2.2 },
    { rAU: 50000.0, key: "ringLabel50000AU", color: RING_COLORS.outerOort, dashed: true, opacity: 0.40, labelAngle: 3.5 }
  ];


  const ringEntries = [];
  const unitCirclePts = [];
  const segs = 192;
  for (let i = 0; i <= segs; i++) {
    const a = (TWO_PI * i) / segs;
    unitCirclePts.push(new THREE.Vector3(Math.cos(a), 0, -Math.sin(a)));
  }

  for (const def of ringDefs) {
    const geom = new THREE.BufferGeometry().setFromPoints(unitCirclePts);
    const mat = def.dashed
      ? new THREE.LineDashedMaterial({
        color: def.color,
        transparent: true,
        opacity: def.opacity,
        dashSize: def.isMMR ? 0.08 : 0.06,
        gapSize: 0.045,
        depthWrite: false
      })
      : new THREE.LineBasicMaterial({
        color: def.color,
        transparent: true,
        opacity: def.opacity,
        depthWrite: false
      });

    const line = new THREE.Line(geom, mat);
    if (def.dashed) line.computeLineDistances();
    ringsGroup.add(line);

    const el = document.createElement("div");
    el.className = def.isMMR ? "ring-label ring-label-mmr" : "ring-label";
    el.textContent = tr(initialLang, def.key);
    const labelObj = new CSS2DObject(el);
    labelObj.userData = { angle: def.labelAngle, isRingLabel: true };
    ringsGroup.add(labelObj);

    ringEntries.push({ def, line, el, labelObj });
  }
  // The 12:1 resonance ring annotates a survey candidate, so it is shown only with that layer.
  let discoveriesVisible = false;
  function setDiscoveriesVisible(flag) {
    discoveriesVisible = Boolean(flag);
    for (const entry of ringEntries) {
      if (entry.def.isMMR) {
        entry.line.visible = discoveriesVisible;
        if (!discoveriesVisible) entry.labelObj.visible = false;
      }
    }
  }
  setDiscoveriesVisible(false);
  overlayGroup.add(ringsGroup);

  // 2. Galactic Plane Blind-Spot Band (|b| <= 15 deg inclined 60.19 deg to J2000 Ecliptic, node = 266.84 deg)
  const galacticGroup = new THREE.Group();
  {
    const cylGeom = new THREE.CylinderGeometry(1.0, 1.0, 0.535, 96, 1, true); // 2 * tan(15 deg) ~ 0.535
    const bandMat = new THREE.MeshBasicMaterial({
      color: new THREE.Color(CATEGORY_COLORS.galactic),
      transparent: true,
      opacity: 0.085,
      side: THREE.DoubleSide,
      depthWrite: false,
      blending: THREE.AdditiveBlending
    });
    const bandMesh = new THREE.Mesh(cylGeom, bandMat);

    // Equator wire on b = 0 deg
    const galEqGeom = new THREE.BufferGeometry().setFromPoints(unitCirclePts);
    const galEqLine = new THREE.Line(
      galEqGeom,
      new THREE.LineDashedMaterial({
        color: new THREE.Color(CATEGORY_COLORS.galactic),
        transparent: true,
        opacity: 0.42,
        dashSize: 0.05,
        gapSize: 0.04,
        depthWrite: false
      })
    );
    galEqLine.computeLineDistances();

    const galTiltNode = new THREE.Group();
    // Exact J2000 Galactic Plane orientation: +X=GC(l=0,b=0), +Y=NGP(b=+90), +Z=-Y_gal (right-handed Y-up)
    const m = GALACTIC_TO_SCENE_MAT3;
    const bx = new THREE.Vector3(m[0], m[3], m[6]);
    const by = new THREE.Vector3(m[2], m[5], m[8]); // NGP -> local +Y of cylinder
    const bz = new THREE.Vector3(-m[1], -m[4], -m[7]); // -l90 -> local +Z
    galTiltNode.quaternion.setFromRotationMatrix(new THREE.Matrix4().makeBasis(bx, by, bz));
    galTiltNode.add(bandMesh, galEqLine);

    const galEl = document.createElement("div");
    galEl.className = "ring-label ring-label-galactic";
    galEl.textContent = tr(initialLang, "galacticBandLabel");
    const galLabel = new CSS2DObject(galEl);
    galLabel.position.set(1.0, 0.06, 0);
    galTiltNode.add(galLabel);

    galacticGroup.add(galTiltNode);
    galacticGroup.userData = { galTiltNode, galEl, galLabel };
  }
  galacticGroup.visible = false; // Toggled via HUD pill (or automatically shown when viewing EPS_002!)
  overlayGroup.add(galacticGroup);

  function updateOverlaysScaleAndLang(logBlend, lang) {
    for (const entry of ringEntries) {
      const rVis = Math.max(0.01, mapRadiusAU(entry.def.rAU, logBlend));
      entry.line.scale.setScalar(rVis);
      const ang = entry.labelObj.userData.angle;
      entry.labelObj.position.set(Math.cos(ang) * rVis, 0, -Math.sin(ang) * rVis);
      if (lang) {
        entry.el.textContent = tr(lang, entry.def.key);
      }
    }
    // Place Galactic blind-spot band right at the ~51 AU Kuiper/EPS_002 zone so its geometry aligns with EPS_002 & EPS_007!
    const rGal = Math.max(1.0, mapRadiusAU(51.0, logBlend));
    galacticGroup.userData.galTiltNode.scale.setScalar(rGal);
    if (lang) {
      galacticGroup.userData.galEl.textContent = tr(lang, "galacticBandLabel");
    }
  }

  function setOverlayLabelsVisible(flag) {
    for (const entry of ringEntries) {
      entry.labelObj.visible = Boolean(flag) && ringsGroup.visible && (!entry.def.isMMR || discoveriesVisible);
    }
    galacticGroup.userData.galLabel.visible = Boolean(flag) && galacticGroup.visible;
  }

  return {
    overlayGroup,
    ringsGroup,
    galacticGroup,
    updateOverlaysScaleAndLang,
    setOverlayLabelsVisible,
    setDiscoveriesVisible
  };
}
