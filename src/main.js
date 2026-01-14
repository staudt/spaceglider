import { clamp, Vec3 } from "./core/math.js";
import { config } from "./core/config.js";
import { canvas, ctx } from "./rendering/canvas.js";
import { createCamera, mixRgb } from "./rendering/camera.js";
import { createStarLayers, drawStars } from "./rendering/stars.js";
import { drawPlanetDisk } from "./rendering/planet.js";
import { drawSun } from "./rendering/sun.js";
import { drawHud } from "./rendering/hud.js";
import { drawDebugHud } from "./rendering/debug-hud.js";
import { drawSurfaceObjects } from "./rendering/structures.js";
import { updateEffects, drawEffects } from "./rendering/effects.js";
import { applyGlideCushion, computeTotalGravity } from "./simulation/physics.js";
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
  // Toggle debug mode with 'D'
  if (e.code === "KeyD") {
    config.debug.enabled = !config.debug.enabled;
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

  // Apply multi-body gravity (all planets + sun)
  const gravity = computeTotalGravity(ship.pos, universe.planets, universe.sun);
  ship.vel.add(gravity.mul(dt));

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

  // Update atmospheric effects for nearest planet
  if (planet && info) {
    const effects = universe.effects.get(planet);
    if (effects) {
      updateEffects(effects, dt, cam, planet, info.tAtmo);
    }
  }
  const speed = ship.vel.len();

  // Apply easing curves for smoother atmosphere transitions
  let skyBlend = 0;
  let starFade = 0;
  if (info) {
    // Eased sky color blend (slower at start, faster near surface)
    // Near surface (tAtmo=1), blend fully to sky color
    const t = info.tAtmo;
    skyBlend = Math.pow(t, 1 / config.visuals.atmoSkyBlendCurve) * 0.95;
    // Eased star fade (more dramatic drop in atmosphere)
    starFade = Math.pow(t * 0.9, config.visuals.atmoStarFadeCurve);
  }
  starFade = clamp(starFade, 0, 1);

  const skyColor = info
    ? mixRgb(config.visuals.spaceBg, planet.colors.sky, skyBlend)
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

  // Apply atmospheric haze overlay when inside atmosphere (independent of view direction)
  // This compensates for the planet disk's atmosphere glow that only shows when looking at surface
  if (info && info.tAtmo > 0.01) {
    // Use halo color for outer haze, matching planet disk atmosphere rendering
    const hazeAlpha = info.tAtmo * 0.25;
    ctx.globalAlpha = hazeAlpha;
    ctx.fillStyle = planet.colors.halo;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.globalAlpha = 1.0;
  }

  // Collect drawable objects with camera distance for depth sorting
  const drawables = [];

  // Add sun
  const sunDist = Vec3.sub(universe.sun.position, cam.C).len();
  drawables.push({
    type: 'sun',
    distance: sunDist,
    draw: () => drawSun(ctx, cam, universe.sun, config.camera.nearPlane),
  });

  // Add planets
  for (const p of universe.planets) {
    const planetDist = Vec3.sub(p.position, cam.C).len();
    const tAtmo = planet && p === planet ? info.tAtmo : 0;
    drawables.push({
      type: 'planet',
      distance: planetDist,
      planet: p,
      tAtmo: tAtmo,
      draw: () => drawPlanetDisk(ctx, cam, p, tAtmo, universe.sun, config.camera.nearPlane, config),
    });
  }

  // Add surface objects for nearest planet (only if we have it)
  // Objects are rendered as a batch after all planets for proper occlusion
  if (planet && info) {
    const objects = universe.surfaceObjects.get(planet);
    if (objects) {
      // Use the planet's distance as the reference, but subtract a small amount
      // so objects render after (on top of) the planet disk
      const planetDist = Vec3.sub(planet.position, cam.C).len();
      const objectDist = planetDist - 0.1;
      drawables.push({
        type: 'objects',
        distance: objectDist,
        draw: () => drawSurfaceObjects(ctx, cam, planet, objects, info.altitude, config.camera.nearPlane, config),
      });
    }

    // Add atmospheric effects (render after surface objects, before HUD)
    const effects = universe.effects.get(planet);
    if (effects && info.tAtmo > 0) {
      const planetDist = Vec3.sub(planet.position, cam.C).len();
      drawables.push({
        type: 'effects',
        distance: planetDist - 0.2,
        draw: () => drawEffects(ctx, cam, effects, planet, info.tAtmo, config.camera.nearPlane, config),
      });
    }
  }

  // Sort by distance (farthest first, so nearest renders on top)
  drawables.sort((a, b) => b.distance - a.distance);

  // Draw in sorted order
  for (const drawable of drawables) {
    drawable.draw();
  }

  const altitude = info?.altitude ?? 0;
  drawHud(ctx, canvas, ship, altitude, speed, pointerLocked, keys, planet, cam, info);

  if (config.debug.enabled) {
    drawDebugHud(ctx, canvas, ship, planet, cam, universe, info);
  }

  if (turboShakeActive) {
    ctx.restore();
  }

  requestAnimationFrame(step);
}

requestAnimationFrame(step);
