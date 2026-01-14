import { Vec3, randRange } from "../core/math.js";
import { projectPoint } from "./camera.js";

/**
 * Create effect state for a planet based on its config
 */
export function createPlanetEffects(planet, effectsConfig) {
  if (!effectsConfig) return null;

  const effects = {
    // Particle arrays for different effects
    debris: [],
    rain: [],
    snow: [],
    sandstorm: [],

    // Lightning state
    lightning: {
      active: false,
      timer: 0,
      flashPhase: 0, // 0 = waiting, 1 = bright flash, 2 = dark aftermath
      flashTimer: 0,
    },

    // Aurora state
    aurora: {
      phase: 0,
      bands: [],
    },

    // Store config reference
    config: effectsConfig,
  };

  // Initialize debris particles
  if (effectsConfig.debris) {
    const cfg = effectsConfig.debris;
    for (let i = 0; i < (cfg.count || 150); i++) {
      effects.debris.push(createDebrisParticle(cfg));
    }
  }

  // Initialize rain particles
  if (effectsConfig.rain) {
    const cfg = effectsConfig.rain;
    const count = Math.floor((cfg.intensity || 0.5) * 400);
    for (let i = 0; i < count; i++) {
      effects.rain.push(createRainParticle(cfg));
    }
  }

  // Initialize snow particles
  if (effectsConfig.snow) {
    const cfg = effectsConfig.snow;
    for (let i = 0; i < (cfg.count || 200); i++) {
      effects.snow.push(createSnowParticle(cfg));
    }
  }

  // Initialize sandstorm particles
  if (effectsConfig.sandstorm) {
    const cfg = effectsConfig.sandstorm;
    const count = Math.floor((cfg.intensity || 0.5) * 300);
    for (let i = 0; i < count; i++) {
      effects.sandstorm.push(createSandstormParticle(cfg));
    }
  }

  // Initialize aurora bands
  if (effectsConfig.aurora) {
    const cfg = effectsConfig.aurora;
    const bandCount = cfg.bandCount || 5;
    for (let i = 0; i < bandCount; i++) {
      effects.aurora.bands.push({
        offset: Math.random() * Math.PI * 2,
        amplitude: randRange(0.1, 0.3),
        frequency: randRange(1, 3),
        colorIndex: i % (cfg.colors?.length || 2),
      });
    }
  }

  return effects;
}

// Particle creation helpers
function createDebrisParticle(cfg) {
  const speed = cfg.speed || [50, 150];
  return {
    x: randRange(-500, 500),
    y: randRange(-500, 500),
    z: randRange(-500, 500),
    vx: randRange(-speed[1], speed[1]) * 0.3,
    vy: randRange(-speed[0], speed[0]) * 0.2,
    vz: randRange(-speed[1], speed[1]) * 0.3,
    size: randRange(1, 2.5),
    alpha: randRange(0.3, 0.8),
  };
}

function createRainParticle(cfg) {
  return {
    x: randRange(-400, 400),
    y: randRange(0, 800),
    z: randRange(-400, 400),
    speed: randRange(800, 1200),
    length: cfg.streakLength || 40,
    alpha: randRange(0.2, 0.5),
  };
}

function createSnowParticle(cfg) {
  return {
    x: randRange(-600, 600),
    y: randRange(-600, 600),
    z: randRange(-600, 600),
    vx: randRange(-20, 20),
    vy: randRange(-80, -40), // Falling down
    vz: randRange(-20, 20),
    size: randRange(1, 3),
    sparklePhase: Math.random() * Math.PI * 2,
    sparkleSpeed: randRange(2, 5),
  };
}

function createSandstormParticle(cfg) {
  const windSpeed = cfg.windSpeed || 200;
  return {
    x: randRange(-500, 500),
    y: randRange(-200, 200),
    z: randRange(-500, 500),
    speed: randRange(windSpeed * 0.7, windSpeed * 1.3),
    length: randRange(15, 35),
    alpha: randRange(0.15, 0.4),
  };
}

/**
 * Update all effects for a planet
 */
export function updateEffects(effects, dt, cam, planet, tAtmo) {
  if (!effects) return;

  const cfg = effects.config;

  // Update debris
  if (cfg.debris && effects.debris.length > 0) {
    updateDebris(effects.debris, dt, cam);
  }

  // Update rain
  if (cfg.rain && effects.rain.length > 0) {
    updateRain(effects.rain, dt, cam, cfg.rain);
  }

  // Update snow
  if (cfg.snow && effects.snow.length > 0) {
    updateSnow(effects.snow, dt, cam, cfg.snow);
  }

  // Update sandstorm
  if (cfg.sandstorm && effects.sandstorm.length > 0) {
    updateSandstorm(effects.sandstorm, dt, cam, cfg.sandstorm);
  }

  // Update lightning
  if (cfg.lightning) {
    updateLightning(effects.lightning, dt, cfg.lightning, tAtmo);
  }

  // Update aurora
  if (cfg.aurora) {
    effects.aurora.phase += dt * (cfg.aurora.waveSpeed || 0.5);
  }
}

function updateDebris(particles, dt, cam) {
  const wrapDist = 500;
  for (const p of particles) {
    // Move particle
    p.x += p.vx * dt;
    p.y += p.vy * dt;
    p.z += p.vz * dt;

    // Wrap around camera position
    const dx = p.x - cam.C.x;
    const dy = p.y - cam.C.y;
    const dz = p.z - cam.C.z;

    if (Math.abs(dx) > wrapDist) p.x = cam.C.x - Math.sign(dx) * wrapDist + randRange(-50, 50);
    if (Math.abs(dy) > wrapDist) p.y = cam.C.y - Math.sign(dy) * wrapDist + randRange(-50, 50);
    if (Math.abs(dz) > wrapDist) p.z = cam.C.z - Math.sign(dz) * wrapDist + randRange(-50, 50);
  }
}

function updateRain(particles, dt, cam, cfg) {
  const wrapDist = 400;
  for (const p of particles) {
    // Rain falls down in local gravity direction (simplified to -Y for now)
    p.y -= p.speed * dt;

    // Wrap around camera
    const dx = p.x - cam.C.x;
    const dz = p.z - cam.C.z;
    const dy = p.y - cam.C.y;

    if (Math.abs(dx) > wrapDist) p.x = cam.C.x - Math.sign(dx) * wrapDist + randRange(-50, 50);
    if (Math.abs(dz) > wrapDist) p.z = cam.C.z - Math.sign(dz) * wrapDist + randRange(-50, 50);
    if (dy < -wrapDist) {
      p.y = cam.C.y + wrapDist;
      p.x = cam.C.x + randRange(-wrapDist, wrapDist);
      p.z = cam.C.z + randRange(-wrapDist, wrapDist);
    }
  }
}

function updateSnow(particles, dt, cam, cfg) {
  const wrapDist = 600;
  for (const p of particles) {
    // Gentle sway
    p.x += p.vx * dt + Math.sin(p.sparklePhase) * 5 * dt;
    p.y += p.vy * dt;
    p.z += p.vz * dt + Math.cos(p.sparklePhase * 0.7) * 5 * dt;

    // Update sparkle
    p.sparklePhase += p.sparkleSpeed * dt;

    // Wrap around camera
    const dx = p.x - cam.C.x;
    const dy = p.y - cam.C.y;
    const dz = p.z - cam.C.z;

    if (Math.abs(dx) > wrapDist) p.x = cam.C.x - Math.sign(dx) * wrapDist + randRange(-50, 50);
    if (Math.abs(dz) > wrapDist) p.z = cam.C.z - Math.sign(dz) * wrapDist + randRange(-50, 50);
    if (dy < -wrapDist) {
      p.y = cam.C.y + wrapDist;
      p.x = cam.C.x + randRange(-wrapDist, wrapDist);
      p.z = cam.C.z + randRange(-wrapDist, wrapDist);
    }
  }
}

function updateSandstorm(particles, dt, cam, cfg) {
  const wrapDist = 500;
  // Wind direction (horizontal, could be configurable)
  const windAngle = cfg.windAngle || 0;
  const windX = Math.cos(windAngle);
  const windZ = Math.sin(windAngle);

  for (const p of particles) {
    // Move horizontally with wind
    p.x += windX * p.speed * dt;
    p.z += windZ * p.speed * dt;
    // Slight vertical drift
    p.y += randRange(-10, 10) * dt;

    // Wrap around camera
    const dx = p.x - cam.C.x;
    const dy = p.y - cam.C.y;
    const dz = p.z - cam.C.z;

    if (Math.abs(dx) > wrapDist) p.x = cam.C.x - Math.sign(dx) * wrapDist;
    if (Math.abs(dy) > wrapDist * 0.4) p.y = cam.C.y + randRange(-100, 100);
    if (Math.abs(dz) > wrapDist) p.z = cam.C.z - Math.sign(dz) * wrapDist;
  }
}

function updateLightning(lightning, dt, cfg, tAtmo) {
  if (tAtmo < 0.1) {
    lightning.active = false;
    lightning.flashPhase = 0;
    return;
  }

  const frequency = cfg.frequency || 0.02;
  const flashDuration = cfg.flashDuration || 0.15;

  if (lightning.flashPhase === 0) {
    // Waiting for next flash
    lightning.timer += dt;
    // Random chance to flash, scaled by tAtmo (deeper = more lightning)
    if (Math.random() < frequency * tAtmo * dt * 60) {
      lightning.flashPhase = 1;
      lightning.flashTimer = 0;
      lightning.active = true;
    }
  } else if (lightning.flashPhase === 1) {
    // Bright flash
    lightning.flashTimer += dt;
    if (lightning.flashTimer > flashDuration * 0.3) {
      lightning.flashPhase = 2;
      lightning.flashTimer = 0;
    }
  } else if (lightning.flashPhase === 2) {
    // Dark aftermath
    lightning.flashTimer += dt;
    if (lightning.flashTimer > flashDuration * 0.7) {
      lightning.flashPhase = 0;
      lightning.active = false;
    }
  }
}

/**
 * Draw all effects for a planet
 */
export function drawEffects(ctx, cam, effects, planet, tAtmo, nearPlane, config) {
  if (!effects || tAtmo < 0.01) return;

  const cfg = effects.config;

  ctx.save();

  // Draw debris
  if (cfg.debris && effects.debris.length > 0) {
    drawDebris(ctx, cam, effects.debris, cfg.debris, tAtmo, nearPlane);
  }

  // Draw rain
  if (cfg.rain && effects.rain.length > 0) {
    drawRain(ctx, cam, effects.rain, cfg.rain, tAtmo, nearPlane);
  }

  // Draw snow
  if (cfg.snow && effects.snow.length > 0) {
    drawSnow(ctx, cam, effects.snow, cfg.snow, tAtmo, nearPlane);
  }

  // Draw sandstorm particles and overlay
  if (cfg.sandstorm && effects.sandstorm.length > 0) {
    drawSandstorm(ctx, cam, effects.sandstorm, cfg.sandstorm, tAtmo, nearPlane);
  }

  // Draw lightning flash overlay
  if (cfg.lightning && effects.lightning.active) {
    drawLightning(ctx, effects.lightning, cfg.lightning, tAtmo);
  }

  // Draw aurora
  if (cfg.aurora) {
    drawAurora(ctx, cam, effects.aurora, cfg.aurora, planet, tAtmo, nearPlane);
  }

  ctx.restore();
}

function drawDebris(ctx, cam, particles, cfg, tAtmo, nearPlane) {
  const color = cfg.color || "#888888";
  ctx.fillStyle = color;

  for (const p of particles) {
    const worldPos = new Vec3(p.x, p.y, p.z);
    const proj = projectPoint(worldPos, cam, nearPlane);
    if (!proj || proj.zCam > 600) continue;

    const distFade = Math.max(0, 1 - proj.zCam / 600);
    ctx.globalAlpha = p.alpha * tAtmo * distFade;

    const size = Math.max(1, (p.size / proj.zCam) * cam.focal * 0.5);
    ctx.beginPath();
    ctx.arc(proj.sx, proj.sy, size, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawRain(ctx, cam, particles, cfg, tAtmo, nearPlane) {
  const color = cfg.color || "#8899bb";
  ctx.strokeStyle = color;
  ctx.lineWidth = 1;

  for (const p of particles) {
    const worldPos = new Vec3(p.x, p.y, p.z);
    const proj = projectPoint(worldPos, cam, nearPlane);
    if (!proj || proj.zCam > 500) continue;

    // Project end point (slightly below)
    const endY = p.y - p.length;
    const endPos = new Vec3(p.x, endY, p.z);
    const projEnd = projectPoint(endPos, cam, nearPlane);
    if (!projEnd) continue;

    const distFade = Math.max(0, 1 - proj.zCam / 500);
    ctx.globalAlpha = p.alpha * tAtmo * distFade * 0.7;

    ctx.beginPath();
    ctx.moveTo(proj.sx, proj.sy);
    ctx.lineTo(projEnd.sx, projEnd.sy);
    ctx.stroke();
  }
}

function drawSnow(ctx, cam, particles, cfg, tAtmo, nearPlane) {
  const color = cfg.color || "#e0e8ff";
  ctx.fillStyle = color;

  for (const p of particles) {
    const worldPos = new Vec3(p.x, p.y, p.z);
    const proj = projectPoint(worldPos, cam, nearPlane);
    if (!proj || proj.zCam > 700) continue;

    const distFade = Math.max(0, 1 - proj.zCam / 700);
    // Sparkle effect
    const sparkle = 0.5 + 0.5 * Math.sin(p.sparklePhase);
    const sparkleBoost = (cfg.sparkleRate || 0.1) * sparkle;

    ctx.globalAlpha = (0.4 + sparkleBoost) * tAtmo * distFade;

    const size = Math.max(1, (p.size / proj.zCam) * cam.focal * 0.4);
    ctx.beginPath();
    ctx.arc(proj.sx, proj.sy, size, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawSandstorm(ctx, cam, particles, cfg, tAtmo, nearPlane) {
  const color = cfg.color || "#aa8855";
  const intensity = cfg.intensity || 0.5;

  // Draw visibility overlay first
  ctx.globalAlpha = intensity * tAtmo * 0.3;
  ctx.fillStyle = color;
  ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

  // Draw particle streaks
  ctx.strokeStyle = color;
  ctx.lineWidth = 1.5;

  const windAngle = cfg.windAngle || 0;
  const windX = Math.cos(windAngle);
  const windZ = Math.sin(windAngle);

  for (const p of particles) {
    const worldPos = new Vec3(p.x, p.y, p.z);
    const proj = projectPoint(worldPos, cam, nearPlane);
    if (!proj || proj.zCam > 400) continue;

    // Calculate streak end based on wind direction
    const endX = p.x + windX * p.length;
    const endZ = p.z + windZ * p.length;
    const endPos = new Vec3(endX, p.y, endZ);
    const projEnd = projectPoint(endPos, cam, nearPlane);
    if (!projEnd) continue;

    const distFade = Math.max(0, 1 - proj.zCam / 400);
    ctx.globalAlpha = p.alpha * tAtmo * distFade;

    ctx.beginPath();
    ctx.moveTo(proj.sx, proj.sy);
    ctx.lineTo(projEnd.sx, projEnd.sy);
    ctx.stroke();
  }
}

function drawLightning(ctx, lightning, cfg, tAtmo) {
  const intensity = (cfg.intensity || 0.8) * tAtmo;

  if (lightning.flashPhase === 1) {
    // Bright flash
    ctx.globalAlpha = intensity * 0.6;
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  } else if (lightning.flashPhase === 2) {
    // Dark aftermath
    const darkProgress = lightning.flashTimer / (cfg.flashDuration * 0.7);
    ctx.globalAlpha = intensity * 0.3 * (1 - darkProgress);
    ctx.fillStyle = "#000000";
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  }
}

function drawAurora(ctx, cam, aurora, cfg, planet, tAtmo, nearPlane) {
  // Aurora is visible in upper atmosphere (tAtmo between 0.1 and 0.6)
  const auroraVisibility = Math.max(0, 1 - Math.abs(tAtmo - 0.3) / 0.3);
  if (auroraVisibility < 0.05) return;

  const colors = cfg.colors || ["#00ff88", "#0088ff"];
  const canvasWidth = ctx.canvas.width;
  const canvasHeight = ctx.canvas.height;

  // Draw wavy bands across the upper portion of screen
  for (const band of aurora.bands) {
    const colorIndex = band.colorIndex % colors.length;
    ctx.strokeStyle = colors[colorIndex];
    ctx.lineWidth = randRange(2, 5);
    ctx.globalAlpha = auroraVisibility * 0.15 * tAtmo;

    ctx.beginPath();

    // Draw wave across screen
    const baseY = canvasHeight * 0.15 + band.colorIndex * canvasHeight * 0.08;

    for (let x = 0; x < canvasWidth; x += 10) {
      const waveY =
        baseY +
        Math.sin(aurora.phase + band.offset + x * 0.01 * band.frequency) *
          band.amplitude *
          canvasHeight *
          0.1;

      if (x === 0) {
        ctx.moveTo(x, waveY);
      } else {
        ctx.lineTo(x, waveY);
      }
    }

    ctx.stroke();
  }
}
