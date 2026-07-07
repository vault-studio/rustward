import type { Snapshot } from '../../engine/gameLoop';
import { formatNumber } from '../../utils/formatNumber';
import EnemyScavengerSvg from '../../assets/svg/EnemyScavengerSvg';
import EnemyDroneSvg from '../../assets/svg/EnemyDroneSvg';
import BossHulkSvg from '../../assets/svg/BossHulkSvg';

// Renderiza enemigo normal o boss con su barra de vida encima.
// El wrapper .sprite se re-monta con cada cambio de HP → flash de golpe CSS.
export default function Enemy({ snap }: { snap: Snapshot }) {
  const pct = snap.enemyMaxHP > 0 ? (snap.enemyHP / snap.enemyMaxHP) * 100 : 0;
  return (
    <div className={`enemy-wrap ${snap.isBoss ? 'boss' : snap.enemyKind}`}>
      <div className={`hpbar enemy ${snap.isBoss ? 'boss' : ''}`}>
        <div className="hpbar-fill" style={{ width: `${pct}%` }} />
        {snap.isBoss && (
          <span className="hpbar-text">{formatNumber(snap.enemyHP)}</span>
        )}
      </div>
      <div className="sprite" key={Math.ceil(snap.enemyHP)}>
        {snap.enemyKind === 'boss' ? (
          <BossHulkSvg />
        ) : snap.enemyKind === 'drone' ? (
          <EnemyDroneSvg />
        ) : (
          <EnemyScavengerSvg />
        )}
      </div>
    </div>
  );
}
