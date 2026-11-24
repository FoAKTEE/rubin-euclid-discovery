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
} from "./i18n.js?v=20261124_v33";

import {
  CATEGORY_ORDER,
  normalizeCategoryKey,
  loadUnifiedSolarCatalog,
  normalizeGalacticCatalog,
  objectMatchesCategory,
  resolveObjectByQuery
} from "./catalogAdapter.js?v=20261124_v33";

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
  jdToUTCString,
  initNBodyFromCatalogMeta,
  getSolarSystemNBody,
  getNBodyIndex,
  prepareSolarSystemNBodyAtFrameJD,
  evaluateNBodyHeliocentricEclipticAU,
  FRAME_CLOCK,
  evaluateNBodyHeliocentricAtFrameJD,
  computeLocalKeplerianAtFrameJD,
  computeLagrangeHaloOffsetAtFrameJD,
  computeMoonGeocentricAtFrameJD,
  sampleNBodyOsculatingOrbitRawAU,
  getNBodyOsculatingShapeInto,
  NBODY_FRAME_BUDGET_CHECKPOINTS,
  ORBIT_VIEW_STATE,
  LAST_ORBIT_OBJ_VERT_IDX
} from "./orbitalMechanics.js?v=20261124_v33";
import {
  CATEGORY_COLORS,
  LEGEND_SOLAR_SYSTEM,
  LEGEND_STELLAR,
  LEGEND_GALACTIC
} from "./colorSystem.js?v=20261124_v33";

import { createProceduralBodyNode, getGlowSpriteTexture } from "./proceduralBodies.js?v=20261124_v33";
import { prioritizeModelLoad, evictLRUModels, ASSET_VERSION } from "./model3dLibrary.js?v=20261124_v33";
import { buildAllParticleBelts, buildReferenceOverlays } from "./particleBelts.js?v=20261124_v33";
import { EarthConstellationManager, mapGeocentricKmToSceneRadius } from "./earthConstellations.js?v=20261124_v33";
import {
  updateBodyPhysicalRotation,
  getIAUPoleElements,
  formatSiderealPeriod,
  computeEarthSubsolarLatLon
} from "./planetaryRotation.js?v=20261124_v33";
import { createGalaxyLayer } from "./galaxyRenderer.js?v=20261124_v33";
import { createBlackHoleSystem } from "./blackHoleDisks.js?v=20261124_v33";
import { createADAMOverlayManager } from "./adamOverlay.js?v=20261124_v33";
import { createBoxZoomController } from "./boxZoom.js?v=20261124_v33";

const SPEED_TIERS = [
  { daysPerSec: 1.0 / 86400.0, i18nKey: "timeReal" },
  { daysPerSec: 60.0 / 86400.0, i18nKey: "time1m" },
  { daysPerSec: 600.0 / 86400.0, i18nKey: "time10m" },
  { daysPerSec: 1.0 / 24.0, i18nKey: "time1h" },
  { daysPerSec: 1.0, i18nKey: "time1d" },
  { daysPerSec: 30.4375, i18nKey: "time1mo" },
  { daysPerSec: 365.25, i18nKey: "time1yr" },
  { daysPerSec: 365.25 * 25.0, i18nKey: "time25yr" },
  { daysPerSec: 365.25 * 200.0, i18nKey: "time200yr" }
];

// Guided tour stops. The default tour is a general Solar System and Milky Way itinerary; the
// survey candidates join it only while the opt-in discoveries layer is on.
const COSMOS_TOUR_IDS = [
  "SUN", "MERCURY", "EARTH", "MARS", "JUPITER", "SATURN", "URANUS", "NEPTUNE", "PLUTO",
  "ATLAS_3I", "OORT_OUTER_REP_1", "GAIA_BH1", "CYGNUS_X1", "SGR_A_STAR"
];
const DISCOVERY_TOUR_IDS = [
  "SUN", "EARTH", "JUPITER", "W4_JUP_MOON_GOLD_001", "CENTAUR_343_IOTA004", "SATURN", "NEPTUNE", "PLUTO",
  "EUC0005", "EPS_002", "DELTA_003", "ATLAS_3I", "OORT_OUTER_REP_1", "GAIA_BH1", "CYGNUS_X1", "SGR_A_STAR"
];
// Bodies whose orbits "Major Orbits" draws besides the planets and interstellar visitors.
const MAJOR_ORBIT_IDS = new Set(["PLUTO", "CERES", "ERIS", "HAUMEA", "MAKEMAKE", "SEDNA"]);

// Research-blog link that works on the local two-port dev layout (explorer on :8765, blog on :8766)
// and on any static host where the portals are sibling folders.
function buildBlogUrl(_lang, suffix = "") {
  const isLocalEyesPort =
    (window.location.hostname === "localhost" ||
      window.location.hostname === "127.0.0.1" ||
      window.location.hostname === "0.0.0.0") &&
    window.location.port === "8765";
  const base = isLocalEyesPort
    ? `${window.location.protocol}//${window.location.hostname}:8766/index.html`
    : "../discovery_blog/index.html";
  return `${base}${suffix}`;
}

const CATEGORY_DOT_COLORS = CATEGORY_COLORS;

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
const MAX_LABEL_BOXES = MAX_VISIBLE_LABELS + 12; // body labels plus the reference-ring labels
const _acceptedLabelBoxes = new Float32Array(MAX_LABEL_BOXES * 4);
// Screen rectangle of the open colour key (labels are not placed underneath it).
const legendBox = { open: false, right: 0.0, top: 0.0 };
const boxZoomBarRect = { active: false, right: 0.0, bottom: 0.0 };
const _pointerDownXY = new THREE.Vector2();
const _oscShape3 = new Float64Array(3);
const _scaleInfo = {
  logBlend: 1.0,
  cameraDistScene: 100.0,
  cameraDistAU: 100.0,
  cameraDistPc: 0.0005,
  galaxyUnitsPerKpc: GALAXY_SCENE_PER_KPC,
  simJD: DISCOVERY_EPOCH_JD,
  galacticFactor: 0.0,
  focusedOnBlackHole: false,
  blackHoleCloseUp: false,
  focusedObjectId: null
};

// ==================== APPLICATION STATE ====================
const state = {
  lang: resolveInitialLanguage(),
  scaleMode: "true",
  logBlend: 0.0,
  targetLogBlend: 0.0,
  activeCategory: "all",
  orbitMode: "selected",
  showRings: false,
  showGalacticBand: false,
  showGalaxyLayer: true,
  showLabels: false,
  showDiscoveries: true,
  simJD: DISCOVERY_EPOCH_JD,
  isPlaying: true,
  speedIndex: 0,
  selectedObj: null,
  isFocusedOnSelected: false,
  lockedObj: null,
  cameraFollowObj: null,
  hoveredObj: null,
  inspectorCollapsed: false,
  activeInspectorTab: "overview",
  inspectorBodyCollapsed: false,
  autoTourTimer: null,
  autoTourIdx: 0,
  galacticFactor: 0.0
};

const urlParams = new URLSearchParams(window.location.search);
if (urlParams.get("scale") === "log") {
  state.scaleMode = "log";
  state.logBlend = 1.0;
  state.targetLogBlend = 1.0;
} else if (urlParams.get("scale") === "true" || urlParams.get("scale") === "1:1") {
  state.scaleMode = "true";
  state.logBlend = 0.0;
  state.targetLogBlend = 0.0;
}
if (urlParams.get("category")) {
  const cKey = normalizeCategoryKey(urlParams.get("category"));
  if (CATEGORY_ORDER.includes(cKey)) state.activeCategory = cKey;
}
// The survey candidates are an opt-in layer: off on a bare start, on for ?discoveries=1,
// ?category=discoveries, or a deep link to a candidate (handled where the focus is resolved).
const isTruthyParam = (v) => v === "1" || v === "true" || v === "on" || v === "yes";
const isFalsyParam = (v) => v === "0" || v === "false" || v === "off" || v === "no";
if (isFalsyParam(urlParams.get("discoveries"))) {
  state.showDiscoveries = false;
} else if (isTruthyParam(urlParams.get("discoveries")) || state.activeCategory === "discoveries") {
  state.showDiscoveries = true;
}
// Orbits default to "selected" (options ordered: none, selected, major, all).
const rawOrbitsParam = (urlParams.get("orbits") || "").toLowerCase();
const normalizedOrbitsParam = rawOrbitsParam === "none" ? "off" : rawOrbitsParam;
const orbitsParamGiven = ["off", "selected", "major", "all"].includes(normalizedOrbitsParam);
if (orbitsParamGiven) state.orbitMode = normalizedOrbitsParam;
else if (state.activeCategory !== "all") state.orbitMode = "major";
if (isTruthyParam(urlParams.get("labels"))) state.showLabels = true;
if (isTruthyParam(urlParams.get("rings"))) state.showRings = true;
if (urlParams.get("jd")) {
  const jVal = Number(urlParams.get("jd"));
  if (Number.isFinite(jVal) && jVal > 2400000) state.simJD = jVal;
} else if (urlParams.get("utc") === "now") {
  state.simJD = Date.now() / 86400000.0 + 2440587.5;
}

// ==================== LOAD SOLAR + GALACTIC CATALOG ====================
const catalog = loadUnifiedSolarCatalog();
const discoveryCount = catalog.objects.filter((o) => o.is_new_discovery).length;

// Sun, planets and Pluto follow the N-body integration started from the catalogue's ephemeris
// state vectors (the same table is built into orbitalMechanics.js as a fallback). A short span
// around the start date is integrated now; the rest is filled a little every frame.
initNBodyFromCatalogMeta(catalog.meta?.nbody_epoch_states);
const nbodyEngine = getSolarSystemNBody();
nbodyEngine.ensureCoverage(state.simJD + 400.0, 4000);
nbodyEngine.ensureCoverage(state.simJD - 400.0, 4000);

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
const BASE_PIXEL_RATIO = Math.min(window.devicePixelRatio || 1, 2);
renderer.setPixelRatio(BASE_PIXEL_RATIO);

// Quality governor for the galactic views. The volumetric Milky Way and the black-hole lensing are
// full-screen ray marches; on a software or integrated renderer one frame of them can take seconds,
// which freezes the controls. While such a view is on screen the governor lowers the ray-march
// step count first and the render resolution second until frames are interactive again, and
// restores full resolution on return to the Solar System. A software renderer starts one level in.
const QUALITY_STEPS = [44, 26, 16, 12, 10];
const QUALITY_PIXEL_SCALE = [1.0, 1.0, 1.0, 0.7, 0.5];
const quality = { level: 0, emaMs: 16.0, slowFrames: 0, fastFrames: 0, pixelRatio: BASE_PIXEL_RATIO, software: false };
try {
  const glProbe = renderer.getContext();
  const dbg = glProbe.getExtension("WEBGL_debug_renderer_info");
  const glName = String(dbg ? glProbe.getParameter(dbg.UNMASKED_RENDERER_WEBGL) : "");
  quality.software = /swiftshader|llvmpipe|software|softpipe/i.test(glName);
  if (quality.software) quality.level = 3;
} catch (_) {
  quality.software = false;
}
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(0x060607, 1.0);
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.08;

const labelRenderer = new CSS2DRenderer();
labelRenderer.setSize(window.innerWidth, window.innerHeight);
labelRenderer.domElement.style.position = "absolute";
labelRenderer.domElement.style.top = "0";
labelRenderer.domElement.style.left = "0";
labelRenderer.domElement.style.pointerEvents = "none";
labelRenderer.domElement.style.display = "none";
css2dHost.appendChild(labelRenderer.domElement);
css2dHost.addEventListener("wheel", (e) => {
  e.preventDefault();
  canvas.dispatchEvent(new WheelEvent(e.type, e));
}, { passive: false });

const scene = new THREE.Scene();
const SCENE_VOID_BG = new THREE.Color(0x060607);
scene.background = SCENE_VOID_BG;

// Extended near/far with logarithmicDepthBuffer spans 100 m -> 100,000 AU -> 800+ kpc extragalactic halo without far-plane clipping
const camera = new THREE.PerspectiveCamera(46, window.innerWidth / window.innerHeight, 0.000005, 250000000);
// Start-up camera: 81 scene units from the Sun (the Kuiper belt reaches the sides of a 16:10
// window), 25 deg above the ecliptic, at ecliptic longitude 64 deg. From there the line of sight
// meets the galactic plane 25 deg from the Galactic Centre, so the Milky Way crosses the frame
// behind the planets with its bulge off to one side.
// In a window narrower than 16:10 the camera starts further back by the same ratio, so the Kuiper
// belt still reaches the sides; the factor is 1 at 16:10 or wider and stops growing at a square.
const START_ASPECT = window.innerWidth / window.innerHeight;
const DEFAULT_FIT = START_ASPECT > 0 ? Math.min(1.6, Math.max(1.0, 1.6 / START_ASPECT)) : 1.0;
const DEFAULT_CAMERA_POS = new THREE.Vector3(32.2 * DEFAULT_FIT, 34.3 * DEFAULT_FIT, -65.9 * DEFAULT_FIT);
camera.position.copy(DEFAULT_CAMERA_POS);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.065;
controls.rotateSpeed = 0.72;
controls.zoomSpeed = 1.18;
controls.panSpeed = 0.8;
controls.minDistance = 0.00006;
controls.maxDistance = 24000000;

const HOVER_CONTOUR_LAYER = 1;
const sunPointLight = new THREE.PointLight(0xfff9f0, 3.35, 0, 0);
sunPointLight.position.set(0, 0, 0);
sunPointLight.layers.enable(HOVER_CONTOUR_LAYER);
scene.add(sunPointLight);
const hemiLight = new THREE.HemisphereLight(0xe4e4e7, 0x18181b, 0.11);
hemiLight.layers.enable(HOVER_CONTOUR_LAYER);
scene.add(hemiLight);
const ambLight = new THREE.AmbientLight(0xffffff, 0.045);
ambLight.layers.enable(HOVER_CONTOUR_LAYER);
scene.add(ambLight);

// ==================== BELTS, OVERLAYS & MILKY WAY GALAXY LAYER ====================
const { group: beltsGroup, beltNodes, skyBackdrop, updateBeltDynamics } = buildAllParticleBelts(catalog.belts);
const beltNodeList = Object.values(beltNodes);
for (const bNode of beltNodeList) {
  bNode.renderOrder = 7;
}
scene.add(beltsGroup);

const overlays = buildReferenceOverlays(state.lang);
overlays.ringsGroup.renderOrder = 8;
scene.add(overlays.overlayGroup);
overlays.updateOverlaysScaleAndLang(state.logBlend, state.lang);
overlays.ringsGroup.visible = state.showRings;
overlays.setDiscoveriesVisible(state.showDiscoveries);

const galaxyLayer = createGalaxyLayer({ opacity: 1.0, showGas: true });
scene.add(galaxyLayer.group);

const bodiesRoot = new THREE.Group();
const orbitsRoot = new THREE.Group();
const galacticObjectsRoot = new THREE.Group();
galacticObjectsRoot.name = "galacticObjectsRoot";
scene.add(orbitsRoot, bodiesRoot, galacticObjectsRoot);

const runtimeMap = new Map();
// Same runtimes in insertion order, for index loops in the frame update (no iterator objects).
const runtimeList = [];
const galacticBlackHoleControllers = [];

// ==================== BATCHED GPU SHADER HELIOCENTRIC ORBITS (1 DRAW CALL!) ====================
const nbodyOrbitRanges = [];

function buildBatchedHeliocentricOrbits(objects) {
  const segments = [];
  let totalVerts = 0;
  const orbitRanges = new Map(); // id -> { startVert, vertCount, baseOpacity, color }

  for (const obj of objects) {
    if (obj.parent_id || obj.category === "star" || obj.is_galactic) continue;
    // Planets and Pluto: the osculating ellipse of the N-body state at the current date, so the
    // body always lies on its line. Everything else: the catalogue ellipse.
    const nbodyIdx = getNBodyIndex(obj.id);
    let positions, closed;
    if (nbodyIdx > 0) {
      positions = sampleNBodyOsculatingOrbitRawAU(obj.id, state.simJD);
      closed = true;
    } else {
      ({ positions, closed } = sampleHeliocentricOrbitRawAU(obj));
    }
    const nPts = positions.length / 3;
    if (nPts < 2) continue;
    const segCount = closed ? nPts : nPts - 1;
    const vertCount = segCount * 2;
    const isHelioCraft = obj.category === "spacecraft" || Boolean(obj.visual_type?.startsWith("spacecraft"));
    const baseOpacity = obj.is_new_discovery
      ? (obj.id === "DELTA_003" ? 0.96 : 0.90)
      : obj.category === "planets"
        ? 0.88
        : (obj.category === "asteroids" || isHelioCraft)
          ? 0.66
          : 0.74;
    const col = new THREE.Color(obj.color || CATEGORY_COLORS.kuiper_etnos);
    segments.push({ id: obj.id, positions, nPts, closed, startVert: totalVerts, vertCount, baseOpacity, col });
    const range = { id: obj.id, obj, startVert: totalVerts, vertCount, baseOpacity, col, rawPositions: positions, closed, nbodyIdx, objVertIdx: LAST_ORBIT_OBJ_VERT_IDX[0], viewStamp: 0, lastRefreshJD: state.simJD, refreshDays: 0.0 };
    if (nbodyIdx > 0) {
      // Re-derive the ellipse every 1/120 of a revolution of simulated time (and every frame when in local view).
      const shape = getNBodyOsculatingShapeInto(obj.id, state.simJD, _oscShape3);
      range.refreshDays = shape ? shape[2] / 120.0 : 30.0;
      nbodyOrbitRanges.push(range);
    }
    orbitRanges.set(obj.id, range);
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
  const posAttr = new THREE.BufferAttribute(posArr, 3);
  posAttr.setUsage(THREE.DynamicDrawUsage);
  geom.setAttribute("position", posAttr);
  geom.setAttribute("aColor", new THREE.BufferAttribute(colArr, 3));
  const alphaAttr = new THREE.BufferAttribute(alphaArr, 1);
  alphaAttr.setUsage(THREE.DynamicDrawUsage);
  geom.setAttribute("aAlpha", alphaAttr);
  geom.boundingSphere = new THREE.Sphere(new THREE.Vector3(0, 0, 0), 250000);

  const uniforms = {
    uLogBlend: { value: state.logBlend },
    uGlobalFade: { value: 1.0 }
  };

  // Premultiplied "over" compositing: where rings cross, the nearer line covers the farther one
  // instead of summing with it, so dense crossings keep their hue and never wash out to white the
  // way additive lines do. Lines at full strength get a small lift so the selected orbit reads
  // clearly against the star field.
  const mat = new THREE.ShaderMaterial({
    uniforms,
    transparent: true,
    depthTest: true,
    depthWrite: false,
    premultipliedAlpha: true,
    blending: THREE.CustomBlending,
    blendEquation: THREE.AddEquation,
    blendSrc: THREE.OneFactor,
    blendDst: THREE.OneMinusSrcAlphaFactor,
    blendSrcAlpha: THREE.OneFactor,
    blendDstAlpha: THREE.OneMinusSrcAlphaFactor,
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
        float rawA = aAlpha;
        vec3 col = aColor;
        float alpha = rawA;
        if (rawA > 1.75) {
          col = mix(aColor, vec3(1.0, 0.83, 0.15), 0.65);
          alpha = 0.96;
        } else if (rawA > 1.25) {
          col = mix(aColor, vec3(0.36, 0.78, 1.0), 0.65);
          alpha = 0.93;
        } else {
          float lift = 1.0 + 0.22 * smoothstep(0.93, 1.0, rawA);
          col = min(aColor * lift, vec3(1.0));
        }
        vColor = col;
        vAlpha = alpha * uGlobalFade;
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
        gl_FragColor = vec4(vColor * vAlpha, vAlpha);
      }
    `
  });

  const mesh = new THREE.LineSegments(geom, mat);
  mesh.frustumCulled = false;
  mesh.renderOrder = 8;
  orbitsRoot.add(mesh);
  return { mesh, uniforms, posArr, posAttr, alphaArr, alphaAttr, orbitRanges };
}

const batchedOrbits = buildBatchedHeliocentricOrbits(catalog.objects);

// Rewrite the vertices of the planetary and Pluto orbits from the current N-body state, in place
// (no buffer is reallocated; only the touched vertex ranges are uploaded). An orbit is refreshed
// once the simulated time has moved by its refresh interval, or always when force is set. The
// date is FRAME_CLOCK[0].
let _orbitViewStamp = 1;
const _lastOrbitViewCamPos = new THREE.Vector3(0, 26, 56);
let _lastOrbitViewBlend = 1.0;

function syncOrbitViewState() {
  ORBIT_VIEW_STATE[0] = camera.position.x;
  ORBIT_VIEW_STATE[1] = camera.position.y;
  ORBIT_VIEW_STATE[2] = camera.position.z;
  const viewDist = Math.max(1e-5, camera.position.distanceTo(controls.target));
  ORBIT_VIEW_STATE[3] = Math.max(1e-5, 0.05 * viewDist);
  ORBIT_VIEW_STATE[4] = state.logBlend;
  ORBIT_VIEW_STATE[5] = 1.0;

  if (
    camera.position.distanceTo(_lastOrbitViewCamPos) > 0.075 * viewDist ||
    Math.abs(state.logBlend - _lastOrbitViewBlend) > 0.025
  ) {
    _lastOrbitViewCamPos.copy(camera.position);
    _lastOrbitViewBlend = state.logBlend;
    _orbitViewStamp++;
  }
}

function writeHelioOrbitRangeToBuffer(rg, jd) {
  rg.lastRefreshJD = jd;
  rg.viewStamp = _orbitViewStamp;
  const p = rg.nbodyIdx > 0
    ? sampleNBodyOsculatingOrbitRawAU(rg.id, jd, rg.rawPositions)
    : sampleHeliocentricOrbitRawAU(rg.obj, jd, rg.rawPositions).positions;
  rg.objVertIdx = LAST_ORBIT_OBJ_VERT_IDX[0];
  const n = (p.length / 3) | 0;
  const limit = rg.closed ? n : n - 1;
  const posArr = batchedOrbits.posArr;
  let w = rg.startVert * 3;
  for (let k = 0; k < limit; k++) {
    const a3 = k * 3;
    const b3 = ((k + 1) % n) * 3;
    posArr[w] = p[a3];
    posArr[w + 1] = p[a3 + 1];
    posArr[w + 2] = p[a3 + 2];
    posArr[w + 3] = p[b3];
    posArr[w + 4] = p[b3 + 1];
    posArr[w + 5] = p[b3 + 2];
    w += 6;
  }
  batchedOrbits.posAttr.addUpdateRange(rg.startVert * 3, rg.vertCount * 3);
  batchedOrbits.posAttr.needsUpdate = true;
}

function refreshNBodyOrbits(force) {
  const jd = FRAME_CLOCK[0];
  for (let i = 0; i < nbodyOrbitRanges.length; i++) {
    const rg = nbodyOrbitRanges[i];
    if (!force && Math.abs(jd - rg.lastRefreshJD) < rg.refreshDays) continue;
    writeHelioOrbitRangeToBuffer(rg, jd);
  }
}

// High-precision Float64 body-centered orbit pool for close-up local view of heliocentric bodies
// (eliminates 32-bit GPU Float32 log-warp rounding so the orbit passes through the exact center of the 3D object).
const LOCAL_PRECISION_POOL_SIZE = 3;
const _localOrbScenePt = new THREE.Vector3();
const localPrecisionOrbitPool = Array.from({ length: LOCAL_PRECISION_POOL_SIZE }, () => {
  const maxVerts = 321;
  const geom = new THREE.BufferGeometry();
  const posAttr = new THREE.BufferAttribute(new Float32Array(maxVerts * 3), 3);
  posAttr.setUsage(THREE.DynamicDrawUsage);
  geom.setAttribute("position", posAttr);
  const mat = new THREE.LineBasicMaterial({
    color: 0xffffff,
    transparent: true,
    opacity: 0.95,
    depthWrite: false
  });
  const line = new THREE.Line(geom, mat);
  line.frustumCulled = false;
  line.renderOrder = 9;
  line.visible = false;
  orbitsRoot.add(line);
  return { line, geom, posAttr, mat, activeId: null };
});

function updateLocalPrecisionHelioOrbits(candidates, solarFade) {
  for (let i = 0; i < LOCAL_PRECISION_POOL_SIZE; i++) {
    const slot = localPrecisionOrbitPool[i];
    const cand = candidates[i];
    if (!cand || solarFade <= 0.01) {
      slot.line.visible = false;
      slot.activeId = null;
      continue;
    }
    const { rt, rg, alphaCode } = cand;
    if (Math.abs(state.simJD - rg.lastRefreshJD) > 1e-8) {
      writeHelioOrbitRangeToBuffer(rg, state.simJD);
    }
    const p = rg.rawPositions;
    const nPts = (p.length / 3) | 0;
    const totalVerts = rg.closed ? nPts + 1 : nPts;
    const arr = slot.posAttr.array;
    const wx = rt.worldPos.x, wy = rt.worldPos.y, wz = rt.worldPos.z;
    const midK = rg.objVertIdx ?? ((nPts / 2) | 0);

    for (let k = 0; k < totalVerts; k++) {
      const idx = k % nPts;
      if (idx === midK) {
        // Exact zero offset at the object's live anomaly vertex -> passes through rt.worldPos with 0 error
        arr[k * 3 + 0] = 0.0;
        arr[k * 3 + 1] = 0.0;
        arr[k * 3 + 2] = 0.0;
      } else {
        const xE = p[idx * 3 + 0];
        const zE = p[idx * 3 + 1];
        const negYE = p[idx * 3 + 2];
        helioAUToSceneInto(xE, -negYE, zE, state.logBlend, _localOrbScenePt);
        arr[k * 3 + 0] = _localOrbScenePt.x - wx;
        arr[k * 3 + 1] = _localOrbScenePt.y - wy;
        arr[k * 3 + 2] = _localOrbScenePt.z - wz;
      }
    }
    slot.geom.setDrawRange(0, totalVerts);
    slot.posAttr.needsUpdate = true;
    slot.line.position.copy(rt.worldPos);
    slot.mat.color.copy(rg.col);
    if (alphaCode > 1.75) {
      slot.mat.color.lerp(SELECTION_HIGHLIGHT_THREE_COLOR, 0.65);
      slot.mat.opacity = 0.96 * solarFade;
    } else if (alphaCode > 1.25) {
      slot.mat.color.lerp(HOVER_HIGHLIGHT_THREE_COLOR, 0.65);
      slot.mat.opacity = 0.93 * solarFade;
    } else {
      slot.mat.opacity = Math.min(1.0, alphaCode) * solarFade;
    }
    slot.line.visible = true;
    slot.activeId = rt.obj.id;
  }
}

// ==================== CHILD SATELLITE OFFSETS & RINGS ====================
function computeChildSceneOffset(parentRuntime, childObj, jd, outSceneVec3) {
  const saved = FRAME_CLOCK[0];
  FRAME_CLOCK[0] = jd;
  computeChildSceneOffsetAtFrameJD(parentRuntime, childObj, outSceneVec3);
  FRAME_CLOCK[0] = saved;
}

// Scene offset of a moon or spacecraft from its parent at the date in FRAME_CLOCK[0]. The frame
// loop calls this directly; no number is passed or returned, so nothing is allocated.
function computeChildSceneOffsetAtFrameJD(parentRuntime, childObj, outSceneVec3) {
  const parentObj = parentRuntime.obj;
  const parentMeshR = parentRuntime.node.userData.meshRadius;
  const parentPhysRadiusAU = Math.max(1e-9, ((parentObj.diameter_km || 2000.0) * 0.5) / AU_KM);

  const isL1 = childObj.l1_phase_deg !== null && childObj.l1_phase_deg !== undefined;
  const isL2 = childObj.l2_phase_deg !== null && childObj.l2_phase_deg !== undefined;
  if (isL1) {
    computeLagrangeHaloOffsetAtFrameJD(parentRuntime.eclPosAU, _localEcl3, childObj, true);
  } else if (isL2) {
    computeLagrangeHaloOffsetAtFrameJD(parentRuntime.eclPosAU, _localEcl3, childObj, false);
  } else if (childObj.id === "MOON") {
    computeMoonGeocentricAtFrameJD(_localEcl3);
  } else {
    computeLocalKeplerianAtFrameJD(childObj, _localEcl3);
  }

  const rLocalAU = Math.sqrt(_localEcl3[0] * _localEcl3[0] + _localEcl3[1] * _localEcl3[1] + _localEcl3[2] * _localEcl3[2]);
  if (rLocalAU < 1e-13) {
    outSceneVec3.set(parentMeshR * 1.4, 0, 0);
    return;
  }

  if (parentObj.id === "EARTH") {
    const rSceneLocal = mapGeocentricKmToSceneRadius(rLocalAU * AU_KM, parentMeshR);
    const factor = rSceneLocal / rLocalAU;
    outSceneVec3.set(_localEcl3[0] * factor, _localEcl3[2] * factor, -_localEcl3[1] * factor);
    // Align Earth equatorial satellites identically with EarthConstellationManager (-OBLIQUITY_J2000_RAD around +X)
    if (!isL1 && !isL2 && childObj.id !== "MOON") {
      outSceneVec3.applyAxisAngle(_xAxisUnit, -OBLIQUITY_J2000_RAD);
    }
    return;
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
}

const MOON_SIDEREAL_DAYS = 27.321661;

// Sample one full orbital period of a child moon or spacecraft around its parent centered on jdCenter,
// concentrating vertices by 8.3x around the body's live position (k === steps / 2) so the ring
// always passes directly through the child body in local view.
function fillChildOrbitRing(coords, parentRuntime, childObj, jdCenter, periodDays) {
  const steps = (coords.length / 3) | 0;
  const midK = (steps / 2) | 0;
  for (let k = 0; k < steps; k++) {
    if (k === midK) {
      computeChildSceneOffset(parentRuntime, childObj, jdCenter, _tmpVec);
    } else {
      const phi = (TWO_PI * k) / steps - Math.PI;
      const dPhi = phi - 0.88 * Math.sin(phi);
      const jdSample = jdCenter + (dPhi / TWO_PI) * periodDays;
      computeChildSceneOffset(parentRuntime, childObj, jdSample, _tmpVec);
    }
    coords[k * 3] = _tmpVec.x;
    coords[k * 3 + 1] = _tmpVec.y;
    coords[k * 3 + 2] = _tmpVec.z;
  }
}

function buildSatelliteOrbitRing(parentRuntime, childObj) {
  const isLagrange =
    (childObj.l1_phase_deg !== null && childObj.l1_phase_deg !== undefined) ||
    (childObj.l2_phase_deg !== null && childObj.l2_phase_deg !== undefined);
  const isMoonRing = childObj.id === "MOON";
  const nRadDay = isLagrange ? TWO_PI / 178.4 : getMeanMotionRadPerDay(childObj);
  const periodDays = isMoonRing ? MOON_SIDEREAL_DAYS : TWO_PI / Math.max(1e-9, nRadDay);
  const steps = 360;
  const coords = new Float32Array(steps * 3);

  fillChildOrbitRing(coords, parentRuntime, childObj, state.simJD, periodDays);

  const geom = new THREE.BufferGeometry();
  const posAttr = new THREE.BufferAttribute(coords, 3);
  posAttr.setUsage(THREE.DynamicDrawUsage);
  geom.setAttribute("position", posAttr);
  const isSC = Boolean(childObj.visual_type?.startsWith("spacecraft") || childObj.category === "spacecraft");
  const baseOpacity = 0.78;
  const mat = new THREE.LineBasicMaterial({
    color: new THREE.Color(isSC ? (childObj.color || CATEGORY_COLORS.spacecraft) : CATEGORY_COLORS.moons_l2),
    transparent: true,
    opacity: baseOpacity,
    depthWrite: false
  });
  const loop = new THREE.LineLoop(geom, mat);
  loop.userData = {
    childId: childObj.id,
    childObj,
    periodDays,
    isSpacecraftRing: isSC,
    baseOpacity,
    baseColor: mat.color.clone(),
    isLagrange,
    isMoonRing,
    ringJD: state.simJD
  };
  return loop;
}

// ==================== HELPER TO CREATE CSS2D LABEL ====================
function estimateLabelHalfWidthPx(obj, lang) {
  const txt = getObjectName(obj, lang) || "";
  let textW = 0.0;
  for (let i = 0; i < txt.length; i++) {
    textW += txt.charCodeAt(i) > 0xff ? 16.6 : 9.2;
  }
  const badgeW = obj.is_new_discovery ? 52.0 : 0.0;
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
  labelEl.addEventListener("pointerenter", () => updateHoverUI(obj));
  labelEl.addEventListener("pointerleave", () => updateHoverUI(null));
  labelEl.addEventListener("click", (ev) => {
    ev.stopPropagation();
    handleObjectPrimaryClick(obj);
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

  const rtNew = {
    obj,
    node,
    satOrbitGroup: null,
    satRingsMap: new Map(),
    satRingList: [],
    nbodyIdx: obj.parent_id ? -1 : getNBodyIndex(obj.id),
    isEarth: obj.id === "EARTH",
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
  };
  runtimeMap.set(obj.id, rtNew);
  runtimeList.push(rtNew);
}

// Compute initial primary & tier-1 moon positions for satellite rings
for (const rt of runtimeMap.values()) {
  if (!rt.obj.parent_id) {
    rt.liveHelioR_AU = rt.nbodyIdx > 0
      ? evaluateNBodyHeliocentricEclipticAU(rt.obj.id, state.simJD, rt.eclPosAU)
      : computeLocalKeplerianEclipticAU(rt.obj, state.simJD, rt.eclPosAU);
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
    parentRt.satRingList.push(ring);
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

    const rtGal = {
      obj: gObj,
      node,
      satOrbitGroup: null,
      satRingsMap: new Map(),
      satRingList: [],
      nbodyIdx: -1,
      isEarth: false,
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
    };
    runtimeMap.set(gObj.id, rtGal);
    runtimeList.push(rtGal);
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
    if (pendingDeepLinkFocus) {
      const hit = resolveObjectByQuery(catalog, pendingDeepLinkFocus);
      pendingDeepLinkFocus = null;
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
// False until start-up routing is done (start-up calls must not move the camera on their own).
let appReady = false;
// A ?focus= target that was not in the catalogue yet (black holes and clusters arrive with the
// galactic catalogue); resolved again when that catalogue has been mounted.
let pendingDeepLinkFocus = null;

// ==================== OPT-IN LAYERS & INSPECTOR DRAWER ====================
// With the inspector open on a desktop-width window, the projection is shifted by half the
// drawer's width, so the tracked object and a framed orbit sit in the middle of the free area
// instead of partly under the drawer.
function applyInspectorViewOffset() {
  camera.clearViewOffset();
}

function setInspectorCollapsed(collapsed) {
  state.inspectorCollapsed = Boolean(collapsed);
  document.getElementById("inspector-drawer")?.classList.toggle("collapsed", state.inspectorCollapsed);
  document.body.classList.toggle("inspector-collapsed", state.inspectorCollapsed);
  const reopen = document.getElementById("inspector-reopen-btn");
  if (reopen) reopen.style.display = state.inspectorCollapsed ? "block" : "none";
  applyInspectorViewOffset();
}

function isHiddenDiscovery(obj) {
  return Boolean(obj.is_new_discovery) && !state.showDiscoveries;
}

// Show or hide the audited survey candidates as one layer: bodies, beacons, reticles, orbits,
// labels, list rows and the 12:1 resonance ring.
function setDiscoveriesVisible(flag, refreshUI = true) {
  state.showDiscoveries = Boolean(flag);
  document.getElementById("toggle-discoveries-btn")?.classList.toggle("active", state.showDiscoveries);
  document.getElementById("quick-toggle-discoveries-btn")?.classList.toggle("active", state.showDiscoveries);
  overlays.setDiscoveriesVisible(state.showDiscoveries);
  if (!state.showDiscoveries) {
    if (state.activeCategory === "discoveries") state.activeCategory = "all";
    if (state.selectedObj?.is_new_discovery) {
      state.selectedObj = null;
      state.isFocusedOnSelected = false;
    }
    if (state.lockedObj?.is_new_discovery) {
      state.lockedObj = null;
      state.cameraFollowObj = null;
      controls.minDistance = 0.0001;
    }
  }
  if (!refreshUI) return;
  renderCategoryFilterBar();
  renderCatalogObjectList();
  updateVisibilityAndOrbits();
  updateTrackingBarUI();
  updateInspectorUI();
}

function setLabelsVisible(flag) {
  state.showLabels = Boolean(flag);
  labelRenderer.domElement.style.display = state.showLabels ? "" : "none";
  if (!state.showLabels) overlays.setOverlayLabelsVisible(false);
  document.getElementById("toggle-labels-btn")?.classList.toggle("active", state.showLabels);
}

function easeOutCubic(t) {
  return 1.0 - Math.pow(1.0 - t, 3);
}

controls.addEventListener("start", () => {
  flyTween = null;
});

function startCameraTween(destTarget, destCamPos, durationSec = 0.95, opts = {}) {
  flyTween = {
    startTime: performance.now(),
    durationMs: durationSec * 1000,
    fromTarget: controls.target.clone(),
    toTarget: destTarget.clone(),
    fromPos: camera.position.clone(),
    toPos: destCamPos.clone(),
    followLockedCenter: opts.followLockedCenter !== false,
    trackLockedDelta: Boolean(opts.trackLockedDelta)
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

export function selectObjectOnly(obj) {
  if (!obj) return;
  if (obj.is_new_discovery && !state.showDiscoveries) {
    setDiscoveriesVisible(true, false);
    renderCategoryFilterBar();
    renderCatalogObjectList();
  }
  if (state.inspectorCollapsed) setInspectorCollapsed(false);
  state.selectedObj = obj;
  state.isFocusedOnSelected = false;

  if (!obj.is_constellation_sat && !obj.is_galactic) {
    const rt = runtimeMap.get(obj.id);
    rt?.node?.userData?.ensureModelLoaded?.();
    if (obj.model_id) prioritizeModelLoad(obj.model_id);
  }

  updateInspectorUI();
  highlightSelectedInLists();
  updateVisibilityAndOrbits();
  syncURLState();
}

export function unselectCurrentObject() {
  if (boxZoom?.getMode?.() !== "off") {
    boxZoom.setMode("off");
  }
  if (!state.selectedObj && state.inspectorCollapsed) return;
  state.selectedObj = null;
  state.isFocusedOnSelected = false;
  setInspectorCollapsed(true);
  updateInspectorUI();
  highlightSelectedInLists();
  updateVisibilityAndOrbits();
  syncURLState();
}

function handleObjectPrimaryClick(obj) {
  if (!obj) return;
  stopAutoTour();
  if (state.selectedObj?.id === obj.id && !state.isFocusedOnSelected) {
    selectAndFlyTo(obj, "auto");
  } else {
    selectObjectOnly(obj);
  }
}

export function selectAndFlyTo(obj, mode = "auto") {
  if (!obj) return;
  if (appReady) boxZoom?.pushSnapshot?.();
  closeAllMenus();
  // Selecting a survey candidate (deep link, search, list or tour) turns its layer on, and any
  // selection opens the inspector.
  if (obj.is_new_discovery && !state.showDiscoveries) {
    setDiscoveriesVisible(true, false);
    renderCategoryFilterBar();
    renderCatalogObjectList();
  }
  if (state.inspectorCollapsed) setInspectorCollapsed(false);
  state.isFocusedOnSelected = true;
  if (state.hoveredObj?.id === obj.id) {
    state.hoveredObj = null;
    if (hoverReadoutEl) hoverReadoutEl.hidden = true;
  }

  if (obj.is_constellation_sat) {
    if ((obj.period_days || 0.066) < 0.25 && state.speedIndex >= 2) {
      state.speedIndex = 0;
      syncSpeedSelectUI();
    }
    const { worldPos, meshRadius } = constellationMgr.focusSatellite3D(obj, state.simJD);
    state.selectedObj = obj;
    state.lockedObj = obj;
    const earthRt = runtimeMap.get("EARTH");
    if (mode === "orbit" && earthRt) {
      state.cameraFollowObj = earthRt.obj;
      const eR = earthRt.node.userData.meshRadius;
      const camDir = _tmpVec2.set(0.42, 0.56, 0.72).normalize();
      controls.minDistance = eR * 1.25;
      startCameraTween(earthRt.worldPos, _tmpVec3.copy(earthRt.worldPos).addScaledVector(camDir, eR * 4.8), 0.9);
    } else {
      state.cameraFollowObj = obj;
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
    state.cameraFollowObj = obj;
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
  state.lockedObj = obj;

  const isFastOrbiterSystem =
    obj.id === "MOON" ||
    obj.id === "MARS" ||
    obj.id === "EARTH" ||
    (obj.parent_id && (obj.period_days || 1.0) < 2.5);
  if (isFastOrbiterSystem && state.speedIndex >= 4) {
    state.speedIndex = (obj.period_days && obj.period_days < 0.25) ? 0 : 2;
    syncSpeedSelectUI();
  }

  if ((obj.id === "EPS_002" || obj.id === "EPS_007") && !state.showGalacticBand) {
    state.showGalacticBand = true;
    overlays.galacticGroup.visible = true;
    document.getElementById("toggle-galactic-btn")?.classList.add("active");
  }

  if (mode === "orbit" && !obj.parent_id && obj.category !== "star") {
    state.cameraFollowObj = null;
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
      state.cameraFollowObj = parentObj;
      const dist = computeIdealInspectionDistance(obj, "orbit");
      const camDir = _tmpVec2.set(0.45, 0.58, 0.68).normalize();
      controls.minDistance = parentRt.node.userData.meshRadius * 1.35;
      startCameraTween(parentRt.worldPos, _tmpVec3.copy(parentRt.worldPos).addScaledVector(camDir, dist), 0.9);
    }
  } else {
    state.cameraFollowObj = obj;
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
  if (appReady) boxZoom?.pushSnapshot?.();
  stopAutoTour();
  closeAllMenus();
  constellationMgr.clearFocusedSatellite();
  controls.minDistance = 0.0001;

  if (presetName === "earth_sats") {
    const earthRt = runtimeMap.get("EARTH");
    if (earthRt) {
      earthRt.node.userData.ensureModelLoaded?.();
      state.selectedObj = earthRt.obj;
      state.isFocusedOnSelected = true;
      state.lockedObj = earthRt.obj;
      state.cameraFollowObj = earthRt.obj;
      if (state.inspectorCollapsed) setInspectorCollapsed(false);
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
    state.selectedObj = null;
    state.isFocusedOnSelected = false;
    state.lockedObj = null;
    state.cameraFollowObj = null;
    setInspectorCollapsed(true);
    const r = mapRadiusAU(3.8, state.targetLogBlend);
    startCameraTween(_tmpVec.set(0, 0, 0), _tmpVec2.set(r * 0.35, r * 0.85, r * 1.35), 0.95);
  } else if (presetName === "outer") {
    state.selectedObj = null;
    state.isFocusedOnSelected = false;
    state.lockedObj = null;
    state.cameraFollowObj = null;
    setInspectorCollapsed(true);
    const r = mapRadiusAU(state.showDiscoveries ? 210.0 : 95.0, state.targetLogBlend);
    startCameraTween(_tmpVec.set(0, 0, 0), _tmpVec2.set(r * 0.28, r * 0.88, r * 1.25), 1.05);
  } else if (presetName === "oort") {
    state.selectedObj = null;
    state.isFocusedOnSelected = false;
    state.lockedObj = null;
    state.cameraFollowObj = null;
    setInspectorCollapsed(true);
    const r = mapRadiusAU(82000.0, state.targetLogBlend);
    startCameraTween(_tmpVec.set(0, 0, 0), _tmpVec2.set(r * 0.32, r * 0.68, r * 1.32), 1.15);
  } else if (presetName === "local_stars") {
    state.selectedObj = null;
    state.isFocusedOnSelected = false;
    state.lockedObj = null;
    state.cameraFollowObj = null;
    setInspectorCollapsed(true);
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
    state.selectedObj = null;
    state.isFocusedOnSelected = false;
    state.lockedObj = null;
    state.cameraFollowObj = null;
    setInspectorCollapsed(true);
    controls.minDistance = 500.0;
    startCameraTween(gcPos, ngpOffset, 1.3);
  }

  updateTrackingBarUI();
  updateInspectorUI();
  highlightSelectedInLists();
  updateVisibilityAndOrbits();
  syncURLState();
}

// ==================== VISIBILITY, FILTERS & BATCHED ORBIT ALPHA UPDATE ====================
const HOVER_HIGHLIGHT_HEX = 0x5cc8ff;
const SELECTION_HIGHLIGHT_HEX = 0xffd426;
const HOVER_HIGHLIGHT_THREE_COLOR = new THREE.Color(HOVER_HIGHLIGHT_HEX);
const SELECTION_HIGHLIGHT_THREE_COLOR = new THREE.Color(SELECTION_HIGHLIGHT_HEX);

function updateVisibilityAndOrbits() {
  const cat = state.activeCategory;
  const selId = state.selectedObj?.id;
  const lockId = state.lockedObj?.id;
  const hovId = state.hoveredObj?.id || null;
  const selHighlightId = (!state.isFocusedOnSelected && state.selectedObj) ? state.selectedObj.id : null;

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
  const galObjFadeStartNow = THREE.MathUtils.lerp(60000.0, 10000.0, state.logBlend);
  const galacticObjectsAllowedByDist = camOriginDistNow >= galObjFadeStartNow;

  const alphaArr = batchedOrbits.alphaArr;
  for (const rt of runtimeMap.values()) {
    const obj = rt.obj;
    const isSun = obj.category === "star";
    const isSelectedOrLocked = obj.id === selId || obj.id === lockId;
    const isChildOfSelected = obj.parent_id && (obj.parent_id === selId || obj.parent_id === lockId);
    const matchesCat = isSun || isSelectedOrLocked || isChildOfSelected || obj.is_galactic || objectMatchesCategory(obj, cat);

    const hiddenDisc = isHiddenDiscovery(obj);
    if (obj.is_galactic) {
      const focusedGalactic = Boolean(
        state.lockedObj?.is_galactic ||
        state.selectedObj?.id === obj.id ||
        state.hoveredObj?.id === obj.id
      );
      rt.node.visible = state.showGalaxyLayer && (focusedGalactic || galacticObjectsAllowedByDist);
    } else {
      rt.node.visible = matchesCat && !hiddenDisc;
      if (!rt.node.visible && rt.node.userData.discoveryReticle) rt.node.userData.discoveryReticle.visible = false;
    }
    rt.labelEl.classList.toggle("is-selected", obj.id === selHighlightId);

    const orbInfo = batchedOrbits.orbitRanges.get(obj.id);
    if (orbInfo) {
      const isSelHighlighted = obj.id === selHighlightId;
      const isHoverHighlighted = obj.id === hovId;
      let showOrb = false;
      if (!hiddenDisc && (isSelHighlighted || isHoverHighlighted)) {
        showOrb = true;
      } else if (matchesCat && !hiddenDisc && state.orbitMode !== "off") {
        if (state.orbitMode === "all") showOrb = true;
        else if (state.orbitMode === "selected") showOrb = isSelectedOrLocked;
        else {
          showOrb =
            cat !== "all" ||
            isSelectedOrLocked ||
            obj.category === "planets" ||
            obj.category === "interstellar" ||
            MAJOR_ORBIT_IDS.has(obj.id) ||
            (state.showDiscoveries && obj.is_new_discovery && obj.category !== "asteroids");
        }
      }
      let alpha = 0.0;
      if (showOrb) {
        if (isSelHighlighted) {
          alpha = 2.0; // yellow selection highlight orbit
        } else if (isHoverHighlighted) {
          alpha = 1.5; // light-blue hover highlight orbit
        } else {
          alpha = isSelectedOrLocked ? 1.0 : orbInfo.baseOpacity;
          if (!isSelectedOrLocked && obj.is_new_discovery && cat === "all" && state.orbitMode === "major" && obj.id !== "DELTA_003") {
            alpha *= 0.62;
          }
        }
      }
      orbInfo._localPrecisionActive = false;
      orbInfo._savedAlpha = alpha;
      const end = orbInfo.startVert + orbInfo.vertCount;
      for (let i = orbInfo.startVert; i < end; i++) {
        alphaArr[i] = alpha;
      }
    }
  }
  batchedOrbits.alphaAttr.needsUpdate = true;
  if (state.orbitMode !== "off" || selHighlightId || hovId) {
    FRAME_CLOCK[0] = state.simJD;
    refreshNBodyOrbits(true);
  }
  const selSat = (!state.isFocusedOnSelected && state.selectedObj?.is_constellation_sat) ? state.selectedObj : null;
  const hovSat = state.hoveredObj?.is_constellation_sat ? state.hoveredObj : null;
  if (constellationMgr.focusedOrbitLine) {
    constellationMgr.focusedOrbitLine.visible = state.orbitMode !== "off";
  }
  constellationMgr.setHighlightedSatelliteOrbits(
    selSat,
    SELECTION_HIGHLIGHT_HEX,
    hovSat,
    HOVER_HIGHLIGHT_HEX,
    state.simJD
  );
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
const compareLabelPriority = (a, b) => b._labelPriority - a._labelPriority;
let lastMoonRingWallMs = 0;

function updateSimulationPositions(dtSec) {
  if (state.isPlaying) {
    const speedDaysPerSec = SPEED_TIERS[state.speedIndex]?.daysPerSec ?? 1.0;
    state.simJD += speedDaysPerSec * dtSec;
  }

  // Date of this frame for every ephemeris routine (read from the slot, never passed as a value).
  FRAME_CLOCK[0] = state.simJD;
  syncOrbitViewState();

  // Bounded slice of N-body integration toward the playhead and a little ahead of it.
  FRAME_CLOCK[1] = state.isPlaying ? Math.min(3650.0, Math.max(30.0, (SPEED_TIERS[state.speedIndex]?.daysPerSec ?? 1.0) * 1.5)) : 30.0;
  prepareSolarSystemNBodyAtFrameJD(NBODY_FRAME_BUDGET_CHECKPOINTS);

  // Smooth GPU scale morphing (zero CPU geometry rebuild!)
  if (Math.abs(state.logBlend - state.targetLogBlend) > 1e-4) {
    const prevBlend = state.logBlend;
    const step = Math.min(1.0, dtSec * 3.8);
    state.logBlend = prevBlend + (state.targetLogBlend - prevBlend) * step;
    if (Math.abs(state.logBlend - state.targetLogBlend) < 1e-3) {
      state.logBlend = state.targetLogBlend;
    }
    for (let bi = 0; bi < beltNodeList.length; bi++) {
      beltNodeList[bi].userData.uniforms.uLogBlend.value = state.logBlend;
    }
    batchedOrbits.uniforms.uLogBlend.value = state.logBlend;
    overlays.updateOverlaysScaleAndLang(state.logBlend, null);
  }

  // Capture locked/camera-followed object's previous world position
  const followObj = state.cameraFollowObj !== undefined ? state.cameraFollowObj : state.lockedObj;
  const isFollowConstellation = Boolean(followObj?.is_constellation_sat);
  const followRt = (!isFollowConstellation && followObj) ? runtimeMap.get(followObj.id) : null;
  const isLockedConstellation = Boolean(state.lockedObj?.is_constellation_sat);
  const lockedRt = (!isLockedConstellation && state.lockedObj) ? runtimeMap.get(state.lockedObj.id) : null;
  let hadPrevLocked = false;
  if (isFollowConstellation) {
    hadPrevLocked = Boolean(constellationMgr.getFocusedWorldPosition(_prevLockedPos));
  } else if (followRt) {
    _prevLockedPos.copy(followRt.worldPos);
    hadPrevLocked = true;
  }

  const nowMs = performance.now();
  const nowSec = nowMs * 0.001;

  // Compute seamless Galactic cross-fade factor (C1-smooth across outer Oort Cloud -> Milky Way in both 1:1 AU and Log scales)
  const camOriginDist = camera.position.length();
  const liveCamDistAU = state.logBlend > 0.5
    ? LOG_R0 * (Math.exp(Math.min(20, camOriginDist / LOG_S0)) - 1.0)
    : camOriginDist;
  const galRampStart = THREE.MathUtils.lerp(55000.0, 320.0, state.logBlend);
  const galRampEnd = THREE.MathUtils.lerp(185000.0, 3120.0, state.logBlend);
  const galRamp = state.lockedObj?.is_galactic
    ? 1.0
    : THREE.MathUtils.smoothstep(camOriginDist, galRampStart, galRampEnd);
  state.galacticFactor = galRamp;
  const solarFadeStart = THREE.MathUtils.lerp(65000.0, 420.0, state.logBlend);
  const solarFadeEnd = THREE.MathUtils.lerp(175000.0, 1820.0, state.logBlend);
  const solarFade = 1.0 - THREE.MathUtils.smoothstep(camOriginDist, solarFadeStart, solarFadeEnd);
  const galObjFadeStart = THREE.MathUtils.lerp(60000.0, 10000.0, state.logBlend);
  const galObjFadeEnd = THREE.MathUtils.lerp(160000.0, 20000.0, state.logBlend);

  const hasHighlightedOrbit = Boolean(state.hoveredObj || (!state.isFocusedOnSelected && state.selectedObj));
  batchedOrbits.uniforms.uGlobalFade.value = solarFade;
  batchedOrbits.mesh.visible = solarFade > 0.01 && (state.orbitMode !== "off" || hasHighlightedOrbit);
  adamOverlay.update(state.logBlend, solarFade);

  for (let bi = 0; bi < beltNodeList.length; bi++) {
    const bNode = beltNodeList[bi];
    const f = (bNode.userData.catFactor ?? 1.0) * solarFade;
    bNode.userData.uniforms.uOpacity.value = bNode.userData.baseOpacity * f;
    bNode.visible = f > 0.015;
  }
  updateBeltDynamics();
  if (batchedOrbits.mesh.visible) refreshNBodyOrbits(false);
  overlays.ringsGroup.visible = state.showRings && solarFade > 0.15;
  overlays.galacticGroup.visible = state.showGalacticBand && solarFade > 0.15;
  overlays.setOverlayLabelsVisible(state.showLabels && solarFade > 0.35);

  // Pass 1: Update Sun & Heliocentric Primary Bodies (skipped cleanly when zoomed deep into Milky Way)
  if (solarFade > 0.005 || !state.lockedObj?.is_galactic) {
    const camPosNow = camera.position;
    const selIdNow = state.selectedObj?.id;
    const lockIdNow = state.lockedObj?.id;
    const hovIdNow = state.hoveredObj?.id;
    const catNow = state.activeCategory;

    for (let ri = 0; ri < runtimeList.length; ri++) {
      const rt = runtimeList[ri];
      const obj = rt.obj;
      if (obj.parent_id || obj.is_galactic) continue;

      if (obj.category === "star") {
        rt.worldPos.set(0, 0, 0);
        rt.node.position.set(0, 0, 0);
        // Scale Sun mesh between physical 1:1 AU radius (0.0046547 AU = 1 R_sun, well inside Parker Solar Probe's
        // q = 0.046 AU perihelion) and Deep-Space Log radius (0.085 scene units).
        const sunBaseR = 0.085;
        const sunTrueR = 0.0046547;
        const liveSunR = sunTrueR + (sunBaseR - sunTrueR) * state.logBlend;
        rt.node.userData.meshRadius = liveSunR;
        if (rt.node.userData.tiltGroup) {
          rt.node.userData.tiltGroup.scale.setScalar(liveSunR / sunBaseR);
        }
        if (rt.node.userData.sunUniforms) rt.node.userData.sunUniforms.uTime.value = nowSec;
        updateBodyPhysicalRotation(rt, state.simJD, null);
        continue;
      }

      if (rt.nbodyIdx > 0) evaluateNBodyHeliocentricAtFrameJD(rt.nbodyIdx, rt.isEarth, rt.eclPosAU);
      else computeLocalKeplerianAtFrameJD(obj, rt.eclPosAU);
      rt.liveHelioR_AU = Math.sqrt(rt.eclPosAU[0] * rt.eclPosAU[0] + rt.eclPosAU[1] * rt.eclPosAU[1] + rt.eclPosAU[2] * rt.eclPosAU[2]);
      helioAUToSceneInto(rt.eclPosAU[0], rt.eclPosAU[1], rt.eclPosAU[2], state.logBlend, rt.worldPos);
      rt.node.position.copy(rt.worldPos);

      // Distance-based LOD culling: when a body's 3D mesh is sub-pixel (< ~8 px, ratio > 52) and covered by its
      // screen-space beacon sprite, hide its 3D tiltGroup and skip per-frame rotation/shader matrix work.
      const distToCam = camPosNow.distanceTo(rt.worldPos);
      const meshR = rt.node.userData.meshRadius || 0.001;
      const ratio = distToCam / Math.max(1e-7, meshR);
      const isFocusOrHover = obj.id === selIdNow || obj.id === lockIdNow || obj.id === hovIdNow;
      const show3DMesh = isFocusOrHover || ratio <= 52.0;
      if (rt.node.userData.tiltGroup) {
        rt.node.userData.tiltGroup.visible = show3DMesh;
      }
      if (show3DMesh) {
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
    }

    // Pass 2: Tier-1 Planetary Moons & Tier-2 Lunar Sub-Orbiters (omitted when far from parent planet)
    for (let tierPass = 0; tierPass < 2; tierPass++) {
      for (let ri = 0; ri < runtimeList.length; ri++) {
        const rt = runtimeList[ri];
        const obj = rt.obj;
        if (!obj.parent_id || obj.is_galactic) continue;
        const parentRt = runtimeMap.get(obj.parent_id);
        if (!parentRt) continue;
        const isTier2 = Boolean(parentRt.obj.parent_id);
        if ((tierPass === 0 && isTier2) || (tierPass === 1 && !isTier2)) continue;

        const isChildFocusOrHover =
          obj.id === selIdNow || obj.id === lockIdNow || obj.id === hovIdNow ||
          obj.parent_id === selIdNow || obj.parent_id === lockIdNow;
        const pDist = camPosNow.distanceTo(parentRt.worldPos);
        const pMeshR = parentRt.node.userData.meshRadius || 0.001;
        const pRatio = pDist / Math.max(1e-7, pMeshR);

        // Omit invisible child moons/satellites when zoomed out from their parent planet
        if (!isChildFocusOrHover && catNow !== "moons_l2" && catNow !== "spacecraft" && pRatio > 34.0) {
          rt.node.visible = false;
          rt.labelObj.visible = false;
          continue;
        }
        if (!isHiddenDiscovery(obj) && (isChildFocusOrHover || objectMatchesCategory(obj, catNow))) {
          rt.node.visible = true;
        }

        computeChildSceneOffsetAtFrameJD(parentRt, obj, _tmpVec);
        rt.worldPos.copy(parentRt.worldPos).add(_tmpVec);
        rt.node.position.copy(rt.worldPos);
        rt.liveHelioR_AU = parentRt.liveHelioR_AU;

        const cRatio = camPosNow.distanceTo(rt.worldPos) / Math.max(1e-7, rt.node.userData.meshRadius || 0.001);
        const showChild3D = isChildFocusOrHover || cRatio <= 52.0;
        if (rt.node.userData.tiltGroup) {
          rt.node.userData.tiltGroup.visible = showChild3D;
        }
        if (showChild3D) {
          updateBodyPhysicalRotation(rt, state.simJD, parentRt);
          if (rt.node.userData.updateShaderSunVectors) {
            rt.node.userData.updateShaderSunVectors(rt.worldPos);
          }
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
  // Tracking a black hole from close by (not the fly-through of the whole-galaxy preset).
  _scaleInfo.blackHoleCloseUp = Boolean(
    lockedRt && state.lockedObj?.is_black_hole &&
    camera.position.distanceTo(lockedRt.worldPos) < lockedRt.node.userData.meshRadius * 40.0
  );
  _scaleInfo.focusedObjectId = state.lockedObj?.id || state.selectedObj?.id || state.hoveredObj?.id || null;

  if (state.showGalaxyLayer) {
    galaxyLayer.update(dtSec, camera, _scaleInfo);
    for (let i = 0; i < galacticBlackHoleControllers.length; i++) {
      const entry = galacticBlackHoleControllers[i];
      const isTargetBH =
        state.lockedObj?.id === entry.obj.id ||
        state.selectedObj?.id === entry.obj.id ||
        state.hoveredObj?.id === entry.obj.id;
      if (isTargetBH || focusedAnyGalactic) {
        entry.bhSys.setOpacity(1.0);
        entry.bhSys.update(dtSec, camera, _scaleInfo);
        entry.node.visible = true;
      } else if (camOriginDist < galObjFadeStart) {
        entry.bhSys.setOpacity(0.0);
        entry.node.visible = false;
      } else {
        const bhDistFade = THREE.MathUtils.smoothstep(camOriginDist, galObjFadeStart, galObjFadeEnd);
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

  // Co-move camera with followed object or advance fly-to tween
  let hasCurLocked = false;
  if (isFollowConstellation) {
    hasCurLocked = Boolean(constellationMgr.getFocusedWorldPosition(_curLockedPos));
  } else if (followRt) {
    _curLockedPos.copy(followRt.worldPos);
    hasCurLocked = true;
  }

  if (flyTween) {
    const elapsed = nowMs - flyTween.startTime;
    const u = Math.min(1.0, elapsed / flyTween.durationMs);
    const e = easeOutCubic(u);
    if (hasCurLocked) {
      if (flyTween.followLockedCenter) {
        _tmpVec.copy(_curLockedPos).sub(flyTween.toTarget);
        flyTween.toTarget.add(_tmpVec);
        flyTween.toPos.add(_tmpVec);
      } else if (flyTween.trackLockedDelta && hadPrevLocked) {
        _tmpVec.copy(_curLockedPos).sub(_prevLockedPos);
        flyTween.toTarget.add(_tmpVec);
        flyTween.toPos.add(_tmpVec);
      }
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
  const _localPrecCandidates = [];
  let viewRetessBudget = 12;

  const orbitsOff = state.orbitMode === "off";
  const orbitsSelectedOnly = state.orbitMode === "selected";
  for (let ri = 0; ri < runtimeList.length; ri++) {
    const rt = runtimeList[ri];
    rt.labelObj.visible = false;
    if (!rt.node.visible) continue;

    const obj = rt.obj;
    const distToCam = camPos.distanceTo(rt.worldPos);
    const meshR = rt.node.userData.meshRadius || 0.001;
    const ratio = distToCam / Math.max(1e-7, meshR);
    const isFocusObj = obj.id === selId || obj.id === lockId;
    const isHoverObj = obj.id === hovId;
    const inViewFrustum = _frustum.containsPoint(rt.worldPos);

    if (!obj.is_galactic && !obj.parent_id && obj.category !== "star" && batchedOrbits.mesh.visible) {
      const rg = batchedOrbits.orbitRanges.get(obj.id);
      if (rg) {
        const curAlpha = batchedOrbits.alphaArr[rg.startVert];
        const wasLocalOverride = rg._localPrecisionActive && rg._savedAlpha > 0.01;
        const effectiveAlpha = wasLocalOverride ? rg._savedAlpha : curAlpha;
        if (effectiveAlpha > 0.01) {
          const helioSceneR = Math.max(0.5, rt.worldPos.length());
          const inCloseLocalView =
            inViewFrustum && (ratio < 65.0 || distToCam < Math.max(0.8, helioSceneR * 0.14));
          const refreshStepDays = inCloseLocalView ? 1e-7 : 0.25;
          const needTimeRefresh =
            (inCloseLocalView || isFocusObj || isHoverObj) &&
            Math.abs(state.simJD - rg.lastRefreshJD) > refreshStepDays;
          const needViewRetess =
            rg.viewStamp !== _orbitViewStamp &&
            (isFocusObj || isHoverObj || inCloseLocalView || viewRetessBudget > 0);
          if (needTimeRefresh || needViewRetess) {
            if (!isFocusObj && !isHoverObj && !inCloseLocalView) viewRetessBudget--;
            writeHelioOrbitRangeToBuffer(rg, state.simJD);
          }
          const needFloat64LocalLine =
            inCloseLocalView &&
            distToCam < Math.max(0.45, helioSceneR * 0.14);
          if (needFloat64LocalLine) {
            _localPrecCandidates.push({ rt, rg, alphaCode: effectiveAlpha, distToCam });
          } else if (wasLocalOverride) {
            const end = rg.startVert + rg.vertCount;
            for (let vi = rg.startVert; vi < end; vi++) batchedOrbits.alphaArr[vi] = rg._savedAlpha;
            rg._localPrecisionActive = false;
            batchedOrbits.alphaAttr.needsUpdate = true;
          }
        } else if (rg._localPrecisionActive) {
          rg._localPrecisionActive = false;
        }
      }
    }

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
        const isStar = obj.category === "star";
        const beaconGain = isStar ? 1.0 : obj.is_new_discovery ? (isFocusObj ? 0.95 : 0.5) : obj.parent_id ? 0.42 : obj.category === "planets" ? 0.95 : 0.6;
        rt.node.userData.beaconSprite.material.opacity = fade * beaconGain;
        if (isStar) {
          // The Sun's glare shrinks in the galactic view, where it only marks "you are here".
          const sg = rt.node.userData.baseBeaconScale * (1.0 - 0.6 * state.galacticFactor);
          rt.node.userData.beaconSprite.scale.set(sg, sg, 1);
        }
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
        const sc = (isFocusObj ? 0.046 : 0.024) * pulse;
        rt.node.userData.discoveryReticle.scale.set(sc, sc, 1);
        rt.node.userData.discoveryReticle.material.opacity = fade * (isFocusObj ? 1.0 : 0.42);
        rt.node.userData.discoveryReticle.visible = fade > 0.02;
      }

      if (rt.satOrbitGroup) {
        const childHighlighted =
          (state.hoveredObj?.parent_id === obj.id) ||
          (!state.isFocusedOnSelected && state.selectedObj?.parent_id === obj.id);
        const childFocused =
          (state.isFocusedOnSelected && state.selectedObj?.parent_id === obj.id) ||
          (state.lockedObj?.parent_id === obj.id);
        const childSelected = childHighlighted || childFocused;
        if (
          solarFade < 0.1 ||
          (!childHighlighted && (orbitsOff || (obj.id === "EARTH" && constellationMgr.enabled && !childSelected && cat !== "spacecraft" && cat !== "moons_l2")))
        ) {
          // "Hidden" switches off the planetocentric rings unless a child moon/satellite is highlighted by hover or selection.
          rt.satOrbitGroup.visible = false;
        } else {
          const maxShowRatio = (cat === "moons_l2" || cat === "spacecraft") ? 110.0 : (childSelected ? 75.0 : 34.0);
          rt.satOrbitGroup.visible = childHighlighted || ratio < maxShowRatio;
          if (rt.satOrbitGroup.visible) {
            const rings = rt.satRingList;
            for (let k = 0; k < rings.length; k++) {
              const ring = rings[k];
              const chId = ring.userData.childId;
              const isChSelHighlight = !state.isFocusedOnSelected && chId === selId;
              const isChHovHighlight = chId === hovId;
              const isChFocused = (state.isFocusedOnSelected && chId === selId) || chId === lockId;
              const isScRing = ring.userData.isSpacecraftRing;
              if (isChSelHighlight) {
                ring.visible = true;
                ring.material.opacity = 0.98;
                if (ring.userData.baseColor) ring.material.color.copy(ring.userData.baseColor).lerp(SELECTION_HIGHLIGHT_THREE_COLOR, 0.72);
              } else if (isChHovHighlight) {
                ring.visible = true;
                ring.material.opacity = 0.96;
                if (ring.userData.baseColor) ring.material.color.copy(ring.userData.baseColor).lerp(HOVER_HIGHLIGHT_THREE_COLOR, 0.72);
              } else {
                if (ring.userData.baseColor) ring.material.color.copy(ring.userData.baseColor);
                if (orbitsOff) {
                  ring.visible = false;
                } else if (isChFocused) {
                  ring.visible = true;
                  ring.material.opacity = 0.98;
                } else if (orbitsSelectedOnly) {
                  ring.visible = false;
                } else if (isScRing) {
                  const f = cat === "spacecraft"
                    ? THREE.MathUtils.clamp(1.0 - (ratio - 35.0) / 45.0, 0.0, 1.0)
                    : THREE.MathUtils.clamp(1.0 - (ratio - 4.2) / 4.3, 0.0, 1.0);
                  ring.visible = f > 0.02;
                  ring.material.opacity = ring.userData.baseOpacity * f;
                } else {
                  const f = cat === "moons_l2"
                    ? THREE.MathUtils.clamp(1.0 - (ratio - 55.0) / 55.0, 0.0, 1.0)
                    : THREE.MathUtils.clamp(1.0 - (ratio - 14.0) / 20.0, 0.0, 1.0);
                  ring.visible = f > 0.02;
                  ring.material.opacity = ring.userData.baseOpacity * f;
                }
              }
              const needChildRingRefresh =
                ring.visible &&
                (isChSelHighlight || isChHovHighlight || isChFocused || ratio < 24.0) &&
                Math.abs(state.simJD - ring.userData.ringJD) >
                ((isChSelHighlight || isChHovHighlight || isChFocused || ratio < 10.0) ? 1e-6 : Math.max(0.01, ring.userData.periodDays * 0.003));
              if (needChildRingRefresh) {
                const attr = ring.geometry.attributes.position;
                fillChildOrbitRing(attr.array, rt, ring.userData.childObj, state.simJD, ring.userData.periodDays);
                attr.needsUpdate = true;
                ring.userData.ringJD = state.simJD;
              }
            }
          }
        }
      }
    } else if (rt.node.userData.beaconSprite) {
      const isGalTarget = obj.id === selId || obj.id === lockId || obj.id === hovId;
      const lmGate = (focusedAnyGalactic || isGalTarget)
        ? 1.0
        : THREE.MathUtils.smoothstep(camOriginDist, galObjFadeStart, galObjFadeEnd);
      const lmAlpha = isGalTarget
        ? Math.max(0.54, 0.54 * state.galacticFactor * lmGate)
        : 0.54 * state.galacticFactor * lmGate;
      const showLm = state.showGalaxyLayer && lmAlpha > 0.015;
      rt.node.visible = showLm;
      rt.node.userData.beaconSprite.visible = showLm;
      rt.node.userData.beaconSprite.material.opacity = showLm ? lmAlpha : 0.0;
    }

    // Frustum-culled priority label selection
    if (!state.showLabels) continue;
    if (!inViewFrustum) continue;

    const isSel = obj.id === selId || obj.id === lockId || obj.id === hovId;
    let priority = -1;

    if (obj.is_galactic) {
      const galLabelAllowed = focusedAnyGalactic || isSel || camOriginDist >= galObjFadeStart;
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

  if (_localPrecCandidates.length > 1) {
    _localPrecCandidates.sort((a, b) => a.distToCam - b.distToCam);
  }
  for (let i = 0; i < _localPrecCandidates.length; i++) {
    const { rg, alphaCode } = _localPrecCandidates[i];
    if (i < LOCAL_PRECISION_POOL_SIZE) {
      if (!rg._localPrecisionActive) {
        rg._savedAlpha = alphaCode;
        rg._localPrecisionActive = true;
        const end = rg.startVert + rg.vertCount;
        for (let vi = rg.startVert; vi < end; vi++) batchedOrbits.alphaArr[vi] = 0.0;
        batchedOrbits.alphaAttr.needsUpdate = true;
      } else {
        rg._savedAlpha = alphaCode;
      }
    } else if (rg._localPrecisionActive) {
      const end = rg.startVert + rg.vertCount;
      for (let vi = rg.startVert; vi < end; vi++) batchedOrbits.alphaArr[vi] = rg._savedAlpha;
      rg._localPrecisionActive = false;
      batchedOrbits.alphaAttr.needsUpdate = true;
    }
  }
  updateLocalPrecisionHelioOrbits(_localPrecCandidates, solarFade);

  // Zero-allocation 2D screen-space AABB overlap rejection pass (eliminates stacked CSS2D label piles)
  if (_labelCandidates.length > 1) {
    _labelCandidates.sort(compareLabelPriority);
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
      if (legendBox.open && bMinX < legendBox.right && bMaxY > legendBox.top) continue;
      if (boxZoomBarRect.active && bMinX < boxZoomBarRect.right && bMinY < boxZoomBarRect.bottom) continue;
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

  // Reference-ring labels: kept only inside the free viewport (clear of the bars, the colour key
  // and the inspector) and clear of the accepted body labels and of each other.
  if (state.showLabels && overlays.ringsGroup.visible) {
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
      const hw = 4.7 * ch.element.textContent.length + 12.0;
      const rMinX = rx - hw, rMaxX = rx + hw, rMinY = ry - 15.0, rMaxY = ry + 15.0;
      let blocked =
        rMinX < 10.0 || rMaxX > viewW - 10.0 || rMinY < 84.0 || rMaxY > viewH - 84.0 ||
        (inspOpenDesktop && rMaxX > viewW - 446.0) ||
        (legendBox.open && rMinX < legendBox.right && rMaxY > legendBox.top) ||
        (boxZoomBarRect.active && rMinX < boxZoomBarRect.right && rMinY < boxZoomBarRect.bottom);
      for (let j = 0; j < acceptedLabels && !blocked; j++) {
        const base = j * 4;
        blocked =
          rMinX < _acceptedLabelBoxes[base + 2] &&
          rMaxX > _acceptedLabelBoxes[base + 0] &&
          rMinY < _acceptedLabelBoxes[base + 3] &&
          rMaxY > _acceptedLabelBoxes[base + 1];
      }
      if (blocked) {
        ch.visible = false;
      } else if (acceptedLabels < MAX_LABEL_BOXES) {
        const wIdx = acceptedLabels * 4;
        _acceptedLabelBoxes[wIdx + 0] = rMinX;
        _acceptedLabelBoxes[wIdx + 1] = rMinY;
        _acceptedLabelBoxes[wIdx + 2] = rMaxX;
        _acceptedLabelBoxes[wIdx + 3] = rMaxY;
        acceptedLabels++;
      }
    }
  }

  if (doEvictionCheck) {
    evictLRUModels(selId ? [catalog.byId.get(selId)?.model_id] : null);
  }
}

// ==================== 3D PICKING, HOVER CONTOUR HIGHLIGHT & UPPER-RIGHT NAME READOUT ====================
const hoverReadoutEl = document.getElementById("hover-object-readout");
const hoverDotEl = document.getElementById("hover-object-dot");
const hoverNameEl = document.getElementById("hover-object-name");
const hoverCatEl = document.getElementById("hover-object-cat");

const HOVER_MASK_SCALE = Math.min(BASE_PIXEL_RATIO, 1.5);
const hoverMaskTarget = new THREE.WebGLRenderTarget(
  Math.max(1, Math.floor(window.innerWidth * HOVER_MASK_SCALE)),
  Math.max(1, Math.floor(window.innerHeight * HOVER_MASK_SCALE)),
  {
    minFilter: THREE.LinearFilter,
    magFilter: THREE.LinearFilter,
    format: THREE.RGBAFormat,
    depthBuffer: true,
    stencilBuffer: false
  }
);

const hoverContourUniforms = {
  uMaskTex: { value: hoverMaskTarget.texture },
  uResolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
  uHas3DMask: { value: 0.0 },
  uHasBeaconRing: { value: 0.0 },
  uCenterUV: { value: new THREE.Vector2(0.5, 0.5) },
  uRingRadiusPx: { value: 14.0 },
  uContourColor: { value: new THREE.Color(0xf4f4f5) }
};

const hoverContourMat = new THREE.ShaderMaterial({
  uniforms: hoverContourUniforms,
  vertexShader: `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = vec4(position.xy, 0.0, 1.0);
    }
  `,
  fragmentShader: `
    uniform sampler2D uMaskTex;
    uniform vec2 uResolution;
    uniform float uHas3DMask;
    uniform float uHasBeaconRing;
    uniform vec2 uCenterUV;
    uniform float uRingRadiusPx;
    uniform vec3 uContourColor;
    varying vec2 vUv;

    float sampleMask(vec2 uv) {
      vec4 c = texture2D(uMaskTex, uv);
      float lum = max(c.r, max(c.g, c.b));
      return clamp(max(c.a * 3.5, smoothstep(0.015, 0.085, lum)), 0.0, 1.0);
    }

    void main() {
      float edgeAlpha = 0.0;
      if (uHas3DMask > 0.5) {
        vec2 texel = 1.0 / max(uResolution, vec2(1.0));
        float m0 = sampleMask(vUv);
        float mMax = m0;
        float mMin = m0;
        for (int i = 0; i < 8; i++) {
          float ang = float(i) * 0.78539816339;
          vec2 dir = vec2(cos(ang), sin(ang));
          float s1 = sampleMask(vUv + dir * texel * 1.45);
          float s2 = sampleMask(vUv + dir * texel * 2.65);
          mMax = max(mMax, max(s1, s2));
          mMin = min(mMin, s1);
        }
        float grad = mMax - mMin;
        float rim = smoothstep(0.10, 0.46, grad) * (1.0 - 0.72 * mMin);
        edgeAlpha = max(edgeAlpha, rim * 0.94);
      }
      if (uHasBeaconRing > 0.5) {
        vec2 dPxVec = (vUv - uCenterUV) * uResolution;
        float dPx = length(dPxVec);
        float ring = smoothstep(1.85, 0.35, abs(dPx - uRingRadiusPx));
        edgeAlpha = max(edgeAlpha, ring * 0.92);
      }
      if (edgeAlpha < 0.015) discard;
      gl_FragColor = vec4(uContourColor, edgeAlpha);
    }
  `,
  transparent: true,
  depthTest: false,
  depthWrite: false
});

const hoverContourPostScene = new THREE.Scene();
const hoverContourPostCam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
const hoverContourQuad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), hoverContourMat);
hoverContourQuad.frustumCulled = false;
hoverContourPostScene.add(hoverContourQuad);

let _activeContourRoot = null;
const _hoverWorldTmp = new THREE.Vector3();

function setLayerRecursiveExcludingHelpers(rootNode, excludeSet, enable) {
  if (!rootNode) return;
  const stack = [rootNode];
  while (stack.length > 0) {
    const cur = stack.pop();
    if (!cur || cur.userData?.excludeFromContour || (excludeSet && excludeSet.has(cur))) continue;
    if (enable) cur.layers.enable(HOVER_CONTOUR_LAYER);
    else cur.layers.disable(HOVER_CONTOUR_LAYER);
    const ch = cur.children;
    if (ch) {
      for (let i = 0; i < ch.length; i++) stack.push(ch[i]);
    }
  }
}

function resolveHoverContourRootAndExcludes(obj) {
  if (!obj) return { root: null, excludes: null, bhController: null };
  if (obj.is_constellation_sat) {
    if (constellationMgr.focusedSatIdx === obj.sat_index && constellationMgr.focused3DHolder?.visible) {
      return { root: constellationMgr.focused3DHolder, excludes: null, bhController: null };
    }
    return { root: null, excludes: null, bhController: null };
  }
  // Non-black-hole galactic landmarks (globular/open clusters, LMC/SMC, nebulae) are rendered as screen-space
  // beacons without a 3D surface mesh, so they always use the C0 contour ring at every zoom level.
  if (obj.is_galactic && !obj.is_black_hole) {
    return { root: null, excludes: null, bhController: null };
  }
  const rt = runtimeMap.get(obj.id);
  if (!rt || !rt.node?.visible) return { root: null, excludes: null, bhController: null };
  const ud = rt.node.userData || {};
  if (obj.is_black_hole) {
    const bhCtrl = ud.bhController || null;
    const excludes = new Set();
    if (bhCtrl?.beaconSprite) excludes.add(bhCtrl.beaconSprite);
    return { root: bhCtrl?.coreMesh || rt.node, excludes, bhController: bhCtrl };
  }
  const excludes = new Set();
  if (ud.beaconSprite) excludes.add(ud.beaconSprite);
  if (ud.discoveryReticle) excludes.add(ud.discoveryReticle);
  if (ud.spacecraftPip) excludes.add(ud.spacecraftPip);
  if (ud.tailGroup) excludes.add(ud.tailGroup);
  if (rt.satOrbitGroup) excludes.add(rt.satOrbitGroup);
  if (constellationMgr?.hostGroup) excludes.add(constellationMgr.hostGroup);
  if (constellationMgr?.rootGroup) excludes.add(constellationMgr.rootGroup);
  if (constellationMgr?.pointsMesh) excludes.add(constellationMgr.pointsMesh);
  return { root: ud.tiltGroup || rt.node, excludes, bhController: null };
}

function updateHoverUI(hit) {
  const prevId = state.hoveredObj?.id || null;
  const nextId = hit?.id || null;
  state.hoveredObj = hit || null;
  canvas.style.cursor = hit ? "pointer" : "grab";
  if (prevId !== nextId) {
    updateVisibilityAndOrbits();
  }
  if (!hoverReadoutEl) return;
  if (!hit) {
    hoverReadoutEl.hidden = true;
    return;
  }
  if (hoverDotEl) hoverDotEl.style.background = "#5cc8ff";
  if (hoverNameEl) hoverNameEl.textContent = getObjectName(hit);
  if (hoverCatEl) hoverCatEl.textContent = getCategoryLabel(hit.category, "en", catalog.customCategories[hit.category]);
  hoverReadoutEl.hidden = false;
}

function renderSingleObjectContour(targetObj, contourHex) {
  if (!targetObj) return;

  let worldPos = null;
  let meshR = 0.001;
  if (targetObj.is_constellation_sat) {
    if (constellationMgr.focusedSatIdx === targetObj.sat_index && constellationMgr.focused3DHolder?.visible) {
      worldPos = constellationMgr.getFocusedWorldPosition(_hoverWorldTmp);
      meshR = constellationMgr.focused3DHolder.userData?.meshRadius || 0.000036;
    } else if (constellationMgr.earthRt && Number.isFinite(targetObj.sat_index)) {
      constellationMgr.computeSatLocalPosition(targetObj.sat_index, state.simJD, _hoverWorldTmp);
      constellationMgr.hostGroup.updateWorldMatrix(true, false);
      worldPos = _hoverWorldTmp.applyMatrix4(constellationMgr.hostGroup.matrixWorld);
      meshR = 0.000036;
    }
  } else {
    const rt = runtimeMap.get(targetObj.id);
    if (rt && rt.node?.visible) {
      worldPos = rt.worldPos;
      meshR = rt.node.userData?.meshRadius || 0.001;
    }
  }
  if (!worldPos) return;

  const w = window.innerWidth;
  const h = window.innerHeight;
  _pickProj.copy(worldPos).project(camera);
  if (_pickProj.z < -1.0 || _pickProj.z > 1.0) return;

  const u = _pickProj.x * 0.5 + 0.5;
  const v = _pickProj.y * 0.5 + 0.5;
  hoverContourUniforms.uResolution.value.set(w, h);
  hoverContourUniforms.uCenterUV.value.set(u, v);
  hoverContourUniforms.uContourColor.value.setHex(contourHex);

  const camDist = Math.max(1e-7, camera.position.distanceTo(worldPos));
  const bodyPxRadius = (meshR / Math.max(1e-7, camDist * HALF_FOV_TAN)) * (h * 0.5);
  const BEACON_RING_PX = 11.0;

  const { root, excludes, bhController } = resolveHoverContourRootAndExcludes(targetObj);
  // For black holes, meshR is the outer lensing sphere radius while the visible core/disk inside it has
  // fractional radius ~0.30 (dormant shadow + Einstein ring) or ~0.60 (active accretion disk).
  const coreScale = targetObj.is_black_hole
    ? (targetObj.bh_type === "dormant" ? 0.30 : 0.60)
    : 1.0;
  const effectivePxRadius = bodyPxRadius * coreScale;
  // Strictly ONE contour at all times with C0-continuous transition at effectivePxRadius === BEACON_RING_PX (11 px).
  const use3DMask = Boolean(root && effectivePxRadius >= BEACON_RING_PX);
  hoverContourUniforms.uHas3DMask.value = use3DMask ? 1.0 : 0.0;
  hoverContourUniforms.uHasBeaconRing.value = use3DMask ? 0.0 : 1.0;
  hoverContourUniforms.uRingRadiusPx.value = BEACON_RING_PX;

  if (use3DMask) {
    bhController?.setMaskPassActive?.(true);
    setLayerRecursiveExcludingHelpers(root, excludes, true);

    const bVis = beltsGroup.visible;
    const oVis = overlays.overlayGroup.visible;
    const gVis = galaxyLayer.group.visible;
    const orbVis = orbitsRoot.visible;
    const prevBg = scene.background;

    beltsGroup.visible = false;
    overlays.overlayGroup.visible = false;
    galaxyLayer.group.visible = false;
    orbitsRoot.visible = false;
    scene.background = null;

    camera.layers.set(HOVER_CONTOUR_LAYER);
    renderer.setRenderTarget(hoverMaskTarget);
    renderer.setClearColor(0x000000, 0.0);
    renderer.clear(true, true, false);
    renderer.render(scene, camera);

    renderer.setRenderTarget(null);
    renderer.setClearColor(0x060607, 1.0);
    camera.layers.set(0);
    scene.background = prevBg;
    beltsGroup.visible = bVis;
    overlays.overlayGroup.visible = oVis;
    galaxyLayer.group.visible = gVis;
    orbitsRoot.visible = orbVis;

    setLayerRecursiveExcludingHelpers(root, null, false);
    bhController?.setMaskPassActive?.(false);
  }

  const prevAutoClear = renderer.autoClear;
  renderer.autoClear = false;
  renderer.render(hoverContourPostScene, hoverContourPostCam);
  renderer.autoClear = prevAutoClear;
}

function renderHoverContourPass() {
  const selHighlightObj = (!state.isFocusedOnSelected && state.selectedObj) ? state.selectedObj : null;
  const hovObj = state.hoveredObj;
  if (selHighlightObj) {
    // Selected highlighting is yellow
    renderSingleObjectContour(selHighlightObj, SELECTION_HIGHLIGHT_HEX);
  }
  if (hovObj && hovObj.id !== selHighlightObj?.id) {
    // Hover highlighting is common light blue
    renderSingleObjectContour(hovObj, HOVER_HIGHLIGHT_HEX);
  }
}

const _orbPickPt = new THREE.Vector3();
const _orbPickDelta = new THREE.Vector3();
const _orbCamFwd = new THREE.Vector3();

function pointToSegmentDistPx(px, py, x1, y1, x2, y2) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const lenSq = dx * dx + dy * dy;
  let t = 0.0;
  if (lenSq > 1e-6) {
    t = Math.max(0.0, Math.min(1.0, ((px - x1) * dx + (py - y1) * dy) / lenSq));
  }
  return Math.hypot(px - (x1 + t * dx), py - (y1 + t * dy));
}

function pickVisibleOrbitAtClientXY(clientX, clientY) {
  const w = window.innerWidth;
  const h = window.innerHeight;
  const halfW = w * 0.5;
  const halfH = h * 0.5;
  const camPos = camera.position;
  _orbCamFwd.set(0, 0, -1).applyQuaternion(camera.quaternion).normalize();

  let bestObj = null;
  let bestDist = 10.0;

  // 1. Check visible child moon / spacecraft orbit rings around their parent body
  for (let ri = 0; ri < runtimeList.length; ri++) {
    const pRt = runtimeList[ri];
    if (!pRt.node.visible || !pRt.satOrbitGroup?.visible) continue;
    const wx = pRt.worldPos.x, wy = pRt.worldPos.y, wz = pRt.worldPos.z;
    const rings = pRt.satRingList;
    for (let k = 0; k < rings.length; k++) {
      const ring = rings[k];
      if (!ring.visible) continue;
      const childObj = ring.userData.childObj || catalog.byId.get(ring.userData.childId);
      if (!childObj) continue;
      const arr = ring.geometry.attributes.position.array;
      const nPts = (arr.length / 3) | 0;
      if (nPts < 2) continue;

      let prevValid = false, prevSx = 0, prevSy = 0;
      let firstValid = false, firstSx = 0, firstSy = 0;
      let minRingDist = 999.0;

      for (let i = 0; i < nPts; i++) {
        _orbPickPt.set(wx + arr[i * 3], wy + arr[i * 3 + 1], wz + arr[i * 3 + 2]);
        if (_orbPickDelta.copy(_orbPickPt).sub(camPos).dot(_orbCamFwd) <= 1e-5) {
          prevValid = false;
          continue;
        }
        _orbPickPt.project(camera);
        if (_orbPickPt.z < -1.0 || _orbPickPt.z > 1.0) {
          prevValid = false;
          continue;
        }
        const sx = _orbPickPt.x * halfW + halfW;
        const sy = -_orbPickPt.y * halfH + halfH;
        if (i === 0) {
          firstValid = true;
          firstSx = sx;
          firstSy = sy;
        }
        if (prevValid) {
          const d = pointToSegmentDistPx(clientX, clientY, prevSx, prevSy, sx, sy);
          if (d < minRingDist) minRingDist = d;
        }
        prevValid = true;
        prevSx = sx;
        prevSy = sy;
      }
      if (prevValid && firstValid) {
        const d = pointToSegmentDistPx(clientX, clientY, prevSx, prevSy, firstSx, firstSy);
        if (d < minRingDist) minRingDist = d;
      }
      if (minRingDist < bestDist) {
        bestDist = minRingDist;
        bestObj = childObj;
      }
    }
  }

  // 2. Check visible heliocentric orbits in batchedOrbits
  if (batchedOrbits.mesh.visible) {
    const blend = state.logBlend;
    for (let ri = 0; ri < runtimeList.length; ri++) {
      const rt = runtimeList[ri];
      if (!rt.node.visible) continue;
      const obj = rt.obj;
      if (obj.parent_id || obj.is_galactic || obj.category === "star") continue;
      const rg = batchedOrbits.orbitRanges.get(obj.id);
      if (!rg) continue;
      const alpha = (rg._localPrecisionActive && rg._savedAlpha > 0.01)
        ? rg._savedAlpha
        : batchedOrbits.alphaArr[rg.startVert];
      if (alpha <= 0.01) continue;

      const p = rg.rawPositions;
      const nPts = (p.length / 3) | 0;
      if (nPts < 2) continue;

      let prevValid = false, prevSx = 0, prevSy = 0;
      let firstValid = false, firstSx = 0, firstSy = 0;
      let minOrbDist = 999.0;

      for (let i = 0; i < nPts; i++) {
        const xE = p[i * 3];
        const zE = p[i * 3 + 1];
        const negYE = p[i * 3 + 2];
        const rAU = Math.hypot(xE, zE, negYE);
        const rLog = LOG_S0 * Math.log(1.0 + rAU / LOG_R0);
        const scale = rAU > 1e-9 ? (rAU + (rLog - rAU) * blend) / rAU : 0.0;
        _orbPickPt.set(xE * scale, zE * scale, negYE * scale);

        if (_orbPickDelta.copy(_orbPickPt).sub(camPos).dot(_orbCamFwd) <= 1e-5) {
          prevValid = false;
          continue;
        }
        _orbPickPt.project(camera);
        if (_orbPickPt.z < -1.0 || _orbPickPt.z > 1.0) {
          prevValid = false;
          continue;
        }
        const sx = _orbPickPt.x * halfW + halfW;
        const sy = -_orbPickPt.y * halfH + halfH;
        if (i === 0) {
          firstValid = true;
          firstSx = sx;
          firstSy = sy;
        }
        if (prevValid) {
          const d = pointToSegmentDistPx(clientX, clientY, prevSx, prevSy, sx, sy);
          if (d < minOrbDist) minOrbDist = d;
        }
        prevValid = true;
        prevSx = sx;
        prevSy = sy;
      }
      if (rg.closed && prevValid && firstValid) {
        const d = pointToSegmentDistPx(clientX, clientY, prevSx, prevSy, firstSx, firstSy);
        if (d < minOrbDist) minOrbDist = d;
      }
      if (minOrbDist < bestDist) {
        bestDist = minOrbDist;
        bestObj = obj;
      }
    }
  }

  return bestObj;
}

function isParentOrbitalAreaUncovered50Pct(pRt, pBodyPxRadius) {
  if (!pRt) return true;
  if (pRt.obj.id === "EARTH" && constellationMgr.enabled && constellationMgr.pointsMesh?.visible) {
    if (!constellationMgr.isUncoveredAreaAtLeast50Pct(pBodyPxRadius)) return false;
  }
  const children = childrenByParent.get(pRt.obj.id);
  const nChild = children ? children.length : 0;
  if (nChild <= 0) return true;
  const zoneArea = Math.PI * Math.pow(Math.max(1.0, pBodyPxRadius * 3.2), 2);
  const markerArea = Math.PI * 7.5 * 7.5;
  return (nChild * markerArea) / zoneArea <= Math.LN2;
}

function getEarthDiskHitInfo(clientX, clientY) {
  const earthRt = runtimeMap.get("EARTH");
  if (!earthRt || !earthRt.node.visible) {
    return { onEarthDisk: false, earthBodyPxRadius: 0.0, dPxToEarth: 1e9 };
  }
  const w = window.innerWidth;
  const h = window.innerHeight;
  _pickProj.copy(earthRt.worldPos).project(camera);
  if (_pickProj.z < -1.0 || _pickProj.z > 1.0) {
    return { onEarthDisk: false, earthBodyPxRadius: 0.0, dPxToEarth: 1e9 };
  }
  const sx = (_pickProj.x * 0.5 + 0.5) * w;
  const sy = (-_pickProj.y * 0.5 + 0.5) * h;
  const dPxToEarth = Math.hypot(sx - clientX, sy - clientY);
  const meshR = Math.max(1e-6, earthRt.node.userData.meshRadius || 0.001);
  const camDist = Math.max(1e-6, camera.position.distanceTo(earthRt.worldPos));
  const earthBodyPxRadius = (meshR / (camDist * HALF_FOV_TAN)) * (h * 0.5);
  return {
    onEarthDisk: dPxToEarth <= earthBodyPxRadius,
    earthBodyPxRadius,
    dPxToEarth
  };
}

function pickBodyAtClientXY(clientX, clientY) {
  const w = window.innerWidth;
  const h = window.innerHeight;
  let bestObj = null;
  let bestScore = 22.0;
  let bestIsOnBodyDisk = false;

  for (const rt of runtimeMap.values()) {
    if (!rt.node.visible) continue;
    if (!rt.obj.is_galactic && state.galacticFactor > 0.7 && rt.obj.category !== "star") continue;
    if (rt.obj.is_galactic && state.galacticFactor < 0.15) continue;

    const meshR = Math.max(1e-6, rt.node.userData.meshRadius || 0.001);
    const camDist = Math.max(1e-6, camera.position.distanceTo(rt.worldPos));
    const ringMult = rt.obj.has_rings
      ? 2.25
      : rt.obj.is_black_hole
        ? (rt.obj.bh_type === "dormant" ? 0.35 : 0.65)
        : 1.04;
    const pxRadius = (rt.obj.is_galactic && !rt.obj.is_black_hole)
      ? 16.0
      : ((meshR * ringMult) / (camDist * HALF_FOV_TAN)) * (h * 0.5);

    if (rt.obj.parent_id) {
      const pRt = runtimeMap.get(rt.obj.parent_id);
      if (pRt && pRt.node.visible) {
        const pMeshR = Math.max(1e-6, pRt.node.userData.meshRadius || 0.001);
        const pCamDist = Math.max(1e-6, camera.position.distanceTo(pRt.worldPos));
        if (state.activeCategory !== "spacecraft" && state.activeCategory !== "moons_l2" && pCamDist > pMeshR * 38.0) {
          continue;
        }
        _pickProj.copy(pRt.worldPos).project(camera);
        if (_pickProj.z >= -1.0 && _pickProj.z <= 1.0) {
          const pSx = (_pickProj.x * 0.5 + 0.5) * w;
          const pSy = (-_pickProj.y * 0.5 + 0.5) * h;
          const dPxToParent = Math.hypot(pSx - clientX, pSy - clientY);
          const pBodyPxRadius = (pMeshR / (pCamDist * HALF_FOV_TAN)) * (h * 0.5);
          const pHitRadius = Math.max(20.0, Math.min(h * 0.48, pBodyPxRadius));
          const orbitersSeparable =
            state.activeCategory === "spacecraft" ||
            state.activeCategory === "moons_l2" ||
            isParentOrbitalAreaUncovered50Pct(pRt, pBodyPxRadius);
          // 1. If < 50% of the orbital zone is uncovered, the centroid (parent body) takes priority
          if (!orbitersSeparable && dPxToParent <= Math.max(pHitRadius, pBodyPxRadius * 3.2)) {
            continue;
          }
          // 2. Depth ordering: if cursor is on the parent planet's opaque globe disk and the child is behind the parent, parent occludes child
          if (dPxToParent <= pBodyPxRadius && camDist >= pCamDist) {
            continue;
          }
        }
      }
    }

    _pickProj.copy(rt.worldPos).project(camera);
    if (_pickProj.z < -1.0 || _pickProj.z > 1.0) continue;
    const sx = (_pickProj.x * 0.5 + 0.5) * w;
    const sy = (-_pickProj.y * 0.5 + 0.5) * h;
    const dPx = Math.hypot(sx - clientX, sy - clientY);
    const hitRadius = rt.obj.parent_id
      ? Math.max(10.0, Math.min(h * 0.48, pxRadius))
      : Math.max(20.0, Math.min(h * 0.48, pxRadius));

    if (dPx <= hitRadius) {
      // When >= 50% of orbital area is uncovered, foreground orbiting bodies within 10 px take priority over the parent disk behind them.
      const baseScore = (!rt.obj.parent_id && pxRadius > 20.0) ? 12.5 + (dPx / hitRadius) * 7.5 : dPx;
      const weighted = rt.obj.is_new_discovery || rt.obj.is_black_hole ? baseScore * 0.85 : baseScore;
      if (weighted < bestScore) {
        bestScore = weighted;
        bestObj = rt.obj;
        bestIsOnBodyDisk = dPx <= pxRadius;
      }
    }
  }
  if (bestObj && (bestScore <= 15.0 || bestIsOnBodyDisk)) return bestObj;
  const orbitHit = pickVisibleOrbitAtClientXY(clientX, clientY);
  return orbitHit || bestObj;
}

// Unified picking routine used identically by BOTH hover and click so the highlighted object
// is always the exact object selected on click.
async function pickObjectAtClientXYAsync(clientX, clientY) {
  let hit = pickBodyAtClientXY(clientX, clientY);
  const { onEarthDisk, earthBodyPxRadius } = getEarthDiskHitInfo(clientX, clientY);
  const satUncovered50Pct =
    state.activeCategory === "starlink_sats" ||
    constellationMgr.isUncoveredAreaAtLeast50Pct(earthBodyPxRadius);

  if (!hit) {
    const satHit = await constellationMgr.pickNearestAtScreenXYAsync(clientX, clientY, camera, state.simJD, {
      cursorOnEarthDisk: onEarthDisk,
      maxDistPx: 10.0
    });
    if (satHit) {
      // If < 50% of Earth's orbital zone is uncovered, the centroid (Earth) always takes priority over crowded satellites.
      hit = satUncovered50Pct ? satHit : (catalog.byId.get("EARTH") || satHit);
    }
  } else if (hit.id === "EARTH" && satUncovered50Pct) {
    // >= 50% of Earth's orbital area is uncovered (LEO / Earth Orbit view):
    // a front-facing satellite directly under the cursor takes priority over Earth; uncovered gaps select Earth.
    const satHit = await constellationMgr.pickNearestAtScreenXYAsync(clientX, clientY, camera, state.simJD, {
      cursorOnEarthDisk: onEarthDisk,
      maxDistPx: onEarthDisk ? 5.0 : 9.0
    });
    if (satHit) hit = satHit;
  }
  return hit;
}

const _rightDownXY = new THREE.Vector2();
const _lastHoverXY = new THREE.Vector2(-9999, -9999);

document.getElementById("viewport-container")?.addEventListener("contextmenu", (e) => {
  e.preventDefault();
});

window.addEventListener("pointerdown", (e) => {
  if (e.button === 2) {
    _rightDownXY.set(e.clientX, e.clientY);
  }
}, true);

window.addEventListener("pointerup", (e) => {
  // Right-click anywhere (distinct from drag) unselects the current selection
  if (e.button === 2 && Math.hypot(e.clientX - _rightDownXY.x, e.clientY - _rightDownXY.y) <= 5.0) {
    unselectCurrentObject();
  }
}, true);

canvas.addEventListener("pointerdown", (e) => {
  if (e.button === 0) {
    _pointerDownXY.set(e.clientX, e.clientY);
  }
});

canvas.addEventListener("pointerup", async (e) => {
  if (e.button !== 0) return;
  if ((appReady && boxZoom?.getMode?.() !== "off") || e.shiftKey || e.altKey) return;
  if (Math.hypot(e.clientX - _pointerDownXY.x, e.clientY - _pointerDownXY.y) > 5.0) return;

  // Use the already-highlighted object at the cursor if hover resolved it at this position,
  // otherwise run the identical unified picker.
  let hit =
    Math.hypot(e.clientX - _lastHoverXY.x, e.clientY - _lastHoverXY.y) <= 6.0 && state.hoveredObj !== undefined
      ? state.hoveredObj
      : null;
  if (!hit) {
    hit = await pickObjectAtClientXYAsync(e.clientX, e.clientY);
  }
  if (hit) {
    handleObjectPrimaryClick(hit);
  } else {
    unselectCurrentObject();
  }
});

let lastHoverCheckMs = 0;
let hoverPickSeq = 0;
canvas.addEventListener("pointermove", async (e) => {
  if (appReady && (boxZoom?.getMode?.() !== "off" || boxZoom?.isDragging?.() || e.shiftKey || e.altKey)) {
    canvas.style.cursor = "crosshair";
    updateHoverUI(null);
    return;
  }
  const now = performance.now();
  if (now - lastHoverCheckMs < 36) return;
  lastHoverCheckMs = now;
  const seq = ++hoverPickSeq;
  const hit = await pickObjectAtClientXYAsync(e.clientX, e.clientY);
  if (seq !== hoverPickSeq) return;
  _lastHoverXY.set(e.clientX, e.clientY);
  updateHoverUI(hit);
});

canvas.addEventListener("pointerleave", () => {
  hoverPickSeq++;
  updateHoverUI(null);
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

// A catalogue row is listed under a category chip when it matches it and its layer is on. The
// "Survey Discoveries" chip always lists the candidates; choosing it switches their layer on.
function isListedInCategory(obj, catKey) {
  if (!objectMatchesCategory(obj, catKey)) return false;
  return catKey === "discoveries" || !isHiddenDiscovery(obj);
}

function renderCategoryFilterBar() {
  const bar = document.getElementById("category-filter-bar");
  if (!bar) return;
  bar.innerHTML = "";

  for (const catKey of CATEGORY_ORDER) {
    const count = catalog.objects.filter((o) => isListedInCategory(o, catKey)).length;
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = `cat-pill${catKey === "discoveries" ? " cat-discoveries" : ""}${state.activeCategory === catKey ? " active" : ""}`;

    const left = document.createElement("span");
    left.className = "cat-pill-left";
    const dot = document.createElement("span");
    dot.className = "cat-dot";
    dot.style.background = CATEGORY_DOT_COLORS[catKey] || CATEGORY_COLORS.spacecraft;
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
      if (catKey === "discoveries" && !state.showDiscoveries) setDiscoveriesVisible(true, false);
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

  const filtered = catalog.objects.filter((o) => isListedInCategory(o, state.activeCategory));
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
    dot.style.background = obj.color || CATEGORY_COLORS.spacecraft;
    left.appendChild(dot);

    if (obj.is_new_discovery) {
      const badge = document.createElement("span");
      badge.className = "pill-new-mini";
      badge.textContent = "NEW";
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
    row.addEventListener("pointerenter", () => updateHoverUI(obj));
    row.addEventListener("pointerleave", () => updateHoverUI(null));
    row.addEventListener("click", () => {
      handleObjectPrimaryClick(obj);
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
    relBtn.style.display = "inline-block";
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
  const obj = state.selectedObj || catalog.byId.get("SUN") || catalog.objects[0];
  if (!obj) return;
  const rt = runtimeMap.get(obj.id);

  const zoomToBar = document.getElementById("insp-zoom-to-bar");
  const zoomToBtn = document.getElementById("btn-zoom-to-focus");
  if (zoomToBar && zoomToBtn) {
    const showZoomTo = Boolean(state.selectedObj && !state.isFocusedOnSelected);
    zoomToBar.hidden = !showZoomTo;
    zoomToBtn.textContent = `Zoom to ${getObjectName(obj, state.lang)}`;
  }

  const badgesWrap = document.getElementById("insp-badges");
  badgesWrap.innerHTML = "";
  const catSpan = document.createElement("span");
  catSpan.className = "inspector-cat-tag";
  catSpan.textContent = getCategoryLabel(obj.category, state.lang, catalog.customCategories[obj.category]);
  badgesWrap.appendChild(catSpan);

  const customBadge = obj.discovery_badge_en;
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
    const diamLabel = obj.diameter_label_en;
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
      physGrid.appendChild(makeTelemetryCell(tr(state.lang, "lblSiderealRot"), formatSiderealPeriod(obj)));
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
      b.addEventListener("pointerenter", () => updateHoverUI(ch));
      b.addEventListener("pointerleave", () => updateHoverUI(null));
      b.addEventListener("click", () => handleObjectPrimaryClick(ch));
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
    b.addEventListener("pointerenter", () => updateHoverUI(parentObj));
    b.addEventListener("pointerleave", () => updateHoverUI(null));
    b.addEventListener("click", () => handleObjectPrimaryClick(parentObj));
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
  const L = "en";
  document.documentElement.lang = "en";

  document.getElementById("brand-title").textContent = tr(L, "brandTitle");
  document.getElementById("search-input").placeholder = tr(L, "searchPlaceholder");
  document.getElementById("search-input").title = tr(L, "searchTitle");
  document.getElementById("lbl-menu-explore").textContent = tr(L, "menuExplore");
  document.getElementById("lbl-menu-view").textContent = tr(L, "menuView");
  document.getElementById("lbl-menu-layers").textContent = tr(L, "menuLayers");
  document.getElementById("lbl-menu-camera").textContent = tr(L, "menuCamera");
  document.getElementById("lbl-menu-portals").textContent = tr(L, "menuPortals");
  document.getElementById("lbl-portals-hdr").textContent = tr(L, "portalsHdr");
  document.getElementById("hub-nav-link").textContent = tr(L, "portalHubLink");
  document.getElementById("gallery-nav-link").textContent = tr(L, "galleryLink");
  document.getElementById("adam-console-link").textContent = `${tr(L, "adamConsoleLink")} ↗`;
  document.getElementById("studio-nav-link").textContent = `${tr(L, "playgroundLink")} ↗`;

  const blogNav = document.getElementById("blog-nav-link");
  blogNav.textContent = `${tr(L, "blogLinkLabel")} ↗`;
  blogNav.href = buildBlogUrl(L);

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
  document.getElementById("toggle-discoveries-btn").textContent = tr(L, "discoveriesToggle", { n: discoveryCount });
  document.getElementById("toggle-legend-btn").textContent = tr(L, "legendToggle");
  document.getElementById("lbl-overlays-hdr").textContent = tr(L, "overlaysHdr");
  renderColorLegend();
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
  const bzInBtn = document.getElementById("btn-box-zoom-in");
  if (bzInBtn) {
    bzInBtn.textContent = `⊞ ${tr(L, "boxZoomIn")}`;
    bzInBtn.title = tr(L, "boxZoomInTitle");
  }
  const bzOutBtn = document.getElementById("btn-box-zoom-out");
  if (bzOutBtn) {
    bzOutBtn.textContent = `⊙ ${tr(L, "boxZoomOut")}`;
    bzOutBtn.title = tr(L, "boxZoomOutTitle");
  }
  const bzUndoBtn = document.getElementById("btn-zoom-back");
  if (bzUndoBtn) {
    bzUndoBtn.title = tr(L, "boxZoomUndoTitle");
  }
  if (appReady) boxZoom?.refreshLabels?.();
  measureLegendBox();
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

// Outreach colour key: the radial Solar System scale, the stellar temperature sequence and the
// galactic object types, all read from colorSystem.js (the same tokens the scene uses).
function renderColorLegend() {
  const host = document.getElementById("color-legend-body");
  if (!host) return;
  const L = state.lang;
  host.innerHTML = "";
  const addSection = (titleKey, rows, withGradient) => {
    const hdr = document.createElement("div");
    hdr.className = "legend-section-hdr";
    hdr.textContent = tr(L, titleKey);
    host.appendChild(hdr);
    if (withGradient) {
      const bar = document.createElement("div");
      bar.className = "legend-gradient";
      bar.style.background = `linear-gradient(90deg, ${rows.map((r) => r.color).join(", ")})`;
      host.appendChild(bar);
    }
    const grid = document.createElement("div");
    grid.className = "legend-grid";
    for (const r of rows) {
      const text = r.label_en || r.key;
      const row = document.createElement("div");
      row.className = text.length > 23 ? "legend-row legend-row-wide" : "legend-row";
      const sw = document.createElement("span");
      sw.className = "legend-swatch";
      sw.style.background = r.color;
      const lb = document.createElement("span");
      lb.className = "legend-label";
      lb.textContent = text;
      row.append(sw, lb);
      grid.appendChild(row);
    }
    host.appendChild(grid);
  };
  addSection("legendSolar", LEGEND_SOLAR_SYSTEM, false);
  addSection("legendStellar", LEGEND_STELLAR, true);
  addSection("legendGalactic", LEGEND_GALACTIC, false);
  const title = document.getElementById("color-legend-title");
  if (title) title.textContent = tr(L, "legendTitle");
  measureLegendBox();
}

function measureLegendBox() {
  const dock = document.getElementById("quick-view-dock");
  const panel = document.getElementById("color-legend-panel");
  const dockOpen = Boolean(dock && !dock.classList.contains("collapsed"));
  const activeBoxEl = dockOpen ? dock : (panel?.classList.contains("open") ? panel : null);
  legendBox.open = Boolean(activeBoxEl);
  if (activeBoxEl) {
    const rc = activeBoxEl.getBoundingClientRect();
    legendBox.right = rc.right + 8.0;
    legendBox.top = rc.top - 8.0;
  }
  const bzBar = document.getElementById("box-zoom-bar");
  const bzRc = bzBar?.getBoundingClientRect?.();
  if (bzRc && bzRc.width > 0 && bzRc.height > 0) {
    boxZoomBarRect.active = true;
    boxZoomBarRect.right = bzRc.right + 8.0;
    boxZoomBarRect.bottom = bzRc.bottom + 8.0;
  } else {
    boxZoomBarRect.active = false;
  }
}

function setLegendOpen(flag) {
  const open = Boolean(flag);
  document.getElementById("color-legend-panel")?.classList.toggle("open", open);
  document.getElementById("toggle-legend-btn")?.classList.toggle("active", open);
  document.getElementById("quick-toggle-legend-btn")?.classList.toggle("active", open);
  measureLegendBox();
}

function setQuickViewCollapsed(collapsed) {
  const isCollapsed = Boolean(collapsed);
  document.getElementById("quick-view-dock")?.classList.toggle("collapsed", isCollapsed);
  const reopenBtn = document.getElementById("quick-view-reopen-btn");
  if (reopenBtn) reopenBtn.style.display = isCollapsed ? "block" : "none";
  measureLegendBox();
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
    if (state.lockedObj) u.searchParams.set("focus", state.lockedObj.id);
    else u.searchParams.delete("focus");
    if (state.activeCategory && state.activeCategory !== "all") u.searchParams.set("category", state.activeCategory);
    else u.searchParams.delete("category");
    u.searchParams.delete("lang");
    if (state.showDiscoveries) u.searchParams.set("discoveries", "1");
    else u.searchParams.delete("discoveries");
    window.history.replaceState({}, "", u.toString());
  } catch (_) { }
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
      const hay = `${o.id} ${o.name_en} ${(o.aliases || []).join(" ")} ${o.category}`.toLowerCase();
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
    const tourIds = state.showDiscoveries ? DISCOVERY_TOUR_IDS : COSMOS_TOUR_IDS;
    const id = tourIds[state.autoTourIdx % tourIds.length];
    state.autoTourIdx++;
    const obj = resolveObjectByQuery(catalog, id);
    if (obj) selectAndFlyTo(obj, "auto");
  };
  stepTour();
  state.autoTourTimer = setInterval(stepTour, 6000);
}

// ==================== WIRE CONTROLS ====================
// Vertical half-field of the camera per unit distance (tan of half the 46 deg field of view).
const HALF_FOV_TAN = Math.tan((46.0 * Math.PI) / 360.0);

function setScaleMode(mode) {
  // Switching scale re-frames a Sun-centred view so that the same radius in AU stays at the edge
  // of the window: without this, an inner-system view in the log scale becomes a 30 AU view in
  // the true scale, with the inner planets crushed into the centre.
  if (appReady && mode !== state.scaleMode && controls.target.lengthSq() < 0.25 && camera.position.length() < 300.0) {
    const d0 = camera.position.distanceTo(controls.target);
    const halfField = d0 * HALF_FOV_TAN;
    const d1 = mode === "true"
      ? (LOG_R0 * (Math.exp(Math.min(18.0, halfField / LOG_S0)) - 1.0)) / HALF_FOV_TAN
      : (LOG_S0 * Math.log(1.0 + halfField / LOG_R0)) / HALF_FOV_TAN;
    if (Number.isFinite(d1) && d1 > 0.02 && d0 > 1e-6) {
      _tmpVec2.copy(camera.position).sub(controls.target).multiplyScalar(d1 / d0).add(controls.target);
      startCameraTween(controls.target, _tmpVec2, 0.7);
    }
  }
  state.scaleMode = mode;
  state.targetLogBlend = mode === "log" ? 1.0 : 0.0;
  document.getElementById("scale-log-btn")?.classList.toggle("active", mode === "log");
  document.getElementById("scale-true-btn")?.classList.toggle("active", mode === "true");
  document.getElementById("quick-toggle-log-btn")?.classList.toggle("active", mode === "log");
}

function setOrbitMode(nextMode) {
  state.orbitMode = nextMode;
  const topSel = document.getElementById("orbit-mode-select");
  if (topSel && topSel.value !== nextMode) topSel.value = nextMode;
  const quickSel = document.getElementById("quick-orbit-select");
  if (quickSel && quickSel.value !== nextMode) quickSel.value = nextMode;
  updateVisibilityAndOrbits();
}

document.getElementById("scale-log-btn").addEventListener("click", () => setScaleMode("log"));
document.getElementById("scale-true-btn").addEventListener("click", () => setScaleMode("true"));
document.getElementById("quick-toggle-log-btn")?.addEventListener("click", () => {
  setScaleMode(state.scaleMode === "log" ? "true" : "log");
});

document.getElementById("orbit-mode-select").addEventListener("change", (e) => {
  setOrbitMode(e.target.value);
});
document.getElementById("quick-orbit-select")?.addEventListener("change", (e) => {
  setOrbitMode(e.target.value);
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
document.getElementById("toggle-discoveries-btn").addEventListener("click", () => {
  stopAutoTour();
  setDiscoveriesVisible(!state.showDiscoveries);
  syncURLState();
});
document.getElementById("quick-toggle-discoveries-btn")?.addEventListener("click", () => {
  stopAutoTour();
  setDiscoveriesVisible(!state.showDiscoveries);
  syncURLState();
});
document.getElementById("toggle-legend-btn").addEventListener("click", () => {
  setLegendOpen(!document.getElementById("color-legend-panel").classList.contains("open"));
});
document.getElementById("quick-toggle-legend-btn")?.addEventListener("click", () => {
  setLegendOpen(!document.getElementById("color-legend-panel").classList.contains("open"));
});
document.getElementById("color-legend-close")?.addEventListener("click", () => setLegendOpen(false));
document.getElementById("quick-view-collapse-btn")?.addEventListener("click", () => setQuickViewCollapsed(true));
document.getElementById("quick-view-reopen-btn")?.addEventListener("click", () => setQuickViewCollapsed(false));
document.getElementById("toggle-galactic-btn").addEventListener("click", (e) => {
  state.showGalacticBand = !state.showGalacticBand;
  overlays.galacticGroup.visible = state.showGalacticBand;
  e.currentTarget.classList.toggle("active", state.showGalacticBand);
});
document.getElementById("toggle-labels-btn").addEventListener("click", () => {
  setLabelsVisible(!state.showLabels);
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
for (const [btnId, layerKey] of [
  ["toggle-adam-transfers-btn", "transfers"],
  ["toggle-adam-impactors-btn", "impactors"],
  ["toggle-adam-corridors-btn", "corridors"],
  ["toggle-adam-precovery-btn", "precovery"]
]) {
  document.getElementById(btnId)?.classList.toggle("active", Boolean(adamOverlay.layerState[layerKey]));
}
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

export function dismissLockedOn() {
  stopAutoTour();
  flyTween = null;
  const prevLockedId = state.lockedObj?.id || null;
  state.lockedObj = null;
  state.cameraFollowObj = null;
  controls.minDistance = 0.0001;
  constellationMgr.clearFocusedSatellite();
  if (state.isFocusedOnSelected || (prevLockedId && state.selectedObj?.id === prevLockedId)) {
    state.selectedObj = null;
    state.isFocusedOnSelected = false;
    setInspectorCollapsed(true);
  }
  updateTrackingBarUI();
  updateInspectorUI();
  highlightSelectedInLists();
  updateVisibilityAndOrbits();
  syncURLState();
}

export function resetViewToDefault() {
  stopAutoTour();
  closeAllMenus();
  if (boxZoom?.getMode?.() !== "off") {
    boxZoom.setMode("off");
  }
  if (appReady) boxZoom?.pushSnapshot?.();
  constellationMgr.clearFocusedSatellite();
  state.selectedObj = null;
  state.isFocusedOnSelected = false;
  state.lockedObj = null;
  state.cameraFollowObj = null;
  controls.minDistance = 0.0001;
  setInspectorCollapsed(true);
  startCameraTween(_tmpVec.set(0, 0, 0), DEFAULT_CAMERA_POS, 0.85, {
    followLockedCenter: false,
    trackLockedDelta: false
  });
  updateTrackingBarUI();
  updateInspectorUI();
  highlightSelectedInLists();
  updateVisibilityAndOrbits();
  syncURLState();
}

document.getElementById("btn-reset-view")?.addEventListener("click", resetViewToDefault);
document.getElementById("auto-tour-btn").addEventListener("click", toggleAutoTour);
document.getElementById("btn-zoom-to-focus")?.addEventListener("click", () => {
  if (state.selectedObj) {
    stopAutoTour();
    selectAndFlyTo(state.selectedObj, "auto");
  }
});
document.getElementById("btn-zoom-surface").addEventListener("click", () => {
  if (state.selectedObj) selectAndFlyTo(state.selectedObj, "surface");
});
document.getElementById("btn-frame-orbit").addEventListener("click", () => {
  if (state.selectedObj) selectAndFlyTo(state.selectedObj, "orbit");
});
document.getElementById("insp-collapse-btn").addEventListener("click", () => setInspectorCollapsed(true));
document.getElementById("inspector-reopen-btn").addEventListener("click", () => setInspectorCollapsed(false));
document.getElementById("insp-copy-link-btn").addEventListener("click", async (e) => {
  const btn = e.currentTarget;
  syncURLState();
  try {
    await navigator.clipboard.writeText(window.location.href);
    btn.textContent = tr(state.lang, "copiedDeepLink");
    setTimeout(() => { btn.textContent = tr(state.lang, "copyDeepLink"); }, 1600);
  } catch (_) { }
});
document.getElementById("release-lock-btn").addEventListener("click", dismissLockedOn);
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
    el.style.borderColor = active ? "rgba(255,255,255,0.45)" : "rgba(255,255,255,0.14)";
    el.style.background = active ? "rgba(255,255,255,0.15)" : "rgba(24,24,28,0.88)";
    el.style.color = active ? "#ffffff" : "#d4d4d8";
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

if (urlParams.get("sats") === "0") {
  constellationMgr.setEnabled(false);
  document.getElementById("toggle-sats-btn")?.classList.remove("active");
}

window.addEventListener("resize", () => {
  measureLegendBox();
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  applyInspectorViewOffset();
  renderer.setSize(window.innerWidth, window.innerHeight);
  labelRenderer.setSize(window.innerWidth, window.innerHeight);
  hoverMaskTarget.setSize(
    Math.max(1, Math.floor(window.innerWidth * HOVER_MASK_SCALE)),
    Math.max(1, Math.floor(window.innerHeight * HOVER_MASK_SCALE))
  );
  hoverContourUniforms.uResolution.value.set(window.innerWidth, window.innerHeight);
});

// ==================== INITIALIZATION & URL ROUTING ====================
function extractHashFocusSlug() {
  const rawHash = (window.location.hash || "").replace(/^#+/, "").trim();
  if (!rawHash || rawHash === "/" || rawHash === "/home") return null;
  const parts = rawHash.split("/").filter(Boolean);
  return parts.length > 0 ? decodeURIComponent(parts[parts.length - 1]) : null;
}

// Bring the controls in line with the start-up state (defaults, or the URL overrides above).
setInspectorCollapsed(state.inspectorCollapsed);
setLabelsVisible(state.showLabels);
document.getElementById("orbit-mode-select").value = state.orbitMode;
const quickOrbSel = document.getElementById("quick-orbit-select");
if (quickOrbSel) quickOrbSel.value = state.orbitMode;
document.getElementById("toggle-rings-btn").classList.toggle("active", state.showRings);
document.getElementById("toggle-discoveries-btn").classList.toggle("active", state.showDiscoveries);
document.getElementById("quick-toggle-discoveries-btn")?.classList.toggle("active", state.showDiscoveries);

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
  if (!orbitsParamGiven && state.orbitMode === "off") {
    state.orbitMode = "selected";
    document.getElementById("orbit-mode-select").value = state.orbitMode;
    if (quickOrbSel) quickOrbSel.value = state.orbitMode;
  }
  // A survey candidate has no imaged surface, so a link to one opens on its orbit (Sun-centred,
  // the whole ellipse in frame) and leaves the close-up to "Zoom to 3D Surface".
  if (targetObj) {
    selectAndFlyTo(targetObj, urlParams.get("mode") || (targetObj.is_new_discovery && !targetObj.parent_id ? "orbit" : "auto"));
  } else {
    // Not in the Solar System catalogue: it may be a black hole or cluster of the galactic
    // catalogue, which is still loading. Start on the Sun and resolve it again on arrival.
    pendingDeepLinkFocus = focusParam.startsWith("NORAD_") ? null : focusParam;
    state.selectedObj = null;
    state.isFocusedOnSelected = false;
    state.lockedObj = null;
    state.cameraFollowObj = null;
    camera.position.copy(DEFAULT_CAMERA_POS);
    controls.target.set(0, 0, 0);
    setInspectorCollapsed(!pendingDeepLinkFocus);
  }
} else if (state.activeCategory === "oort_cloud") {
  flyToScenePreset("oort");
} else {
  // Bare start: no focus= in URL, so no object is locked on and the inspector stays folded.
  state.selectedObj = null;
  state.isFocusedOnSelected = false;
  state.lockedObj = null;
  state.cameraFollowObj = null;
  setInspectorCollapsed(true);
  camera.position.copy(DEFAULT_CAMERA_POS);
  controls.target.set(0, 0, 0);
}

window.addEventListener("hashchange", () => {
  const slug = extractHashFocusSlug();
  if (slug) {
    const targetObj = resolveObjectByQuery(catalog, slug);
    if (targetObj) selectAndFlyTo(targetObj, "surface");
  }
});

const _bzProj = new THREE.Vector3();
const _bzFwd = new THREE.Vector3();
const _bzViewDir = new THREE.Vector3();
const _bzHit = new THREE.Vector3();
const _bzDelta = new THREE.Vector3();
const _bzTarget = new THREE.Vector3();

function findVisibleBodyInBox(rect, lockedRt) {
  _bzFwd.set(0, 0, -1).applyQuaternion(camera.quaternion).normalize();
  const tanHalfFov = Math.tan(THREE.MathUtils.degToRad((camera.fov || 45) * 0.5));
  const prominentHits = [];
  const minorHits = [];
  let bestSun = null;

  const boxLeft = rect.paddedLeft ?? rect.left;
  const boxTop = rect.paddedTop ?? rect.top;
  const boxW = Math.max(12.0, rect.paddedWidth ?? rect.width ?? rect.side);
  const boxH = Math.max(12.0, rect.paddedHeight ?? rect.height ?? rect.side);
  const boxSpan = Math.max(boxW, boxH);

  for (const rt of runtimeList) {
    if (!rt.node?.visible || !rt.worldPos) continue;
    const obj = rt.obj;
    if (!obj?.is_galactic && state.galacticFactor > 0.7 && obj?.category !== "star") continue;
    if (obj?.is_galactic && state.galacticFactor < 0.15) continue;
    if (obj?.parent_id && state.activeCategory !== "spacecraft" && state.activeCategory !== "moons_l2") {
      const pRt = runtimeMap.get(obj.parent_id);
      if (pRt && camera.position.distanceTo(pRt.worldPos) > pRt.node.userData.meshRadius * 38.0) continue;
    }

    _bzDelta.copy(rt.worldPos).sub(camera.position);
    const depth = _bzDelta.dot(_bzFwd);
    if (depth <= 1e-6) continue;

    _bzProj.copy(rt.worldPos).project(camera);
    if (!Number.isFinite(_bzProj.x) || !Number.isFinite(_bzProj.y) || _bzProj.z < -1.0 || _bzProj.z > 1.0) continue;

    const sx = (_bzProj.x * 0.5 + 0.5) * rect.viewW;
    const sy = (-_bzProj.y * 0.5 + 0.5) * rect.viewH;
    const bodyR = Math.max(1e-4, rt.node.userData?.meshRadius || 0.02);
    const camDist = Math.max(1e-5, camera.position.distanceTo(rt.worldPos));
    const pxRadius = (bodyR / Math.max(1e-6, camDist * tanHalfFov)) * (rect.viewH * 0.5);

    if (pxRadius >= boxSpan * 0.58 && (rt === lockedRt || camDist < bodyR * 12.0)) continue;

    const isSpacecraft =
      obj?.category === "spacecraft" ||
      Boolean(obj?.visual_type?.startsWith("spacecraft")) ||
      Boolean(obj?.is_constellation_sat) ||
      Boolean(rt.node.userData?.isSpacecraft);
    if (isSpacecraft && boxSpan > 90 && camDist > bodyR * 120.0 && state.activeCategory !== "spacecraft") {
      continue;
    }

    const pad = Math.min(boxSpan * 0.22, Math.max(8.0, pxRadius));
    if (
      sx < boxLeft - pad ||
      sx > boxLeft + boxW + pad ||
      sy < boxTop - pad ||
      sy > boxTop + boxH + pad
    ) {
      continue;
    }

    const normDistSq =
      ((sx - rect.cx) / boxW) ** 2 +
      ((sy - rect.cy) / boxH) ** 2;
    const score = normDistSq + Math.log10(Math.max(1.0, camDist)) * 0.03;
    const cand = { rt, bodyR, camDist, score };

    const cat = obj?.category;
    const isProminent =
      !isSpacecraft &&
      (cat === "planets" ||
        cat === "planet" ||
        cat === "dwarfs" ||
        cat === "dwarf" ||
        cat === "dwarf_planets" ||
        cat === "star" ||
        Boolean(obj?.is_black_hole) ||
        Boolean(obj?.is_new_discovery) ||
        Boolean(obj?.is_signature_highlight));

    if (isProminent) {
      prominentHits.push(cand);
      if (obj?.id === "SUN" && (!bestSun || score < bestSun.score)) bestSun = cand;
    } else {
      minorHits.push(cand);
    }
  }

  if (boxSpan > 110 && prominentHits.length >= 2) return null;

  prominentHits.sort((a, b) => a.score - b.score);
  const nonSunProminent = prominentHits.find((c) => c.rt.obj?.id !== "SUN");
  if (nonSunProminent) return nonSunProminent;

  if (minorHits.length > 0) {
    minorHits.sort((a, b) => a.score - b.score);
    return minorHits[0];
  }
  return bestSun;
}

const boxZoom = createBoxZoomController({
  canvas,
  camera,
  controls,
  inBtn: document.getElementById("btn-box-zoom-in"),
  outBtn: document.getElementById("btn-box-zoom-out"),
  undoBtn: document.getElementById("btn-zoom-back"),
  hintEl: document.getElementById("box-zoom-hint"),
  overlayEl: document.getElementById("box-zoom-overlay"),
  rectEl: document.getElementById("box-zoom-rect"),
  padEl: document.getElementById("box-zoom-pad"),
  tagEl: document.getElementById("box-zoom-tag"),
  getLabel: (key, fallback, vars) => {
    const raw = tr(state.lang, key) || fallback || "";
    return raw.replace(/\{(\w+)\}/g, (_, k) => String(vars?.[k] ?? ""));
  },
  isBlocked: () => !appReady,
  beforeStart: () => {
    stopAutoTour();
  },
  getSnapshotMeta: () => ({
    lockedObj: state.lockedObj || null,
    cameraFollowObj: state.cameraFollowObj || null,
    selectedObj: state.selectedObj || null,
    isFocusedOnSelected: state.isFocusedOnSelected,
    inspectorCollapsed: state.inspectorCollapsed
  }),
  resolveZoomMove: ({ mode, f, rayOrigin, rayDir, rect, dOld, currentTarget, currentCamPos }) => {
    _bzViewDir.copy(currentCamPos).sub(currentTarget);
    if (_bzViewDir.lengthSq() < 1e-14) _bzViewDir.copy(rayDir).negate();
    _bzViewDir.normalize();

    // Zoom Out ("out") uses a divergence-point radial circle and gives ONLY the zoom-out ratio f > 1.
    if (mode === "out") {
      const dNew = Math.max(0.0001, Math.min(1e9, dOld * f));
      return {
        target: currentTarget.clone(),
        camPos: currentTarget.clone().addScaledVector(_bzViewDir, dNew),
        minDist: Math.max(0.0001, Math.min(controls.minDistance || 0.0001, dNew * 0.5)),
        lockObj: state.lockedObj,
        lockChanged: false,
        followLockedCenter: false,
        trackLockedDelta: Boolean(state.lockedObj),
        durationSec: 0.48
      };
    }

    // Zoom In ("in"): frame the selected region along the box center ray without auto-selecting any object.
    const lockedRt = state.lockedObj ? runtimeMap.get(state.lockedObj.id) : null;
    _bzFwd.copy(currentTarget).sub(rayOrigin);
    if (_bzFwd.lengthSq() > 1e-12) _bzFwd.normalize();
    else _bzFwd.set(0, 0, -1);

    const hitBody = findVisibleBodyInBox(rect, lockedRt);
    if (hitBody) {
      const { rt, bodyR, camDist } = hitBody;
      const safeMin = Math.max(0.0001, bodyR * 1.25);
      const tBody = Math.max(safeMin, _bzDelta.copy(rt.worldPos).sub(rayOrigin).dot(rayDir));
      _bzHit.copy(rayOrigin).addScaledVector(rayDir, tBody);
      const dNew = Math.max(safeMin, Math.min(dOld * f, camDist * f));
      const newCam = _bzHit.clone().addScaledVector(rayDir, -dNew);
      if (_bzHit.distanceTo(rt.worldPos) < bodyR * 1.18 || newCam.distanceTo(rt.worldPos) < bodyR * 1.18) {
        _bzDelta.copy(newCam).sub(rt.worldPos);
        if (_bzDelta.lengthSq() < 1e-12) _bzDelta.copy(_bzViewDir);
        _bzDelta.normalize();
        if (newCam.distanceTo(rt.worldPos) < bodyR * 1.18) {
          newCam.copy(rt.worldPos).addScaledVector(_bzDelta, bodyR * 1.18);
        }
      }
      let nextLockObj = state.lockedObj;
      if (nextLockObj?.id === "SUN" && _bzHit.lengthSq() > 1e-4) nextLockObj = null;
      return {
        target: _bzHit.clone(),
        camPos: newCam,
        minDist: Math.max(0.0001, Math.min(controls.minDistance || 0.0001, dNew * 0.5)),
        lockObj: nextLockObj,
        lockChanged: state.lockedObj?.id !== nextLockObj?.id,
        followLockedCenter: false,
        trackLockedDelta: Boolean(nextLockObj),
        durationSec: 0.54
      };
    }

    if (Math.abs(rayDir.y) > 0.06) {
      const tEcl = -rayOrigin.y / rayDir.y;
      if (tEcl > 1e-3 && tEcl <= dOld * 3.2) {
        _bzHit.copy(rayOrigin).addScaledVector(rayDir, tEcl);
        if (_bzHit.distanceTo(currentTarget) <= dOld * 2.5) {
          const dNew = Math.max(0.0001, tEcl * f);
          let nextLockObj = state.lockedObj;
          if (nextLockObj?.id === "SUN" && _bzHit.lengthSq() > 1e-4) nextLockObj = null;
          const newCam = _bzHit.clone().addScaledVector(rayDir, -dNew);
          if (nextLockObj && nextLockObj.id !== "SUN") {
            const lRt = runtimeMap.get(nextLockObj.id);
            const lR = lRt?.node?.userData?.meshRadius || 0;
            if (lR > 0 && newCam.distanceTo(lRt.worldPos) < lR * 1.18) {
              _bzDelta.copy(newCam).sub(lRt.worldPos);
              if (_bzDelta.lengthSq() < 1e-12) _bzDelta.set(0, 0.3, 1);
              _bzDelta.normalize();
              newCam.copy(lRt.worldPos).addScaledVector(_bzDelta, lR * 1.18);
            }
          }
          return {
            target: _bzHit.clone(),
            camPos: newCam,
            minDist: Math.max(0.0001, Math.min(controls.minDistance || 0.0001, dNew * 0.5)),
            lockObj: nextLockObj,
            lockChanged: state.lockedObj?.id !== nextLockObj?.id,
            followLockedCenter: false,
            trackLockedDelta: Boolean(nextLockObj),
            durationSec: 0.52
          };
        }
      }
    }

    const denom = rayDir.dot(_bzFwd);
    const tFocal = denom > 1e-3 ? dOld / denom : dOld;
    _bzHit.copy(rayOrigin).addScaledVector(rayDir, tFocal);
    const dNew = Math.max(0.0001, Math.min(1e9, dOld * f));
    const newCam = _bzHit.clone().addScaledVector(_bzViewDir, dNew);
    let nextLockObj = state.lockedObj;
    if (nextLockObj?.id === "SUN" && _bzHit.distanceTo(currentTarget) > 1e-4) nextLockObj = null;
    if (nextLockObj && nextLockObj.id !== "SUN") {
      const lRt = runtimeMap.get(nextLockObj.id);
      const lR = lRt?.node?.userData?.meshRadius || 0;
      if (lR > 0 && newCam.distanceTo(lRt.worldPos) < lR * 1.18) {
        _bzDelta.copy(newCam).sub(lRt.worldPos);
        if (_bzDelta.lengthSq() < 1e-12) _bzDelta.set(0, 0.3, 1);
        _bzDelta.normalize();
        newCam.copy(lRt.worldPos).addScaledVector(_bzDelta, lR * 1.18);
      }
    }
    return {
      target: _bzHit.clone(),
      camPos: newCam,
      minDist: Math.max(0.0001, Math.min(controls.minDistance || 0.0001, dNew * 0.5)),
      lockObj: nextLockObj,
      lockChanged: state.lockedObj?.id !== nextLockObj?.id,
      followLockedCenter: false,
      trackLockedDelta: Boolean(nextLockObj),
      durationSec: 0.52
    };
  },
  applyCameraMove: (move) => {
    constellationMgr.clearFocusedSatellite();
    if ("lockObj" in move) {
      state.lockedObj = move.lockObj;
      state.cameraFollowObj = move.lockObj;
    }
    if (move.minDist !== undefined) {
      controls.minDistance = move.followLockedCenter
        ? move.minDist
        : Math.min(controls.minDistance || 0.0001, move.minDist);
    }
    startCameraTween(move.target, move.camPos, move.durationSec || 0.52, {
      followLockedCenter: Boolean(move.followLockedCenter),
      trackLockedDelta: Boolean(move.trackLockedDelta)
    });
    if (move.lockChanged) {
      updateTrackingBarUI();
      updateVisibilityAndOrbits();
      syncURLState();
    }
  },
  restoreSnapshot: (snap) => {
    constellationMgr.clearFocusedSatellite();
    const prevLock = snap.meta?.lockedObj !== undefined
      ? snap.meta.lockedObj
      : (snap.meta?.lockedId ? (catalog.byId.get(snap.meta.lockedId) || null) : null);
    const prevFollow = snap.meta?.cameraFollowObj !== undefined ? snap.meta.cameraFollowObj : prevLock;
    const prevSel = snap.meta?.selectedObj !== undefined
      ? snap.meta.selectedObj
      : (snap.meta?.selectedId ? (catalog.byId.get(snap.meta.selectedId) || null) : null);
    state.lockedObj = prevLock;
    state.cameraFollowObj = prevFollow;
    state.selectedObj = prevSel;
    if (snap.meta?.isFocusedOnSelected !== undefined) {
      state.isFocusedOnSelected = Boolean(snap.meta.isFocusedOnSelected);
    }
    if (snap.meta?.inspectorCollapsed !== undefined) {
      setInspectorCollapsed(Boolean(snap.meta.inspectorCollapsed));
    }
    controls.minDistance = snap.minDist ?? 0.0001;
    startCameraTween(snap.target, snap.camPos, 0.45, {
      followLockedCenter: false,
      trackLockedDelta: Boolean(prevFollow)
    });
    updateTrackingBarUI();
    updateInspectorUI();
    highlightSelectedInLists();
    updateVisibilityAndOrbits();
    syncURLState();
  }
});

updateVisibilityAndOrbits();
updateTrackingBarUI();
updateInspectorUI();
highlightSelectedInLists();
measureLegendBox();
appReady = true;

// ==================== MAIN 60-FPS RENDER LOOP ====================
let lastHudUpdateMs = 0;
const epochEl = document.getElementById("epoch-readout");
const camRangeEl = document.getElementById("cam-range-val");

// One governor step per frame (see the quality notes at the renderer set-up).
function updateQualityGovernor(frameMs) {
  quality.emaMs = 0.65 * quality.emaMs + 0.35 * Math.min(frameMs, 6000.0);
  if (frameMs > 2500.0) {
    quality.level = QUALITY_STEPS.length - 1;
    quality.slowFrames = 0;
  } else if (quality.emaMs > (quality.level >= 2 ? 400.0 : 48.0)) {
    if (++quality.slowFrames >= 2 && quality.level < QUALITY_STEPS.length - 1) {
      quality.level++;
      quality.slowFrames = 0;
      quality.emaMs *= 0.65;
    }
  } else {
    quality.slowFrames = 0;
  }
  if (quality.emaMs < 24.0) {
    if (++quality.fastFrames > 180 && quality.level > 0) {
      quality.level--;
      quality.fastFrames = 0;
    }
  } else {
    quality.fastFrames = 0;
  }
  const wantRatio = BASE_PIXEL_RATIO * QUALITY_PIXEL_SCALE[quality.level];
  const maxSteps = state.galacticFactor < 0.35 ? Math.min(10, QUALITY_STEPS[quality.level]) : QUALITY_STEPS[quality.level];
  galaxyLayer.setRaymarchSteps(maxSteps);
  if (Math.abs(wantRatio - quality.pixelRatio) > 1e-3) {
    quality.pixelRatio = wantRatio;
    renderer.setPixelRatio(wantRatio);
  }
}

function animate(nowMs) {
  requestAnimationFrame(animate);
  const frameMs = nowMs - lastFrameTime;
  const dtSec = Math.min(0.1, Math.max(0.0, frameMs * 0.001));
  lastFrameTime = nowMs;

  updateSimulationPositions(dtSec);
  controls.update();
  updateQualityGovernor(frameMs);

  if (nowMs - lastHudUpdateMs > 100) {
    epochEl.textContent = jdToUTCString(state.simJD);
    // Sun-centred view in the log scale: the read-out is the heliocentric radius at the side edge
    // of the window (the camera's own log-scale distance is not a physical length). Otherwise it
    // is the distance from the camera to its target.
    const camDist = camera.position.distanceTo(controls.target);
    const sunCentred = state.logBlend > 0.5 && controls.target.lengthSq() < 0.25 && camDist > 1.0 && camDist < 320.0;
    camRangeEl.textContent = sceneDistToDisplayString(
      sunCentred ? camDist * HALF_FOV_TAN * Math.max(1.0, camera.aspect) : camDist,
      state.logBlend
    );
    lastHudUpdateMs = nowMs;
  }

  renderer.render(scene, camera);
  renderHoverContourPass();
  if (state.showLabels) {
    labelRenderer.render(scene, camera);
  }
}

// Debug handles for the console and for the verification script.
window.__BELTS__ = beltNodes;
window.__EYES3D__ = {
  camera,
  controls,
  runtimeMap,
  state,
  galaxyLayer,
  adamOverlay,
  overlays,
  batchedOrbits,
  nbodyEngine,
  quality,
  updateBeltClock: updateBeltDynamics,
  setDiscoveriesVisible,
  setLabelsVisible,
  selectObjectOnly,
  handleObjectPrimaryClick,
  selectAndFlyTo,
  flyToScenePreset,
  updateEarthConfig,
  updateSimulationPositions,
  updateInspectorUI,
  boxZoom,
  isTweening: () => Boolean(flyTween)
};

requestAnimationFrame(animate);
