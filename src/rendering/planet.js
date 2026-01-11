import { Vec3 } from "../core/math.js";
import { projectPoint, mulRgb } from "./camera.js";

export function drawPlanetDisk(ctx, cam, planet, tAtmo, sun, nearPlane) {
  const pr = projectPoint(planet.position, cam, nearPlane);
  if (!pr) return;

  const rPlanet = (planet.radius / pr.zCam) * cam.focal;
  const rAtmo = (planet.atmosphereRadius / pr.zCam) * cam.focal;

  if (rAtmo < 0.5) return;

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

  ctx.restore();

  if (rPlanet < 0.5) return;

  // Project sun position to screen to get the direction from planet to sun ON SCREEN
  const sunProj = projectPoint(sun.position, cam, nearPlane);

  let terminatorAngle;
  if (sunProj) {
    // Sun is visible - calculate angle from planet center to sun center on screen
    const dx = sunProj.sx - pr.sx;
    const dy = sunProj.sy - pr.sy;
    // The lit side faces toward the sun, terminator is perpendicular to this
    terminatorAngle = Math.atan2(dy, dx);
  } else {
    // Sun is behind camera - use the planet-to-sun direction projected onto screen plane
    const planetToSun = Vec3.sub(sun.position, planet.position).norm();
    const sunInCam = {
      x: Vec3.dot(planetToSun, cam.R),
      y: Vec3.dot(planetToSun, cam.U),
    };
    terminatorAngle = Math.atan2(-sunInCam.y, sunInCam.x);
  }

  // Calculate the phase angle to determine how much lit vs dark side we see
  const planetToSun = Vec3.sub(sun.position, planet.position).norm();
  const planetToCamera = Vec3.sub(cam.C, planet.position).norm();

  // phase: how much of the lit hemisphere faces the camera
  // +1 = camera on same side as sun (full lit), -1 = camera opposite sun (full dark)
  const phase = Vec3.dot(planetToSun, planetToCamera);

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
