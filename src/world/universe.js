import { Vec3, clamp } from "../core/math.js";

export function createPlanet(options, defaults) {
  return {
    position: options.position || new Vec3(0, 0, 20000),
    radius: options.radius ?? defaults.radius,
    atmosphereRadius: options.atmosphereRadius ?? defaults.atmosphereRadius,
    GM: options.GM ?? defaults.GM,
    colors: {
      surface: options.colors?.surface ?? defaults.colors.surface,
      sky: options.colors?.sky ?? defaults.colors.sky,
      halo: options.colors?.halo ?? defaults.colors.halo,
    },
    physics: {
      dragStrength:
        options.physics?.dragStrength ?? defaults.physics.dragStrength,
    },
  };
}

export function createUniverse(config) {
  const planets = [
    createPlanet({ position: new Vec3(0, 0, 20000) }, config.defaultPlanet),
  ];

  return { planets };
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
