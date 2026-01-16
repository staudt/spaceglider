export const config = {
  time: {
    scale: 1.0,
    dtClamp: 1 / 30,
  },

  camera: {
    fovDeg: 30,
    nearPlane: 0.1,
  },

  ship: {
    startPosition: [0, 0, -1200000],  // starting position in world space
    cruiseSpeed: 3600,      // speed at 100% throttle
    turboSpeed: 75000,      // speed when holding W
    speedResponse: 1.0,    // ~3 seconds to reach target (higher = faster)
    brakeResponse: 1.5,    // ~2 seconds to brake (higher = faster)
    cushionHeight: 10,
    initialThrust: 0.2,
    turboShake: 10,         // screen shake intensity during turbo
  },

  controls: {
    mouseSensitivity: 0.0028,
    rotationSmoothing: 0.92, // 0.0 = instant, 1.0 = no movement
    rollRate: 1.2,
    rollSmoothing: 5.0, // Lerp speed (higher = faster snap)
    thrustWheelStep: 0.03,
  },

  visuals: {
    spaceBg: "#070611",
    atmosphereGlowIntensity: 0.15,
    atmoSkyBlendCurve: 1.5,  // > 1 = eased (slower at start), < 1 = snappy
    atmoStarFadeCurve: 2.0,  // controls how quickly stars fade when entering atmosphere
    atmoVisibleDistance: 8,  // atmosphere becomes visible within this many radii of planet center
    atmoVisibleDistance: 8,  // atmosphere becomes visible within this many radii of planet center
    atmoFullDistance: 1.5,   // atmosphere at full intensity within this many radii
    checkerGrid: {
      segments: 48,          // number of slices/stacks for the sphere grid
      alpha: 0.15,           // base opacity of the checkered overlay
    },
  },

  sun: {
    color: "#f0d858",
    size: 90000,
    position: [0, 0, 0],  // Center of the solar system
    GM: 3e8,              // Weak gravity - planets dominate near them
  },

  stars: {
    layers: [
      { count: 600, halfSize: 15000, parallax: 0.1, sizeMin: 0.8, sizeMax: 1.5 },
      { count: 700, halfSize: 12000, parallax: 0.25, sizeMin: 1, sizeMax: 2 },
      { count: 500, halfSize: 10000, parallax: 0.55, sizeMin: 1, sizeMax: 2 },
      { count: 300, halfSize: 8000, parallax: 0.9, sizeMin: 1, sizeMax: 3 },
      { count: 200, halfSize: 5000, parallax: 1.0, sizeMin: 1.5, sizeMax: 3 },
    ],
  },

  structures: {
    count: 80,
    maxVisibleAltitude: 2000,
    colors: ["#ff6600", "#ffaa00", "#ff4400", "#ff8800"],
  },

  // Planets orbiting the sun - each with unique characteristics
  // Positioned in a wide orbital ring around the sun at (0, 0, 0)
  planets: [
    {
      name: "Verdis",
      position: [450000, -66000, 150000],
      radius: 48000,
      atmosphereRadius: 69000,
      GM: 7.6e8,
      colors: {
        surface: "#1ea33a",
        surfaceDark: "#0b3813",
        sky: "#45791b",
        halo: "#8f5bc7",
      },
      physics: { dragStrength: 0.58 },
      effects: {
        rain: { intensity: 0.9, color: "#ffffff", streakLength: 45 },
      },
    },
    {
      name: "Inferno",
      position: [-318195, 0, 318195],
      radius: 6000,
      atmosphereRadius: 9000,
      GM: 4.2e8,
      colors: {
        surface: "#c44a1a",
        surfaceDark: "#8b2f0d",
        sky: "#2a1508",
        halo: "#ff6b35",
      },
      physics: { dragStrength: 0.12 },
      effects: {
        sandstorm: { intensity: 0.7, color: "#812e05", windSpeed: 250, windAngle: 0.5 },
        debris: { count: 120, color: "#500000", speed: [60, 180] },
        lightning: { frequency: 0.025, flashDuration: 0.15, intensity: 0.7 },
      },
    },
    {
      name: "Glaciem",
      position: [198000, 45000, -450000],
      radius: 72000,
      atmosphereRadius: 87000,
      GM: 5.8e8,
      colors: {
        surface: "#4a9ebb",
        surfaceDark: "#2d6b80",
        sky: "#0a1a2a",
        halo: "#7dd3fc",
      },
      physics: { dragStrength: 0.25 },
      effects: {
        snow: { count: 250, color: "#e8f4ff", sparkleRate: 0.15 },
        aurora: { colors: ["#00ff88", "#00ddff", "#8855ff"], waveSpeed: 0.4, bandCount: 6 },
      },
    },
    {
      name: "Magma",
      position: [45195, -26400, -48195],
      radius: 9000,
      atmosphereRadius: 18000,
      GM: 4.0e8,
      colors: {
        surface: "#b80b0b",
        surfaceDark: "#270501",
        sky: "#611e1e",
        halo: "#611e1e",
      },
      physics: { dragStrength: 0.15 },
      effects: {
        debris: { count: 280, color: "#ff0000", speed: [40, 120] },
        rain: { intensity: 0.7, color: "#fc2828", streakLength: 35 },
      },
    },
    {
      name: "Solitarius",
      position: [1260000, 18000, 90000],
      radius: 12000,
      atmosphereRadius: 13800,
      GM: 4.0e8,
      colors: {
        surface: "#583072",
        surfaceDark: "#030107",
        sky: "#6f08c4",
        halo: "#af20da",
      },
      physics: { dragStrength: 0.55 },
      effects: {
        aurora: { colors: ["#ff00ff", "#8800ff", "#ff0088"], waveSpeed: 0.6, bandCount: 4 },
      },
    },
  ],

  debug: {
    enabled: false,  // Toggle with 'D' key
  },
};
