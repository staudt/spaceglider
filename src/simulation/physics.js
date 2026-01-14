import { Vec3 } from "../core/math.js";

// Compute gravity from a single body (planet or sun)
export function computeBodyGravity(shipPos, body) {
  const d = Vec3.sub(body.position, shipPos);
  const r = d.len();

  // Use body radius for softening if available, otherwise use a default
  const softeningRadius = body.radius ?? 500;
  const softening = Math.pow(softeningRadius * 0.25, 2);
  const gMag = body.GM / (r * r + softening);
  const gDir = d.clone().norm();

  return Vec3.mul(gDir, gMag);
}

// Compute total gravity from all planets + sun (multi-body gravity)
export function computeTotalGravity(shipPos, planets, sun) {
  const totalGravity = new Vec3(0, 0, 0);

  // Add gravity from all planets
  for (const planet of planets) {
    const g = computeBodyGravity(shipPos, planet);
    totalGravity.add(g);
  }

  // Add gravity from the sun
  if (sun && sun.GM) {
    const g = computeBodyGravity(shipPos, sun);
    totalGravity.add(g);
  }

  return totalGravity;
}

// Legacy function for backwards compatibility
export function computeGravity(shipPos, planet) {
  return computeBodyGravity(shipPos, planet);
}

export function applyDrag(velocity, tAtmo, planet, dt) {
  if (tAtmo <= 0) return;
  const drag = planet.physics.dragStrength * tAtmo;
  const damp = Math.max(0, 1 - drag * dt);
  velocity.mul(damp);
}

export function applyGlideCushion(ship, planet, cushionHeight) {
  const d = Vec3.sub(ship.pos, planet.position);
  const r = d.len();
  const altitude = r - planet.radius;

  if (altitude < cushionHeight) {
    const dirOut = d.clone().norm();
    ship.pos = Vec3.add(
      planet.position,
      Vec3.mul(dirOut, planet.radius + cushionHeight)
    );

    const vRad = Vec3.dot(ship.vel, dirOut);
    if (vRad < 0) {
      ship.vel.add(Vec3.mul(dirOut, -vRad));
    }

    ship.vel.mul(0.998);
  }
}

export function integrate(ship, accel, dt, maxSpeed) {
  ship.vel.add(Vec3.mul(accel, dt));

  if (maxSpeed > 0) {
    const speed = ship.vel.len();
    if (speed > maxSpeed) {
      ship.vel.mul(maxSpeed / speed);
    }
  }

  ship.pos.add(Vec3.mul(ship.vel, dt));
}
