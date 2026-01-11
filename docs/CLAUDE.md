# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Starglider is a minimalist Starglider 2 inspired space exploration experience in JavaScript and HTML5 Canvas. This is not a game with objectives—it's a relaxing immersive vibe experience about drifting through space and approaching planets. The goal is calm exploration, motion cues, and simple low-poly aesthetics with seamless transitions between space and atmosphere.

**Visual style target**: Flat shaded primitives, simple colors, minimal UI, strong sense of motion and scale.

## Running the Project

```bash
python -m http.server 8000
```

Then open `http://localhost:8000` in a browser. No build step or dependencies required.

## Current State

Working prototype with:
- 6DOF spaceship controls (mouse look, Q/E roll, 0-9 thrust presets, W turbo, S brake, wheel thrust adjust)
- Single planet with gravity, atmosphere drag, and surface glide cushion
- Parallax star layers
- Basic HUD

## Architecture

**Single-file implementation** in `main.js` (~460 lines).

### Core Systems

- **Math primitives**: `Vec3` (3D vector), `Quat` (quaternion rotation)
- **Rendering**: 2D Canvas projection using pinhole camera model (`projectPoint()`)
- **Physics**: Euler integration with inverse-square gravity, atmospheric drag, thrust/brake
- **Ship state**: Position, velocity, orientation quaternion, thrust setpoint/actual
- **Config object**: Centralized tunable parameters for physics, visuals, and world setup

### Key Conventions

- **Coordinate system**: Ship local space uses +Z forward, +X right, +Y up
- **Camera**: First-person attached to ship with ship orientation
- **6DOF rotation**: Mouse left/right yaws around local up, mouse up/down pitches around local right, Q/E rolls around local forward. No world-up reference.
- **Planet rendering**: Outer circle = atmosphere bound, inner circle = planet body
- **Glide cushion**: Prevents surface penetration, removes inward radial velocity while preserving tangential motion

## Core Pillars

1. **Minimalist graphics with strong illusion**: Basic 2D primitives projected from 3D. Flat shading, limited palette, fog/atmosphere tint over textures.

2. **Seamless approach**: Planet grows and stars fade continuously. No mode switches or hard transitions.

3. **True 6DOF in space**: No absolute up/down. All rotations use local axes.

4. **Relaxing flight physics**: Gravity, atmospheric drag, glide cushion for gentle surface interaction.

## Development Roadmap

### Phase A: Visual Cues and Polish (Current)
1. Improve planet disk shading (terminator line, sun-side rim, atmosphere gradient, simple sun-based lighting)
2. Improve starfield motion cues (subtle brightness variation, mild size scaling by depth, optional speed streaks at high velocity)
3. Improve HUD minimalism (tiny monospace, fewer lines, optional heading ticks)

### Phase B: Better Planet Interaction
1. Multiple planets from config array with distinct palettes
2. Nearest planet selection for gravity and HUD
3. Orbital mechanics feel (slingshot arcs, stable atmosphere gliding)

### Phase C: Surface View (Starglider Style)
Reintroduce checkered surface and low-poly landmarks as an overlay that fades in near surface.
- No discrete transitions
- Planet disk always visible as orientation cue
- Tangent plane checker grid, flat shaded polygons, fog to hide grid extent, simple monolith spikes

### Phase D: Procedural Content
Data-driven architecture for seed-based galaxy generation: planet placement, palettes, landmark placement.

## Rules and Constraints

- Keep everything in plain JS and Canvas. No external engines.
- Prioritize simplicity and vibe over accuracy.
- No complex systems unless needed for the illusion.
- No dashes in UI text. Minimal on-screen text overall.
- Make changes in small clean commits.
- Keep code modular and readable. New files should be minimal and clearly named.
