// ⚠️ Agnóstico de plataforma — se copia tal cual a Android.
import {
  BALANCE as B,
  BASE_COST,
  COST_GROWTH,
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

export function playerStats(levels: Record<UpgradeId, number>): PlayerStats {
  return {
    damage: B.ATK_BASE + B.ATK_PER_LEVEL * levels.attack,
    maxHP: B.HP_BASE + B.HP_PER_LEVEL * levels.defense,
    flatDR: B.DR_PER_LEVEL * levels.defense,
    attackInterval: Math.max(
      B.ATK_INTERVAL_MIN,
      B.ATK_INTERVAL_BASE / (1 + B.SPEED_PER_LEVEL * levels.speed),
    ),
    critChance: Math.min(B.CRIT_CAP, B.CRIT_BASE + B.CRIT_PER_LEVEL * levels.luck),
    critMult: B.CRIT_MULT,
    execChance: Math.min(B.EXEC_CAP, B.EXEC_PER_LEVEL * levels.execution),
    goldMult: 1 + B.GOLD_MULT_PER_LEVEL * levels.gold,
    emeraldMult: 1 + B.EMERALD_MULT_PER_LEVEL * levels.emerald,
  };
}
