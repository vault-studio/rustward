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

  // === BOSS ===
  BOSS_EVERY: 10, // pantalla múltiplo de N → boss
  BOSS_HP_MULT: 4, // sobre enemyHP de esa pantalla
  BOSS_DMG_MULT: 1, // MVP: el boss pega igual que un enemigo normal
  BOSS_REWARD_GOLD_MULT: 5,

  // === JUGADOR ===
  HP_BASE: 60,
  HP_PER_LEVEL: 8, // Defensa
  DR_PER_LEVEL: 0.4, // reducción plana de daño (Defensa)
  DR_MAX_PCT_OF_HIT: 0.8, // la DR nunca reduce más del 80% de un golpe
  ATK_BASE: 4,
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
  GOLD_BASE: 6,
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
