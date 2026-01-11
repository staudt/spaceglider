import { clamp } from "./core/math.js";
import { config } from "./core/config.js";
import { canvas, ctx } from "./rendering/canvas.js";
import { createCamera, mixRgb } from "./rendering/camera.js";
import { createStarLayers, drawStars } from "./rendering/stars.js";
import { drawPlanetDisk } from "./rendering/planet.js";
import { drawSun } from "./rendering/sun.js";
import { drawHud } from "./rendering/hud.js";
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

  const starFade = info ? clamp(info.tAtmo * 0.9, 0, 1) : 0;
  const skyColor = info
    ? mixRgb(config.visuals.spaceBg, planet.colors.sky, info.tAtmo * 0.7)
    : config.visuals.spaceBg;

  ctx.fillStyle = skyColor;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  drawStars(ctx, canvas, cam, starLayers, starFade, config.camera.nearPlane);
  drawSun(ctx, cam, universe.sun, config.camera.nearPlane);

  if (planet && info) {
    drawPlanetDisk(ctx, cam, planet, info.tAtmo, universe.sun, config.camera.nearPlane);
  }

  const altitude = info?.altitude ?? 0;
  const speed = ship.vel.len();
  drawHud(ctx, canvas, ship, altitude, speed, pointerLocked, keys);

  requestAnimationFrame(step);
}

requestAnimationFrame(step);
