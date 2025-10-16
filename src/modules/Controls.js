// =================== CONTROLS =================
export default class Controls {
  constructor(game) {
    this.keys = { left: false, right: false, up: false };
    this.game = game;
    this.currentSkinIndex = 0; // índice del carrusel

    // ===== CONTROLES DE TECLADO =====
    window.addEventListener("keydown", (e) => {


  if (this.game.state === "shop") {
    // --- Controles dentro de la tienda ---
    const skins = this.game.getSkins();

    if (e.code === "ArrowRight" || e.code === "KeyD") {
      this.currentSkinIndex = (this.currentSkinIndex + 1) % skins.length;
       this.game.shopMessage = "";
    }
    if (e.code === "ArrowLeft" || e.code === "KeyA") {
      this.currentSkinIndex = (this.currentSkinIndex - 1 + skins.length) % skins.length;
       this.game.shopMessage = "";
    }

    // Comprar o equipar con C
    if (e.code === "KeyC") {
      this.game.attemptPurchaseOrEquip();
    }

    this.game.currentSkinIndex = this.currentSkinIndex;

  } else {
    // --- Controles normales de juego ---
    if (e.code === "ArrowLeft" || e.code === "KeyA") this.keys.left = true;
    if (e.code === "ArrowRight" || e.code === "KeyD") this.keys.right = true;
    if (e.code === "Space" || e.code === "ArrowUp" || e.code === "KeyW") this.keys.up = true;
  }

  // Acciones generales (independientes del estado)
if (e.key === "Escape") this.game.togglePause();

// 👇 Solo permitir SPACE si estás en el menú, no en la tienda
if (e.code === "Space" && !this.game.started && this.game.state === "menu") {
  this.game.start();
}

if (e.key.toLowerCase() === "r" && this.game.gameOver) this.game.start();
if (e.key.toLowerCase() === "t" && this.game.state === "menu") this.game.openShop();
if (e.key.toLowerCase() === "b" && this.game.state === "shop") this.game.closeShop();
});

    window.addEventListener("keyup", (e) => {
      if (this.game.state !== "shop") {
        if (e.code === "ArrowLeft" || e.code === "KeyA") this.keys.left = false;
        if (e.code === "ArrowRight" || e.code === "KeyD") this.keys.right = false;
      }
      if (e.code === "Space" || e.code === "ArrowUp" || e.code === "KeyW") this.keys.up = false;
    });

    // ===== CONTROLES TÁCTILES =====
    this.setupMobileControls();
  }

  // <-- Nuevo método para cambiar skins -->
  navigateShop(delta) {
    const skins = this.game.getSkins();
    if (!skins || skins.length === 0) return;
    this.currentSkinIndex = (this.currentSkinIndex + delta + skins.length) % skins.length;
    this.game.currentSkinIndex = this.currentSkinIndex;
  }

  setupMobileControls() {
    const leftBtn = document.getElementById('leftBtn');
    const rightBtn = document.getElementById('rightBtn');
    const startBtn = document.getElementById('startBtn');
    const restartBtn = document.getElementById('restartBtn');
    const pauseBtn = document.getElementById('pauseBtn');
    
    if (!leftBtn || !rightBtn || !startBtn || !restartBtn || !pauseBtn) return;

    // Botones movimiento / navegación en tienda
    const pressLeft = () => {
      if (this.game.state === 'shop') this.navigateShop(-1);
      else this.keys.left = true;
    };
    const releaseLeft = () => {
      if (this.game.state !== 'shop') this.keys.left = false;
    };
    const pressRight = () => {
      if (this.game.state === 'shop') this.navigateShop(1);
      else this.keys.right = true;
    };
    const releaseRight = () => {
      if (this.game.state !== 'shop') this.keys.right = false;
    };

    leftBtn.addEventListener('mousedown', pressLeft);
    leftBtn.addEventListener('mouseup', releaseLeft);
    rightBtn.addEventListener('mousedown', pressRight);
    rightBtn.addEventListener('mouseup', releaseRight);
    leftBtn.addEventListener('touchstart', (e) => { e.preventDefault(); pressLeft(); });
    leftBtn.addEventListener('touchend', (e) => { e.preventDefault(); releaseLeft(); });
    rightBtn.addEventListener('touchstart', (e) => { e.preventDefault(); pressRight(); });
    rightBtn.addEventListener('touchend', (e) => { e.preventDefault(); releaseRight(); });

    // Botones start/restart/pause
    startBtn.addEventListener('click', () => { if (!this.game.started) this.game.start(); });
    startBtn.addEventListener('touchstart', (e) => { e.preventDefault(); if (!this.game.started) this.game.start(); });
    restartBtn.addEventListener('click', () => { if (this.game.gameOver) this.game.start(); });
    restartBtn.addEventListener('touchstart', (e) => { e.preventDefault(); if (this.game.gameOver) this.game.start(); });
    pauseBtn.addEventListener('click', () => this.game.togglePause());
    pauseBtn.addEventListener('touchstart', (e) => { e.preventDefault(); this.game.togglePause(); });

    // Actualización de UI
    setInterval(() => {
      if (!this.game.started && !this.game.gameOver) {
        startBtn.style.display = 'flex';
        restartBtn.style.display = 'none';
        pauseBtn.style.display = 'none';
      } else if (this.game.gameOver) {
        startBtn.style.display = 'none';
        restartBtn.style.display = 'flex';
        pauseBtn.style.display = 'none';
      } else {
        startBtn.style.display = 'none';
        restartBtn.style.display = 'none';
        pauseBtn.style.display = 'flex';
      }
      pauseBtn.textContent = this.game.paused ? '▶' : '||';
    }, 100);

    // Prevenir menú contextual
    [leftBtn, rightBtn, startBtn, restartBtn, pauseBtn].forEach(btn => {
      btn.addEventListener('contextmenu', (e) => e.preventDefault());
    });
  }
}
