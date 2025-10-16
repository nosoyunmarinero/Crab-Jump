import Controls from "./src/modules/Controls.js";
import Player from "./src/modules/Player.js";
import Level from "./src/modules/Level.js";
import { playerAnimations } from "./src/modules/Animation.js";
import {
  cosmetics,
  rarityColors, 
  getCosmeticsSorted, 
  loadSelectedSkin,
  loadUnlockedSkins,
  saveSelectedSkin,
  unlockSkin,
} from "./src/modules/Cosmetics.js";

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
 selectedSkin: loadSelectedSkin(),
 currentSkinIndex: 0,



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

  // 👇 aplicar skin seleccionado
  const skin = cosmetics[this.selectedSkin];
  if (skin) {
    player.animations = skin.animations;
    player.setAnimation("idle");
  }
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

},

openShop() {
    this.state = "shop";
  },

   closeShop() {
    this.state = "menu";
    this.shopMessage ="";
  },
  getSkins() {
  return getCosmeticsSorted();
},


  attemptPurchaseOrEquip() {
  const skins = this.getSkins();
  const skin = skins[this.currentSkinIndex];
  if (!skin) return;

  if (skin.unlocked) {
  this.selectedSkin = skin.id;
  saveSelectedSkin(skin.id);

  // 👇 actualizar animaciones del player
  player.animations = skin.animations;
  player.setAnimation("idle");

  this.shopMessage = "";
} else {
  const result = unlockSkin(skin.id, this.globalCoins);
  if (result.success) {
    this.globalCoins = result.newCoins;
    this.selectedSkin = skin.id;
    saveSelectedSkin(skin.id);
    localStorage.setItem("globalCoins", this.globalCoins);

    // 👇 actualizar animaciones del player
    player.animations = skin.animations;
    player.setAnimation("idle");

    this.shopMessage = "";
  } else {
    if (result.message === "Monedas insuficientes :(") {
      this.shopMessage = result.message;
    } else {
      this.shopMessage = "";
    }
  }
}
},
};

loadUnlockedSkins();

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

  // Título con sombra
  ctx.fillStyle = "#fff";
  ctx.font = "bold 40px system-ui";
  ctx.textAlign = "center";
  ctx.shadowColor = "black";
  ctx.shadowBlur = 4;
  ctx.shadowOffsetX = 2;
  ctx.shadowOffsetY = 2;
  ctx.fillText("Crab Jump", canvas.width / 2, 150);

  // 👇 Animación del personaje en salto (usando skin seleccionado)
  const skin = cosmetics[game.selectedSkin];
  if (skin) {
    const anim = skin.animations.jump;
    anim.update(1 / 60); // Delta fijo para menú
    anim.draw(ctx, canvas.width / 2 - 32, 200, 64, 64);
  }

  // 👇 Mostrar récord y monedas
  ctx.font = "20px system-ui";
  ctx.fillStyle = "#fff";
  ctx.shadowColor = "black";
  ctx.shadowBlur = 3;
  ctx.shadowOffsetX = 2;
  ctx.shadowOffsetY = 2;
  ctx.fillText(`Récord: ${game.maxDistance} m`, canvas.width / 2, 280);
  ctx.fillText(`Monedas totales: ${game.globalCoins}`, canvas.width / 2, 310);

  // Botones de inicio y tienda
  ctx.shadowColor = "black";
  ctx.shadowBlur = 3;
  ctx.shadowOffsetX = 2;
  ctx.shadowOffsetY = 2;
  ctx.font = "bold 24px system-ui";
  ctx.fillText("Presiona Space para iniciar", canvas.width / 2, 340);
  ctx.fillText("Presiona T para abrir la tienda", canvas.width / 2, 390);

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

  // 👇 Animación del personaje derrotado (usando skin seleccionado)
  const skin = cosmetics[game.selectedSkin];
  if (skin) {
    const anim = skin.animations.dead;
    anim.update(1 / 60); // Delta fijo para pantalla estática
    anim.draw(ctx, canvas.width / 2 - 32, canvas.height / 2 - 32, 64, 64);
  }

  // ====== Instrucciones con sombra ======
  ctx.font = "20px system-ui";
  ctx.fillText(`Avanzaste ${game.distance} m`, canvas.width / 2, canvas.height / 2 + 40);
  ctx.fillText(`Récord: ${game.maxDistance} m`, canvas.width / 2, canvas.height / 2 + 70);
  ctx.fillText("Presiona R para reintentar", canvas.width / 2, canvas.height / 2 + 110);

  // Resetear sombra
  ctx.shadowColor = "transparent";
  ctx.shadowBlur = 0;
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = 0;
}


function drawShop(ctx) {
  const skins = getCosmeticsSorted();
  const skin = skins[game.currentSkinIndex];

  // Fondo
  ctx.drawImage(menuBackground, 0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Título y monedas
  ctx.fillStyle = "#fff";
  ctx.font = "bold 32px system-ui";
  ctx.textAlign = "center";
  ctx.fillText("TIENDA", canvas.width / 2, 50);
  ctx.font = "20px system-ui";
  ctx.fillText(`💰 ${game.globalCoins} monedas`, canvas.width / 2, 80);

  // Skin actual (animación idle)
  const anim = skin.animations.idle;
  anim.update(1 / 60);
  anim.draw(ctx, canvas.width / 2 - 48, 140, 96, 96);

  // Nombre y rareza
  ctx.fillStyle = rarityColors[skin.rarity];
  ctx.font = "bold 22px system-ui";
  ctx.fillText(skin.name, canvas.width / 2, 270);

  // Estado
  ctx.font = "18px system-ui";
  if (skin.unlocked) {
    ctx.fillStyle = "#4CAF50";
    ctx.fillText(
      game.selectedSkin === skin.id ? "✓ EQUIPADO" : "DESBLOQUEADO",
      canvas.width / 2,
      300
    );
  } else {
    ctx.fillStyle = "#FFD700";
    ctx.fillText(`${skin.price} 💰`, canvas.width / 2, 300);
  }

  // Botones
  const canAfford = game.globalCoins >= skin.price;
  const centerX = canvas.width / 2;

  if (skin.unlocked && game.selectedSkin !== skin.id) {
    ctx.fillStyle = "rgba(76,175,80,0.7)";
    ctx.fillRect(centerX - 60, 330, 120, 40);
    ctx.fillStyle = "#fff";
    ctx.font = "bold 16px system-ui";
    ctx.fillText("EQUIPAR", centerX, 357);
  } else if (!skin.unlocked) {
    ctx.fillStyle = canAfford ? "rgba(255,193,7,0.7)" : "rgba(100,100,100,0.7)";
    ctx.fillRect(centerX - 80, 330, 160, 40);
    ctx.fillStyle = "#fff";
    ctx.font = "bold 16px system-ui";
    ctx.fillText("C PARA COMPRAR", centerX, 357);
  }

  // Flechas del carrusel
  ctx.font = "bold 40px system-ui";
  ctx.fillStyle = "#fff";
  ctx.fillText("‹", 80, canvas.height / 2);
  ctx.fillText("›", canvas.width - 80, canvas.height / 2);

  // Botón volver
  ctx.fillStyle = "rgba(244,67,54,0.7)";
  ctx.fillRect(centerX - 60, canvas.height - 60, 120, 40);
  ctx.fillStyle = "#fff";
  ctx.font = "bold 16px system-ui";
  ctx.fillText("B para regresar", centerX, canvas.height - 35);

  // 👇 Mensaje de feedback de la tienda
  if (game.shopMessage) {
    ctx.fillStyle = "#ff4444"; // rojo para errores
    ctx.font = "bold 18px system-ui";
    ctx.textAlign = "center";
    ctx.fillText(game.shopMessage, centerX, canvas.height - 100);
  }

  // === ÁREAS TÁCTILES PARA MOBILE ===
  game.shopButtons = {
    left: { x: 80 - 20, y: canvas.height / 2 - 20, w: 40, h: 40 },
    right: { x: canvas.width - 80 - 20, y: canvas.height / 2 - 20, w: 40, h: 40 },
    back: { x: centerX - 60, y: canvas.height - 60, w: 120, h: 40 },
    buy: { x: centerX - 80, y: 330, w: 160, h: 40 },
    equip: { x: centerX - 60, y: 330, w: 120, h: 40 },
    currentUnlocked: !!skin.unlocked
  };
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
    drawMenu(ctx);
  } else if (game.state === "playing") {
    update(deltaTime);
    draw();
  } else if (game.state === "gameover") {
    drawGameOver(ctx);
  } else if (game.state === "shop") { 
    drawShop(ctx);
  }

requestAnimationFrame(loop);
}

 bg.onload = () => requestAnimationFrame(loop);
});


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

