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

  // Calculate sun direction in camera space
  const sunDir = sun.direction;
  const sunInCam = {
    x: Vec3.dot(sunDir, cam.R),
    y: Vec3.dot(sunDir, cam.U),
    z: Vec3.dot(sunDir, cam.F),
  };

  // Terminator angle (rotation of the light/dark division on screen)
  // Note: Canvas Y is flipped (down is positive), so negate sunInCam.y
  const terminatorAngle = Math.atan2(-sunInCam.y, sunInCam.x);

  // How much the sun is facing us vs to the side
  // sunInCam.z > 0 means sun is in front (we see lit side)
  // sunInCam.z < 0 means sun is behind (we see dark side)
  const sunDepth = sunInCam.z;

  // The terminator ellipse width depends on how "edge-on" we view the lighting
  // When sun is directly to side (z=0), terminator is a line (ellipse width = 0)
  // When sun is in front/behind (z=±1), we see full lit/dark (ellipse = full circle)
  const lateralLen = Math.sqrt(sunInCam.x * sunInCam.x + sunInCam.y * sunInCam.y);
  const ellipseRatio = Math.abs(sunDepth) / Math.max(0.001, Math.sqrt(sunDepth * sunDepth + lateralLen * lateralLen));

  ctx.save();

  // Draw dark side as base
  ctx.fillStyle = planet.colors.surfaceDark || mulRgb(planet.colors.surface, 0.5);
  ctx.beginPath();
  ctx.arc(pr.sx, pr.sy, rPlanet, 0, Math.PI * 2);
  ctx.fill();

  // Draw lit side using ellipse clipping
  ctx.fillStyle = planet.colors.surface;
  ctx.beginPath();

  if (sunDepth > 0.01) {
    // Sun is in front - lit side faces us
    // Draw lit crescent on sun-facing side
    ctx.save();
    ctx.translate(pr.sx, pr.sy);
    ctx.rotate(terminatorAngle);
    // Half circle on lit side (toward sun direction, which is +x after rotation)
    ctx.arc(0, 0, rPlanet, -Math.PI / 2, Math.PI / 2);
    // Elliptical arc back (the terminator curve)
    ctx.ellipse(0, 0, rPlanet * ellipseRatio, rPlanet, 0, Math.PI / 2, -Math.PI / 2, true);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  } else if (sunDepth < -0.01) {
    // Sun is behind - dark side faces us
    // Draw lit crescent on the far side (away from camera, toward sun)
    ctx.save();
    ctx.translate(pr.sx, pr.sy);
    ctx.rotate(terminatorAngle);
    // Half circle on lit side (opposite to camera)
    ctx.arc(0, 0, rPlanet, Math.PI / 2, -Math.PI / 2);
    // Elliptical arc back (the terminator curve)
    ctx.ellipse(0, 0, rPlanet * ellipseRatio, rPlanet, 0, -Math.PI / 2, Math.PI / 2, true);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  } else {
    // Sun is roughly to the side - simple half/half split
    // Lit side is toward the sun (+x direction after rotation by terminatorAngle)
    ctx.save();
    ctx.translate(pr.sx, pr.sy);
    ctx.rotate(terminatorAngle);
    ctx.arc(0, 0, rPlanet, -Math.PI / 2, Math.PI / 2);
    ctx.fill();
    ctx.restore();
  }

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
