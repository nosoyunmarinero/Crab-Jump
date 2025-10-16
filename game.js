import Controls from "./src/modules/Controls.js";
import Player from "./src/modules/Player.js";
import Level from "./src/modules/Level.js";
import { playerAnimations } from "./src/modules/Animation.js";

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
 bg.src = "./src/Assets/Background/1.png";

// Fondo del menú
const menuBackground = new Image();
 menuBackground.src = "./src/Assets/Background/Start.png";

// Fondo de Game Over
const gameOverBackground = new Image();
gameOverBackground.src = "./src/Assets/Background/gameover.png"; // 👈 tu imagen distinta

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


//Instancia de controls
const controls = new Controls(game);

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






// ========== obstacleTypes.js ==========
const obstacles = {
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

// ======= OBJECTS =======
const objects = {
coin: {
   type: "coin",   	// 👈 necesario para que drawObjects la reconozca
   width: 20,
   height: 20,
   src: "./src/Assets/Objects/Coin.png",
   probability: 0.1,
   frames: 20,
   frameIndex: 0,
   frameSpeed: 6
 }
};





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

