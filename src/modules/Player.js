//========================== Player =========================

// player.js
export default class Player {
constructor(x, y, width, height, canvasHeight, canvasWidth, animations) {
   this.x = x;
   this.y = y;
   this.width = width;
   this.height = height;
   this. prevY = y;



   // Física (valores originales)
   this.vy = 0;
   this.gravity = 0.5; // Gravedad original
   this.jumpForce = -10; // 👈 Solo para saltar desde el suelo

   // Piso físico (ground)
   this.ground = canvasHeight - this.height + 10;

   // Movimiento horizontal
   this.speed = 6; // Velocidad original
   this.vx = 0;

   // Estado
   this.frozen = false
   this.canvasWidth = canvasWidth;
   this.canvasHeight = canvasHeight;

   this.animations = animations;
   this.currentAnim = "idle";
 }

setAnimation(name) {
   if (this.currentAnim !== name && this.animations[name]) {
 	this.currentAnim = name;
 	this.animations[name].reset();
   }
 }

update(dt) {
if (this.frozen) return;
this.prevY = this.y;

// Física con delta time - manteniendo valores originales
// Multiplicador base para normalizar a 60 FPS
const timeMultiplier = dt * 60;

this.vy += this.gravity * timeMultiplier;
this.y += this.vy * timeMultiplier;

if (this.y > this.ground) {
   this.y = this.ground;
   this.vy = 0;
 }

this.x += this.vx * timeMultiplier;

// Wrapping horizontal
if (this.x + this.width < 0) this.x = this.canvasWidth;
else if (this.x > this.canvasWidth) this.x = -this.width;

// 👇 Ya no decides animación aquí
const anim = this.animations[this.currentAnim];
if (anim) anim.update(dt);
}

// método para cambiar animación
setAnimation(name) {
if (this.currentAnim !== name && this.animations[name]) {
   this.currentAnim = name;
   this.animations[name].reset();
 }
}

// Condición de estar tocando el piso (para game over)
isOnFloor() {
   return this.y >= this.ground;
 }

// Solo salta desde el suelo, no desde plataformas
jump() {
   if (this.frozen) return;
   if (this.y === this.ground) {
 	this.vy = this.jumpForce;
   }
 }

moveLeft() {
   if (this.frozen) return;
   this.vx = -this.speed;
 }

moveRight() {
   if (this.frozen) return;
   this.vx = this.speed;
 }

stop() {
   if (this.frozen) return;
   this.vx = 0;
 }

freeze() {
   this.frozen = true;
   this.vx = 0;
   this.vy = 0;
 }

  draw(ctx, cameraY = 0) {
const anim = this.animations[this.currentAnim];
if (!anim) return;
 anim.draw(ctx, this.x, this.y - cameraY, this.width, this.height);
}

}