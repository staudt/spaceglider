export const config = {
  time: {
    scale: 1.0,
    dtClamp: 1 / 30,
  },

  camera: {
    fovDeg: 75,
    nearPlane: 0.1,
  },

  ship: {
    mass: 1.0,
    thrustMax: 140,
    brakeMax: 140,
    turboMultiplier: 2.6,
    thrustResponse: 8.0,
    maxSpeed: 0, // 0 = unlimited
    cushionHeight: 120,
    initialThrust: 0.2,
    initialVelocityZ: 130,
  },

  controls: {
    mouseSensitivity: 0.0028,
    rollRate: 1.2,
    thrustWheelStep: 0.03,
  },

  visuals: {
    spaceBg: "#070611",
  },

  stars: {
    layers: [
      { count: 700, halfSize: 12000, parallax: 0.25, sizeMin: 1, sizeMax: 2 },
      { count: 500, halfSize: 10000, parallax: 0.55, sizeMin: 1, sizeMax: 2 },
      { count: 300, halfSize: 8000, parallax: 0.9, sizeMin: 1, sizeMax: 3 },
    ],
  },

  defaultPlanet: {
    radius: 6000,
    atmosphereRadius: 11000,
    GM: 4.6e8,
    colors: {
      surface: "#1ea33a",
      sky: "#3a1f55",
      halo: "#8f5bc7",
    },
    physics: {
      dragStrength: 0.18,
    },
  },
};
