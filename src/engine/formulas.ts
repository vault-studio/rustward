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

export function enemyHP(screen: number): number {
  return B.ENEMY_BASE_HP * Math.pow(B.ENEMY_HP_GROWTH, screen - 1);
}

export function enemyDmg(screen: number): number {
  return B.ENEMY_DMG_BASE * Math.pow(B.ENEMY_DMG_GROWTH, screen - 1);
}

export function bossHP(screen: number): number {
  return enemyHP(screen) * B.BOSS_HP_MULT;
}

export function isBossScreen(screen: number): boolean {
  return screen % B.BOSS_EVERY === 0;
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
  return Math.round(
    B.GOLD_BASE *
      Math.pow(B.ENEMY_HP_GROWTH, (screen - 1) * B.GOLD_GROWTH_EXP) *
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
