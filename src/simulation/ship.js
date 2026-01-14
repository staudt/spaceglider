import { Vec3, Quat, clamp, lerp } from "../core/math.js";

export function createShip(config) {
  const initialSpeed = config.ship.initialThrust * config.ship.cruiseSpeed;
  const startPos = config.ship.startPosition;
  return {
    pos: new Vec3(startPos[0], startPos[1], startPos[2]),
    vel: new Vec3(0, 0, initialSpeed),
    q: new Quat(0, 0, 0, 1),
    thrustSet: config.ship.initialThrust,
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

export function updateShipSpeed(ship, keys, dt, config) {
  const forward = ship.q.rotateVec(new Vec3(0, 0, 1)).norm();

  // Calculate target speed based on throttle or turbo
  let targetSpeed;
  if (keys.has("KeyW")) {
    targetSpeed = config.ship.turboSpeed;
  } else if (keys.has("KeyS")) {
    targetSpeed = 0;
  } else {
    targetSpeed = ship.thrustSet * config.ship.cruiseSpeed;
  }

  // Get current speed along forward direction
  const currentForwardSpeed = Vec3.dot(ship.vel, forward);

  // Smoothly interpolate toward target speed (~3 seconds to reach)
  const k = 1 - Math.exp(-dt * config.ship.speedResponse);
  const newForwardSpeed = lerp(currentForwardSpeed, targetSpeed, k);

  // Decompose velocity into forward and lateral components
  const forwardVel = Vec3.mul(forward, currentForwardSpeed);
  const lateralVel = Vec3.sub(ship.vel, forwardVel);

  // Dampen lateral velocity slightly for arcade feel
  lateralVel.mul(1 - k * 0.5);

  // Reconstruct velocity with new forward speed
  ship.vel = Vec3.add(Vec3.mul(forward, newForwardSpeed), lateralVel);
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
