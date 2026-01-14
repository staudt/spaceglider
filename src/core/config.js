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
    cruiseSpeed: 500,      // speed at 100% throttle
    turboSpeed: 4000,      // speed when holding W
    speedResponse: 1.0,    // ~3 seconds to reach target (higher = faster)
    cushionHeight: 120,
    initialThrust: 0.2,
    turboShake: 3,         // screen shake intensity during turbo
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
  },

  sun: {
    color: "#f0d858",
    size: 400,
    distance: 50000,
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

  defaultPlanet: {
    radius: 6000,
    atmosphereRadius: 11000,
    GM: 4.6e8,
    colors: {
      surface: "#1ea33a",
      surfaceDark: "#147025",
      sky: "#3a1f55",
      halo: "#8f5bc7",
    },
    physics: {
      dragStrength: 0.18,
    },
  },

  debug: {
    enabled: false,  // Toggle with 'D' key
  },
};
