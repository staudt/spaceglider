import { Vec3, clamp } from "../core/math.js";
import { createSurfaceObjects } from "../rendering/structures.js";

export function createSun(config) {
  const pos = config.sun.position;
  const position = new Vec3(pos[0], pos[1], pos[2]);
  // Direction for lighting (from center outward, normalized)
  const direction = new Vec3(0.5, 0.8, 0.3).norm();
  return {
    direction,
    position,
    color: config.sun.color,
    size: config.sun.size,
    GM: config.sun.GM,
  };
}

export function createPlanet(planetConfig) {
  const pos = planetConfig.position;
  return {
    name: planetConfig.name,
    position: new Vec3(pos[0], pos[1], pos[2]),
    radius: planetConfig.radius,
    atmosphereRadius: planetConfig.atmosphereRadius,
    GM: planetConfig.GM,
    colors: {
      surface: planetConfig.colors.surface,
      surfaceDark: planetConfig.colors.surfaceDark,
      sky: planetConfig.colors.sky,
      halo: planetConfig.colors.halo,
    },
    physics: {
      dragStrength: planetConfig.physics.dragStrength,
    },
  };
}

export function createUniverse(config) {
  // Create all planets from config array
  const planets = config.planets.map((p) => createPlanet(p));
  const sun = createSun(config);

  // Generate surface objects for each planet
  const surfaceObjects = new Map();
  for (const planet of planets) {
    surfaceObjects.set(planet, createSurfaceObjects(planet, config));
  }

  return { planets, sun, surfaceObjects };
}

export function nearestPlanetInfo(shipPos, planets) {
  let nearest = null;
  let minDist = Infinity;

  for (const planet of planets) {
    const d = Vec3.sub(planet.position, shipPos);
    const r = d.len();
    if (r < minDist) {
      minDist = r;
      nearest = { planet, d, r };
    }
  }

  if (!nearest) return null;

  const { planet, d, r } = nearest;
  const altitude = r - planet.radius;
  const tAtmo = clamp(
    (planet.atmosphereRadius - r) / (planet.atmosphereRadius - planet.radius),
    0,
    1
  );

  return { planet, d, r, altitude, tAtmo };
}
