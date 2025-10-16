// ========== COSMETICS ==========

import { Animation, playerAnimations, zombieAnimations, sirAnimations, clownAnimations } from "./Animation.js";

// ====== Definición de skins ======
export const cosmetics = {
  // Skin por defecto (siempre desbloqueado)
  default: {
    id: "default",
    name: "Cangrejo Original",
    price: 0,
    rarity: "common",
    unlocked: true,
    animations: playerAnimations,
  },

  zm_crab: {
    id: "zm_crab",
    name: "Zombie Crab",
    price: 10,
    rarity: "common",
    unlocked: false,
    animations: zombieAnimations,
  },

  sir_crab: {
    id: "sir_crab",
    name: "Elegant Crab",
    price: 250,
    rarity: "rare",
    unlocked: false,
    animations: sirAnimations,
  },

  clown_crab: {
    id: "clown_crab",
    name: "Clown Crab",
    price: 500,
    rarity: "epic",
    unlocked: false,
    animations: clownAnimations,
  },
};

// ====== Colores por rareza ======
export const rarityColors = {
  common: "#ffffff",
  rare: "#4a9eff",
  epic: "#9d4edd",
  legendary: "#ffd700",
};

// ====== Helpers ======

// Ordenar skins por precio
export function getCosmeticsSorted() {
  return Object.values(cosmetics).sort((a, b) => a.price - b.price);
}

// Skin seleccionado
export function loadSelectedSkin() {
  const saved = localStorage.getItem("selectedSkin");
  return saved || "default";
}

export function saveSelectedSkin(skinId) {
  localStorage.setItem("selectedSkin", skinId);
}

// ====== Desbloqueo de skins ======
export function loadUnlockedSkins() {
  const saved = localStorage.getItem("unlockedSkins");
  if (saved) {
    const unlocked = JSON.parse(saved);
    Object.keys(cosmetics).forEach(key => {
      if (unlocked.includes(key)) {
        cosmetics[key].unlocked = true;
      }
    });
    return unlocked;
  }
  return ["default"];
}

export function saveUnlockedSkins() {
  const unlocked = Object.keys(cosmetics).filter(key => cosmetics[key].unlocked);
  localStorage.setItem("unlockedSkins", JSON.stringify(unlocked));
}

// ====== Función para comprar ======
export function unlockSkin(skinId, currentCoins) {
  const skin = cosmetics[skinId];
  if (!skin) return { success: false, message: "Skin no encontrado" };
  if (skin.unlocked) return { success: false, message: "Ya desbloqueado" };
  if (currentCoins < skin.price) return { success: false, message: "Monedas insuficientes :(" };

  skin.unlocked = true;
  saveUnlockedSkins();
  return { success: true, newCoins: currentCoins - skin.price };
}
