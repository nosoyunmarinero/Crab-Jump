// ===================== Platforms ==============
// platformTypes.js
export const platformTypes = {
basicM: {
   width: 64,
   height: 64,
   srcs: [
 	"./src/Assets/platforms/PlatM/Plat_Red_M.png",
 	"./src/Assets/platforms/PlatM/Plat_Blue_M.png",
 	"./src/Assets/platforms/PlatM/Plat_Green_M.png",
   ],
   bounceForce: -11,
   collisionOffsetTop: 30,
   collisionOffsetLeft: 15,
   collisionOffsetRight: 15,
   image: null,
   probability: 0.5, // 👈 50% de probabilidad
   onCollide: (player, platform) => {
 	const platTop = platform.y + (platform.collisionOffsetTop || 0);
     player.y = platTop - player.height - 1;
     player.vy = platform.bounceForce;
     player.setAnimation("jump");
   },
 },
basicS: {
   width: 64,
   height: 64,
   srcs: [
 	"./src/Assets/platforms/PlatS/Plat_Red_S.png",
 	"./src/Assets/platforms/PlatS/Plat_Green_S.png",
 	"./src/Assets/platforms/PlatS/Plat_Blue_S.png",
   ],
   bounceForce: -11,
   collisionOffsetTop: 30,
   collisionOffsetLeft: 20,
   collisionOffsetRight: 20,
   image: null,
   probability: 0.3, // 👈 30%
   onCollide: (player, platform) => {
 	const platTop = platform.y + (platform.collisionOffsetTop || 0);
     player.y = platTop - player.height - 1;
     player.vy = platform.bounceForce;
     player.setAnimation("jump");
   },
 },
basicL: {
   width: 64,
   height: 64,
   srcs: [
 	"./src/Assets/platforms/PlatL/Plat_Red_L.png",
 	"./src/Assets/platforms/PlatL/Plat_Green_L.png",
 	"./src/Assets/platforms/PlatL/Plat_Blue_L.png",
   ],
   bounceForce: -11,
   collisionOffsetTop: 30,
   collisionOffsetLeft: 10,
   collisionOffsetRight: 10,
   image: null,
   probability: 0.2, // 👈 20%
   onCollide: (player, platform) => {
 	const platTop = platform.y + (platform.collisionOffsetTop || 0);
     player.y = platTop - player.height - 1;
     player.vy = platform.bounceForce;
     player.setAnimation("jump");
   },
 },

// Spikes
spikesS: {
   width: 64,
   height: 64,
   srcs: [
 	"./src/Assets/platforms/PlatS/Spikes_Red_S.png",
 	"./src/Assets/platforms/PlatS/Spikes_Blue_S.png",
 	"./src/Assets/platforms/PlatS/Spikes_Green_S.png",
   ],
   collisionOffsetTop: 30,
   collisionOffsetLeft: 10,
   collisionOffsetRight: 10,
   image: null,
   probability: 0.05, 
   onCollide: (player,platform, level) => {
  	if (level.onGameOver) {
     level.onGameOver();
   }
   },
 },
spikesM: {
   width: 64,
   height: 64,
   srcs: [
 	"./src/Assets/platforms/PlatM/Spikes_Red_M.png",
 	"./src/Assets/platforms/PlatM/Spikes_Blue_M.png",
 	"./src/Assets/platforms/PlatM/Spikes_Green_M.png",
   ],
   collisionOffsetTop: 30,
   collisionOffsetLeft: 10,
   collisionOffsetRight: 10,
   image: null,
   probability: 0.05, 
   onCollide: (player,platform, level) => {
  	if (level.onGameOver) {
     level.onGameOver();
   }
   },
 },
spikesL: {
   width: 64,
   height: 64,
   srcs: [
 	"./src/Assets/platforms/PlatL/Spikes_Red_L.png",
 	"./src/Assets/platforms/PlatL/Spikes_Blue_L.png",
 	"./src/Assets/platforms/PlatL/Spikes_Green_L.png",
   ],
   collisionOffsetTop: 30,
   collisionOffsetLeft: 10,
   collisionOffsetRight: 10,
   image: null,
   probability: 0.1, 
   onCollide: (player,platform, level) => {
  	if (level.onGameOver) {
     level.onGameOver();
   }
   },
 },

// Super
superM: {
   width: 64,
   height: 64,
   srcs: [
 	"./src/Assets/platforms/PlatM/SuperJump_Red_M.png",
   ],
   bounceForce: -23,
   collisionOffsetTop: 30,
   collisionOffsetLeft: 15,
   collisionOffsetRight: 15,
   image: null,
   probability: 0.03,
   onCollide: (player, platform) => {
 	const platTop = platform.y + (platform.collisionOffsetTop || 0);
     player.y = platTop - player.height - 1;
     player.vy = platform.bounceForce;
     player.setAnimation("jump");
   },
 },
superS: {
   width: 64,
   height: 64,
   srcs: [
 	"./src/Assets/platforms/PlatS/SuperJump_Red_S.png",
 	"./src/Assets/platforms/PlatS/SuperJump_Blue_S.png",
   ],
   bounceForce: -23,
   collisionOffsetTop: 30,
   collisionOffsetLeft: 20,
   collisionOffsetRight: 20,
   image: null,
   probability: 0.03, 
   onCollide: (player, platform) => {
 	const platTop = platform.y + (platform.collisionOffsetTop || 0);
     player.y = platTop - player.height - 1;
     player.vy = platform.bounceForce;
     player.setAnimation("jump");
   },
 },
superL: {
   width: 64,
   height: 64,
   srcs: [
 	"./src/Assets/platforms/PlatL/SuperJump_Blue_L.png",
   ],
   bounceForce: -23,
   collisionOffsetTop: 30,
   collisionOffsetLeft: 10,
   collisionOffsetRight: 10,
   image: null,
   probability: 0.03, 
   onCollide: (player, platform) => {
 	const platTop = platform.y + (platform.collisionOffsetTop || 0);
     player.y = platTop - player.height - 1;
     player.vy = platform.bounceForce;
     player.setAnimation("jump");
   },
 },
};
