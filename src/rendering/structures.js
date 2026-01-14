import { Vec3, randRange } from "../core/math.js";
import { projectPoint } from "./camera.js";

/**
 * Convert spherical coordinates to world position on planet surface
 */
function sphericalToWorld(lat, lon, height, planet) {
  const r = planet.radius + height;
  return new Vec3(
    planet.position.x + r * Math.cos(lat) * Math.cos(lon),
    planet.position.y + r * Math.sin(lat),
    planet.position.z + r * Math.cos(lat) * Math.sin(lon)
  );
}

/**
 * Get the local "up" direction at a point on the planet surface
 */
function getLocalUp(worldPos, planet) {
  return Vec3.sub(worldPos, planet.position).norm();
}

/**
 * Get a tangent vector perpendicular to local up (for structure width)
 */
function getLocalTangent(localUp) {
  // Cross with world Y to get a horizontal tangent, unless up is nearly Y
  const worldY = new Vec3(0, 1, 0);
  let tangent = Vec3.cross(localUp, worldY);
  if (tangent.len() < 0.01) {
    // Up is nearly Y, use X instead
    tangent = Vec3.cross(localUp, new Vec3(1, 0, 0));
  }
  return tangent.norm();
}

/**
 * Generate random surface objects for a planet
 */
export function createSurfaceObjects(planet, config) {
  const objects = [];
  const { count, colors } = config.structures;

  for (let i = 0; i < count; i++) {
    // Random position on sphere using spherical coordinates
    // Concentrate more near equator for visibility
    const lat = (Math.random() - 0.5) * Math.PI * 0.6; // -54 to +54 degrees
    const lon = Math.random() * Math.PI * 2; // Full longitude

    // Random structure properties
    const isTower = Math.random() > 0.4;
    const height = isTower ? randRange(100, 200) : randRange(40, 80);
    const baseWidth = isTower ? randRange(15, 30) : randRange(30, 60);
    const color = colors[Math.floor(Math.random() * colors.length)];

    objects.push({
      lat,
      lon,
      height,
      baseWidth,
      color,
      type: isTower ? "tower" : "pylon",
    });
  }

  return objects;
}

/**
 * Draw surface objects (towers, pylons) on the planet
 */
export function drawSurfaceObjects(ctx, cam, planet, objects, altitude, nearPlane, config) {
  const maxAlt = config.structures.maxVisibleAltitude;

  // Don't render if too high
  if (altitude > maxAlt) return;

  // Fade based on altitude (full opacity below 500m, fading to 0 at maxAlt)
  const altFade = Math.max(0, 1 - altitude / maxAlt);

  // Vector from planet center to camera
  const planetToCamera = Vec3.sub(cam.C, planet.position);
  const distToCenter = planetToCamera.len();
  const planetToCamNorm = Vec3.mul(planetToCamera, 1 / distToCenter);

  // Geometric horizon calculation:
  // From camera at distance d from planet center with radius r,
  // the horizon is where cos(theta) = r/d
  // Objects are visible only if their dot product with camera direction > r/d
  // Add small margin to hide objects right at the visible edge
  const horizonCos = planet.radius / distToCenter;
  const horizonThreshold = horizonCos + 0.02;

  ctx.save();

  for (const obj of objects) {
    // Get base center position on planet surface
    const baseCenter = sphericalToWorld(obj.lat, obj.lon, 0, planet);

    // Check if object is on the visible side of the planet (not occluded)
    // Object is visible if it's on the camera-facing hemisphere
    const planetToObj = Vec3.sub(baseCenter, planet.position).norm();
    const dotProduct = Vec3.dot(planetToObj, planetToCamNorm);

    // Skip objects beyond the visible horizon
    if (dotProduct < horizonThreshold) continue;

    // Ray-sphere intersection test to check if line of sight is occluded by planet
    // This catches edge cases where dot product test passes but object is still behind limb
    const camToBase = Vec3.sub(baseCenter, cam.C);
    const distToBase = camToBase.len();
    const rayDir = Vec3.mul(camToBase, 1 / distToBase);

    // Check if ray from camera toward object intersects planet sphere
    // Using simplified ray-sphere intersection: find closest point on ray to planet center
    const camToPlanet = Vec3.sub(planet.position, cam.C);
    const tClosest = Vec3.dot(camToPlanet, rayDir);

    // Only check occlusion if the closest approach is between camera and object
    if (tClosest > 0 && tClosest < distToBase) {
      const closestPoint = Vec3.add(cam.C, Vec3.mul(rayDir, tClosest));
      const distToPlanetCenter = Vec3.sub(closestPoint, planet.position).len();
      // If ray passes through planet (closest point is inside radius), object is occluded
      if (distToPlanetCenter < planet.radius) continue;
    }

    // Get local coordinate system at this point on the sphere
    const localUp = getLocalUp(baseCenter, planet);
    const localRight = getLocalTangent(localUp);

    // Calculate the 4 base corners and 4 top corners in world space
    const hw = obj.baseWidth * 0.5; // half-width
    const twFactor = obj.type === "tower" ? 0.4 : 1.0; // taper for towers
    const thw = hw * twFactor; // top half-width

    // Base corners (on surface)
    const b0 = Vec3.add(baseCenter, Vec3.mul(localRight, -hw));
    const b1 = Vec3.add(baseCenter, Vec3.mul(localRight, hw));

    // Top center (base + height along local up)
    const topCenter = Vec3.add(baseCenter, Vec3.mul(localUp, obj.height));
    const t0 = Vec3.add(topCenter, Vec3.mul(localRight, -thw));
    const t1 = Vec3.add(topCenter, Vec3.mul(localRight, thw));

    // Project all points
    const pb0 = projectPoint(b0, cam, nearPlane);
    const pb1 = projectPoint(b1, cam, nearPlane);
    const pt0 = projectPoint(t0, cam, nearPlane);
    const pt1 = projectPoint(t1, cam, nearPlane);

    // Skip if any point is behind camera
    if (!pb0 || !pb1 || !pt0 || !pt1) continue;

    // Calculate screen size for culling (use base width)
    const screenWidth = Math.abs(pb1.sx - pb0.sx);
    if (screenWidth < 2) continue;

    // Distance-based opacity (use base center depth)
    const avgZ = (pb0.zCam + pb1.zCam) / 2;
    const distFade = Math.min(1, 800 / avgZ);
    const alpha = altFade * distFade * 0.9;

    if (alpha < 0.05) continue;

    ctx.globalAlpha = alpha;
    ctx.strokeStyle = obj.color;
    ctx.lineWidth = Math.max(1, screenWidth * 0.06);

    // Draw wireframe structure
    ctx.beginPath();

    // Left edge
    ctx.moveTo(pb0.sx, pb0.sy);
    ctx.lineTo(pt0.sx, pt0.sy);

    // Right edge
    ctx.moveTo(pb1.sx, pb1.sy);
    ctx.lineTo(pt1.sx, pt1.sy);

    // Base line
    ctx.moveTo(pb0.sx, pb0.sy);
    ctx.lineTo(pb1.sx, pb1.sy);

    // Top line
    ctx.moveTo(pt0.sx, pt0.sy);
    ctx.lineTo(pt1.sx, pt1.sy);

    // Cross brace for pylons
    if (obj.type === "pylon") {
      ctx.moveTo(pb0.sx, pb0.sy);
      ctx.lineTo(pt1.sx, pt1.sy);
      ctx.moveTo(pb1.sx, pb1.sy);
      ctx.lineTo(pt0.sx, pt0.sy);
    }

    ctx.stroke();
  }

  ctx.restore();
}

