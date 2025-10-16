// ======================== ANIMACIONES ===========
export class Animation {
constructor({ src, frames, interval }) {
   this.image = new Image();
   this.image.src = src;
   this.frames = frames;
   this.interval = interval;

   this.frameWidth = 0;
   this.frameHeight = 0;
   this.frameIndex = 0;
   this.frameTimer = 0;

   this.image.onload = () => {
 	this.frameWidth = this.image.width / this.frames;
 	this.frameHeight = this.image.height;
   };
 }

update(dt) {
   this.frameTimer = (this.frameTimer || 0) + dt;
   if (this.frameTimer >= this.interval / 60) {
 	this.frameIndex = (this.frameIndex + 1) % this.frames;
 	this.frameTimer = 0;
   }
 }

draw(ctx, x, y, width, height) {
   if (!this.image.complete) return;
   ctx.drawImage(
 	this.image,
 	this.frameIndex * this.frameWidth,
 	0,
 	this.frameWidth,
 	this.frameHeight,
     x,
     y,
     width,
     height
   );
 }

reset() {
   this.frameIndex = 0;
   this.frameTimer = 0;
 }
}

// Objeto de Animaciones
export const playerAnimations = {
idle: new Animation({ src: "./src/Assets/Player/zuluzulu.png", frames: 3, interval: 12 }),
jump: new Animation({ src: "./src/Assets/Player/zulu-jump.png", frames: 11, interval: 4 }),
dead: new Animation({ src: "./src/Assets/Player/zuluzulu-defeated.png", frames: 9, interval: 6 }),
};

//Animaciones platforms
export const platformsAnimation = {
superS: new Animation({ src: "./src/Assets/platforms/PlatS/SuperJump_Red_S.png", frames:2, interval:12}),
superM: new Animation({ src: "./src/Assets/platforms/PlatM/SuperJump_Red_M.png", frames:2, interval:12}),
superL: new Animation({ src: "./src/Assets/platforms/PlatL/SuperJump_Blue_L.png", frames:2, interval:12}),
}

//Animacion de logo - COMENTADO temporalmente
// const logoAnimation = new Animation({
// src: "./src/Background/RORE Games Logo.png", // 👈 tu spritesheet
// frames: 24,                       	// 👈 número de cuadros en la animación
// interval: 10                     	// 👈 cada cuántos ticks cambia de frame
// });

//Animacion de game over