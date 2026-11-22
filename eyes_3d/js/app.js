// Main 3D WebGL Application Engine for Eyes on the Cosmos
// Unites machine-precision J2000 orbital mechanics, batched GPU shader orbits,
// lazy LRU 3D GLB streaming, off-thread satellite Worker, real Gaia DR3 Milky Way,
// and relativistic 3D black hole accretion disks (100 m -> 100,000 AU -> 100,000 ly).

import * as THREE from "../vendor/three.module.js";
import { OrbitControls } from "../vendor/OrbitControls.js";
import { CSS2DRenderer, CSS2DObject } from "../vendor/CSS2DRenderer.js";

import {
  I18N,
  resolveInitialLanguage,
  persistLanguageChoice,
  tr,
  getObjectName,
  getObjectHeadline,
  getObjectSummary,
  getCategoryLabel
} from "./i18n.js";

import {
  CATEGORY_ORDER,
  normalizeCategoryKey,
  loadUnifiedSolarCatalog,
  normalizeGalacticCatalog,
  objectMatchesCategory,
  resolveObjectByQuery
} from "./catalogAdapter.js";

import {
  DEG2RAD,
  TWO_PI,
  DISCOVERY_EPOCH_JD,
  OBLIQUITY_J2000_RAD,
  LOG_R0,
  LOG_S0,
  GALAXY_SCENE_PER_PC,
  GALAXY_SCENE_PER_KPC,
  AU_KM,
  mapRadiusAU,
  helioAUToSceneInto,
  galacticKpcToSceneInto,
  raDecDistPcToSceneInto,
  sceneDistToDisplayString,
  computeLocalKeplerianEclipticAU,
  computeEuclidL2LocalOffsetEclipticAU,
  sampleHeliocentricOrbitRawAU,
  getMeanMotionRadPerDay,
  jdToUTCString
} from "./orbitalMechanics.js";

import { createProceduralBodyNode, getGlowSpriteTexture } from "./proceduralBodies.js";
import { prioritizeModelLoad, evictLRUModels, ASSET_VERSION } from "./model3dLibrary.js";
import { buildAllParticleBelts, buildReferenceOverlays } from "./particleBelts.js";
import { EarthConstellationManager, mapGeocentricKmToSceneRadius } from "./earthConstellations.js";
import {
  updateBodyPhysicalRotation,
  getIAUPoleElements,
  formatSiderealPeriod,
  computeEarthSubsolarLatLon
} from "./planetaryRotation.js";
import { createGalaxyLayer } from "./galaxyRenderer.js?v=20261119_v9";
import { createBlackHoleSystem } from "./blackHoleDisks.js?v=20261119_v9";
import { createADAMOverlayManager } from "./adamOverlay.js?v=20261119_v10";

const SPEED_TIERS = [
  { daysPerSec: 1.0 / 86400.0, i18nKey: "timeReal" },
  { daysPerSec: 600.0 / 86400.0, i18nKey: "time10m" },
  { daysPerSec: 1.0 / 24.0, i18nKey: "time1h" },
  { daysPerSec: 1.0, i18nKey: "time1d" },
  { daysPerSec: 30.4375, i18nKey: "time1mo" },
  { daysPerSec: 365.25, i18nKey: "time1yr" },
  { daysPerSec: 365.25 * 25.0, i18nKey: "time25yr" },
  { daysPerSec: 365.25 * 200.0, i18nKey: "time200yr" }
];

const SPOTLIGHT_TOUR_IDS = [
  "DELTA_003",
  "CENTAUR_343_IOTA004",
  "EPS_002",
  "W4_JUP_MOON_GOLD_001",
  "EUC0005",
  "ATLAS_3I",
  "SGR_A_STAR",
  "GAIA_BH1",
  "CYGNUS_X1",
  "OORT_OUTER_REP_1"
];

// Research-blog link that works on the local two-port dev layout (explorer on :8765, blog on :8766)
// and on any static host where the portals are sibling folders.
function buildBlogUrl(lang, suffix = "") {
  const isLocalEyesPort =
    (window.location.hostname === "localhost" ||
     window.location.hostname === "127.0.0.1" ||
     window.location.hostname === "0.0.0.0") &&
    window.location.port === "8765";
  const base = isLocalEyesPort
    ? `${window.location.protocol}//${window.location.hostname}:8766/index.html`
    : "../discovery_blog/index.html";
  return `${base}?lang=${encodeURIComponent(lang)}${suffix}`;
}

const CATEGORY_DOT_COLORS = {
  all: "#94a3b8",
  discoveries: "#fbbf24",
  galactic: "#a78bfa",
  spacecraft: "#38bdf8",
  planets: "#38bdf8",
  moons_l2: "#c084fc",
  dwarf_planets: "#f472b6",
  asteroids: "#4ade80",
  comets_centaurs: "#2dd4bf",
  interstellar: "#fb7185",
  kuiper_etnos: "#60a5fa",
  oort_cloud: "#cbd5e1"
};

const MAX_VISIBLE_LABELS = 24;

// Preallocated reusable scratch math objects (strictly zero per-frame heap allocations)
const _tmpVec = new THREE.Vector3();
const _tmpVec2 = new THREE.Vector3();
const _tmpVec3 = new THREE.Vector3();
const _prevLockedPos = new THREE.Vector3();
const _curLockedPos = new THREE.Vector3();
const _localEcl3 = new Float64Array(3);
const _xAxisUnit = new THREE.Vector3(1, 0, 0);
const _tmpQuat = new THREE.Quaternion();
const _frustum = new THREE.Frustum();
const _projScreenMat = new THREE.Matrix4();
const _pickProj = new THREE.Vector3();
const _labelProjTmp = new THREE.Vector3();
const _acceptedLabelBoxes = new Float32Array(MAX_VISIBLE_LABELS * 4);
const _pointerDownXY = new THREE.Vector2();
const _scaleInfo = {
  logBlend: 1.0,
  cameraDistScene: 100.0,
  cameraDistAU: 100.0,
  cameraDistPc: 0.0005,
  galaxyUnitsPerKpc: GALAXY_SCENE_PER_KPC,
  simJD: DISCOVERY_EPOCH_JD,
  galacticFactor: 0.0,
  focusedOnBlackHole: false,
  focusedObjectId: null
};

// ==================== APPLICATION STATE ====================
const state = {
  lang: resolveInitialLanguage(),
  scaleMode: "log",
  logBlend: 1.0,
  targetLogBlend: 1.0,
  activeCategory: "all",
  orbitMode: "major",
  showRings: true,
  showGalacticBand: false,
  showGalaxyLayer: true,
  showLabels: true,
  simJD: DISCOVERY_EPOCH_JD,
  isPlaying: true,
  speedIndex: 0,
  selectedObj: null,
  lockedObj: null,
  hoveredObj: null,
  inspectorCollapsed: false,
  activeInspectorTab: "overview",
  inspectorBodyCollapsed: false,
  autoTourTimer: null,
  autoTourIdx: 0,
  galacticFactor: 0.0
};

const urlParams = new URLSearchParams(window.location.search);
if (urlParams.get("scale") === "true" || urlParams.get("scale") === "1:1") {
  state.scaleMode = "true";
  state.logBlend = 0.0;
  state.targetLogBlend = 0.0;
}
if (urlParams.get("category")) {
  const cKey = normalizeCategoryKey(urlParams.get("category"));
  if (CATEGORY_ORDER.includes(cKey)) state.activeCategory = cKey;
}

// ==================== LOAD SOLAR + GALACTIC CATALOG ====================
const catalog = loadUnifiedSolarCatalog();
const childrenByParent = new Map();
for (const obj of catalog.objects) {
  if (obj.parent_id) {
    if (!childrenByParent.has(obj.parent_id)) childrenByParent.set(obj.parent_id, []);
    childrenByParent.get(obj.parent_id).push(obj);
  }
}

// ==================== THREE.JS SCENE & RENDERERS ====================
const canvas = document.getElementById("webgl-canvas");
const css2dHost = document.getElementById("css2d-layer");

const renderer = new THREE.WebGLRenderer({
  canvas,
  alpha: false,
  antialias: true,
  logarithmicDepthBuffer: true,
  powerPreference: "high-performance"
});
renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(0x02050c, 1.0);
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.08;

const labelRenderer = new CSS2DRenderer();
labelRenderer.setSize(window.innerWidth, window.innerHeight);
labelRenderer.domElement.style.position = "absolute";
labelRenderer.domElement.style.top = "0";
labelRenderer.domElement.style.left = "0";
labelRenderer.domElement.style.pointerEvents = "none";
css2dHost.appendChild(labelRenderer.domElement);

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x02050c);

// Extended near/far with logarithmicDepthBuffer spans 100 m -> 100,000 AU -> 800+ kpc extragalactic halo without far-plane clipping
const camera = new THREE.PerspectiveCamera(46, window.innerWidth / window.innerHeight, 0.000005, 250000000);
camera.position.set(16, 48, 86);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.065;
controls.rotateSpeed = 0.72;
controls.zoomSpeed = 1.18;
controls.panSpeed = 0.8;
controls.minDistance = 0.00006;
controls.maxDistance = 24000000;

const sunPointLight = new THREE.PointLight(0xfff9f0, 3.35, 0, 0);
sunPointLight.position.set(0, 0, 0);
scene.add(sunPointLight);
scene.add(new THREE.HemisphereLight(0x8ab4f8, 0x161a24, 0.11));
scene.add(new THREE.AmbientLight(0xffffff, 0.045));

// ==================== BELTS, OVERLAYS & MILKY WAY GALAXY LAYER ====================
const { group: beltsGroup, beltNodes, skyBackdrop } = buildAllParticleBelts(catalog.belts);
for (const bNode of Object.values(beltNodes)) {
  bNode.renderOrder = 7;
}
scene.add(beltsGroup);

const overlays = buildReferenceOverlays(state.lang);
overlays.ringsGroup.renderOrder = 8;
scene.add(overlays.overlayGroup);
overlays.updateOverlaysScaleAndLang(state.logBlend, state.lang);

const galaxyLayer = createGalaxyLayer({ opacity: 1.0, showGas: true });
scene.add(galaxyLayer.group);

const bodiesRoot = new THREE.Group();
const orbitsRoot = new THREE.Group();
const galacticObjectsRoot = new THREE.Group();
galacticObjectsRoot.name = "galacticObjectsRoot";
scene.add(orbitsRoot, bodiesRoot, galacticObjectsRoot);

const runtimeMap = new Map();
const galacticBlackHoleControllers = [];

// ==================== BATCHED GPU SHADER HELIOCENTRIC ORBITS (1 DRAW CALL!) ====================
function buildBatchedHeliocentricOrbits(objects) {
  const segments = [];
  let totalVerts = 0;
  const orbitRanges = new Map(); // id -> { startVert, vertCount, baseOpacity, color }

  for (const obj of objects) {
    if (obj.parent_id || obj.category === "star" || obj.is_galactic) continue;
    const { positions, closed } = sampleHeliocentricOrbitRawAU(obj);
    const nPts = positions.length / 3;
    if (nPts < 2) continue;
    const segCount = closed ? nPts : nPts - 1;
    const vertCount = segCount * 2;
    const baseOpacity = obj.is_new_discovery
      ? (obj.id === "DELTA_003" ? 0.92 : 0.62)
      : obj.category === "planets"
        ? 0.52
        : 0.30;
    const col = new THREE.Color(obj.color || "#60a5fa");
    segments.push({ id: obj.id, positions, nPts, closed, startVert: totalVerts, vertCount, baseOpacity, col });
    orbitRanges.set(obj.id, { startVert: totalVerts, vertCount, baseOpacity, col, rawPositions: positions, closed });
    totalVerts += vertCount;
  }

  const posArr = new Float32Array(totalVerts * 3);
  const colArr = new Float32Array(totalVerts * 3);
  const alphaArr = new Float32Array(totalVerts);

  let writeIdx = 0;
  for (const seg of segments) {
    const p = seg.positions;
    const n = seg.nPts;
    const limit = seg.closed ? n : n - 1;
    for (let k = 0; k < limit; k++) {
      const kNext = (k + 1) % n;
      posArr[writeIdx * 3 + 0] = p[k * 3 + 0];
      posArr[writeIdx * 3 + 1] = p[k * 3 + 1];
      posArr[writeIdx * 3 + 2] = p[k * 3 + 2];
      colArr[writeIdx * 3 + 0] = seg.col.r;
      colArr[writeIdx * 3 + 1] = seg.col.g;
      colArr[writeIdx * 3 + 2] = seg.col.b;
      alphaArr[writeIdx] = seg.baseOpacity;
      writeIdx++;

      posArr[writeIdx * 3 + 0] = p[kNext * 3 + 0];
      posArr[writeIdx * 3 + 1] = p[kNext * 3 + 1];
      posArr[writeIdx * 3 + 2] = p[kNext * 3 + 2];
      colArr[writeIdx * 3 + 0] = seg.col.r;
      colArr[writeIdx * 3 + 1] = seg.col.g;
      colArr[writeIdx * 3 + 2] = seg.col.b;
      alphaArr[writeIdx] = seg.baseOpacity;
      writeIdx++;
    }
  }

  const geom = new THREE.BufferGeometry();
  geom.setAttribute("position", new THREE.BufferAttribute(posArr, 3));
  geom.setAttribute("aColor", new THREE.BufferAttribute(colArr, 3));
  const alphaAttr = new THREE.BufferAttribute(alphaArr, 1);
  alphaAttr.setUsage(THREE.DynamicDrawUsage);
  geom.setAttribute("aAlpha", alphaAttr);
  geom.boundingSphere = new THREE.Sphere(new THREE.Vector3(0, 0, 0), 250000);

  const uniforms = {
    uLogBlend: { value: state.logBlend },
    uGlobalFade: { value: 1.0 }
  };

  const mat = new THREE.ShaderMaterial({
    uniforms,
    transparent: true,
    depthTest: true,
    depthWrite: false,
    vertexShader: `
      #include <common>
      #include <logdepthbuf_pars_vertex>
      attribute vec3 aColor;
      attribute float aAlpha;
      uniform float uLogBlend;
      uniform float uGlobalFade;
      varying vec3 vColor;
      varying float vAlpha;
      void main() {
        vColor = aColor;
        vAlpha = aAlpha * uGlobalFade;
        float r = length(position);
        vec3 dir = r > 1e-9 ? position / r : vec3(0.0);
        float rLog = ${LOG_S0.toFixed(1)} * log(1.0 + r / ${LOG_R0.toFixed(1)});
        vec3 mapped = dir * mix(r, rLog, uLogBlend);
        gl_Position = projectionMatrix * modelViewMatrix * vec4(mapped, 1.0);
        #include <logdepthbuf_vertex>
      }
    `,
    fragmentShader: `
      #include <common>
      #include <logdepthbuf_pars_fragment>
      varying vec3 vColor;
      varying float vAlpha;
      void main() {
        if (vAlpha < 0.01) discard;
        #include <logdepthbuf_fragment>
        gl_FragColor = vec4(vColor, vAlpha);
      }
    `
  });

  const mesh = new THREE.LineSegments(geom, mat);
  mesh.frustumCulled = false;
  mesh.renderOrder = 8;
  orbitsRoot.add(mesh);
  return { mesh, uniforms, alphaArr, alphaAttr, orbitRanges };
}

const batchedOrbits = buildBatchedHeliocentricOrbits(catalog.objects);

// ==================== CHILD SATELLITE OFFSETS & RINGS ====================
function computeChildSceneOffset(parentRuntime, childObj, jd, outSceneVec3) {
  const parentObj = parentRuntime.obj;
  const parentMeshR = parentRuntime.node.userData.meshRadius;
  const parentPhysRadiusAU = Math.max(1e-9, ((parentObj.diameter_km || 2000.0) * 0.5) / AU_KM);

  const isL1 = childObj.l1_phase_deg !== null && childObj.l1_phase_deg !== undefined;
  const isL2 = childObj.l2_phase_deg !== null && childObj.l2_phase_deg !== undefined;
  if (isL1) {
    computeEuclidL2LocalOffsetEclipticAU(parentRuntime.eclPosAU, jd, _localEcl3, childObj.l1_phase_deg, true);
  } else if (isL2) {
    computeEuclidL2LocalOffsetEclipticAU(parentRuntime.eclPosAU, jd, _localEcl3, childObj.l2_phase_deg, false);
  } else {
    computeLocalKeplerianEclipticAU(childObj, jd, _localEcl3);
  }

  const rLocalAU = Math.hypot(_localEcl3[0], _localEcl3[1], _localEcl3[2]);
  if (rLocalAU < 1e-13) {
    outSceneVec3.set(parentMeshR * 1.4, 0, 0);
    return rLocalAU;
  }

  if (parentObj.id === "EARTH") {
    const rSceneLocal = mapGeocentricKmToSceneRadius(rLocalAU * AU_KM, parentMeshR);
    const factor = rSceneLocal / rLocalAU;
    outSceneVec3.set(_localEcl3[0] * factor, _localEcl3[2] * factor, -_localEcl3[1] * factor);
    // Align Earth equatorial satellites identically with EarthConstellationManager (-OBLIQUITY_J2000_RAD around +X)
    if (!isL1 && !isL2 && childObj.id !== "MOON") {
      outSceneVec3.applyAxisAngle(_xAxisUnit, -OBLIQUITY_J2000_RAD);
    }
    return rLocalAU;
  }

  const uRadii = Math.max(1.015, rLocalAU / parentPhysRadiusAU);
  const isSC = Boolean(childObj.visual_type?.startsWith("spacecraft") || childObj.category === "spacecraft");
  let rSceneLocal;
  if (parentObj.has_rings) {
    if (!isSC && uRadii < 2.40) {
      rSceneLocal = parentMeshR * Math.max(1.08, uRadii);
    } else {
      rSceneLocal = parentMeshR * (2.42 + 0.40 * Math.pow(Math.max(0.0, uRadii - 2.25), 0.50));
    }
  } else {
    rSceneLocal = parentMeshR * (1.075 + 0.54 * Math.log(uRadii) + 0.22 * Math.pow(Math.max(0.0, uRadii - 1.0), 0.54));
  }
  const factor = rSceneLocal / rLocalAU;
  outSceneVec3.set(_localEcl3[0] * factor, _localEcl3[2] * factor, -_localEcl3[1] * factor);
  return rLocalAU;
}

function buildSatelliteOrbitRing(parentRuntime, childObj) {
  const isLagrange =
    (childObj.l1_phase_deg !== null && childObj.l1_phase_deg !== undefined) ||
    (childObj.l2_phase_deg !== null && childObj.l2_phase_deg !== undefined);
  const nRadDay = isLagrange ? TWO_PI / 178.4 : getMeanMotionRadPerDay(childObj);
  const periodDays = TWO_PI / Math.max(1e-9, nRadDay);
  const ecc = Math.min(0.97, Math.max(0.0, childObj.e || 0.0));
  const steps = isLagrange ? 180 : (ecc > 0.30 ? 256 : 180);
  const coords = new Float32Array(steps * 3);

  if (isLagrange) {
    for (let k = 0; k < steps; k++) {
      const jdSample = DISCOVERY_EPOCH_JD + (periodDays * k) / steps;
      computeChildSceneOffset(parentRuntime, childObj, jdSample, _tmpVec);
      coords[k * 3] = _tmpVec.x;
      coords[k * 3 + 1] = _tmpVec.y;
      coords[k * 3 + 2] = _tmpVec.z;
    }
  } else {
    const epochRef = childObj.epoch_jd ?? DISCOVERY_EPOCH_JD;
    const m0Rad = childObj.has_M0 ? (childObj.M0_deg || 0.0) * DEG2RAD : 0.0;
    const warpAmp = 0.34 * ecc;
    for (let k = 0; k < steps; k++) {
      const theta = (TWO_PI * k) / steps;
      const E = theta - warpAmp * Math.sin(theta);
      const M = E - ecc * Math.sin(E);
      const jdSample = epochRef + (M - m0Rad) / nRadDay;
      computeChildSceneOffset(parentRuntime, childObj, jdSample, _tmpVec);
      coords[k * 3] = _tmpVec.x;
      coords[k * 3 + 1] = _tmpVec.y;
      coords[k * 3 + 2] = _tmpVec.z;
    }
  }

  const geom = new THREE.BufferGeometry();
  geom.setAttribute("position", new THREE.BufferAttribute(coords, 3));
  const isSC = Boolean(childObj.visual_type?.startsWith("spacecraft") || childObj.category === "spacecraft");
  const baseOpacity = isSC ? 0.45 : 0.35;
  const mat = new THREE.LineBasicMaterial({
    color: isSC ? new THREE.Color(childObj.color || "#38bdf8") : new THREE.Color(0xa78bfa),
    transparent: true,
    opacity: baseOpacity,
    depthWrite: false
  });
  const loop = new THREE.LineLoop(geom, mat);
  loop.userData = { childId: childObj.id, isSpacecraftRing: isSC, baseOpacity };
  return loop;
}

// ==================== HELPER TO CREATE CSS2D LABEL ====================
function estimateLabelHalfWidthPx(obj, lang) {
  const txt = getObjectName(obj, lang) || "";
  let textW = 0.0;
  for (let i = 0; i < txt.length; i++) {
    textW += txt.charCodeAt(i) > 0xff ? 16.6 : 9.2;
  }
  const badgeW = obj.is_new_discovery ? (lang === "zh" ? 36.0 : 52.0) : 0.0;
  return 0.5 * (26.0 + badgeW + textW) + 5.0;
}

function createBodyLabel(obj, yOffset) {
  const labelEl = document.createElement("div");
  labelEl.className = `label-3d${obj.is_new_discovery ? " is-discovery" : ""}${obj.is_galactic ? " is-galactic" : ""}`;

  const badgeSpan = document.createElement("span");
  badgeSpan.className = "label-new-pill";
  badgeSpan.textContent = tr(state.lang, "newBadge");
  badgeSpan.style.display = obj.is_new_discovery ? "inline-block" : "none";

  const nameSpan = document.createElement("span");
  nameSpan.textContent = getObjectName(obj, state.lang);
  labelEl.append(badgeSpan, nameSpan);

  labelEl.addEventListener("pointerdown", (ev) => ev.stopPropagation());
  labelEl.addEventListener("click", (ev) => {
    ev.stopPropagation();
    stopAutoTour();
    selectAndFlyTo(obj, "auto");
  });

  const labelObj = new CSS2DObject(labelEl);
  labelObj.center.set(0.5, 1.18);
  labelObj.position.set(0, yOffset, 0);
  labelObj.visible = false;
  return { labelObj, labelEl, nameSpan, badgeSpan, labelHalfW: estimateLabelHalfWidthPx(obj, state.lang) };
}

// ==================== INSTANTIATE SOLAR SYSTEM RUNTIME ====================
for (const obj of catalog.objects) {
  const node = createProceduralBodyNode(obj);
  bodiesRoot.add(node);

  const { labelObj, labelEl, nameSpan, badgeSpan, labelHalfW } = createBodyLabel(obj, node.userData.meshRadius * 1.3);
  node.add(labelObj);

  runtimeMap.set(obj.id, {
    obj,
    node,
    satOrbitGroup: null,
    satRingsMap: new Map(),
    labelObj,
    labelEl,
    nameSpan,
    badgeSpan,
    _labelHalfW: labelHalfW,
    _labelPriority: -1,
    eclPosAU: new Float64Array(3),
    liveHelioR_AU: obj.r_au || 0,
    worldPos: new THREE.Vector3(),
    prevWorldPos: new THREE.Vector3()
  });
}

// Compute initial primary & tier-1 moon positions for satellite rings
for (const rt of runtimeMap.values()) {
  if (!rt.obj.parent_id) {
    rt.liveHelioR_AU = computeLocalKeplerianEclipticAU(rt.obj, state.simJD, rt.eclPosAU);
    helioAUToSceneInto(rt.eclPosAU[0], rt.eclPosAU[1], rt.eclPosAU[2], state.logBlend, rt.worldPos);
    rt.node.position.copy(rt.worldPos);
  }
}
for (const rt of runtimeMap.values()) {
  if (rt.obj.parent_id) {
    const pRt = runtimeMap.get(rt.obj.parent_id);
    if (pRt && !pRt.obj.parent_id) {
      computeChildSceneOffset(pRt, rt.obj, state.simJD, _tmpVec);
      rt.worldPos.copy(pRt.worldPos).add(_tmpVec);
      rt.node.position.copy(rt.worldPos);
    }
  }
}
for (const [parentId, children] of childrenByParent.entries()) {
  const parentRt = runtimeMap.get(parentId);
  if (!parentRt) continue;
  const satGroup = new THREE.Group();
  satGroup.name = `satRings_${parentId}`;
  parentRt.node.add(satGroup);
  parentRt.satOrbitGroup = satGroup;
  for (const ch of children) {
    const ring = buildSatelliteOrbitRing(parentRt, ch);
    satGroup.add(ring);
    parentRt.satRingsMap.set(ch.id, ring);
  }
}

// ==================== MOUNT B612 ADAM PLATFORM 3D OVERLAYS ====================
const adamOverlay = createADAMOverlayManager(scene, runtimeMap, state.logBlend);
const adamSummaryEl = document.getElementById("adam-overlay-summary");
if (adamSummaryEl) adamSummaryEl.textContent = adamOverlay.getSummaryText();

// ==================== MOUNT GALACTIC OBJECTS (BLACK HOLES + CLUSTERS) ====================
function mountGalacticObjects(galacticJson) {
  const items = normalizeGalacticCatalog(galacticJson);
  for (const gObj of items) {
    if (runtimeMap.has(gObj.id)) continue;

    // Add to unified catalog search & indices
    catalog.objects.push(gObj);
    catalog.byId.set(gObj.id, gObj);
    const ckId = gObj.id.replace(/[^A-Z0-9]+/g, "");
    const ckName = (gObj.name_en || "").toUpperCase().replace(/[^A-Z0-9]+/g, "");
    catalog.aliasIndex.set(ckId, gObj);
    catalog.aliasIndex.set(ckName, gObj);
    if (gObj.name_zh) catalog.aliasIndex.set(gObj.name_zh.toUpperCase().replace(/[^A-Z0-9]+/g, ""), gObj);

    const worldPos = new THREE.Vector3();
    if (Array.isArray(gObj.gal_xyz_kpc) && gObj.gal_xyz_kpc.length >= 3) {
      galacticKpcToSceneInto(gObj.gal_xyz_kpc[0], gObj.gal_xyz_kpc[1], gObj.gal_xyz_kpc[2], worldPos);
    } else if (gObj.ra_deg !== null && gObj.dec_deg !== null) {
      raDecDistPcToSceneInto(gObj.ra_deg, gObj.dec_deg, (gObj.dist_kpc || 1.0) * 1000.0, worldPos);
    } else {
      galacticKpcToSceneInto(gObj.dist_kpc || 8.277, 0, 0, worldPos);
    }

    let node;
    let meshRadius;
    if (gObj.is_black_hole) {
      meshRadius = gObj.bh_type === "smbh"
        ? 5500.0
        : Math.min(2000.0, Math.max(420.0, (gObj.dist_kpc || 1.0) * 600.0));
      const bhSys = createBlackHoleSystem(gObj.bh_spec || gObj, {
        radius: meshRadius,
        showJets: gObj.bh_type !== "dormant",
        showCompanion: true
      });
      bhSys.setOpacity(0.0);
      bhSys.group.visible = false;
      node = bhSys.group;
      node.userData.meshRadius = meshRadius;
      node.userData.bhController = bhSys;
      galacticBlackHoleControllers.push({ bhSys, obj: gObj, node });
    } else {
      meshRadius = gObj.subtype === "satellite_galaxy" ? 180000.0 : 14000.0;
      node = new THREE.Group();
      node.name = `gal_${gObj.id}`;
      node.userData.meshRadius = meshRadius;
      node.visible = false;
      const spr = new THREE.Sprite(
        new THREE.SpriteMaterial({
          map: getGlowSpriteTexture(),
          color: new THREE.Color(gObj.color || "#fde68a"),
          blending: THREE.AdditiveBlending,
          transparent: true,
          depthTest: true,
          depthWrite: false,
          sizeAttenuation: false,
          opacity: 0.0
        })
      );
      const sz = gObj.subtype === "satellite_galaxy" ? 0.032 : 0.018;
      spr.scale.set(sz, sz, 1);
      spr.renderOrder = 5;
      spr.visible = false;
      node.add(spr);
      node.userData.beaconSprite = spr;
    }

    node.position.copy(worldPos);
    galacticObjectsRoot.add(node);

    // Note: bhSys.group is already scaled by meshRadius, so local yOffset=1.38 places the label at 1.38 * meshRadius!
    const labelYOffset = gObj.is_black_hole ? 1.38 : meshRadius * 1.15;
    const { labelObj, labelEl, nameSpan, badgeSpan, labelHalfW } = createBodyLabel(gObj, labelYOffset);
    node.add(labelObj);

    runtimeMap.set(gObj.id, {
      obj: gObj,
      node,
      satOrbitGroup: null,
      satRingsMap: new Map(),
      labelObj,
      labelEl,
      nameSpan,
      badgeSpan,
      _labelHalfW: labelHalfW,
      _labelPriority: -1,
      eclPosAU: new Float64Array(3),
      liveHelioR_AU: (gObj.dist_kpc || 1.0) * 206264806.2,
      worldPos,
      prevWorldPos: worldPos.clone()
    });
  }
}

// Stream real 82,199 Gaia DR3 stars & Milky Way catalog asynchronously (non-blocking startup)
galaxyLayer
  .loadFromUrls(
    `data/galactic_stars.bin?v=${ASSET_VERSION}`,
    `data/galactic_catalog.json?v=${ASSET_VERSION}`
  )
  .then((res) => {
    const galCatalog = res?.catalog || galaxyLayer.getCatalog() || null;
    mountGalacticObjects(galCatalog);
    if (skyBackdrop) skyBackdrop.material.opacity = 0.22;
    renderCategoryFilterBar();
    renderCatalogObjectList();
    updateVisibilityAndOrbits();
    // Re-check deep link in case URL pointed to a Galactic black hole (e.g. ?focus=SGR_A_STAR)
    const fp = urlParams.get("focus") || extractHashFocusSlug();
    if (fp && (!state.selectedObj || state.selectedObj.id === "DELTA_003")) {
      const hit = resolveObjectByQuery(catalog, fp);
      if (hit && hit.is_galactic) selectAndFlyTo(hit, urlParams.get("mode") || "auto");
    }
  })
  .catch(() => {
    mountGalacticObjects(null);
    renderCategoryFilterBar();
    renderCatalogObjectList();
  });

// ==================== GLOBAL 22,022 EARTH SATELLITES ENGINE ====================
const constellationMgr = new EarthConstellationManager(runtimeMap.get("EARTH"));
constellationMgr.load().then((ok) => {
  if (!ok) return;
  const satQuery = urlParams.get("sat") || (urlParams.get("focus")?.startsWith("NORAD_") ? urlParams.get("focus") : null);
  if (satQuery) {
    const cleaned = satQuery.replace(/^NORAD_/i, "");
    const hits = constellationMgr.searchSatellites(cleaned, 1);
    if (hits.length > 0) selectAndFlyTo(hits[0], urlParams.get("mode") || "auto");
  }
});

// ==================== CAMERA FLY-TO & LOCK-ON TRACKING ====================
let flyTween = null;

function easeOutCubic(t) {
  return 1.0 - Math.pow(1.0 - t, 3);
}

function startCameraTween(destTarget, destCamPos, durationSec = 0.95) {
  flyTween = {
    startTime: performance.now(),
    durationMs: durationSec * 1000,
    fromTarget: controls.target.clone(),
    toTarget: destTarget.clone(),
    fromPos: camera.position.clone(),
    toPos: destCamPos.clone()
  };
}

function computeIdealInspectionDistance(obj, mode) {
  const rt = runtimeMap.get(obj.id);
  const meshR = rt ? rt.node.userData.meshRadius : 0.001;

  if (obj.is_galactic) {
    if (obj.is_black_hole) {
      return mode === "orbit" ? meshR * 6.5 : meshR * 3.8;
    }
    return meshR * 3.8;
  }

  if (mode === "surface") {
    return meshR * (obj.has_rings ? 4.3 : 2.55);
  }
  if (mode === "orbit") {
    if (obj.parent_id) {
      const parentRt = runtimeMap.get(obj.parent_id);
      if (parentRt) {
        computeChildSceneOffset(parentRt, obj, state.simJD, _tmpVec2);
        return Math.max(meshR * 8.0, _tmpVec2.length() * 2.5);
      }
    }
    const rRefAU = obj.e >= 1.0 ? Math.max(4.0, obj.q_au * 4.5) : Math.max(0.5, obj.a_au * (1.0 + Math.min(0.85, obj.e)));
    return Math.max(0.25, mapRadiusAU(rRefAU, state.targetLogBlend) * 2.15);
  }

  const hasChildren = childrenByParent.has(obj.id);
  if (obj.category === "star") return meshR * 5.8;
  if (obj.has_rings) return meshR * 4.5;
  if (hasChildren) return meshR * 3.8;
  if (obj.is_active) return meshR * 14.5;
  if (obj.visual_type?.startsWith("spacecraft")) return meshR * 3.45;
  return meshR * 2.85;
}

export function selectAndFlyTo(obj, mode = "auto") {
  if (!obj) return;
  closeAllMenus();

  if (obj.is_constellation_sat) {
    if ((obj.period_days || 0.066) < 0.25 && state.speedIndex >= 2) {
      state.speedIndex = 0;
      syncSpeedSelectUI();
    }
    const { worldPos, meshRadius } = constellationMgr.focusSatellite3D(obj, state.simJD);
    state.selectedObj = obj;
    const earthRt = runtimeMap.get("EARTH");
    if (mode === "orbit" && earthRt) {
      state.lockedObj = earthRt.obj;
      const eR = earthRt.node.userData.meshRadius;
      const camDir = _tmpVec2.set(0.42, 0.56, 0.72).normalize();
      controls.minDistance = eR * 1.25;
      startCameraTween(earthRt.worldPos, _tmpVec3.copy(earthRt.worldPos).addScaledVector(camDir, eR * 4.8), 0.9);
    } else {
      state.lockedObj = obj;
      controls.minDistance = Math.max(0.000025, meshRadius * 1.30);
      const fromEarth = earthRt
        ? _tmpVec2.copy(worldPos).sub(earthRt.worldPos).normalize()
        : _tmpVec2.set(0.4, 0.5, 0.7).normalize();
      const sunward = _tmpVec3.copy(worldPos).negate().normalize();
      fromEarth.multiplyScalar(0.86).addScaledVector(sunward, 0.36);
      fromEarth.y += 0.18;
      fromEarth.normalize();
      startCameraTween(worldPos, _tmpVec3.copy(worldPos).addScaledVector(fromEarth, meshRadius * 2.95), 0.9);
    }
    updateTrackingBarUI();
    updateInspectorUI();
    highlightSelectedInLists();
    updateVisibilityAndOrbits();
    syncURLState();
    return;
  }

  constellationMgr.clearFocusedSatellite();
  const rt = runtimeMap.get(obj.id);
  if (!rt) return;

  if (obj.is_galactic) {
    state.selectedObj = obj;
    state.lockedObj = obj;
    state.showGalaxyLayer = true;
    galaxyLayer.setVisible(true);
    document.getElementById("toggle-galaxy-btn")?.classList.add("active");
    const dist = computeIdealInspectionDistance(obj, mode);
    const meshR = rt.node.userData.meshRadius || 5000.0;
    controls.minDistance = obj.is_black_hole ? meshR * 1.35 : meshR * 0.4;
    const viewDir = _tmpVec2.set(0.42, 0.36, 0.83).normalize();
    startCameraTween(rt.worldPos, _tmpVec3.copy(rt.worldPos).addScaledVector(viewDir, dist), 1.15);
    updateTrackingBarUI();
    updateInspectorUI();
    highlightSelectedInLists();
    updateVisibilityAndOrbits();
    syncURLState();
    return;
  }

  rt.node.userData.ensureModelLoaded?.();
  if (obj.model_id) prioritizeModelLoad(obj.model_id);
  state.selectedObj = obj;

  const isFastOrbiterSystem =
    obj.id === "MOON" ||
    obj.id === "MARS" ||
    obj.id === "EARTH" ||
    (obj.parent_id && (obj.period_days || 1.0) < 2.5);
  if (isFastOrbiterSystem && state.speedIndex >= 3) {
    state.speedIndex = (obj.period_days && obj.period_days < 0.25) ? 0 : 1;
    syncSpeedSelectUI();
  }

  if ((obj.id === "EPS_002" || obj.id === "EPS_007") && !state.showGalacticBand) {
    state.showGalacticBand = true;
    overlays.galacticGroup.visible = true;
    document.getElementById("toggle-galactic-btn")?.classList.add("active");
  }

  if (mode === "orbit" && !obj.parent_id && obj.category !== "star") {
    state.lockedObj = catalog.byId.get("SUN") || null;
    const dist = computeIdealInspectionDistance(obj, "orbit");
    const objDir = _tmpVec2.copy(rt.worldPos).normalize();
    if (objDir.lengthSq() < 0.01) objDir.set(0.3, 0.5, 0.8).normalize();
    const camOffset = _tmpVec3.set(objDir.x * 0.45, 0.72, objDir.z * 0.45 + 0.35).normalize().multiplyScalar(dist);
    controls.minDistance = 0.0001;
    startCameraTween(_tmpVec.set(0, 0, 0), camOffset, 1.0);
  } else if (mode === "orbit" && obj.parent_id) {
    const parentObj = catalog.byId.get(obj.parent_id);
    const parentRt = runtimeMap.get(obj.parent_id);
    if (parentObj && parentRt) {
      state.lockedObj = parentObj;
      const dist = computeIdealInspectionDistance(obj, "orbit");
      const camDir = _tmpVec2.set(0.45, 0.58, 0.68).normalize();
      controls.minDistance = parentRt.node.userData.meshRadius * 1.35;
      startCameraTween(parentRt.worldPos, _tmpVec3.copy(parentRt.worldPos).addScaledVector(camDir, dist), 0.9);
    }
  } else {
    state.lockedObj = obj;
    const dist = computeIdealInspectionDistance(obj, mode);
    const meshR = rt.node.userData.meshRadius;
    controls.minDistance = Math.max(0.000025, meshR * 1.32);

    const parentRt = obj.parent_id ? runtimeMap.get(obj.parent_id) : null;
    const isNearParentOrbiter =
      parentRt &&
      obj.visual_type?.startsWith("spacecraft") &&
      obj.l1_phase_deg === null &&
      obj.l2_phase_deg === null;

    if (isNearParentOrbiter) {
      _tmpVec2.copy(rt.worldPos).sub(parentRt.worldPos).normalize();
      _tmpVec3.copy(rt.worldPos).negate().normalize();
      _tmpVec2.multiplyScalar(0.86).addScaledVector(_tmpVec3, 0.36);
      _tmpVec2.y += 0.18;
      _tmpVec2.normalize();
    } else if (obj.is_active && obj.visual_type !== "chiron_ringed") {
      if (rt.worldPos.lengthSq() > 1e-8) _tmpVec.copy(rt.worldPos).normalize();
      else _tmpVec.set(1, 0, 0);
      _tmpVec3.set(-_tmpVec.z, 0.28, _tmpVec.x).normalize();
      _tmpVec2.copy(_tmpVec).multiplyScalar(-0.18).addScaledVector(_tmpVec3, 0.98).normalize();
    } else {
      if (rt.worldPos.lengthSq() > 1e-8) _tmpVec.copy(rt.worldPos).normalize().negate();
      else _tmpVec.set(0, 0, -1);
      _tmpVec3.set(-_tmpVec.z, 0.48, _tmpVec.x).normalize();
      _tmpVec2.copy(_tmpVec).multiplyScalar(0.66).addScaledVector(_tmpVec3, 0.75).normalize();
    }
    startCameraTween(rt.worldPos, _tmpVec3.copy(rt.worldPos).addScaledVector(_tmpVec2, dist), 0.95);
  }

  updateTrackingBarUI();
  updateInspectorUI();
  highlightSelectedInLists();
  updateVisibilityAndOrbits();
  syncURLState();
}

function flyToScenePreset(presetName) {
  stopAutoTour();
  closeAllMenus();
  constellationMgr.clearFocusedSatellite();
  controls.minDistance = 0.0001;

  if (presetName === "earth_sats") {
    const earthRt = runtimeMap.get("EARTH");
    if (earthRt) {
      earthRt.node.userData.ensureModelLoaded?.();
      state.selectedObj = earthRt.obj;
      state.lockedObj = earthRt.obj;
      constellationMgr.setEnabled(true);
      document.getElementById("toggle-sats-btn")?.classList.add("active");
      const eR = earthRt.node.userData.meshRadius;
      controls.minDistance = eR * 1.25;
      _tmpVec.copy(earthRt.worldPos).normalize().negate();
      _tmpVec3.set(-_tmpVec.z, 0.44, _tmpVec.x).normalize();
      _tmpVec2.copy(_tmpVec).multiplyScalar(0.62).addScaledVector(_tmpVec3, 0.78).normalize();
      startCameraTween(earthRt.worldPos, _tmpVec3.copy(earthRt.worldPos).addScaledVector(_tmpVec2, eR * 5.2), 0.95);
    }
  } else if (presetName === "inner") {
    state.lockedObj = catalog.byId.get("SUN") || null;
    const r = mapRadiusAU(3.8, state.targetLogBlend);
    startCameraTween(_tmpVec.set(0, 0, 0), _tmpVec2.set(r * 0.35, r * 0.85, r * 1.35), 0.95);
  } else if (presetName === "outer") {
    state.lockedObj = catalog.byId.get("SUN") || null;
    const d03 = catalog.byId.get("DELTA_003");
    if (d03) state.selectedObj = d03;
    const r = mapRadiusAU(210.0, state.targetLogBlend);
    startCameraTween(_tmpVec.set(0, 0, 0), _tmpVec2.set(r * 0.28, r * 0.88, r * 1.25), 1.05);
  } else if (presetName === "oort") {
    state.lockedObj = catalog.byId.get("SUN") || null;
    const r = mapRadiusAU(82000.0, state.targetLogBlend);
    startCameraTween(_tmpVec.set(0, 0, 0), _tmpVec2.set(r * 0.32, r * 0.68, r * 1.32), 1.15);
  } else if (presetName === "local_stars") {
    state.lockedObj = catalog.byId.get("SUN") || null;
    // 100 pc local Solar Neighborhood = 20,000 scene units
    startCameraTween(_tmpVec.set(0, 0, 0), _tmpVec2.set(14000, 12000, 22000), 1.2);
  } else if (presetName === "gaia_bh1") {
    const bh = catalog.byId.get("GAIA_BH1");
    if (bh) { selectAndFlyTo(bh, "auto"); return; }
  } else if (presetName === "cyg_x1") {
    const bh = catalog.byId.get("CYGNUS_X1");
    if (bh) { selectAndFlyTo(bh, "auto"); return; }
  } else if (presetName === "sgr_a") {
    const bh = catalog.byId.get("SGR_A_STAR");
    if (bh) { selectAndFlyTo(bh, "auto"); return; }
  } else if (presetName === "milkyway") {
    // Full 100,000 ly Milky Way overview centered on Galactic Center (8.277 kpc) from North Galactic Pole perspective!
    const gcPos = galacticKpcToSceneInto(8.277, 0.0, 0.0, _tmpVec);
    const ngpOffset = galacticKpcToSceneInto(8.277 - 12.0, -9.0, 24.5, _tmpVec2);
    const sgr = catalog.byId.get("SGR_A_STAR");
    state.selectedObj = sgr || catalog.byId.get("SUN");
    state.lockedObj = null;
    controls.minDistance = 500.0;
    startCameraTween(gcPos, ngpOffset, 1.3);
  }

  updateTrackingBarUI();
  updateInspectorUI();
  updateVisibilityAndOrbits();
}

// ==================== VISIBILITY, FILTERS & BATCHED ORBIT ALPHA UPDATE ====================
function updateVisibilityAndOrbits() {
  const cat = state.activeCategory;
  const selId = state.selectedObj?.id;
  const lockId = state.lockedObj?.id;

  const setBeltFactor = (node, factor) => {
    node.userData.catFactor = factor;
  };
  if (cat === "all") {
    setBeltFactor(beltNodes.mainBelt, 1.0);
    setBeltFactor(beltNodes.kuiper, 1.0);
    setBeltFactor(beltNodes.hillsOort, 0.95);
    setBeltFactor(beltNodes.outerOort, 0.95);
  } else if (cat === "oort_cloud") {
    setBeltFactor(beltNodes.mainBelt, 0.15);
    setBeltFactor(beltNodes.kuiper, 0.25);
    setBeltFactor(beltNodes.hillsOort, 1.55);
    setBeltFactor(beltNodes.outerOort, 1.65);
  } else if (cat === "kuiper_etnos" || cat === "dwarf_planets") {
    setBeltFactor(beltNodes.mainBelt, 0.18);
    setBeltFactor(beltNodes.kuiper, 1.45);
    setBeltFactor(beltNodes.hillsOort, 0.25);
    setBeltFactor(beltNodes.outerOort, 0.20);
  } else if (cat === "asteroids") {
    setBeltFactor(beltNodes.mainBelt, 1.45);
    setBeltFactor(beltNodes.kuiper, 0.15);
    setBeltFactor(beltNodes.hillsOort, 0.10);
    setBeltFactor(beltNodes.outerOort, 0.10);
  } else {
    setBeltFactor(beltNodes.mainBelt, 0.30);
    setBeltFactor(beltNodes.kuiper, 0.30);
    setBeltFactor(beltNodes.hillsOort, 0.22);
    setBeltFactor(beltNodes.outerOort, 0.22);
  }

  const camOriginDistNow = camera.position.length();
  const insideSolarTrueNow = state.logBlend < 0.5 && camOriginDistNow < 110000.0;
  const galacticObjectsAllowedByDist = !insideSolarTrueNow && camOriginDistNow >= 10000.0;

  const alphaArr = batchedOrbits.alphaArr;
  for (const rt of runtimeMap.values()) {
    const obj = rt.obj;
    const isSun = obj.category === "star";
    const isSelectedOrLocked = obj.id === selId || obj.id === lockId;
    const isChildOfSelected = obj.parent_id && (obj.parent_id === selId || obj.parent_id === lockId);
    const matchesCat = isSun || isSelectedOrLocked || isChildOfSelected || obj.is_galactic || objectMatchesCategory(obj, cat);

    if (obj.is_galactic) {
      const focusedGalactic = Boolean(
        state.lockedObj?.is_galactic ||
        (flyTween && state.selectedObj?.id === obj.id)
      );
      rt.node.visible = state.showGalaxyLayer && (focusedGalactic || galacticObjectsAllowedByDist);
    } else {
      rt.node.visible = matchesCat;
    }
    rt.labelEl.classList.toggle("is-selected", obj.id === selId);

    const orbInfo = batchedOrbits.orbitRanges.get(obj.id);
    if (orbInfo) {
      let showOrb = false;
      if (matchesCat && state.orbitMode !== "off") {
        if (state.orbitMode === "all") showOrb = true;
        else if (state.orbitMode === "selected") showOrb = isSelectedOrLocked;
        else {
          showOrb =
            cat !== "all" ||
            isSelectedOrLocked ||
            obj.is_new_discovery ||
            obj.is_signature_highlight ||
            obj.category === "planets" ||
            obj.category === "interstellar" ||
            obj.id === "SEDNA" ||
            obj.id === "PLUTO";
        }
      }
      const alpha = showOrb ? (isSelectedOrLocked ? 0.98 : orbInfo.baseOpacity) : 0.0;
      const end = orbInfo.startVert + orbInfo.vertCount;
      for (let i = orbInfo.startVert; i < end; i++) {
        alphaArr[i] = alpha;
      }
    }
  }
  batchedOrbits.alphaAttr.needsUpdate = true;
}

// ==================== PER-FRAME SIMULATION, GALAXY CROSS-FADE & CAPPED FRUSTUM LABELS ====================
let lastFrameTime = performance.now();
let lastEvictionCheckMs = 0;

const EARTH_ORBIT_LANDMARKS = new Set([
  "MOON", "ISS_LEO", "TIANGONG_CSS", "HUBBLE_HST", "JWST_L2", "EUCLID_L2", "FENGYUN_4B_GEO"
]);

const PANORAMIC_LANDMARKS = new Set([
  "ATLAS_3I", "SW1_29P", "SEDNA", "PLUTO", "BP519_2015", "OORT_OUTER_REP_1"
]);

const GALACTIC_PRIORITY_IDS = new Set([
  "SGR_A_STAR", "GAIA_BH1", "GAIA_BH2", "GAIA_BH3", "CYGNUS_X1", "V404_CYG",
  "GRS_1915_105", "OMEGA_CEN", "M13_HERCULES", "LMC", "SMC"
]);

// Preallocated label candidate pool to avoid per-frame array/object allocation churn
const _labelCandidates = [];

function updateSimulationPositions(dtSec) {
  if (state.isPlaying) {
    const speedDaysPerSec = SPEED_TIERS[state.speedIndex]?.daysPerSec ?? 1.0;
    state.simJD += speedDaysPerSec * dtSec;
  }

  // Smooth GPU scale morphing (zero CPU geometry rebuild!)
  if (Math.abs(state.logBlend - state.targetLogBlend) > 1e-4) {
    const prevBlend = state.logBlend;
    const step = Math.min(1.0, dtSec * 3.8);
    state.logBlend = prevBlend + (state.targetLogBlend - prevBlend) * step;
    if (Math.abs(state.logBlend - state.targetLogBlend) < 1e-3) {
      state.logBlend = state.targetLogBlend;
    }
    for (const bNode of Object.values(beltNodes)) {
      bNode.userData.uniforms.uLogBlend.value = state.logBlend;
    }
    batchedOrbits.uniforms.uLogBlend.value = state.logBlend;
    overlays.updateOverlaysScaleAndLang(state.logBlend, null);
  }

  // Capture locked object's previous world position
  const isLockedConstellation = Boolean(state.lockedObj?.is_constellation_sat);
  const lockedRt = (!isLockedConstellation && state.lockedObj) ? runtimeMap.get(state.lockedObj.id) : null;
  let hadPrevLocked = false;
  if (isLockedConstellation) {
    hadPrevLocked = Boolean(constellationMgr.getFocusedWorldPosition(_prevLockedPos));
  } else if (lockedRt) {
    _prevLockedPos.copy(lockedRt.worldPos);
    hadPrevLocked = true;
  }

  const nowMs = performance.now();
  const nowSec = nowMs * 0.001;

  // Compute seamless Galactic cross-fade factor (strictly 0 inside Solar System & Oort Cloud -> 1 in Milky Way)
  const camOriginDist = camera.position.length();
  const liveCamDistAU = state.logBlend > 0.5
    ? LOG_R0 * (Math.exp(Math.min(20, camOriginDist / LOG_S0)) - 1.0)
    : camOriginDist;
  const insideTrueScaleSolar = state.logBlend < 0.5 && liveCamDistAU < 110000.0;
  const galRamp = state.lockedObj?.is_galactic
    ? 1.0
    : (insideTrueScaleSolar ? 0.0 : THREE.MathUtils.clamp((camOriginDist - 320.0) / 2800.0, 0.0, 1.0));
  state.galacticFactor = galRamp;
  const solarFade = insideTrueScaleSolar
    ? 1.0
    : (1.0 - THREE.MathUtils.clamp((camOriginDist - 420.0) / 1400.0, 0.0, 1.0));

  batchedOrbits.uniforms.uGlobalFade.value = solarFade;
  batchedOrbits.mesh.visible = solarFade > 0.01 && state.orbitMode !== "off";
  adamOverlay.update(state.logBlend, solarFade);

  for (const bNode of Object.values(beltNodes)) {
    const f = (bNode.userData.catFactor ?? 1.0) * solarFade;
    bNode.userData.uniforms.uOpacity.value = bNode.userData.baseOpacity * f;
    bNode.visible = f > 0.015;
  }
  overlays.ringsGroup.visible = state.showRings && solarFade > 0.15;
  overlays.galacticGroup.visible = state.showGalacticBand && solarFade > 0.15;
  overlays.setOverlayLabelsVisible(state.showLabels && solarFade > 0.35);

  // Pass 1: Update Sun & Heliocentric Primary Bodies (skipped cleanly when zoomed deep into Milky Way)
  if (solarFade > 0.005 || !state.lockedObj?.is_galactic) {
    for (const rt of runtimeMap.values()) {
      const obj = rt.obj;
      if (obj.parent_id || obj.is_galactic) continue;

      if (obj.category === "star") {
        rt.worldPos.set(0, 0, 0);
        rt.node.position.set(0, 0, 0);
        if (rt.node.userData.sunUniforms) rt.node.userData.sunUniforms.uTime.value = nowSec;
      } else {
        rt.liveHelioR_AU = computeLocalKeplerianEclipticAU(obj, state.simJD, rt.eclPosAU);
        helioAUToSceneInto(rt.eclPosAU[0], rt.eclPosAU[1], rt.eclPosAU[2], state.logBlend, rt.worldPos);
        rt.node.position.copy(rt.worldPos);
      }

      updateBodyPhysicalRotation(rt, state.simJD, null);
      if (obj.visual_type === "oumuamua_cigar" && rt.node.userData.rotatable) {
        rt.node.userData.rotatable.rotation.z = ((state.simJD - DISCOVERY_EPOCH_JD) * 18.8) % TWO_PI;
      }
      if (rt.node.userData.updateShaderSunVectors) {
        rt.node.userData.updateShaderSunVectors(rt.worldPos);
      }
      if (rt.node.userData.cometTimeUniform) {
        rt.node.userData.cometTimeUniform.value = nowSec;
      }
      if (rt.node.userData.tailGroup && rt.worldPos.lengthSq() > 1e-8) {
        _tmpVec.copy(rt.worldPos).normalize();
        _tmpQuat.setFromUnitVectors(_xAxisUnit, _tmpVec);
        rt.node.userData.tailGroup.quaternion.copy(_tmpQuat);
      }
    }

    // Pass 2: Tier-1 Planetary Moons & Tier-2 Lunar Sub-Orbiters
    for (let tierPass = 0; tierPass < 2; tierPass++) {
      for (const rt of runtimeMap.values()) {
        const obj = rt.obj;
        if (!obj.parent_id || obj.is_galactic) continue;
        const parentRt = runtimeMap.get(obj.parent_id);
        if (!parentRt) continue;
        const isTier2 = Boolean(parentRt.obj.parent_id);
        if ((tierPass === 0 && isTier2) || (tierPass === 1 && !isTier2)) continue;

        computeChildSceneOffset(parentRt, obj, state.simJD, _tmpVec);
        rt.worldPos.copy(parentRt.worldPos).add(_tmpVec);
        rt.node.position.copy(rt.worldPos);
        rt.liveHelioR_AU = parentRt.liveHelioR_AU;

        updateBodyPhysicalRotation(rt, state.simJD, parentRt);
        if (rt.node.userData.updateShaderSunVectors) {
          rt.node.userData.updateShaderSunVectors(rt.worldPos);
        }
      }
    }

    const earthRt = runtimeMap.get("EARTH");
    if (earthRt && earthRt.satOrbitGroup) {
      const curAng = Math.atan2(-earthRt.eclPosAU[1], earthRt.eclPosAU[0]);
      for (const [chId, ring] of earthRt.satRingsMap.entries()) {
        const chObj = catalog.byId.get(chId);
        if (chObj && (chObj.l1_phase_deg !== null || chObj.l2_phase_deg !== null)) {
          if (ring.userData.initAng === undefined) ring.userData.initAng = curAng;
          ring.rotation.y = curAng - ring.userData.initAng;
        }
      }
    }
    constellationMgr.updatePerFrame(state.simJD, camera, state.activeCategory);
  }

  // Update Milky Way Galaxy Layer & Relativistic Black Hole Systems
  const focusedGalacticBH = Boolean(
    state.lockedObj?.is_black_hole ||
    (flyTween && state.selectedObj?.is_black_hole)
  );
  const focusedAnyGalactic = Boolean(
    state.lockedObj?.is_galactic ||
    (flyTween && state.selectedObj?.is_galactic)
  );
  _scaleInfo.logBlend = state.logBlend;
  _scaleInfo.cameraDistScene = camOriginDist;
  _scaleInfo.cameraDistAU = liveCamDistAU;
  _scaleInfo.cameraDistPc = camOriginDist / GALAXY_SCENE_PER_PC;
  _scaleInfo.simJD = state.simJD;
  _scaleInfo.galacticFactor = state.galacticFactor;
  _scaleInfo.focusedOnBlackHole = focusedGalacticBH;
  _scaleInfo.focusedObjectId = state.lockedObj?.id || (flyTween ? state.selectedObj?.id : null) || null;

  if (state.showGalaxyLayer) {
    galaxyLayer.update(dtSec, camera, _scaleInfo);
    for (let i = 0; i < galacticBlackHoleControllers.length; i++) {
      const entry = galacticBlackHoleControllers[i];
      const isTargetBH =
        state.lockedObj?.id === entry.obj.id ||
        (flyTween && state.selectedObj?.id === entry.obj.id);
      if (isTargetBH || focusedAnyGalactic) {
        entry.bhSys.setOpacity(1.0);
        entry.bhSys.update(dtSec, camera, _scaleInfo);
        entry.node.visible = true;
      } else if (insideTrueScaleSolar || camOriginDist < 10000.0) {
        // Strictly hidden (opacity=0, visible=false) everywhere inside Solar System / Oort Cloud (< 50 pc)
        entry.bhSys.setOpacity(0.0);
        entry.node.visible = false;
      } else {
        const bhDistFade = THREE.MathUtils.smoothstep(camOriginDist, 10000.0, 20000.0);
        entry.bhSys.setOpacity(bhDistFade);
        entry.bhSys.update(dtSec, camera, _scaleInfo);
        entry.node.visible = entry.bhSys.getOpacity() > 0.002;
      }
    }
  } else {
    for (let i = 0; i < galacticBlackHoleControllers.length; i++) {
      galacticBlackHoleControllers[i].bhSys.setOpacity(0.0);
      galacticBlackHoleControllers[i].node.visible = false;
    }
  }

  // Co-move camera with locked object or advance fly-to tween
  let hasCurLocked = false;
  if (isLockedConstellation) {
    hasCurLocked = Boolean(constellationMgr.getFocusedWorldPosition(_curLockedPos));
  } else if (lockedRt) {
    _curLockedPos.copy(lockedRt.worldPos);
    hasCurLocked = true;
  }

  if (flyTween) {
    const elapsed = nowMs - flyTween.startTime;
    const u = Math.min(1.0, elapsed / flyTween.durationMs);
    const e = easeOutCubic(u);
    if (hasCurLocked) {
      _tmpVec.copy(_curLockedPos).sub(flyTween.toTarget);
      flyTween.toTarget.add(_tmpVec);
      flyTween.toPos.add(_tmpVec);
    }
    controls.target.lerpVectors(flyTween.fromTarget, flyTween.toTarget, e);
    camera.position.lerpVectors(flyTween.fromPos, flyTween.toPos, e);
    if (u >= 1.0) flyTween = null;
  } else if (hasCurLocked && hadPrevLocked) {
    _tmpVec.copy(_curLockedPos).sub(_prevLockedPos);
    controls.target.add(_tmpVec);
    camera.position.add(_tmpVec);
  }

  // Frustum setup for O(N) culling & priority-capped CSS2D labels
  camera.updateMatrixWorld();
  _projScreenMat.multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse);
  _frustum.setFromProjectionMatrix(_projScreenMat);

  const camPos = camera.position;
  const selId = state.selectedObj?.id;
  const lockId = state.lockedObj?.id;
  const hovId = state.hoveredObj?.id;
  const cat = state.activeCategory;
  const pulse = 1.0 + 0.12 * Math.sin(nowSec * 3.4);
  const doEvictionCheck = nowMs - lastEvictionCheckMs > 1500;
  if (doEvictionCheck) lastEvictionCheckMs = nowMs;

  const inCloseBodyInspection =
    lockedRt &&
    lockedRt.obj.category !== "star" &&
    !lockedRt.obj.is_galactic &&
    camPos.distanceTo(lockedRt.worldPos) < lockedRt.node.userData.meshRadius * 18.0;

  _labelCandidates.length = 0;

  for (const rt of runtimeMap.values()) {
    rt.labelObj.visible = false;
    if (!rt.node.visible) continue;

    const obj = rt.obj;
    const distToCam = camPos.distanceTo(rt.worldPos);
    const meshR = rt.node.userData.meshRadius || 0.001;
    const ratio = distToCam / Math.max(1e-7, meshR);
    const isFocusObj = obj.id === selId || obj.id === lockId;

    if (!obj.is_galactic) {
      // Lazy on-demand GLB load & far-body eviction
      if (isFocusObj || (ratio < 32.0 && solarFade > 0.2)) {
        rt.node.userData.ensureModelLoaded?.();
      } else if (doEvictionCheck && (ratio > 120.0 || solarFade < 0.05)) {
        rt.node.userData.evictModel?.();
      }

      if (rt.node.userData.isSpacecraft && rt.node.userData.rotatable) {
        rt.node.userData.rotatable.visible = isFocusObj || ratio < 40.0;
      }

      if (rt.node.userData.beaconSprite) {
        let fade = THREE.MathUtils.clamp((ratio - 8.0) / 28.0, 0.0, 1.0) * (obj.category === "star" ? 1.0 : solarFade);
        if (obj.parent_id && !isFocusObj && cat !== "moons_l2") {
          const pRt = runtimeMap.get(obj.parent_id);
          const pRatio = pRt ? camPos.distanceTo(pRt.worldPos) / Math.max(1e-7, pRt.node.userData.meshRadius) : 999.0;
          fade *= THREE.MathUtils.clamp(1.0 - (pRatio - 13.0) / 10.0, 0.0, 1.0);
        }
        rt.node.userData.beaconSprite.material.opacity = fade * (obj.is_new_discovery ? 0.95 : (obj.parent_id ? 0.42 : 0.78));
        rt.node.userData.beaconSprite.visible = fade > 0.02;
      }
      if (rt.node.userData.spacecraftPip) {
        const showScPip = (cat === "spacecraft" || isFocusObj) && ratio > 16.0 && solarFade > 0.1;
        rt.node.userData.spacecraftPip.visible = showScPip;
        if (showScPip) {
          const fade = THREE.MathUtils.clamp((ratio - 16.0) / 24.0, 0.0, 1.0) * solarFade;
          rt.node.userData.spacecraftPip.material.opacity = fade * (isFocusObj ? 0.82 : 0.36);
        }
      }
      if (rt.node.userData.discoveryReticle) {
        const fade = THREE.MathUtils.clamp((ratio - 5.5) / 18.0, 0.0, 1.0) * solarFade;
        const sc = (isFocusObj ? 0.046 : 0.033) * pulse;
        rt.node.userData.discoveryReticle.scale.set(sc, sc, 1);
        rt.node.userData.discoveryReticle.material.opacity = fade * (isFocusObj ? 1.0 : 0.85);
        rt.node.userData.discoveryReticle.visible = fade > 0.02;
      }

      if (rt.satOrbitGroup) {
        const childSelected = (state.selectedObj?.parent_id === obj.id) || (state.lockedObj?.parent_id === obj.id);
        if ((obj.id === "EARTH" && constellationMgr.enabled && !childSelected && cat !== "spacecraft" && cat !== "moons_l2") || solarFade < 0.1) {
          rt.satOrbitGroup.visible = false;
        } else {
          const maxShowRatio = (cat === "moons_l2" || cat === "spacecraft") ? 110.0 : (childSelected ? 75.0 : 34.0);
          rt.satOrbitGroup.visible = ratio < maxShowRatio;
          if (rt.satOrbitGroup.visible) {
            for (const [chId, ring] of rt.satRingsMap.entries()) {
              const isChSel = chId === selId || chId === lockId;
              const isScRing = ring.userData.isSpacecraftRing;
              if (isChSel) {
                ring.visible = true;
                ring.material.opacity = 0.90;
              } else if (isScRing) {
                const f = cat === "spacecraft"
                  ? THREE.MathUtils.clamp(1.0 - (ratio - 35.0) / 45.0, 0.0, 1.0)
                  : THREE.MathUtils.clamp(1.0 - (ratio - 4.2) / 4.3, 0.0, 1.0);
                ring.visible = f > 0.02;
                ring.material.opacity = (cat === "spacecraft" ? 0.48 : 0.24) * f;
              } else {
                const f = cat === "moons_l2"
                  ? THREE.MathUtils.clamp(1.0 - (ratio - 55.0) / 55.0, 0.0, 1.0)
                  : THREE.MathUtils.clamp(1.0 - (ratio - 14.0) / 20.0, 0.0, 1.0);
                ring.visible = f > 0.02;
                ring.material.opacity = (ring.userData.baseOpacity || 0.35) * f;
              }
            }
          }
        }
      }
    } else if (rt.node.userData.beaconSprite) {
      const lmGate = focusedAnyGalactic
        ? 1.0
        : (insideTrueScaleSolar ? 0.0 : THREE.MathUtils.smoothstep(camOriginDist, 10000.0, 20000.0));
      const lmAlpha = 0.54 * state.galacticFactor * lmGate;
      const showLm = lmAlpha > 0.015 && ratio > 2.2;
      rt.node.userData.beaconSprite.visible = showLm;
      rt.node.userData.beaconSprite.material.opacity = showLm ? lmAlpha : 0.0;
    }

    // Frustum-culled priority label selection
    if (!state.showLabels) continue;
    if (!_frustum.containsPoint(rt.worldPos)) continue;

    const isSel = obj.id === selId || obj.id === lockId || obj.id === hovId;
    let priority = -1;

    if (obj.is_galactic) {
      const galLabelAllowed = focusedAnyGalactic || (!insideTrueScaleSolar && camOriginDist >= 10000.0);
      if (galLabelAllowed && (state.galacticFactor > 0.18 || isSel || cat === "galactic")) {
        if (isSel) priority = ratio > 4.2 ? 1000 : -1;
        else if (GALACTIC_PRIORITY_IDS.has(obj.id) || obj.is_black_hole) priority = 600 - Math.log10(Math.max(1, distToCam)) * 20;
        else if (cat === "galactic") priority = 400 - Math.log10(Math.max(1, distToCam)) * 20;
      }
    } else if (state.galacticFactor > 0.65) {
      if (obj.category === "star") priority = 850;
    } else {
      if (inCloseBodyInspection) {
        const lockObj = lockedRt.obj;
        const related =
          obj.id === lockObj.id ||
          obj.parent_id === lockObj.id ||
          obj.id === lockObj.parent_id ||
          (lockObj.parent_id && obj.parent_id === lockObj.parent_id);
        if (!related) continue;
      }
      if (isSel) {
        if (ratio > 5.8) priority = 1000;
      } else if (obj.parent_id) {
        const pRt = runtimeMap.get(obj.parent_id);
        const pDist = pRt ? camPos.distanceTo(pRt.worldPos) : 999;
        const pR = pRt?.node.userData.meshRadius || 0.01;
        if (obj.parent_id === "EARTH") {
          if (pDist < pR * 2.2 || (EARTH_ORBIT_LANDMARKS.has(obj.id) && pDist < pR * 22.0)) priority = 500 - distToCam;
        } else if (rt.node.userData.isSpacecraft) {
          if ((cat === "spacecraft" && pDist < pR * 45.0) || pDist < pR * 7.5) priority = 420 - distToCam;
        } else if ((cat === "moons_l2" && pDist < pR * 95.0) || pDist < pR * 20.0) {
          priority = 460 - distToCam;
        }
      } else if (cat !== "all") {
        const isHeadline = !obj.id.startsWith("EUCLID_EES149_GOLD_") || obj.id === "EUCLID_EES149_GOLD_18";
        if (isHeadline || camOriginDist < 85.0) priority = (obj.is_new_discovery ? 700 : 500) - Math.log10(Math.max(0.01, distToCam)) * 30;
      } else {
        if (obj.category === "star") priority = 900;
        else if (obj.category === "planets") priority = 780 - Math.log10(Math.max(0.1, distToCam)) * 10;
        else if (obj.is_new_discovery && (!obj.id.startsWith("EUCLID_EES149_GOLD_") || obj.id === "EUCLID_EES149_GOLD_18")) priority = 720 - Math.log10(Math.max(0.1, distToCam)) * 15;
        else if (PANORAMIC_LANDMARKS.has(obj.id)) priority = 620 - Math.log10(Math.max(0.1, distToCam)) * 15;
      }
    }

    if (priority >= 0) {
      rt._labelPriority = priority;
      _labelCandidates.push(rt);
    }
  }

  // Zero-allocation 2D screen-space AABB overlap rejection pass (eliminates stacked CSS2D label piles)
  if (_labelCandidates.length > 1) {
    _labelCandidates.sort((a, b) => b._labelPriority - a._labelPriority);
  }
  const viewW = window.innerWidth;
  const viewH = window.innerHeight;
  const halfViewW = viewW * 0.5;
  const halfViewH = viewH * 0.5;
  const inspOpenDesktop = !state.inspectorCollapsed && viewW > 960;
  let acceptedLabels = 0;

  for (let i = 0; i < _labelCandidates.length && acceptedLabels < MAX_VISIBLE_LABELS; i++) {
    const cand = _labelCandidates[i];
    _labelProjTmp.set(
      cand.worldPos.x,
      cand.worldPos.y + cand.labelObj.position.y * cand.node.scale.y,
      cand.worldPos.z
    );
    _labelProjTmp.project(camera);
    if (_labelProjTmp.z < -1.0 || _labelProjTmp.z > 1.0) continue;

    const sx = _labelProjTmp.x * halfViewW + halfViewW;
    const sy = -_labelProjTmp.y * halfViewH + halfViewH;
    const hw = cand._labelHalfW || 68.0;
    const bMinX = sx - hw;
    const bMaxX = sx + hw;
    const bMinY = sy - 36.0;
    const bMaxY = sy + 2.0;

    const isPinnedSel = cand._labelPriority >= 999;
    if (!isPinnedSel) {
      if (bMinX < 10.0 || bMaxX > viewW - 10.0 || bMinY < 80.0 || bMaxY > viewH - 68.0) continue;
      if (inspOpenDesktop && bMaxX > viewW - 446.0 && bMaxY > 82.0 && bMinY < viewH - 80.0) continue;
    }

    let overlaps = false;
    for (let j = 0; j < acceptedLabels; j++) {
      const base = j * 4;
      if (
        bMinX < _acceptedLabelBoxes[base + 2] &&
        bMaxX > _acceptedLabelBoxes[base + 0] &&
        bMinY < _acceptedLabelBoxes[base + 3] &&
        bMaxY > _acceptedLabelBoxes[base + 1]
      ) {
        overlaps = true;
        break;
      }
    }
    if (!overlaps) {
      const wIdx = acceptedLabels * 4;
      _acceptedLabelBoxes[wIdx + 0] = bMinX;
      _acceptedLabelBoxes[wIdx + 1] = bMinY;
      _acceptedLabelBoxes[wIdx + 2] = bMaxX;
      _acceptedLabelBoxes[wIdx + 3] = bMaxY;
      acceptedLabels++;
      cand.labelObj.visible = true;
    }
  }

  // De-collide reference ring distance labels against accepted higher-priority planet/body labels
  if (state.showLabels && overlays.ringsGroup.visible && acceptedLabels > 0) {
    const rChildren = overlays.ringsGroup.children;
    for (let r = 0; r < rChildren.length; r++) {
      const ch = rChildren[r];
      if (!ch.isCSS2DObject || !ch.visible) continue;
      _labelProjTmp.copy(ch.position).project(camera);
      if (_labelProjTmp.z < -1.0 || _labelProjTmp.z > 1.0) {
        ch.visible = false;
        continue;
      }
      const rx = _labelProjTmp.x * halfViewW + halfViewW;
      const ry = -_labelProjTmp.y * halfViewH + halfViewH;
      const rMinX = rx - 66.0, rMaxX = rx + 66.0, rMinY = ry - 15.0, rMaxY = ry + 15.0;
      for (let j = 0; j < acceptedLabels; j++) {
        const base = j * 4;
        if (
          rMinX < _acceptedLabelBoxes[base + 2] &&
          rMaxX > _acceptedLabelBoxes[base + 0] &&
          rMinY < _acceptedLabelBoxes[base + 3] &&
          rMaxY > _acceptedLabelBoxes[base + 1]
        ) {
          ch.visible = false;
          break;
        }
      }
    }
  }

  if (doEvictionCheck) {
    evictLRUModels(selId ? [catalog.byId.get(selId)?.model_id] : null);
  }
}

// ==================== 3D PICKING (ZERO-ALLOC + OFF-THREAD WORKER SAT PICK) ====================
function pickBodyAtClientXY(clientX, clientY) {
  const w = window.innerWidth;
  const h = window.innerHeight;
  let bestObj = null;
  let bestDistPx = 20.0;

  for (const rt of runtimeMap.values()) {
    if (!rt.node.visible) continue;
    if (!rt.obj.is_galactic && state.galacticFactor > 0.7 && rt.obj.category !== "star") continue;
    if (rt.obj.is_galactic && state.galacticFactor < 0.15) continue;
    if (rt.obj.parent_id && state.activeCategory !== "spacecraft" && state.activeCategory !== "moons_l2") {
      const pRt = runtimeMap.get(rt.obj.parent_id);
      if (pRt && camera.position.distanceTo(pRt.worldPos) > pRt.node.userData.meshRadius * 38.0) continue;
    }
    _pickProj.copy(rt.worldPos).project(camera);
    if (_pickProj.z < -1.0 || _pickProj.z > 1.0) continue;
    const sx = (_pickProj.x * 0.5 + 0.5) * w;
    const sy = (-_pickProj.y * 0.5 + 0.5) * h;
    const dPx = Math.hypot(sx - clientX, sy - clientY);
    const weighted = rt.obj.is_new_discovery || rt.obj.is_black_hole ? dPx * 0.85 : dPx;
    if (weighted < bestDistPx) {
      bestDistPx = weighted;
      bestObj = rt.obj;
    }
  }
  return bestObj;
}

canvas.addEventListener("pointerdown", (e) => {
  _pointerDownXY.set(e.clientX, e.clientY);
});

canvas.addEventListener("pointerup", async (e) => {
  if (Math.hypot(e.clientX - _pointerDownXY.x, e.clientY - _pointerDownXY.y) > 5.0) return;
  let hit = pickBodyAtClientXY(e.clientX, e.clientY);
  if (!hit || hit.id === "EARTH") {
    const satHit = await constellationMgr.pickNearestAtScreenXYAsync(e.clientX, e.clientY, camera, state.simJD);
    if (satHit) hit = satHit;
  }
  if (hit) {
    stopAutoTour();
    selectAndFlyTo(hit, "auto");
  }
});

// Throttled pointermove hover (never runs 22,022-sat loop!)
let lastHoverCheckMs = 0;
canvas.addEventListener("pointermove", (e) => {
  const now = performance.now();
  if (now - lastHoverCheckMs < 40) return;
  lastHoverCheckMs = now;
  const hit = pickBodyAtClientXY(e.clientX, e.clientY);
  state.hoveredObj = hit;
  canvas.style.cursor = hit ? "pointer" : "grab";
});

// ==================== TOP BAR DROPDOWN MENUS ====================
const menuGroups = Array.from(document.querySelectorAll(".menu-group"));

function closeAllMenus() {
  for (const g of menuGroups) {
    g.classList.remove("open");
    g.querySelector(".menu-trigger")?.setAttribute("aria-expanded", "false");
  }
}

for (const g of menuGroups) {
  const trigger = g.querySelector(".menu-trigger");
  trigger?.addEventListener("click", (ev) => {
    ev.stopPropagation();
    const wasOpen = g.classList.contains("open");
    closeAllMenus();
    if (!wasOpen) {
      g.classList.add("open");
      trigger.setAttribute("aria-expanded", "true");
    }
  });
}

document.addEventListener("click", (ev) => {
  if (!ev.target.closest(".menu-group")) closeAllMenus();
  if (!ev.target.closest(".search-wrapper")) {
    searchDropdown.style.display = "none";
  }
});
document.addEventListener("keydown", (ev) => {
  if (ev.key === "Escape") {
    closeAllMenus();
    searchDropdown.style.display = "none";
  }
});

// ==================== COMPACT EXPANDABLE RIGHT INSPECTOR ====================
function setActiveInspectorTab(secKey, allowToggleCollapse = false) {
  const body = document.getElementById("inspector-body");
  if (allowToggleCollapse && state.activeInspectorTab === secKey && !state.inspectorBodyCollapsed) {
    state.inspectorBodyCollapsed = true;
    body.classList.add("body-collapsed");
    document.querySelectorAll(".insp-tab").forEach((t) => t.classList.remove("active"));
    return;
  }
  state.activeInspectorTab = secKey;
  state.inspectorBodyCollapsed = false;
  body.classList.remove("body-collapsed");
  document.querySelectorAll(".insp-tab").forEach((t) => {
    t.classList.toggle("active", t.dataset.sec === secKey);
  });
  document.querySelectorAll(".insp-section").forEach((s) => {
    s.classList.toggle("active", s.dataset.secPanel === secKey);
  });
}

document.querySelectorAll(".insp-tab").forEach((tab) => {
  tab.addEventListener("click", () => setActiveInspectorTab(tab.dataset.sec, true));
});

// ==================== UI RENDERERS (EXPLORE DROPDOWN, INSPECTOR, TIME BAR) ====================
function formatDistAU(valAU) {
  if (valAU === null || valAU === undefined || !Number.isFinite(valAU)) return "—";
  const abs = Math.abs(valAU);
  if (abs === 0) return "0 AU";
  if (abs < 0.01) return `${(valAU * AU_KM).toLocaleString("en-US", { maximumFractionDigits: 0 })} km`;
  if (abs >= 1000) return `${valAU.toLocaleString("en-US", { maximumFractionDigits: 0 })} AU`;
  if (abs >= 100) return `${valAU.toFixed(1)} AU`;
  return `${valAU.toFixed(3)} AU`;
}

function formatObjectDist(obj) {
  if (obj.is_galactic) {
    const kpc = obj.dist_kpc || 0;
    return kpc >= 1.0 ? `${kpc.toFixed(2)} kpc` : `${Math.round(kpc * 1000)} pc`;
  }
  if (obj.category === "star") return "0 AU";
  return formatDistAU(obj.parent_id ? obj.a_au : (obj.r_au || Math.abs(obj.a_au)));
}

function renderCategoryFilterBar() {
  const bar = document.getElementById("category-filter-bar");
  if (!bar) return;
  bar.innerHTML = "";

  for (const catKey of CATEGORY_ORDER) {
    const count = catalog.objects.filter((o) => objectMatchesCategory(o, catKey)).length;
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = `cat-pill${catKey === "discoveries" ? " cat-discoveries" : ""}${state.activeCategory === catKey ? " active" : ""}`;

    const left = document.createElement("span");
    left.className = "cat-pill-left";
    const dot = document.createElement("span");
    dot.className = "cat-dot";
    dot.style.background = CATEGORY_DOT_COLORS[catKey] || "#38bdf8";
    const lbl = document.createElement("span");
    lbl.textContent = getCategoryLabel(catKey, state.lang, catalog.customCategories[catKey]);
    left.append(dot, lbl);

    const cnt = document.createElement("span");
    cnt.className = "cat-count";
    cnt.textContent = String(count);

    btn.append(left, cnt);
    btn.addEventListener("click", () => {
      stopAutoTour();
      state.activeCategory = catKey;
      renderCategoryFilterBar();
      renderCatalogObjectList();
      updateVisibilityAndOrbits();
      syncURLState();
      if (catKey === "oort_cloud") flyToScenePreset("oort");
      else if (catKey === "galactic") flyToScenePreset("milkyway");
    });
    bar.appendChild(btn);
  }
}

function renderCatalogObjectList() {
  const container = document.getElementById("object-list-scroll");
  const countLabel = document.getElementById("catalog-count-label");
  if (!container || !countLabel) return;
  container.innerHTML = "";

  const filtered = catalog.objects.filter((o) => objectMatchesCategory(o, state.activeCategory));
  filtered.sort((a, b) => {
    const rank = (x) =>
      x.category === "star" ? 0
        : x.is_black_hole && x.bh_type === "smbh" ? 1
        : x.is_new_discovery ? 2
        : x.is_black_hole ? 3
        : x.category === "planets" ? 4
        : x.is_galactic ? 5
        : x.is_signature_highlight ? 6 : 7;
    const ra = rank(a), rb = rank(b);
    if (ra !== rb) return ra - rb;
    return Math.abs(a.a_au || a.dist_kpc || 0) - Math.abs(b.a_au || b.dist_kpc || 0);
  });

  const newCount = filtered.filter((o) => o.is_new_discovery).length;
  countLabel.textContent = tr(state.lang, "catalogCountFmt", { shown: filtered.length, newCount });

  const frag = document.createDocumentFragment();
  for (const obj of filtered) {
    const row = document.createElement("button");
    row.type = "button";
    row.className = `obj-row-btn${state.selectedObj?.id === obj.id ? " selected" : ""}`;
    row.dataset.objId = obj.id;

    const left = document.createElement("div");
    left.className = "obj-row-left";
    const dot = document.createElement("span");
    dot.className = "cat-dot";
    dot.style.background = obj.color || "#38bdf8";
    left.appendChild(dot);

    if (obj.is_new_discovery) {
      const badge = document.createElement("span");
      badge.className = "pill-new-mini";
      badge.textContent = state.lang === "zh" ? "新" : "NEW";
      left.appendChild(badge);
    }

    const nameEl = document.createElement("span");
    nameEl.className = "obj-row-name";
    nameEl.textContent = getObjectName(obj, state.lang);
    left.appendChild(nameEl);

    const distEl = document.createElement("span");
    distEl.className = "obj-row-dist";
    distEl.textContent = formatObjectDist(obj);

    row.append(left, distEl);
    row.addEventListener("click", () => {
      stopAutoTour();
      selectAndFlyTo(obj, "auto");
    });
    frag.appendChild(row);
  }
  container.appendChild(frag);
}

function highlightSelectedInLists() {
  const selId = state.selectedObj?.id;
  document.querySelectorAll(".obj-row-btn").forEach((el) => {
    el.classList.toggle("selected", el.dataset.objId === selId);
  });
}

function updateTrackingBarUI() {
  const pill = document.getElementById("tracking-pill");
  const nameEl = document.getElementById("tracking-name");
  const relBtn = document.getElementById("release-lock-btn");
  if (state.lockedObj) {
    pill.textContent = tr(state.lang, "trackingLabel");
    nameEl.textContent = getObjectName(state.lockedObj, state.lang);
    relBtn.style.display = state.lockedObj.id === "SUN" ? "none" : "inline-block";
  } else {
    pill.textContent = tr(state.lang, "freeCamLabel");
    nameEl.textContent = "—";
    relBtn.style.display = "none";
  }
}

function makeTelemetryCell(keyStr, valStr) {
  const div = document.createElement("div");
  div.className = "telemetry-cell";
  const k = document.createElement("div");
  k.className = "telemetry-key";
  k.textContent = keyStr;
  const v = document.createElement("div");
  v.className = "telemetry-val";
  v.textContent = valStr;
  div.append(k, v);
  return div;
}

function updateInspectorUI() {
  const obj = state.selectedObj || catalog.byId.get("DELTA_003") || catalog.objects[0];
  if (!obj) return;
  const rt = runtimeMap.get(obj.id);

  const badgesWrap = document.getElementById("insp-badges");
  badgesWrap.innerHTML = "";
  const catSpan = document.createElement("span");
  catSpan.className = "inspector-cat-tag";
  catSpan.textContent = getCategoryLabel(obj.category, state.lang, catalog.customCategories[obj.category]);
  badgesWrap.appendChild(catSpan);

  const customBadge = state.lang === "zh" ? obj.discovery_badge_zh : obj.discovery_badge_en;
  if (obj.is_new_discovery || customBadge) {
    const dSpan = document.createElement("span");
    dSpan.className = "inspector-disc-tag";
    dSpan.textContent = customBadge || tr(state.lang, "newBadge");
    badgesWrap.appendChild(dSpan);
  }

  document.getElementById("insp-title").textContent = getObjectName(obj, state.lang);
  document.getElementById("insp-id-sub").textContent = `ID: ${obj.id}`;
  document.getElementById("insp-headline").textContent = getObjectHeadline(obj, state.lang) || getObjectName(obj, state.lang);
  document.getElementById("insp-summary").textContent = getObjectSummary(obj, state.lang);

  // Orbit & Ephemeris Grid
  const orbGrid = document.getElementById("insp-orbital-grid");
  orbGrid.innerHTML = "";
  if (obj.is_galactic) {
    orbGrid.appendChild(makeTelemetryCell(
      tr(state.lang, "lblGalDist"),
      `${(obj.dist_kpc || 0).toFixed(3)} kpc (${Math.round(obj.dist_ly || 0).toLocaleString("en-US")} ly)`
    ));
    if (obj.ra_deg !== null && obj.dec_deg !== null) {
      orbGrid.appendChild(makeTelemetryCell(tr(state.lang, "lblRaDec"), `${obj.ra_deg.toFixed(2)}°, ${obj.dec_deg.toFixed(2)}°`));
    }
    if (obj.period_days) {
      orbGrid.appendChild(makeTelemetryCell(tr(state.lang, "lblPeriod"), `${obj.period_days.toFixed(2)} d`));
    }
    if (obj.is_black_hole) {
      orbGrid.appendChild(makeTelemetryCell(tr(state.lang, "lblEccentricity"), (obj.ecc || 0).toFixed(3)));
      orbGrid.appendChild(makeTelemetryCell(tr(state.lang, "lblInclination"), `${(obj.inc_deg || 0).toFixed(1)}°`));
    }
  } else if (obj.category === "star") {
    orbGrid.appendChild(makeTelemetryCell(tr(state.lang, "lblHelioDist"), "0.000 AU"));
    orbGrid.appendChild(makeTelemetryCell(tr(state.lang, "lblPeriod"), tr(state.lang, "valSolarCenter")));
  } else {
    const liveR = rt ? rt.liveHelioR_AU : obj.r_au;
    orbGrid.appendChild(makeTelemetryCell(
      tr(state.lang, "lblSemimajor"),
      obj.e >= 1.0 ? `${obj.a_au.toFixed(3)} AU` : formatDistAU(obj.a_au)
    ));
    orbGrid.appendChild(makeTelemetryCell(tr(state.lang, "lblPerihelion"), formatDistAU(obj.q_au)));
    orbGrid.appendChild(makeTelemetryCell(tr(state.lang, "lblEccentricity"), obj.e.toFixed(4)));
    orbGrid.appendChild(makeTelemetryCell(tr(state.lang, "lblInclination"), `${obj.i_deg.toFixed(3)}°`));
    orbGrid.appendChild(makeTelemetryCell(tr(state.lang, "lblHelioDist"), formatDistAU(liveR)));
    orbGrid.appendChild(makeTelemetryCell(
      tr(state.lang, "lblPeriod"),
      obj.e >= 1.0
        ? tr(state.lang, "valHyperbolic")
        : obj.period_days && obj.period_days < 300
          ? `${obj.period_days.toFixed(2)} d`
          : obj.period_yr
            ? `${obj.period_yr >= 100 ? Math.round(obj.period_yr).toLocaleString("en-US") : obj.period_yr.toFixed(2)} yr`
            : "—"
    ));
    orbGrid.appendChild(makeTelemetryCell(tr(state.lang, "lblNode"), `${obj.Omega_deg.toFixed(2)}°`));
    orbGrid.appendChild(makeTelemetryCell(tr(state.lang, "lblVarpi"), `${obj.varpi_deg.toFixed(2)}°`));
  }

  // Physical & Rotational Grid
  const physGrid = document.getElementById("insp-physical-grid");
  physGrid.innerHTML = "";
  if (obj.is_galactic) {
    if (obj.is_black_hole) {
      const mStr = obj.mass_msun >= 1e5 ? `${(obj.mass_msun / 1e6).toFixed(3)} × 10⁶ M☉` : `${obj.mass_msun.toFixed(2)} M☉`;
      physGrid.appendChild(makeTelemetryCell(tr(state.lang, "lblBhMass"), mStr));
      if (obj.spin !== null && obj.spin !== undefined) {
        physGrid.appendChild(makeTelemetryCell(tr(state.lang, "lblKerrSpin"), obj.spin.toFixed(3)));
      }
      if (obj.companion_type) {
        physGrid.appendChild(makeTelemetryCell(tr(state.lang, "lblCompanion"), obj.companion_type));
      }
    } else {
      physGrid.appendChild(makeTelemetryCell(tr(state.lang, "lblGalDist"), `${(obj.dist_kpc || 0).toFixed(2)} kpc`));
    }
  } else {
    const diamLabel = state.lang === "zh" ? (obj.diameter_label_zh || obj.diameter_label_en) : obj.diameter_label_en;
    const diamStr = diamLabel || (obj.diameter_km >= 1.0
      ? `${obj.diameter_km.toLocaleString("en-US", { maximumFractionDigits: 1 })} km`
      : `${Math.round(obj.diameter_km * 1000)} m`);
    physGrid.appendChild(makeTelemetryCell(tr(state.lang, "lblDiameter"), diamStr));
    physGrid.appendChild(makeTelemetryCell(
      tr(state.lang, "lblAbsMag"),
      obj.H_mag !== null && obj.H_mag !== undefined ? `H = ${obj.H_mag.toFixed(2)}` : "—"
    ));
    const isScObj = obj.category === "spacecraft" || Boolean(obj.visual_type?.startsWith("spacecraft")) || obj.is_constellation_sat;
    if (!isScObj) {
      const iauEl = getIAUPoleElements(obj);
      physGrid.appendChild(makeTelemetryCell(tr(state.lang, "lblSiderealRot"), formatSiderealPeriod(obj, state.lang)));
      physGrid.appendChild(makeTelemetryCell(tr(state.lang, "lblAxialTilt"), `${(iauEl.obliquityDeg ?? 0).toFixed(2)}°`));
      physGrid.appendChild(makeTelemetryCell(tr(state.lang, "lblPoleRaDec"), `${iauEl.raDeg.toFixed(1)}°, ${iauEl.decDeg.toFixed(1)}°`));
      if (obj.id === "EARTH" && rt) {
        const sub = computeEarthSubsolarLatLon(rt);
        if (sub) {
          const latTag = sub.latDeg >= 0 ? `${sub.latDeg.toFixed(1)}°N` : `${Math.abs(sub.latDeg).toFixed(1)}°S`;
          const lonTag = sub.lonDeg >= 0 ? `${sub.lonDeg.toFixed(1)}°E` : `${Math.abs(sub.lonDeg).toFixed(1)}°W`;
          physGrid.appendChild(makeTelemetryCell(tr(state.lang, "lblSubsolar"), `${latTag}, ${lonTag}`));
        }
      } else if (rt && Number.isFinite(rt.liveMeridianDeg)) {
        physGrid.appendChild(makeTelemetryCell(tr(state.lang, "lblPrimeMeridian"), `${rt.liveMeridianDeg.toFixed(1)}°`));
      }
    }
  }

  // System / Companions / Earth CAD Tab
  const satWrap = document.getElementById("insp-satellites-wrap");
  const satHdr = document.getElementById("sec-satellites-hdr");
  const satList = document.getElementById("insp-satellites-list");
  satList.innerHTML = "";
  const children = childrenByParent.get(obj.id) || [];
  let hasSystemContent = false;

  if (children.length > 0) {
    satWrap.style.display = "block";
    satHdr.textContent = tr(state.lang, "secSatellites");
    hasSystemContent = true;
    for (const ch of children) {
      const b = document.createElement("button");
      b.type = "button";
      b.className = "sat-chip-btn";
      b.textContent = getObjectName(ch, state.lang);
      b.addEventListener("click", () => selectAndFlyTo(ch, "auto"));
      satList.appendChild(b);
    }
  } else if (obj.parent_id && catalog.byId.has(obj.parent_id)) {
    const parentObj = catalog.byId.get(obj.parent_id);
    satWrap.style.display = "block";
    satHdr.textContent = tr(state.lang, "parentBodyLabel");
    hasSystemContent = true;
    const b = document.createElement("button");
    b.type = "button";
    b.className = "sat-chip-btn";
    b.textContent = `↖ ${getObjectName(parentObj, state.lang)}`;
    b.addEventListener("click", () => selectAndFlyTo(parentObj, "auto"));
    satList.appendChild(b);
  } else {
    satWrap.style.display = "none";
  }

  const earthPanel = document.getElementById("insp-earth-precision-wrap");
  if (earthPanel) {
    if (obj.id === "EARTH") {
      earthPanel.style.display = "block";
      hasSystemContent = true;
      syncEarthPrecisionPanelUI();
    } else {
      earthPanel.style.display = "none";
    }
  }
  const tabSystem = document.getElementById("tab-system");
  if (tabSystem) tabSystem.style.display = hasSystemContent ? "inline-block" : "none";

  // Telescopes / Provenance badges
  const telWrap = document.getElementById("insp-telescopes-wrap");
  const telList = document.getElementById("insp-telescopes-list");
  telList.innerHTML = "";
  const tels = obj.science?.telescopes || [];
  if (tels.length > 0) {
    telWrap.style.display = "block";
    for (const tName of tels) {
      const chip = document.createElement("span");
      chip.className = "facility-chip";
      chip.textContent = tName;
      telList.appendChild(chip);
    }
  } else {
    telWrap.style.display = "none";
  }

  // Cutout / Media Tab
  const tabMedia = document.getElementById("tab-media");
  const cutImg = document.getElementById("insp-cutout-img");
  const hasMedia = Boolean(obj.science?.gif_url);
  if (tabMedia) tabMedia.style.display = hasMedia ? "inline-block" : "none";
  if (hasMedia && cutImg) cutImg.src = obj.science.gif_url;

  if (
    (state.activeInspectorTab === "media" && !hasMedia) ||
    (state.activeInspectorTab === "system" && !hasSystemContent)
  ) {
    setActiveInspectorTab("overview", false);
  }

  const blogBtn = document.getElementById("insp-blog-btn");
  blogBtn.href = obj.science?.blog_url || buildBlogUrl(state.lang);
}

function syncSpeedSelectUI() {
  const sel = document.getElementById("speed-select");
  if (!sel) return;
  sel.innerHTML = "";
  SPEED_TIERS.forEach((tier, idx) => {
    const opt = document.createElement("option");
    opt.value = String(idx);
    opt.textContent = tr(state.lang, tier.i18nKey);
    if (idx === state.speedIndex) opt.selected = true;
    sel.appendChild(opt);
  });
}

function updatePlayButtonText() {
  document.getElementById("time-play-btn").textContent = tr(state.lang, state.isPlaying ? "timePause" : "timePlay");
}

function applyLanguageToStaticDOM() {
  const L = state.lang;
  document.documentElement.lang = L === "zh" ? "zh-CN" : "en";

  document.getElementById("brand-title").textContent = tr(L, "brandTitle");
  document.getElementById("search-input").placeholder = tr(L, "searchPlaceholder");
  document.getElementById("lbl-menu-explore").textContent = tr(L, "menuExplore");
  document.getElementById("lbl-menu-view").textContent = tr(L, "menuView");
  document.getElementById("lbl-menu-layers").textContent = tr(L, "menuLayers");
  document.getElementById("lbl-menu-camera").textContent = tr(L, "menuCamera");
  document.getElementById("studio-nav-link").textContent = `${tr(L, "playgroundLink")} ↗`;

  const blogNav = document.getElementById("blog-nav-link");
  blogNav.textContent = `${tr(L, "blogLinkLabel")} ↗`;
  blogNav.href = buildBlogUrl(L);

  document.getElementById("lang-toggle-btn").textContent = L === "en" ? "中文" : "EN";
  document.getElementById("scale-log-btn").textContent = tr(L, "scaleLog");
  document.getElementById("scale-true-btn").textContent = tr(L, "scaleTrue");
  document.getElementById("lbl-orbits").textContent = tr(L, "orbitsLabel");
  document.getElementById("opt-orbits-major").textContent = tr(L, "orbitsMajor");
  document.getElementById("opt-orbits-all").textContent = tr(L, "orbitsAll");
  document.getElementById("opt-orbits-selected").textContent = tr(L, "orbitsSelected");
  document.getElementById("opt-orbits-off").textContent = tr(L, "orbitsOff");

  document.getElementById("toggle-galaxy-btn").textContent = tr(L, "galaxyLayerToggle");
  document.getElementById("toggle-rings-btn").textContent = tr(L, "ringsToggle");
  document.getElementById("toggle-galactic-btn").textContent = tr(L, "galacticToggle");
  document.getElementById("toggle-labels-btn").textContent = tr(L, "labelsToggle");
  document.getElementById("toggle-sats-btn").textContent = tr(L, "satsSwarmToggle");

  document.getElementById("opt-sat-all").textContent = tr(L, "satFilterAll");
  document.getElementById("opt-sat-musk").textContent = tr(L, "satFilterMusk");
  document.getElementById("opt-sat-comm-all").textContent = tr(L, "satFilterCommAll");
  document.getElementById("opt-sat-comm-other").textContent = tr(L, "satFilterCommOther");
  document.getElementById("opt-sat-starlink").textContent = tr(L, "satFilterStarlink");
  document.getElementById("opt-sat-spx-other").textContent = tr(L, "satFilterSpxOther");
  document.getElementById("opt-sat-oneweb-kuiper").textContent = tr(L, "satFilterOneWebKuiper");
  document.getElementById("opt-sat-cn").textContent = tr(L, "satFilterCN");
  document.getElementById("opt-sat-d2d").textContent = tr(L, "satFilterD2D");
  document.getElementById("opt-sat-eo").textContent = tr(L, "satFilterEO");
  document.getElementById("opt-sat-geo").textContent = tr(L, "satFilterGEO");
  document.getElementById("opt-sat-gnss").textContent = tr(L, "satFilterGNSS");

  document.getElementById("preset-earth-sats-btn").textContent = tr(L, "presetEarthSats");
  document.getElementById("preset-inner-btn").textContent = tr(L, "presetInner");
  document.getElementById("preset-outer-btn").textContent = tr(L, "presetOuter");
  document.getElementById("preset-oort-btn").textContent = tr(L, "presetOort");
  document.getElementById("preset-local-stars-btn").textContent = tr(L, "presetLocalStars");
  document.getElementById("preset-gaia-bh1-btn").textContent = tr(L, "presetGaiaBH1");
  document.getElementById("preset-cygx1-btn").textContent = tr(L, "presetCygX1");
  document.getElementById("preset-sgra-btn").textContent = tr(L, "presetSgrA");
  document.getElementById("preset-milkyway-btn").textContent = tr(L, "presetMilkyWay");

  document.getElementById("auto-tour-btn").textContent = tr(L, state.autoTourTimer ? "autoTourStop" : "autoTourStart");
  document.getElementById("inspector-reopen-btn").textContent = `${tr(L, "inspectorOpen")} ◂`;
  document.getElementById("btn-zoom-surface").textContent = tr(L, "zoomSurfaceBtn");
  document.getElementById("btn-frame-orbit").textContent = tr(L, "frameOrbitBtn");

  document.getElementById("tab-overview").textContent = tr(L, "tabOverview");
  document.getElementById("tab-orbit").textContent = tr(L, "tabOrbit");
  document.getElementById("tab-physical").textContent = tr(L, "tabPhysical");
  document.getElementById("tab-media").textContent = tr(L, "tabMedia");
  document.getElementById("tab-system").textContent = tr(L, "tabSystem");

  document.getElementById("sec-orbital-hdr").textContent = tr(L, "secOrbital");
  document.getElementById("sec-physical-hdr").textContent = tr(L, "secPhysical");
  document.getElementById("sec-telescopes-hdr").textContent = tr(L, "secTelescopes");
  document.getElementById("sec-cutout-hdr").textContent = tr(L, "secCutout");
  document.getElementById("sec-earth-precision-hdr").textContent = tr(L, "secEarthPrecision");
  document.getElementById("btn-earth-8k").textContent = tr(L, "earthMode8k");
  document.getElementById("btn-earth-cad").textContent = tr(L, "earthModeCad");
  document.getElementById("lbl-earth-elev").textContent = tr(L, "earthElevLabel");
  document.getElementById("btn-atmo-phys").textContent = tr(L, "earthAtmoPhysical");
  document.getElementById("btn-atmo-prof").textContent = tr(L, "earthAtmoProfile");
  document.getElementById("btn-atmo-bare").textContent = tr(L, "earthAtmoBare");

  document.getElementById("insp-blog-btn").textContent = tr(L, "openBlogStory");
  document.getElementById("insp-copy-link-btn").textContent = tr(L, "copyDeepLink");
  document.getElementById("epoch-now-btn").textContent = tr(L, "timeNowUtc");
  document.getElementById("epoch-reset-btn").textContent = tr(L, "timeEpochReset");
  document.getElementById("lbl-scale-range").textContent = tr(L, "lblScaleRange");

  updatePlayButtonText();
  syncSpeedSelectUI();

  for (const rt of runtimeMap.values()) {
    rt.nameSpan.textContent = getObjectName(rt.obj, L);
    rt.badgeSpan.textContent = tr(L, "newBadge");
    rt._labelHalfW = estimateLabelHalfWidthPx(rt.obj, L);
  }

  overlays.updateOverlaysScaleAndLang(state.logBlend, L);
  renderCategoryFilterBar();
  renderCatalogObjectList();
  updateTrackingBarUI();
  updateInspectorUI();
}

function setLanguage(lang, persist = true) {
  if (!I18N[lang]) return;
  state.lang = lang;
  if (persist) persistLanguageChoice(lang);
  applyLanguageToStaticDOM();
  syncURLState();
}

function syncURLState() {
  try {
    const u = new URL(window.location.href);
    if (state.selectedObj) u.searchParams.set("focus", state.selectedObj.id);
    if (state.activeCategory && state.activeCategory !== "all") u.searchParams.set("category", state.activeCategory);
    else u.searchParams.delete("category");
    if (state.lang !== "en") u.searchParams.set("lang", state.lang);
    else u.searchParams.delete("lang");
    window.history.replaceState({}, "", u.toString());
  } catch (_) {}
}

// ==================== SEARCH AUTOCOMPLETE (WITH ASYNC WORKER SAT SEARCH) ====================
const searchInput = document.getElementById("search-input");
const searchClear = document.getElementById("search-clear");
const searchDropdown = document.getElementById("search-dropdown");
let searchSeq = 0;

async function renderSearchMatches(query) {
  const mySeq = ++searchSeq;
  const q = query.trim().toLowerCase();
  searchClear.style.display = q ? "block" : "none";
  if (!q) {
    searchDropdown.style.display = "none";
    return;
  }

  const catMatches = catalog.objects
    .filter((o) => {
      const hay = `${o.id} ${o.name_en} ${o.name_zh || ""} ${(o.aliases || []).join(" ")} ${o.category}`.toLowerCase();
      return hay.includes(q);
    })
    .slice(0, 9);

  const satMatches = await constellationMgr.searchSatellitesAsync(q, 7);
  if (mySeq !== searchSeq) return;
  const matches = [...catMatches, ...satMatches];

  searchDropdown.innerHTML = "";
  if (matches.length === 0) {
    const empty = document.createElement("div");
    empty.className = "search-item";
    empty.innerHTML = `<span class="search-item-meta">${tr(state.lang, "noSearchMatches")}</span>`;
    searchDropdown.appendChild(empty);
  } else {
    for (const obj of matches) {
      const item = document.createElement("div");
      item.className = "search-item";
      const left = document.createElement("span");
      left.className = "search-item-name";
      const prefix = obj.is_new_discovery ? "★ " : (obj.is_black_hole ? "● " : "");
      left.textContent = `${prefix}${getObjectName(obj, state.lang)}`;
      const right = document.createElement("span");
      right.className = "search-item-meta";
      right.textContent = formatObjectDist(obj);
      item.append(left, right);
      item.addEventListener("click", () => {
        searchDropdown.style.display = "none";
        searchInput.value = getObjectName(obj, state.lang);
        searchClear.style.display = "block";
        stopAutoTour();
        selectAndFlyTo(obj, "auto");
      });
      searchDropdown.appendChild(item);
    }
  }
  searchDropdown.style.display = "block";
}

searchInput.addEventListener("input", () => renderSearchMatches(searchInput.value));
searchInput.addEventListener("keydown", async (e) => {
  if (e.key === "Enter") {
    const q = searchInput.value.trim();
    if (!q) return;
    let hit = resolveObjectByQuery(catalog, q);
    if (!hit) {
      const sats = await constellationMgr.searchSatellitesAsync(q, 1);
      hit = sats[0] || null;
    }
    if (hit) {
      searchDropdown.style.display = "none";
      stopAutoTour();
      selectAndFlyTo(hit, "auto");
    }
  }
});
searchClear.addEventListener("click", () => {
  searchInput.value = "";
  searchClear.style.display = "none";
  searchDropdown.style.display = "none";
});

// ==================== GUIDED AUTO-TOUR ====================
function stopAutoTour() {
  if (state.autoTourTimer) {
    clearInterval(state.autoTourTimer);
    state.autoTourTimer = null;
    const btn = document.getElementById("auto-tour-btn");
    if (btn) {
      btn.classList.remove("running");
      btn.textContent = tr(state.lang, "autoTourStart");
    }
  }
}

function toggleAutoTour() {
  if (state.autoTourTimer) {
    stopAutoTour();
    return;
  }
  const btn = document.getElementById("auto-tour-btn");
  btn.classList.add("running");
  btn.textContent = tr(state.lang, "autoTourStop");
  const stepTour = () => {
    const id = SPOTLIGHT_TOUR_IDS[state.autoTourIdx % SPOTLIGHT_TOUR_IDS.length];
    state.autoTourIdx++;
    const obj = resolveObjectByQuery(catalog, id);
    if (obj) selectAndFlyTo(obj, "auto");
  };
  stepTour();
  state.autoTourTimer = setInterval(stepTour, 6000);
}

// ==================== WIRE CONTROLS ====================
function setScaleMode(mode) {
  state.scaleMode = mode;
  state.targetLogBlend = mode === "log" ? 1.0 : 0.0;
  document.getElementById("scale-log-btn").classList.toggle("active", mode === "log");
  document.getElementById("scale-true-btn").classList.toggle("active", mode === "true");
}

document.getElementById("scale-log-btn").addEventListener("click", () => setScaleMode("log"));
document.getElementById("scale-true-btn").addEventListener("click", () => setScaleMode("true"));
document.getElementById("lang-toggle-btn").addEventListener("click", () => setLanguage(state.lang === "en" ? "zh" : "en", true));

document.getElementById("orbit-mode-select").addEventListener("change", (e) => {
  state.orbitMode = e.target.value;
  updateVisibilityAndOrbits();
});
document.getElementById("toggle-galaxy-btn").addEventListener("click", (e) => {
  state.showGalaxyLayer = !state.showGalaxyLayer;
  galaxyLayer.setVisible(state.showGalaxyLayer);
  galacticObjectsRoot.visible = state.showGalaxyLayer;
  e.currentTarget.classList.toggle("active", state.showGalaxyLayer);
  updateVisibilityAndOrbits();
});
document.getElementById("toggle-rings-btn").addEventListener("click", (e) => {
  state.showRings = !state.showRings;
  overlays.ringsGroup.visible = state.showRings;
  e.currentTarget.classList.toggle("active", state.showRings);
});
document.getElementById("toggle-galactic-btn").addEventListener("click", (e) => {
  state.showGalacticBand = !state.showGalacticBand;
  overlays.galacticGroup.visible = state.showGalacticBand;
  e.currentTarget.classList.toggle("active", state.showGalacticBand);
});
document.getElementById("toggle-labels-btn").addEventListener("click", (e) => {
  state.showLabels = !state.showLabels;
  e.currentTarget.classList.toggle("active", state.showLabels);
});
document.getElementById("toggle-sats-btn").addEventListener("click", (e) => {
  const next = !constellationMgr.enabled;
  constellationMgr.setEnabled(next);
  e.currentTarget.classList.toggle("active", next);
});
document.getElementById("sat-family-select").addEventListener("change", (e) => {
  const mask = Number(e.target.value) || 4095;
  constellationMgr.setFamilyMask(mask);
  constellationMgr.setEnabled(true);
  document.getElementById("toggle-sats-btn")?.classList.add("active");
});

document.getElementById("preset-earth-sats-btn").addEventListener("click", () => flyToScenePreset("earth_sats"));
document.getElementById("preset-inner-btn").addEventListener("click", () => flyToScenePreset("inner"));
document.getElementById("preset-outer-btn").addEventListener("click", () => flyToScenePreset("outer"));
document.getElementById("preset-oort-btn").addEventListener("click", () => flyToScenePreset("oort"));
document.getElementById("preset-local-stars-btn").addEventListener("click", () => flyToScenePreset("local_stars"));
document.getElementById("preset-gaia-bh1-btn").addEventListener("click", () => flyToScenePreset("gaia_bh1"));
document.getElementById("preset-cygx1-btn").addEventListener("click", () => flyToScenePreset("cyg_x1"));
document.getElementById("preset-sgra-btn").addEventListener("click", () => flyToScenePreset("sgr_a"));
document.getElementById("preset-milkyway-btn").addEventListener("click", () => flyToScenePreset("milkyway"));

const bindAdamToggle = (btnId, layerKey) => {
  document.getElementById(btnId)?.addEventListener("click", (e) => {
    const next = !adamOverlay.layerState[layerKey];
    adamOverlay.setLayerVisible(layerKey, next);
    e.currentTarget.classList.toggle("active", next);
  });
};
bindAdamToggle("toggle-adam-transfers-btn", "transfers");
bindAdamToggle("toggle-adam-impactors-btn", "impactors");
bindAdamToggle("toggle-adam-corridors-btn", "corridors");
bindAdamToggle("toggle-adam-precovery-btn", "precovery");
document.getElementById("preset-adam-transfers-btn")?.addEventListener("click", () => {
  adamOverlay.setLayerVisible("transfers", true);
  document.getElementById("toggle-adam-transfers-btn")?.classList.add("active");
  flyToScenePreset("inner");
});
document.getElementById("preset-adam-corridor-btn")?.addEventListener("click", () => {
  adamOverlay.setLayerVisible("corridors", true);
  document.getElementById("toggle-adam-corridors-btn")?.classList.add("active");
  flyToScenePreset("earth_sats");
});

document.getElementById("auto-tour-btn").addEventListener("click", toggleAutoTour);
document.getElementById("btn-zoom-surface").addEventListener("click", () => {
  if (state.selectedObj) selectAndFlyTo(state.selectedObj, "surface");
});
document.getElementById("btn-frame-orbit").addEventListener("click", () => {
  if (state.selectedObj) selectAndFlyTo(state.selectedObj, "orbit");
});
document.getElementById("insp-collapse-btn").addEventListener("click", () => {
  state.inspectorCollapsed = true;
  document.getElementById("inspector-drawer").classList.add("collapsed");
  document.getElementById("inspector-reopen-btn").style.display = "block";
});
document.getElementById("inspector-reopen-btn").addEventListener("click", () => {
  state.inspectorCollapsed = false;
  document.getElementById("inspector-drawer").classList.remove("collapsed");
  document.getElementById("inspector-reopen-btn").style.display = "none";
});
document.getElementById("insp-copy-link-btn").addEventListener("click", async (e) => {
  const btn = e.currentTarget;
  syncURLState();
  try {
    await navigator.clipboard.writeText(window.location.href);
    btn.textContent = tr(state.lang, "copiedDeepLink");
    setTimeout(() => { btn.textContent = tr(state.lang, "copyDeepLink"); }, 1600);
  } catch (_) {}
});
document.getElementById("release-lock-btn").addEventListener("click", () => {
  state.lockedObj = catalog.byId.get("SUN") || null;
  controls.minDistance = 0.0001;
  updateTrackingBarUI();
});
document.getElementById("time-play-btn").addEventListener("click", () => {
  state.isPlaying = !state.isPlaying;
  updatePlayButtonText();
});
document.getElementById("speed-select").addEventListener("change", (e) => {
  state.speedIndex = Number(e.target.value) || 0;
  state.isPlaying = true;
  updatePlayButtonText();
});

// Earth WGS-84 DEM & Stratified Atmosphere Controls
function syncEarthPrecisionPanelUI() {
  const earthRt = runtimeMap.get("EARTH");
  const st = earthRt?.node?.userData?.earthPrecisionState;
  if (!st) return;
  const setBtnActive = (id, active) => {
    const el = document.getElementById(id);
    if (!el) return;
    el.style.borderColor = active ? "#38bdf8" : "rgba(148,163,184,0.28)";
    el.style.background = active ? "rgba(56,189,248,0.24)" : "rgba(15,23,42,0.58)";
    el.style.color = active ? "#f8fafc" : "#cbd5e1";
  };
  setBtnActive("btn-earth-8k", !st.cadMode);
  setBtnActive("btn-earth-cad", st.cadMode);
  setBtnActive("btn-atmo-phys", st.atmoMode === "physical");
  setBtnActive("btn-atmo-prof", st.atmoMode === "profile");
  setBtnActive("btn-atmo-bare", st.atmoMode === "bare");
  const sl = document.getElementById("earth-dem-slider");
  if (sl) sl.value = String(Math.round(st.demScale));
  const valEl = document.getElementById("val-earth-elev");
  if (valEl) {
    const sc = Math.round(st.demScale);
    valEl.textContent = sc === 1 ? "1× WGS-84" : `${sc}× (+${(8.849 * sc).toFixed(1)} km)`;
  }
  document.querySelectorAll(".earth-dem-preset").forEach((b) => {
    b.classList.toggle("active", Number(b.dataset.dem) === Math.round(st.demScale));
  });
}

function updateEarthConfig(partial) {
  const earthRt = runtimeMap.get("EARTH");
  earthRt?.node?.userData?.applyEarthPrecisionConfig?.(partial);
  syncEarthPrecisionPanelUI();
}

document.getElementById("btn-earth-8k")?.addEventListener("click", () => updateEarthConfig({ cadMode: false, demScale: 1, atmoMode: "physical", showClouds: true }));
document.getElementById("btn-earth-cad")?.addEventListener("click", () => {
  const curScale = runtimeMap.get("EARTH")?.node?.userData?.earthPrecisionState?.demScale || 1;
  updateEarthConfig({ cadMode: true, demScale: Math.max(18, curScale), showClouds: false });
});
document.getElementById("earth-dem-slider")?.addEventListener("input", (e) => updateEarthConfig({ demScale: Number(e.target.value) }));
document.querySelectorAll(".earth-dem-preset").forEach((btn) => {
  btn.addEventListener("click", () => updateEarthConfig({ demScale: Number(btn.dataset.dem) }));
});
document.getElementById("btn-atmo-phys")?.addEventListener("click", () => updateEarthConfig({ atmoMode: "physical", showClouds: true }));
document.getElementById("btn-atmo-prof")?.addEventListener("click", () => updateEarthConfig({ atmoMode: "profile" }));
document.getElementById("btn-atmo-bare")?.addEventListener("click", () => updateEarthConfig({ atmoMode: "bare", showClouds: false }));

document.getElementById("epoch-now-btn")?.addEventListener("click", () => {
  state.simJD = Date.now() / 86400000.0 + 2440587.5;
  state.speedIndex = 0;
  syncSpeedSelectUI();
  updateSimulationPositions(0);
  updateInspectorUI();
});
document.getElementById("epoch-reset-btn")?.addEventListener("click", () => {
  state.simJD = DISCOVERY_EPOCH_JD;
  updateSimulationPositions(0);
  updateInspectorUI();
});

if (urlParams.get("jd")) {
  const jVal = Number(urlParams.get("jd"));
  if (Number.isFinite(jVal) && jVal > 2400000) state.simJD = jVal;
} else if (urlParams.get("utc") === "now") {
  state.simJD = Date.now() / 86400000.0 + 2440587.5;
}
if (urlParams.get("sats") === "0") {
  constellationMgr.setEnabled(false);
  document.getElementById("toggle-sats-btn")?.classList.remove("active");
}

window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  labelRenderer.setSize(window.innerWidth, window.innerHeight);
});

// ==================== INITIALIZATION & URL ROUTING ====================
function extractHashFocusSlug() {
  const rawHash = (window.location.hash || "").replace(/^#+/, "").trim();
  if (!rawHash || rawHash === "/" || rawHash === "/home") return null;
  const parts = rawHash.split("/").filter(Boolean);
  return parts.length > 0 ? decodeURIComponent(parts[parts.length - 1]) : null;
}

setScaleMode(state.scaleMode);
applyLanguageToStaticDOM();
updateSimulationPositions(0);

const focusParam = urlParams.get("focus") || extractHashFocusSlug();
const presetParam = urlParams.get("preset");
if (urlParams.get("satmask")) {
  const m = Number(urlParams.get("satmask"));
  if (Number.isFinite(m) && m > 0) {
    constellationMgr.setFamilyMask(m);
    const selEl = document.getElementById("sat-family-select");
    if (selEl) selEl.value = String(m);
  }
}

if (presetParam) {
  flyToScenePreset(presetParam);
} else if (focusParam) {
  const targetObj = resolveObjectByQuery(catalog, focusParam);
  if (targetObj) selectAndFlyTo(targetObj, urlParams.get("mode") || "auto");
  else {
    state.selectedObj = catalog.byId.get("DELTA_003") || catalog.objects[0];
    state.lockedObj = catalog.byId.get("SUN") || null;
  }
} else if (state.activeCategory === "oort_cloud") {
  state.selectedObj = catalog.byId.get("OORT_OUTER_REP_1") || catalog.objects[0];
  flyToScenePreset("oort");
} else {
  state.selectedObj = catalog.byId.get("DELTA_003") || catalog.objects[0];
  state.lockedObj = catalog.byId.get("SUN") || null;
  camera.position.set(16, 48, 86);
  controls.target.set(0, 0, 0);
}

window.addEventListener("hashchange", () => {
  const slug = extractHashFocusSlug();
  if (slug) {
    const targetObj = resolveObjectByQuery(catalog, slug);
    if (targetObj) selectAndFlyTo(targetObj, "surface");
  }
});

updateVisibilityAndOrbits();
updateTrackingBarUI();
updateInspectorUI();
highlightSelectedInLists();

// ==================== MAIN 60-FPS RENDER LOOP ====================
let lastHudUpdateMs = 0;
const epochEl = document.getElementById("epoch-readout");
const camRangeEl = document.getElementById("cam-range-val");

function animate(nowMs) {
  requestAnimationFrame(animate);
  const dtSec = Math.min(0.1, Math.max(0.0, (nowMs - lastFrameTime) * 0.001));
  lastFrameTime = nowMs;

  updateSimulationPositions(dtSec);
  controls.update();

  if (nowMs - lastHudUpdateMs > 100) {
    epochEl.textContent = jdToUTCString(state.simJD);
    camRangeEl.textContent = sceneDistToDisplayString(camera.position.distanceTo(controls.target), state.logBlend);
    lastHudUpdateMs = nowMs;
  }

  renderer.render(scene, camera);
  if (state.showLabels) {
    labelRenderer.render(scene, camera);
  }
}

window.__EYES3D__ = {
  camera,
  controls,
  runtimeMap,
  state,
  galaxyLayer,
  adamOverlay,
  selectAndFlyTo,
  flyToScenePreset,
  updateEarthConfig,
  updateSimulationPositions,
  updateInspectorUI
};

requestAnimationFrame(animate);
