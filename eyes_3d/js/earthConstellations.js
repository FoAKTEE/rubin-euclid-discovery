// 60-FPS GPU Earth Megaconstellation & Global Active Satellite Engine (~16,917 NORAD Satellites)
// Renders ALL active satellites (11,209 Starlinks, OneWeb, Qianfan/Guowang, Kuiper, GNSS, GEO,
// Stations, Space Telescopes, Earth Obs & CubeSats) with real Keplerian+J2 orbits AND spawns
// full 3D .glb CAD spacecraft + orbital rings on demand when any satellite is clicked or searched!

import * as THREE from "../vendor/three.module.js";
import { instantiateEnhanced3DBody, prioritizeModelLoad, ASSET_VERSION } from "./model3dLibrary.js";
import { getGlowSpriteTexture } from "./proceduralBodies.js";
import { OBLIQUITY_J2000_RAD } from "./orbitalMechanics.js";
import { SAT_FAMILY_COLORS_RGB, SAT_FAMILY_COLORS_HEX, CATEGORY_COLORS } from "./colorSystem.js";

const DEG2RAD = Math.PI / 180.0;
const EARTH_RADIUS_KM = 6371.0;

// Preallocated reusable scratch objects (zero per-frame heap allocations)
const _tmpLocalPos = new THREE.Vector3();
const _tmpWorldPos = new THREE.Vector3();
const _tmpProjV = new THREE.Vector3();
const _tmpMvp = new THREE.Matrix4();
const _tmpVp = new THREE.Matrix4();

// Operator-family palette (index order matches scripts/build_spacecraft_and_constellations.py
// FAMILY_DEFS 0..11): restrained observatory blues, teals, steel-ambers and slates from colorSystem.js.
const FAMILY_COLORS_RGB = SAT_FAMILY_COLORS_RGB;

export function mapGeocentricKmToSceneRadius(rKm, earthMeshR) {
  const u = Math.max(1.015, rKm / EARTH_RADIUS_KM);
  return earthMeshR * (1.065 + 0.70 * Math.log(u) + 0.28 * Math.pow(Math.max(0.0, u - 1.0), 0.62));
}

export class EarthConstellationManager {
  constructor(earthRuntime) {
    this.earthRt = earthRuntime;
    this.earthMeshR = earthRuntime ? earthRuntime.node.userData.meshRadius : 0.00547;
    // Dedicated J2000 equatorial frame group matching equatorialToSceneInto (+X=Vernal Equinox, +Y=NCP)
    this.hostGroup = new THREE.Group();
    this.hostGroup.name = "earthJ2000EquatorialFrame";
    this.hostGroup.rotation.x = -OBLIQUITY_J2000_RAD;
    if (earthRuntime?.node) {
      earthRuntime.node.add(this.hostGroup);
    }

    this.rootGroup = new THREE.Group();
    this.rootGroup.name = "globalActiveSatellitesSwarm";
    this.hostGroup.add(this.rootGroup);

    this.loaded = false;
    this.count = 0;
    this.refEpochJD = 2460900.5;
    this.orbitData = null; // Float32Array (count * 8)
    this.metaItems = [];
    this.families = [];
    this.operators = [];
    this.byNorad = new Map();

    // Off-thread ephemeris Web Worker for heavy 22,022-sat picking & search
    this.worker = null;
    this.workerReady = false;
    this._reqSeq = 1;
    this._pendingReqs = new Map();

    // Filter mask: bitmask over families 0..11 (4095 = all 12 families visible)
    this.familyMask = 4095;
    this.enabled = true;

    this.pointsMesh = null;
    this.uniforms = null;

    this.focusedSatIdx = -1;
    this.focused3DHolder = new THREE.Group();
    this.focused3DHolder.visible = false;
    this.hostGroup.add(this.focused3DHolder);
    this.focusedOrbitLine = null;
    this.focusedModelId = null;
    this.focusedEnhanced = null;
  }

  _initWorker() {
    if (typeof Worker === "undefined" || !this.orbitData) return;
    try {
      this.worker = new Worker(new URL("./ephemerisWorker.js", import.meta.url));
      this.worker.onmessage = (ev) => {
        const msg = ev.data;
        if (!msg) return;
        if (msg.type === "ready") {
          this.workerReady = true;
          return;
        }
        const cb = this._pendingReqs.get(msg.reqId);
        if (cb) {
          this._pendingReqs.delete(msg.reqId);
          cb(msg);
        }
      };
      this.worker.onerror = () => {
        this.workerReady = false;
      };
      const copyBuf = this.orbitData.buffer.slice(0);
      this.worker.postMessage(
        {
          type: "init",
          orbitBuffer: copyBuf,
          count: this.count,
          refEpochJD: this.refEpochJD,
          earthMeshR: this.earthMeshR,
          metaItems: this.metaItems,
          operators: this.operators
        },
        [copyBuf]
      );
    } catch (_) {
      this.worker = null;
      this.workerReady = false;
    }
  }

  async load() {
    try {
      const [binResp, metaResp] = await Promise.all([
        fetch(`assets/satellites/active_orbits.bin?v=${ASSET_VERSION}`),
        fetch(`assets/satellites/active_meta.json?v=${ASSET_VERSION}`)
      ]);
      if (!binResp.ok || !metaResp.ok) return false;
      const [buf, meta] = await Promise.all([binResp.arrayBuffer(), metaResp.json()]);

      this.orbitData = new Float32Array(buf);
      this.count = meta.count || Math.floor(this.orbitData.length / 8);
      this.refEpochJD = meta.ref_epoch_jd || 2460905.5;
      this.metaItems = meta.items || [];
      this.families = meta.families || [];
      this.operators = meta.operators || [];
      this.familyCounts = new Int32Array(12);

      for (let i = 0; i < this.metaItems.length; i++) {
        this.byNorad.set(String(this.metaItems[i][0]), i);
        const fId = Math.min(11, Math.max(0, Number(this.metaItems[i][3]) || 0));
        this.familyCounts[fId]++;
      }

      this._buildGPUSwarmPoints();
      this._initWorker();
      this.loaded = true;
      return true;
    } catch (_) {
      return false;
    }
  }

  _buildGPUSwarmPoints() {
    const n = this.count;
    const geom = new THREE.BufferGeometry();

    // Dummy position attribute (actual 3D position computed live in vertex shader!)
    const posDummy = new Float32Array(n * 3);
    const aOrbit1 = new Float32Array(n * 4); // a_km, ecc, inc_rad, raan_rad
    const aOrbit2 = new Float32Array(n * 4); // argp_rad, M0_rad, n_rad_day, family_id
    const aColor = new Float32Array(n * 3);

    for (let i = 0; i < n; i++) {
      const off = i * 8;
      aOrbit1[i * 4 + 0] = this.orbitData[off + 0];
      aOrbit1[i * 4 + 1] = this.orbitData[off + 1];
      aOrbit1[i * 4 + 2] = this.orbitData[off + 2];
      aOrbit1[i * 4 + 3] = this.orbitData[off + 3];

      aOrbit2[i * 4 + 0] = this.orbitData[off + 4];
      aOrbit2[i * 4 + 1] = this.orbitData[off + 5];
      aOrbit2[i * 4 + 2] = this.orbitData[off + 6];
      const fam = Math.min(11, Math.max(0, Math.round(this.orbitData[off + 7])));
      aOrbit2[i * 4 + 3] = fam;

      const rgb = FAMILY_COLORS_RGB[fam] || FAMILY_COLORS_RGB[11];
      aColor[i * 3 + 0] = rgb[0];
      aColor[i * 3 + 1] = rgb[1];
      aColor[i * 3 + 2] = rgb[2];
    }

    geom.setAttribute("position", new THREE.BufferAttribute(posDummy, 3));
    geom.setAttribute("aOrbit1", new THREE.BufferAttribute(aOrbit1, 4));
    geom.setAttribute("aOrbit2", new THREE.BufferAttribute(aOrbit2, 4));
    geom.setAttribute("aColor", new THREE.BufferAttribute(aColor, 3));
    geom.boundingSphere = new THREE.Sphere(new THREE.Vector3(0, 0, 0), this.earthMeshR * 12.0);

    this.uniforms = {
      uDeltaDays: { value: 0.0 },
      uEarthMeshR: { value: this.earthMeshR },
      uPointScale: { value: 2.2 * Math.min(window.devicePixelRatio || 1, 2) },
      uOpacity: { value: 0.88 },
      uSpriteTex: { value: getGlowSpriteTexture() },
      uFamilyMask: { value: this.familyMask }
    };

    const mat = new THREE.ShaderMaterial({
      uniforms: this.uniforms,
      vertexShader: `
        #include <common>
        #include <logdepthbuf_pars_vertex>
        attribute vec4 aOrbit1;
        attribute vec4 aOrbit2;
        attribute vec3 aColor;
        uniform float uDeltaDays;
        uniform float uEarthMeshR;
        uniform float uPointScale;
        uniform int uFamilyMask;
        varying vec3 vColor;
        varying float vVisible;

        void main() {
          int fam = int(aOrbit2.w + 0.5);
          int bit = 1 << fam;
          if ((uFamilyMask & bit) == 0) {
            vVisible = 0.0;
            gl_Position = vec4(2.0, 2.0, 2.0, 1.0);
            gl_PointSize = 0.0;
            return;
          }
          vVisible = 1.0;
          vColor = aColor;

          float aKm = aOrbit1.x;
          float ecc = aOrbit1.y;
          float inc = aOrbit1.z;
          float raan0 = aOrbit1.w;
          float argp0 = aOrbit2.x;
          float m0 = aOrbit2.y;
          float nRadDay = aOrbit2.z;

          // J2 secular nodal regression & perigee advance around oblate Earth
          float ratio = 6378.137 / max(6450.0, aKm);
          float j2Rate = 9.964 * pow(ratio, 3.5) * 0.0174532925;
          float cosI = cos(inc);
          float raan = raan0 - j2Rate * cosI * uDeltaDays;
          float argp = argp0 + 0.5 * j2Rate * (5.0 * cosI * cosI - 1.0) * uDeltaDays;

          float M = mod(m0 + nRadDay * uDeltaDays, 6.28318530718);
          // 5-iteration Newton-Raphson Kepler solver (accurate even for Molniya/Tundra/HEO e > 0.74!)
          float E = ecc < 0.75 ? (M + ecc * sin(M)) : M;
          for (int it = 0; it < 5; it++) {
            E = E - (E - ecc * sin(E) - M) / max(0.02, 1.0 - ecc * cos(E));
          }

          float cosE = cos(E);
          float sinE = sin(E);
          float sqrt1me2 = sqrt(max(0.0, 1.0 - ecc * ecc));
          float xOrb = aKm * (cosE - ecc);
          float yOrb = aKm * sqrt1me2 * sinE;
          float rKm = max(6460.0, length(vec2(xOrb, yOrb)));

          float cosO = cos(raan), sinO = sin(raan);
          float cosW = cos(argp), sinW = sin(argp);
          float sinI = sin(inc);

          vec3 pVec = vec3(
            cosO * cosW - sinO * sinW * cosI,
            sinW * sinI,
            -(sinO * cosW + cosO * sinW * cosI)
          );
          vec3 qVec = vec3(
            -cosO * sinW - sinO * cosW * cosI,
            cosW * sinI,
            -(-sinO * sinW + cosO * cosW * cosI)
          );

          vec3 dirUnit = normalize(pVec * xOrb + qVec * yOrb);
          float u = max(1.015, rKm / 6371.0);
          float rScene = uEarthMeshR * (1.065 + 0.70 * log(u) + 0.28 * pow(max(0.0, u - 1.0), 0.62));
          vec3 localPos = dirUnit * rScene;

          vec4 mvPosition = modelViewMatrix * vec4(localPos, 1.0);
          gl_Position = projectionMatrix * mvPosition;
          // Boost Space Stations (9) & Telescopes (10) slightly in point size
          float famBoost = (fam == 9 || fam == 10) ? 1.55 : (fam == 7 || fam == 8 ? 1.20 : 1.0);
          gl_PointSize = uPointScale * famBoost;
          #include <logdepthbuf_vertex>
        }
      `,
      fragmentShader: `
        #include <common>
        #include <logdepthbuf_pars_fragment>
        uniform sampler2D uSpriteTex;
        uniform float uOpacity;
        varying vec3 vColor;
        varying float vVisible;
        void main() {
          if (vVisible < 0.5) discard;
          #include <logdepthbuf_fragment>
          vec4 tex = texture2D(uSpriteTex, gl_PointCoord);
          if (tex.a < 0.04) discard;
          gl_FragColor = vec4(vColor * (0.85 + 0.45 * tex.r), tex.a * uOpacity);
        }
      `,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending
    });

    this.pointsMesh = new THREE.Points(geom, mat);
    this.pointsMesh.frustumCulled = false;
    this.pointsMesh.renderOrder = 4;
    this.rootGroup.add(this.pointsMesh);
  }

  setFamilyMask(mask) {
    this.familyMask = mask;
    if (this.uniforms) this.uniforms.uFamilyMask.value = mask;
  }

  setEnabled(flag) {
    this.enabled = Boolean(flag);
    this.rootGroup.visible = this.enabled;
  }

  computeSatLocalPosition(satIdx, simJD, outVec3) {
    if (!this.orbitData || satIdx < 0 || satIdx >= this.count) return outVec3.set(0, 0, 0);
    const off = satIdx * 8;
    const aKm = this.orbitData[off + 0];
    const ecc = this.orbitData[off + 1];
    const inc = this.orbitData[off + 2];
    const raan0 = this.orbitData[off + 3];
    const argp0 = this.orbitData[off + 4];
    const m0 = this.orbitData[off + 5];
    const nRadDay = this.orbitData[off + 6];

    const dtDays = simJD - this.refEpochJD;
    const ratio = 6378.137 / Math.max(6450.0, aKm);
    const j2Rate = 9.964 * Math.pow(ratio, 3.5) * DEG2RAD;
    const cosI = Math.cos(inc), sinI = Math.sin(inc);
    const raan = raan0 - j2Rate * cosI * dtDays;
    const argp = argp0 + 0.5 * j2Rate * (5.0 * cosI * cosI - 1.0) * dtDays;

    let M = (m0 + nRadDay * dtDays) % (Math.PI * 2);
    if (M < 0) M += Math.PI * 2;
    let E = ecc < 0.75 ? (M + ecc * Math.sin(M)) : M;
    for (let it = 0; it < 6; it++) {
      E -= (E - ecc * Math.sin(E) - M) / Math.max(0.015, 1.0 - ecc * Math.cos(E));
    }

    const xOrb = aKm * (Math.cos(E) - ecc);
    const yOrb = aKm * Math.sqrt(Math.max(0, 1.0 - ecc * ecc)) * Math.sin(E);
    const rKm = Math.max(6460.0, Math.hypot(xOrb, yOrb));

    const cosO = Math.cos(raan), sinO = Math.sin(raan);
    const cosW = Math.cos(argp), sinW = Math.sin(argp);

    const px = (cosO * cosW - sinO * sinW * cosI) * xOrb + (-cosO * sinW - sinO * cosW * cosI) * yOrb;
    const py = (sinW * sinI) * xOrb + (cosW * sinI) * yOrb;
    const pz = -(sinO * cosW + cosO * sinW * cosI) * xOrb - (-sinO * sinW + cosO * cosW * cosI) * yOrb;

    const len = Math.hypot(px, py, pz) || 1.0;
    const rScene = mapGeocentricKmToSceneRadius(rKm, this.earthMeshR);
    return outVec3.set((px / len) * rScene, (py / len) * rScene, (pz / len) * rScene);
  }

  updatePerFrame(simJD, camera, activeCategory) {
    if (!this.loaded || !this.uniforms || !this.earthRt) return;
    const shouldShow =
      this.enabled &&
      (activeCategory === "all" || activeCategory === "spacecraft" || activeCategory === "starlink_sats" || activeCategory === "moons_l2" || activeCategory === "planets");
    this.rootGroup.visible = shouldShow;

    if (shouldShow) {
      this.uniforms.uDeltaDays.value = simJD - this.refEpochJD;
      const distToEarth = camera.position.distanceTo(this.earthRt.worldPos);
      const ratioE = distToEarth / Math.max(1e-6, this.earthMeshR);
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const explicitSatView = activeCategory === "starlink_sats" || activeCategory === "spacecraft";
      if (!explicitSatView && ratioE > 24.0) {
        // When zoomed out past 24 Earth radii in default mode, hide 22,022 additive satellite dots so ONLY bright Earth shines!
        this.pointsMesh.visible = false;
      } else {
        this.pointsMesh.visible = true;
        if (ratioE < 14.0) {
          this.uniforms.uPointScale.value = 3.1 * dpr;
          this.uniforms.uOpacity.value = 0.88;
        } else if (!explicitSatView) {
          const fade = 1.0 - (ratioE - 14.0) / 10.0;
          this.uniforms.uPointScale.value = (1.6 + 1.5 * fade) * dpr;
          this.uniforms.uOpacity.value = 0.88 * Math.max(0.0, fade * fade);
        } else {
          this.uniforms.uPointScale.value = (ratioE < 80.0 ? 2.1 : 1.3) * dpr;
          this.uniforms.uOpacity.value = ratioE < 80.0 ? 0.72 : 0.42;
        }
      }
    }

    // Update focused individual constellation satellite 3D .glb node if active (zero allocations)
    if (this.focusedSatIdx >= 0 && this.focused3DHolder.visible) {
      this.computeSatLocalPosition(this.focusedSatIdx, simJD, _tmpLocalPos);
      this.focused3DHolder.position.copy(_tmpLocalPos);
      if (this.focusedOrbitLine) {
        const posAttr = this.focusedOrbitLine.geometry.attributes.position;
        this.fillSatOsculatingOrbit(this.focusedSatIdx, simJD, posAttr.array);
        posAttr.needsUpdate = true;
      }
      this.hostGroup.updateWorldMatrix(true, false);
      this.focused3DHolder.lookAt(this.earthRt.worldPos);
      this.focused3DHolder.rotateZ(0.65);
      if (this.focusedEnhanced) {
        this.focused3DHolder.getWorldPosition(_tmpWorldPos);
        this.focusedEnhanced.sunDirWorldUniform.value.copy(_tmpWorldPos).negate().normalize();
      }
    }
    if (this.selectedOrbitLine?.visible && this._selectedOrbitSatIdx >= 0) {
      const posAttr = this.selectedOrbitLine.geometry.attributes.position;
      this.fillSatOsculatingOrbit(this._selectedOrbitSatIdx, simJD, posAttr.array);
      posAttr.needsUpdate = true;
    }
    if (this.hoveredOrbitLine?.visible && this._hoveredOrbitSatIdx >= 0) {
      const posAttr = this.hoveredOrbitLine.geometry.attributes.position;
      this.fillSatOsculatingOrbit(this._hoveredOrbitSatIdx, simJD, posAttr.array);
      posAttr.needsUpdate = true;
    }
  }

  searchSatellites(queryStr, limit = 12) {
    if (!this.loaded || !queryStr) return [];
    const q = queryStr.trim().toUpperCase();
    if (q.length < 2) return [];
    const results = [];
    for (let i = 0; i < this.metaItems.length; i++) {
      const m = this.metaItems[i];
      const noradStr = String(m[0]);
      const nameStr = m[1].toUpperCase();
      const opStr = (this.operators[m[7]] || "").toUpperCase();
      if (nameStr.includes(q) || noradStr === q || opStr.includes(q) || (m[2] && m[2].toUpperCase().includes(q))) {
        results.push(this.buildSyntheticCatalogObject(i));
        if (results.length >= limit) break;
      }
    }
    return results;
  }

  searchSatellitesAsync(queryStr, limit = 10) {
    if (!this.loaded || !queryStr || queryStr.trim().length < 2) return Promise.resolve([]);
    if (!this.worker || !this.workerReady) {
      return Promise.resolve(this.searchSatellites(queryStr, limit));
    }
    return new Promise((resolve) => {
      const reqId = this._reqSeq++;
      this._pendingReqs.set(reqId, (msg) => {
        const list = (msg.indices || []).map((idx) => this.buildSyntheticCatalogObject(idx));
        resolve(list);
      });
      this.worker.postMessage({ type: "search", reqId, query: queryStr, limit });
    });
  }

  getActiveVisibleSatelliteCount() {
    if (!this.loaded || !this.rootGroup.visible || !this.pointsMesh?.visible || !this.familyCounts) return 0;
    let total = 0;
    for (let f = 0; f < 12; f++) {
      if ((this.familyMask >> f) & 1) total += this.familyCounts[f];
    }
    return total;
  }

  // Returns true when >= 50% of the projected satellite orbital zone around Earth is uncovered by satellite dots
  isUncoveredAreaAtLeast50Pct(earthBodyPxRadius) {
    const nVis = this.getActiveVisibleSatelliteCount();
    if (nVis <= 0) return true;
    const zoneArea = Math.PI * Math.pow(Math.max(1.0, earthBodyPxRadius * 1.35), 2);
    const dotArea = Math.PI * 2.2 * 2.2;
    const coveredExponent = (0.42 * nVis * dotArea) / zoneArea;
    return coveredExponent <= Math.LN2;
  }

  pickNearestAtScreenXYAsync(clientX, clientY, camera, simJD, opts = {}) {
    if (!this.loaded || !this.rootGroup.visible || !this.pointsMesh?.visible || !this.earthRt) {
      return Promise.resolve(null);
    }
    const distToEarth = camera.position.distanceTo(this.earthRt.worldPos);
    if (distToEarth > 0.35) return Promise.resolve(null);
    if (!this.worker || !this.workerReady) {
      return Promise.resolve(this.pickNearestAtScreenXY(clientX, clientY, camera, simJD, opts));
    }
    this.hostGroup.updateWorldMatrix(true, false);
    _tmpVp.multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse);
    _tmpMvp.multiplyMatrices(_tmpVp, this.hostGroup.matrixWorld);
    _tmpWorldPos.copy(camera.position);
    this.hostGroup.worldToLocal(_tmpWorldPos);
    const cursorOnEarthDisk = Boolean(opts.cursorOnEarthDisk);
    const maxDistPx = opts.maxDistPx || (cursorOnEarthDisk ? 7.5 : 13.0);

    return new Promise((resolve) => {
      const reqId = this._reqSeq++;
      this._pendingReqs.set(reqId, (msg) => {
        resolve(msg.satIdx >= 0 ? this.buildSyntheticCatalogObject(msg.satIdx) : null);
      });
      this.worker.postMessage({
        type: "pick",
        reqId,
        clientX,
        clientY,
        width: window.innerWidth,
        height: window.innerHeight,
        simJD,
        familyMask: this.familyMask,
        mvpElements: Array.from(_tmpMvp.elements),
        maxDistPx,
        cursorOnEarthDisk,
        camLocalX: _tmpWorldPos.x,
        camLocalY: _tmpWorldPos.y,
        camLocalZ: _tmpWorldPos.z,
        earthR2: this.earthMeshR * this.earthMeshR
      });
    });
  }

  pickNearestAtScreenXY(clientX, clientY, camera, simJD, opts = {}) {
    if (!this.loaded || !this.rootGroup.visible || !this.pointsMesh?.visible || !this.earthRt) return null;
    const distToEarth = camera.position.distanceTo(this.earthRt.worldPos);
    if (distToEarth > 0.35) return null;

    this.hostGroup.updateWorldMatrix(true, false);
    const matWorld = this.hostGroup.matrixWorld;
    _tmpWorldPos.copy(camera.position);
    this.hostGroup.worldToLocal(_tmpWorldPos);
    const camLX = _tmpWorldPos.x, camLY = _tmpWorldPos.y, camLZ = _tmpWorldPos.z;
    const cursorOnEarthDisk = Boolean(opts.cursorOnEarthDisk);
    const minDot = this.earthMeshR * this.earthMeshR;
    const w = window.innerWidth, h = window.innerHeight;

    let bestIdx = -1;
    let bestPx = opts.maxDistPx || (cursorOnEarthDisk ? 7.5 : 12.0);

    for (let i = 0; i < this.count; i++) {
      const fam = Math.min(11, Math.max(0, Math.round(this.orbitData[i * 8 + 7])));
      if (((this.familyMask >> fam) & 1) === 0) continue;
      this.computeSatLocalPosition(i, simJD, _tmpLocalPos);
      if (cursorOnEarthDisk && (_tmpLocalPos.x * camLX + _tmpLocalPos.y * camLY + _tmpLocalPos.z * camLZ < minDot)) {
        continue;
      }
      _tmpProjV.copy(_tmpLocalPos).applyMatrix4(matWorld).project(camera);
      _tmpProjV.copy(_tmpLocalPos).applyMatrix4(matWorld).project(camera);
      if (_tmpProjV.z < -1.0 || _tmpProjV.z > 1.0) continue;
      const sx = (_tmpProjV.x * 0.5 + 0.5) * w;
      const sy = (-_tmpProjV.y * 0.5 + 0.5) * h;
      const d = Math.hypot(sx - clientX, sy - clientY);
      if (d < bestPx) {
        bestPx = d;
        bestIdx = i;
      }
    }
    return bestIdx >= 0 ? this.buildSyntheticCatalogObject(bestIdx) : null;
  }

  buildSyntheticCatalogObject(satIdx) {
    const m = this.metaItems[satIdx];
    const [norad, name, cospar, famId, perigeeKm, apogeeKm, incDeg, opIdx] = m;
    const operatorName = this.operators[opIdx] || "Global Orbital Catalog";
    const off = satIdx * 8;
    const aKm = this.orbitData[off + 0];
    const ecc = this.orbitData[off + 1];
    const raanDeg = (this.orbitData[off + 3] / DEG2RAD + 360) % 360;
    const argpDeg = (this.orbitData[off + 4] / DEG2RAD + 360) % 360;
    const nRadDay = this.orbitData[off + 6];
    const periodMin = (2.0 * Math.PI / Math.max(1e-4, nRadDay)) * 1440.0;

    const famDef = this.families[famId] || {
      name_en: "Active Earth Satellite",
      color: CATEGORY_COLORS.spacecraft,
      model_id: "sc_starlink"
    };

    const uName = name.toUpperCase();
    const uOp = operatorName.toUpperCase();
    let resolvedModelId = famDef.model_id;

    // Exact mission/bus 3D CAD .glb resolver across SpaceX, CNSA/China commercial, NASA, ESA & global commercial fleets!
    if (uName.includes("ISS") || uName.includes("ZARYA") || uName.includes("NAUKA")) resolvedModelId = "sc_iss";
    else if (uName.includes("TIANHE") || uName.includes("TIANGONG") || uName === "CSS" || uName.startsWith("CSS (TIANHE")) resolvedModelId = "sc_tiangong";
    else if (uName.includes("WENTIAN") || uName.includes("MENGTIAN")) resolvedModelId = "sc_wentian";
    else if (uName.includes("SHENZHOU")) resolvedModelId = "sc_shenzhou";
    else if (uName.includes("TIANZHOU")) resolvedModelId = "sc_tianzhou";
    else if (uName.includes("SOYUZ")) resolvedModelId = "sc_soyuz";
    else if (uName.includes("PROGRESS")) resolvedModelId = "sc_progress";
    else if (uName.includes("STARSHIP")) resolvedModelId = "sc_starship";
    else if (uName.includes("CREW DRAGON") || uName.includes("POLARIS") || uName.includes("FRAM2") || uName.includes("AXIOM")) resolvedModelId = "sc_crew_dragon";
    else if (uName.includes("DRAGON")) resolvedModelId = "sc_cargo_dragon";
    else if (uName.includes("FALCON")) resolvedModelId = "sc_falcon_stage2";
    else if (uName.includes("STARLINK")) {
      const slNum = parseInt((uName.match(/STARLINK[- ]*(\d+)/) || [])[1] || "30000", 10);
      resolvedModelId = slNum < 6000 ? "sc_starlink_v1" : "sc_starlink";
    } else if (uName.includes("STARSHIELD") || (famId === 1 && uName.startsWith("USA "))) resolvedModelId = "sc_starlink";
    else if (uName.includes("SPACEBEE") || uName.includes("SWARM")) resolvedModelId = "sc_swarm";
    else if (uName.includes("BLUEWALKER") || uName.includes("BLUEBIRD")) resolvedModelId = "sc_ast_bluebird";
    else if (uName.includes("ONEWEB")) resolvedModelId = "sc_oneweb";
    else if (uName.includes("QIANFAN") || uName.includes("HULIANWANG") || uName.includes("GUOWANG") || uName.includes("KUIPER") || uName.includes("GEESPACE") || uName.includes("YINHE")) resolvedModelId = "sc_qianfan_kuiper";
    else if (uName.includes("IRIDIUM")) resolvedModelId = "sc_iridium_globalstar";
    else if (uName.includes("GLOBALSTAR")) resolvedModelId = "sc_globalstar";
    else if (uName.includes("HAWKEYE")) resolvedModelId = "sc_hawkeye360";
    else if (uName.includes("O3B")) resolvedModelId = "sc_o3b";
    else if (uName.includes("VIASAT")) resolvedModelId = "sc_viasat3";
    else if (uName.includes("INMARSAT")) resolvedModelId = "sc_inmarsat";
    else if (uName.includes("CHINASAT") || uName.includes("ZHONGXING") || uName.includes("TIANTONG") || uName.includes("TIANLIAN") || uName.includes("APSTAR") || uName.includes("SINOSAT")) resolvedModelId = "sc_dfh4_geo";
    else if (uName.includes("BEIDOU") || uName.startsWith("BD-")) {
      resolvedModelId = apogeeKm > 30000 ? "sc_beidou_igso" : "sc_beidou_meo";
    } else if (uName.includes("NAVSTAR") || uName.includes("GPS ")) resolvedModelId = "sc_gps_iii";
    else if (uName.includes("GALILEO") || uName.includes("GSAT0")) resolvedModelId = "sc_galileo_foc";
    else if (uName.includes("GLONASS") || uName.includes("COSMOS 25")) resolvedModelId = "sc_glonass_k";
    else if (uName.includes("FENGYUN 3") || uName.includes("FY-3")) resolvedModelId = "sc_fengyun3";
    else if (uName.includes("FENGYUN") || uName.includes("FY-2") || uName.includes("FY-4")) resolvedModelId = "sc_fengyun2";
    else if (uName.includes("GAOFEN") || uName.includes("YAOGAN") || uName.includes("JILIN") || uName.includes("TAIJING") || uName.includes("YUNYAO") || uName.includes("SHIJIAN")) resolvedModelId = "sc_gaofen";
    else if (uName.includes("CBERS") || uName.includes("ZIYUAN")) resolvedModelId = "sc_cbers4";
    else if (uName.includes("HXMT") || uName.includes("HUIYAN")) resolvedModelId = "sc_hxmt";
    else if (uName.includes("DAMPE") || uName.includes("WUKONG")) resolvedModelId = "sc_dampe";
    else if (uName.includes("SVOM")) resolvedModelId = "sc_svom";
    else if (uName.includes("CSES") || uName.includes("ZHANGHENG")) resolvedModelId = "sc_cses";
    else if (uName.includes("EINSTEIN")) resolvedModelId = "sc_einstein_probe";
    else if (uName.includes("HST") || uName.includes("HUBBLE")) resolvedModelId = "sc_hubble";
    else if (uName.includes("CHANDRA") || uName.includes("CXO")) resolvedModelId = "sc_chandra";
    else if (uName.includes("XMM")) resolvedModelId = "sc_xmm_newton";
    else if (uName.includes("INTEGRAL")) resolvedModelId = "sc_integral";
    else if (uName.includes("FERMI") || uName.includes("GLAST")) resolvedModelId = "sc_fermi_swift";
    else if (uName.includes("SWIFT")) resolvedModelId = "sc_swift";
    else if (uName.includes("NUSTAR")) resolvedModelId = "sc_nustar";
    else if (uName.includes("TESS")) resolvedModelId = "sc_tess";
    else if (uName.includes("IXPE")) resolvedModelId = "sc_ixpe";
    else if (uName.includes("SDO")) resolvedModelId = "sc_sdo";
    else if (uName.includes("GOES")) resolvedModelId = "sc_goes_geo";
    else if (uName.includes("LANDSAT")) resolvedModelId = "sc_landsat9";
    else if (uName.includes("SENTINEL-1")) resolvedModelId = "sc_sentinel1";
    else if (uName.includes("SENTINEL-2") || uName.includes("SENTINEL-3")) resolvedModelId = "sc_sentinel2";
    else if (uName.includes("SENTINEL-6")) resolvedModelId = "sc_sentinel6";
    else if (uName.includes("SWOT")) resolvedModelId = "sc_swot";
    else if (uName.includes("NISAR")) resolvedModelId = "sc_nisar";
    else if (uName.includes("ICESAT")) resolvedModelId = "sc_icesat2";
    else if (uName.includes("ICEYE")) resolvedModelId = "sc_iceye";
    else if (uName.includes("UMBRA")) resolvedModelId = "sc_umbra";
    else if (uName.includes("QPS-SAR") || uName.includes("IZANAGI") || uName.includes("IZANAMI")) resolvedModelId = "sc_qps_sar";
    else if (uName.includes("CAPELLA") || uName.includes("STRIX") || uName.includes("RADARSAT")) resolvedModelId = "sc_sar_commercial";
    else if (uName.includes("WORLDVIEW") || uName.includes("LEGION") || uName.includes("GEOEYE")) resolvedModelId = "sc_worldview";
    else if (uName.includes("SKYSAT")) resolvedModelId = "sc_skysat";
    else if (uName.includes("PELICAN")) resolvedModelId = "sc_planet_pelican";
    else if (uName.includes("BLACKSKY")) resolvedModelId = "sc_blacksky";
    else if (uName.includes("NEWSAT") || uName.includes("ALE-")) resolvedModelId = "sc_satellogic";
    else if (uName.includes("FLOCK") || uName.includes("DOVE") || uName.includes("LEMUR") || uName.includes("TIANQI")) resolvedModelId = "sc_cubesat_6u";
    else if (uName.includes("CUBE") || perigeeKm < 620 && famId === 11) resolvedModelId = "sc_cubesat_3u";
    else if (apogeeKm > 30000 && (uOp.includes("CHINA") || uOp.includes("CNSA") || uOp.includes("CASC"))) resolvedModelId = "sc_dfh4_geo";
    else if (apogeeKm > 30000) resolvedModelId = "sc_geo_comm";

    const AU_KM = 149597870.7;
    const catBadgeStr = norad >= 900000 ? `GCAT ${cospar}` : `NORAD ${norad}`;
    return {
      id: `NORAD_${norad}`,
      is_constellation_sat: true,
      sat_index: satIdx,
      norad_id: norad,
      cospar_id: cospar,
      model_id: resolvedModelId,
      parent_id: "EARTH",
      name: `${name} (${catBadgeStr})`,
      name_en: `${name} (${catBadgeStr})`,
      category: "starlink_sats",
      secondary_categories: ["spacecraft"],
      visual_type: "spacecraft_constellation",
      is_new_discovery: false,
      has_rings: false,
      is_active: false,
      a_au: aKm / AU_KM,
      q_au: (aKm * (1.0 - ecc)) / AU_KM,
      Q_au: (aKm * (1.0 + ecc)) / AU_KM,
      e: ecc,
      i_deg: incDeg,
      Omega_deg: raanDeg,
      omega_deg: argpDeg,
      varpi_deg: (raanDeg + argpDeg) % 360,
      r_au: aKm / AU_KM,
      period_days: periodMin / 1440.0,
      period_yr: periodMin / 525960.0,
      diameter_km: famId === 9 ? 0.065 : (famId <= 1 ? 0.018 : 0.008),
      diameter_label_en: `${perigeeKm.toLocaleString()} × ${apogeeKm.toLocaleString()} km alt (${periodMin.toFixed(1)} min)`,
      H_mag: null,
      color: SAT_FAMILY_COLORS_HEX[famId] || CATEGORY_COLORS.spacecraft,
      science: {
        telescopes: [operatorName, catBadgeStr, cospar || "LEO/GEO", "CelesTrak + McDowell GCAT"],
        headline_en: `${operatorName} · ${famDef.name_en} · ${perigeeKm}×${apogeeKm} km · i = ${incDeg}°`,
        summary_en: `In-orbit spacecraft ${name} (${catBadgeStr}, Operator: ${operatorName}) propagated in 3D with J2 secular nodal regression around oblate Earth.`,
        metrics: {}
      }
    };
  }

  focusSatellite3D(satObj, simJD) {
    const satIdx = satObj.sat_index;
    this.focusedSatIdx = satIdx;
    this.focused3DHolder.visible = true;

    const meshR = 0.000036;
    this.focused3DHolder.userData.meshRadius = meshR;

    // Load or swap 3D .glb spacecraft model for this satellite (dispose old cleanly)
    if (this.focusedModelId !== satObj.model_id) {
      if (this.focusedEnhanced) {
        this.focused3DHolder.remove(this.focusedEnhanced.group);
        this.focusedEnhanced.dispose?.();
        this.focusedEnhanced = null;
      }
      while (this.focused3DHolder.children.length > 0) {
        this.focused3DHolder.remove(this.focused3DHolder.children[0]);
      }
      this.focusedModelId = satObj.model_id;
      prioritizeModelLoad(satObj.model_id);
      this.focusedEnhanced = instantiateEnhanced3DBody(satObj.model_id, meshR);
      this.focused3DHolder.add(this.focusedEnhanced.group);
    }

    // Build crisp 3D orbital ellipse around Earth for the selected satellite!
    if (this.focusedOrbitLine) {
      this.hostGroup.remove(this.focusedOrbitLine);
      this.focusedOrbitLine.geometry.dispose();
      this.focusedOrbitLine.material.dispose();
    }
    const steps = 384;
    const orbArr = new Float32Array(steps * 3);
    this.fillSatOsculatingOrbit(satIdx, simJD, orbArr);
    const orbGeo = new THREE.BufferGeometry();
    const orbAttr = new THREE.BufferAttribute(orbArr, 3);
    orbAttr.setUsage(THREE.DynamicDrawUsage);
    orbGeo.setAttribute("position", orbAttr);
    const orbMat = new THREE.LineBasicMaterial({
      color: new THREE.Color(satObj.color || CATEGORY_COLORS.spacecraft),
      transparent: true,
      opacity: 0.92,
      depthWrite: false
    });
    this.focusedOrbitLine = new THREE.LineLoop(orbGeo, orbMat);
    this.focusedOrbitLine.frustumCulled = false;
    this.hostGroup.add(this.focusedOrbitLine);

    const localNow = new THREE.Vector3();
    this.computeSatLocalPosition(satIdx, simJD, localNow);
    this.focused3DHolder.position.copy(localNow);
    this.hostGroup.updateWorldMatrix(true, false);
    const worldPos = localNow.clone().applyMatrix4(this.hostGroup.matrixWorld);
    return { worldPos, meshRadius: meshR };
  }

  getFocusedWorldPosition(outVec3) {
    if (this.focusedSatIdx < 0 || !this.focused3DHolder.visible) return null;
    this.hostGroup.updateWorldMatrix(true, false);
    return outVec3.copy(this.focused3DHolder.position).applyMatrix4(this.hostGroup.matrixWorld);
  }

  clearFocusedSatellite() {
    this.focusedSatIdx = -1;
    this.focused3DHolder.visible = false;
    if (this.focusedOrbitLine) {
      this.hostGroup.remove(this.focusedOrbitLine);
      this.focusedOrbitLine.geometry.dispose();
      this.focusedOrbitLine.material.dispose();
      this.focusedOrbitLine = null;
    }
  }

  fillSatOsculatingOrbit(satIdx, simJD, outArr) {
    if (!this.orbitData || satIdx < 0 || satIdx >= this.count) return;
    const off = satIdx * 8;
    const aKm = this.orbitData[off + 0];
    const ecc = this.orbitData[off + 1];
    const inc = this.orbitData[off + 2];
    const raan0 = this.orbitData[off + 3];
    const argp0 = this.orbitData[off + 4];
    const m0 = this.orbitData[off + 5];
    const nRadDay = this.orbitData[off + 6];

    const dtDays = simJD - this.refEpochJD;
    const ratio = 6378.137 / Math.max(6450.0, aKm);
    const j2Rate = 9.964 * Math.pow(ratio, 3.5) * DEG2RAD;
    const cosI = Math.cos(inc), sinI = Math.sin(inc);
    const raan = raan0 - j2Rate * cosI * dtDays;
    const argp = argp0 + 0.5 * j2Rate * (5.0 * cosI * cosI - 1.0) * dtDays;

    let M = (m0 + nRadDay * dtDays) % (Math.PI * 2);
    if (M < 0) M += Math.PI * 2;
    let Enow = ecc < 0.75 ? (M + ecc * Math.sin(M)) : M;
    for (let it = 0; it < 6; it++) {
      Enow -= (Enow - ecc * Math.sin(Enow) - M) / Math.max(0.015, 1.0 - ecc * Math.cos(Enow));
    }

    const bFac = Math.sqrt(Math.max(0, 1.0 - ecc * ecc));
    const cosO = Math.cos(raan), sinO = Math.sin(raan);
    const cosW = Math.cos(argp), sinW = Math.sin(argp);
    const Px = cosO * cosW - sinO * sinW * cosI;
    const Qx = -cosO * sinW - sinO * cosW * cosI;
    const Py = sinW * sinI;
    const Qy = cosW * sinI;
    const Pz = -(sinO * cosW + cosO * sinW * cosI);
    const Qz = -(-sinO * sinW + cosO * cosW * cosI);

    const steps = (outArr.length / 3) | 0;
    for (let k = 0; k < steps; k++) {
      const phi = (Math.PI * 2 * k) / steps - Math.PI; // phi === 0 at k === steps / 2 -> E === Enow
      const E = Enow + phi - 0.88 * Math.sin(phi);
      const xOrb = aKm * (Math.cos(E) - ecc);
      const yOrb = aKm * bFac * Math.sin(E);
      const rKm = Math.max(6460.0, Math.hypot(xOrb, yOrb));
      const px = Px * xOrb + Qx * yOrb;
      const py = Py * xOrb + Qy * yOrb;
      const pz = Pz * xOrb + Qz * yOrb;
      const len = Math.hypot(px, py, pz) || 1.0;
      const rScene = mapGeocentricKmToSceneRadius(rKm, this.earthMeshR);
      const scale = rScene / len;
      outArr[k * 3 + 0] = px * scale;
      outArr[k * 3 + 1] = py * scale;
      outArr[k * 3 + 2] = pz * scale;
    }
  }

  _updateSingleHighlightLine(lineProp, idxProp, satObj, colorHex, simJD) {
    if (!satObj || !satObj.is_constellation_sat || !this.orbitData || satObj.sat_index === this.focusedSatIdx) {
      if (this[lineProp]) {
        this[lineProp].visible = false;
      }
      this[idxProp] = -1;
      return;
    }
    const satIdx = satObj.sat_index;
    const steps = 384;
    if (!this[lineProp]) {
      const geo = new THREE.BufferGeometry();
      const posAttr = new THREE.BufferAttribute(new Float32Array(steps * 3), 3);
      posAttr.setUsage(THREE.DynamicDrawUsage);
      geo.setAttribute("position", posAttr);
      const mat = new THREE.LineBasicMaterial({
        color: new THREE.Color(colorHex),
        transparent: true,
        opacity: 0.94,
        depthWrite: false
      });
      this[lineProp] = new THREE.LineLoop(geo, mat);
      this[lineProp].frustumCulled = false;
      this.hostGroup.add(this[lineProp]);
      this[idxProp] = -1;
    }
    this[lineProp].material.color.set(colorHex);
    this[lineProp].visible = true;
    this[idxProp] = satIdx;
    const posAttr = this[lineProp].geometry.attributes.position;
    this.fillSatOsculatingOrbit(satIdx, simJD, posAttr.array);
    posAttr.needsUpdate = true;
  }

  setHighlightedSatelliteOrbits(selectedSatObj, selectedColorHex, hoveredSatObj, hoveredColorHex, simJD) {
    this._updateSingleHighlightLine("selectedOrbitLine", "_selectedOrbitSatIdx", selectedSatObj, selectedColorHex, simJD);
    const distinctHover =
      hoveredSatObj && hoveredSatObj.sat_index !== selectedSatObj?.sat_index ? hoveredSatObj : null;
    this._updateSingleHighlightLine("hoveredOrbitLine", "_hoveredOrbitSatIdx", distinctHover, hoveredColorHex, simJD);
  }
}
