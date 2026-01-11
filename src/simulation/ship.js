import { Vec3, Quat, clamp, lerp } from "../core/math.js";

export function createShip(config) {
  return {
    pos: new Vec3(0, 0, 0),
    vel: new Vec3(0, 0, config.ship.initialVelocityZ),
    q: new Quat(0, 0, 0, 1),
    thrustSet: config.ship.initialThrust,
    thrustActual: 0.0,
  };
}

export function updateShipOrientation(ship, keys, dt, config) {
  const rollInput = (keys.has("KeyE") ? 1 : 0) - (keys.has("KeyQ") ? 1 : 0);
  if (rollInput !== 0) {
    const forwardAxis = ship.q.rotateVec(new Vec3(0, 0, 1)).norm();
    const qRoll = Quat.fromAxisAngle(
      forwardAxis,
      rollInput * config.controls.rollRate * dt
    );
    ship.q = Quat.mul(qRoll, ship.q).norm();
  }
}

export function handleMouseLook(ship, dx, dy, config) {
  const upAxis = ship.q.rotateVec(new Vec3(0, 1, 0)).norm();
  const rightAxis = ship.q.rotateVec(new Vec3(1, 0, 0)).norm();

  const qYaw = Quat.fromAxisAngle(upAxis, dx * config.controls.mouseSensitivity);
  const qPitch = Quat.fromAxisAngle(
    rightAxis,
    -dy * config.controls.mouseSensitivity
  );

  ship.q = Quat.mul(qPitch, Quat.mul(qYaw, ship.q)).norm();
}

export function computeShipAcceleration(ship, keys, dt, config) {
  const F = ship.q.rotateVec(new Vec3(0, 0, 1)).norm();

  let thrustTarget = ship.thrustSet * config.ship.thrustMax;
  if (keys.has("KeyW")) {
    thrustTarget *= config.ship.turboMultiplier;
  }

  const k = 1 - Math.exp(-dt * config.ship.thrustResponse);
  ship.thrustActual = lerp(ship.thrustActual, thrustTarget, k);

  const accel = Vec3.mul(F, ship.thrustActual / config.ship.mass);

  if (keys.has("KeyS")) {
    const speed = ship.vel.len();
    if (speed > 0.5) {
      const brakeDir = ship.vel.clone().mul(-1).norm();
      accel.add(Vec3.mul(brakeDir, config.ship.brakeMax / config.ship.mass));
    }
  }

  return accel;
}

export function adjustThrust(ship, delta, config) {
  ship.thrustSet = clamp(
    ship.thrustSet - delta * config.controls.thrustWheelStep,
    0,
    1
  );
}

export function setThrustPreset(ship, n) {
  ship.thrustSet = clamp(n / 9, 0, 1);
}
