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

      // Solo permitir SPACE si estás en el menú, no en la tienda
      if (e.code === "Space" && !this.game.started && this.game.state === "menu") {
        this.game.start();
      }

      if (e.key.toLowerCase() === "r" && this.game.gameOver) this.game.start();
      if (e.key.toLowerCase() === "t" && (this.game.state === "menu" || this.game.state === "gameover")) {
  this.game.openShop();
}
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

  // Método para navegar en la tienda
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

    // Botones tienda (nuevos)
    const shopOpenBtn = document.getElementById('shopOpenBtn'); // En contenedor de start
    const shopBuyBtn  = document.getElementById('shopBuyBtn');  // En contenedor de start
    const shopBackBtn = document.getElementById('shopBackBtn'); // En contenedor de pausa

    if (!leftBtn || !rightBtn || !startBtn || !restartBtn || !pauseBtn) return;

    // === Movimiento normal / navegación en tienda ===
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

    // Eventos de movimiento
    leftBtn.addEventListener('mousedown', pressLeft);
    leftBtn.addEventListener('mouseup', releaseLeft);
    rightBtn.addEventListener('mousedown', pressRight);
    rightBtn.addEventListener('mouseup', releaseRight);
    leftBtn.addEventListener('touchstart', (e) => { e.preventDefault(); pressLeft(); });
    leftBtn.addEventListener('touchend',   (e) => { e.preventDefault(); releaseLeft(); });
    rightBtn.addEventListener('touchstart',(e) => { e.preventDefault(); pressRight(); });
    rightBtn.addEventListener('touchend',  (e) => { e.preventDefault(); releaseRight(); });

    // === Shop: abrir / comprar / regresar ===
    if (shopOpenBtn) {
  shopOpenBtn.addEventListener('click', () => { 
    if (this.game.state === 'menu' || this.game.state === 'gameover') {
      this.game.openShop();
    }
  });
  shopOpenBtn.addEventListener('touchstart', (e) => { 
    e.preventDefault(); 
    if (this.game.state === 'menu' || this.game.state === 'gameover') {
      this.game.openShop();
    }
  });
}

    if (shopBuyBtn) {
      shopBuyBtn.addEventListener('click', () => { if (this.game.state === 'shop') this.game.attemptPurchaseOrEquip(); });
      shopBuyBtn.addEventListener('touchstart', (e) => { e.preventDefault(); if (this.game.state === 'shop') this.game.attemptPurchaseOrEquip(); });
    }

    if (shopBackBtn) {
      shopBackBtn.addEventListener('click', () => { if (this.game.state === 'shop') this.game.closeShop(); });
      shopBackBtn.addEventListener('touchstart', (e) => { e.preventDefault(); if (this.game.state === 'shop') this.game.closeShop(); });
    }

    // === Start / Restart / Pause ===
    startBtn.addEventListener('click', () => { if (!this.game.started) this.game.start(); });
    startBtn.addEventListener('touchstart', (e) => { e.preventDefault(); if (!this.game.started) this.game.start(); });
    restartBtn.addEventListener('click', () => { if (this.game.gameOver) this.game.start(); });
    restartBtn.addEventListener('touchstart', (e) => { e.preventDefault(); if (this.game.gameOver) this.game.start(); });
    pauseBtn.addEventListener('click', () => this.game.togglePause());
    pauseBtn.addEventListener('touchstart', (e) => { e.preventDefault(); this.game.togglePause(); });

    // === Actualización de UI (visibilidad por estado) ===
    setInterval(() => {
  const inMenu = (this.game.state === 'menu' && !this.game.started && !this.game.gameOver);
  const inShop = (this.game.state === 'shop');
  const inGame = (this.game.state === 'playing');
  const inOver = (this.game.state === 'gameover');

  // Base
  startBtn.style.display   = inMenu ? 'flex' : 'none';
  restartBtn.style.display = inOver ? 'flex' : 'none';
  pauseBtn.style.display   = inGame ? 'flex' : 'none';

  // Tienda
  if (shopOpenBtn) shopOpenBtn.style.display = (inMenu || inOver) ? 'flex' : 'none'; // 👈 ahora también en game over
  if (shopBuyBtn)  shopBuyBtn.style.display  = inShop ? 'flex' : 'none';
  if (shopBackBtn) shopBackBtn.style.display = inShop ? 'flex' : 'none';

  if (inGame) pauseBtn.textContent = this.game.paused ? '▶' : '||';
}, 100);

    // Prevenir menú contextual
    [leftBtn, rightBtn, startBtn, restartBtn, pauseBtn, shopOpenBtn, shopBuyBtn, shopBackBtn]
      .forEach(btn => { if (btn) btn.addEventListener('contextmenu', (e) => e.preventDefault()); });
  }
}
