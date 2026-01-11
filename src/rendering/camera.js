import { clamp } from "../core/math.js";

export function rgbToObj(hex) {
  const h = hex.replace("#", "");
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return { r, g, b };
}

export function objToRgb(o) {
  const r = clamp(Math.round(o.r), 0, 255);
  const g = clamp(Math.round(o.g), 0, 255);
  const b = clamp(Math.round(o.b), 0, 255);
  return `rgb(${r},${g},${b})`;
}

export function mixRgb(aHex, bHex, t) {
  const a = rgbToObj(aHex);
  const b = rgbToObj(bHex);
  return objToRgb({
    r: a.r + (b.r - a.r) * t,
    g: a.g + (b.g - a.g) * t,
    b: a.b + (b.b - a.b) * t,
  });
}

export function mulRgb(hex, m) {
  const a = rgbToObj(hex);
  return objToRgb({ r: a.r * m, g: a.g * m, b: a.b * m });
}

export function createCamera(ship, canvas, config) {
  const F = ship.q.rotateVec({ x: 0, y: 0, z: 1 });
  const R = ship.q.rotateVec({ x: 1, y: 0, z: 0 });
  const U = ship.q.rotateVec({ x: 0, y: 1, z: 0 });

  const cx = canvas.width * 0.5;
  const cy = canvas.height * 0.5;
  const focal =
    (canvas.height * 0.5) /
    Math.tan((config.camera.fovDeg * Math.PI) / 180 * 0.5);

  return {
    C: ship.pos.clone(),
    F,
    R,
    U,
    cx,
    cy,
    focal,
  };
}

export function projectPoint(P, cam, nearPlane) {
  const vx = P.x - cam.C.x;
  const vy = P.y - cam.C.y;
  const vz = P.z - cam.C.z;

  const xCam = vx * cam.R.x + vy * cam.R.y + vz * cam.R.z;
  const yCam = vx * cam.U.x + vy * cam.U.y + vz * cam.U.z;
  const zCam = vx * cam.F.x + vy * cam.F.y + vz * cam.F.z;

  if (zCam <= nearPlane) return null;

  const sx = (xCam / zCam) * cam.focal + cam.cx;
  const sy = (yCam / zCam) * cam.focal + cam.cy;
  return { sx, sy, zCam };
}
