import { clamp } from "./core/math.js";
import { config } from "./core/config.js";
import { canvas, ctx } from "./rendering/canvas.js";
import { createCamera, mixRgb } from "./rendering/camera.js";
import { createStarLayers, drawStars } from "./rendering/stars.js";
import { drawPlanetDisk } from "./rendering/planet.js";
import { drawSun } from "./rendering/sun.js";
import { drawHud } from "./rendering/hud.js";
import { drawSurfaceObjects } from "./rendering/structures.js";
import { applyGlideCushion } from "./simulation/physics.js";
import {
  createShip,
  updateShipOrientation,
  handleMouseLook,
  updateShipSpeed,
  adjustThrust,
  setThrustPreset,
} from "./simulation/ship.js";
import { createUniverse, nearestPlanetInfo } from "./world/universe.js";

const ship = createShip(config);
const universe = createUniverse(config);
const starLayers = createStarLayers(config);

const keys = new Set();

window.addEventListener("keydown", (e) => {
  keys.add(e.code);
  if (e.code.startsWith("Digit")) {
    const n = parseInt(e.code.slice(5), 10);
    if (!Number.isNaN(n)) {
      setThrustPreset(ship, n);
    }
  }
});

window.addEventListener("keyup", (e) => keys.delete(e.code));

let pointerLocked = false;

canvas.addEventListener("click", async () => {
  try {
    await canvas.requestPointerLock();
  } catch {}
});

document.addEventListener("pointerlockchange", () => {
  pointerLocked = document.pointerLockElement === canvas;
});

document.addEventListener("mousemove", (e) => {
  if (!pointerLocked) return;
  handleMouseLook(ship, e.movementX, e.movementY, config);
});

window.addEventListener(
  "wheel",
  (e) => {
    adjustThrust(ship, Math.sign(e.deltaY), config);
  },
  { passive: true }
);

let lastT = performance.now();

function step(now) {
  const realDt = (now - lastT) / 1000;
  lastT = now;
  const dt = Math.min(realDt, config.time.dtClamp) * config.time.scale;

  updateShipOrientation(ship, keys, dt, config);
  updateShipSpeed(ship, keys, dt, config);

  // Move ship
  ship.pos.x += ship.vel.x * dt;
  ship.pos.y += ship.vel.y * dt;
  ship.pos.z += ship.vel.z * dt;

  const info = nearestPlanetInfo(ship.pos, universe.planets);
  const planet = info?.planet;

  if (planet) {
    applyGlideCushion(ship, planet, config.ship.cushionHeight);
  }

  const cam = createCamera(ship, canvas, config);
  const speed = ship.vel.len();

  const starFade = info ? clamp(info.tAtmo * 0.9, 0, 1) : 0;
  const skyColor = info
    ? mixRgb(config.visuals.spaceBg, planet.colors.sky, info.tAtmo * 0.7)
    : config.visuals.spaceBg;

  // Apply turbo screen shake (only while accelerating, stops at 90% speed)
  const isTurbo = keys.has("KeyW");
  const turboShakeActive = isTurbo && config.ship.turboShake > 0 && speed < config.ship.turboSpeed * 0.9;
  if (turboShakeActive) {
    // Shake intensity peaks in the middle of acceleration, fades near target
    const speedRatio = speed / (config.ship.turboSpeed * 0.9);
    const shakeIntensity = 1 - speedRatio; // Full shake at start, zero at 90%
    const shake = config.ship.turboShake * shakeIntensity;
    const offsetX = (Math.random() - 0.5) * shake * 2;
    const offsetY = (Math.random() - 0.5) * shake * 2;
    ctx.save();
    ctx.translate(offsetX, offsetY);
  }

  ctx.fillStyle = skyColor;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  drawStars(ctx, canvas, cam, starLayers, starFade, config.camera.nearPlane, speed, config.ship.turboSpeed);
  drawSun(ctx, cam, universe.sun, config.camera.nearPlane);

  if (planet && info) {
    drawPlanetDisk(ctx, cam, planet, info.tAtmo, universe.sun, config.camera.nearPlane);

    // Draw surface structures (towers, pylons)
    const objects = universe.surfaceObjects.get(planet);
    if (objects) {
      drawSurfaceObjects(ctx, cam, planet, objects, info.altitude, config.camera.nearPlane, config);
    }
  }

  const altitude = info?.altitude ?? 0;
  drawHud(ctx, canvas, ship, altitude, speed, pointerLocked, keys);

  if (turboShakeActive) {
    ctx.restore();
  }

  requestAnimationFrame(step);
}

requestAnimationFrame(step);
