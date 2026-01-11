import { projectPoint, mulRgb } from "./camera.js";

export function drawPlanetDisk(ctx, cam, planet, tAtmo, nearPlane) {
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

  ctx.save();

  // Planet body inner circle
  ctx.fillStyle = planet.colors.surface;
  ctx.beginPath();
  ctx.arc(pr.sx, pr.sy, rPlanet, 0, Math.PI * 2);
  ctx.fill();

  // Rim
  ctx.globalAlpha = 0.28;
  ctx.strokeStyle = mulRgb(planet.colors.surface, 1.25);
  ctx.lineWidth = Math.max(1, rPlanet * 0.02);
  ctx.beginPath();
  ctx.arc(pr.sx, pr.sy, rPlanet * 0.985, 0, Math.PI * 2);
  ctx.stroke();

  ctx.restore();
}
