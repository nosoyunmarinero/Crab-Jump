// =================== CONTROLS =================
// controls.js
export default class Controls {
  constructor(game) {
    this.keys = { left: false, right: false, up: false };
    this.game = game;

    // ===== CONTROLES DE TECLADO =====
    window.addEventListener("keydown", (e) => {
      if (e.code === "ArrowLeft" || e.code === "KeyA") this.keys.left = true;
      if (e.code === "ArrowRight" || e.code === "KeyD") this.keys.right = true;
      if (e.code === "Space" || e.code === "ArrowUp" || e.code === "KeyW") this.keys.up = true;
      
      // Acciones del juego con teclado
      if (e.key === "Escape") this.game.togglePause();
      if (e.code === "Space" && !this.game.started) this.game.start();
      if (e.key.toLowerCase() === "r" && this.game.gameOver) this.game.start();
    });

    window.addEventListener("keyup", (e) => {
      if (e.code === "ArrowLeft" || e.code === "KeyA") this.keys.left = false;
      if (e.code === "ArrowRight" || e.code === "KeyD") this.keys.right = false;
      if (e.code === "Space" || e.code === "ArrowUp" || e.code === "KeyW") this.keys.up = false;
    });

    // ===== CONTROLES TÁCTILES =====
    this.setupMobileControls();
  }

  setupMobileControls() {
    const leftBtn = document.getElementById('leftBtn');
    const rightBtn = document.getElementById('rightBtn');
    const startBtn = document.getElementById('startBtn');
    const restartBtn = document.getElementById('restartBtn');
    const pauseBtn = document.getElementById('pauseBtn');
    
    if (!leftBtn || !rightBtn || !startBtn || !restartBtn || !pauseBtn) return;
    
    // ===== BOTÓN IZQUIERDO =====
    leftBtn.addEventListener('touchstart', (e) => {
      e.preventDefault();
      this.keys.left = true;
    });
    
    leftBtn.addEventListener('touchend', (e) => {
      e.preventDefault();
      this.keys.left = false;
    });
    
    leftBtn.addEventListener('mousedown', (e) => {
      e.preventDefault();
      this.keys.left = true;
    });
    
    leftBtn.addEventListener('mouseup', (e) => {
      e.preventDefault();
      this.keys.left = false;
    });
    
    // ===== BOTÓN DERECHO =====
    rightBtn.addEventListener('touchstart', (e) => {
      e.preventDefault();
      this.keys.right = true;
    });
    
    rightBtn.addEventListener('touchend', (e) => {
      e.preventDefault();
      this.keys.right = false;
    });
    
    rightBtn.addEventListener('mousedown', (e) => {
      e.preventDefault();
      this.keys.right = true;
    });
    
    rightBtn.addEventListener('mouseup', (e) => {
      e.preventDefault();
      this.keys.right = false;
    });

    // ===== BOTÓN START =====
    const handleStart = (e) => {
      e.preventDefault();
      if (!this.game.started) {
        this.game.start();
      }
    };
    
    startBtn.addEventListener('touchstart', handleStart);
    startBtn.addEventListener('click', handleStart);

    // ===== BOTÓN RESTART =====
    const handleRestart = (e) => {
      e.preventDefault();
      if (this.game.gameOver) {
        this.game.start();
      }
    };
    
    restartBtn.addEventListener('touchstart', handleRestart);
    restartBtn.addEventListener('click', handleRestart);

    // ===== BOTÓN PAUSA =====
    const handlePause = (e) => {
      e.preventDefault();
      this.game.togglePause();
    };
    
    pauseBtn.addEventListener('touchstart', handlePause);
    pauseBtn.addEventListener('click', handlePause);

    // ===== ACTUALIZAR UI DE BOTONES =====
    setInterval(() => {
      if (!this.game.started && !this.game.gameOver) {
        // Mostrar START, ocultar RESTART y PAUSE
        startBtn.style.display = 'flex';
        restartBtn.style.display = 'none';
        pauseBtn.style.display = 'none';
      } else if (this.game.gameOver) {
        // Mostrar RESTART, ocultar START y PAUSE
        startBtn.style.display = 'none';
        restartBtn.style.display = 'flex';
        pauseBtn.style.display = 'none';
      } else if (this.game.started && !this.game.gameOver) {
        // Ocultar START y RESTART, mostrar PAUSE
        startBtn.style.display = 'none';
        restartBtn.style.display = 'none';
        pauseBtn.style.display = 'flex';
      }

      // Actualizar icono del botón PAUSE
      if (this.game.paused) {
        pauseBtn.textContent = '▶';
      } else {
        pauseBtn.textContent = '||';
      }
    }, 100);
    
    // Prevenir menú contextual
    [leftBtn, rightBtn, startBtn, restartBtn, pauseBtn].forEach(btn => {
      btn.addEventListener('contextmenu', (e) => e.preventDefault());
    });
  }
}