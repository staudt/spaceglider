# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Starglider is a minimalist space exploration experience in JavaScript and HTML5 Canvas, inspired by Starglider 2. It's designed as a relaxing, immersive vibe experience about drifting through space and approaching planets—not a game with objectives. The focus is on calm exploration, motion cues, and simple low-poly aesthetics with seamless transitions between space and atmosphere.

**Visual style target**: Flat shaded primitives, simple colors, minimal UI, strong sense of motion and scale.

## Running the Project

```bash
python -m http.server 8000
```

Then open `http://localhost:8000` in a browser. No build step or external dependencies required.

## Project Structure

The codebase is organized into modular systems:

```
src/
├── main.js                 # Entry point: game loop, input handling, orchestration
├── core/
│   ├── config.js          # Centralized tunable parameters (planets, effects, visuals)
│   └── math.js            # Vec3, Quat, and utility functions
├── simulation/
│   ├── ship.js            # Ship state, orientation, speed controls
│   └── physics.js         # Gravity, atmosphere drag, glide cushion
├── rendering/
│   ├── canvas.js          # Canvas setup
│   ├── camera.js          # 3D-to-2D projection, color mixing
│   ├── stars.js           # Parallax starfield rendering
│   ├── planet.js          # Planet disk rendering with terminator
│   ├── sun.js             # Sun rendering
│   ├── structures.js      # Surface objects (towers, pylons)
│   ├── effects.js         # Atmospheric effects (rain, snow, sandstorm, lightning, aurora, debris)
│   ├── hud.js             # Heads-up display
│   └── debug-hud.js       # Debug overlay (position, geometry, phase)
└── world/
    └── universe.js        # Planets, sun setup, nearest planet queries, effects initialization
```

## Core Architecture

### Game Loop (main.js:72-228)

The main game loop runs at 60 FPS via `requestAnimationFrame`:
1. Compute time delta with clamp to prevent large jumps
2. Update ship orientation (mouse look, roll)
3. Update ship velocity (thrust, turbo, brake)
4. Apply multi-body gravity (all planets + sun)
5. Apply glide cushion on approach to planet surface
6. Update atmospheric effects for nearest planet
7. Render frame using depth-sorted drawables (sun, planets, surface objects, effects)
8. Draw HUD overlay
9. Apply turbo screen shake if applicable

**Key insight**: The game loop orchestrates all systems. Rendering and simulation are decoupled—ship state updates first, then rendering reads that state. Drawables are sorted by distance (farthest first) for correct back-to-front rendering.

### Coordinate Systems

- **World space**: Absolute coordinate system with sun at fixed location
- **Ship local space**: +Z forward, +X right, +Y up (relative to ship orientation)
- **Camera**: First-person, inherits ship's position and quaternion rotation
- **Screen space**: 2D canvas, origin at top-left

### 6DOF Rotation System (ship.js)

Ship orientation uses quaternions. All rotations are applied in ship-local axes:
- **Yaw**: Mouse left/right rotates around local up axis
- **Pitch**: Mouse up/down rotates around local right axis
- **Roll**: Q/E rotates around local forward axis
- No world-up reference—player can be upside down

### Physics Pipeline

1. **Gravity** (physics.js): Inverse-square law based on planet GM
2. **Atmospheric drag** (physics.js): Quadratic drag applied when inside atmosphere
3. **Thrust** (ship.js): Player controls via keyboard/wheel, smooth response to target speed
4. **Glide cushion** (physics.js): Prevents surface penetration while preserving tangential velocity

### Rendering Pipeline

Rendering uses depth-sorted drawables for correct visual ordering:
1. Fill sky with blended color (space blue → planet sky)
2. Draw star layers with fade-out based on atmosphere approach
3. Apply atmospheric haze overlay when inside atmosphere
4. Collect all drawables (sun, planets, surface objects, effects) with camera distances
5. Sort drawables by distance (farthest first for back-to-front rendering)
6. Draw each drawable in sorted order
7. Draw HUD overlay
8. Apply turbo shake if active

**Projection**: Uses pinhole camera model in `camera.js:projectPoint()`. All 3D points are transformed to ship-local space, then projected to 2D screen.

### Atmospheric Effects System (effects.js)

Per-planet atmospheric effects with particle systems and overlays:
- **Debris**: Floating particles that wrap around camera position
- **Rain**: Falling streak particles with configurable intensity
- **Snow**: Drifting particles with sparkle animation
- **Sandstorm**: Horizontal streaks with visibility overlay
- **Lightning**: Flash overlay with bright/dark phases
- **Aurora**: Animated wavy bands in upper atmosphere

Effects are configured per-planet in `config.planets[].effects` and initialized in `universe.js`. Each planet can have multiple simultaneous effects.

### Configuration (config.js)

All tunable parameters live here:
- `time`: Simulation timescale, delta-time clamp
- `camera`: FOV, near plane distance
- `ship`: Speed limits, control responsiveness, visual effects, start position
- `controls`: Mouse sensitivity, roll rate, wheel thrust step
- `visuals`: Space background color, atmosphere blend curves
- `sun`: Position, size, color, GM (gravitational parameter)
- `stars`: Layer counts, parallax factors, size ranges
- `structures`: Surface object counts, visibility altitude, colors
- `planets`: Array of planet configurations with individual colors, physics, and effects

Modifying config values is the primary way to tweak behavior.

## Key Data Structures

### Ship (simulation/ship.js)
```javascript
{
  pos: Vec3,           // World position
  vel: Vec3,           // World velocity
  q: Quat,             // Orientation (quaternion)
  thrustSet: number,   // 0-1 throttle setpoint (from 0..9 presets or S/W/wheel)
}
```

### Planet (world/universe.js)
```javascript
{
  name: string,
  position: Vec3,
  radius: number,
  atmosphereRadius: number,
  GM: number,          // Gravitational parameter
  colors: { surface, surfaceDark, sky, halo },
  physics: { dragStrength },
}
```

### Planet Config (config.js:planets[])
```javascript
{
  name: string,
  position: [x, y, z],
  radius: number,
  atmosphereRadius: number,
  GM: number,
  colors: { surface, surfaceDark, sky, halo },
  physics: { dragStrength },
  effects: {           // Optional atmospheric effects
    rain: { intensity, color, streakLength },
    snow: { count, color, sparkleRate },
    sandstorm: { intensity, color, windSpeed, windAngle },
    lightning: { frequency, flashDuration, intensity },
    aurora: { colors, waveSpeed, bandCount },
    debris: { count, color, speed },
  },
}
```

### Nearest Planet Info (world/universe.js:63-87)
```javascript
{
  planet: Planet,
  d: Vec3,             // Vector from ship to planet center
  r: number,           // Distance to planet center
  altitude: number,    // Distance to surface
  tAtmo: 0-1,          // Atmosphere blend factor
}
```

## Common Development Tasks

### Tuning Physics or Visuals

Edit `src/core/config.js` and reload the browser. Changes are immediate. Examples:
- Adjust gravity: Modify `planets[n].GM` for specific planet or `sun.GM`
- Change drag strength: Modify `planets[n].physics.dragStrength`
- Adjust planet colors: Modify `planets[n].colors`
- Add/modify effects: Modify `planets[n].effects`
- Change ship speed limits: Modify `ship.cruiseSpeed`, `ship.turboSpeed`
- Adjust control sensitivity: Modify `controls.mouseSensitivity`
- Tune atmosphere transitions: Modify `visuals.atmoSkyBlendCurve`, `visuals.atmoStarFadeCurve`

### Adding a New Planet

Add a new entry to `config.planets` array in `src/core/config.js`:
```javascript
{
  name: "NewPlanet",
  position: [x, y, z],
  radius: 3000,
  atmosphereRadius: 4000,
  GM: 4.5e8,
  colors: {
    surface: "#aabbcc",
    surfaceDark: "#334455",
    sky: "#112233",
    halo: "#556677",
  },
  physics: { dragStrength: 0.2 },
  effects: {  // Optional
    snow: { count: 200, color: "#ffffff", sparkleRate: 0.1 },
  },
}
```

The `nearestPlanetInfo()` function automatically selects gravity/rendering based on closest planet. Effects are initialized automatically by `createUniverse()`.

### Adding a Rendering Feature

Create a new file in `src/rendering/`, export a `draw*()` function, import in `main.js`, and call from the game loop. Keep each renderer focused on one visual element.

### Debugging Ship State

**Debug Mode (Press 'D'):**
- Overlay shows ship position, planet position, distance, altitude
- Shows sun-planet-camera phase angle (critical for terminator lighting)
- Displays direction vectors (planet→sun, camera→planet)
- Shows camera quaternion for orientation debugging
- Green text on dark background; colored phase indicator (gold = lit side, blue = dark side)

This is essential for diagnosing lighting issues like terminator inversion when small movements cause phase sign flips.

**Console debugging:**
Add `console.log()` calls in `main.js` game loop to inspect:
- `ship.pos`, `ship.vel` (position, velocity)
- `ship.q` (orientation)
- `info.altitude`, `info.tAtmo` (approach state)
- `speed` (current velocity magnitude)

## Current Capabilities

- 6DOF spaceship controls (mouse look, Q/E roll, 0-9 thrust presets, W turbo, S brake, wheel thrust adjust)
- Multiple planets (5 unique) with individual gravity, atmosphere drag, surface glide cushion
- Multi-body gravity from all planets and sun
- Parallax star layers with depth-based fade
- Sun with directional lighting and gravity
- Planet terminator line and rim lighting
- Flat-shaded planet disk with atmosphere gradient
- Per-planet atmospheric effects (rain, snow, sandstorm, lightning, aurora, debris)
- Depth-sorted rendering for correct multi-planet visibility
- Surface objects (towers/pylons) with visibility culling
- Basic HUD showing altitude, speed, planet name, control hints
- Turbo screen shake during acceleration

## Development Roadmap

### Phase A: Visual Cues and Polish
1. ✓ Improve planet disk shading (terminator, rim, atmosphere)
2. ✓ Improve starfield motion cues
3. ✓ Improve HUD minimalism

### Phase B: Better Planet Interaction
1. Multiple distinct planets with orbital mechanics feel
2. Stable atmosphere gliding, slingshot arcs
3. Improved altitude-based visual transitions

### Phase C: Surface View (Starglider Style)
Checkered surface and low-poly landmarks as overlay near surface:
- No discrete mode transitions
- Planet disk always visible as orientation cue
- Tangent plane grid, flat-shaded polygons, fog occlusion

### Phase D: Procedural Content
Seed-based galaxy generation: planet placement, palettes, landmark layout.

## Rules and Constraints

- Keep everything in plain JS and Canvas. No external engines.
- Prioritize simplicity and vibe over accuracy.
- No complex systems unless needed for the illusion.
- No dashes in UI text. Minimal on-screen text overall.
- Make changes in small, clean commits.
- Keep code modular and readable. New files should be minimal and clearly named.
- Config-first approach: Make values tunable before hardcoding.
