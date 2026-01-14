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
    startPosition: [0, 0, -200000],  // starting position in world space
    cruiseSpeed: 800,      // speed at 100% throttle
    turboSpeed: 10000,      // speed when holding W
    speedResponse: 1.0,    // ~3 seconds to reach target (higher = faster)
    cushionHeight: 10,
    initialThrust: 0.2,
    turboShake: 10,         // screen shake intensity during turbo
  },

  controls: {
    mouseSensitivity: 0.0028,
    rollRate: 1.2,
    thrustWheelStep: 0.03,
  },

  visuals: {
    spaceBg: "#070611",
    atmosphereGlowIntensity: 0.15,
    atmoSkyBlendCurve: 1.5,  // > 1 = eased (slower at start), < 1 = snappy
    atmoStarFadeCurve: 2.0,  // controls how quickly stars fade when entering atmosphere
    atmoVisibleDistance: 8,  // atmosphere becomes visible within this many radii of planet center
    atmoFullDistance: 1.5,   // atmosphere at full intensity within this many radii
  },

  sun: {
    color: "#f0d858",
    size: 12000,
    position: [0, 0, 0],  // Center of the solar system
    GM: 1e8,              // Weak gravity - planets dominate near them
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
      position: [50000, 0, 0],
      radius: 6000,
      atmosphereRadius: 8000,
      GM: 4.6e8,
      colors: {
        surface: "#1ea33a",
        surfaceDark: "#0b3813",
        sky: "#3a1f55",
        halo: "#8f5bc7",
      },
      physics: { dragStrength: 0.18 },
      effects: {
        rain: { intensity: 0.7, color: "#311f68", streakLength: 45 },
        lightning: { frequency: 0.025, flashDuration: 0.12, intensity: 0.7 },
      },
    },
    {
      name: "Inferno",
      position: [-35355, 0, 35355],
      radius: 1000,
      atmosphereRadius: 1500,
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
      },
    },
    {
      name: "Glaciem",
      position: [22000, 5000, -50000],
      radius: 3000,
      atmosphereRadius: 4000,
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
      position: [65355, 0, 65355],
      radius: 4000,
      atmosphereRadius: 8000,
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
        lightning: { frequency: 0.025, flashDuration: 0.15, intensity: 0.7 },
        rain: { intensity: 0.7, color: "#fc2828", streakLength: 35 },
      },
    },
    {
      name: "Solitarius",
      position: [140000, 2000, 10000],
      radius: 2000,
      atmosphereRadius: 2300,
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
