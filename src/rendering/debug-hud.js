import { Vec3 } from "../core/math.js";

export function drawDebugHud(ctx, canvas, ship, planet, cam, universe, info) {
  ctx.save();
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.scale(devicePixelRatio, devicePixelRatio);

  const w = canvas.width / devicePixelRatio;
  const h = canvas.height / devicePixelRatio;

  ctx.fillStyle = "rgba(0,0,0,0.7)";
  ctx.fillRect(0, 0, 300, h);

  ctx.fillStyle = "rgba(0,255,0,0.9)";
  ctx.font = "11px monospace";
  let y = 12;
  const lineHeight = 14;

  // Ship position
  ctx.fillText(`SHIP POS`, 8, y);
  y += lineHeight;
  ctx.fillText(`  X: ${ship.pos.x.toFixed(0)}`, 8, y);
  y += lineHeight;
  ctx.fillText(`  Y: ${ship.pos.y.toFixed(0)}`, 8, y);
  y += lineHeight;
  ctx.fillText(`  Z: ${ship.pos.z.toFixed(0)}`, 8, y);
  y += lineHeight * 1.5;

  // Planet position
  if (planet) {
    ctx.fillText(`PLANET POS`, 8, y);
    y += lineHeight;
    ctx.fillText(`  X: ${planet.position.x.toFixed(0)}`, 8, y);
    y += lineHeight;
    ctx.fillText(`  Y: ${planet.position.y.toFixed(0)}`, 8, y);
    y += lineHeight;
    ctx.fillText(`  Z: ${planet.position.z.toFixed(0)}`, 8, y);
    y += lineHeight * 1.5;

    // Distance
    const d = Vec3.sub(ship.pos, planet.position);
    const dist = d.len();
    ctx.fillText(`DISTANCE: ${dist.toFixed(0)}`, 8, y);
    y += lineHeight;
    ctx.fillText(`ALTITUDE: ${info?.altitude.toFixed(0) || 'N/A'}`, 8, y);
    y += lineHeight * 1.5;

    // Sun-Planet-Camera geometry
    const sun = universe.sun;
    const planetToSun = Vec3.sub(sun.position, planet.position).norm();
    const cameraToPlanet = Vec3.sub(planet.position, cam.C).norm();
    const phase = Vec3.dot(planetToSun, cameraToPlanet);

    ctx.fillText(`SUN-PLANET-CAM`, 8, y);
    y += lineHeight;
    ctx.fillText(`PHASE: ${phase.toFixed(3)}`, 8, y);
    y += lineHeight;
    ctx.fillStyle = phase > 0 ? "rgba(255,200,0,0.9)" : "rgba(100,100,255,0.9)";
    ctx.fillText(phase > 0 ? "(LIT SIDE)" : "(DARK SIDE)", 8, y);
    ctx.fillStyle = "rgba(0,255,0,0.9)";
    y += lineHeight * 1.5;

    // Planet-to-Sun direction
    ctx.fillText(`PLANET->SUN DIR`, 8, y);
    y += lineHeight;
    ctx.fillText(`  X: ${planetToSun.x.toFixed(3)}`, 8, y);
    y += lineHeight;
    ctx.fillText(`  Y: ${planetToSun.y.toFixed(3)}`, 8, y);
    y += lineHeight;
    ctx.fillText(`  Z: ${planetToSun.z.toFixed(3)}`, 8, y);
    y += lineHeight * 1.5;

    // Camera-to-Planet direction
    ctx.fillText(`CAMERA->PLANET DIR`, 8, y);
    y += lineHeight;
    ctx.fillText(`  X: ${cameraToPlanet.x.toFixed(3)}`, 8, y);
    y += lineHeight;
    ctx.fillText(`  Y: ${cameraToPlanet.y.toFixed(3)}`, 8, y);
    y += lineHeight;
    ctx.fillText(`  Z: ${cameraToPlanet.z.toFixed(3)}`, 8, y);
    y += lineHeight * 1.5;

    // Ship velocity
    const speed = ship.vel.len();
    ctx.fillText(`VELOCITY: ${speed.toFixed(0)} m/s`, 8, y);
    y += lineHeight;
  }

  // Camera orientation (quaternion)
  ctx.fillText(`CAMERA (quat)`, 8, y);
  y += lineHeight;
  ctx.fillText(`  X: ${ship.q.x.toFixed(3)}`, 8, y);
  y += lineHeight;
  ctx.fillText(`  Y: ${ship.q.y.toFixed(3)}`, 8, y);
  y += lineHeight;
  ctx.fillText(`  Z: ${ship.q.z.toFixed(3)}`, 8, y);
  y += lineHeight;
  ctx.fillText(`  W: ${ship.q.w.toFixed(3)}`, 8, y);

  ctx.restore();
}
