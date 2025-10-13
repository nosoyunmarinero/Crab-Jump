// =========== FRAME-RATE INDEPENDENT GAME SYSTEM ===============
// Este juego ahora usa un sistema de tiempo delta para ser independiente de los FPS
// Los valores de física y movimiento se normalizan a 60 FPS como base
// Esto significa que el juego correrá a la misma velocidad en todas las máquinas
// sin importar si tienen 30, 60, 120 o más FPS

window.addEventListener("load", () => {
const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

// ===== SISTEMA DE TIEMPO PARA FRAME-RATE INDEPENDIENTE =====
let lastTime = 0;
let deltaTime = 0;
const TARGET_FPS = 60;
const TARGET_FRAME_TIME = 1000 / TARGET_FPS;
let accumulator = 0;

// Fondo del gameplay
const bg = new Image();
 bg.src = "./src/Background/1.png";

// Fondo del menú
const menuBackground = new Image();
 menuBackground.src = "./src/Background/Start.png";

// Fondo de Game Over
const gameOverBackground = new Image();
gameOverBackground.src = "./src/Background/gameover.png"; // 👈 tu imagen distinta

// Guardar progreso localmente
const savedMaxDistance = localStorage.getItem("maxDistance");
const savedGlobalCoins = localStorage.getItem("globalCoins");

// Estado de juego centralizado
const game = {
   state: "menu",
gameOver: false,
paused: false,
started: false,
distance: 0,   	// 👈 distancia actual
maxDistance: savedMaxDistance ? parseInt(savedMaxDistance) : 0, // 👈 carga récord
globalCoins: savedGlobalCoins ? parseInt(savedGlobalCoins) : 0,// 👈 carga Coins

end() {
if (this.gameOver) return;
this.gameOver = true;
this.state = "gameover";
 player.freeze();

  // Actualizar récord
if (this.distance > this.maxDistance) {
   this.maxDistance = this.distance;
   localStorage.setItem("maxDistance", this.maxDistance); // 👈 guardar récord
 }

// Sumar monedas de la run al global
this.globalCoins += level.coins;
localStorage.setItem("globalCoins", this.globalCoins); // 👈 guardar monedas
},

togglePause() {
   if (this.gameOver || !this.started) return;
   this.paused = !this.paused;
 },

start() {
this.gameOver = false;
this.paused = false;
this.started = true;
this.state = "playing";
this.distance = 0;
 level.resetObstacles();

// Reposicionar jugador al inicio
 player.x = 210;
 player.y = 200;
 player.vx = 0;
 player.vy = 0;
 player.frozen = false;
this.startY = player.y;

// Reiniciar nivel
 level.cameraY = 0;
 level.platforms = [];
 level.objects = [];   	// 👈 limpiar monedas previas
 level.coins = 0;      	// 👈 reiniciar contador de monedas
 level.generateInitialPlatforms();

// No necesitamos remover clases, el tap en pantalla maneja el reinicio
}
};


const player = new Player(50, 50, 32, 32, canvas.height, canvas.width, playerAnimations);

// Variables de tiempo para el jugador
let playerLastTime = 0;
const controls = new Controls();
window.addEventListener("keydown", (e) => {
if (e.key === "Escape") {
   game.togglePause();
 }
if (e.code === "Space" && !game.started) {
   game.start();
 }
if (e.key.toLowerCase() === "r" && game.gameOver) {
   game.start()
 }
});
const level = new Level({
onGameOver: () => {
   game.end()
   player.setAnimation('dead')
 },
canvasHeight: canvas.height
});

function update(dt) {
if (!game.started || game.gameOver || game.paused) return;

// Movimiento del jugador
if (controls.keys.left) player.moveLeft();
else if (controls.keys.right) player.moveRight();
else player.stop();

if (controls.keys.up) player.jump();

 player.update(dt);
 level.update(player, dt);
 level.checkCollisions(player);

  // 👇 Calcular distancia recorrida
const currentDistance = Math.max(0, game.startY - player.y);
 game.distance = Math.max(game.distance, Math.floor(currentDistance));

if (player.isOnFloor()) {
   game.end();
 }
}

function draw() {
 ctx.clearRect(0, 0, canvas.width, canvas.height);

// Fondo
 ctx.save();
 ctx.globalAlpha = 0.6;
 ctx.drawImage(bg, 0, 0, canvas.width, canvas.height);
 ctx.restore();

// Nivel y jugador
 level.draw(ctx);
 player.draw(ctx, level.cameraY);


// 👇 HUD de distancia y monedas SIEMPRE visible
 ctx.fillStyle = "#fff";
 ctx.font = "16px system-ui";
 ctx.textAlign = "left";
 ctx.fillText(`Distancia: ${game.distance} m`, 10, 20);
 ctx.fillText(`Récord: ${game.maxDistance} m`, 10, 40); 
 ctx.fillText(`Monedas: ${level.coins}`, 10, 60); // 👈 aquí mostramos las monedas
 ctx.fillText(`Total Monedas: ${game.globalCoins}`, 10, 80);
 
 // 👇 Información de rendimiento (opcional - puedes quitarlo en producción)
 ctx.fillStyle = "rgba(255,255,255,0.7)";
 ctx.font = "12px system-ui";
 ctx.fillText(`FPS: ${Math.round(1/deltaTime)}`, 10, 100);
 ctx.fillText(`Delta: ${(deltaTime*1000).toFixed(1)}ms`, 10, 115);


// Overlay de Game Over
if (game.gameOver) {
   ctx.save();
   ctx.fillStyle = "rgba(0,0,0,0.5)";
   ctx.fillRect(0, 0, canvas.width, canvas.height);
   ctx.fillStyle = "#fff";
   ctx.font = "bold 32px system-ui";
   ctx.textAlign = "center";
   ctx.fillText("GAME OVER", canvas.width / 2, canvas.height / 2);

   // 👇 Mostrar distancia alcanzada
   ctx.font = "20px system-ui";
   ctx.fillText(
 	`Avanzaste ${game.distance} m`,
     canvas.width / 2,
     canvas.height / 2 + 40
   );
   // Detectar si es móvil
   const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
				window.matchMedia('(max-width: 768px) and (hover: none) and (pointer: coarse)').matches ||
				('ontouchstart' in window) ||
				(navigator.maxTouchPoints > 0);
   
   const restartMessage = isMobile ? "TOCA LA PANTALLA PARA REINICIAR" : "PRESIONA R PARA REINICIAR";
   ctx.fillText(restartMessage, canvas.width / 2, canvas.height / 2 + 80);
   ctx.restore();
 }
   // 👇 Overlay de Pausa
if (game.paused && !game.gameOver) {
   ctx.save();
   ctx.fillStyle = "rgba(0,0,0,0.5)";
   ctx.fillRect(0, 0, canvas.width, canvas.height);
   ctx.fillStyle = "#fff";
   ctx.font = "bold 32px system-ui";
   ctx.textAlign = "center";
   ctx.fillText("PAUSA", canvas.width / 2, canvas.height / 2);
   ctx.restore();
 }
// Overlay de Inicio
if (!game.started && !game.gameOver) {
 ctx.save();
 ctx.fillStyle = "rgba(0,0,0,0.7)";
 ctx.fillRect(0, 0, canvas.width, canvas.height);
 ctx.fillStyle = "#fff";
 ctx.font = "bold 18px system-ui";
 ctx.textAlign = "center";
 
 // Detectar si es móvil
 const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
			   window.matchMedia('(max-width: 768px) and (hover: none) and (pointer: coarse)').matches ||
			   ('ontouchstart' in window) ||
			   (navigator.maxTouchPoints > 0);
 
 const message = isMobile ? "TOCA LA PANTALLA PARA JUGAR" : "PRESIONA SPACE PARA JUGAR";
 ctx.fillText(message, canvas.width / 2, canvas.height / 2);
 ctx.restore();
}

}

function drawMenu(ctx) {
// Fondo
 ctx.drawImage(menuBackground, 0, 0, canvas.width, canvas.height);

// Logo animado
 // logoAnimation.draw(ctx, 10, 10, 64, 64);

// Título con sombra
 ctx.fillStyle = "#fff";
 ctx.font = "bold 40px system-ui";
 ctx.textAlign = "center";
 ctx.shadowColor = "black";
 ctx.shadowBlur = 4;
 ctx.shadowOffsetX = 2;
 ctx.shadowOffsetY = 2;
 ctx.fillText("Crab Jump", canvas.width / 2, 150);

// 👇 Animación del personaje en salto (centrado debajo del título)
 player.currentAnimation = playerAnimations.jump;
 player.currentAnimation.update(1/60); // Delta time fijo para menú
 player.currentAnimation.draw(ctx, canvas.width / 2 - 32, 200, 64, 64);

// 👇 Mostrar récord más alto
 ctx.font = "20px system-ui";
ctx.fillStyle = "#fff";
ctx.shadowColor = "black";
ctx.shadowBlur = 3;
ctx.shadowOffsetX = 2;
ctx.shadowOffsetY = 2;
ctx.fillText(`Récord: ${game.maxDistance} m`, canvas.width / 2, 280);
ctx.fillText(`Monedas totales: ${game.globalCoins}`, canvas.width / 2, 310);

// Botón Start
 ctx.shadowColor = "transparent"; // reset sombra
 ctx.font = "bold 24px system-ui";
 ctx.shadowColor = "black";
 ctx.shadowBlur = 3;
 ctx.shadowOffsetX = 2;
 ctx.shadowOffsetY = 2;
 ctx.fillText("Presiona Space para iniciar", canvas.width / 2, 340);

// Reset sombra
 ctx.shadowColor = "transparent";
 ctx.shadowBlur = 0;
 ctx.shadowOffsetX = 0;
 ctx.shadowOffsetY = 0;
}


function drawGameOver(ctx) {
// Fondo de Game Over
if (gameOverBackground.complete) {
   ctx.drawImage(gameOverBackground, 0, 0, canvas.width, canvas.height);
 } else {
   ctx.fillStyle = "black";
   ctx.fillRect(0, 0, canvas.width, canvas.height);
 }

// ====== Texto principal con sombra ======
 ctx.fillStyle = "#fff";
 ctx.font = "bold 48px system-ui";
 ctx.textAlign = "center";

 ctx.shadowColor = "black";
 ctx.shadowBlur = 6;
 ctx.shadowOffsetX = 3;
 ctx.shadowOffsetY = 3;

 ctx.fillText("GAME OVER", canvas.width / 2, canvas.height / 2 - 100);

// 👇 Animación del personaje derrotado (centrado debajo del texto)
 player.currentAnimation = playerAnimations.dead;
 player.currentAnimation.update(1/60); // Delta time fijo para game over
 player.currentAnimation.draw(ctx, canvas.width / 2 - 32, canvas.height / 2 - 32, 64, 64);



// ====== Instrucción con sombra ======
ctx.font = "20px system-ui";
ctx.fillText(`Avanzaste ${game.distance} m`, canvas.width / 2, canvas.height / 2 + 40);
ctx.fillText(`Récord: ${game.maxDistance} m`, canvas.width / 2, canvas.height / 2 + 70);
ctx.fillText("Presiona R para reintentar", canvas.width / 2, canvas.height / 2 + 110);

// Resetear sombra para no afectar otros elementos
 ctx.shadowColor = "transparent";
 ctx.shadowBlur = 0;
 ctx.shadowOffsetX = 0;
 ctx.shadowOffsetY = 0;
}





function loop(currentTime) {
 // Calcular delta time en segundos
 if (lastTime === 0) lastTime = currentTime;
 deltaTime = (currentTime - lastTime) / 1000; // Convertir a segundos
 lastTime = currentTime;

 // Limitar el delta time para evitar saltos grandes
 deltaTime = Math.min(deltaTime, 0.1); // Máximo 100ms

 ctx.clearRect(0, 0, canvas.width, canvas.height);

if (game.state === "menu") {
   // logoAnimation.update();
   drawMenu(ctx);
 } else if (game.state === "playing") {
   update(deltaTime);
   draw();
 } else if (game.state === "gameover") {
   drawGameOver(ctx); 
 }

requestAnimationFrame(loop);
}

 bg.onload = () => requestAnimationFrame(loop);
});

// =================== CONTROLS =================
// controls.js
class Controls {
constructor() {
   this.keys = { left: false, right: false, up: false };

   window.addEventListener("keydown", (e) => {
 	if (e.code === "ArrowLeft" || e.code === "KeyA") this.keys.left = true;
 	if (e.code === "ArrowRight" || e.code === "KeyD") this.keys.right = true;
 	if (e.code === "Space" || e.code === "ArrowUp" || e.code === "KeyW") this.keys.up = true;
   });

   window.addEventListener("keyup", (e) => {
 	if (e.code === "ArrowLeft" || e.code === "KeyA") this.keys.left = false;
 	if (e.code === "ArrowRight" || e.code === "KeyD") this.keys.right = false;
 	if (e.code === "Space" || e.code === "ArrowUp" || e.code === "KeyW") this.keys.up = false;
   });
 }
}

//========================== Player =========================
// player.js
class Player {
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
// =========== LEVEL ==============
// level.js
class Level {
constructor({ onGameOver, canvasHeight } = {}) {
   this.onGameOver = typeof onGameOver === "function" ? onGameOver : null;
   this.canvasHeight = canvasHeight;

   this.objects = [];   // aquí guardaremos monedas y otros consumibles
   this.coins = 0;  	// contador global de monedas
   this.coinImage = new Image();


   this.platforms = [];
   this.debug = false;
   this.deathLine = {
 	x1: 0,
 	y: canvasHeight + 4,
 	x2: 512,
 	thickness: 6,
 	color: "red"
   };

   this.cameraY = 0; // 👈 offset de cámara

   // 👇 Aquí inicializas los obstáculos
   this.obstacles = [];
   this.obstacleSpawnFrames = 0;
   this.obstacleSpawnInterval = 120; // cada 120 frames aparece un "device"
   this.obstacleSpawnTimer = 0; // Timer en segundos

   this.generateInitialPlatforms();
 }

// ====== Generación inicial ======
generateInitialPlatforms() {
const canvasWidth = 400;
const platformWidth = 64;
const startY = this.canvasHeight - 100; // 👈 asegura que arranquen visibles
const minGap = 80;

// Primera plataforma siempre centrada
const centerX = (canvasWidth / 2) - (platformWidth / 2);
const firstPlatform = this.createPlatform("basicM", centerX, startY);
this.platforms.push(firstPlatform);

// Luego generas las demás
for (let i = 1; i < 6; i++) {
   const newY = startY - i * 80;
   const platformsInRow = Math.random() < 0.4 ? 2 : 1;
   let usedX = [];

   for (let j = 0; j < platformsInRow; j++) {
 	let newX;
 	let tries = 0;

 	do {
       newX = Math.random() * (canvasWidth - platformWidth);
       tries++;
     } while (
       usedX.some(x => Math.abs(x - newX) < minGap) && tries < 10
     );

     usedX.push(newX);

 	const types = this.randomType({ allowSpikes: false });
     types.forEach((t, idx) => {
   	let finalX = newX;
   	if (idx > 0) {
         finalX += 100;
     	if (finalX > canvasWidth - platformWidth) finalX = newX - 100;
       }

   	const platform = this.createPlatform(t, finalX, newY);
   	this.platforms.push(platform);

   	// 👇 Generar monedas solo si la plataforma está en pantalla
   	if (
         platform.y >= this.cameraY &&
         platform.y <= this.cameraY + this.canvasHeight
       ) {
     	if (Math.random() < objects.coin.probability) {
       	this.objects.push({
             ...objects.coin,
         	x: platform.x + platform.width / 2 - objects.coin.width / 2,
         	y: platform.y - objects.coin.height,
         	frameIndex: 0,
         	tick: 0
           });
         }
       }
     });
   }
 }
}


// ====== Crear instancia de plataforma ======
createPlatform(typeKey, x, y) {
const type = platformTypes[typeKey];
const animation = platformsAnimation[typeKey] || null;

// Objeto base de la plataforma
const platform = {
   x,
   y,
   width: type.width,
   height: type.height,
   bounceForce: type.bounceForce,
   collisionOffsetTop: type.collisionOffsetTop || 0,
   collisionOffsetLeft: type.collisionOffsetLeft || 0,
   collisionOffsetRight: type.collisionOffsetRight || 0,
   probability: type.probability,
   type: typeKey,
   ready: true,
   image: null,
   animation: null,
   onCollide: type.onCollide,
 };

if (animation) {
   // 👇 cada plataforma obtiene su propia animación
   platform.animation = new Animation({
 	src: animation.image.src,
 	frames: animation.frames,
 	interval: animation.interval,
   });
 } else {
   // 👇 solo si no hay animación, cargamos imagen
   const src = Array.isArray(type.srcs)
     ? type.srcs[Math.floor(Math.random() * type.srcs.length)]
     : type.src;

   if (src) {
 	const img = new Image();
     platform.image = img;
     platform.ready = false;
     img.onload = () => { platform.ready = true; };
     img.src = src;
   }
 }

return platform;
}

// ====== Tipo aleatorio ======
randomType({ allowSpikes = true } = {}) {
const keys = Object.keys(platformTypes).filter(
   k => allowSpikes || !k.startsWith("spikes") // excluye spikes si no se permiten
 );

const total = keys.reduce(
   (sum, key) => sum + (platformTypes[key].probability || 0),
   0
 );

let r = Math.random() * total;
for (const key of keys) {
   r -= platformTypes[key].probability;
   if (r <= 0) {
 	// 👇 si es spike, devolvemos combo spike + normal
 	if (key.startsWith("spikes")) {
   	return [key, "basicM"];
     }
 	return [key];
   }
 }

return [keys[0]];
}

// ================== MÉTODOS DE OBSTÁCULOS ==================

createObstacle(typeKey, x, y) {
   const type = obstacles[typeKey];
   const obstacle = {
     x,
     y,
 	width: type.width,
 	height: type.height,
 	speed: type.fallSpeed,
 	type: typeKey,
 	effect: type.effect,
 	ready: true,
 	image: null,
   };

   const src = Array.isArray(type.srcs)
     ? type.srcs[Math.floor(Math.random() * type.srcs.length)]
     : type.srcs;

   if (src) {
 	const img = new Image();
     obstacle.image = img;
     obstacle.ready = false;
     img.onload = () => { obstacle.ready = true; };
     img.src = src;
   }

   return obstacle;
 }

randomObstacleType() {
const keys = Object.keys(obstacles);
const total = keys.reduce((sum, k) => sum + (obstacles[k].probability || 0), 0);
let r = Math.random() * total;
for (const k of keys) {
   r -= obstacles[k].probability;
   if (r <= 0) return k;
 }
return keys[0];
}

spawnObstacle() {
   const typeKey = this.randomObstacleType();
   const type = obstacles[typeKey];
   const x = Math.random() * (400 - type.width);
   const y = this.cameraY - 80;
   this.obstacles.push(this.createObstacle(typeKey, x, y));
 }

updateObstacles(player, dt) {
// Convertir el intervalo de spawn a tiempo real
this.obstacleSpawnTimer = (this.obstacleSpawnTimer || 0) + dt;
if (this.obstacleSpawnTimer >= this.obstacleSpawnInterval / 60) {
   this.spawnObstacle();
   this.obstacleSpawnTimer = 0;
 }

this.obstacles = this.obstacles.filter((o) => {
   o.y += o.speed * dt * 60; // hace caer al obstáculo con delta time

   // detección de colisión jugador vs obstáculo
   const hit =
     o.x < player.x + player.width &&
     o.x + o.width > player.x &&
     o.y < player.y + player.height &&
     o.y + o.height > player.y;

   if (hit) {
 	if (o.effect === "kill") {
   	if (this.onGameOver) this.onGameOver(); // termina el juego
   	return false; // elimina obstáculo
     }

 	if (o.effect === "bounce") {
  	const verticalForce = 10;                	// fuerza vertical base
   	const oCenterY     = o.y + o.height / 2; 	// centro de la pelota
    	const pCenterY     = player.y + player.height / 2; // centro del jugador

   	// rebote arriba vs. abajo según dónde impactó
   	if (pCenterY < oCenterY) {
       player.vy = -verticalForce;            	// rebota hacia arriba
       } else {
      player.vy = verticalForce;             	// empuja hacia abajo
       }

 player.setAnimation("jump");             	// animación de rebote
return true;                             	// no elimina la pelota
}

   }

   return o.y < this.cameraY + this.canvasHeight + o.height; // mantiene obstáculo en pantalla
 });
}

updateObjects(player, dt) {
this.objects = this.objects.filter(obj => {
   if (obj.type === "coin") {
 	// animación con delta time
     obj.tick = (obj.tick || 0) + dt * 60;
 	if (obj.tick >= objects.coin.frameSpeed) {
       obj.frameIndex = (obj.frameIndex + 1) % objects.coin.frames;
       obj.tick = 0;
     }

 	// colisión con jugador
 	const hit =
       obj.x < player.x + player.width &&
       obj.x + obj.width > player.x &&
       obj.y < player.y + player.height &&
       obj.y + obj.height > player.y;

 	if (hit) {
   	this.coins++;
   	return false; // elimina la moneda recogida
     }
   }
   return true;
 });
}

drawObjects(ctx) {
this.objects.forEach(obj => {
   if (obj.type === "coin" && this.coinImage.complete) {
 	const frameWidth = this.coinImage.width / objects.coin.frames;
     ctx.drawImage(
   	this.coinImage,
       obj.frameIndex * frameWidth, 0,
       frameWidth, this.coinImage.height,
       obj.x, obj.y - this.cameraY,
       obj.width, obj.height
     );
   }
 });
}

drawObstacles(ctx) {
   this.obstacles.forEach((o) => {
 	if (o.image && o.ready) {
       ctx.drawImage(o.image, o.x, o.y - this.cameraY, o.width, o.height);
     } else {
       ctx.fillStyle = "red";
       ctx.fillRect(o.x, o.y - this.cameraY, o.width, o.height);
     }
   });
 }




resetObstacles() {
   this.obstacles = [];
   this.obstacleSpawnFrames = 0;
 }

// ====== Update con scroll ======
update(player, dt) {
const threshold = 200;

// Scroll de cámara
if (player.y - this.cameraY < threshold) {
   this.cameraY = player.y - threshold;
 }

// Eliminar plataformas que salieron abajo
this.platforms = this.platforms.filter(p => p.y < this.cameraY + this.canvasHeight);

// Generar nuevas filas arriba
const maxPlatforms = 12; // máximo en pantalla
const buffer = 200;  	// 👈 margen por encima de la cámara

// Mientras haya pocas plataformas o la más alta esté demasiado cerca de la cámara
while (
   this.platforms.length < maxPlatforms ||
   Math.min(...this.platforms.map(p => p.y)) > this.cameraY - buffer
 ) {
   // Encuentra la plataforma más alta (menor Y)
   const lastY = Math.min(...this.platforms.map(p => p.y));

   // Controla la separación vertical
   const minYGap = 60;
   const maxYGap = 90;
   const gapY = minYGap + Math.random() * (maxYGap - minYGap);

   // Nueva fila un poco más arriba
   const newY = lastY - gapY;

   // Forzar que cada 3 filas haya al menos 2 plataformas
   if (!this.rowCounter) this.rowCounter = 0;
   this.rowCounter++;

   const platformsInRow = (this.rowCounter % 3 === 0)
     ? 2
     : (Math.random() < 0.4 ? 2 : 1);

   const canvasWidth = 400;
   const minGap = 80; // separación mínima entre plataformas
   let usedX = [];

   for (let i = 0; i < platformsInRow; i++) {
 	let newX;
 	let tries = 0;

 	// Genera X aleatorio con separación mínima
 	do {
       newX = Math.random() * (canvasWidth - 64);
       tries++;
     } while (
       usedX.some(x => Math.abs(x - newX) < minGap) && tries < 10
     );

     usedX.push(newX);

 	// randomType puede devolver un array (ej. ["spikesM","basicM"])
 	const types = this.randomType({ allowSpikes: true });

     types.forEach((t, idx) => {
   	let finalX = newX;

   	// Si es la segunda plataforma del combo, la desplazamos un poco
   	if (idx > 0) {
         finalX += 100;
     	if (finalX > canvasWidth - 64) {
           finalX = newX - 100; // si se sale, la ponemos al otro lado
         }
       }

   	const platform = this.createPlatform(t, finalX, newY);
this.platforms.push(platform);

// 👇 Generar monedas en plataformas nuevas
if (Math.random() < objects.coin.probability) {
this.objects.push({
   ...objects.coin,
   x: platform.x + platform.width / 2 - objects.coin.width / 2,
   y: platform.y - objects.coin.height,
   frameIndex: 0,
   tick: 0,
   type: "coin" // 👈 importante para que drawObjects la reconozca
 });
}
     });
   }
 }

// Actualizar plataformas móviles
this.platforms.forEach(p => {
   if (p.type === "moving") {
     p.x += p.speed * p.direction * dt * 60;
 	if (p.x < 0 || p.x + p.width > 300) p.direction *= -1;
   }
 });

// Línea de muerte sigue al jugador
this.deathLine.y = this.cameraY + this.canvasHeight + 100;

//Obstaculos
this.updateObstacles(player, dt);

//Objetos
this.updateObjects(player, dt);
}


// ====== Dibujar ======
draw(ctx) {
// Línea de muerte
 ctx.beginPath();
 ctx.moveTo(this.deathLine.x1, this.deathLine.y - this.cameraY);
 ctx.lineTo(this.deathLine.x2, this.deathLine.y - this.cameraY);
 ctx.strokeStyle = this.deathLine.color;
 ctx.lineWidth = this.deathLine.thickness;
 ctx.stroke();

// Plataformas
this.platforms.forEach(p => {
   if (p.animation) {
     p.animation.update(1/60); // Delta time fijo para animaciones en draw
     p.animation.draw(ctx, p.x, p.y - this.cameraY, p.width, p.height);
   } else if (p.image && p.ready && p.image.complete) {
 	if (!p.spawnTime) p.spawnTime = Date.now();
 	const elapsed = Date.now() - p.spawnTime;
 	const fadeDuration = 200;
 	const alpha = Math.min(1, elapsed / fadeDuration);

     ctx.save();
     ctx.globalAlpha = alpha;
     ctx.drawImage(p.image, p.x, p.y - this.cameraY, p.width, p.height);
     ctx.restore();
   }

   if (this.debug) {
 	const offsetTop = p.collisionOffsetTop || 0;
 	const offsetLeft = p.collisionOffsetLeft || 0;
 	const offsetRight = p.collisionOffsetRight || 0;

 	const platTop = p.y + offsetTop;
 	const platLeft = p.x + offsetLeft;
 	const platRight = p.x + p.width - offsetRight;

     ctx.strokeStyle = "red";
     ctx.beginPath();
     ctx.moveTo(platLeft, platTop - this.cameraY);
     ctx.lineTo(platRight, platTop - this.cameraY);
     ctx.stroke();
   }
 });

// 👇 Aquí dibujas los obstáculos
this.drawObstacles(ctx);

// 👇 Aquí dibujas los objetos
this.drawObjects(ctx);
}

// ====== Colisiones ======
checkCollisions(player) {
const playerBottom = player.y + player.height;
const playerLeft = player.x;
const playerRight = player.x + player.width;

// Línea de muerte (igual que antes)
const hitsDeathLine =
   playerBottom >= this.deathLine.y &&
   playerRight > this.deathLine.x1 &&
   playerLeft < this.deathLine.x2;

if (hitsDeathLine && this.onGameOver) this.onGameOver();

// Plataformas
this.platforms.forEach(p => {
   if (!p.ready) return;

   const offsetTop = p.collisionOffsetTop || 0;
   const offsetBottom = p.collisionOffsetBottom || 0;
   const offsetLeft = p.collisionOffsetLeft || 0;
   const offsetRight = p.collisionOffsetRight || 0;

   const platTop = p.y + offsetTop;
   const platLeft = p.x + offsetLeft;
   const platRight = p.x + p.width - offsetRight;

   // NUEVO: colisión por cruce del borde superior entre frames
   const prevBottom = player.prevY + player.height;
   const currBottom = playerBottom;

   const overlapX = playerRight > platLeft && playerLeft < platRight;
   const crossingFromAbove = prevBottom <= platTop && currBottom >= platTop && player.vy >= 0;

   if (overlapX && crossingFromAbove && typeof p.onCollide === "function") {
     p.onCollide(player, p, this);
   }
 });
}

// ====== Eliminar plataforma (ej. frágiles) ======
removePlatform(platform) {
   this.platforms = this.platforms.filter(p => p !== platform);
 }
}

// ===================== Platforms ==============
// platformTypes.js
const platformTypes = {
basicM: {
   width: 64,
   height: 64,
   srcs: [
 	"./src/platforms/PlatM/Plat_Red_M.png",
 	"./src/platforms/PlatM/Plat_Blue_M.png",
 	"./src/platforms/PlatM/Plat_Green_M.png",
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
 	"./src/platforms/PlatS/Plat_Red_S.png",
 	"./src/platforms/PlatS/Plat_Green_S.png",
 	"./src/platforms/PlatS/Plat_Blue_S.png",
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
 	"./src/platforms/PlatL/Plat_Red_L.png",
 	"./src/platforms/PlatL/Plat_Green_L.png",
 	"./src/platforms/PlatL/Plat_Blue_L.png",
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
 	"./src/platforms/PlatS/Spikes_Red_S.png",
 	"./src/platforms/PlatS/Spikes_Blue_S.png",
 	"./src/platforms/PlatS/Spikes_Green_S.png",
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
 	"./src/platforms/PlatM/Spikes_Red_M.png",
 	"./src/platforms/PlatM/Spikes_Blue_M.png",
 	"./src/platforms/PlatM/Spikes_Green_M.png",
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
 	"./src/platforms/PlatL/Spikes_Red_L.png",
 	"./src/platforms/PlatL/Spikes_Blue_L.png",
 	"./src/platforms/PlatL/Spikes_Green_L.png",
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


// ========== obstacleTypes.js ==========
const obstacles = {
device: {
   width: 32,
   height: 32,
   srcs: [
 	"./src/Obstacles/Device.png",
   ],
   fallSpeed: 3,
   probability: 0.9,
   effect: "kill",
 },
ball: {
   width: 32,
   height: 32,
   srcs: [
 	"./src/Obstacles/ball.png",
   ],
   fallSpeed: 2,
   probability: 0.9,
   effect: "bounce",

 },
f5: {
   width: 32,
   height: 32,
   srcs: [
 	"./src/Obstacles/Factor5.png",
   ],
   fallSpeed: 5,
   probability: 0.9,
   effect: "kill",
 },
GPC: {
   width: 32,
   height: 32,
   srcs: [
 	"./src/Obstacles/GPC.png",
   ],
   fallSpeed: 3,
   probability: 0.9,
   effect: "kill",
 },
};

// ======= OBJECTS =======
const objects = {
coin: {
   type: "coin",   	// 👈 necesario para que drawObjects la reconozca
   width: 20,
   height: 20,
   src: "./src/Objects/Coin.png",
   probability: 0.1,
   frames: 20,
   frameIndex: 0,
   frameSpeed: 6
 }
};

// ======================== ANIMACIONES ===========
class Animation {
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
const playerAnimations = {
idle: new Animation({ src: "./src/Player/zuluzulu.png", frames: 3, interval: 12 }),
jump: new Animation({ src: "./src/Player/zulu-jump.png", frames: 11, interval: 4 }),
dead: new Animation({ src: "./src/Player/zuluzulu-defeated.png", frames: 9, interval: 6 }),
};

//Animaciones platforms
const platformsAnimation = {
superS: new Animation({ src: "./src/platforms/PlatS/SuperJump_Red_S.png", frames:2, interval:12}),
superM: new Animation({ src: "./src/platforms/PlatM/SuperJump_Red_M.png", frames:2, interval:12}),
}

//Animacion de logo - COMENTADO temporalmente
// const logoAnimation = new Animation({
// src: "./src/Background/RORE Games Logo.png", // 👈 tu spritesheet
// frames: 24,                       	// 👈 número de cuadros en la animación
// interval: 10                     	// 👈 cada cuántos ticks cambia de frame
// });

//Animacion de game over



// preload.js
function preloadPlatformImages(types, callback) {
const keys = Object.keys(types);
let loaded = 0;

 keys.forEach(key => {
   const img = new Image();
   img.onload = () => {
     types[key].image = img;
     loaded++;
 	if (loaded === keys.length) callback();
   };
   img.src = types[key].src;
 });
}

// ======= CONTROLES MÓVILES =======
// Sistema de controles táctiles para dispositivos móviles
function setupMobileControls() {
 // Verificar si es un dispositivo móvil (múltiples métodos)
 const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
         	  window.matchMedia('(max-width: 768px) and (hover: none) and (pointer: coarse)').matches ||
         	  ('ontouchstart' in window) ||
         	  (navigator.maxTouchPoints > 0);
 
 if (!isMobile) return;
 
 const mobileControls = document.getElementById('mobileControls');
 const leftBtn = document.getElementById('leftBtn');
 const rightBtn = document.getElementById('rightBtn');
 
 if (!mobileControls || !leftBtn || !rightBtn) return;
 
 // Funciones auxiliares para simular teclas
 function simulateKeyDown(keyCode) {
   const event = new KeyboardEvent('keydown', { code: keyCode });
   window.dispatchEvent(event);
 }
 
 function simulateKeyUp(keyCode) {
   const event = new KeyboardEvent('keyup', { code: keyCode });
   window.dispatchEvent(event);
 }
 
 // Botón izquierdo
 leftBtn.addEventListener('touchstart', (e) => {
   e.preventDefault();
   simulateKeyDown('ArrowLeft');
 });
 
 leftBtn.addEventListener('touchend', (e) => {
   e.preventDefault();
   simulateKeyUp('ArrowLeft');
 });
 
 leftBtn.addEventListener('mousedown', (e) => {
   e.preventDefault();
   simulateKeyDown('ArrowLeft');
 });
 
 leftBtn.addEventListener('mouseup', (e) => {
   e.preventDefault();
   simulateKeyUp('ArrowLeft');
 });
 
 // Botón derecho
 rightBtn.addEventListener('touchstart', (e) => {
   e.preventDefault();
   simulateKeyDown('ArrowRight');
 });
 
 rightBtn.addEventListener('touchend', (e) => {
   e.preventDefault();
   simulateKeyUp('ArrowRight');
 });
 
 rightBtn.addEventListener('mousedown', (e) => {
   e.preventDefault();
   simulateKeyDown('ArrowRight');
 });
 
 rightBtn.addEventListener('mouseup', (e) => {
   e.preventDefault();
   simulateKeyUp('ArrowRight');
 });
 
 // Botón de salto
 jumpBtn.addEventListener('touchstart', (e) => {
   e.preventDefault();
   simulateKeyDown('Space');
 });
 
 jumpBtn.addEventListener('touchend', (e) => {
   e.preventDefault();
   simulateKeyUp('Space');
 });
 
 jumpBtn.addEventListener('mousedown', (e) => {
   e.preventDefault();
   simulateKeyDown('Space');
 });
 
 jumpBtn.addEventListener('mouseup', (e) => {
   e.preventDefault();
   simulateKeyUp('Space');
 });
 
 // Prevenir el menú contextual en botones
 [leftBtn, rightBtn, jumpBtn].forEach(btn => {
   btn.addEventListener('contextmenu', (e) => e.preventDefault());
 });
}

// Inicializar controles móviles cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', setupMobileControls);

// También intentar inicializar cuando el script se carga (por si acaso)
if (document.readyState === 'loading') {
 document.addEventListener('DOMContentLoaded', setupMobileControls);
} else {
 setupMobileControls();
}
