// Motor del loop idle. Estado "vivo" fuera de React; la UI recibe snapshots
// commiteados con throttle. ⚠️ Agnóstico de plataforma (rAF existe en RN).
import { useEffect, useLayoutEffect } from 'react';
import { BALANCE as B, UPGRADE_IDS, type UpgradeId } from '../config/balance';
import {
  emeraldsPerBoss,
  enemyDmg,
  goldPerKill,
  playerStats,
  upgradeCost,
  type PlayerStats,
} from './formulas';
import { mitigatedDamage, rollPlayerHit } from './combat';
import { spawnForScreen, type EnemyKind, type SpawnedEnemy } from './spawner';

export type RunStatus = 'playing' | 'dead';
export type DamageKind = 'normal' | 'crit' | 'exec';

export interface DamageEvent {
  id: number;
  target: 'enemy' | 'player';
  amount: number;
  kind: DamageKind;
}

export interface Snapshot {
  screen: number;
  gold: number;
  goldEarned: number;
  emeraldsRun: number;
  kills: number;
  levels: Record<UpgradeId, number>;
  stats: PlayerStats;
  playerHP: number;
  enemyHP: number;
  enemyMaxHP: number;
  enemyKind: EnemyKind;
  isBoss: boolean;
  status: RunStatus;
  runTimeMs: number;
  advancing: boolean;
}

export interface EngineHooks {
  onEmeralds: (amount: number) => void;
  onScreenReached: (screen: number) => void;
}

export interface Engine {
  tick(dtMs: number): void;
  buyUpgrade(id: UpgradeId): boolean;
  reset(): void;
  snapshot(): Snapshot;
  drainEvents(): DamageEvent[];
}

const zeroLevels = (): Record<UpgradeId, number> =>
  UPGRADE_IDS.reduce(
    (acc, id) => ({ ...acc, [id]: 0 }),
    {} as Record<UpgradeId, number>,
  );

export function createEngine(hooks: EngineHooks): Engine {
  let eventId = 0;
  let events: DamageEvent[] = [];

  let screen = 1;
  let gold = 0;
  let goldEarned = 0;
  let emeraldsRun = 0;
  let kills = 0;
  let levels = zeroLevels();
  let stats = playerStats(levels);
  let playerHP = stats.maxHP;
  let foe: SpawnedEnemy = spawnForScreen(screen);
  let foeHP = foe.maxHP;
  let status: RunStatus = 'playing';
  let runTimeMs = 0;
  let attackTimer = 0;
  let enemyTimer = 0;
  let advanceTimer = 0;

  function pushEvent(
    target: 'enemy' | 'player',
    amount: number,
    kind: DamageKind,
  ): void {
    events.push({ id: ++eventId, target, amount, kind });
    if (events.length > 40) events.shift();
  }

  function onFoeKilled(): void {
    kills += 1;
    const reward = Math.round(
      goldPerKill(screen, stats.goldMult) *
        (foe.isBoss ? B.BOSS_REWARD_GOLD_MULT : 1),
    );
    gold += reward;
    goldEarned += reward;

    if (foe.isBoss) {
      const emeralds = emeraldsPerBoss(screen, stats.emeraldMult);
      emeraldsRun += emeralds;
      hooks.onEmeralds(emeralds);
      playerHP = stats.maxHP; // matar boss → curación completa
    } else {
      playerHP = Math.min(
        stats.maxHP,
        playerHP + stats.maxHP * B.HEAL_PER_SCREEN_PCT,
      );
    }

    screen += 1;
    hooks.onScreenReached(screen);
    advanceTimer = B.ADVANCE_SCROLL_MS;
    attackTimer = 0;
    enemyTimer = 0;
  }

  function tick(dtMs: number): void {
    if (status !== 'playing') return;
    runTimeMs += dtMs;

    if (advanceTimer > 0) {
      advanceTimer -= dtMs;
      if (advanceTimer <= 0) {
        foe = spawnForScreen(screen);
        foeHP = foe.maxHP;
      }
      return;
    }

    attackTimer += dtMs;
    enemyTimer += dtMs;

    // Ataques del jugador acumulados en este frame.
    while (attackTimer >= stats.attackInterval && foeHP > 0) {
      attackTimer -= stats.attackInterval;
      const hit = rollPlayerHit(stats, foe.isBoss);
      const damage = hit.isExec ? foeHP : Math.min(hit.amount, foeHP);
      foeHP -= damage;
      pushEvent('enemy', damage, hit.isExec ? 'exec' : hit.isCrit ? 'crit' : 'normal');
      if (foeHP <= 0) {
        onFoeKilled();
        return;
      }
    }

    // Ataques del enemigo.
    while (enemyTimer >= B.ENEMY_INTERVAL_MS && foeHP > 0 && status === 'playing') {
      enemyTimer -= B.ENEMY_INTERVAL_MS;
      const raw = enemyDmg(screen) * (foe.isBoss ? B.BOSS_DMG_MULT : 1);
      const damage = mitigatedDamage(raw, stats.flatDR);
      playerHP -= damage;
      pushEvent('player', damage, 'normal');
      if (playerHP <= 0) {
        playerHP = 0;
        status = 'dead';
      }
    }
  }

  function buyUpgrade(id: UpgradeId): boolean {
    if (status !== 'playing') return false;
    const cost = upgradeCost(id, levels[id]);
    if (gold < cost) return false;
    gold -= cost;
    levels[id] += 1;
    const prevMaxHP = stats.maxHP;
    stats = playerStats(levels);
    if (stats.maxHP > prevMaxHP) playerHP += stats.maxHP - prevMaxHP;
    return true;
  }

  function reset(): void {
    events = [];
    screen = 1;
    gold = 0;
    goldEarned = 0;
    emeraldsRun = 0;
    kills = 0;
    levels = zeroLevels();
    stats = playerStats(levels);
    playerHP = stats.maxHP;
    foe = spawnForScreen(screen);
    foeHP = foe.maxHP;
    status = 'playing';
    runTimeMs = 0;
    attackTimer = 0;
    enemyTimer = 0;
    advanceTimer = 0;
  }

  function snapshot(): Snapshot {
    return {
      screen,
      gold,
      goldEarned,
      emeraldsRun,
      kills,
      levels: { ...levels },
      stats,
      playerHP,
      enemyHP: Math.max(0, foeHP),
      enemyMaxHP: foe.maxHP,
      enemyKind: foe.kind,
      isBoss: foe.isBoss,
      status,
      runTimeMs,
      advancing: advanceTimer > 0,
    };
  }

  function drainEvents(): DamageEvent[] {
    const drained = events;
    events = [];
    return drained;
  }

  return { tick, buyUpgrade, reset, snapshot, drainEvents };
}

// Hook rAF: tickea el motor cada frame y commitea a la UI con throttle.
export function useGameLoop(
  engine: Engine,
  commit: (snap: Snapshot, events: DamageEvent[]) => void,
  commitMs = 120,
): void {
  useLayoutEffect(() => {
    commit(engine.snapshot(), []);
  }, [engine, commit]);

  useEffect(() => {
    let raf = 0;
    let last = performance.now();
    let acc = 0;
    const loop = (t: number) => {
      const dt = Math.min(t - last, 250); // clamp: pestaña en background
      last = t;
      engine.tick(dt);
      acc += dt;
      if (acc >= commitMs) {
        acc = 0;
        commit(engine.snapshot(), engine.drainEvents());
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [engine, commit, commitMs]);
}
