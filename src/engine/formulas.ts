// ⚠️ Agnóstico de plataforma — se copia tal cual a Android.
import {
  BALANCE as B,
  BASE_COST,
  COST_GROWTH,
  META_CONFIG,
  META_EFFECT,
  SKIN_TIER_THRESHOLDS,
  UPGRADE_IDS,
  type MetaId,
  type UpgradeId,
} from '../config/balance';

// Pantalla dentro del mundo actual (1..pantallas por mundo) — la curva de
// dificultad se reinicia en cada mundo; solo WORLD_*_MULT escala la
// dificultad ENTRE mundos (ver nota en balance.ts).
function localScreenOf(screen: number): number {
  const screensPerWorld = B.BOSS_EVERY * B.PHASES_PER_WORLD;
  const m = screen % screensPerWorld;
  return m === 0 ? screensPerWorld : m;
}

function worldMultAt(screen: number, table: readonly number[]): number {
  const w = worldIndexOf(screen);
  return table[Math.min(w, table.length - 1)];
}

export function enemyHP(screen: number): number {
  const local = localScreenOf(screen);
  return (
    B.ENEMY_BASE_HP * Math.pow(B.ENEMY_HP_GROWTH, local - 1) * worldMultAt(screen, B.WORLD_HP_MULT)
  );
}

export function enemyDmg(screen: number): number {
  const local = localScreenOf(screen);
  return (
    B.ENEMY_DMG_BASE *
    Math.pow(B.ENEMY_DMG_GROWTH, local - 1) *
    worldMultAt(screen, B.WORLD_DMG_MULT)
  );
}

export function isBossScreen(screen: number): boolean {
  return screen % B.BOSS_EVERY === 0;
}

// El boss final de mundo es el de la última fase de cada mundo (screen
// múltiplo de BOSS_EVERY*PHASES_PER_WORLD) — el único que de verdad hace
// reiniciar la run; los demás bosses de fase son "checkpoints".
export function isWorldBossScreen(screen: number): boolean {
  return isBossScreen(screen) && screen % (B.BOSS_EVERY * B.PHASES_PER_WORLD) === 0;
}

export function bossHP(screen: number): number {
  const mult = isWorldBossScreen(screen) ? B.WORLD_BOSS_HP_MULT : B.PHASE_BOSS_HP_MULT;
  return enemyHP(screen) * mult;
}

export function bossDmgMult(screen: number): number {
  return isWorldBossScreen(screen) ? B.WORLD_BOSS_DMG_MULT : B.PHASE_BOSS_DMG_MULT;
}

// Primera pantalla de la fase (bloque de BOSS_EVERY pantallas) a la que
// pertenece `screen` — el checkpoint al que se vuelve tras morir contra un
// boss de fase (no el final de mundo).
export function phaseStartScreenOf(screen: number): number {
  return Math.floor((screen - 1) / B.BOSS_EVERY) * B.BOSS_EVERY + 1;
}

export function upgradeCost(id: UpgradeId, level: number): number {
  return Math.floor(BASE_COST[id] * Math.pow(COST_GROWTH[id], level));
}

// Coste total de comprar `count` niveles a partir de `level`.
export function bulkCost(id: UpgradeId, level: number, count: number): number {
  let total = 0;
  for (let i = 0; i < count; i++) total += upgradeCost(id, level + i);
  return total;
}

// Etiqueta mínima de lo que da CADA nivel de una mejora (independiente del
// nivel actual y del modo de compra) — se muestra como badge en su botón.
export function upgradeEffectLabel(id: UpgradeId): string {
  switch (id) {
    case 'attack':
      return `+${B.ATK_PER_LEVEL}`;
    case 'defense':
      return `+${B.HP_PER_LEVEL}`;
    case 'speed':
      return `+${Math.round(B.SPEED_PER_LEVEL * 100)}%`;
    case 'luck':
      return `+${Math.round(B.CRIT_PER_LEVEL * 100)}%`;
    case 'gold':
      return `+${Math.round(B.GOLD_MULT_PER_LEVEL * 100)}%`;
    case 'emerald':
      return `+${Math.round(B.EMERALD_MULT_PER_LEVEL * 100)}%`;
    case 'execution':
      return `+${(B.EXEC_PER_LEVEL * 100).toFixed(1)}%`;
  }
}

// Máximo de niveles comprables con `gold` a partir de `level`.
export function maxAffordable(id: UpgradeId, level: number, gold: number): number {
  let count = 0;
  let remaining = gold;
  while (count < 1000) {
    const cost = upgradeCost(id, level + count);
    if (cost > remaining) break;
    remaining -= cost;
    count += 1;
  }
  return count;
}

export function goldPerKill(screen: number, goldMult: number): number {
  const local = localScreenOf(screen);
  return Math.round(
    B.GOLD_BASE *
      Math.pow(B.ENEMY_HP_GROWTH, (local - 1) * B.GOLD_GROWTH_EXP) *
      worldMultAt(screen, B.WORLD_GOLD_MULT) *
      goldMult,
  );
}

// Esmeraldas al matar el boss de la pantalla `screen` (múltiplo de BOSS_EVERY).
export function emeraldsPerBoss(screen: number, emeraldMult: number): number {
  const bossIndex = Math.floor(screen / B.BOSS_EVERY); // 1º boss = 1
  const tier = Math.floor((bossIndex - 1) / B.EMERALD_TIER_EVERY_BOSSES);
  const base = B.EMERALD_BASE + tier * B.EMERALD_TIER_BONUS;
  return Math.max(1, Math.floor(base * emeraldMult));
}

// === MUNDO / FASE / PANTALLA ===
// La pantalla (screen) sigue siendo la unidad interna del motor — mundo y
// fase son puramente derivados para la presentación, sin estado propio.

// Índice de fase 1-based a través de TODOS los mundos.
export function phaseGlobal(screen: number): number {
  return Math.ceil(screen / B.BOSS_EVERY);
}

// Índice de mundo, 0-based.
export function worldIndexOf(screen: number): number {
  return Math.floor((phaseGlobal(screen) - 1) / B.PHASES_PER_WORLD);
}

// Fase dentro del mundo, 1..PHASES_PER_WORLD.
export function phaseInWorldOf(screen: number): number {
  return ((phaseGlobal(screen) - 1) % B.PHASES_PER_WORLD) + 1;
}

// Pantalla dentro de la fase actual, 1..BOSS_EVERY (la pantalla del boss
// cuenta como BOSS_EVERY, no como 0).
export function screenInPhaseOf(screen: number): number {
  const m = screen % B.BOSS_EVERY;
  return m === 0 ? B.BOSS_EVERY : m;
}

// Rango [inicio, fin] de pantallas globales que cubre la fase
// `phaseInWorld1based` (1..PHASES_PER_WORLD) del mundo `worldIdx` (0-based).
export function phaseScreenRange(
  worldIdx: number,
  phaseInWorld1based: number,
): [number, number] {
  const globalPhase = worldIdx * B.PHASES_PER_WORLD + phaseInWorld1based;
  const last = globalPhase * B.BOSS_EVERY;
  return [last - B.BOSS_EVERY + 1, last];
}

// === META-PROGRESIÓN ===
export interface MetaBonuses {
  dmgMult: number;
  hpMult: number;
  goldMult: number;
  startGold: number;
  startScreen: number; // pantalla inicial = 1 + startScreen
}

export const NO_META: MetaBonuses = {
  dmgMult: 1,
  hpMult: 1,
  goldMult: 1,
  startGold: 0,
  startScreen: 0,
};

export function metaBonuses(levels: Record<MetaId, number>): MetaBonuses {
  return {
    dmgMult: 1 + META_EFFECT.DMG_PER_LEVEL * levels.mDamage,
    hpMult: 1 + META_EFFECT.HP_PER_LEVEL * levels.mHealth,
    goldMult: 1 + META_EFFECT.GOLD_PER_LEVEL * levels.mGold,
    startGold: META_EFFECT.START_GOLD_PER_LEVEL * levels.mStartGold,
    startScreen: META_EFFECT.START_SCREEN_PER_LEVEL * levels.mStartScreen,
  };
}

export function metaCost(id: MetaId, level: number): number {
  const cfg = META_CONFIG[id];
  return Math.floor(cfg.baseCost * Math.pow(cfg.costGrowth, level));
}

export function metaIsMaxed(id: MetaId, level: number): boolean {
  const cfg = META_CONFIG[id];
  return cfg.maxLevel > 0 && level >= cfg.maxLevel;
}

// === SKINS ===
export function totalUpgradeLevels(levels: Record<UpgradeId, number>): number {
  return UPGRADE_IDS.reduce((sum, id) => sum + levels[id], 0);
}

// Tier de skin (0..4) según la suma de niveles de la run.
export function skinTier(levels: Record<UpgradeId, number>): number {
  const total = totalUpgradeLevels(levels);
  let tier = 0;
  for (let i = SKIN_TIER_THRESHOLDS.length - 1; i >= 0; i--) {
    if (total >= SKIN_TIER_THRESHOLDS[i]) {
      tier = i;
      break;
    }
  }
  return tier;
}

// === STATS DEL JUGADOR ===
export interface PlayerStats {
  damage: number;
  maxHP: number;
  flatDR: number;
  attackInterval: number;
  critChance: number;
  critMult: number;
  execChance: number;
  goldMult: number;
  emeraldMult: number;
}

export function playerStats(
  levels: Record<UpgradeId, number>,
  meta: MetaBonuses = NO_META,
): PlayerStats {
  return {
    damage: (B.ATK_BASE + B.ATK_PER_LEVEL * levels.attack) * meta.dmgMult,
    maxHP: Math.round((B.HP_BASE + B.HP_PER_LEVEL * levels.defense) * meta.hpMult),
    flatDR: B.DR_PER_LEVEL * levels.defense,
    attackInterval: Math.max(
      B.ATK_INTERVAL_MIN,
      B.ATK_INTERVAL_BASE / (1 + B.SPEED_PER_LEVEL * levels.speed),
    ),
    critChance: Math.min(B.CRIT_CAP, B.CRIT_BASE + B.CRIT_PER_LEVEL * levels.luck),
    critMult: B.CRIT_MULT,
    execChance: Math.min(B.EXEC_CAP, B.EXEC_PER_LEVEL * levels.execution),
    goldMult: (1 + B.GOLD_MULT_PER_LEVEL * levels.gold) * meta.goldMult,
    emeraldMult: 1 + B.EMERALD_MULT_PER_LEVEL * levels.emerald,
  };
}
