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

  // Calculate distance-based atmosphere fade
  // pr.zCam is the distance from camera to planet center
  const distanceInRadii = pr.zCam / planet.radius;
  const visibleDist = config.visuals.atmoVisibleDistance;
  const fullDist = config.visuals.atmoFullDistance;

  // Fade from 0 (at visibleDist) to 1 (at fullDist or closer)
  let atmoFade = 0;
  if (distanceInRadii < visibleDist) {
    atmoFade = 1 - (distanceInRadii - fullDist) / (visibleDist - fullDist);
    atmoFade = Math.max(0, Math.min(1, atmoFade));
    // Apply easing for smoother appearance
    atmoFade = atmoFade * atmoFade * (3 - 2 * atmoFade); // smoothstep
  }

  // Only render atmosphere effects if visible
  if (atmoFade > 0.01) {
    ctx.save();

    // Atmosphere bounds outer circle
    ctx.globalAlpha = (0.12 + 0.2 * tAtmo) * atmoFade;
    ctx.fillStyle = planet.colors.halo;
    ctx.beginPath();
    ctx.arc(pr.sx, pr.sy, rAtmo, 0, Math.PI * 2);
    ctx.fill();

    // Atmosphere ring hint
    ctx.globalAlpha = (0.2 + 0.25 * tAtmo) * atmoFade;
    ctx.strokeStyle = planet.colors.halo;
    ctx.lineWidth = Math.max(1, rAtmo * 0.01);
    ctx.beginPath();
    ctx.arc(pr.sx, pr.sy, rAtmo * 0.995, 0, Math.PI * 2);
    ctx.stroke();

    // Atmospheric glow (brightens when closer to planet)
    const glowAlpha = tAtmo * config.visuals.atmosphereGlowIntensity * atmoFade;
    if (glowAlpha > 0.02) {
      ctx.globalAlpha = glowAlpha;
      ctx.fillStyle = planet.colors.sky;
      ctx.beginPath();
      ctx.arc(pr.sx, pr.sy, rAtmo * 1.05, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }

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

// 3D checkerboard overlay for simpler motion perception
export function drawPlanetSurface(ctx, cam, planet, tAtmo, sun, config, nearPlane) {
  if (tAtmo <= 0.01) return;

  const segments = config.visuals.checkerGrid?.segments || 32;
  const alpha = config.visuals.checkerGrid?.alpha || 0.1;

  // Optimization: Only render if we are close enough
  // tAtmo is 0..1, where 1 is at surface

  const camToPlanet = Vec3.sub(planet.position, cam.C);
  const dist = camToPlanet.len();

  // Calculate sun direction for lighting-based color selection
  const planetToSun = Vec3.sub(sun.position, planet.position).norm();

  // Project planet center to get screen-space clipping circle
  const pr = projectPoint(planet.position, cam, nearPlane || 0.1);
  if (!pr) return;

  const rPlanet = (planet.radius / pr.zCam) * cam.focal;

  // Coordinate frame for the planet
  // We can use fixed axes since planets don't rotate in this simulation yet
  // But we want to align poles with Y for standard appearance

  ctx.save();
  ctx.globalAlpha = alpha * tAtmo; // Fade in with atmosphere

  // Clip to planet disk so tiles don't extend beyond the visible edge
  ctx.beginPath();
  ctx.arc(pr.sx, pr.sy, rPlanet, 0, Math.PI * 2);
  ctx.clip();

  // Render spherical grid
  // We only render the front-facing quads

  // Precompute sin/cos for optimization
  // We could cache this but for <100 segments it's cheap enough

  // We can view this as stepping through Latitude (phi) and Longitude (theta)
  // Phi: -PI/2 to PI/2 (South Pole to North Pole)
  // Theta: 0 to 2PI (Around equator)

  const radius = planet.radius;

  for (let i = 0; i < segments; i++) { // Latitude
    const lat1 = -Math.PI / 2 + (Math.PI * i) / segments;
    const lat2 = -Math.PI / 2 + (Math.PI * (i + 1)) / segments;

    const sinLat1 = Math.sin(lat1);
    const cosLat1 = Math.cos(lat1);
    const sinLat2 = Math.sin(lat2);
    const cosLat2 = Math.cos(lat2);

    for (let j = 0; j < segments * 2; j++) { // Longitude (2x segments for aspect ratio)
      // Check pattern: skip every other one
      if ((i + j) % 2 !== 0) continue;

      const lon1 = (Math.PI * 2 * j) / (segments * 2);
      const lon2 = (Math.PI * 2 * (j + 1)) / (segments * 2);

      const sinLon1 = Math.sin(lon1);
      const cosLon1 = Math.cos(lon1);
      const sinLon2 = Math.sin(lon2);
      const cosLon2 = Math.cos(lon2);

      // Calculate 4 corners of the quad on unit sphere
      // x = cosLat * cosLon
      // y = sinLat   (Up axis)
      // z = cosLat * sinLon

      // We need world space positions
      // P = PlanetPos + Radius * SpherePoint

      // Compute center for culling
      const avgLat = (lat1 + lat2) / 2;
      const avgLon = (lon1 + lon2) / 2;
      const normal = new Vec3(
        Math.cos(avgLat) * Math.cos(avgLon),
        Math.sin(avgLat),
        Math.cos(avgLat) * Math.sin(avgLon)
      );

      // Backface culling: check if surface normal faces the camera
      // For a point on the sphere surface at position P = PlanetCenter + R * normal,
      // we need to check if the view vector (Camera - P) has positive dot with normal.
      //
      // ViewDir = Camera - (PlanetCenter + R * normal)
      //         = (Camera - PlanetCenter) - R * normal
      //         = -camToPlanet - R * normal
      //
      // dot(normal, ViewDir) = dot(normal, -camToPlanet) - R
      //                      = -dot(normal, camToPlanet) - R
      //
      // Visible when: -dot(normal, camToPlanet) - R > 0
      //           =>  -dot(normal, camToPlanet) > R
      //           =>  dot(normal, -camToPlanet) > R

      const dotPlanetToCamera = normal.x * -camToPlanet.x + normal.y * -camToPlanet.y + normal.z * -camToPlanet.z;

      // Cull if the surface point's normal doesn't face the camera
      // The threshold is the planet radius - this accounts for the surface point offset
      if (dotPlanetToCamera <= radius) continue;

      // Project the 4 corners
      // Corner 1
      const p1 = new Vec3(
        planet.position.x + radius * cosLat1 * cosLon1,
        planet.position.y + radius * sinLat1,
        planet.position.z + radius * cosLat1 * sinLon1
      );

      // Corner 2
      const p2 = new Vec3(
        planet.position.x + radius * cosLat1 * cosLon2,
        planet.position.y + radius * sinLat1,
        planet.position.z + radius * cosLat1 * sinLon2
      );

      // Corner 3
      const p3 = new Vec3(
        planet.position.x + radius * cosLat2 * cosLon2,
        planet.position.y + radius * sinLat2,
        planet.position.z + radius * cosLat2 * sinLon2
      );

      // Corner 4
      const p4 = new Vec3(
        planet.position.x + radius * cosLat2 * cosLon1,
        planet.position.y + radius * sinLat2,
        planet.position.z + radius * cosLat2 * sinLon1
      );

      // Project to screen
      const pp1 = projectPoint(p1, cam, 0.1);
      const pp2 = projectPoint(p2, cam, 0.1);
      const pp3 = projectPoint(p3, cam, 0.1);
      const pp4 = projectPoint(p4, cam, 0.1);

      // If any point is behind camera (null), skip quad
      // (Advanced: should clip, but simple skip is fine for small quads)
      if (!pp1 || !pp2 || !pp3 || !pp4) continue;

      // Draw Quad
      ctx.beginPath();
      ctx.moveTo(pp1.sx, pp1.sy);
      ctx.lineTo(pp2.sx, pp2.sy);
      ctx.lineTo(pp3.sx, pp3.sy);
      ctx.lineTo(pp4.sx, pp4.sy);
      ctx.closePath();
      ctx.fill();
    }
  }

  ctx.restore();
}
