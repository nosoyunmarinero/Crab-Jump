// =========== LEVEL ==============
import { platformsAnimation, Animation } from "./Animation.js";
import { platformTypes } from "./Platforms.js";
import { objects } from "./Objects.js";
import { obstacles } from "./Obstacles.js";

// level.js
export default class Level {
constructor({ onGameOver, canvasHeight } = {}) {
   this.onGameOver = typeof onGameOver === "function" ? onGameOver : null;
   this.canvasHeight = canvasHeight;

   this.objects = [];   // aquí guardaremos monedas y otros consumibles
   this.coins = 0;  	// contador global de monedas
   this.coinImage = new Image();
   this.coinImage.src = objects.coin.src; 


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
     img.onerror = () => { 
       console.warn(`Error al cargar imagen de plataforma: ${src}`);
       platform.ready = false; 
     };
     img.src = src;
   } else {
     console.warn(`Plataforma ${typeKey} no tiene imagen válida`);
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

   	// Si es la segunda plataforma del combo, la desplazamos con suficiente espacio
   	if (idx > 0) {
         finalX += 164; // 64 (ancho plataforma) + 100 (espacio adicional)
  	// Si se sale de la pantalla, intentar al otro lado
  	if (finalX > canvasWidth - 64) {
           finalX = newX - 164; // Colocar al lado izquierdo con suficiente espacio
           // Si aún así se sale, forzar dentro de los límites
           if (finalX < 0) {
             finalX = Math.max(0, Math.min(canvasWidth - 64, finalX));
           }
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
   type: "coin" 
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

// Plataformas - Solo renderizar plataformas válidas
this.platforms.forEach(p => {
   // Verificar que la plataforma tenga algo que renderizar
   const hasAnimation = p.animation && p.animation.image && p.animation.image.complete;
   const hasImage = p.image && p.ready && p.image.complete;
   
   if (hasAnimation) {
     p.animation.update(1/60); // Delta time fijo para animaciones en draw
     p.animation.draw(ctx, p.x, p.y - this.cameraY, p.width, p.height);
   } else if (hasImage) {
 	if (!p.spawnTime) p.spawnTime = Date.now();
 	const elapsed = Date.now() - p.spawnTime;
 	const fadeDuration = 200;
 	const alpha = Math.min(1, elapsed / fadeDuration);

     ctx.save();
     ctx.globalAlpha = alpha;
     ctx.drawImage(p.image, p.x, p.y - this.cameraY, p.width, p.height);
     ctx.restore();
   }
   // Si no tiene animación ni imagen válida, no se renderiza

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

// ====== Limpiar plataformas inválidas ======
cleanupInvalidPlatforms() {
   this.platforms = this.platforms.filter(p => {
     const hasValidAnimation = p.animation && p.animation.image && p.animation.image.complete;
     const hasValidImage = p.image && p.ready && p.image.complete;
     const hasVisualContent = hasValidAnimation || hasValidImage;
     
     if (!hasVisualContent) {
       console.warn(`Plataforma ${p.type} en (${p.x}, ${p.y}) eliminada por falta de contenido visual`);
     }
     
     return hasVisualContent;
   });
 }
}
