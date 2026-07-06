// ⚠️ Agnóstico de plataforma — se copia tal cual a Android.
import { BALANCE as B } from '../config/balance';
import type { PlayerStats } from './formulas';

export interface HitRoll {
  amount: number;
  isCrit: boolean;
  isExec: boolean;
}

// Golpe del jugador. La ejecución no aplica a bosses (MVP).
export function rollPlayerHit(
  stats: PlayerStats,
  targetIsBoss: boolean,
  rng: () => number = Math.random,
): HitRoll {
  if (!targetIsBoss && rng() < stats.execChance) {
    return { amount: Number.POSITIVE_INFINITY, isCrit: false, isExec: true };
  }
  const isCrit = rng() < stats.critChance;
  return {
    amount: stats.damage * (isCrit ? stats.critMult : 1),
    isCrit,
    isExec: false,
  };
}

// Daño que recibe el jugador tras aplicar la reducción plana de Defensa.
export function mitigatedDamage(rawDamage: number, flatDR: number): number {
  const reduced = rawDamage - Math.min(flatDR, rawDamage * B.DR_MAX_PCT_OF_HIT);
  return Math.max(1, reduced);
}
