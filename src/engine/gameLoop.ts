// Motor del loop idle. Estado "vivo" fuera de React; la UI recibe snapshots
// commiteados con throttle. ⚠️ Agnóstico de plataforma (rAF existe en RN).
import { useEffect, useLayoutEffect } from 'react';
import { BALANCE as B, UPGRADE_IDS, type UpgradeId } from '../config/balance';
import {
  emeraldsPerBoss,
  enemyDmg,
  goldPerKill,
  maxAffordable,
  playerStats,
  upgradeCost,
  NO_META,
  type MetaBonuses,
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
  revivedThisRun: boolean;
}

export interface OfflineSummary {
  elapsedMs: number;
  simulatedMs: number;
  goldGained: number;
  screensGained: number;
  emeraldsGained: number;
  died: boolean;
}

export interface EngineHooks {
  onEmeralds: (amount: number) => void;
  onScreenReached: (screen: number) => void;
}

export interface Engine {
  tick(dtMs: number): void;
  tap(): boolean;
  buyUpgrade(id: UpgradeId, count?: number): boolean;
  buyMax(id: UpgradeId): boolean;
  revive(): boolean;
  reset(): void;
  setMeta(meta: MetaBonuses): void;
  snapshot(): Snapshot;
  drainEvents(): DamageEvent[];
  serialize(): string;
  restore(json: string): boolean;
  fastForward(elapsedMs: number): OfflineSummary;
}

const SAVE_VERSION = 1;

const zeroLevels = (): Record<UpgradeId, number> =>
  UPGRADE_IDS.reduce(
    (acc, id) => ({ ...acc, [id]: 0 }),
    {} as Record<UpgradeId, number>,
  );

export function createEngine(hooks: EngineHooks): Engine {
  let eventId = 0;
  let events: DamageEvent[] = [];
  let meta: MetaBonuses = NO_META;

  let screen = 1;
  let gold = 0;
  let goldEarned = 0;
  let emeraldsRun = 0;
  let kills = 0;
  let levels = zeroLevels();
  let stats = playerStats(levels, meta);
  let playerHP = stats.maxHP;
  let foe: SpawnedEnemy = spawnForScreen(screen);
  let foeHP = foe.maxHP;
  let status: RunStatus = 'playing';
  let runTimeMs = 0;
  let attackTimer = 0;
  let enemyTimer = 0;
  let advanceTimer = 0;
  let lastTapAt = -Infinity;
  let revivedThisRun = false;

  function pushEvent(
    target: 'enemy' | 'player',
    amount: number,
    kind: DamageKind,
  ): void {
    events.push({ id: ++eventId, target, amount, kind });
    if (events.length > 40) events.shift();
  }

  function refreshStats(): void {
    const prevMaxHP = stats.maxHP;
    stats = playerStats(levels, meta);
    if (stats.maxHP > prevMaxHP) playerHP += stats.maxHP - prevMaxHP;
    playerHP = Math.min(playerHP, stats.maxHP);
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

  function hitFoe(damage: number, kind: DamageKind): void {
    foeHP -= damage;
    pushEvent('enemy', damage, kind);
    if (foeHP <= 0) onFoeKilled();
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
      hitFoe(damage, hit.isExec ? 'exec' : hit.isCrit ? 'crit' : 'normal');
      if (advanceTimer > 0) return; // el golpe mató: avanzando
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

  // Toque manual: daño reducido, con rate-limit. Complementa el idle.
  function tap(): boolean {
    if (status !== 'playing' || advanceTimer > 0 || foeHP <= 0) return false;
    const now = runTimeMs;
    if (now - lastTapAt < B.TAP_MIN_INTERVAL_MS) return false;
    lastTapAt = now;
    const hit = rollPlayerHit(stats, foe.isBoss);
    const base = hit.isExec ? foeHP : Math.min(hit.amount * B.TAP_DMG_PCT, foeHP);
    hitFoe(base, hit.isExec ? 'exec' : hit.isCrit ? 'crit' : 'normal');
    return true;
  }

  function buyUpgrade(id: UpgradeId, count = 1): boolean {
    if (status !== 'playing' || count < 1) return false;
    let bought = 0;
    while (bought < count) {
      const cost = upgradeCost(id, levels[id]);
      if (gold < cost) break;
      gold -= cost;
      levels[id] += 1;
      bought += 1;
    }
    if (bought === 0) return false;
    refreshStats();
    return true;
  }

  function buyMax(id: UpgradeId): boolean {
    const count = maxAffordable(id, levels[id], gold);
    return count > 0 ? buyUpgrade(id, count) : false;
  }

  function revive(): boolean {
    if (status !== 'dead' || revivedThisRun) return false;
    revivedThisRun = true;
    status = 'playing';
    playerHP = stats.maxHP;
    attackTimer = 0;
    enemyTimer = 0;
    return true;
  }

  function reset(): void {
    events = [];
    screen = 1 + meta.startScreen;
    gold = meta.startGold;
    goldEarned = 0;
    emeraldsRun = 0;
    kills = 0;
    levels = zeroLevels();
    stats = playerStats(levels, meta);
    playerHP = stats.maxHP;
    foe = spawnForScreen(screen);
    foeHP = foe.maxHP;
    status = 'playing';
    runTimeMs = 0;
    attackTimer = 0;
    enemyTimer = 0;
    advanceTimer = 0;
    lastTapAt = -Infinity;
    revivedThisRun = false;
  }

  function setMeta(next: MetaBonuses): void {
    meta = next;
    refreshStats();
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
      revivedThisRun,
    };
  }

  function drainEvents(): DamageEvent[] {
    const drained = events;
    events = [];
    return drained;
  }

  // === PERSISTENCIA DE LA RUN (sobrevive a recargar/cerrar el navegador) ===
  function serialize(): string {
    return JSON.stringify({
      v: SAVE_VERSION,
      savedAt: Date.now(),
      s: {
        screen,
        gold,
        goldEarned,
        emeraldsRun,
        kills,
        levels,
        playerHP,
        foe,
        foeHP,
        status,
        runTimeMs,
        attackTimer,
        enemyTimer,
        advanceTimer,
        revivedThisRun,
      },
    });
  }

  function restore(json: string): boolean {
    try {
      const data = JSON.parse(json);
      if (data?.v !== SAVE_VERSION || !data.s) return false;
      const s = data.s;
      const nums = [s.screen, s.gold, s.goldEarned, s.playerHP, s.foeHP, s.runTimeMs];
      if (!nums.every((n: unknown) => typeof n === 'number' && Number.isFinite(n)))
        return false;
      if (!UPGRADE_IDS.every((id) => typeof s.levels?.[id] === 'number')) return false;

      screen = Math.max(1, Math.floor(s.screen));
      gold = Math.max(0, s.gold);
      goldEarned = Math.max(0, s.goldEarned);
      emeraldsRun = Math.max(0, s.emeraldsRun ?? 0);
      kills = Math.max(0, s.kills ?? 0);
      levels = { ...zeroLevels(), ...s.levels };
      stats = playerStats(levels, meta);
      foe = s.foe?.kind ? s.foe : spawnForScreen(screen);
      foeHP = Math.min(Math.max(0, s.foeHP), foe.maxHP);
      playerHP = Math.min(Math.max(0, s.playerHP), stats.maxHP);
      status = s.status === 'dead' ? 'dead' : 'playing';
      runTimeMs = s.runTimeMs;
      attackTimer = s.attackTimer ?? 0;
      enemyTimer = s.enemyTimer ?? 0;
      advanceTimer = s.advanceTimer ?? 0;
      revivedThisRun = !!s.revivedThisRun;
      if (status === 'playing' && foeHP <= 0 && advanceTimer <= 0) {
        foe = spawnForScreen(screen);
        foeHP = foe.maxHP;
      }
      return true;
    } catch {
      return false;
    }
  }

  // Simula el tiempo transcurrido con el motor real (sin compras): el
  // progreso offline es honesto — y sí, la run puede morir mientras no estás.
  function fastForward(elapsedMs: number): OfflineSummary {
    const simulatedMs = Math.min(Math.max(0, elapsedMs), B.OFFLINE_CAP_MS);
    const goldBefore = goldEarned;
    const screenBefore = screen;
    const emeraldsBefore = emeraldsRun;
    const wasAlive = status === 'playing';

    let remaining = simulatedMs;
    while (remaining > 0 && status === 'playing') {
      const step = Math.min(remaining, 100);
      tick(step);
      remaining -= step;
    }
    events = []; // sin lluvia de números de daño al volver

    return {
      elapsedMs,
      simulatedMs: simulatedMs - remaining,
      goldGained: goldEarned - goldBefore,
      screensGained: screen - screenBefore,
      emeraldsGained: emeraldsRun - emeraldsBefore,
      died: wasAlive && status === 'dead',
    };
  }

  return {
    tick,
    tap,
    buyUpgrade,
    buyMax,
    revive,
    reset,
    setMeta,
    snapshot,
    drainEvents,
    serialize,
    restore,
    fastForward,
  };
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
