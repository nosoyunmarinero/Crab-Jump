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
 },
};
