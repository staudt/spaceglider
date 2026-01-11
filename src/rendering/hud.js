export function drawHud(ctx, canvas, ship, altitude, speed, pointerLocked, keys) {
  ctx.save();
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.scale(devicePixelRatio, devicePixelRatio);

  const w = canvas.width / devicePixelRatio;
  const h = canvas.height / devicePixelRatio;

  const isTurbo = keys.has("KeyW");
  const isBrake = keys.has("KeyS");
  const thrustPct = Math.round(ship.thrustSet * 100);

  // Left panel - Speed and Altitude
  ctx.fillStyle = "rgba(0,0,0,0.3)";
  ctx.fillRect(8, 40, 120, 50);

  ctx.fillStyle = "rgba(255,255,255,0.9)";
  ctx.font = "bold 18px monospace";
  ctx.fillText(`${Math.round(speed)}`, 14, 62);
  ctx.font = "10px monospace";
  ctx.fillStyle = "rgba(255,255,255,0.6)";
  ctx.fillText("m/s", 70, 62);

  ctx.fillStyle = "rgba(255,255,255,0.9)";
  ctx.font = "bold 14px monospace";
  const altText = altitude > 1000 ? `${(altitude / 1000).toFixed(1)}km` : `${Math.round(altitude)}m`;
  ctx.fillText(`ALT ${altText}`, 14, 82);

  // Throttle bar (bottom center)
  const barW = 200;
  const barH = 8;
  const barX = (w - barW) / 2;
  const barY = h - 30;

  // Bar background
  ctx.fillStyle = "rgba(0,0,0,0.4)";
  ctx.fillRect(barX - 2, barY - 2, barW + 4, barH + 4);

  // Throttle fill
  const throttleFill = ship.thrustSet * barW;
  ctx.fillStyle = isTurbo ? "rgba(255,180,50,0.9)" : "rgba(100,200,255,0.8)";
  ctx.fillRect(barX, barY, throttleFill, barH);

  // Bar outline
  ctx.strokeStyle = "rgba(255,255,255,0.5)";
  ctx.lineWidth = 1;
  ctx.strokeRect(barX, barY, barW, barH);

  // Throttle label
  ctx.fillStyle = "rgba(255,255,255,0.9)";
  ctx.font = "12px monospace";
  ctx.textAlign = "center";
  let thrustLabel = `${thrustPct}%`;
  if (isTurbo) thrustLabel = "TURBO";
  if (isBrake) thrustLabel = "BRAKE";
  ctx.fillText(thrustLabel, w / 2, barY - 6);
  ctx.textAlign = "left";

  // Crosshair (center)
  const cx = w / 2;
  const cy = h / 2;
  ctx.strokeStyle = "rgba(255,255,255,0.4)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(cx - 15, cy);
  ctx.lineTo(cx - 5, cy);
  ctx.moveTo(cx + 5, cy);
  ctx.lineTo(cx + 15, cy);
  ctx.moveTo(cx, cy - 15);
  ctx.lineTo(cx, cy - 5);
  ctx.moveTo(cx, cy + 5);
  ctx.lineTo(cx, cy + 15);
  ctx.stroke();

  // Mouse lock hint (top left, subtle)
  if (!pointerLocked) {
    ctx.fillStyle = "rgba(255,255,255,0.5)";
    ctx.font = "11px monospace";
    ctx.fillText("Click to lock mouse", 14, 24);
  }

  ctx.restore();
}
