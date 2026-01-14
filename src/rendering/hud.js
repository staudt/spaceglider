import { Vec3 } from "../core/math.js";

export function drawHud(ctx, canvas, ship, altitude, speed, pointerLocked, keys, planet, cam, info) {
  ctx.save();
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.scale(devicePixelRatio, devicePixelRatio);

  const w = canvas.width / devicePixelRatio;
  const h = canvas.height / devicePixelRatio;

  const isTurbo = keys.has("KeyW");
  const isBrake = keys.has("KeyS");
  const thrustPct = Math.round(ship.thrustSet * 100);

  // Horizon line and heading indicator (when near planet)
  if (planet && info && info.tAtmo > 0.05) {
    const cx = w / 2;
    const cy = h / 2;

    // Calculate planet "up" direction in camera space
    const planetToShip = Vec3.sub(cam.C, planet.position).norm();
    const planetUp = planetToShip;

    // Project planet up direction to screen
    const upScreenX = Vec3.dot(planetUp, cam.R);
    const upScreenY = Vec3.dot(planetUp, cam.U);

    // Horizon line (perpendicular to planet's up)
    const horizonAngle = Math.atan2(upScreenY, upScreenX);
    const horizonLen = w * 0.3;
    const horizonX1 = cx - Math.cos(horizonAngle) * horizonLen;
    const horizonY1 = cy - Math.sin(horizonAngle) * horizonLen;
    const horizonX2 = cx + Math.cos(horizonAngle) * horizonLen;
    const horizonY2 = cy + Math.sin(horizonAngle) * horizonLen;

    ctx.strokeStyle = "rgba(255,255,255,0.2)";
    ctx.lineWidth = 1;
    ctx.setLineDash([3, 3]);
    ctx.beginPath();
    ctx.moveTo(horizonX1, horizonY1);
    ctx.lineTo(horizonX2, horizonY2);
    ctx.stroke();
    ctx.setLineDash([]);

    // Heading indicator (small compass rose at top center)
    const compassX = cx;
    const compassY = 25;
    const compassSize = 12;

    // Draw cardinal direction (planet up = North)
    ctx.strokeStyle = "rgba(255,100,100,0.6)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(compassX - Math.sin(horizonAngle) * compassSize, compassY - Math.cos(horizonAngle) * compassSize);
    ctx.lineTo(compassX, compassY);
    ctx.stroke();

    // Draw cardinal cross
    ctx.strokeStyle = "rgba(255,255,255,0.3)";
    ctx.lineWidth = 1;
    const crossSize = 8;
    ctx.beginPath();
    ctx.moveTo(compassX - crossSize, compassY);
    ctx.lineTo(compassX + crossSize, compassY);
    ctx.moveTo(compassX, compassY - crossSize);
    ctx.lineTo(compassX, compassY + crossSize);
    ctx.stroke();
  }

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
