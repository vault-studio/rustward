// ⚠️ Archivo agnóstico de plataforma — copiar LITERAL al proyecto Android.
// Todas las constantes de balance del juego viven aquí. Nada de números mágicos fuera.

export const BALANCE = {
  // === ENEMIGOS ===
  // NOTA balance: los valores del doc v1 (HP_GROWTH 1.18, DMG_GROWTH 1.12,
  // BOSS_HP_MULT 12, HEAL 0.08) hacían el primer boss imposible: simulación
  // headless de 4.311 runs con compra codiciosa → 0 bosses muertos. Con estos
  // valores (barrido simulado): boss 1 cae en la run 1, cada run mata los
  // bosses de las pantallas 10 y 20, y el muro queda en el boss de la 30
  // hasta que la meta-progresión lo empuja más allá.
  ENEMY_BASE_HP: 12,
  ENEMY_HP_GROWTH: 1.14, // exponencial por pantalla
  ENEMY_DMG_BASE: 3,
  ENEMY_DMG_GROWTH: 1.06,
  ENEMY_INTERVAL_MS: 1200,
  ENEMIES_PER_SCREEN: 1,

  // === MUNDO / FASE / PANTALLA ===
  // 5 fases por mundo, una por cada zona de boss dibujada en su mapa (ver
  // config/worlds.ts) — cada fase = BOSS_EVERY pantallas.
  PHASES_PER_WORLD: 5,

  // === ESCALADO POR MUNDO ===
  // La curva ENEMY_HP_GROWTH/ENEMY_DMG_GROWTH se REINICIA en cada mundo
  // (pantalla local 1..50, no la pantalla absoluta) — si no, con 5 mundos
  // de 50 pantallas el mundo 5 llegaría a la pantalla 250 y 1.14^250 son
  // billones de HP, imposibles de compensar con ningún multiplicador.
  // Estos arrays (índice 0 = Mundo 1) son lo ÚNICO que escala la dificultad
  // ENTRE mundos; los mundos más allá del array reutilizan el último valor.
  // Calibrados por simulación para que el boss final de cada mundo caiga
  // tras ~N compras acumuladas en la tienda de esmeraldas:
  // Mundo 1: 4-5, Mundo 2: 10-15, Mundo 3: 30-40, Mundo 4: 60+, Mundo 5: 100+.
  // Calibrado por simulación (ver scripts/verify-5worlds-balance.mjs):
  // boss final de cada mundo superable con ~5 / 10 / 30 / 60 / 100 compras
  // acumuladas en la tienda de esmeraldas (una hora de grindeo con
  // reintentos y meta ya comprada, empezando en cada mundo).
  WORLD_HP_MULT: [1, 0.33, 0.87, 2.26, 4.69],
  WORLD_DMG_MULT: [1, 0.58, 0.93, 1.5, 2.17],
  WORLD_GOLD_MULT: [1, 0.33, 0.87, 2.26, 4.69],

  // === BOSS ===
  BOSS_EVERY: 10, // pantalla múltiplo de N → boss (== pantallas por fase)
  // Bosses de fase: la mitad de vida que antes. El boss final de mundo (el
  // único que de verdad hace reiniciar la run) usa un multiplicador propio
  // sobre su enemyHP/enemyDmg local — calibrado por simulación (binary
  // search, ver scripts/verify-5worlds-balance.mjs) para que ~5 compras de
  // meta ya basten en el Mundo 1; WORLD_HP_MULT/DMG_MULT llevan el resto de
  // la escalada entre mundos.
  PHASE_BOSS_HP_MULT: 2,
  WORLD_BOSS_HP_MULT: 0.6,
  PHASE_BOSS_DMG_MULT: 1,
  WORLD_BOSS_DMG_MULT: 1.2,
  BOSS_REWARD_GOLD_MULT: 5,

  // === JUGADOR ===
  HP_BASE: 60,
  HP_PER_LEVEL: 8, // Defensa
  DR_PER_LEVEL: 0.4, // reducción plana de daño (Defensa)
  DR_MAX_PCT_OF_HIT: 0.8, // la DR nunca reduce más del 80% de un golpe
  ATK_BASE: 10, // antes 4 — el daño del personaje empieza en 10
  ATK_PER_LEVEL: 3, // Ataque
  ATK_INTERVAL_BASE: 1000, // ms
  ATK_INTERVAL_MIN: 150, // ms
  SPEED_PER_LEVEL: 0.06, // Velocidad
  CRIT_BASE: 0.03,
  CRIT_PER_LEVEL: 0.01, // Suerte
  CRIT_CAP: 0.75,
  CRIT_MULT: 2.0,
  EXEC_PER_LEVEL: 0.005, // Ejecución
  EXEC_CAP: 0.5,
  HEAL_PER_SCREEN_PCT: 0.12, // cura al limpiar pantalla normal

  // === COMBATE ACTIVO (tap sobre el idle) ===
  TAP_DMG_PCT: 0.5, // el toque manual hace este % de un golpe normal
  TAP_MIN_INTERVAL_MS: 120, // rate-limit del tapeo

  // === ECONOMÍA ===
  GOLD_BASE: 12, // antes 6 — doble de monedas
  GOLD_GROWTH_EXP: 0.92, // el oro crece MÁS LENTO que la vida enemiga
  GOLD_MULT_PER_LEVEL: 0.1, // mejora Oro

  EMERALD_BASE: 1, // por boss
  EMERALD_TIER_BONUS: 1, // +1 cada N bosses
  EMERALD_TIER_EVERY_BOSSES: 5,
  EMERALD_MULT_PER_LEVEL: 0.08, // mejora Esmeralda

  // === REVIVIR (sink de esmeraldas en la muerte) ===
  REVIVE_COST_EMERALDS: 12,

  // === OFFLINE (progreso mientras el juego está cerrado) ===
  OFFLINE_CAP_MS: 2 * 60 * 60 * 1000, // máximo 2 h simuladas
  OFFLINE_MIN_MS: 60 * 1000, // por debajo de 1 min no se muestra resumen

  // === PRESENTACIÓN DEL LOOP ===
  ADVANCE_SCROLL_MS: 600, // ráfaga de avance entre pantallas
} as const;

// === SKINS DEL PERSONAJE ===
// El aspecto evoluciona con la suma de niveles de las 7 mejoras de la run.
// Umbral de cada tier (índice = tier). 5 skins en total.
export const SKIN_TIER_THRESHOLDS = [0, 10, 100, 1000, 10000] as const;

export type UpgradeId =
  | 'attack'
  | 'defense'
  | 'speed'
  | 'luck'
  | 'gold'
  | 'emerald'
  | 'execution';

export const UPGRADE_IDS: UpgradeId[] = [
  'attack',
  'defense',
  'speed',
  'luck',
  'gold',
  'emerald',
  'execution',
];

export const BASE_COST: Record<UpgradeId, number> = {
  attack: 10,
  defense: 12,
  speed: 10,
  luck: 14,
  gold: 15,
  emerald: 25,
  execution: 30,
};

export const COST_GROWTH: Record<UpgradeId, number> = {
  attack: 1.15,
  defense: 1.16,
  speed: 1.15,
  luck: 1.17,
  gold: 1.18,
  emerald: 1.22,
  execution: 1.25,
};

// === META-PROGRESIÓN (mejoras permanentes compradas con esmeraldas) ===
export type MetaId =
  | 'mDamage'
  | 'mHealth'
  | 'mGold'
  | 'mStartGold'
  | 'mStartScreen';

export const META_IDS: MetaId[] = [
  'mDamage',
  'mHealth',
  'mGold',
  'mStartGold',
  'mStartScreen',
];

// maxLevel 0 = sin límite.
export const META_CONFIG: Record<
  MetaId,
  { baseCost: number; costGrowth: number; maxLevel: number }
> = {
  mDamage: { baseCost: 4, costGrowth: 1.35, maxLevel: 0 },
  mHealth: { baseCost: 4, costGrowth: 1.35, maxLevel: 0 },
  mGold: { baseCost: 6, costGrowth: 1.4, maxLevel: 0 },
  mStartGold: { baseCost: 3, costGrowth: 1.5, maxLevel: 0 },
  mStartScreen: { baseCost: 12, costGrowth: 1.9, maxLevel: 8 },
};

export const META_EFFECT = {
  DMG_PER_LEVEL: 0.1, // +10% daño por nivel
  HP_PER_LEVEL: 0.1, // +10% HP por nivel
  GOLD_PER_LEVEL: 0.1, // +10% oro por nivel
  START_GOLD_PER_LEVEL: 40, // oro inicial por nivel
  START_SCREEN_PER_LEVEL: 1, // pantalla inicial por nivel (cap: antes del boss 1)
} as const;
