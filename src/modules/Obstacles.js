// ========== obstacleTypes.js ==========
export const obstacles = {
  device: {
    width: 32,
    height: 32,
    srcs: [
      "./src/Assets/Obstacles/Device.png",
    ],
    fallSpeed: 3,
    probability: 0.9,
    effect: "kill",
    // Nuevos offsets de colisión
    collisionOffsetTop: 4,
    collisionOffsetBottom: 3.5,
    collisionOffsetLeft: 8,
    collisionOffsetRight: 8,
  },
  ball: {
    width: 32,
    height: 32,
    srcs: [
      "./src/Assets/Obstacles/ball.png",
    ],
    fallSpeed: 2,
    probability: 0.9,
    effect: "bounce",
    // Para una pelota, puedes hacer la colisión más circular
    collisionOffsetTop: 3,
    collisionOffsetBottom: 3,
    collisionOffsetLeft: 3,
    collisionOffsetRight: 3,
  },
  f5: {
    width: 32,
    height: 32,
    srcs: [
      "./src/Assets/Obstacles/Factor5.png",
    ],
    fallSpeed: 5,
    probability: 0.9,
    effect: "kill",
    collisionOffsetTop: 5,
    collisionOffsetBottom: 5,
    collisionOffsetLeft: 3.5,
    collisionOffsetRight: 3.5,
  },
  GPC: {
    width: 32,
    height: 32,
    srcs: [
      "./src/Assets/Obstacles/GPC.png",
    ],
    fallSpeed: 3,
    probability: 0.9,
    effect: "kill",
    collisionOffsetTop: 4,
    collisionOffsetBottom: 3,
    collisionOffsetLeft: 4,
    collisionOffsetRight: 2.5,
  },
};