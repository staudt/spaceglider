import { Vec3, randRange } from "../core/math.js";
import { projectPoint } from "./camera.js";

export function createStarLayers(config) {
  // Center stars around ship's starting position to avoid "explosion" on first frames
  const startPos = config.ship.startPosition;
  const layers = [];
  for (const L of config.stars.layers) {
    // Effective center accounts for parallax (same as rendering)
    const effCenter = {
      x: startPos[0] * L.parallax,
      y: startPos[1] * L.parallax,
      z: startPos[2] * L.parallax,
    };
    const stars = [];
    for (let i = 0; i < L.count; i++) {
      stars.push({
        p: new Vec3(
          effCenter.x + randRange(-L.halfSize, L.halfSize),
          effCenter.y + randRange(-L.halfSize, L.halfSize),
          effCenter.z + randRange(-L.halfSize, L.halfSize)
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

export function drawStars(ctx, canvas, cam, starLayers, starFade, nearPlane, speed = 0, turboSpeed = 4000) {
  ctx.save();
  ctx.fillStyle = "rgb(230,230,230)";
  ctx.strokeStyle = "rgb(230,230,230)";
  const w = canvas.width;
  const h = canvas.height;

  // Calculate trail length based on speed (0 at cruise, max at turbo)
  const speedRatio = Math.min(speed / turboSpeed, 1);
  const trailFactor = speedRatio * speedRatio; // Quadratic for more dramatic effect at high speed

  for (const L of starLayers) {
    const effC = Vec3.mul(cam.C, L.parallax);
    const effCam = { ...cam, C: effC };
    const alpha = (1 - starFade) * (0.25 + 0.75 * L.parallax);
    ctx.globalAlpha = alpha;

    // Trail length scales with parallax (closer stars = longer trails)
    const maxTrailLen = 40 * L.parallax;
    const trailLen = maxTrailLen * trailFactor;

    for (const st of L.stars) {
      wrapStar(st.p, effC, L.halfSize);
      const pr = projectPoint(st.p, effCam, nearPlane);
      if (!pr) continue;
      if (pr.sx < -50 || pr.sx > w + 50 || pr.sy < -50 || pr.sy > h + 50)
        continue;

      if (trailLen > 1) {
        // Draw star trail - line from star toward screen center (motion blur effect)
        // Direction is from screen edge toward center (stars appear to rush past)
        const cx = w / 2;
        const cy = h / 2;
        const dx = pr.sx - cx;
        const dy = pr.sy - cy;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist > 1) {
          // Trail extends outward from center (stars streak away from center)
          const nx = dx / dist;
          const ny = dy / dist;
          const tx = pr.sx + nx * trailLen;
          const ty = pr.sy + ny * trailLen;

          ctx.lineWidth = st.s * 0.7;
          ctx.beginPath();
          ctx.moveTo(pr.sx, pr.sy);
          ctx.lineTo(tx, ty);
          ctx.stroke();
        }
      } else {
        // Normal star dot
        ctx.fillRect(pr.sx, pr.sy, st.s, st.s);
      }
    }
  }

  ctx.restore();
}
