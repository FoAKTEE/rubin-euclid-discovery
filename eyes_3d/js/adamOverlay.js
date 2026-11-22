// B612 ADAM Platform 3D WebGL Overlay Renderer for Eyes on the Cosmos
// Renders GPU-morphed Lambert transfer arcs, Virtual Impactor tubes, WGS-84 Earth/Moon
// impact corridors, and archival Precovery sky-arc tracks with zero per-frame allocation.

import * as THREE from "../vendor/three.module.js";
import { LOG_R0, LOG_S0, DEG2RAD } from "./orbitalMechanics.js";

function makeHelioShaderMaterial(uLogBlendRef, uGlobalFadeRef, defaultOpacity = 0.9) {
  return new THREE.ShaderMaterial({
    uniforms: {
      uLogBlend: uLogBlendRef,
      uGlobalFade: uGlobalFadeRef,
      uOpacity: { value: defaultOpacity }
    },
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
      uniform float uOpacity;
      varying vec3 vColor;
      varying float vAlpha;
      void main() {
        vColor = aColor;
        vAlpha = aAlpha * uGlobalFade * uOpacity;
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
}

function buildSegmentedLines(arcs, uLogBlendRef, uGlobalFadeRef, defaultOpacity = 0.92) {
  let totalVerts = 0;
  for (const arc of arcs) {
    if (arc.points && arc.points.length >= 2) totalVerts += (arc.points.length - 1) * 2;
  }
  const posArr = new Float32Array(totalVerts * 3);
  const colArr = new Float32Array(totalVerts * 3);
  const alphaArr = new Float32Array(totalVerts);
  let w = 0;
  for (const arc of arcs) {
    const pts = arc.points || [];
    if (pts.length < 2) continue;
    const col = new THREE.Color(arc.color || "#38bdf8");
    const a = arc.alpha ?? 0.92;
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts[i];
      const p1 = pts[i + 1];
      // Ecliptic (x, y, z) -> Eyes 3D Scene (x, z, -y)
      posArr[w * 3 + 0] = p0[0];
      posArr[w * 3 + 1] = p0[2];
      posArr[w * 3 + 2] = -p0[1];
      colArr[w * 3 + 0] = col.r;
      colArr[w * 3 + 1] = col.g;
      colArr[w * 3 + 2] = col.b;
      alphaArr[w] = a;
      w++;

      posArr[w * 3 + 0] = p1[0];
      posArr[w * 3 + 1] = p1[2];
      posArr[w * 3 + 2] = -p1[1];
      colArr[w * 3 + 0] = col.r;
      colArr[w * 3 + 1] = col.g;
      colArr[w * 3 + 2] = col.b;
      alphaArr[w] = a;
      w++;
    }
  }
  const geom = new THREE.BufferGeometry();
  geom.setAttribute("position", new THREE.BufferAttribute(posArr, 3));
  geom.setAttribute("aColor", new THREE.BufferAttribute(colArr, 3));
  geom.setAttribute("aAlpha", new THREE.BufferAttribute(alphaArr, 1));
  geom.boundingSphere = new THREE.Sphere(new THREE.Vector3(0, 0, 0), 250000);
  const mat = makeHelioShaderMaterial(uLogBlendRef, uGlobalFadeRef, defaultOpacity);
  const lines = new THREE.LineSegments(geom, mat);
  lines.frustumCulled = false;
  lines.renderOrder = 10;
  return lines;
}

function latLonToBodyLocal(latDeg, lonDeg, radius) {
  const lat = latDeg * DEG2RAD;
  const lon = lonDeg * DEG2RAD;
  // Matches Three.js SphereGeometry UV/longitude orientation on Earth/Moon globe
  const x = radius * Math.cos(lat) * Math.cos(lon);
  const y = radius * Math.sin(lat);
  const z = -radius * Math.cos(lat) * Math.sin(lon);
  return new THREE.Vector3(x, y, z);
}

function buildBodyCorridorPoints(corridorList, hostNode, colorHex) {
  const grp = new THREE.Group();
  grp.name = "adamBodyCorridor";
  if (!corridorList || corridorList.length === 0 || !hostNode) return grp;
  const meshR = (hostNode.userData?.meshRadius || 0.25) * 1.022;
  const posArr = new Float32Array(corridorList.length * 3);
  for (let i = 0; i < corridorList.length; i++) {
    const v = latLonToBodyLocal(corridorList[i].lat_deg, corridorList[i].lon_deg, meshR);
    posArr[i * 3 + 0] = v.x;
    posArr[i * 3 + 1] = v.y;
    posArr[i * 3 + 2] = v.z;
  }
  const geom = new THREE.BufferGeometry();
  geom.setAttribute("position", new THREE.BufferAttribute(posArr, 3));
  const ptMat = new THREE.PointsMaterial({
    color: new THREE.Color(colorHex),
    size: meshR * 0.085,
    sizeAttenuation: true,
    transparent: true,
    opacity: 0.92,
    depthTest: true,
    depthWrite: false
  });
  const pts = new THREE.Points(geom, ptMat);
  pts.renderOrder = 14;
  grp.add(pts);

  if (corridorList.length >= 2) {
    const lineMat = new THREE.LineBasicMaterial({
      color: new THREE.Color(colorHex),
      transparent: true,
      opacity: 0.55
    });
    const line = new THREE.Line(geom, lineMat);
    line.renderOrder = 13;
    grp.add(line);
  }
  const attachTarget = hostNode.userData?.rotatable || hostNode;
  attachTarget.add(grp);
  return grp;
}

export function createADAMOverlayManager(scene, runtimeMap, initialLogBlend = 1.0) {
  const data = window.__ADAM_OVERLAY__ || null;
  const root = new THREE.Group();
  root.name = "adamPlatformRoot";
  scene.add(root);

  const uLogBlend = { value: initialLogBlend };
  const uGlobalFade = { value: 1.0 };

  // Every ADAM layer is opt-in from the ADAM Platform menu; nothing is drawn on a bare start.
  const layerState = {
    transfers: false,
    impactors: false,
    corridors: false,
    precovery: false
  };

  const groups = {
    transfers: new THREE.Group(),
    impactors: new THREE.Group(),
    precovery: new THREE.Group(),
    earthCorridor: null,
    moonCorridor: null
  };
  root.add(groups.transfers, groups.impactors, groups.precovery);

  if (data) {
    const trArcs = (data.transfers || []).map((t) => ({
      points: t.points_au || [],
      color: t.color || "#38bdf8",
      alpha: 0.94
    }));
    if (trArcs.length) {
      groups.transfers.add(buildSegmentedLines(trArcs, uLogBlend, uGlobalFade, 0.95));
    }

    const viArcs = [];
    for (const vi of data.virtual_impactors || []) {
      if (vi.nominal_arc_au?.length >= 2) {
        viArcs.push({ points: vi.nominal_arc_au, color: "#fbbf24", alpha: 0.92 });
      }
      for (const a of vi.impactor_arcs_au || []) {
        viArcs.push({ points: a, color: "#ef4444", alpha: 0.85 });
      }
      for (const a of vi.non_impactor_arcs_au || []) {
        viArcs.push({ points: a, color: "#38bdf8", alpha: 0.34 });
      }
    }
    if (viArcs.length) {
      groups.impactors.add(buildSegmentedLines(viArcs, uLogBlend, uGlobalFade, 0.9));
    }

    const prArcs = (data.precovery_arcs || []).map((p) => ({
      points: p.points_au || [],
      color: p.color || "#10b981",
      alpha: 0.88
    }));
    if (prArcs.length) {
      groups.precovery.add(buildSegmentedLines(prArcs, uLogBlend, uGlobalFade, 0.9));
    }

    const earthRt = runtimeMap.get("EARTH");
    const moonRt = runtimeMap.get("MOON");
    groups.earthCorridor = buildBodyCorridorPoints(data.earth_corridors || [], earthRt?.node, "#ef4444");
    groups.moonCorridor = buildBodyCorridorPoints(data.moon_corridors || [], moonRt?.node, "#f59e0b");
  }

  function applyVisibility() {
    groups.transfers.visible = layerState.transfers;
    groups.impactors.visible = layerState.impactors;
    groups.precovery.visible = layerState.precovery;
    if (groups.earthCorridor) groups.earthCorridor.visible = layerState.corridors;
    if (groups.moonCorridor) groups.moonCorridor.visible = layerState.corridors;
  }

  function setLayerVisible(key, visible) {
    if (key in layerState) {
      layerState[key] = Boolean(visible);
      applyVisibility();
    }
  }

  function update(logBlend, solarFade) {
    uLogBlend.value = logBlend;
    uGlobalFade.value = solarFade;
    root.visible = solarFade > 0.01;
  }

  function getSummaryText() {
    if (!data) return "ADAM overlay data not loaded.";
    const nT = (data.transfers || []).length;
    const nV = (data.virtual_impactors || []).length;
    const nE = (data.earth_corridors || []).length;
    const nM = (data.moon_corridors || []).length;
    const nP = (data.precovery_arcs || []).length;
    return `${nT} Lambert transfers · ${nV} VI ensembles · ${nE} Earth / ${nM} Moon impact nodes · ${nP} precovery arcs`;
  }

  applyVisibility();
  return { root, data, layerState, setLayerVisible, update, getSummaryText };
}
