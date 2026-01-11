import { Vec3, randRange } from "../core/math.js";
import { projectPoint } from "./camera.js";

export function createStarLayers(config) {
  const layers = [];
  for (const L of config.stars.layers) {
    const stars = [];
    for (let i = 0; i < L.count; i++) {
      stars.push({
        p: new Vec3(
          randRange(-L.halfSize, L.halfSize),
          randRange(-L.halfSize, L.halfSize),
          randRange(-L.halfSize, L.halfSize)
        ),
        s: randRange(L.sizeMin, L.sizeMax),
      });
    }
    layers.push({ ...L, stars });
  }
  return layers;
}

function wrapStar(p, center, halfSize) {
  if (p.x - center.x > halfSize) p.x -= 2 * halfSize;
  if (p.x - center.x < -halfSize) p.x += 2 * halfSize;
  if (p.y - center.y > halfSize) p.y -= 2 * halfSize;
  if (p.y - center.y < -halfSize) p.y += 2 * halfSize;
  if (p.z - center.z > halfSize) p.z -= 2 * halfSize;
  if (p.z - center.z < -halfSize) p.z += 2 * halfSize;
}

export function drawStars(ctx, canvas, cam, starLayers, starFade, nearPlane) {
  ctx.save();
  ctx.fillStyle = "rgb(230,230,230)";
  const w = canvas.width;
  const h = canvas.height;

  for (const L of starLayers) {
    const effC = Vec3.mul(cam.C, L.parallax);
    const effCam = { ...cam, C: effC };
    const alpha = (1 - starFade) * (0.25 + 0.75 * L.parallax);
    ctx.globalAlpha = alpha;

    for (const st of L.stars) {
      wrapStar(st.p, effC, L.halfSize);
      const pr = projectPoint(st.p, effCam, nearPlane);
      if (!pr) continue;
      if (pr.sx < -20 || pr.sx > w + 20 || pr.sy < -20 || pr.sy > h + 20)
        continue;
      ctx.fillRect(pr.sx, pr.sy, st.s, st.s);
    }
  }

  ctx.restore();
}
