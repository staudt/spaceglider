import { Vec3 } from "../core/math.js";
import { projectPoint, mulRgb } from "./camera.js";

// Draw a small indicator for distant planets (always visible with minimum size)
export function drawPlanetIndicator(ctx, cam, planet, nearPlane) {
  const pr = projectPoint(planet.position, cam, nearPlane);
  if (!pr) return;

  const rPlanet = Math.max(6, (planet.radius / pr.zCam) * cam.focal);
  const rAtmo = rPlanet * 1.2;

  // Draw as a simple colored disk for distant planets
  ctx.fillStyle = planet.colors.surface;
  ctx.globalAlpha = 0.8;
  ctx.beginPath();
  ctx.arc(pr.sx, pr.sy, rAtmo, 0, Math.PI * 2);
  ctx.fill();

  // Subtle halo for visibility
  ctx.strokeStyle = planet.colors.halo;
  ctx.globalAlpha = 0.3;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.arc(pr.sx, pr.sy, rAtmo + 2, 0, Math.PI * 2);
  ctx.stroke();

  ctx.globalAlpha = 1.0;
}

export function drawPlanetDisk(ctx, cam, planet, tAtmo, sun, nearPlane, config) {
  const pr = projectPoint(planet.position, cam, nearPlane);
  if (!pr) return;

  const rPlanet = (planet.radius / pr.zCam) * cam.focal;
  const rAtmo = (planet.atmosphereRadius / pr.zCam) * cam.focal;

  // Use indicator if planet is too small for detail rendering
  if (rAtmo < 8) {
    drawPlanetIndicator(ctx, cam, planet, nearPlane);
    return;
  }

  ctx.save();

  // Atmosphere bounds outer circle
  ctx.globalAlpha = 0.12 + 0.2 * tAtmo;
  ctx.fillStyle = planet.colors.halo;
  ctx.beginPath();
  ctx.arc(pr.sx, pr.sy, rAtmo, 0, Math.PI * 2);
  ctx.fill();

  // Atmosphere ring hint
  ctx.globalAlpha = 0.2 + 0.25 * tAtmo;
  ctx.strokeStyle = planet.colors.halo;
  ctx.lineWidth = Math.max(1, rAtmo * 0.01);
  ctx.beginPath();
  ctx.arc(pr.sx, pr.sy, rAtmo * 0.995, 0, Math.PI * 2);
  ctx.stroke();

  // Atmospheric glow (brightens when closer to planet)
  const glowAlpha = tAtmo * config.visuals.atmosphereGlowIntensity;
  if (glowAlpha > 0.02) {
    ctx.globalAlpha = glowAlpha;
    ctx.fillStyle = planet.colors.sky;
    ctx.beginPath();
    ctx.arc(pr.sx, pr.sy, rAtmo * 1.05, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();

  if (rPlanet < 0.5) return;

  // Calculate sun and camera directions from planet center
  const planetToSun = Vec3.sub(sun.position, planet.position).norm();
  const cameraToPlanet = Vec3.sub(planet.position, cam.C).norm();

  // Calculate terminator angle from sun-to-planet direction projected onto screen.
  // We project the sun's direction (from planet's perspective) onto the camera's screen plane (R,U axes).
  // This unified approach handles both visible sun and sun-behind-camera cases consistently.
  // Avoids discontinuities that occur when switching between two different projection methods.
  const sunScreenX = Vec3.dot(planetToSun, cam.R);
  const sunScreenY = Vec3.dot(planetToSun, cam.U);
  const terminatorAngle = Math.atan2(sunScreenY, sunScreenX);

  // phase: how much of the lit hemisphere faces the camera
  // +1 = camera on same side as sun (full lit), -1 = camera opposite sun (full dark)
  const phase = Vec3.dot(planetToSun, cameraToPlanet);

  ctx.save();

  // Draw dark side as base (full circle)
  ctx.fillStyle = planet.colors.surfaceDark || mulRgb(planet.colors.surface, 0.5);
  ctx.beginPath();
  ctx.arc(pr.sx, pr.sy, rPlanet, 0, Math.PI * 2);
  ctx.fill();

  // Draw the lit portion on top
  // After rotating by terminatorAngle, +x points toward the sun
  // The lit hemisphere is on the +x side of the terminator

  ctx.fillStyle = planet.colors.surface;
  ctx.save();
  ctx.translate(pr.sx, pr.sy);
  ctx.rotate(terminatorAngle);

  // termWidth: how curved the terminator appears (0 = straight line, rPlanet = full curve)
  const termWidth = Math.abs(phase) * rPlanet;

  ctx.beginPath();

  if (phase >= 0) {
    // Camera sees mostly lit side (camera on sun's side)
    // Draw semicircle on +x, close with ellipse curving into -x (dark side)
    ctx.arc(0, 0, rPlanet, -Math.PI / 2, Math.PI / 2);
    if (termWidth > 0.01) {
      // Ellipse curves into the dark side (-x), counterclockwise from bottom to top
      ctx.ellipse(0, 0, termWidth, rPlanet, 0, Math.PI / 2, -Math.PI / 2, true);
    }
    ctx.closePath();
    ctx.fill();
  } else {
    // Camera sees mostly dark side (camera opposite from sun)
    // Draw just a lit crescent on the +x edge
    // The crescent is bounded by the planet edge on +x and terminator curving into +x
    ctx.arc(0, 0, rPlanet, -Math.PI / 2, Math.PI / 2);
    if (termWidth > 0.01) {
      // Ellipse curves into the lit side (+x), clockwise from bottom to top
      ctx.ellipse(0, 0, termWidth, rPlanet, 0, Math.PI / 2, -Math.PI / 2, false);
    }
    ctx.closePath();
    ctx.fill();
  }

  ctx.restore();

  // Lit side rim highlight
  ctx.globalAlpha = 0.35;
  ctx.strokeStyle = mulRgb(planet.colors.surface, 1.3);
  ctx.lineWidth = Math.max(1, rPlanet * 0.025);
  ctx.beginPath();
  ctx.arc(
    pr.sx,
    pr.sy,
    rPlanet * 0.97,
    terminatorAngle - Math.PI / 2.5,
    terminatorAngle + Math.PI / 2.5
  );
  ctx.stroke();

  ctx.restore();
}
