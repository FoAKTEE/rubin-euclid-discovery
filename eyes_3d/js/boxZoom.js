// Cursor-drawn square box zoom controller (Zoom In, Zoom Out, Undo history)
// Shared between the full 3D Explorer (app.js) and the 3D Object Playground (studio.html).

import * as THREE from "../vendor/three.module.js";

const MIN_DRAG_PX = 14;
const MIN_FRAC = 0.04;
const MAX_FRAC = 0.92;
const MAX_UNDO_HISTORY = 24;

export function createBoxZoomController(opts) {
  const {
    canvas,
    camera,
    controls,
    inBtn,
    outBtn,
    undoBtn,
    hintEl,
    overlayEl,
    rectEl,
    tagEl,
    getLabel = (_key, fallback) => fallback || "",
    isBlocked = () => false,
    beforeStart = () => {},
    resolveZoomMove,
    applyCameraMove,
    restoreSnapshot,
    getSnapshotMeta = () => ({})
  } = opts;

  let mode = "off"; // "off" | "in" | "out"
  let drag = null;  // { activeMode, x0, y0, pointerId, rect }
  const history = [];

  const _unproj = new THREE.Vector3();
  const _rayOrigin = new THREE.Vector3();
  const _rayDir = new THREE.Vector3();

  function syncUI() {
    inBtn?.classList?.toggle("active", mode === "in");
    outBtn?.classList?.toggle("active", mode === "out");
    inBtn?.setAttribute?.("aria-pressed", mode === "in" ? "true" : "false");
    outBtn?.setAttribute?.("aria-pressed", mode === "out" ? "true" : "false");
    if (undoBtn) {
      undoBtn.disabled = history.length === 0;
      undoBtn.setAttribute?.("aria-disabled", history.length === 0 ? "true" : "false");
    }
    if (hintEl) {
      if (mode === "in") {
        hintEl.textContent = getLabel("boxZoomHintIn", "Drag a square to zoom in · Esc to exit");
        hintEl.style.display = "inline-flex";
      } else if (mode === "out") {
        hintEl.textContent = getLabel("boxZoomHintOut", "Drag a square to zoom out · Esc to exit");
        hintEl.style.display = "inline-flex";
      } else {
        hintEl.style.display = "none";
      }
    }
    if (canvas && !drag) {
      if (mode !== "off") canvas.style.cursor = "crosshair";
      else if (canvas.style.cursor === "crosshair") canvas.style.cursor = "grab";
    }
  }

  function clearBoxOverlay() {
    if (overlayEl) overlayEl.style.display = "none";
    if (rectEl) {
      rectEl.classList?.remove("mode-in", "mode-out");
    }
  }

  function setMode(nextMode) {
    const normalized = nextMode === "in" || nextMode === "out" ? nextMode : "off";
    if (drag) cancelDrag();
    mode = normalized;
    syncUI();
  }

  function toggleMode(targetMode) {
    setMode(mode === targetMode ? "off" : targetMode);
  }

  function clearHistory() {
    history.length = 0;
    syncUI();
  }

  function pushSnapshot() {
    history.push({
      target: controls.target.clone(),
      camPos: camera.position.clone(),
      minDist: controls.minDistance,
      meta: getSnapshotMeta() || {}
    });
    if (history.length > MAX_UNDO_HISTORY) history.shift();
    syncUI();
  }

  function undo() {
    const snap = history.pop();
    syncUI();
    if (!snap) return false;
    beforeStart();
    if (typeof restoreSnapshot === "function") {
      restoreSnapshot(snap);
    } else {
      controls.minDistance = snap.minDist;
      applyCameraMove({
        target: snap.target,
        camPos: snap.camPos,
        minDist: snap.minDist,
        durationSec: 0.45
      });
    }
    return true;
  }

  function computeSquareRect(x0, y0, clientX, clientY) {
    const box = canvas?.getBoundingClientRect?.() || {
      left: 0,
      top: 0,
      width: window.innerWidth || 1,
      height: window.innerHeight || 1
    };
    const w = Math.max(1, box.width || window.innerWidth || 1);
    const h = Math.max(1, box.height || window.innerHeight || 1);
    const ax = Math.min(w, Math.max(0, x0));
    const ay = Math.min(h, Math.max(0, y0));
    const px = Math.min(w, Math.max(0, clientX - box.left));
    const py = Math.min(h, Math.max(0, clientY - box.top));

    const dx = px - ax;
    const dy = py - ay;
    const sgnX = dx >= 0 ? 1 : -1;
    const sgnY = dy >= 0 ? 1 : -1;
    const maxSX = sgnX > 0 ? w - ax : ax;
    const maxSY = sgnY > 0 ? h - ay : ay;
    const side = Math.min(Math.max(Math.abs(dx), Math.abs(dy)), maxSX, maxSY);

    const left = sgnX > 0 ? ax : ax - side;
    const top = sgnY > 0 ? ay : ay - side;
    return {
      left,
      top,
      side,
      cx: left + side * 0.5,
      cy: top + side * 0.5,
      viewW: w,
      viewH: h,
      boxLeft: box.left || 0,
      boxTop: box.top || 0
    };
  }

  function renderDragRect(rect, activeMode) {
    if (!overlayEl || !rectEl) return;
    overlayEl.style.display = "block";
    rectEl.classList?.toggle("mode-in", activeMode === "in");
    rectEl.classList?.toggle("mode-out", activeMode === "out");
    rectEl.style.left = `${rect.left}px`;
    rectEl.style.top = `${rect.top}px`;
    rectEl.style.width = `${rect.side}px`;
    rectEl.style.height = `${rect.side}px`;

    if (tagEl) {
      if (rect.side < MIN_DRAG_PX) {
        tagEl.style.display = "none";
      } else {
        const frac = Math.min(MAX_FRAC, Math.max(MIN_FRAC, rect.side / Math.min(rect.viewW, rect.viewH)));
        const k = 1.0 / frac;
        const kStr = k >= 10 ? String(Math.round(k)) : k.toFixed(1);
        const key = activeMode === "in" ? "boxZoomTagIn" : "boxZoomTagOut";
        const fb = activeMode === "in" ? `${kStr}× IN` : `${kStr}× OUT`;
        tagEl.textContent = getLabel(key, fb, { k: kStr });
        tagEl.style.display = "block";
      }
    }
  }

  function unprojectSquareRay(rect) {
    const ndcX = (rect.cx / rect.viewW) * 2.0 - 1.0;
    const ndcY = -(rect.cy / rect.viewH) * 2.0 + 1.0;
    _rayOrigin.copy(camera.position);
    _unproj.set(ndcX, ndcY, 0.5).unproject(camera);
    _rayDir.copy(_unproj).sub(_rayOrigin).normalize();
    return { rayOrigin: _rayOrigin, rayDir: _rayDir };
  }

  function commitZoom(rect, activeMode) {
    const f = Math.min(MAX_FRAC, Math.max(MIN_FRAC, rect.side / Math.max(1, Math.min(rect.viewW, rect.viewH))));
    const { rayOrigin, rayDir } = unprojectSquareRay(rect);
    const dOld = Math.max(1e-8, camera.position.distanceTo(controls.target));
    const move = resolveZoomMove?.({
      mode: activeMode,
      f,
      rayOrigin,
      rayDir,
      rect,
      dOld,
      currentTarget: controls.target,
      currentCamPos: camera.position
    });
    if (!move || !move.target || !move.camPos) return false;
    beforeStart();
    pushSnapshot();
    applyCameraMove(move);
    return true;
  }

  function detachDragListeners() {
    window.removeEventListener?.("pointermove", onWindowPointerMove, true);
    window.removeEventListener?.("pointerup", onWindowPointerUp, true);
    window.removeEventListener?.("pointercancel", onWindowPointerCancel, true);
  }

  function cancelDrag() {
    if (!drag) return;
    detachDragListeners();
    try {
      canvas?.releasePointerCapture?.(drag.pointerId);
    } catch (_) {}
    drag = null;
    clearBoxOverlay();
    syncUI();
  }

  function onWindowPointerMove(e) {
    if (!drag || e.pointerId !== drag.pointerId) return;
    e.preventDefault?.();
    e.stopImmediatePropagation?.();
    drag.rect = computeSquareRect(drag.x0, drag.y0, e.clientX, e.clientY);
    renderDragRect(drag.rect, drag.activeMode);
  }

  function onWindowPointerUp(e) {
    if (!drag || e.pointerId !== drag.pointerId) return;
    e.preventDefault?.();
    e.stopImmediatePropagation?.();
    const finished = drag;
    finished.rect = computeSquareRect(finished.x0, finished.y0, e.clientX, e.clientY);
    detachDragListeners();
    try {
      canvas?.releasePointerCapture?.(finished.pointerId);
    } catch (_) {}
    drag = null;
    clearBoxOverlay();
    syncUI();
    if (finished.rect && finished.rect.side >= MIN_DRAG_PX) {
      commitZoom(finished.rect, finished.activeMode);
    }
  }

  function onWindowPointerCancel(e) {
    if (!drag || e.pointerId !== drag.pointerId) return;
    cancelDrag();
  }

  function resolvePointerMode(e) {
    if (e.altKey) return "out";
    if (e.shiftKey) return "in";
    return mode;
  }

  canvas?.addEventListener?.("pointerdown", (e) => {
    if (e.button !== 0 || isBlocked()) return;
    const activeMode = resolvePointerMode(e);
    if (activeMode === "off") return;

    e.preventDefault?.();
    e.stopImmediatePropagation?.();

    const box = canvas.getBoundingClientRect?.() || {
      left: 0,
      top: 0,
      width: window.innerWidth || 1,
      height: window.innerHeight || 1
    };
    const x0 = Math.min(box.width || window.innerWidth || 1, Math.max(0, e.clientX - (box.left || 0)));
    const y0 = Math.min(box.height || window.innerHeight || 1, Math.max(0, e.clientY - (box.top || 0)));
    const rect = computeSquareRect(x0, y0, e.clientX, e.clientY);
    drag = {
      activeMode,
      x0,
      y0,
      pointerId: e.pointerId,
      rect
    };
    if (canvas) canvas.style.cursor = "crosshair";
    try {
      canvas.setPointerCapture?.(e.pointerId);
    } catch (_) {}
    renderDragRect(rect, activeMode);
    window.addEventListener?.("pointermove", onWindowPointerMove, true);
    window.addEventListener?.("pointerup", onWindowPointerUp, true);
    window.addEventListener?.("pointercancel", onWindowPointerCancel, true);
  }, { capture: true });

  inBtn?.addEventListener?.("click", (ev) => {
    ev.stopPropagation?.();
    toggleMode("in");
  });
  outBtn?.addEventListener?.("click", (ev) => {
    ev.stopPropagation?.();
    toggleMode("out");
  });
  undoBtn?.addEventListener?.("click", (ev) => {
    ev.stopPropagation?.();
    undo();
  });

  document?.addEventListener?.("keydown", (ev) => {
    const tag = (ev.target?.tagName || "").toUpperCase();
    if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT" || ev.target?.isContentEditable) return;
    if (ev.metaKey || ev.ctrlKey) return;

    if (ev.key === "Escape") {
      if (drag) {
        cancelDrag();
      } else if (mode !== "off") {
        setMode("off");
      }
      return;
    }
    if (ev.altKey) return;

    const lower = (ev.key || "").toLowerCase();
    if (lower === "z") {
      ev.preventDefault?.();
      toggleMode("in");
    } else if (lower === "x") {
      ev.preventDefault?.();
      toggleMode("out");
    } else if (ev.key === "Backspace" && history.length > 0) {
      ev.preventDefault?.();
      undo();
    }
  });

  syncUI();

  return {
    getMode: () => mode,
    setMode,
    undo,
    clearHistory,
    getHistoryLength: () => history.length,
    isDragging: () => Boolean(drag),
    getCurrentRect: () => drag?.rect || null,
    refreshLabels: syncUI
  };
}

