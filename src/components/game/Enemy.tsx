import type { Snapshot } from '../../engine/gameLoop';
import { formatNumber } from '../../utils/formatNumber';
import scavengerUrl from '../../assets/img/enemy-scavenger.png';
import droneUrl from '../../assets/img/enemy-drone.png';
import bossUrl from '../../assets/img/boss-hulk.png';

const ENEMY_ART: Record<string, string> = {
  scavenger: scavengerUrl,
  drone: droneUrl,
  boss: bossUrl,
};

// Renderiza enemigo normal o boss con su barra de vida encima.
// El wrapper .sprite se re-monta con cada cambio de HP → flash de golpe CSS.
export default function Enemy({ snap }: { snap: Snapshot }) {
  const pct = snap.enemyMaxHP > 0 ? (snap.enemyHP / snap.enemyMaxHP) * 100 : 0;
  const src = ENEMY_ART[snap.isBoss ? 'boss' : snap.enemyKind];
  return (
    <div className={`enemy-wrap ${snap.isBoss ? 'boss' : snap.enemyKind}`}>
      <div className={`hpbar enemy ${snap.isBoss ? 'boss' : ''}`}>
        <div className="hpbar-fill" style={{ width: `${pct}%` }} />
        {snap.isBoss && (
          <span className="hpbar-text">{formatNumber(snap.enemyHP)}</span>
        )}
      </div>
      <span className="enemy-shadow" />
      <div className="sprite" key={Math.ceil(snap.enemyHP)}>
        <img src={src} alt="" draggable={false} />
      </div>
    </div>
  );
}
