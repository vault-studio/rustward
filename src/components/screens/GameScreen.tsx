import { useRef } from 'react';
import { createEngine, useGameLoop, type Engine } from '../../engine/gameLoop';
import type { UpgradeId } from '../../config/balance';
import { useRunStore } from '../../store/useRunStore';
import { useMetaStore } from '../../store/useMetaStore';
import Background from '../game/Background';
import Character from '../game/Character';
import Enemy from '../game/Enemy';
import DamageLayer from '../game/DamageNumber';
import Hud from '../game/Hud';
import UpgradeBar from '../upgrades/UpgradeBar';
import DeathScreen from './DeathScreen';

export default function GameScreen() {
  const engineRef = useRef<Engine | null>(null);
  if (!engineRef.current) {
    engineRef.current = createEngine({
      // getState() en vez de closures de hooks: evita referencias obsoletas.
      onEmeralds: (n) => useMetaStore.getState().addEmeralds(n),
      onScreenReached: (s) => useMetaStore.getState().reportScreen(s),
    });
  }
  const engine = engineRef.current;

  const commit = useRunStore((s) => s.commit);
  useGameLoop(engine, commit);
  const snap = useRunStore((s) => s.snap);

  if (!snap) return null;

  const handleBuy = (id: UpgradeId) => {
    if (engine.buyUpgrade(id)) {
      // Commit inmediato para que la compra se sienta instantánea.
      commit(engine.snapshot(), engine.drainEvents());
    }
  };

  const handleRetry = () => {
    engine.reset();
    commit(engine.snapshot(), []);
  };

  return (
    <div className="game-root" onContextMenu={(e) => e.preventDefault()}>
      <Hud snap={snap} />
      <main className={`stage ${snap.advancing ? 'advancing' : ''}`}>
        <Background />
        <Character dead={snap.status === 'dead'} />
        {!snap.advancing && snap.enemyHP > 0 && <Enemy snap={snap} />}
        <DamageLayer />
      </main>
      <UpgradeBar snap={snap} onBuy={handleBuy} />
      {snap.status === 'dead' && <DeathScreen snap={snap} onRetry={handleRetry} />}
    </div>
  );
}
