// Dedicated 3D (.glb) Solar System Bodies, Custom GLSL Ring/Atmosphere Shaders & 3D Volumetric Comet Tails
// Supports seamless zoom from 100,000 AU down to 0.00003 AU close-up surface, spacecraft & comet inspection at 60 FPS.

import * as THREE from "../vendor/three.module.js";
import { DEG2RAD } from "./orbitalMechanics.js";
import { instantiateEnhanced3DBody, createQuadsphereGeometry, prioritizeModelLoad } from "./model3dLibrary.js";
import { applyIAUPoleOrientationToTiltGroup } from "./planetaryRotation.js";
import { SUN_COLOR, DISCOVERY_GOLD, CATEGORY_COLORS, temperatureToHex } from "./colorSystem.js";

let sharedGlowTexture = null;
let sharedReticleTexture = null;

export function getGlowSpriteTexture() {
  if (sharedGlowTexture) return sharedGlowTexture;
  const size = 128;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  g.addColorStop(0.0, "rgba(255,255,255,1.0)");
  g.addColorStop(0.18, "rgba(255,255,255,0.82)");
  g.addColorStop(0.45, "rgba(255,255,255,0.25)");
  g.addColorStop(1.0, "rgba(255,255,255,0.0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, size, size);
  sharedGlowTexture = new THREE.CanvasTexture(canvas);
  return sharedGlowTexture;
}

export function getDiscoveryReticleTexture() {
  if (sharedReticleTexture) return sharedReticleTexture;
  const size = 256;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  const c = size / 2;

  ctx.clearRect(0, 0, size, size);
  ctx.strokeStyle = DISCOVERY_GOLD;
  ctx.globalAlpha = 0.94;
  ctx.lineWidth = 4.0;
  for (let k = 0; k < 4; k++) {
    const a0 = k * (Math.PI / 2) + 0.22;
    const a1 = (k + 1) * (Math.PI / 2) - 0.22;
    ctx.beginPath();
    ctx.arc(c, c, 92, a0, a1);
    ctx.stroke();
  }
  ctx.strokeStyle = "rgba(255, 236, 196, 0.86)";
  ctx.globalAlpha = 1.0;
  ctx.lineWidth = 2.8;
  for (let k = 0; k < 4; k++) {
    const ang = k * (Math.PI / 2);
    ctx.beginPath();
    ctx.moveTo(c + Math.cos(ang) * 66, c + Math.sin(ang) * 66);
    ctx.lineTo(c + Math.cos(ang) * 108, c + Math.sin(ang) * 108);
    ctx.stroke();
  }
  sharedReticleTexture = new THREE.CanvasTexture(canvas);
  return sharedReticleTexture;
}

export function createSunShaderMesh(meshRadius) {
  const group = new THREE.Group();

  const sun3d = instantiateEnhanced3DBody("sun", meshRadius * 0.996);
  group.add(sun3d.group);

  const sunUniforms = {
    uTime: { value: 0.0 }
  };

  const chromoMat = new THREE.ShaderMaterial({
    uniforms: sunUniforms,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    vertexShader: `
      #include <common>
      #include <logdepthbuf_pars_vertex>
      varying vec3 vNormalPos;
      varying vec3 vViewDir;
      void main() {
        vNormalPos = normalize(position);
        vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
        vViewDir = normalize(-mvPosition.xyz);
        gl_Position = projectionMatrix * mvPosition;
        #include <logdepthbuf_vertex>
      }
    `,
    fragmentShader: `
      #include <common>
      #include <logdepthbuf_pars_fragment>
      uniform float uTime;
      varying vec3 vNormalPos;
      varying vec3 vViewDir;

      float hash3(vec3 p) {
        p = fract(p * 0.3183099 + vec3(0.1, 0.2, 0.3));
        p *= 17.0;
        return fract(p.x * p.y * p.z * (p.x + p.y + p.z));
      }

      float noise3(vec3 x) {
        vec3 i = floor(x);
        vec3 f = fract(x);
        f = f * f * (3.0 - 2.0 * f);
        return mix(
          mix(mix(hash3(i + vec3(0,0,0)), hash3(i + vec3(1,0,0)), f.x),
              mix(hash3(i + vec3(0,1,0)), hash3(i + vec3(1,1,0)), f.x), f.y),
          mix(mix(hash3(i + vec3(0,0,1)), hash3(i + vec3(1,0,1)), f.x),
              mix(hash3(i + vec3(0,1,1)), hash3(i + vec3(1,1,1)), f.x), f.y), f.z);
      }

      void main() {
        #include <logdepthbuf_fragment>
        vec3 p = vNormalPos * 12.0 + vec3(uTime * 0.07, -uTime * 0.05, uTime * 0.04);
        float n = 0.55 * noise3(p) + 0.30 * noise3(p * 2.4) + 0.15 * noise3(p * 5.3);
        float mu = clamp(dot(normalize(vNormalPos), normalize(vViewDir)), 0.0, 1.0);
        float rim = pow(1.0 - mu, 2.2);
        vec3 col = mix(vec3(1.0, 0.60, 0.22), vec3(1.0, 0.91, 0.73), n) * (0.28 + 0.95 * rim);
        gl_FragColor = vec4(col, 0.42 + 0.55 * rim);
      }
    `
  });

  const chromoSphere = new THREE.Mesh(createQuadsphereGeometry(meshRadius * 1.008, 32), chromoMat);
  group.add(chromoSphere);

  const glowTex = getGlowSpriteTexture();
  const innerCorona = new THREE.Sprite(new THREE.SpriteMaterial({
    map: glowTex,
    color: new THREE.Color(SUN_COLOR),
    blending: THREE.AdditiveBlending,
    transparent: true,
    depthWrite: false,
    opacity: 0.78
  }));
  innerCorona.scale.setScalar(meshRadius * 4.8);
  group.add(innerCorona);

  const outerCorona = new THREE.Sprite(new THREE.SpriteMaterial({
    map: glowTex,
    color: new THREE.Color(temperatureToHex(4000)),
    blending: THREE.AdditiveBlending,
    transparent: true,
    depthWrite: false,
    opacity: 0.38
  }));
  outerCorona.scale.setScalar(meshRadius * 10.5);
  group.add(outerCorona);

  group.userData.sunUniforms = sunUniforms;
  return group;
}

/**
 * Build a smooth 3D paraboloid / curved-synchrone volumetric tail envelope geometry
 * with analytical surface normals and normalized axial/azimuthal UVs (zero flat edges!).
 */
function buildCurvedParaboloidTailGeometry(length, rHead, rTail, curveZ, nAxial = 56, nRad = 64) {
  const positions = [];
  const normals = [];
  const uvs = [];
  const indices = [];

  function centerAndRadius(u) {
    // Smooth parabolic bow shock hood at u = 0 wrapping sunward (-xHead) around the nucleus
    const x = -rHead * 0.85 + (length + rHead * 0.85) * Math.pow(u, 1.08);
    const zc = curveZ * Math.pow(u, 1.68);
    // Smooth closed apex at u = 0 growing parabolically into the tail
    const r = u <= 1e-5 ? 0.0 : (rHead * Math.sqrt(u) * 1.35 + (rTail - rHead * 1.35) * Math.pow(u, 0.92));
    return { x, zc, r };
  }

  for (let i = 0; i <= nAxial; i++) {
    const u = i / nAxial;
    const cur = centerAndRadius(u);
    const eps = 0.004;
    const prev = centerAndRadius(Math.max(0.0, u - eps));
    const next = centerAndRadius(Math.min(1.0, u + eps));

    const tx = next.x - prev.x;
    const tz = next.zc - prev.zc;
    const dr = next.r - prev.r;
    const tLen = Math.hypot(tx, tz) || 1.0;
    // Tangent along spine T = (tx/tLen, 0, tz/tLen), radial perp in XZ plane P = (-tz/tLen, 0, tx/tLen)
    const Tx = tx / tLen, Tz = tz / tLen;
    const Px = -Tz, Pz = Tx;

    for (let j = 0; j <= nRad; j++) {
      const v = j / nRad;
      const phi = v * Math.PI * 2.0;
      const cp = Math.cos(phi);
      const sp = Math.sin(phi);

      // Radial direction around curved spine: cp * P + sp * Y
      const rx = cp * Px;
      const ry = sp;
      const rz = cp * Pz;

      const px = cur.x + cur.r * rx;
      const py = cur.r * ry;
      const pz = cur.zc + cur.r * rz;
      positions.push(px, py, pz);

      // Outward surface normal accounting for paraboloid flare dr/ds
      let nx, ny, nz;
      if (i === 0) {
        nx = -1.0; ny = 0.0; nz = 0.0;
      } else {
        const slope = dr / tLen;
        nx = rx - slope * Tx;
        ny = ry;
        nz = rz - slope * Tz;
        const nl = Math.hypot(nx, ny, nz) || 1.0;
        nx /= nl; ny /= nl; nz /= nl;
      }
      normals.push(nx, ny, nz);
      uvs.push(u, v);
    }
  }

  const stride = nRad + 1;
  for (let i = 0; i < nAxial; i++) {
    for (let j = 0; j < nRad; j++) {
      const a = i * stride + j;
      const b = a + 1;
      const c = (i + 1) * stride + j;
      const d = c + 1;
      indices.push(a, c, b, b, c, d);
    }
  }

  const geom = new THREE.BufferGeometry();
  geom.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  geom.setAttribute("normal", new THREE.Float32BufferAttribute(normals, 3));
  geom.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2));
  geom.setIndex(indices);
  return geom;
}

const VOLUMETRIC_TAIL_VERT = `
  #include <common>
  #include <logdepthbuf_pars_vertex>
  varying vec2 vUv;
  varying vec3 vViewNormal;
  varying vec3 vViewDir;
  varying vec3 vLocalPos;
  void main() {
    vUv = uv;
    vLocalPos = position;
    vec4 mvPos = modelViewMatrix * vec4(position, 1.0);
    vViewNormal = normalize(normalMatrix * normal);
    vViewDir = normalize(-mvPos.xyz);
    gl_Position = projectionMatrix * mvPos;
    #include <logdepthbuf_vertex>
  }
`;

const VOLUMETRIC_TAIL_FRAG = `
  #include <common>
  #include <logdepthbuf_pars_fragment>
  uniform float uTime;
  uniform vec3 uColorCore;
  uniform vec3 uColorOuter;
  uniform float uIntensity;
  uniform float uFilamentScale;
  uniform float uFlowSpeed;
  varying vec2 vUv;
  varying vec3 vViewNormal;
  varying vec3 vViewDir;
  varying vec3 vLocalPos;

  float hash31(vec3 p) {
    p = fract(p * 0.3183099 + vec3(0.11, 0.23, 0.37));
    p *= 17.0;
    return fract(p.x * p.y * p.z * (p.x + p.y + p.z));
  }

  float noise3d(vec3 x) {
    vec3 i = floor(x);
    vec3 f = fract(x);
    f = f * f * (3.0 - 2.0 * f);
    return mix(
      mix(mix(hash31(i + vec3(0,0,0)), hash31(i + vec3(1,0,0)), f.x),
          mix(hash31(i + vec3(0,1,0)), hash31(i + vec3(1,1,0)), f.x), f.y),
      mix(mix(hash31(i + vec3(0,0,1)), hash31(i + vec3(1,0,1)), f.x),
          mix(hash31(i + vec3(0,1,1)), hash31(i + vec3(1,1,1)), f.x), f.y), f.z);
  }

  void main() {
    #include <logdepthbuf_fragment>
    float u = vUv.x; // 0 at bow hood around nucleus -> 1 at distant tail tip

    // Smooth view-space Fresnel silhouette attenuation -> ZERO sharp polygon boundaries from ANY 360° angle!
    float ndv = abs(dot(normalize(vViewNormal), normalize(vViewDir)));
    float limbSoft = pow(clamp(ndv, 0.0, 1.0), 1.38);

    // Multi-octave 3D filamentary streamer FBM flowing outward from the nucleus
    float ang = vUv.y * 6.2831853;
    vec3 sampleCoord = vec3(
      u * 8.2 - uTime * uFlowSpeed,
      cos(ang) * uFilamentScale,
      sin(ang) * uFilamentScale
    );
    float fbm = 0.54 * noise3d(sampleCoord)
              + 0.30 * noise3d(sampleCoord * 2.25 + vec3(3.1, 1.7, 4.2))
              + 0.16 * noise3d(sampleCoord * 4.80 - vec3(1.9, 5.3, 2.8));
    float striations = smoothstep(0.18, 0.84, fbm);

    // Keep inner nucleus region translucent so the 3D bilobed comet nucleus surface is crisp and never overexposed!
    float headRamp = smoothstep(0.0, 0.016, u);
    float tailDecay = pow(clamp(1.0 - u, 0.0, 1.0), 1.45);

    float alpha = limbSoft * headRamp * tailDecay * (0.44 + 0.56 * striations) * uIntensity;
    if (alpha < 0.0015) discard;

    vec3 col = mix(uColorOuter, uColorCore, striations * (1.0 - 0.45 * u));
    gl_FragColor = vec4(col * alpha * 1.65, alpha);
  }
`;

function createVolumetricCometSystem(obj, meshRadius, vt) {
  const comaGroup = new THREE.Group();
  comaGroup.name = "volumetricCometSystem";

  const isInterstellar = obj.category === "interstellar";
  const isChiron = vt === "chiron_ringed";
  const timeUniform = { value: 0.0 };

  // 1. True 3D Volumetric Spherical Haser (1/r) Inner & Outer Gas Coma (zero flat sprite artifacts!)
  const comaRadius = meshRadius * (isChiron ? 4.2 : 7.6);
  const comaMat = new THREE.ShaderMaterial({
    uniforms: {
      uTime: timeUniform,
      uColor: { value: new THREE.Color(isInterstellar ? 0x7fcfe0 : 0x6fd6cc) },
      uStrength: { value: isChiron ? 0.18 : 0.38 }
    },
    transparent: true,
    depthWrite: false,
    side: THREE.FrontSide,
    blending: THREE.AdditiveBlending,
    vertexShader: `
      #include <common>
      #include <logdepthbuf_pars_vertex>
      varying vec3 vViewNorm;
      varying vec3 vViewDir;
      void main() {
        vec4 mv = modelViewMatrix * vec4(position, 1.0);
        vViewNorm = normalize(normalMatrix * normal);
        vViewDir = normalize(-mv.xyz);
        gl_Position = projectionMatrix * mv;
        #include <logdepthbuf_vertex>
      }
    `,
    fragmentShader: `
      #include <common>
      #include <logdepthbuf_pars_fragment>
      uniform vec3 uColor;
      uniform float uStrength;
      varying vec3 vViewNorm;
      varying vec3 vViewDir;
      void main() {
        #include <logdepthbuf_fragment>
        float mu = clamp(dot(normalize(vViewNorm), normalize(vViewDir)), 0.0, 1.0);
        // Smooth radial Haser coma density: zero at outer boundary (mu=0), translucent window right over nucleus (mu=1)
        float profile = pow(mu, 2.35) * (1.0 - 0.46 * pow(mu, 6.5));
        float a = profile * uStrength;
        gl_FragColor = vec4(uColor * a * 1.45, a);
      }
    `
  });
  const comaSphere = new THREE.Mesh(createQuadsphereGeometry(comaRadius, 28), comaMat);
  comaGroup.add(comaSphere);

  if (!isChiron) {
    const tailGroup = new THREE.Group();
    tailGroup.name = "antiSolarCometTails";

    const addTailShell = (lenM, rHeadM, rTipM, curveZM, nAx, nRd, colCore, colOuter, intensity, filScale, flowSpd) => {
      const geo = buildCurvedParaboloidTailGeometry(
        meshRadius * lenM,
        meshRadius * rHeadM,
        meshRadius * rTipM,
        meshRadius * curveZM,
        nAx,
        nRd
      );
      const mat = new THREE.ShaderMaterial({
        uniforms: {
          uTime: timeUniform,
          uColorCore: { value: new THREE.Color(colCore) },
          uColorOuter: { value: new THREE.Color(colOuter) },
          uIntensity: { value: intensity },
          uFilamentScale: { value: filScale },
          uFlowSpeed: { value: flowSpd }
        },
        vertexShader: VOLUMETRIC_TAIL_VERT,
        fragmentShader: VOLUMETRIC_TAIL_FRAG,
        transparent: true,
        depthWrite: false,
        side: THREE.DoubleSide,
        blending: THREE.AdditiveBlending
      });
      const m = new THREE.Mesh(geo, mat);
      m.frustumCulled = false;
      tailGroup.add(m);
    };

    // 2. Multi-Shell High-Resolution 3D Type-I Anti-Solar Ion/Plasma Tail (dense core spine + wide filamentary sheath)
    addTailShell(
      58.0, 0.88, 2.85, 0.0, 64, 64,
      isInterstellar ? 0xa6e4f0 : 0x8fdcf0,
      0x3f7fd6,
      0.58, 8.2, 0.46
    );
    addTailShell(
      72.0, 1.65, 5.80, 0.0, 64, 64,
      isInterstellar ? 0x62cdc4 : 0x54b6de,
      0x2f5fc4,
      0.42, 4.8, 0.34
    );

    // 3. Multi-Shell High-Resolution 3D Curved Type-II Synchrone Dust & Volatile Ice Tail
    addTailShell(
      46.0, 1.25, 6.20, 8.2, 60, 64,
      0xfff3d1,
      isInterstellar ? 0xf0d9c8 : 0xe5c89e,
      0.46, 3.8, 0.18
    );
    addTailShell(
      56.0, 2.05, 10.40, 12.6, 60, 64,
      0xf3d9a0,
      isInterstellar ? 0xe0a08f : 0xd6b388,
      0.32, 2.6, 0.13
    );

    // 4. GPU Sunward Outgassing Micro-Jet Particle Stream (960 animated ice/dust grains sweeping into tail!)
    const nJets = 960;
    const seeds = new Float32Array(nJets * 4);
    for (let i = 0; i < nJets; i++) {
      const s1 = ((i * 0.6180339887) % 1.0);
      const s2 = ((i * 0.3819660112 + 0.17) % 1.0);
      const s3 = ((i * 0.7548776662 + 0.43) % 1.0);
      const s4 = ((i * 0.5698402909 + 0.71) % 1.0);
      seeds[i * 4 + 0] = s1;
      seeds[i * 4 + 1] = s2;
      seeds[i * 4 + 2] = s3;
      seeds[i * 4 + 3] = s4;
    }
    const jetGeo = new THREE.BufferGeometry();
    jetGeo.setAttribute("position", new THREE.BufferAttribute(new Float32Array(nJets * 3), 3));
    jetGeo.setAttribute("aSeed", new THREE.BufferAttribute(seeds, 4));
    jetGeo.boundingSphere = new THREE.Sphere(new THREE.Vector3(meshRadius * 20, 0, 0), meshRadius * 52);

    const jetMat = new THREE.ShaderMaterial({
      uniforms: {
        uTime: timeUniform,
        uRadius: { value: meshRadius },
        uTex: { value: getGlowSpriteTexture() },
        uColor: { value: new THREE.Color(isInterstellar ? 0xbfe6ee : 0xfef3c7) },
        uDpr: { value: Math.min(window.devicePixelRatio || 1, 2) }
      },
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      vertexShader: `
        #include <common>
        #include <logdepthbuf_pars_vertex>
        attribute vec4 aSeed;
        uniform float uTime;
        uniform float uRadius;
        uniform float uDpr;
        varying float vAlpha;
        void main() {
          float age = fract(aSeed.x + uTime * (0.08 + 0.09 * aSeed.y));
          float phi = aSeed.z * 6.2831853;
          float spread = (0.32 + 0.95 * aSeed.w);

          // Erupt sunward (-X) from active vents, then turn back (+X) under solar radiation pressure!
          float x = uRadius * (-1.15 * sin(min(1.0, age * 4.5) * 1.57) + 38.0 * pow(age, 1.50));
          float rTrans = uRadius * (0.42 + 5.2 * pow(age, 0.82) * spread);
          float driftZ = uRadius * 6.4 * pow(age, 1.65) * aSeed.w;
          vec3 pos = vec3(x, rTrans * sin(phi), rTrans * cos(phi) + driftZ);

          vAlpha = sin(age * 3.1415926) * (1.0 - 0.58 * age) * 0.68;
          vec4 mv = modelViewMatrix * vec4(pos, 1.0);
          gl_Position = projectionMatrix * mv;
          gl_PointSize = clamp((uRadius * 115.0 / max(0.00005, -mv.z)) * uDpr, 1.4, 4.6 * uDpr);
          #include <logdepthbuf_vertex>
        }
      `,
      fragmentShader: `
        #include <common>
        #include <logdepthbuf_pars_fragment>
        uniform sampler2D uTex;
        uniform vec3 uColor;
        varying float vAlpha;
        void main() {
          #include <logdepthbuf_fragment>
          vec4 t = texture2D(uTex, gl_PointCoord);
          if (t.a < 0.05) discard;
          gl_FragColor = vec4(uColor * t.rgb, t.a * vAlpha);
        }
      `
    });
    const jetPoints = new THREE.Points(jetGeo, jetMat);
    jetPoints.frustumCulled = false;
    tailGroup.add(jetPoints);

    comaGroup.add(tailGroup);
    comaGroup.userData.tailGroup = tailGroup;
  }

  comaGroup.userData.cometTimeUniform = timeUniform;
  return comaGroup;
}

export function computeBodyMeshRadiusScene(obj) {
  if (obj.category === "star") return 0.085;
  // Compact physical scene footprint for artificial spacecraft so L2/LEO satellites never look oversized or clutter planets!
  if (obj.category === "spacecraft" || obj.visual_type?.startsWith("spacecraft")) {
    return obj.parent_id ? 0.000034 : 0.00018;
  }
  const dKm = Math.max(0.05, obj.diameter_km || 10.0);
  if (obj.category === "planets") {
    return 0.0018 * Math.pow(dKm / 2000.0, 0.60);
  }
  if (obj.parent_id) {
    return Math.max(0.000075, Math.min(0.0022, 0.00028 * Math.pow(dKm / 200.0, 0.42)));
  }
  return Math.max(0.00012, Math.min(0.0045, 0.00055 * Math.pow(dKm / 100.0, 0.32)));
}

const _sunOriginTmp = new THREE.Vector3();
let sharedUnitPlaceholderGeom = null;

function getSharedPlaceholderGeometry() {
  if (!sharedUnitPlaceholderGeom) {
    sharedUnitPlaceholderGeom = createQuadsphereGeometry(1.0, 12);
  }
  return sharedUnitPlaceholderGeom;
}

// Strict lazy GLB policy: only SUN loads eagerly; planets/moons/spacecraft/discoveries stream on demand
const EAGER_PRELOAD_IDS = new Set(["SUN"]);

// Apparent size of the Sun's screen-space glare, as a fraction of the viewport height.
export const SUN_GLARE_SCREEN_SIZE = 0.078;

// Apparent beacon size (fraction of viewport height) by kind of body: the eight planets are the
// landmarks of a system-wide view, so they are drawn larger than dwarf planets, and those larger
// than the many asteroids, comets and distant small bodies.
function beaconScreenSize(obj, isChildMoon) {
  if (obj.is_new_discovery) return 0.018;
  if (isChildMoon) return 0.0085;
  if (obj.category === "planets") {
    return obj.id === "JUPITER" || obj.id === "SATURN" ? 0.030 : (obj.id === "URANUS" || obj.id === "NEPTUNE" ? 0.026 : 0.023);
  }
  if (obj.category === "dwarf_planets" || obj.category === "interstellar") return 0.012;
  return 0.0082;
}

export function createProceduralBodyNode(obj) {
  const root = new THREE.Group();
  root.name = `body_${obj.id}`;
  const meshRadius = computeBodyMeshRadiusScene(obj);
  const isSpacecraft = obj.category === "spacecraft" || Boolean(obj.visual_type?.startsWith("spacecraft"));
  root.userData = { obj, meshRadius, isSpacecraft };

  if (obj.visual_type === "sun") {
    const tiltGroup = new THREE.Group();
    applyIAUPoleOrientationToTiltGroup(tiltGroup, obj);
    root.add(tiltGroup);
    const sunGroup = createSunShaderMesh(meshRadius);
    tiltGroup.add(sunGroup);
    root.userData.tiltGroup = tiltGroup;
    root.userData.rotatable = sunGroup;
    root.userData.sunUniforms = sunGroup.userData.sunUniforms;
    // Screen-space glare, so the Sun reads as the system's star from any distance. The corona
    // sprites above are sized in scene units and shrink to a few pixels in system-wide views; this
    // one keeps a constant apparent size and is faded out by the application on close approach.
    const sunGlare = new THREE.Sprite(new THREE.SpriteMaterial({
      map: getGlowSpriteTexture(),
      color: new THREE.Color("#ffe6ae"),
      blending: THREE.AdditiveBlending,
      transparent: true,
      depthWrite: false,
      sizeAttenuation: false,
      opacity: 0.0
    }));
    sunGlare.scale.set(SUN_GLARE_SCREEN_SIZE, SUN_GLARE_SCREEN_SIZE, 1);
    sunGlare.renderOrder = 9;
    root.add(sunGlare);
    root.userData.beaconSprite = sunGlare;
    root.userData.baseBeaconScale = SUN_GLARE_SCREEN_SIZE;
    return root;
  }

  const tiltGroup = new THREE.Group();
  if (isSpacecraft) {
    tiltGroup.rotation.z = (obj.obliquity_deg || 0) * DEG2RAD;
  } else {
    applyIAUPoleOrientationToTiltGroup(tiltGroup, obj);
  }
  root.add(tiltGroup);
  root.userData.tiltGroup = tiltGroup;

  const spinGroup = new THREE.Group();
  tiltGroup.add(spinGroup);
  root.userData.rotatable = spinGroup;

  // Instant shared-geometry procedural placeholder until dedicated .glb streams on demand
  let placeholder = null;
  function ensurePlaceholder() {
    if (isSpacecraft || placeholder) return;
    placeholder = new THREE.Mesh(
      getSharedPlaceholderGeometry(),
      new THREE.MeshStandardMaterial({
        color: new THREE.Color(obj.color || CATEGORY_COLORS[obj.category] || CATEGORY_COLORS.all),
        roughness: 0.85,
        metalness: 0.05
      })
    );
    placeholder.scale.setScalar(meshRadius);
    spinGroup.add(placeholder);
  }
  ensurePlaceholder();

  const modelId = obj.model_id || "kbo_template";
  let enhanced = null;
  let earthCadEnhanced = null;
  let loadStarted = false;

  const earthPrecisionState = {
    cadMode: false,
    demScale: 1.0,
    atmoMode: "physical", // "physical" | "profile" | "bare"
    showClouds: true
  };

  function syncEarthVisualConfig() {
    if (obj.id !== "EARTH") return;
    const useCad = earthPrecisionState.cadMode;
    if (enhanced) {
      enhanced.group.visible = !useCad || !earthCadEnhanced?.group?.userData?.globeMaterial;
      enhanced.demScaleUniform.value = earthPrecisionState.demScale;
      const gMat = enhanced.group.userData.globeMaterial;
      if (gMat && gMat.normalScale) {
        const ns = 0.80 + 0.045 * Math.max(0.0, earthPrecisionState.demScale - 1.0);
        gMat.normalScale.set(ns, ns);
      }
      if (enhanced.group.userData.cloudMesh) {
        enhanced.group.userData.cloudMesh.visible = earthPrecisionState.showClouds && earthPrecisionState.atmoMode !== "bare";
        root.userData.earthCloudMesh = enhanced.group.userData.cloudMesh;
      }
      const atmo = enhanced.group.userData.stratifiedAtmo;
      if (atmo) {
        atmo.visible = earthPrecisionState.atmoMode !== "bare";
        atmo.userData.profileGroup.visible = earthPrecisionState.atmoMode === "profile";
        const gain = earthPrecisionState.atmoMode === "profile" ? 1.18 : 1.0;
        for (const sh of atmo.userData.shells) {
          sh.material.uniforms.uIntensity.value = sh.userData.baseIntensity * gain;
        }
      }
    }
    if (earthCadEnhanced) {
      const cadReady = Boolean(earthCadEnhanced.group.userData.globeMaterial);
      earthCadEnhanced.group.visible = useCad && cadReady;
      if (useCad && cadReady && enhanced) enhanced.group.visible = false;
      earthCadEnhanced.demScaleUniform.value = earthPrecisionState.demScale;
      const cMat = earthCadEnhanced.group.userData.globeMaterial;
      if (cMat && cMat.normalScale) {
        const ns = 1.05 + 0.05 * Math.max(0.0, earthPrecisionState.demScale - 1.0);
        cMat.normalScale.set(ns, ns);
      }
      const cAtmo = earthCadEnhanced.group.userData.stratifiedAtmo;
      if (cAtmo) {
        cAtmo.visible = earthPrecisionState.atmoMode !== "bare";
        cAtmo.userData.profileGroup.visible = earthPrecisionState.atmoMode === "profile";
        const gain = earthPrecisionState.atmoMode === "profile" ? 0.95 : 0.45;
        for (const sh of cAtmo.userData.shells) {
          sh.material.uniforms.uIntensity.value = sh.userData.baseIntensity * gain;
        }
      }
    }
  }

  function ensureModelLoaded() {
    if (loadStarted) return;
    loadStarted = true;
    enhanced = instantiateEnhanced3DBody(modelId, meshRadius);
    spinGroup.add(enhanced.group);
    enhanced.readyPromise
      .then(() => {
        if (!loadStarted) return;
        if (placeholder) {
          spinGroup.remove(placeholder);
          placeholder.material.dispose();
          placeholder = null;
        }
        root.userData.glbReady = true;
        if (obj.id === "EARTH") syncEarthVisualConfig();
      })
      .catch(() => {
        // Keep lightweight placeholder if asset unavailable
      });
  }

  function evictModel() {
    if (!loadStarted || obj.id === "SUN" || obj.category === "planets") return;
    loadStarted = false;
    root.userData.glbReady = false;
    if (enhanced) {
      spinGroup.remove(enhanced.group);
      enhanced.dispose?.();
      enhanced = null;
    }
    if (earthCadEnhanced) {
      spinGroup.remove(earthCadEnhanced.group);
      earthCadEnhanced.dispose?.();
      earthCadEnhanced = null;
    }
    ensurePlaceholder();
  }

  if (obj.id === "EARTH") {
    root.userData.earthPrecisionState = earthPrecisionState;
    root.userData.applyEarthPrecisionConfig = (partial) => {
      Object.assign(earthPrecisionState, partial);
      ensureModelLoaded();
      if (earthPrecisionState.cadMode && !earthCadEnhanced) {
        prioritizeModelLoad("earth_cad_dem");
        earthCadEnhanced = instantiateEnhanced3DBody("earth_cad_dem", meshRadius);
        earthCadEnhanced.group.visible = false;
        spinGroup.add(earthCadEnhanced.group);
        earthCadEnhanced.readyPromise.then(() => {
          syncEarthVisualConfig();
        });
      }
      syncEarthVisualConfig();
    };
  }

  root.userData.ensureModelLoaded = ensureModelLoaded;
  root.userData.evictModel = evictModel;
  if (EAGER_PRELOAD_IDS.has(obj.id)) {
    ensureModelLoaded();
  }

  root.userData.updateShaderSunVectors = (worldPos) => {
    if (!enhanced && !earthCadEnhanced) return;
    if (worldPos.lengthSq() > 1e-12) {
      spinGroup.updateWorldMatrix(true, false);
      _sunOriginTmp.set(0, 0, 0);
      spinGroup.worldToLocal(_sunOriginTmp);
      const hasLocal = _sunOriginTmp.lengthSq() > 1e-12;
      if (hasLocal) _sunOriginTmp.normalize();
      if (enhanced) {
        enhanced.sunDirWorldUniform.value.copy(worldPos).negate().normalize();
        if (hasLocal) enhanced.sunDirLocalUniform.value.copy(_sunOriginTmp);
      }
      if (earthCadEnhanced) {
        earthCadEnhanced.sunDirWorldUniform.value.copy(worldPos).negate().normalize();
        if (hasLocal) earthCadEnhanced.sunDirLocalUniform.value.copy(_sunOriginTmp);
      }
    }
  };

  const vt = obj.visual_type || "asteroid_irregular";

  // High-Resolution 3D Volumetric Coma + Paraboloid Ion Tail + Curved Dust Tail + GPU Jets for Comets & 3I/ATLAS!
  if (obj.is_active || vt === "comet_active" || vt === "chiron_ringed") {
    const comaSys = createVolumetricCometSystem(obj, meshRadius, vt);
    root.add(comaSys);
    if (comaSys.userData.tailGroup) {
      root.userData.tailGroup = comaSys.userData.tailGroup;
    }
    root.userData.cometTimeUniform = comaSys.userData.cometTimeUniform;
  }

  // Physically Hierarchical Distant Beacon Control:
  // - Planets & Primary Heliocentric Discoveries get crisp screen-space beacons.
  // - Natural Moons use NormalBlending (never Additive!) & smaller scale, and fade to 0 when zoomed out so they NEVER outshine or bloom Jupiter/Saturn!
  // - Artificial Spacecraft get ZERO distant beacon in default mode!
  if (!isSpacecraft) {
    const isChildMoon = Boolean(obj.parent_id);
    const beaconMat = new THREE.SpriteMaterial({
      map: getGlowSpriteTexture(),
      color: new THREE.Color(obj.color || CATEGORY_COLORS[obj.category] || CATEGORY_COLORS.all),
      blending: isChildMoon ? THREE.NormalBlending : THREE.AdditiveBlending,
      transparent: true,
      depthWrite: false,
      sizeAttenuation: false,
      opacity: obj.is_new_discovery ? 0.96 : (isChildMoon ? 0.45 : 0.78)
    });
    const beaconSprite = new THREE.Sprite(beaconMat);
    const basePx = beaconScreenSize(obj, isChildMoon);
    beaconSprite.scale.set(basePx, basePx, 1);
    root.add(beaconSprite);
    root.userData.beaconSprite = beaconSprite;
    root.userData.baseBeaconScale = basePx;
  } else {
    // Subtle non-additive 4px telemetry pip shown ONLY when user filters to "spacecraft" or selects this spacecraft!
    const scPipMat = new THREE.SpriteMaterial({
      map: getGlowSpriteTexture(),
      color: new THREE.Color(obj.color || CATEGORY_COLORS.spacecraft),
      blending: THREE.NormalBlending,
      transparent: true,
      depthWrite: false,
      sizeAttenuation: false,
      opacity: 0.0
    });
    const scPip = new THREE.Sprite(scPipMat);
    scPip.scale.set(0.0065, 0.0065, 1);
    scPip.visible = false;
    root.add(scPip);
    root.userData.spacecraftPip = scPip;
  }

  if (obj.is_new_discovery) {
    const retMat = new THREE.SpriteMaterial({
      map: getDiscoveryReticleTexture(),
      color: 0xffffff,
      blending: THREE.AdditiveBlending,
      transparent: true,
      depthWrite: false,
      sizeAttenuation: false,
      opacity: 0.90
    });
    const retSprite = new THREE.Sprite(retMat);
    retSprite.scale.set(0.036, 0.036, 1);
    root.add(retSprite);
    root.userData.discoveryReticle = retSprite;
  }

  return root;
}
