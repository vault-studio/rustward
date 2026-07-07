import { BALANCE as B } from '../../config/balance';
import type { Snapshot } from '../../engine/gameLoop';
import { useMetaStore } from '../../store/useMetaStore';
import { useT } from '../../i18n';
import { formatNumber, formatTime } from '../../utils/formatNumber';
import { EmeraldSolid } from '../../assets/svg/icons';

interface Props {
  snap: Snapshot;
  onRetry: () => void;
  onRevive: () => void;
}

export default function DeathScreen({ snap, onRetry, onRevive }: Props) {
  const t = useT();
  const bestScreen = useMetaStore((s) => s.bestScreen);
  const emeralds = useMetaStore((s) => s.emeralds);

  const canRevive =
    !snap.revivedThisRun && emeralds >= B.REVIVE_COST_EMERALDS;

  const rows: Array<[string, string]> = [
    [t('death.screen_reached'), String(snap.screen)],
    [t('death.gold_earned'), formatNumber(snap.goldEarned)],
    [t('death.emeralds_earned'), formatNumber(snap.emeraldsRun)],
    [t('death.time'), formatTime(snap.runTimeMs)],
    [t('death.best'), String(bestScreen)],
  ];

  return (
    <div className="overlay death-overlay">
      <div className="panel death-panel">
        <div className="panel-hazard" />
        <h1>{t('death.title')}</h1>
        <dl className="panel-stats">
          {rows.map(([label, value]) => (
            <div key={label}>
              <dt>{label}</dt>
              <dd>{value}</dd>
            </div>
          ))}
        </dl>
        {!snap.revivedThisRun && (
          <button
            className="panel-btn revive-btn"
            disabled={!canRevive}
            onPointerDown={(e) => {
              e.preventDefault();
              onRevive();
            }}
          >
            {t('death.revive')} · <EmeraldSolid size={12} />{' '}
            {B.REVIVE_COST_EMERALDS}
          </button>
        )}
        <button className="panel-btn primary retry-btn" onPointerDown={onRetry}>
          {t('death.retry')}
        </button>
        <div className="panel-hazard bottom" />
      </div>
    </div>
  );
}
