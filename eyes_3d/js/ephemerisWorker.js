// Dedicated Web Worker for Off-Thread 22,022-Satellite Kepler+J2 Ephemeris, Search & Picking
// Keeps the main 60-FPS Three.js render thread completely free of O(N) satellite loops.

const DEG2RAD = Math.PI / 180.0;
const TWO_PI = Math.PI * 2.0;
const EARTH_RADIUS_KM = 6371.0;

let orbitData = null; // Float32Array (count * 8)
let count = 0;
let refEpochJD = 2460900.5;
let earthMeshR = 0.00547;
let metaItems = [];
let operators = [];

function mapGeocentricKmToSceneRadius(rKm, meshR) {
  const u = Math.max(1.015, rKm / EARTH_RADIUS_KM);
  return meshR * (1.065 + 0.70 * Math.log(u) + 0.28 * Math.pow(Math.max(0.0, u - 1.0), 0.62));
}

function computeSatLocalXYZ(satIdx, simJD, out3) {
  const off = satIdx * 8;
  const aKm = orbitData[off + 0];
  const ecc = orbitData[off + 1];
  const inc = orbitData[off + 2];
  const raan0 = orbitData[off + 3];
  const argp0 = orbitData[off + 4];
  const m0 = orbitData[off + 5];
  const nRadDay = orbitData[off + 6];

  const dtDays = simJD - refEpochJD;
  const ratio = 6378.137 / Math.max(6450.0, aKm);
  const j2Rate = 9.964 * Math.pow(ratio, 3.5) * DEG2RAD;
  const cosI = Math.cos(inc);
  const sinI = Math.sin(inc);
  const raan = raan0 - j2Rate * cosI * dtDays;
  const argp = argp0 + 0.5 * j2Rate * (5.0 * cosI * cosI - 1.0) * dtDays;

  let M = (m0 + nRadDay * dtDays) % TWO_PI;
  if (M < 0) M += TWO_PI;
  let E = ecc < 0.75 ? M + ecc * Math.sin(M) : M;
  for (let it = 0; it < 6; it++) {
    const f = E - ecc * Math.sin(E) - M;
    const fp = Math.max(0.015, 1.0 - ecc * Math.cos(E));
    E -= f / fp;
  }

  const xOrb = aKm * (Math.cos(E) - ecc);
  const yOrb = aKm * Math.sqrt(Math.max(0.0, 1.0 - ecc * ecc)) * Math.sin(E);
  const rKm = Math.max(6460.0, Math.hypot(xOrb, yOrb));

  const cosO = Math.cos(raan);
  const sinO = Math.sin(raan);
  const cosW = Math.cos(argp);
  const sinW = Math.sin(argp);

  const px = (cosO * cosW - sinO * sinW * cosI) * xOrb + (-cosO * sinW - sinO * cosW * cosI) * yOrb;
  const py = sinW * sinI * xOrb + cosW * sinI * yOrb;
  const pz = -(sinO * cosW + cosO * sinW * cosI) * xOrb - (-sinO * sinW + cosO * cosW * cosI) * yOrb;

  const invLen = 1.0 / (Math.hypot(px, py, pz) || 1.0);
  const rScene = mapGeocentricKmToSceneRadius(rKm, earthMeshR);
  out3[0] = px * invLen * rScene;
  out3[1] = py * invLen * rScene;
  out3[2] = pz * invLen * rScene;
}

const _satTmp = new Float64Array(3);

function handlePick(msg) {
  const { reqId, clientX, clientY, width, height, simJD, familyMask, mvpElements, maxDistPx } = msg;
  if (!orbitData || count === 0) {
    self.postMessage({ type: "pickResult", reqId, satIdx: -1 });
    return;
  }
  // Column-major 4x4 combined (projection * view * hostWorld) matrix
  const m = mvpElements;
  let bestIdx = -1;
  let bestPx = maxDistPx || 14.0;

  for (let i = 0; i < count; i++) {
    const fam = Math.min(11, Math.max(0, Math.round(orbitData[i * 8 + 7])));
    if (((familyMask >> fam) & 1) === 0) continue;

    computeSatLocalXYZ(i, simJD, _satTmp);
    const x = _satTmp[0], y = _satTmp[1], z = _satTmp[2];
    const cw = m[3] * x + m[7] * y + m[11] * z + m[15];
    if (cw <= 1e-9) continue;
    const invW = 1.0 / cw;
    const ndcZ = (m[2] * x + m[6] * y + m[10] * z + m[14]) * invW;
    if (ndcZ < -1.0 || ndcZ > 1.0) continue;

    const ndcX = (m[0] * x + m[4] * y + m[8] * z + m[12]) * invW;
    const ndcY = (m[1] * x + m[5] * y + m[9] * z + m[13]) * invW;
    const sx = (ndcX * 0.5 + 0.5) * width;
    const sy = (-ndcY * 0.5 + 0.5) * height;
    const d = Math.hypot(sx - clientX, sy - clientY);
    if (d < bestPx) {
      bestPx = d;
      bestIdx = i;
    }
  }
  self.postMessage({ type: "pickResult", reqId, satIdx: bestIdx });
}

function handleSearch(msg) {
  const { reqId, query, limit } = msg;
  const q = String(query || "").trim().toUpperCase();
  if (!q || q.length < 2 || metaItems.length === 0) {
    self.postMessage({ type: "searchResult", reqId, indices: [] });
    return;
  }
  const indices = [];
  const cap = limit || 10;
  for (let i = 0; i < metaItems.length; i++) {
    const m = metaItems[i];
    const noradStr = String(m[0]);
    const nameStr = m[1].toUpperCase();
    const opStr = (operators[m[7]] || "").toUpperCase();
    if (nameStr.includes(q) || noradStr === q || opStr.includes(q) || (m[2] && m[2].toUpperCase().includes(q))) {
      indices.push(i);
      if (indices.length >= cap) break;
    }
  }
  self.postMessage({ type: "searchResult", reqId, indices });
}

function handleBatchPositions(msg) {
  const { reqId, simJD, familyMask, startIdx, endIdx } = msg;
  if (!orbitData || count === 0) {
    self.postMessage({ type: "batchPositionsResult", reqId, startIdx: 0, positions: new Float32Array(0) });
    return;
  }
  const s = Math.max(0, startIdx || 0);
  const e = Math.min(count, endIdx || count);
  const out = new Float32Array((e - s) * 3);
  for (let i = s; i < e; i++) {
    const fam = Math.min(11, Math.max(0, Math.round(orbitData[i * 8 + 7])));
    const j = (i - s) * 3;
    if (((familyMask >> fam) & 1) === 0) {
      out[j] = NaN;
      continue;
    }
    computeSatLocalXYZ(i, simJD, _satTmp);
    out[j] = _satTmp[0];
    out[j + 1] = _satTmp[1];
    out[j + 2] = _satTmp[2];
  }
  self.postMessage({ type: "batchPositionsResult", reqId, startIdx: s, positions: out }, [out.buffer]);
}

self.onmessage = (ev) => {
  const msg = ev.data;
  if (!msg || !msg.type) return;
  if (msg.type === "init") {
    orbitData = new Float32Array(msg.orbitBuffer);
    count = msg.count || Math.floor(orbitData.length / 8);
    refEpochJD = msg.refEpochJD || 2460900.5;
    earthMeshR = msg.earthMeshR || 0.00547;
    metaItems = msg.metaItems || [];
    operators = msg.operators || [];
    self.postMessage({ type: "ready", count });
  } else if (msg.type === "pick") {
    handlePick(msg);
  } else if (msg.type === "search") {
    handleSearch(msg);
  } else if (msg.type === "batchPositions") {
    handleBatchPositions(msg);
  }
};
