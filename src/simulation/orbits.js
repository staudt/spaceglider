// Orbital mechanics simulation using Keplerian orbits
// Handles planets orbiting the sun and moons orbiting their parent planets

import { Vec3 } from "../core/math.js";

/**
 * Solve Kepler's equation M = E - e*sin(E) for eccentric anomaly E
 * Uses Newton-Raphson iteration
 * @param {number} M - Mean anomaly (radians)
 * @param {number} e - Eccentricity (0 to <1)
 * @returns {number} Eccentric anomaly E (radians)
 */
function solveKepler(M, e) {
  // Normalize M to [0, 2π]
  M = M % (2 * Math.PI);
  if (M < 0) M += 2 * Math.PI;

  // Initial guess
  let E = M;
  if (e > 0.8) {
    E = Math.PI; // Better initial guess for high eccentricity
  }

  // Newton-Raphson iteration
  for (let i = 0; i < 10; i++) {
    const dE = (E - e * Math.sin(E) - M) / (1 - e * Math.cos(E));
    E -= dE;
    if (Math.abs(dE) < 1e-8) break;
  }

  return E;
}

/**
 * Calculate orbital position from Keplerian elements
 * @param {object} orbit - Orbital parameters
 * @param {number} time - Current simulation time (seconds)
 * @param {Vec3} parentPos - Position of parent body (sun or planet)
 * @param {number} orbitalTimeScale - Time multiplier for orbital motion
 * @returns {Vec3} Position in world coordinates
 */
export function calculateOrbitalPosition(orbit, time, parentPos, orbitalTimeScale) {
  const { semiMajorAxis, eccentricity, inclination, orbitalPeriod, startAngle } = orbit;

  // Mean anomaly: angle if orbit were circular, progresses linearly with time
  const n = (2 * Math.PI) / orbitalPeriod; // Mean motion (radians per second)
  const M = startAngle + n * time * orbitalTimeScale;

  // Solve Kepler's equation for eccentric anomaly
  const E = solveKepler(M, eccentricity);

  // True anomaly: actual angle from periapsis
  const sinE = Math.sin(E);
  const cosE = Math.cos(E);
  const sqrt1me2 = Math.sqrt(1 - eccentricity * eccentricity);
  const trueAnomaly = Math.atan2(sqrt1me2 * sinE, cosE - eccentricity);

  // Distance from focus (parent body)
  const r = semiMajorAxis * (1 - eccentricity * cosE);

  // Position in orbital plane (x toward periapsis, y perpendicular in plane)
  const xOrbit = r * Math.cos(trueAnomaly);
  const yOrbit = r * Math.sin(trueAnomaly);

  // Apply inclination rotation (rotate around x-axis)
  // For retrograde orbits (inclination > 90°), this naturally reverses direction
  const incRad = (inclination * Math.PI) / 180;
  const cosInc = Math.cos(incRad);
  const sinInc = Math.sin(incRad);

  // Transform to 3D world coordinates
  // Orbital plane is initially in XZ plane (y=0), then tilted by inclination
  const x = xOrbit;
  const y = yOrbit * sinInc;
  const z = yOrbit * cosInc;

  // Add parent position
  return new Vec3(
    parentPos.x + x,
    parentPos.y + y,
    parentPos.z + z
  );
}

/**
 * Initialize orbital state for all bodies
 * Creates a lookup map and sets initial positions
 * @param {Array} planetConfigs - Planet configuration array from config
 * @param {Vec3} sunPosition - Position of the sun
 * @returns {object} Orbital state with body lookup and time tracking
 */
export function initializeOrbits(planetConfigs, sunPosition) {
  // Build lookup map by name for parent resolution
  const bodyLookup = new Map();

  // First pass: create entries for all bodies (planets orbit sun)
  for (const cfg of planetConfigs) {
    bodyLookup.set(cfg.name, {
      name: cfg.name,
      orbit: cfg.orbit,
      parentName: cfg.orbit.parent,
      position: new Vec3(0, 0, 0), // Will be calculated
    });
  }

  return {
    bodyLookup,
    sunPosition: sunPosition.clone(),
    time: 0,
  };
}

/**
 * Update all orbital positions
 * Must process in correct order: planets first, then moons
 * @param {object} orbitalState - State from initializeOrbits
 * @param {Array} planets - Array of planet objects with position property
 * @param {number} dt - Delta time in seconds
 * @param {number} orbitalTimeScale - Time multiplier
 */
export function updateOrbits(orbitalState, planets, dt, orbitalTimeScale) {
  orbitalState.time += dt;
  const t = orbitalState.time;

  // Process planets (those orbiting the sun) first
  for (const planet of planets) {
    const body = orbitalState.bodyLookup.get(planet.name);
    if (!body || body.parentName !== null) continue;

    const newPos = calculateOrbitalPosition(
      body.orbit,
      t,
      orbitalState.sunPosition,
      orbitalTimeScale
    );

    // Store previous position for velocity calculation
    body.prevPosition = body.position.clone();

    // Update both the orbital state and the planet object
    body.position = newPos;
    planet.position.x = newPos.x;
    planet.position.y = newPos.y;
    planet.position.z = newPos.z;
  }

  // Process moons (those orbiting planets) second
  for (const planet of planets) {
    const body = orbitalState.bodyLookup.get(planet.name);
    if (!body || body.parentName === null) continue;

    // Find parent planet's current position
    const parentBody = orbitalState.bodyLookup.get(body.parentName);
    if (!parentBody) continue;

    const newPos = calculateOrbitalPosition(
      body.orbit,
      t,
      parentBody.position,
      orbitalTimeScale
    );

    // Store previous position for velocity calculation
    body.prevPosition = body.position.clone();

    // Update both the orbital state and the planet object
    body.position = newPos;
    planet.position.x = newPos.x;
    planet.position.y = newPos.y;
    planet.position.z = newPos.z;
  }
}

/**
 * Get the orbital velocity of a planet (change in position per second)
 * @param {object} orbitalState - State from initializeOrbits
 * @param {string} planetName - Name of the planet
 * @param {number} dt - Delta time used in last update
 * @returns {Vec3} Velocity vector, or zero vector if not found
 */
export function getPlanetVelocity(orbitalState, planetName, dt) {
  const body = orbitalState.bodyLookup.get(planetName);
  if (!body || !body.prevPosition || dt <= 0) {
    return new Vec3(0, 0, 0);
  }

  // Velocity = (currentPos - prevPos) / dt
  return new Vec3(
    (body.position.x - body.prevPosition.x) / dt,
    (body.position.y - body.prevPosition.y) / dt,
    (body.position.z - body.prevPosition.z) / dt
  );
}
