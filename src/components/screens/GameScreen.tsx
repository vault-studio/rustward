import { useCallback, useEffect, useRef, useState } from 'react';
import {
  createEngine,
  useGameLoop,
  type DamageEvent,
  type Engine,
  type OfflineSummary,
  type Snapshot,
} from '../../engine/gameLoop';
import { BALANCE as B, type UpgradeId } from '../../config/balance';
import { metaBonuses, skinTier } from '../../engine/formulas';
import { useRunStore } from '../../store/useRunStore';
import { useMetaStore } from '../../store/useMetaStore';
import { initAudio, setMuted, sfx } from '../../audio/sfx';
import { useT } from '../../i18n';
import Background from '../game/Background';
import Character from '../game/Character';
import Enemy from '../game/Enemy';
import DamageLayer from '../game/DamageNumber';
import Hud from '../game/Hud';
import UpgradeBar, { type BuyMode } from '../upgrades/UpgradeBar';
import DeathScreen from './DeathScreen';
import MetaShop from '../ui/MetaShop';
import OfflineModal from '../ui/OfflineModal';

const RUN_SAVE_KEY = 'rustward-run';

function playEventSfx(events: DamageEvent[]): void {
  // Con muchos eventos por commit basta con sonar los más relevantes.
  let playedHit = false;
  for (const ev of events) {
    if (ev.target === 'player') {
      sfx.playerHurt();
    } else if (ev.kind === 'exec') {
      sfx.exec();
    } else if (ev.kind === 'crit') {
      sfx.crit();
    } else if (!playedHit) {
      sfx.hit();
      playedHit = true;
    }
  }
}

export default function GameScreen() {
  const t = useT();
  const [shopOpen, setShopOpen] = useState(false);
  const [offline, setOffline] = useState<OfflineSummary | null>(null);
  const [buyMode, setBuyMode] = useState<BuyMode>(1);
  const [shaking, setShaking] = useState(false);
  const [charHit, setCharHit] = useState(false);
  const [tierUpFlash, setTierUpFlash] = useState(false);

  const prevStatus = useRef<string>('playing');
  const prevBoss = useRef(false);
  const shakeTimer = useRef(0);
  const charHitTimer = useRef(0);
  const prevTier = useRef(0);
  const tierUpTimer = useRef(0);

  const engineRef = useRef<Engine | null>(null);
  if (!engineRef.current) {
    const engine = createEngine({
      // getState() en vez de closures de hooks: evita referencias obsoletas.
      onEmeralds: (n) => {
        useMetaStore.getState().addEmeralds(n);
        sfx.emerald();
      },
      onScreenReached: (s) => useMetaStore.getState().reportScreen(s),
    });
    engine.setMeta(metaBonuses(useMetaStore.getState().metaLevels));

    // Restaurar la run guardada + progreso offline simulado con el motor real.
    try {
      const saved = localStorage.getItem(RUN_SAVE_KEY);
      if (saved) {
        const savedAt = JSON.parse(saved)?.savedAt;
        if (engine.restore(saved) && typeof savedAt === 'number') {
          const elapsed = Date.now() - savedAt;
          if (elapsed >= B.OFFLINE_MIN_MS) {
            const summary = engine.fastForward(elapsed);
            if (
              summary.goldGained > 0 ||
              summary.screensGained > 0 ||
              summary.died
            ) {
              // Estado inicial: se muestra el modal al montar.
              setTimeout(() => setOffline(summary), 0);
            }
          }
        }
      }
    } catch {
      /* guardado corrupto → run nueva */
    }
    engineRef.current = engine;
  }
  const engine = engineRef.current;

  // Sincronizar meta-bonos y mute con el store.
  const metaLevels = useMetaStore((s) => s.metaLevels);
  const muted = useMetaStore((s) => s.muted);
  useEffect(() => {
    engine.setMeta(metaBonuses(metaLevels));
  }, [engine, metaLevels]);
  useEffect(() => {
    setMuted(muted);
  }, [muted]);

  const storeCommit = useRunStore((s) => s.commit);
  const commit = useCallback(
    (snap: Snapshot, events: DamageEvent[]) => {
      playEventSfx(events);
      // Transiciones: entrada de boss y muerte.
      if (snap.isBoss && !snap.advancing && !prevBoss.current) {
        prevBoss.current = true;
        sfx.boss();
        setShaking(true);
        window.clearTimeout(shakeTimer.current);
        shakeTimer.current = window.setTimeout(() => setShaking(false), 650);
      } else if (!snap.isBoss) {
        prevBoss.current = false;
      }
      // Flash del personaje al recibir daño.
      if (events.some((ev) => ev.target === 'player')) {
        setCharHit(true);
        window.clearTimeout(charHitTimer.current);
        charHitTimer.current = window.setTimeout(() => setCharHit(false), 200);
      }
      // Subida de tier de skin → celebración.
      const tier = skinTier(snap.levels);
      if (tier > prevTier.current && snap.status === 'playing') {
        sfx.tierUp();
        setTierUpFlash(true);
        window.clearTimeout(tierUpTimer.current);
        tierUpTimer.current = window.setTimeout(() => setTierUpFlash(false), 1500);
      }
      prevTier.current = tier;
      if (snap.status === 'dead' && prevStatus.current === 'playing') {
        sfx.death();
        useMetaStore.getState().incRuns();
        try {
          localStorage.setItem(RUN_SAVE_KEY, engine.serialize());
        } catch {
          /* almacenamiento lleno: ignorar */
        }
      }
      prevStatus.current = snap.status;
      storeCommit(snap, events);
    },
    [engine, storeCommit],
  );

  useGameLoop(engine, commit);
  const snap = useRunStore((s) => s.snap);

  // Guardado periódico + al ocultar la pestaña.
  useEffect(() => {
    const save = () => {
      try {
        localStorage.setItem(RUN_SAVE_KEY, engine.serialize());
      } catch {
        /* ignorar */
      }
    };
    const interval = window.setInterval(save, 5000);
    const onHide = () => {
      if (document.visibilityState === 'hidden') save();
    };
    document.addEventListener('visibilitychange', onHide);
    window.addEventListener('pagehide', save);
    return () => {
      window.clearInterval(interval);
      document.removeEventListener('visibilitychange', onHide);
      window.removeEventListener('pagehide', save);
    };
  }, [engine]);

  const tapHintSeen = useMetaStore((s) => s.tapHintSeen);

  if (!snap) return null;

  const commitNow = () => commit(engine.snapshot(), engine.drainEvents());

  const handleBuy = (id: UpgradeId, count: number) => {
    initAudio();
    if (engine.buyUpgrade(id, count)) {
      sfx.buy();
      commitNow();
    }
  };

  const handleRetry = () => {
    initAudio();
    engine.reset();
    commitNow();
  };

  const handleRevive = () => {
    initAudio();
    if (useMetaStore.getState().spendEmeralds(B.REVIVE_COST_EMERALDS)) {
      if (engine.revive()) {
        sfx.revive();
        commitNow();
      } else {
        useMetaStore.getState().addEmeralds(B.REVIVE_COST_EMERALDS);
      }
    }
  };

  const handleStageTap = () => {
    initAudio();
    if (engine.tap()) {
      sfx.tap();
      if (!tapHintSeen) useMetaStore.getState().markTapHintSeen();
      commitNow();
    }
  };

  const cycleBuyMode = () =>
    setBuyMode((m) => (m === 1 ? 10 : m === 10 ? 'max' : 1));

  const showTapHint = !tapHintSeen && snap.status === 'playing' && !offline;

  // Tier de skin; ?skin=N permite previsualizar skins en desarrollo.
  const debugSkin = new URLSearchParams(window.location.search).get('skin');
  const tier =
    debugSkin !== null
      ? Math.max(0, Math.min(4, Number(debugSkin) || 0))
      : skinTier(snap.levels);

  return (
    <div className="game-root" onContextMenu={(e) => e.preventDefault()}>
      <Hud snap={snap} onOpenShop={() => setShopOpen(true)} />
      <main
        className={`stage ${snap.advancing ? 'advancing' : ''} ${
          snap.isBoss && !snap.advancing ? 'boss-fight' : ''
        } ${shaking ? 'shake' : ''}`}
        onPointerDown={handleStageTap}
      >
        <Background />
        <Character
          dead={snap.status === 'dead'}
          tier={tier}
          hit={charHit}
          tierUp={tierUpFlash}
        />
        {!snap.advancing && snap.enemyHP > 0 && <Enemy snap={snap} />}
        <DamageLayer />
        {tierUpFlash && <div className="tierup-banner">{t('hints.tier_up')}</div>}
        {snap.isBoss && !snap.advancing && snap.status === 'playing' && (
          <div className="boss-banner">☠ {t('hud.boss')}</div>
        )}
        {showTapHint && <div className="tap-hint">{t('hints.tap')}</div>}
      </main>
      <UpgradeBar
        snap={snap}
        buyMode={buyMode}
        onCycleBuyMode={cycleBuyMode}
        onBuy={handleBuy}
      />
      {snap.status === 'dead' && !offline && (
        <DeathScreen snap={snap} onRetry={handleRetry} onRevive={handleRevive} />
      )}
      {shopOpen && <MetaShop onClose={() => setShopOpen(false)} />}
      {offline && (
        <OfflineModal summary={offline} onClose={() => setOffline(null)} />
      )}
    </div>
  );
}
