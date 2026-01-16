import { Vec3 } from "../core/math.js";
import { projectPoint } from "./camera.js";

// Generate ring particles for a planet
export function createRingParticles(planet, ringConfig) {
  const particles = [];
  const { innerRadius, outerRadius, particleCount, colors, tilt } = ringConfig;

  // Ring normal (tilted from Y axis)
  const tiltRad = (tilt || 27) * Math.PI / 180; // Saturn's tilt is ~27 degrees
  const ringNormal = new Vec3(
    Math.sin(tiltRad),
    Math.cos(tiltRad),
    0
  );

  // Create orthonormal basis for ring plane
  // Ring lies in plane perpendicular to ringNormal
  const ringRight = new Vec3(0, 0, 1); // Z axis
  const ringForward = Vec3.cross(ringNormal, ringRight).norm();

  for (let i = 0; i < particleCount; i++) {
    // Random angle around the ring
    const angle = Math.random() * Math.PI * 2;

    // Random radius with bias toward outer regions (more particles in wider bands)
    // Use sqrt for uniform density across area
    const t = Math.random();
    const r = innerRadius + (outerRadius - innerRadius) * Math.sqrt(t);

    // Position in ring plane
    const x = Math.cos(angle) * r;
    const z = Math.sin(angle) * r;

    // Transform to world space using ring basis
    const worldOffset = new Vec3(
      ringRight.x * x + ringForward.x * z,
      ringRight.y * x + ringForward.y * z + ringNormal.y * (Math.random() - 0.5) * 50, // Small vertical scatter
      ringRight.z * x + ringForward.z * z
    );

    // Pick a color from the gradient
    const colorIndex = Math.floor(Math.random() * colors.length);
    const color = colors[colorIndex];

    // Vary particle size slightly
    const size = 0.5 + Math.random() * 1.5;

    // Orbital speed (faster when closer to planet)
    const orbitalSpeed = 0.00002 / Math.sqrt(r / innerRadius);

    particles.push({
      angle,
      radius: r,
      offsetY: (Math.random() - 0.5) * 100, // Vertical offset for thickness
      color,
      size,
      orbitalSpeed,
      brightness: 0.6 + Math.random() * 0.4,
    });
  }

  return {
    particles,
    ringNormal,
    ringRight,
    ringForward,
    tiltRad,
    innerRadius,
    outerRadius,
  };
}

// Update ring particle positions (orbital motion)
export function updateRings(ringData, dt) {
  for (const p of ringData.particles) {
    p.angle += p.orbitalSpeed * dt * 1000;
  }
}

// Draw ring particles
export function drawRings(ctx, cam, planet, ringData, sun, nearPlane) {
  const { particles, ringRight, ringForward, ringNormal, innerRadius, outerRadius } = ringData;

  // Calculate distance to planet for LOD
  const camToPlanet = Vec3.sub(planet.position, cam.C);
  const distToPlanet = camToPlanet.len();

  // Don't render if too far away
  if (distToPlanet > outerRadius * 50) return;

  // Calculate sun direction for lighting
  const planetToSun = Vec3.sub(sun.position, planet.position).norm();

  // Precompute for sphere intersection test
  const planetRadius = planet.radius;
  const planetRadiusSq = planetRadius * planetRadius;

  // Sort particles by distance from camera for proper transparency
  const sortedParticles = [];

  for (const p of particles) {
    const x = Math.cos(p.angle) * p.radius;
    const z = Math.sin(p.angle) * p.radius;

    // World position
    const worldPos = new Vec3(
      planet.position.x + ringRight.x * x + ringForward.x * z + ringNormal.x * p.offsetY,
      planet.position.y + ringRight.y * x + ringForward.y * z + ringNormal.y * p.offsetY,
      planet.position.z + ringRight.z * x + ringForward.z * z + ringNormal.z * p.offsetY
    );

    // Distance from camera
    const dx = worldPos.x - cam.C.x;
    const dy = worldPos.y - cam.C.y;
    const dz = worldPos.z - cam.C.z;
    const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);

    sortedParticles.push({ ...p, worldPos, dist });
  }

  // Sort back to front
  sortedParticles.sort((a, b) => b.dist - a.dist);

  ctx.save();

  for (const p of sortedParticles) {
    const proj = projectPoint(p.worldPos, cam, nearPlane);
    if (!proj) continue;

    // Ray-sphere occlusion test: check if the ray from camera to particle
    // intersects the planet sphere, and if so, if the intersection is closer
    // than the particle
    const rayDir = Vec3.sub(p.worldPos, cam.C);
    const rayLen = p.dist;
    const rayDirNorm = new Vec3(rayDir.x / rayLen, rayDir.y / rayLen, rayDir.z / rayLen);

    // Vector from camera to planet center
    const camToPlanetX = planet.position.x - cam.C.x;
    const camToPlanetY = planet.position.y - cam.C.y;
    const camToPlanetZ = planet.position.z - cam.C.z;

    // Project planet center onto ray: t = dot(camToPlanet, rayDirNorm)
    const t = camToPlanetX * rayDirNorm.x + camToPlanetY * rayDirNorm.y + camToPlanetZ * rayDirNorm.z;

    // Closest point on ray to planet center
    const closestX = cam.C.x + rayDirNorm.x * t;
    const closestY = cam.C.y + rayDirNorm.y * t;
    const closestZ = cam.C.z + rayDirNorm.z * t;

    // Distance from closest point to planet center
    const distToClosestX = closestX - planet.position.x;
    const distToClosestY = closestY - planet.position.y;
    const distToClosestZ = closestZ - planet.position.z;
    const distToClosestSq = distToClosestX * distToClosestX + distToClosestY * distToClosestY + distToClosestZ * distToClosestZ;

    // If ray passes through planet sphere and intersection is closer than particle, occlude
    if (distToClosestSq < planetRadiusSq && t > 0 && t < rayLen) {
      // Calculate actual intersection distance
      const halfChord = Math.sqrt(planetRadiusSq - distToClosestSq);
      const intersectDist = t - halfChord;

      // If planet surface is closer than particle, skip this particle
      if (intersectDist > 0 && intersectDist < rayLen) {
        continue;
      }
    }

    // Calculate lighting based on sun angle
    const particleNormal = ringNormal; // Simplified - particles face up
    const sunDot = Math.abs(Vec3.dot(particleNormal, planetToSun));
    const lighting = 0.3 + 0.7 * sunDot;

    // Distance-based alpha and size
    const distFactor = Math.min(1, outerRadius * 5 / p.dist);
    const alpha = p.brightness * lighting * distFactor * 0.8;

    // Screen size based on distance
    const screenSize = Math.max(1, (p.size * 50 / proj.zCam) * cam.focal);

    ctx.globalAlpha = alpha;
    ctx.fillStyle = p.color;
    ctx.beginPath();
    ctx.arc(proj.sx, proj.sy, screenSize, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();
}
