// Cursor-drawn zoom controller:
// - Zoom In ("in"): arbitrary-shape selection box where the longer axis (adjusted for display aspect ratio)
//   is respected and the shorter axis is padded symmetrically.
// - Zoom Out ("out"): divergence-point radial circle that gives only the zoom-out ratio.
// - Auto-unselects the Zoom In / Zoom Out button after each zoom operation.
// Shared between the full 3D Explorer (app.js) and the 3D Object Playground (studio.html).

import * as THREE from "../vendor/three.module.js";

const MIN_DRAG_PX = 12;
const MIN_FRAC = 0.04;
const MAX_FRAC = 0.92;
const MIN_OUT_RATIO = 1.15;
const MAX_OUT_RATIO = 1e6;
const LOG10_DECADES_PER_REF_RADIUS = 4.0; // log10(ratio) = 4.0 * (r / R_ref): 0.25->10x, 0.5->100x, 0.75->1000x, 1.0->10,000x
const MAX_UNDO_HISTORY = 24;

function formatZoomRatio(k) {
  if (k < 10) return k.toFixed(1);
  if (k < 1000) return String(Math.round(k));
  if (k < 100000) return Math.round(k).toLocaleString("en-US");
  return `10^${Math.log10(k).toFixed(1)}`;
}

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
    padEl: explicitPadEl,
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
  let drag = null;  // { mode, x0, y0, pointerId, rect }
  const history = [];

  // Ensure symmetric-padding guide element exists inside overlayEl (for Zoom In)
  let padEl = explicitPadEl || overlayEl?.querySelector?.("#box-zoom-pad") || null;
  if (!padEl && overlayEl && typeof document !== "undefined") {
    padEl = document.createElement("div");
    padEl.id = "box-zoom-pad";
    overlayEl.insertBefore(padEl, rectEl || overlayEl.firstChild);
  }

  // Ensure radial spoke element exists inside rectEl (for Zoom Out divergence circle)
  let spokeEl = rectEl?.querySelector?.(".bz-spoke") || null;
  if (!spokeEl && rectEl && typeof document !== "undefined") {
    spokeEl = document.createElement("span");
    spokeEl.className = "bz-spoke";
    rectEl.appendChild(spokeEl);
  }

  const _unproj = new THREE.Vector3();
  const _rayOrigin = new THREE.Vector3();
  const _rayDir = new THREE.Vector3();

  function syncUI() {
    inBtn?.classList?.toggle("active", mode === "in");
    inBtn?.setAttribute?.("aria-pressed", mode === "in" ? "true" : "false");
    outBtn?.classList?.toggle("active", mode === "out");
    outBtn?.setAttribute?.("aria-pressed", mode === "out" ? "true" : "false");
    if (undoBtn) {
      undoBtn.disabled = history.length === 0;
      undoBtn.setAttribute?.("aria-disabled", history.length === 0 ? "true" : "false");
    }
    if (hintEl) {
      if (mode === "in") {
        hintEl.textContent = getLabel("boxZoomHintIn", "Drag a box to zoom in · Esc to cancel");
        hintEl.style.display = "inline-flex";
      } else if (mode === "out") {
        hintEl.textContent = getLabel("boxZoomHintOut", "Drag a radial circle to set zoom-out ratio · Esc to cancel");
        hintEl.style.display = "inline-flex";
      } else {
        hintEl.style.display = "none";
      }
    }
    if (canvas && !drag) {
      if (mode === "in" || mode === "out") canvas.style.cursor = "crosshair";
      else if (canvas.style.cursor === "crosshair") canvas.style.cursor = "grab";
    }
  }

  function clearBoxOverlay() {
    if (overlayEl) overlayEl.style.display = "none";
    if (padEl) padEl.style.display = "none";
    if (spokeEl) spokeEl.style.display = "none";
    if (rectEl) rectEl.classList?.remove("mode-in", "mode-out");
  }

  function setMode(nextMode) {
    const normalized = nextMode === "in" || nextMode === "out" ? nextMode : "off";
    if (drag) cancelDrag();
    mode = normalized;
    syncUI();
  }

  function toggleMode(targetMode = "in") {
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

  /**
   * Compute geometry for either:
   * - Zoom In ("in"): arbitrary-shape selection box with aspect-ratio-adjusted symmetric padding.
   * - Zoom Out ("out"): divergence-point radial circle centered at (x0, y0) giving only zoom-out ratio f > 1.
   */
  function computeSelectionRect(x0, y0, clientX, clientY, activeMode = "in") {
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
    const px = Math.min(w, Math.max(0, clientX - (box.left || 0)));
    const py = Math.min(h, Math.max(0, clientY - (box.top || 0)));

    if (activeMode === "out") {
      const dx = px - ax;
      const dy = py - ay;
      const radius = Math.hypot(dx, dy);
      const angleRad = Math.atan2(dy, dx);
      const refRadius = Math.max(1, 0.5 * Math.min(w, h));
      const u = radius / refRadius;
      // Logarithmic zoom-out ratio: log10(k) = 4.0 * u (1 decade per 25% of reference radius)
      const ratioOut = Math.min(
        MAX_OUT_RATIO,
        Math.max(MIN_OUT_RATIO, Math.pow(10.0, LOG10_DECADES_PER_REF_RADIUS * u))
      );
      const diameter = radius * 2.0;

      return {
        mode: "out",
        left: ax - radius,
        top: ay - radius,
        width: diameter,
        height: diameter,
        side: diameter,
        effSide: diameter,
        radius,
        angleRad,
        cx: ax,
        cy: ay,
        fracX: diameter / w,
        fracY: diameter / h,
        rawFrac: u,
        f: ratioOut,
        longerAxis: "radial",
        padX: 0,
        padY: 0,
        paddedLeft: ax - radius,
        paddedTop: ay - radius,
        paddedWidth: diameter,
        paddedHeight: diameter,
        viewW: w,
        viewH: h,
        boxLeft: box.left || 0,
        boxTop: box.top || 0
      };
    }

    const left = Math.min(ax, px);
    const top = Math.min(ay, py);
    const width = Math.abs(px - ax);
    const height = Math.abs(py - ay);
    const cx = left + width * 0.5;
    const cy = top + height * 0.5;

    const fracX = width / w;
    const fracY = height / h;
    const longerAxis = fracX >= fracY ? "x" : "y";
    const rawFrac = Math.max(fracX, fracY);
    const f = Math.min(MAX_FRAC, Math.max(MIN_FRAC, rawFrac));

    const paddedWidth = rawFrac * w;
    const paddedHeight = rawFrac * h;
    const padX = Math.max(0, (paddedWidth - width) * 0.5);
    const padY = Math.max(0, (paddedHeight - height) * 0.5);
    const paddedLeft = cx - paddedWidth * 0.5;
    const paddedTop = cy - paddedHeight * 0.5;
    const maxSpan = Math.max(width, height);
    const effSide = rawFrac * Math.min(w, h);

    return {
      mode: "in",
      left,
      top,
      width,
      height,
      side: maxSpan,
      effSide,
      radius: maxSpan * 0.5,
      angleRad: 0,
      cx,
      cy,
      fracX,
      fracY,
      rawFrac,
      f,
      longerAxis,
      padX,
      padY,
      paddedLeft,
      paddedTop,
      paddedWidth,
      paddedHeight,
      viewW: w,
      viewH: h,
      boxLeft: box.left || 0,
      boxTop: box.top || 0
    };
  }

  function renderDragRect(rect, activeMode = "in") {
    if (!overlayEl || !rectEl) return;
    overlayEl.style.display = "block";
    rectEl.classList?.toggle("mode-in", activeMode === "in");
    rectEl.classList?.toggle("mode-out", activeMode === "out");
    rectEl.style.left = `${rect.left}px`;
    rectEl.style.top = `${rect.top}px`;
    rectEl.style.width = `${rect.width}px`;
    rectEl.style.height = `${rect.height}px`;

    if (activeMode === "out") {
      if (padEl) padEl.style.display = "none";
      if (spokeEl) {
        if (rect.radius >= MIN_DRAG_PX * 0.5) {
          spokeEl.style.display = "block";
          spokeEl.style.width = `${rect.radius}px`;
          spokeEl.style.transform = `translateY(-50%) rotate(${rect.angleRad}rad)`;
        } else {
          spokeEl.style.display = "none";
        }
      }
      if (tagEl) {
        if (rect.radius < MIN_DRAG_PX) {
          tagEl.style.display = "none";
        } else {
          const kStr = formatZoomRatio(rect.f);
          tagEl.textContent = getLabel("boxZoomTagOut", `${kStr}× OUT`, { k: kStr });
          tagEl.style.display = "block";
        }
      }
      return;
    }

    if (spokeEl) spokeEl.style.display = "none";
    if (padEl) {
      if (rect.side >= MIN_DRAG_PX && (rect.padX > 1.5 || rect.padY > 1.5)) {
        padEl.style.display = "block";
        padEl.style.left = `${rect.paddedLeft}px`;
        padEl.style.top = `${rect.paddedTop}px`;
        padEl.style.width = `${rect.paddedWidth}px`;
        padEl.style.height = `${rect.paddedHeight}px`;
      } else {
        padEl.style.display = "none";
      }
    }

    if (tagEl) {
      if (rect.side < MIN_DRAG_PX) {
        tagEl.style.display = "none";
      } else {
        const k = 1.0 / rect.f;
        const kStr = k >= 10 ? String(Math.round(k)) : k.toFixed(1);
        tagEl.textContent = getLabel("boxZoomTagIn", `${kStr}× IN`, { k: kStr });
        tagEl.style.display = "block";
      }
    }
  }

  function unprojectBoxCenterRay(rect) {
    const ndcX = (rect.cx / rect.viewW) * 2.0 - 1.0;
    const ndcY = -(rect.cy / rect.viewH) * 2.0 + 1.0;
    _rayOrigin.copy(camera.position);
    _unproj.set(ndcX, ndcY, 0.5).unproject(camera);
    _rayDir.copy(_unproj).sub(_rayOrigin).normalize();
    return { rayOrigin: _rayOrigin, rayDir: _rayDir };
  }

  function commitZoom(rect, activeMode = "in") {
    const f = rect.f;
    const { rayOrigin, rayDir } = unprojectBoxCenterRay(rect);
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
    drag.rect = computeSelectionRect(drag.x0, drag.y0, e.clientX, e.clientY, drag.mode);
    renderDragRect(drag.rect, drag.mode);
  }

  function onWindowPointerUp(e) {
    if (!drag || e.pointerId !== drag.pointerId) return;
    e.preventDefault?.();
    e.stopImmediatePropagation?.();
    const finished = drag;
    finished.rect = computeSelectionRect(finished.x0, finished.y0, e.clientX, e.clientY, finished.mode);
    detachDragListeners();
    try {
      canvas?.releasePointerCapture?.(finished.pointerId);
    } catch (_) {}
    drag = null;
    clearBoxOverlay();

    const isValidDrag =
      finished.rect &&
      (finished.mode === "out"
        ? finished.rect.radius >= MIN_DRAG_PX
        : finished.rect.side >= MIN_DRAG_PX);

    if (isValidDrag) {
      commitZoom(finished.rect, finished.mode);
      // Automatically unselect Zoom In / Zoom Out button after each zoom operation
      mode = "off";
    }
    syncUI();
  }

  function onWindowPointerCancel(e) {
    if (!drag || e.pointerId !== drag.pointerId) return;
    cancelDrag();
  }

  function resolvePointerMode(e) {
    if (e.shiftKey) return "in";
    if (e.altKey) return "out";
    return mode;
  }

  function onWindowRightClickDown(e) {
    if (e.button !== 2) return;
    if (drag || mode !== "off") {
      e.preventDefault?.();
      e.stopImmediatePropagation?.();
      if (drag) cancelDrag();
      setMode("off");
      // Consume the matching right-button pointerup so it only cancels zoom and doesn't trigger other right-click actions
      const swallowRightUp = (upEv) => {
        if (upEv.button === 2) {
          upEv.preventDefault?.();
          upEv.stopImmediatePropagation?.();
          window.removeEventListener?.("pointerup", swallowRightUp, true);
        }
      };
      window.addEventListener?.("pointerup", swallowRightUp, true);
    }
  }

  window?.addEventListener?.("pointerdown", onWindowRightClickDown, true);

  canvas?.addEventListener?.("pointerdown", (e) => {
    if (e.button !== 0 || isBlocked()) return;
    const activeMode = resolvePointerMode(e);
    if (activeMode !== "in" && activeMode !== "out") return;

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
    const rect = computeSelectionRect(x0, y0, e.clientX, e.clientY, activeMode);
    drag = {
      mode: activeMode,
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
    pushSnapshot,
    undo,
    clearHistory,
    getHistoryLength: () => history.length,
    isDragging: () => Boolean(drag),
    getCurrentRect: () => drag?.rect || null,
    refreshLabels: syncUI
  };
}
