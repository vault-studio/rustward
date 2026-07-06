// ⚠️ Agnóstico de plataforma — se copia tal cual a Android.
import { bossHP, enemyHP, isBossScreen } from './formulas';

export type EnemyKind = 'scavenger' | 'drone' | 'boss';

export interface SpawnedEnemy {
  kind: EnemyKind;
  maxHP: number;
  isBoss: boolean;
}

export function spawnForScreen(screen: number): SpawnedEnemy {
  if (isBossScreen(screen)) {
    return { kind: 'boss', maxHP: bossHP(screen), isBoss: true };
  }
  return {
    kind: screen % 2 === 0 ? 'drone' : 'scavenger',
    maxHP: enemyHP(screen),
    isBoss: false,
  };
}
