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
│   ├── config.js          # Centralized tunable parameters
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
│   └── hud.js             # Heads-up display
└── world/
    └── universe.js        # Planets, sun setup, nearest planet queries
```

## Core Architecture

### Game Loop (main.js:66-132)

The main game loop runs at 60 FPS via `requestAnimationFrame`:
1. Compute time delta with clamp to prevent large jumps
2. Update ship orientation (mouse look, roll)
3. Update ship velocity (thrust, turbo, brake, atmospheric drag)
4. Apply glide cushion on approach to planet surface
5. Render frame with correct sky color, stars, sun, planet, HUD
6. Apply turbo screen shake if applicable

**Key insight**: The game loop orchestrates all systems. Rendering and simulation are decoupled—ship state updates first, then rendering reads that state.

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

Rendering order matters for visual correctness:
1. Fill sky with blended color (space blue → planet sky)
2. Draw star layers with fade-out based on atmosphere approach
3. Draw sun
4. Draw planet disk (with terminator, rim lighting)
5. Draw surface structures (towers) when visible
6. Draw HUD overlay
7. Apply turbo shake if active

**Projection**: Uses pinhole camera model in `camera.js:projectPoint()`. All 3D points are transformed to ship-local space, then projected to 2D screen.

### Configuration (config.js)

All tunable parameters live here:
- `time`: Simulation timescale, delta-time clamp
- `camera`: FOV, near plane distance
- `ship`: Speed limits, control responsiveness, visual effects
- `controls`: Mouse sensitivity, roll rate, wheel thrust step
- `visuals`: Space background color
- `sun`: Position, size, color
- `stars`: Layer counts, parallax factors, size ranges
- `structures`: Surface object counts, visibility altitude, colors
- `defaultPlanet`: Radius, atmosphere, gravity, drag, colors

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
  position: Vec3,
  radius: number,
  atmosphereRadius: number,
  GM: number,          // Gravitational parameter
  colors: { surface, surfaceDark, sky, halo },
  physics: { dragStrength },
}
```

### Nearest Planet Info (world/universe.js:49-73)
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
- Adjust gravity: Modify `defaultPlanet.GM`
- Change drag strength: Modify `defaultPlanet.physics.dragStrength`
- Adjust planet colors: Modify `defaultPlanet.colors`
- Change ship speed limits: Modify `ship.cruiseSpeed`, `ship.turboSpeed`
- Adjust control sensitivity: Modify `controls.mouseSensitivity`

### Adding a New Planet

Edit `src/world/universe.js:35-37`:
```javascript
const planets = [
  createPlanet({ position: new Vec3(0, 0, 20000) }, config.defaultPlanet),
  createPlanet({ position: new Vec3(30000, 5000, 0), colors: { ... } }, config.defaultPlanet),
  // Add more here
];
```

The `nearestPlanetInfo()` function automatically selects gravity/rendering based on closest planet.

### Adding a Rendering Feature

Create a new file in `src/rendering/`, export a `draw*()` function, import in `main.js`, and call from the game loop. Keep each renderer focused on one visual element.

### Debugging Ship State

Add `console.log()` calls in `main.js:66-132` to inspect:
- `ship.pos`, `ship.vel` (position, velocity)
- `ship.q` (orientation)
- `info.altitude`, `info.tAtmo` (approach state)
- `speed` (current velocity magnitude)

## Current Capabilities

- 6DOF spaceship controls (mouse look, Q/E roll, 0-9 thrust presets, W turbo, S brake, wheel thrust adjust)
- Single/multiple planets with gravity, atmosphere drag, surface glide cushion
- Parallax star layers with depth-based fade
- Sun with directional lighting
- Planet terminator line and rim lighting
- Flat-shaded planet disk with atmosphere gradient
- Surface objects (towers/pylons) with visibility culling
- Basic HUD showing altitude, speed, control hints
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
