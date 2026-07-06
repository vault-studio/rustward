import type { Snapshot } from '../../engine/gameLoop';
import { useMetaStore } from '../../store/useMetaStore';
import { useT } from '../../i18n';
import { formatNumber, formatTime } from '../../utils/formatNumber';

interface Props {
  snap: Snapshot;
  onRetry: () => void;
}

export default function DeathScreen({ snap, onRetry }: Props) {
  const t = useT();
  const bestScreen = useMetaStore((s) => s.bestScreen);

  const rows: Array<[string, string]> = [
    [t('death.screen_reached'), String(snap.screen)],
    [t('death.gold_earned'), formatNumber(snap.goldEarned)],
    [t('death.emeralds_earned'), formatNumber(snap.emeraldsRun)],
    [t('death.time'), formatTime(snap.runTimeMs)],
    [t('death.best'), String(bestScreen)],
  ];

  return (
    <div className="death-overlay">
      <div className="death-panel">
        <div className="death-hazard" />
        <h1>{t('death.title')}</h1>
        <dl className="death-stats">
          {rows.map(([label, value]) => (
            <div key={label}>
              <dt>{label}</dt>
              <dd>{value}</dd>
            </div>
          ))}
        </dl>
        <button className="retry-btn" onPointerDown={onRetry}>
          {t('death.retry')}
        </button>
        <div className="death-hazard bottom" />
      </div>
    </div>
  );
}
