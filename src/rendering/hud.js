export function drawHud(ctx, canvas, ship, altitude, speed, pointerLocked, keys) {
  ctx.save();
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.scale(devicePixelRatio, devicePixelRatio);

  const thrustPct = Math.round(ship.thrustSet * 100);
  const turbo = keys.has("KeyW") ? " TURBO" : "";
  const brake = keys.has("KeyS") ? " BRAKE" : "";
  const lock = pointerLocked ? "LOCK" : "CLICK";

  ctx.fillStyle = "rgba(255,255,255,0.9)";
  ctx.font = "12px monospace";
  ctx.fillText(`MOUSE ${lock}   THR ${thrustPct}%${turbo}${brake}`, 12, 44);
  ctx.fillText(`SPD ${speed.toFixed(1)}   ALT ${altitude.toFixed(0)}`, 12, 62);

  ctx.restore();
}
