// ⚠️ Archivo agnóstico de plataforma — copiar LITERAL al proyecto Android.
// Todas las constantes de balance del juego viven aquí. Nada de números mágicos fuera.

export const BALANCE = {
  // === ENEMIGOS ===
  ENEMY_BASE_HP: 12,
  ENEMY_HP_GROWTH: 1.18, // exponencial por pantalla
  ENEMY_DMG_BASE: 3,
  ENEMY_DMG_GROWTH: 1.12,
  ENEMY_INTERVAL_MS: 1200,
  ENEMIES_PER_SCREEN: 1,

  // === BOSS ===
  BOSS_EVERY: 10, // pantalla múltiplo de N → boss
  BOSS_HP_MULT: 12, // sobre enemyHP de esa pantalla
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
  HEAL_PER_SCREEN_PCT: 0.08, // cura al limpiar pantalla normal

  // === ECONOMÍA ===
  GOLD_BASE: 6,
  GOLD_GROWTH_EXP: 0.92, // el oro crece MÁS LENTO que la vida enemiga
  GOLD_MULT_PER_LEVEL: 0.1, // mejora Oro

  EMERALD_BASE: 1, // por boss
  EMERALD_TIER_BONUS: 1, // +1 cada N bosses
  EMERALD_TIER_EVERY_BOSSES: 5,
  EMERALD_MULT_PER_LEVEL: 0.08, // mejora Esmeralda

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
