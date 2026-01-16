// Real Solar System configuration with orbital mechanics
// Scale: 1 AU ≈ 400,000 units
// Orbital periods scaled for gameplay visibility while maintaining realistic ratios
// Real ratios: Mercury 0.24y, Venus 0.62y, Earth 1y, Mars 1.88y, Jupiter 11.86y, etc.

export const config = {
  time: {
    scale: 1.0,
    dtClamp: 1 / 30,
    // Orbital time scale: how fast orbits progress (1 = real proportions, higher = faster orbits)
    // At orbitalTimeScale=0.025, Earth completes one orbit in ~21 minutes
    // Mercury ~5 min, Jupiter ~4 hours - gentle, relaxed orbital motion
    orbitalTimeScale: 0.018,
  },

  camera: {
    fovDeg: 30,
    nearPlane: 0.1,
  },

  ship: {
    startPosition: [420000, 30000, -30000],  // Near Earth, good view of inner solar system
    cruiseSpeed: 6000,      // Comfortable cruising
    turboSpeed: 350000,      // Fast enough to reach outer planets
    speedResponse: 1.0,
    brakeResponse: 1.5,
    cushionHeight: 10,
    initialThrust: 0.2,
    turboShake: 10,
    referenceFrameStrength: 3.0, // How strongly ship matches planet's orbital motion (higher = sticks better)
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
    size: 46000,
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

  // Real Solar System with orbital mechanics
  // Orbital parameters:
  // - semiMajorAxis: distance from parent (sun or planet) in units
  // - eccentricity: 0 = circular, closer to 1 = more elliptical
  // - inclination: orbital tilt in degrees
  // - orbitalPeriod: time for one orbit in seconds (at orbitalTimeScale=1)
  // - startAngle: initial position in orbit (radians)
  // - parent: name of parent body (null for planets orbiting sun)
  planets: [
    // ==================== MERCURY ====================
    // Real: 0.39 AU, 88 days orbital period
    {
      name: "Mercury",
      radius: 1600,
      atmosphereRadius: 1700,
      GM: 2.2e8,
      orbit: {
        semiMajorAxis: 156000,        // 0.39 AU
        eccentricity: 0.206,          // Most eccentric planet
        inclination: 7.0,             // 7° to ecliptic
        orbitalPeriod: 7.6,           // 88 days / 365 * 31.5s base
        startAngle: 0,
        parent: null,
      },
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
    // Real: 0.72 AU, 225 days orbital period
    {
      name: "Venus",
      radius: 3950,
      atmosphereRadius: 6000,
      GM: 3.2e8,
      orbit: {
        semiMajorAxis: 288000,        // 0.72 AU
        eccentricity: 0.007,          // Nearly circular
        inclination: 3.4,
        orbitalPeriod: 19.4,          // 225 days
        startAngle: Math.PI * 0.7,
        parent: null,
      },
      colors: {
        surface: "#e6c87a",
        surfaceDark: "#8b7355",
        sky: "#d4a556",
        halo: "#f0d890",
      },
      physics: { dragStrength: 0.9 },
      effects: {
        sandstorm: { intensity: 0.8, color: "#c9a227", windSpeed: 100, windAngle: 0.3 },
      },
    },

    // ==================== EARTH ====================
    // Real: 1 AU, 365 days orbital period
    {
      name: "Earth",
      radius: 4000,
      atmosphereRadius: 4800,
      GM: 3.5e8,
      orbit: {
        semiMajorAxis: 400000,        // 1 AU
        eccentricity: 0.017,          // Nearly circular
        inclination: 0,               // Reference plane
        orbitalPeriod: 31.5,          // 365 days = 31.5s base period
        startAngle: 0,
        parent: null,
      },
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
    // Real: 384,400 km from Earth, 27.3 day orbital period
    {
      name: "Moon",
      radius: 1100,
      atmosphereRadius: 1150,
      GM: 1.5e8,
      orbit: {
        semiMajorAxis: 9000,          // Scaled moon distance
        eccentricity: 0.055,
        inclination: 5.1,             // To Earth's equator
        orbitalPeriod: 2.36,          // 27.3 days / 365 * 31.5s
        startAngle: Math.PI * 0.25,
        parent: "Earth",
      },
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
    // Real: 1.52 AU, 687 days orbital period
    {
      name: "Mars",
      radius: 2100,
      atmosphereRadius: 2600,
      GM: 2.8e8,
      orbit: {
        semiMajorAxis: 608000,        // 1.52 AU
        eccentricity: 0.093,
        inclination: 1.85,
        orbitalPeriod: 59.3,          // 687 days
        startAngle: Math.PI * 1.2,
        parent: null,
      },
      colors: {
        surface: "#c1440e",
        surfaceDark: "#6b2407",
        sky: "#d4a27a",
        halo: "#e07040",
      },
      physics: { dragStrength: 0.08 },
      effects: {
        sandstorm: { intensity: 0.6, color: "#a03000", windSpeed: 80, windAngle: 0.4 },
        debris: { count: 80, color: "#802000", speed: [30, 90] },
      },
    },

    // Phobos - Mars's larger moon
    // Real: 9,376 km from Mars, 7.66 hours orbital period
    {
      name: "Phobos",
      radius: 150,
      atmosphereRadius: 155,
      GM: 0.5e8,
      orbit: {
        semiMajorAxis: 3600,
        eccentricity: 0.015,
        inclination: 1.1,
        orbitalPeriod: 0.027,         // 7.66 hours / 24 / 365 * 31.5s
        startAngle: 0,
        parent: "Mars",
      },
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
    // Real: 5.2 AU, 11.86 years orbital period
    {
      name: "Jupiter",
      radius: 45000,
      atmosphereRadius: 60000,
      GM: 8e8,
      orbit: {
        semiMajorAxis: 2080000,       // 5.2 AU
        eccentricity: 0.049,
        inclination: 1.3,
        orbitalPeriod: 374,           // 11.86 years
        startAngle: Math.PI * 0.5,
        parent: null,
      },
      colors: {
        surface: "#885e30",
        surfaceDark: "#351f0a",
        sky: "#c9a06a",
        halo: "#3f2c15",
      },
      physics: { dragStrength: 0.5 },
      effects: {
        lightning: { frequency: 0.04, flashDuration: 0.12, intensity: 0.8 },
        debris: { count: 150, color: "#a08060", speed: [100, 300] },
      },
    },

    // Io - Volcanic moon
    // Real: 421,700 km from Jupiter, 1.77 days orbital period
    // Scaled: Jupiter radius is 45,000, so orbit must be well outside
    {
      name: "Io",
      radius: 1150,
      atmosphereRadius: 1300,
      GM: 1.8e8,
      orbit: {
        semiMajorAxis: 70000,         // Well outside Jupiter's radius (45,000)
        eccentricity: 0.004,
        inclination: 0.04,
        orbitalPeriod: 0.153,         // 1.77 days
        startAngle: 0,
        parent: "Jupiter",
      },
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
    // Real: 670,900 km from Jupiter, 3.55 days orbital period
    // Scaled: Jupiter radius is 45,000, so orbit must be well outside
    {
      name: "Europa",
      radius: 980,
      atmosphereRadius: 1050,
      GM: 1.6e8,
      orbit: {
        semiMajorAxis: 90000,         // Well outside Jupiter's radius (45,000)
        eccentricity: 0.009,
        inclination: 0.47,
        orbitalPeriod: 0.307,         // 3.55 days
        startAngle: Math.PI * 0.5,
        parent: "Jupiter",
      },
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
    // Real: 1,070,400 km from Jupiter, 7.15 days orbital period
    // Scaled: Jupiter radius is 45,000, so orbit must be well outside
    {
      name: "Ganymede",
      radius: 1660,
      atmosphereRadius: 1750,
      GM: 2.0e8,
      orbit: {
        semiMajorAxis: 115000,        // Well outside Jupiter's radius (45,000)
        eccentricity: 0.001,
        inclination: 0.2,
        orbitalPeriod: 0.617,         // 7.15 days
        startAngle: Math.PI,
        parent: "Jupiter",
      },
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
    // Real: 1,882,700 km from Jupiter, 16.69 days orbital period
    {
      name: "Callisto",
      radius: 1520,
      atmosphereRadius: 1580,
      GM: 1.9e8,
      orbit: {
        semiMajorAxis: 72000,
        eccentricity: 0.007,
        inclination: 0.19,
        orbitalPeriod: 1.44,          // 16.69 days
        startAngle: Math.PI * 1.5,
        parent: "Jupiter",
      },
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
    // Real: 9.5 AU, 29.46 years orbital period
    {
      name: "Saturn",
      radius: 38000,
      atmosphereRadius: 52000,
      GM: 7e8,
      orbit: {
        semiMajorAxis: 3800000,       // 9.5 AU
        eccentricity: 0.056,
        inclination: 2.49,
        orbitalPeriod: 929,           // 29.46 years
        startAngle: Math.PI * 0.8,
        parent: null,
      },
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
        innerRadius: 45000,
        outerRadius: 85000,
        particleCount: 12000,
        tilt: 27,
        colors: [
          "#d4c4a0",
          "#c8b890",
          "#e0d0b0",
          "#b8a880",
          "#ccc0a8",
          "#a89878",
          "#e8dcc0",
        ],
      },
    },

    // Titan - Saturn's largest moon, thick atmosphere
    // Real: 1,221,870 km from Saturn, 15.95 days orbital period
    {
      name: "Titan",
      radius: 1630,
      atmosphereRadius: 2800,
      GM: 2.0e8,
      orbit: {
        semiMajorAxis: 48000,
        eccentricity: 0.029,
        inclination: 0.33,
        orbitalPeriod: 1.38,          // 15.95 days
        startAngle: Math.PI * 0.3,
        parent: "Saturn",
      },
      colors: {
        surface: "#c08040",
        surfaceDark: "#604020",
        sky: "#d09050",
        halo: "#e0a060",
      },
      physics: { dragStrength: 0.7 },
      effects: {
        rain: { intensity: 0.4, color: "#c09050", streakLength: 30 },
      },
    },

    // Enceladus - Icy moon with geysers
    // Real: 238,000 km from Saturn, 1.37 days orbital period
    // Scaled: Saturn radius is 38,000, so orbit must be well outside
    {
      name: "Enceladus",
      radius: 320,
      atmosphereRadius: 400,
      GM: 0.8e8,
      orbit: {
        semiMajorAxis: 58000,         // Well outside Saturn's radius (38,000)
        eccentricity: 0.005,
        inclination: 0.02,
        orbitalPeriod: 0.118,         // 1.37 days
        startAngle: Math.PI * 0.7,
        parent: "Saturn",
      },
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
    // Real: 19.2 AU, 84 years orbital period
    {
      name: "Uranus",
      radius: 16000,
      atmosphereRadius: 22000,
      GM: 5e8,
      orbit: {
        semiMajorAxis: 7680000,       // 19.2 AU
        eccentricity: 0.046,
        inclination: 0.77,
        orbitalPeriod: 2649,          // 84 years
        startAngle: Math.PI * 1.1,
        parent: null,
      },
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
        innerRadius: 19000,
        outerRadius: 28000,
        particleCount: 3000,
        tilt: 98,
        colors: [
          "#404850",
          "#505860",
          "#383840",
        ],
      },
    },

    // Miranda - Uranus's moon with extreme terrain
    // Real: 129,390 km from Uranus, 1.41 days orbital period
    // Scaled: Uranus radius is 16,000, so orbit must be well outside
    {
      name: "Miranda",
      radius: 300,
      atmosphereRadius: 310,
      GM: 0.6e8,
      orbit: {
        semiMajorAxis: 26000,         // Well outside Uranus's radius (16,000)
        eccentricity: 0.001,
        inclination: 4.34,
        orbitalPeriod: 0.122,         // 1.41 days
        startAngle: 0,
        parent: "Uranus",
      },
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
    // Real: 30 AU, 164.8 years orbital period
    {
      name: "Neptune",
      radius: 15500,
      atmosphereRadius: 21000,
      GM: 4.8e8,
      orbit: {
        semiMajorAxis: 12000000,      // 30 AU
        eccentricity: 0.009,
        inclination: 1.77,
        orbitalPeriod: 5199,          // 164.8 years
        startAngle: Math.PI * 0.3,
        parent: null,
      },
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
    // Real: 354,800 km from Neptune, 5.88 days orbital period (retrograde)
    // Scaled: Neptune radius is 15,500, so orbit must be well outside
    {
      name: "Triton",
      radius: 860,
      atmosphereRadius: 920,
      GM: 1.5e8,
      orbit: {
        semiMajorAxis: 28000,         // Well outside Neptune's radius (15,500)
        eccentricity: 0.00002,        // Nearly perfectly circular
        inclination: 157,             // Retrograde orbit (>90°)
        orbitalPeriod: 0.508,         // 5.88 days
        startAngle: Math.PI * 0.5,
        parent: "Neptune",
      },
      colors: {
        surface: "#d8c8c0",
        surfaceDark: "#806860",
        sky: "#100808",
        halo: "#c0b0a8",
      },
      physics: { dragStrength: 0.03 },
      effects: {
        snow: { count: 80, color: "#ffe0e0", sparkleRate: 0.15 },
      },
    },

    // ==================== PLUTO (Dwarf Planet) ====================
    // Real: 39.5 AU average, 248 years orbital period
    {
      name: "Pluto",
      radius: 750,
      atmosphereRadius: 850,
      GM: 1.0e8,
      orbit: {
        semiMajorAxis: 15800000,      // 39.5 AU
        eccentricity: 0.249,          // Highly eccentric
        inclination: 17.16,           // High inclination
        orbitalPeriod: 7819,          // 248 years
        startAngle: Math.PI * 1.5,
        parent: null,
      },
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
    // Real: 19,591 km from Pluto, 6.39 days orbital period (tidally locked)
    {
      name: "Charon",
      radius: 380,
      atmosphereRadius: 390,
      GM: 0.7e8,
      orbit: {
        semiMajorAxis: 4000,
        eccentricity: 0.0002,
        inclination: 0.08,
        orbitalPeriod: 0.552,         // 6.39 days
        startAngle: 0,
        parent: "Pluto",
      },
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
