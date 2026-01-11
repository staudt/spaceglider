import { projectPoint } from "./camera.js";

export function drawSun(ctx, cam, sun, nearPlane) {
  const pr = projectPoint(sun.position, cam, nearPlane);
  if (!pr) return;

  const rSun = (sun.size / pr.zCam) * cam.focal;
  if (rSun < 0.5) return;

  ctx.save();

  // Simple flat sun disk like in Starglider 2
  ctx.fillStyle = sun.color;
  ctx.beginPath();
  ctx.arc(pr.sx, pr.sy, rSun, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}
