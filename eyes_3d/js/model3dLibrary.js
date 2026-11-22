// Shared High-Precision 3D Model (.glb) Loader & Planetary Ring/Atmosphere Shader Engine
// Powers both Eyes on the Solar System 2.0 (index.html) and the 3D Model Inspection Studio (studio.html).

import * as THREE from "../vendor/three.module.js";
import { GLTFLoader } from "../vendor/GLTFLoader.js";
import { DRACOLoader } from "../vendor/DRACOLoader.js";
import { MeshoptDecoder } from "../vendor/meshopt_decoder.module.js?v=20261122_v13";

export const ASSET_VERSION = "20261122_v13";

const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath(new URL("../vendor/draco/", import.meta.url).href);

const gltfLoader = new GLTFLoader();
gltfLoader.setDRACOLoader(dracoLoader);
gltfLoader.setMeshoptDecoder(MeshoptDecoder);
const textureLoader = new THREE.TextureLoader();

// LRU cache for decoded GLB templates to cap RAM/VRAM across 100+ heavy spacecraft & planets
const MAX_CACHED_GLBS = 20;
const glbCache = new Map(); // key -> { promise, scene, modelId, lastUsed, refs }
const auxTextureCache = new Map();

export function disposeObject3D(root, disposeTextures = true) {
  if (!root) return;
  root.traverse((node) => {
    if (node.geometry) node.geometry.dispose();
    const mats = Array.isArray(node.material) ? node.material : (node.material ? [node.material] : []);
    for (const mat of mats) {
      if (!mat) continue;
      if (disposeTextures) {
        for (const k of ["map", "normalMap", "roughnessMap", "metalnessMap", "emissiveMap", "alphaMap", "aoMap", "bumpMap"]) {
          if (mat[k] && typeof mat[k].dispose === "function" && !isAuxCachedTexture(mat[k])) {
            mat[k].dispose();
          }
        }
      }
      if (typeof mat.dispose === "function") mat.dispose();
    }
  });
}

function isAuxCachedTexture(tex) {
  for (const cached of auxTextureCache.values()) {
    if (cached === tex) return true;
  }
  return false;
}

export function touchModelCache(modelId, basePrefix = "assets/models") {
  const key = `${basePrefix}/${modelId}.glb?v=${ASSET_VERSION}`;
  const entry = glbCache.get(key);
  if (entry) entry.lastUsed = performance.now();
}

export function evictLRUModels(pinnedModelIds = null) {
  if (glbCache.size <= MAX_CACHED_GLBS) return 0;
  const pinned = pinnedModelIds instanceof Set ? pinnedModelIds : new Set(pinnedModelIds || []);
  const candidates = [];
  for (const [key, entry] of glbCache.entries()) {
    if (entry.scene && entry.refs <= 0 && !pinned.has(entry.modelId)) {
      candidates.push([key, entry]);
    }
  }
  candidates.sort((a, b) => a[1].lastUsed - b[1].lastUsed);
  let evicted = 0;
  while (glbCache.size > MAX_CACHED_GLBS && candidates.length > 0) {
    const [key, entry] = candidates.shift();
    disposeObject3D(entry.scene, true);
    glbCache.delete(key);
    evicted++;
  }
  return evicted;
}

export function getModelCacheStats() {
  return { cached: glbCache.size, maxCached: MAX_CACHED_GLBS, activeLoads, queued: pendingLoadQueue.length };
}

// Exact physical inner/outer ring radii in units of equatorial body radius (matching scripts/build_3d_solar_models.py)
export const RING_SYSTEM_PARAMS = {
  saturn: { rInner: 66900.0 / 60268.0, rOuter: 140478.92 / 60268.0, ry: 54364.0 / 60268.0, ringPng: "assets/rings/saturn_rings.png", shadowStrength: 0.84 },
  uranus: { rInner: 26840.0 / 25559.0, rOuter: 103000.0 / 25559.0, ry: 24973.0 / 25559.0, ringPng: "assets/rings/uranus_rings.png", shadowStrength: 0.45 },
  neptune: { rInner: 40900.0 / 24764.0, rOuter: 62964.0 / 24764.0, ry: 24341.0 / 24764.0, ringPng: "assets/rings/neptune_rings.png", shadowStrength: 0.35 },
  jupiter: { rInner: 92000.0 / 71492.0, rOuter: 226000.0 / 71492.0, ry: 66854.0 / 71492.0, ringPng: "assets/rings/jupiter_rings.png", shadowStrength: 0.18 },
  haumea: { rInner: 2120.0 / 1161.0, rOuter: 2450.0 / 1161.0, ry: 569.0 / 1161.0, ringPng: "assets/rings/haumea_rings.png", shadowStrength: 0.42 },
  quaoar: { rInner: 2350.0 / 543.0, rOuter: 4250.0 / 543.0, ry: 0.92, ringPng: "assets/rings/quaoar_rings.png", shadowStrength: 0.35 },
  chariklo: { rInner: 372.0 / 151.0, rOuter: 422.0 / 151.0, ry: 208.0 / 302.0, ringPng: "assets/rings/chariklo_rings.png", shadowStrength: 0.45 },
  chiron: { rInner: 285.0 / 108.0, rOuter: 365.0 / 108.0, ry: 0.86, ringPng: "assets/rings/chiron_rings.png", shadowStrength: 0.35 }
};

// Physical Rayleigh/Mie atmospheric limb parameters (matching NASA Eyes AtmosphereComponent)
export const ATMOSPHERE_PARAMS = {
  venus: { color: [0.96, 0.84, 0.58], sunset: [0.95, 0.52, 0.18], ry: 1.0, scale: 1.032, intensity: 0.62, power: 3.4 },
  earth: { color: [0.28, 0.62, 1.00], sunset: [1.00, 0.45, 0.15], ry: 0.9966, scale: 1.028, intensity: 0.78, power: 3.8 },
  mars: { color: [0.90, 0.56, 0.36], sunset: [0.72, 0.58, 0.68], ry: 0.9941, scale: 1.022, intensity: 0.36, power: 4.2 },
  jupiter: { color: [0.88, 0.76, 0.58], sunset: [0.85, 0.55, 0.32], ry: 66854.0 / 71492.0, scale: 1.022, intensity: 0.34, power: 4.5 },
  saturn: { color: [0.92, 0.80, 0.59], sunset: [0.86, 0.62, 0.35], ry: 54364.0 / 60268.0, scale: 1.024, intensity: 0.38, power: 4.3 },
  titan: { color: [0.98, 0.64, 0.22], sunset: [0.38, 0.68, 1.00], ry: 1.0, scale: 1.055, intensity: 0.85, power: 2.8 },
  uranus: { color: [0.58, 0.86, 0.94], sunset: [0.64, 0.66, 0.40], ry: 24973.0 / 25559.0, scale: 1.026, intensity: 0.44, power: 4.0 },
  neptune: { color: [0.38, 0.58, 1.00], sunset: [0.52, 0.72, 1.00], ry: 24341.0 / 24764.0, scale: 1.026, intensity: 0.52, power: 3.9 },
  pluto: { color: [0.45, 0.78, 1.00], sunset: [0.35, 0.65, 0.98], ry: 1.0, scale: 1.036, intensity: 0.42, power: 3.2 }
};

// ---------------------------------------------------------------------------------------------
// Procedural studio reflection environment (zero network): a miniature light-box scene with soft
// key / fill / rim panels, an overhead strip and a faint galactic horizon band, prefiltered with
// THREE.PMREMGenerator so glossy curved surfaces pick up smooth continuous highlights.
// ---------------------------------------------------------------------------------------------
const studioEnvCache = new WeakMap(); // renderer -> PMREM texture

export function createStudioLightBoxScene() {
  const envScene = new THREE.Scene();
  const disposables = [];
  const track = (obj) => { disposables.push(obj); return obj; };

  // Backdrop: deep-space gradient with a subtle warm/cool horizon band
  const domeGeom = track(new THREE.SphereGeometry(50, 48, 24));
  const pos = domeGeom.attributes.position;
  const col = new Float32Array(pos.count * 3);
  const v = new THREE.Vector3();
  for (let i = 0; i < pos.count; i++) {
    v.fromBufferAttribute(pos, i).normalize();
    const band = Math.exp(-Math.pow(v.y / 0.16, 2.0));
    const sky = Math.max(0.0, v.y);
    const ground = Math.max(0.0, -v.y);
    const warm = 0.5 + 0.5 * v.x;
    col[i * 3] = 0.020 + 0.050 * sky + band * (0.060 + 0.050 * warm) + 0.012 * ground;
    col[i * 3 + 1] = 0.026 + 0.062 * sky + band * (0.066 + 0.020 * warm) + 0.013 * ground;
    col[i * 3 + 2] = 0.040 + 0.090 * sky + band * (0.105 - 0.030 * warm) + 0.018 * ground;
  }
  domeGeom.setAttribute("color", new THREE.BufferAttribute(col, 3));
  const domeMat = track(new THREE.MeshBasicMaterial({ vertexColors: true, side: THREE.BackSide, depthWrite: false }));
  envScene.add(new THREE.Mesh(domeGeom, domeMat));

  // Emissive soft boxes (HDR radiance > 1 so they survive prefiltering as crisp highlights)
  const addPanel = (w, h, radiance, rgb, position, lookAt = [0, 0, 0]) => {
    const g = track(new THREE.PlaneGeometry(w, h));
    const m = track(new THREE.MeshBasicMaterial({ side: THREE.DoubleSide }));
    m.color.setRGB(rgb[0] * radiance, rgb[1] * radiance, rgb[2] * radiance);
    const mesh = new THREE.Mesh(g, m);
    mesh.position.set(position[0], position[1], position[2]);
    mesh.lookAt(lookAt[0], lookAt[1], lookAt[2]);
    envScene.add(mesh);
  };
  addPanel(26, 13, 9.0, [1.00, 0.97, 0.92], [22, 20, 18]);        // key soft box (front-right, high)
  addPanel(30, 7, 5.5, [1.00, 0.99, 0.97], [0, 33, 2]);           // overhead strip (long hood / deck sweep)
  addPanel(18, 16, 2.6, [0.80, 0.88, 1.00], [-30, 9, 10]);        // cool fill (front-left)
  addPanel(6, 22, 6.0, [0.72, 0.84, 1.00], [-20, 12, -27]);       // rim strip (rear-left)
  addPanel(5, 18, 4.5, [1.00, 0.90, 0.80], [27, 8, -22]);         // warm kicker (rear-right)
  addPanel(40, 3, 1.6, [0.85, 0.90, 1.00], [0, -16, 30]);         // low front bounce
  return { scene: envScene, dispose: () => disposables.forEach((d) => d.dispose()) };
}

export function getStudioEnvironmentTexture(renderer) {
  if (!renderer) return null;
  let tex = studioEnvCache.get(renderer);
  if (tex) return tex;
  const pmrem = new THREE.PMREMGenerator(renderer);
  const box = createStudioLightBoxScene();
  tex = pmrem.fromScene(box.scene, 0.035, 0.1, 200).texture;
  tex.name = "procedural_studio_lightbox_pmrem";
  box.dispose();
  pmrem.dispose();
  studioEnvCache.set(renderer, tex);
  return tex;
}

// Automotive-grade PBR for the Tesla Roadster / Starman assembly, keyed by glTF material name.
// These materials keep their authored colours and gloss (they bypass the generic spacecraft
// clamp below) and carry their own reflection strength.
const ROADSTER_MODEL_ID = "sc_starman_roadster";
const ROADSTER_PBR = {
  cherry_red_paint: { metalness: 0.38, roughness: 0.15, clearcoat: 1.0, clearcoatRoughness: 0.04, env: 1.18 },
  brake_caliper_red: { metalness: 0.32, roughness: 0.20, clearcoat: 0.88, clearcoatRoughness: 0.08, env: 0.92 },
  taillight_red: { clearcoat: 0.92, clearcoatRoughness: 0.05, env: 0.95 },
  headlights: { env: 0.95 },
  starman_visor: { metalness: 0.85, roughness: 0.05, clearcoat: 1.0, clearcoatRoughness: 0.02, env: 1.40 },
  windshield_glass: { clearcoat: 1.0, clearcoatRoughness: 0.025, env: 1.30, glass: true },
  headlight_lens: { clearcoat: 1.0, clearcoatRoughness: 0.025, env: 1.30, glass: true },
  chrome_trim: { metalness: 0.92, roughness: 0.10, env: 1.30 },
  silver_alloy: { metalness: 0.76, roughness: 0.22, clearcoat: 0.50, clearcoatRoughness: 0.14, env: 1.05 },
  carbon_trim: { metalness: 0.24, roughness: 0.34, clearcoat: 0.42, clearcoatRoughness: 0.20, env: 0.72 },
  mvac_niobium_bell: { metalness: 0.78, roughness: 0.24, env: 0.98 },
  mvac_regen_steel: { metalness: 0.84, roughness: 0.20, env: 1.08 },
  stage_aluminum: { metalness: 0.76, roughness: 0.24, env: 0.95 },
  fh_stage_white: { metalness: 0.10, roughness: 0.28, clearcoat: 0.30, clearcoatRoughness: 0.22, env: 0.62 },
  starman_white_suit: { metalness: 0.05, roughness: 0.40, env: 0.48 },
  tire_rubber: { metalness: 0.04, roughness: 0.82, env: 0.26 },
  matte_black: { metalness: 0.10, roughness: 0.54, env: 0.32 }
};
const ROADSTER_DEFAULT_ENV = 0.6;
const ROADSTER_NO_SCENE_ENV_GAIN = 0.62; // deep-space explorer: keep reflections subtler than in the studio

function buildRoadsterMaterial(srcMat) {
  const cfg = ROADSTER_PBR[(srcMat.name || "").toLowerCase()] || {};
  let mat;
  if (typeof cfg.clearcoat === "number" && !srcMat.isMeshPhysicalMaterial) {
    mat = new THREE.MeshPhysicalMaterial();
    THREE.MeshStandardMaterial.prototype.copy.call(mat, srcMat);
  } else {
    mat = srcMat.clone();
  }
  if (typeof cfg.metalness === "number") mat.metalness = cfg.metalness;
  if (typeof cfg.roughness === "number") mat.roughness = cfg.roughness;
  if (typeof cfg.clearcoat === "number") {
    mat.clearcoat = cfg.clearcoat;
    mat.clearcoatRoughness = cfg.clearcoatRoughness ?? 0.08;
  }
  if (cfg.glass) {
    mat.transparent = true;
    mat.depthWrite = false;
  }
  mat.envMapIntensity = cfg.env ?? ROADSTER_DEFAULT_ENV;
  mat.userData.envMapIntensity = mat.envMapIntensity;
  mat.userData.keepAuthoredPBR = true;
  return mat;
}

// Scenes without scene.environment (the deep-space explorer) still need something for clearcoat
// and chrome to reflect: lazily attach the procedural light box to this material only.
function attachLazyStudioEnvironment(mesh, mat) {
  mesh.onBeforeRender = (renderer, scene) => {
    if (scene.environment || mat.envMap || mat.userData.studioEnvRequested) return;
    mat.userData.studioEnvRequested = true;
    setTimeout(() => {
      try {
        const tex = getStudioEnvironmentTexture(renderer);
        if (!tex) return;
        mat.envMap = tex;
        mat.envMapIntensity = (mat.userData.envMapIntensity ?? ROADSTER_DEFAULT_ENV) * ROADSTER_NO_SCENE_ENV_GAIN;
        mat.needsUpdate = true;
      } catch (_) {
        /* reflections are optional */
      }
    }, 0);
  };
}

function getAuxTexture(url, srgb = true) {
  const versionedUrl = url.includes("?") ? url : `${url}?v=${ASSET_VERSION}`;
  if (auxTextureCache.has(versionedUrl)) return auxTextureCache.get(versionedUrl);
  const tex = textureLoader.load(versionedUrl);
  if (srgb) tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = THREE.ClampToEdgeWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  auxTextureCache.set(versionedUrl, tex);
  return tex;
}

const AUTO_NORMALIZE_IDS = new Set([
  "jwst", "euclid", "spherex", "pan", "atlas_moon", "prometheus", "pandora", "janus", "epimetheus", "arrokoth"
]);

let activeLoads = 0;
const MAX_CONCURRENT_GLB_LOADS = 4;
const pendingLoadQueue = [];

export function prioritizeModelLoad(modelId, basePrefix = "assets/models") {
  const key = `${basePrefix}/${modelId}.glb?v=${ASSET_VERSION}`;
  const idx = pendingLoadQueue.findIndex((j) => j.key === key);
  if (idx > 0) {
    const [job] = pendingLoadQueue.splice(idx, 1);
    pendingLoadQueue.unshift(job);
  }
  touchModelCache(modelId, basePrefix);
}

function pumpGLBQueue() {
  while (activeLoads < MAX_CONCURRENT_GLB_LOADS && pendingLoadQueue.length > 0) {
    const job = pendingLoadQueue.shift();
    activeLoads++;
    const attemptLoad = (triesLeft) => {
      try {
        gltfLoader.load(
          job.key,
          (gltf) => {
            try {
              let rootScene = gltf.scene;
              const needNorm = job.modelId && (job.modelId.startsWith("sc_") || AUTO_NORMALIZE_IDS.has(job.modelId));
              if (needNorm) {
                rootScene.updateMatrixWorld(true);
                const box = new THREE.Box3().setFromObject(rootScene);
                if (!box.isEmpty()) {
                  const center = box.getCenter(new THREE.Vector3());
                  const size = box.getSize(new THREE.Vector3());
                  const halfDiag = 0.5 * size.length();
                  if (halfDiag > 1e-6 && (halfDiag < 0.72 || halfDiag > 1.28 || center.length() > 0.18)) {
                    const wrapper = new THREE.Group();
                    const s = 1.0 / halfDiag;
                    rootScene.scale.multiplyScalar(s);
                    rootScene.position.sub(center.multiplyScalar(s));
                    wrapper.add(rootScene);
                    rootScene = wrapper;
                  }
                }
              }
              activeLoads--;
              job.resolve(rootScene);
              pumpGLBQueue();
            } catch (innerErr) {
              activeLoads--;
              job.reject(innerErr);
              pumpGLBQueue();
            }
          },
          undefined,
          (err) => {
            if (triesLeft > 0) {
              setTimeout(() => attemptLoad(triesLeft - 1), 120);
            } else {
              activeLoads--;
              job.reject(err);
              pumpGLBQueue();
            }
          }
        );
      } catch (syncErr) {
        activeLoads--;
        job.reject(syncErr);
        pumpGLBQueue();
      }
    };
    attemptLoad(2);
  }
}

export function loadGLBTemplate(modelId, basePrefix = "assets/models") {
  const key = `${basePrefix}/${modelId}.glb?v=${ASSET_VERSION}`;
  const existing = glbCache.get(key);
  if (existing) {
    existing.lastUsed = performance.now();
    return existing.promise;
  }
  const entry = { promise: null, scene: null, modelId, lastUsed: performance.now(), refs: 0 };
  const p = new Promise((resolve, reject) => {
    pendingLoadQueue.push({
      key,
      modelId,
      resolve: (rootScene) => {
        entry.scene = rootScene;
        entry.lastUsed = performance.now();
        evictLRUModels();
        resolve(rootScene);
      },
      reject: (err) => {
        glbCache.delete(key);
        reject(err);
      }
    });
    pumpGLBQueue();
  });
  entry.promise = p;
  glbCache.set(key, entry);
  return p;
}

export function createPlanetaryRingShaderMaterial(ringTex, ry = 1.0, sunDirUniform = null) {
  const uSunLocal = sunDirUniform || { value: new THREE.Vector3(0.75, 0.28, 0.60).normalize() };
  return new THREE.ShaderMaterial({
    uniforms: {
      uRingMap: { value: ringTex },
      uOblateRy: { value: ry },
      uSunDirLocal: uSunLocal,
      uBrightness: { value: 1.12 }
    },
    vertexShader: `
      #include <common>
      #include <logdepthbuf_pars_vertex>
      varying vec2 vUv;
      varying vec3 vLocalPos;
      varying vec3 vWorldPos;
      void main() {
        vUv = uv;
        vLocalPos = position;
        vec4 worldPosition = modelMatrix * vec4(position, 1.0);
        vWorldPos = worldPosition.xyz;
        gl_Position = projectionMatrix * viewMatrix * worldPosition;
        #include <logdepthbuf_vertex>
      }
    `,
    fragmentShader: `
      #include <common>
      #include <logdepthbuf_pars_fragment>
      uniform sampler2D uRingMap;
      uniform float uOblateRy;
      uniform vec3 uSunDirLocal;
      uniform float uBrightness;
      varying vec2 vUv;
      varying vec3 vLocalPos;
      varying vec3 vWorldPos;

      void main() {
        #include <logdepthbuf_fragment>
        vec4 texel = texture2D(uRingMap, vUv);
        if (texel.a < 0.006) discard;

        // Exact ray-ellipsoid shadow test against oblate parent planet (x^2 + (y/ry)^2 + z^2 = 1)
        vec3 S = normalize(uSunDirLocal);
        vec3 Ps = vec3(vLocalPos.x, vLocalPos.y / max(0.2, uOblateRy), vLocalPos.z);
        vec3 Ds = normalize(vec3(S.x, S.y / max(0.2, uOblateRy), S.z));
        float b = dot(Ps, Ds);
        float c = dot(Ps, Ps) - 1.0;
        float shadow = 1.0;
        if (b < 0.0 && c > 0.0) {
          float perpSq = dot(Ps, Ps) - b * b;
          float distFromAxis = sqrt(max(0.0, perpSq));
          // Crisp solar penumbra across ring plane
          shadow = smoothstep(0.985, 1.018, distFromAxis);
        }

        // Phase scattering (Seeliger opposition surge + translucent forward scatter)
        vec3 viewDir = normalize(cameraPosition - vWorldPos);
        // Approximate world sun direction via local S direction magnitude
        float sunElev = abs(S.y);
        float lit = 0.58 + 0.42 * smoothstep(0.0, 0.35, sunElev + 0.08);
        float finalLight = mix(0.035, lit * uBrightness, shadow);

        vec3 rgb = texel.rgb * finalLight;
        gl_FragColor = vec4(rgb, texel.a);
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
      }
    `,
    transparent: true,
    depthWrite: false,
    side: THREE.DoubleSide
  });
}

export function createQuadsphereGeometry(radius = 1.0, segs = 28) {
  const geom = new THREE.BoxGeometry(1, 1, 1, segs, segs, segs);
  const pos = geom.attributes.position;
  const nrm = geom.attributes.normal;
  const v = new THREE.Vector3();
  for (let i = 0; i < pos.count; i++) {
    v.fromBufferAttribute(pos, i).normalize();
    nrm.setXYZ(i, v.x, v.y, v.z);
    pos.setXYZ(i, v.x * radius, v.y * radius, v.z * radius);
  }
  return geom;
}

export function createAtmosphereRimMesh(modelId, sunDirWorldUniform, baseRadius = 1.0) {
  const cfg = ATMOSPHERE_PARAMS[modelId];
  if (!cfg) return null;

  const geom = createQuadsphereGeometry(baseRadius * cfg.scale, 28);
  geom.scale(1.0, cfg.ry, 1.0);
  geom.computeVertexNormals();

  const mat = new THREE.ShaderMaterial({
    uniforms: {
      uColor: { value: new THREE.Color(...cfg.color) },
      uSunsetColor: { value: new THREE.Color(...cfg.sunset) },
      uSunDirWorld: sunDirWorldUniform,
      uIntensity: { value: cfg.intensity },
      uPower: { value: cfg.power }
    },
    vertexShader: `
      #include <common>
      #include <logdepthbuf_pars_vertex>
      varying vec3 vWorldNormal;
      varying vec3 vViewDir;
      void main() {
        vec4 worldPos = modelMatrix * vec4(position, 1.0);
        vWorldNormal = normalize(mat3(modelMatrix) * normal);
        vViewDir = normalize(cameraPosition - worldPos.xyz);
        gl_Position = projectionMatrix * viewMatrix * worldPos;
        #include <logdepthbuf_vertex>
      }
    `,
    fragmentShader: `
      #include <common>
      #include <logdepthbuf_pars_fragment>
      uniform vec3 uColor;
      uniform vec3 uSunsetColor;
      uniform vec3 uSunDirWorld;
      uniform float uIntensity;
      uniform float uPower;
      varying vec3 vWorldNormal;
      varying vec3 vViewDir;

      void main() {
        #include <logdepthbuf_fragment>
        vec3 N = normalize(vWorldNormal);
        vec3 V = normalize(vViewDir);
        vec3 L = normalize(uSunDirWorld);
        float ndv = clamp(dot(N, V), 0.0, 1.0);
        float fresnel = pow(1.0 - ndv, uPower);
        float ndl = dot(N, L);
        float dayFactor = smoothstep(-0.22, 0.35, ndl);
        float terminator = exp(-pow((ndl - 0.02) / 0.24, 2.0));
        vec3 col = mix(uColor, uSunsetColor, terminator * 0.55);
        float alpha = fresnel * dayFactor * uIntensity;
        gl_FragColor = vec4(col * alpha * 1.35, alpha);
      }
    `,
    blending: THREE.AdditiveBlending,
    transparent: true,
    depthWrite: false,
    side: THREE.FrontSide
  });

  const mesh = new THREE.Mesh(geom, mat);
  mesh.name = `${modelId}_atmosphere_rim`;
  mesh.renderOrder = 2;
  return mesh;
}

function injectRingShadowIntoPlanetMaterial(mat, ringCfg, sunDirLocalUniform, baseAssetPrefix = "") {
  const ringUrl = baseAssetPrefix ? `${baseAssetPrefix}/${ringCfg.ringPng}` : ringCfg.ringPng;
  const ringTex = getAuxTexture(ringUrl, true);
  mat.onBeforeCompile = (shader) => {
    shader.uniforms.uRingShadowTex = { value: ringTex };
    shader.uniforms.uRingInner = { value: ringCfg.rInner };
    shader.uniforms.uRingOuter = { value: ringCfg.rOuter };
    shader.uniforms.uRingShadowStr = { value: ringCfg.shadowStrength };
    shader.uniforms.uSunDirBody = sunDirLocalUniform;

    shader.vertexShader = shader.vertexShader
      .replace("#include <common>", "#include <common>\nvarying vec3 vBodyLocalPos;")
      .replace("#include <begin_vertex>", "#include <begin_vertex>\nvBodyLocalPos = position;");

    shader.fragmentShader = shader.fragmentShader
      .replace(
        "#include <common>",
        `#include <common>
        uniform sampler2D uRingShadowTex;
        uniform float uRingInner;
        uniform float uRingOuter;
        uniform float uRingShadowStr;
        uniform vec3 uSunDirBody;
        varying vec3 vBodyLocalPos;`
      )
      .replace(
        "#include <dithering_fragment>",
        `
        vec3 sDir = normalize(uSunDirBody);
        if (abs(sDir.y) > 0.002) {
          float tHit = -vBodyLocalPos.y / sDir.y;
          if (tHit > 0.0) {
            vec2 hitXZ = vBodyLocalPos.xz + sDir.xz * tHit;
            float rHit = length(hitXZ);
            if (rHit > uRingInner && rHit < uRingOuter) {
              float uRad = (rHit - uRingInner) / (uRingOuter - uRingInner);
              float ringAlpha = texture2D(uRingShadowTex, vec2(uRad, 0.5)).a;
              gl_FragColor.rgb *= (1.0 - uRingShadowStr * ringAlpha);
            }
          }
        }
        #include <dithering_fragment>
        `
      );
  };
  mat.needsUpdate = true;
}

function createEarthStratifiedAtmosphereGroup(sunDirWorldUniform, baseRadius = 1.0) {
  const WGS84_RY = 6356.7523142 / 6378.137;
  const group = new THREE.Group();
  group.name = "earth_stratified_atmosphere";

  const makeAtmoShell = (name, rScale, colDay, colTwilight, colNightAirglow, intensity, power, airglowStr, order) => {
    const geom = createQuadsphereGeometry(baseRadius * rScale, 36);
    geom.scale(1.0, WGS84_RY, 1.0);
    geom.computeVertexNormals();
    const mat = new THREE.ShaderMaterial({
      uniforms: {
        uColorDay: { value: new THREE.Color(...colDay) },
        uColorTwilight: { value: new THREE.Color(...colTwilight) },
        uColorAirglow: { value: new THREE.Color(...colNightAirglow) },
        uSunDirWorld: sunDirWorldUniform,
        uIntensity: { value: intensity },
        uPower: { value: power },
        uAirglow: { value: airglowStr }
      },
      vertexShader: `
        #include <common>
        #include <logdepthbuf_pars_vertex>
        varying vec3 vWorldNormal;
        varying vec3 vViewDir;
        void main() {
          vec4 worldPos = modelMatrix * vec4(position, 1.0);
          vWorldNormal = normalize(mat3(modelMatrix) * normal);
          vViewDir = normalize(cameraPosition - worldPos.xyz);
          gl_Position = projectionMatrix * viewMatrix * worldPos;
          #include <logdepthbuf_vertex>
        }
      `,
      fragmentShader: `
        #include <common>
        #include <logdepthbuf_pars_fragment>
        uniform vec3 uColorDay;
        uniform vec3 uColorTwilight;
        uniform vec3 uColorAirglow;
        uniform vec3 uSunDirWorld;
        uniform float uIntensity;
        uniform float uPower;
        uniform float uAirglow;
        varying vec3 vWorldNormal;
        varying vec3 vViewDir;
        void main() {
          #include <logdepthbuf_fragment>
          vec3 N = normalize(vWorldNormal);
          vec3 V = normalize(vViewDir);
          vec3 L = normalize(uSunDirWorld);
          float ndv = clamp(dot(N, V), 0.0, 1.0);
          float limb = pow(1.0 - ndv, uPower);
          float ndl = dot(N, L);
          float dayMask = smoothstep(-0.18, 0.36, ndl);
          float twiMask = exp(-pow((ndl - 0.01) / 0.21, 2.0));
          float nightMask = smoothstep(0.06, -0.26, ndl);

          vec3 dayCol = mix(uColorDay, uColorTwilight, twiMask * 0.68);
          float dayAlpha = limb * dayMask * uIntensity;
          float glowAlpha = pow(1.0 - ndv, 7.2) * nightMask * uAirglow;
          float totalAlpha = dayAlpha + glowAlpha;
          if (totalAlpha < 0.001) discard;
          vec3 rgb = dayCol * dayAlpha * 1.32 + uColorAirglow * glowAlpha * 1.45;
          gl_FragColor = vec4(rgb, clamp(totalAlpha, 0.0, 1.0));
        }
      `,
      blending: THREE.AdditiveBlending,
      transparent: true,
      depthWrite: false,
      side: THREE.FrontSide
    });
    const m = new THREE.Mesh(geom, mat);
    m.name = name;
    m.renderOrder = order;
    m.userData.baseIntensity = intensity;
    m.userData.baseAirglow = airglowStr;
    return m;
  };

  // 1. Troposphere (0–12 km, H_R=8.5 km, H_M=1.2 km): dense Rayleigh sky + warm golden-crimson Mie sunset
  const tropo = makeAtmoShell(
    "atmo_troposphere_12km", 1.0085,
    [0.32, 0.66, 1.00], [1.00, 0.44, 0.14], [0.0, 0.0, 0.0],
    0.52, 3.3, 0.0, 2
  );
  // 2. Stratosphere & Chappuis Ozone Band (12–50 km, peak O3 at 25 km): deep royal cobalt-indigo twilight band
  const strato = makeAtmoShell(
    "atmo_stratosphere_ozone_50km", 1.0185,
    [0.18, 0.46, 0.98], [0.22, 0.38, 0.96], [0.0, 0.0, 0.0],
    0.34, 4.4, 0.0, 2
  );
  // 3. Mesosphere & 100 km Kármán Line (50–100 km): 557.7 nm atomic-oxygen + OH nightside airglow limb!
  const meso = makeAtmoShell(
    "atmo_mesosphere_karman_100km", 1.0295,
    [0.40, 0.76, 1.00], [0.36, 0.62, 0.98], [0.22, 0.88, 0.68],
    0.20, 5.6, 0.18, 3
  );
  // 4. Thermosphere / Ionosphere F-Region Veil (100–420 km, LEO station altitude): tenuous exponential exobase halo
  const thermo = makeAtmoShell(
    "atmo_thermosphere_400km", 1.0560,
    [0.24, 0.54, 0.98], [0.20, 0.42, 0.88], [0.16, 0.45, 0.72],
    0.11, 6.2, 0.05, 3
  );
  group.add(tropo, strato, meso, thermo);

  // Optional Precision Geodetic Altitude Cross-Section Rings (shown when user enables "Stratified Profile" mode!)
  const profileGroup = new THREE.Group();
  profileGroup.name = "earth_atmo_altitude_shells";
  profileGroup.visible = false;
  const shellDefs = [
    { r: 1.0085, col: 0xfbbf24, op: 0.55 }, // 12 km Tropopause
    { r: 1.0185, col: 0x60a5fa, op: 0.60 }, // 50 km Stratopause / Ozone
    { r: 1.0295, col: 0x34d399, op: 0.75 }, // 100 km Kármán Line / Airglow
    { r: 1.0640, col: 0xa78bfa, op: 0.50 }  // 400 km Thermosphere / ISS & Tiangong Shell
  ];
  for (const sd of shellDefs) {
    const ptsEq = [];
    const ptsMer = [];
    const nSeg = 180;
    for (let i = 0; i < nSeg; i++) {
      const th = (i / nSeg) * Math.PI * 2.0;
      ptsEq.push(new THREE.Vector3(Math.cos(th) * baseRadius * sd.r, 0, Math.sin(th) * baseRadius * sd.r));
      ptsMer.push(new THREE.Vector3(0, Math.sin(th) * baseRadius * sd.r * WGS84_RY, Math.cos(th) * baseRadius * sd.r));
    }
    const mRing = new THREE.LineBasicMaterial({ color: sd.col, transparent: true, opacity: sd.op, depthWrite: false });
    profileGroup.add(new THREE.LineLoop(new THREE.BufferGeometry().setFromPoints(ptsEq), mRing));
    profileGroup.add(new THREE.LineLoop(new THREE.BufferGeometry().setFromPoints(ptsMer), mRing));
  }
  group.add(profileGroup);
  group.userData = { shells: [tropo, strato, meso, thermo], profileGroup };
  return group;
}

function injectEarthDemAndNightShader(mat, sunDirWorldUniform, demScaleUniform, isCadMesh = false, baseAssetPrefix = "") {
  const nightUrl = baseAssetPrefix ? `${baseAssetPrefix}/assets/textures/earth_night.jpg` : "assets/textures/earth_night.jpg";
  const demUrl = baseAssetPrefix ? `${baseAssetPrefix}/assets/textures/earth_dem_4k.png` : "assets/textures/earth_dem_4k.png";

  const nightTex = getAuxTexture(nightUrl, true);
  nightTex.flipY = false;
  nightTex.wrapS = THREE.ClampToEdgeWrapping;
  nightTex.wrapT = THREE.ClampToEdgeWrapping;

  const demTex = getAuxTexture(demUrl, false);
  demTex.flipY = false;
  demTex.wrapS = THREE.ClampToEdgeWrapping;
  demTex.wrapT = THREE.ClampToEdgeWrapping;

  mat.onBeforeCompile = (shader) => {
    shader.uniforms.uNightTex = { value: nightTex };
    shader.uniforms.uDemTex = { value: demTex };
    shader.uniforms.uDemScale = demScaleUniform;
    shader.uniforms.uIsCadMesh = { value: isCadMesh ? 1.0 : 0.0 };
    shader.uniforms.uSunDirWorld = sunDirWorldUniform;

    shader.vertexShader = shader.vertexShader
      .replace(
        "#include <common>",
        `#include <common>
        uniform sampler2D uDemTex;
        uniform float uDemScale;
        uniform float uIsCadMesh;
        varying vec3 vEarthWorldNorm;
        varying vec2 vEarthUv;`
      )
      .replace(
        "#include <begin_vertex>",
        `#include <begin_vertex>
        float demByte = texture2D(uDemTex, uv).r * 255.0;
        float elevKm = demByte >= 140.0
          ? ((demByte - 140.0) / 115.0) * 8.84886
          : ((demByte - 140.0) / 140.0) * 10.994;
        // Photorealistic 8K Earth keeps sea level flat (oceans=0 km, continents displaced by uDemScale);
        // 442k-tri Hypsometric CAD Earth already has 1x baked in and displaces BOTH peaks & ocean trenches!
        float effElevKm = uIsCadMesh > 0.5
          ? elevKm * (uDemScale - 1.0)
          : max(0.0, elevKm) * uDemScale;
        vec3 radDir = normalize(position);
        transformed += radDir * (effElevKm / 6378.137);`
      )
      .replace(
        "#include <worldpos_vertex>",
        "#include <worldpos_vertex>\nvEarthWorldNorm = normalize(mat3(modelMatrix) * objectNormal);\nvEarthUv = uv;"
      );

    shader.fragmentShader = shader.fragmentShader
      .replace(
        "#include <common>",
        "#include <common>\nuniform sampler2D uNightTex;\nuniform float uIsCadMesh;\nuniform vec3 uSunDirWorld;\nvarying vec3 vEarthWorldNorm;\nvarying vec2 vEarthUv;"
      )
      .replace(
        "#include <dithering_fragment>",
        `
        float ndlEarth = dot(normalize(vEarthWorldNorm), normalize(uSunDirWorld));
        float nightMask = smoothstep(0.10, -0.20, ndlEarth);
        vec3 cityRgb = texture2D(uNightTex, vEarthUv).rgb;
        float cityGain = uIsCadMesh > 0.5 ? 0.35 : 0.95;
        gl_FragColor.rgb += cityRgb * vec3(1.15, 0.92, 0.65) * nightMask * cityGain;
        #include <dithering_fragment>
        `
      );
  };
  mat.needsUpdate = true;
}

/**
 * Instantiate a full, shader-enhanced 3D model instance for a given modelId.
 * Returns { group, sunDirLocalUniform, sunDirWorldUniform, demScaleUniform, readyPromise }.
 */
export function instantiateEnhanced3DBody(modelId, meshRadius = 1.0, options = {}) {
  const baseAssetPrefix = options.baseAssetPrefix || "";
  const modelsPath = baseAssetPrefix ? `${baseAssetPrefix}/assets/models` : "assets/models";

  const holder = new THREE.Group();
  holder.name = `glb_${modelId}`;

  const sunDirLocalUniform = { value: new THREE.Vector3(0.75, 0.28, 0.60).normalize() };
  const sunDirWorldUniform = { value: new THREE.Vector3(0.75, 0.28, 0.60).normalize() };
  const demScaleUniform = { value: modelId === "earth_cad_dem" ? 18.0 : 1.0 };
  let cloudMeshRef = null;
  let globeMaterialRef = null;
  let stratifiedAtmoRef = null;

  const cacheKey = `${modelsPath}/${modelId}.glb?v=${ASSET_VERSION}`;
  let disposed = false;

  const readyPromise = loadGLBTemplate(modelId, modelsPath).then((templateScene) => {
    if (disposed) return holder;
    const cacheEntry = glbCache.get(cacheKey);
    if (cacheEntry) {
      cacheEntry.refs++;
      cacheEntry.lastUsed = performance.now();
    }
    const instance = templateScene.clone(true);
    instance.scale.setScalar(meshRadius);

    const ringCfg = RING_SYSTEM_PARAMS[modelId] || null;

    instance.traverse((child) => {
      if (!child.isMesh) return;
      const nm = (child.name || "").toLowerCase();
      const matName = (child.material?.name || "").toLowerCase();
      const isRingMesh = nm.includes("ring") || matName.includes("ring");

      if (isRingMesh && ringCfg) {
        const ringTex = child.material?.map || getAuxTexture(
          baseAssetPrefix ? `${baseAssetPrefix}/${ringCfg.ringPng}` : ringCfg.ringPng,
          true
        );
        child.material = createPlanetaryRingShaderMaterial(ringTex, ringCfg.ry, sunDirLocalUniform);
        child.renderOrder = 3;
      } else if (child.material) {
        const isRoadsterModel = modelId === ROADSTER_MODEL_ID;
        const mat = isRoadsterModel ? buildRoadsterMaterial(child.material) : child.material.clone();
        const isSpacecraftModel =
          modelId.startsWith("sc_") || modelId === "euclid" || modelId === "spherex" || modelId === "jwst";
        if (isRoadsterModel) {
          // Authored automotive PBR is kept as-is (no metalness/roughness/albedo clamp).
          if (typeof mat.emissiveIntensity === "number") mat.emissiveIntensity = Math.min(mat.emissiveIntensity, 1.0);
          attachLazyStudioEnvironment(child, mat);
        } else if (isSpacecraftModel) {
          if (typeof mat.metalness === "number") mat.metalness = Math.min(mat.metalness, 0.42);
          if (typeof mat.roughness === "number") mat.roughness = Math.max(mat.roughness, 0.36);
          if (mat.color) {
            const maxC = Math.max(mat.color.r, mat.color.g, mat.color.b);
            if (mat.map) {
              if (maxC > 0.72) mat.color.multiplyScalar(0.72 / maxC);
            } else if (maxC > 0.44) {
              const targetMax = 0.44 + 0.16 * (maxC - 0.44);
              mat.color.multiplyScalar(targetMax / maxC);
            }
          }
          if (typeof mat.emissiveIntensity === "number") {
            mat.emissiveIntensity = Math.min(mat.emissiveIntensity, 0.38);
          }
          mat.side = THREE.DoubleSide;
        } else if (modelId !== "sun" && !nm.includes("plume") && !nm.includes("geyser")) {
          mat.emissive = new THREE.Color(0x000000);
          mat.emissiveIntensity = 0.0;
        }
        const isTrueShapeNormal =
          isSpacecraftModel ||
          ["earth", "earth_cad_dem", "vesta", "mimas", "proteus", "eros", "bennu", "ryugu", "psyche", "didymos", "dimorphos", "apophis", "67p", "oumuamua", "hyperion", "phoebe"].includes(modelId);
        if (mat.normalMap && mat.normalScale) {
          const nScale = modelId === "earth_cad_dem" ? 1.15 : (isTrueShapeNormal ? 0.80 : 0.26);
          const sx = Math.sign(mat.normalScale.x || 1.0);
          const sy = Math.sign(mat.normalScale.y || 1.0);
          mat.normalScale.set(sx * nScale, sy * nScale);
        }
        if (nm.includes("cloud")) {
          mat.opacity = 0.56;
          mat.transparent = true;
          cloudMeshRef = child;
        }
        if (nm.includes("cloud") || nm.includes("haze") || nm.includes("geyser")) {
          mat.depthWrite = false;
          child.renderOrder = 1;
        }
        if (ringCfg && (nm.includes("globe") || nm.includes("body") || nm === "haumea")) {
          injectRingShadowIntoPlanetMaterial(mat, ringCfg, sunDirLocalUniform, baseAssetPrefix);
        }
        if ((modelId === "earth" || modelId === "earth_cad_dem") && nm.includes("globe")) {
          injectEarthDemAndNightShader(mat, sunDirWorldUniform, demScaleUniform, modelId === "earth_cad_dem", baseAssetPrefix);
          globeMaterialRef = mat;
        }
        child.material = mat;
      }
    });

    holder.add(instance);

    // Attach 4-Layer Stratified Physical Atmosphere on Earth, or standard Rayleigh/Mie rim on other worlds
    if (modelId === "earth" || modelId === "earth_cad_dem") {
      stratifiedAtmoRef = createEarthStratifiedAtmosphereGroup(sunDirWorldUniform, meshRadius);
      if (modelId === "earth_cad_dem") {
        // Default CAD mode attenuates atmosphere slightly so 442k-tri ocean trenches & peaks stand out clearly
        for (const sh of stratifiedAtmoRef.userData.shells) {
          sh.material.uniforms.uIntensity.value = sh.userData.baseIntensity * 0.45;
        }
      }
      holder.add(stratifiedAtmoRef);
    } else {
      const atmoMesh = createAtmosphereRimMesh(modelId, sunDirWorldUniform, meshRadius);
      if (atmoMesh) holder.add(atmoMesh);
    }

    holder.userData.cloudMesh = cloudMeshRef;
    holder.userData.globeMaterial = globeMaterialRef;
    holder.userData.stratifiedAtmo = stratifiedAtmoRef;
    return holder;
  });

  function dispose() {
    if (disposed) return;
    disposed = true;
    const cacheEntry = glbCache.get(cacheKey);
    if (cacheEntry && cacheEntry.refs > 0) {
      cacheEntry.refs--;
      cacheEntry.lastUsed = performance.now();
    }
    disposeObject3D(holder, false);
    while (holder.children.length > 0) holder.remove(holder.children[0]);
    evictLRUModels();
  }

  return {
    group: holder,
    sunDirLocalUniform,
    sunDirWorldUniform,
    demScaleUniform,
    readyPromise,
    dispose
  };
}
