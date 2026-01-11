import { Vec3 } from "../core/math.js";

export function computeGravity(shipPos, planet) {
  const d = Vec3.sub(planet.position, shipPos);
  const r = d.len();

  const softening = Math.pow(planet.radius * 0.25, 2);
  const gMag = planet.GM / (r * r + softening);
  const gDir = d.clone().norm();

  return Vec3.mul(gDir, gMag);
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
