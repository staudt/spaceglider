import { Vec3, clamp } from "../core/math.js";
import { createSurfaceObjects } from "../rendering/structures.js";
import { createPlanetEffects } from "../rendering/effects.js";
import { createRingParticles } from "../rendering/rings.js";
import { initializeOrbits, calculateOrbitalPosition } from "../simulation/orbits.js";

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

export function createPlanet(planetConfig, sunPosition, orbitalTimeScale) {
  // Calculate initial position from orbital parameters
  let position;
  if (planetConfig.orbit && planetConfig.orbit.parent === null) {
    // Planet orbiting sun - calculate initial position
    position = calculateOrbitalPosition(
      planetConfig.orbit,
      0,
      sunPosition,
      orbitalTimeScale
    );
  } else {
    // Moon or body without orbit - position will be set later
    position = new Vec3(0, 0, 0);
  }

  return {
    name: planetConfig.name,
    position: position,
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
  const sun = createSun(config);
  const orbitalTimeScale = config.time.orbitalTimeScale || 1;

  // Create all planets from config array
  const planets = config.planets.map((p) => createPlanet(p, sun.position, orbitalTimeScale));

  // Initialize orbital mechanics
  const orbitalState = initializeOrbits(config.planets, sun.position);

  // Set initial positions for moons (need parent positions first)
  // Build a lookup for planet positions by name
  const planetByName = new Map();
  for (const planet of planets) {
    planetByName.set(planet.name, planet);
  }

  // Calculate initial moon positions
  for (let i = 0; i < config.planets.length; i++) {
    const cfg = config.planets[i];
    const planet = planets[i];

    if (cfg.orbit && cfg.orbit.parent !== null) {
      // This is a moon - find parent and calculate position
      const parentPlanet = planetByName.get(cfg.orbit.parent);
      if (parentPlanet) {
        const pos = calculateOrbitalPosition(
          cfg.orbit,
          0,
          parentPlanet.position,
          orbitalTimeScale
        );
        planet.position = pos;

        // Also update orbital state
        const body = orbitalState.bodyLookup.get(planet.name);
        if (body) {
          body.position = pos;
        }
      }
    }
  }

  // Generate surface objects for each planet
  const surfaceObjects = new Map();
  for (const planet of planets) {
    surfaceObjects.set(planet, createSurfaceObjects(planet, config));
  }

  // Generate atmospheric effects for each planet
  const effects = new Map();
  for (let i = 0; i < planets.length; i++) {
    const planet = planets[i];
    const planetConfig = config.planets[i];
    if (planetConfig.effects) {
      effects.set(planet, createPlanetEffects(planet, planetConfig.effects));
    }
  }

  // Generate ring systems for planets that have them
  const rings = new Map();
  for (let i = 0; i < planets.length; i++) {
    const planet = planets[i];
    const planetConfig = config.planets[i];
    if (planetConfig.rings) {
      rings.set(planet, createRingParticles(planet, planetConfig.rings));
    }
  }

  return { planets, sun, surfaceObjects, effects, rings, orbitalState };
}

export function nearestPlanetInfo(shipPos, planets) {
  // First pass: find any planet whose atmosphere we're inside
  // Prioritize the one with highest tAtmo (deepest in atmosphere)
  let bestAtmoPlanet = null;
  let bestTAtmo = 0;

  for (const planet of planets) {
    const d = Vec3.sub(planet.position, shipPos);
    const r = d.len();
    if (r < planet.atmosphereRadius) {
      const tAtmo = clamp(
        (planet.atmosphereRadius - r) / (planet.atmosphereRadius - planet.radius),
        0,
        1
      );
      if (tAtmo > bestTAtmo) {
        bestTAtmo = tAtmo;
        bestAtmoPlanet = { planet, d, r };
      }
    }
  }

  // If we're inside any atmosphere, use that planet
  if (bestAtmoPlanet) {
    const { planet, d, r } = bestAtmoPlanet;
    const altitude = r - planet.radius;
    return { planet, d, r, altitude, tAtmo: bestTAtmo };
  }

  // Otherwise fall back to nearest planet by center distance
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
  const tAtmo = 0; // Not inside any atmosphere

  return { planet, d, r, altitude, tAtmo };
}
