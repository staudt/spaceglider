// Real Solar System configuration
// Scale: Neptune at ~2,000,000 units (30 AU), so 1 AU ≈ 66,667 units
// Planet sizes exaggerated ~100x for visibility (real ratios preserved)
// Moons positioned relative to their parent planets

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
    startPosition: [70000, 5000, -5000],  // Near Earth, good view of inner solar system
    cruiseSpeed: 5000,       // Comfortable cruising
    turboSpeed: 150000,      // Fast enough to reach outer planets
    speedResponse: 1.0,
    brakeResponse: 1.5,
    cushionHeight: 10,
    initialThrust: 0.2,
    turboShake: 10,
  },

  controls: {
    mouseSensitivity: 0.0028,
    rotationSmoothing: 0.92,
    rollRate: 1.2,
    rollSmoothing: 5.0,
    thrustWheelStep: 0.03,
  },

  visuals: {
    spaceBg: "#070611",
    atmosphereGlowIntensity: 0.15,
    atmoSkyBlendCurve: 1.5,
    atmoStarFadeCurve: 2.0,
    atmoVisibleDistance: 8,
    atmoFullDistance: 1.5,
    checkerGrid: {
      segments: 48,
      alpha: 0.15,
    },
  },

  sun: {
    color: "#fff4e0",
    size: 46000,            // Sun is ~109x Earth diameter, scaled for visibility
    position: [0, 0, 0],
    GM: 5e8,
  },

  stars: {
    layers: [
      { count: 800, halfSize: 25000, parallax: 0.1, sizeMin: 0.8, sizeMax: 1.5 },
      { count: 700, halfSize: 20000, parallax: 0.25, sizeMin: 1, sizeMax: 2 },
      { count: 500, halfSize: 15000, parallax: 0.55, sizeMin: 1, sizeMax: 2 },
      { count: 300, halfSize: 10000, parallax: 0.9, sizeMin: 1, sizeMax: 3 },
      { count: 200, halfSize: 8000, parallax: 1.0, sizeMin: 1.5, sizeMax: 3 },
    ],
  },

  structures: {
    count: 80,
    maxVisibleAltitude: 2000,
    colors: ["#ff6600", "#ffaa00", "#ff4400", "#ff8800"],
  },

  // Real Solar System - distances in AU scaled to game units (1 AU ≈ 66,667)
  // Planet radii exaggerated for gameplay but preserve relative sizes
  planets: [
    // ==================== MERCURY ====================
    // 0.39 AU from Sun, smallest planet
    {
      name: "Mercury",
      position: [26000, 0, 0],           // 0.39 AU
      radius: 1600,                       // Smallest planet
      atmosphereRadius: 1700,             // Virtually no atmosphere
      GM: 2.2e8,
      colors: {
        surface: "#8c8680",
        surfaceDark: "#4a4642",
        sky: "#1a1816",
        halo: "#a09890",
      },
      physics: { dragStrength: 0.02 },
      effects: {},
    },

    // ==================== VENUS ====================
    // 0.72 AU from Sun, Earth's "twin"
    {
      name: "Venus",
      position: [0, 2000, 48000],         // 0.72 AU
      radius: 3950,                        // Similar to Earth
      atmosphereRadius: 6000,              // Thick atmosphere
      GM: 3.2e8,
      colors: {
        surface: "#e6c87a",
        surfaceDark: "#8b7355",
        sky: "#d4a556",
        halo: "#f0d890",
      },
      physics: { dragStrength: 0.9 },     // Very thick atmosphere
      effects: {
        sandstorm: { intensity: 0.8, color: "#c9a227", windSpeed: 100, windAngle: 0.3 },
      },
    },

    // ==================== EARTH ====================
    // 1 AU from Sun, our home
    {
      name: "Earth",
      position: [66667, 0, 0],            // 1 AU
      radius: 4000,                        // Reference size
      atmosphereRadius: 4800,
      GM: 3.5e8,
      colors: {
        surface: "#4a90b5",
        surfaceDark: "#1a4a6b",
        sky: "#6ba3cc",
        halo: "#87ceeb",
      },
      physics: { dragStrength: 0.3 },
      effects: {
        rain: { intensity: 0.5, color: "#ffffff", streakLength: 40 },
      },
    },

    // The Moon - Earth's companion
    {
      name: "Moon",
      position: [66667 + 1500, 400, 0],   // ~1500 units from Earth
      radius: 1100,                        // About 1/4 Earth's size
      atmosphereRadius: 1150,
      GM: 1.5e8,
      colors: {
        surface: "#c4c4bc",
        surfaceDark: "#6b6b65",
        sky: "#0a0a0a",
        halo: "#888880",
      },
      physics: { dragStrength: 0.0 },
      effects: {},
    },

    // ==================== MARS ====================
    // 1.52 AU from Sun, the Red Planet
    {
      name: "Mars",
      position: [85000, -3000, 50000],    // 1.52 AU
      radius: 2100,                        // About half Earth's size
      atmosphereRadius: 2600,
      GM: 2.8e8,
      colors: {
        surface: "#c1440e",
        surfaceDark: "#6b2407",
        sky: "#d4a27a",
        halo: "#e07040",
      },
      physics: { dragStrength: 0.08 },    // Thin atmosphere
      effects: {
        sandstorm: { intensity: 0.6, color: "#a03000", windSpeed: 80, windAngle: 0.4 },
        debris: { count: 80, color: "#802000", speed: [30, 90] },
      },
    },

    // Phobos - Mars's larger moon
    {
      name: "Phobos",
      position: [85000 + 600, -3000, 50000 + 200],
      radius: 150,
      atmosphereRadius: 155,
      GM: 0.5e8,
      colors: {
        surface: "#6b5b4f",
        surfaceDark: "#3a302a",
        sky: "#0a0805",
        halo: "#5a4a3e",
      },
      physics: { dragStrength: 0.0 },
      effects: {},
    },

    // ==================== JUPITER ====================
    // 5.2 AU from Sun, the Gas Giant
    {
      name: "Jupiter",
      position: [0, 10000, -346667],      // 5.2 AU
      radius: 45000,                       // 11x Earth's size
      atmosphereRadius: 60000,
      GM: 8e8,
      colors: {
        surface: "#d4a574",
        surfaceDark: "#8b6b4a",
        sky: "#c9a06a",
        halo: "#e8c090",
      },
      physics: { dragStrength: 0.5 },
      effects: {
        lightning: { frequency: 0.04, flashDuration: 0.12, intensity: 0.8 },
        debris: { count: 150, color: "#a08060", speed: [100, 300] },
      },
    },

    // Io - Volcanic moon
    {
      name: "Io",
      position: [0 + 2800, 10000, -346667 + 1000],
      radius: 1150,
      atmosphereRadius: 1300,
      GM: 1.8e8,
      colors: {
        surface: "#e8d058",
        surfaceDark: "#a08830",
        sky: "#604010",
        halo: "#f0e068",
      },
      physics: { dragStrength: 0.1 },
      effects: {
        debris: { count: 200, color: "#ff6600", speed: [50, 150] },
      },
    },

    // Europa - Icy moon with possible ocean
    {
      name: "Europa",
      position: [0 + 4500, 10000 + 500, -346667],
      radius: 980,
      atmosphereRadius: 1050,
      GM: 1.6e8,
      colors: {
        surface: "#c9d4dc",
        surfaceDark: "#8090a0",
        sky: "#0a1520",
        halo: "#b0c8d8",
      },
      physics: { dragStrength: 0.05 },
      effects: {
        snow: { count: 50, color: "#ffffff", sparkleRate: 0.2 },
      },
    },

    // Ganymede - Largest moon in solar system
    {
      name: "Ganymede",
      position: [0 - 7000, 10000, -346667 - 2000],
      radius: 1660,
      atmosphereRadius: 1750,
      GM: 2.0e8,
      colors: {
        surface: "#8b8070",
        surfaceDark: "#504840",
        sky: "#101010",
        halo: "#706860",
      },
      physics: { dragStrength: 0.02 },
      effects: {},
    },

    // Callisto - Heavily cratered
    {
      name: "Callisto",
      position: [0, 10000 - 3000, -346667 + 12000],
      radius: 1520,
      atmosphereRadius: 1580,
      GM: 1.9e8,
      colors: {
        surface: "#605850",
        surfaceDark: "#302820",
        sky: "#080808",
        halo: "#504840",
      },
      physics: { dragStrength: 0.01 },
      effects: {},
    },

    // ==================== SATURN ====================
    // 9.5 AU from Sun, the Ringed Planet
    {
      name: "Saturn",
      position: [-500000, -5000, -350000], // 9.5 AU
      radius: 38000,                        // 9.5x Earth's size
      atmosphereRadius: 52000,
      GM: 7e8,
      colors: {
        surface: "#e8d4a8",
        surfaceDark: "#a08860",
        sky: "#d0b080",
        halo: "#f0e0c0",
      },
      physics: { dragStrength: 0.4 },
      effects: {
        lightning: { frequency: 0.02, flashDuration: 0.15, intensity: 0.5 },
      },
      rings: {
        innerRadius: 45000,    // Just outside the planet
        outerRadius: 85000,    // About 2.2x planet radius
        particleCount: 12000,  // Dense ring system
        tilt: 27,              // Saturn's axial tilt in degrees
        colors: [
          "#d4c4a0",  // Pale tan
          "#c8b890",  // Darker tan
          "#e0d0b0",  // Light cream
          "#b8a880",  // Brown-gray
          "#ccc0a8",  // Dusty beige
          "#a89878",  // Dark band
          "#e8dcc0",  // Bright ice
        ],
      },
    },

    // Titan - Saturn's largest moon, thick atmosphere
    {
      name: "Titan",
      position: [-500000 + 8000, -5000 + 1000, -350000],
      radius: 1630,
      atmosphereRadius: 2800,              // Very thick atmosphere
      GM: 2.0e8,
      colors: {
        surface: "#c08040",
        surfaceDark: "#604020",
        sky: "#d09050",
        halo: "#e0a060",
      },
      physics: { dragStrength: 0.7 },
      effects: {
        rain: { intensity: 0.4, color: "#c09050", streakLength: 30 }, // Methane rain
      },
    },

    // Enceladus - Icy moon with geysers
    {
      name: "Enceladus",
      position: [-500000, -5000 + 3000, -350000 + 4000],
      radius: 320,
      atmosphereRadius: 400,
      GM: 0.8e8,
      colors: {
        surface: "#f8f8ff",
        surfaceDark: "#c0c0d0",
        sky: "#0a0a10",
        halo: "#e0e0f0",
      },
      physics: { dragStrength: 0.05 },
      effects: {
        snow: { count: 100, color: "#ffffff", sparkleRate: 0.3 },
      },
    },

    // ==================== URANUS ====================
    // 19.2 AU from Sun, the Ice Giant
    {
      name: "Uranus",
      position: [1000000, 20000, -800000], // 19.2 AU
      radius: 16000,                        // 4x Earth's size
      atmosphereRadius: 22000,
      GM: 5e8,
      colors: {
        surface: "#72c4c8",
        surfaceDark: "#3a8080",
        sky: "#408888",
        halo: "#90d8dc",
      },
      physics: { dragStrength: 0.35 },
      effects: {
        aurora: { colors: ["#00ffcc", "#00ccff", "#0088ff"], waveSpeed: 0.3, bandCount: 4 },
      },
      rings: {
        innerRadius: 19000,    // Faint narrow rings
        outerRadius: 28000,
        particleCount: 3000,   // Much sparser than Saturn
        tilt: 98,              // Uranus is tilted on its side!
        colors: [
          "#404850",  // Dark gray-blue
          "#505860",  // Slightly lighter
          "#383840",  // Very dark
        ],
      },
    },

    // Miranda - Uranus's moon with extreme terrain
    {
      name: "Miranda",
      position: [1000000 + 2500, 20000, -800000 + 500],
      radius: 300,
      atmosphereRadius: 310,
      GM: 0.6e8,
      colors: {
        surface: "#909090",
        surfaceDark: "#505050",
        sky: "#050505",
        halo: "#707070",
      },
      physics: { dragStrength: 0.0 },
      effects: {},
    },

    // ==================== NEPTUNE ====================
    // 30 AU from Sun, the farthest major planet
    {
      name: "Neptune",
      position: [400000, -30000, -2000000], // 30 AU
      radius: 15500,                         // Slightly smaller than Uranus
      atmosphereRadius: 21000,
      GM: 4.8e8,
      colors: {
        surface: "#3050b0",
        surfaceDark: "#182860",
        sky: "#1830a0",
        halo: "#4060d0",
      },
      physics: { dragStrength: 0.38 },
      effects: {
        aurora: { colors: ["#0044ff", "#0088ff", "#00ccff"], waveSpeed: 0.5, bandCount: 5 },
        lightning: { frequency: 0.03, flashDuration: 0.1, intensity: 0.6 },
      },
    },

    // Triton - Neptune's largest moon (retrograde orbit)
    {
      name: "Triton",
      position: [400000 - 2200, -30000 + 800, -2000000 + 1500],
      radius: 860,
      atmosphereRadius: 920,
      GM: 1.5e8,
      colors: {
        surface: "#d8c8c0",
        surfaceDark: "#806860",
        sky: "#100808",
        halo: "#c0b0a8",
      },
      physics: { dragStrength: 0.03 },
      effects: {
        snow: { count: 80, color: "#ffe0e0", sparkleRate: 0.15 }, // Nitrogen snow
      },
    },

    // ==================== PLUTO (Dwarf Planet) ====================
    // 39.5 AU average, but let's put it closer for accessibility
    {
      name: "Pluto",
      position: [-1800000, 50000, -1500000], // ~35 AU (perihelion-ish)
      radius: 750,
      atmosphereRadius: 850,
      GM: 1.0e8,
      colors: {
        surface: "#d4c4a8",
        surfaceDark: "#6a5a48",
        sky: "#100a05",
        halo: "#b0a088",
      },
      physics: { dragStrength: 0.02 },
      effects: {
        snow: { count: 30, color: "#f0e8e0", sparkleRate: 0.1 },
      },
    },

    // Charon - Pluto's largest moon
    {
      name: "Charon",
      position: [-1800000 + 600, 50000, -1500000 + 300],
      radius: 380,
      atmosphereRadius: 390,
      GM: 0.7e8,
      colors: {
        surface: "#808080",
        surfaceDark: "#404040",
        sky: "#050505",
        halo: "#606060",
      },
      physics: { dragStrength: 0.0 },
      effects: {},
    },
  ],

  debug: {
    enabled: false,
  },
};
