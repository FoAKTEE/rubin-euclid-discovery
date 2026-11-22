// GPU-Accelerated Particle Belts (Main Belt, Trojans, Kuiper Disk, Inner Hills Torus, 85,000 AU Outer Oort Shell)
// + Reference Distance Rings (incl. Neptune 12:1 MMR at 157.62 AU) + Galactic Plane Blind-Spot Band!

import * as THREE from "../vendor/three.module.js";
import { CSS2DObject } from "../vendor/CSS2DRenderer.js";
import { DEG2RAD, TWO_PI, LOG_R0, LOG_S0, GALACTIC_TO_SCENE_MAT3, mapRadiusAU, solveEllipticalKepler } from "./orbitalMechanics.js";
import { tr } from "./i18n.js";

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
      const c = temp < 0.2 ? [0.68, 0.80, 1.0] : temp < 0.75 ? [0.95, 0.96, 1.0] : [1.0, 0.85, 0.68];
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

  // 2. Main Asteroid Belt (2.06 - 3.28 AU) + Jupiter Trojans (L4/L5 around 5.2 AU)
  const mainAndTrojans = makeBelt(
    [...(catalogBelts?.main_belt || []), ...(catalogBelts?.jupiter_trojans || [])],
    5500,
    (r) => {
      if (r() < 0.82) {
        const rad = 2.12 + Math.pow(r(), 0.92) * 1.16;
        const ang = r() * TWO_PI;
        const z = (r() - 0.5) * (r() + r() - 1.0) * rad * 0.22;
        return [rad * Math.cos(ang), z, -rad * Math.sin(ang)];
      }
      // Jupiter L4/L5 Trojan clouds centered +/- 60 deg from Jupiter's mean longitude (~120 deg at Aug 2025)
      const camp = r() < 0.5 ? 1.05 : -1.05;
      const ang = 2.09 + camp + (r() - 0.5) * 0.55;
      const rad = 5.20 + (r() - 0.5) * 0.46;
      const z = (r() - 0.5) * 1.4;
      return [rad * Math.cos(ang), z, -rad * Math.sin(ang)];
    },
    (t) => (t < 0.5 ? [0.68, 0.86, 0.62] : [0.85, 0.76, 0.58]),
    2.1,
    0.50
  );

  // 3. Classical Cold + Hot/Scattered Kuiper Belt (30 - 125 AU)
  const kuiperCloud = makeBelt(
    catalogBelts?.kuiper_disk,
    8500,
    (r) => {
      const isScattered = r() < 0.32;
      const rad = isScattered ? 34.0 + Math.pow(r(), 1.7) * 92.0 : 38.5 + r() * 9.8;
      const ang = r() * TWO_PI;
      const incSpread = isScattered ? 0.42 : 0.085;
      const z = (r() - 0.5) * (r() - 0.5) * (r() < 0.5 ? -2.2 : 2.2) * rad * incSpread * 2.2;
      return [rad * Math.cos(ang), z, -rad * Math.sin(ang)];
    },
    (t) => (t < 0.55 ? [0.38, 0.72, 1.0] : [0.62, 0.85, 1.0]),
    2.25,
    0.56
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
    (t) => (t < 0.5 ? [0.46, 0.78, 0.98] : [0.68, 0.74, 0.96]),
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
    (t) => (t < 0.6 ? [0.64, 0.86, 1.0] : [0.85, 0.92, 1.0]),
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

  return { group, beltNodes, skyBackdrop };
}

export function buildReferenceOverlays(initialLang) {
  const overlayGroup = new THREE.Group();
  overlayGroup.name = "referenceOverlays";

  // 1. Ecliptic Distance Rings + Highlighted Neptune 12:1 MMR Ring at 157.62 AU!
  const ringsGroup = new THREE.Group();
  const ringDefs = [
    { rAU: 1.0, key: "ringLabel1AU", color: 0x38bdf8, dashed: false, opacity: 0.24 },
    { rAU: 5.2, key: "ringLabel5AU", color: 0x64748b, dashed: false, opacity: 0.20 },
    { rAU: 30.1, key: "ringLabel30AU", color: 0x3b82f6, dashed: false, opacity: 0.28 },
    { rAU: 50.0, key: "ringLabel50AU", color: 0x38bdf8, dashed: true, opacity: 0.28 },
    { rAU: 157.62, key: "ringLabelMMR", color: 0xfbbf24, dashed: true, opacity: 0.78, isMMR: true },
    { rAU: 1000.0, key: "ringLabel1000AU", color: 0xf472b6, dashed: true, opacity: 0.24 },
    { rAU: 10000.0, key: "ringLabel10000AU", color: 0x60a5fa, dashed: true, opacity: 0.26 },
    { rAU: 50000.0, key: "ringLabel50000AU", color: 0x93c5fd, dashed: true, opacity: 0.30 }
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
    const angle = def.isMMR ? -0.58 : 0.42;
    labelObj.userData = { angle };
    ringsGroup.add(labelObj);

    ringEntries.push({ def, line, el, labelObj });
  }
  overlayGroup.add(ringsGroup);

  // 2. Galactic Plane Blind-Spot Band (|b| <= 15 deg inclined 60.19 deg to J2000 Ecliptic, node = 266.84 deg)
  const galacticGroup = new THREE.Group();
  {
    const cylGeom = new THREE.CylinderGeometry(1.0, 1.0, 0.535, 96, 1, true); // 2 * tan(15 deg) ~ 0.535
    const bandMat = new THREE.MeshBasicMaterial({
      color: 0xc084fc,
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
        color: 0xe879f9,
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
      entry.labelObj.visible = Boolean(flag) && ringsGroup.visible;
    }
    galacticGroup.userData.galLabel.visible = Boolean(flag) && galacticGroup.visible;
  }

  return {
    overlayGroup,
    ringsGroup,
    galacticGroup,
    updateOverlaysScaleAndLang,
    setOverlayLabelsVisible
  };
}
