# Crab Jump - Sistema Frame-Rate Independiente

https://nosoyunmarinero.github.io/Crab-Jump/

## Solución al Problema de Velocidad Variable

Este juego ahora implementa un **sistema de tiempo delta** que garantiza que el juego corra exactamente igual en todas las máquinas, sin importar sus capacidades de rendimiento.

### ¿Qué era el problema?
- En máquinas con alto FPS (120Hz, 144Hz), el juego corría demasiado rápido
- En máquinas con bajo FPS, el juego corría demasiado lento
- Las físicas y animaciones dependían del número de fotogramas por segundo

### ¿Cómo se resolvió?
1. **Sistema de Delta Time**: Se calcula el tiempo real entre cada frame
2. **Normalización**: Todos los movimientos se ajustan automáticamente a 60 FPS como base
3. **Físicas consistentes**: Gravedad, velocidades y animaciones usan tiempo real

### Valores restaurados (originales):
- Gravedad: 0.5 (como estaba originalmente)
- Velocidad del jugador: 6 (como estaba originalmente)
- Fuerza de salto: -10 (como estaba originalmente)

### Características del sistema:
- ✅ Juego corre igual en 30 FPS, 60 FPS, 144 FPS
- ✅ Físicas consistentes en todos los dispositivos
- ✅ Animaciones sincronizadas al tiempo real
- ✅ Spawn de obstáculos por tiempo, no por frames
- ✅ Información de FPS en pantalla (para depuración)

### Cómo funciona:
```javascript
// Multiplicador que normaliza todo a 60 FPS
const timeMultiplier = dt * 60;
// Aplicar a movimientos y físicas
player.x += velocity * timeMultiplier;
```

El juego ahora es completamente **frame-rate independiente** y proporcionará la misma experiencia de juego en cualquier dispositivo.# Crab-Jump
