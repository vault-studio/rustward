import type { OfflineSummary } from '../../engine/gameLoop';
import { useT } from '../../i18n';
import { formatNumber, formatTime } from '../../utils/formatNumber';

interface Props {
  summary: OfflineSummary;
  onClose: () => void;
}

export default function OfflineModal({ summary, onClose }: Props) {
  const t = useT();
  const rows: Array<[string, string]> = [
    [t('offline.time'), formatTime(summary.simulatedMs)],
    [t('offline.gold'), formatNumber(summary.goldGained)],
    [t('offline.screens'), String(summary.screensGained)],
  ];
  if (summary.emeraldsGained > 0) {
    rows.push([t('offline.emeralds'), formatNumber(summary.emeraldsGained)]);
  }

  return (
    <div className="overlay">
      <div className="panel offline-panel">
        <div className="panel-hazard" />
        <h2 className="panel-title">{t('offline.title')}</h2>
        <dl className="panel-stats">
          {rows.map(([label, value]) => (
            <div key={label}>
              <dt>{label}</dt>
              <dd>{value}</dd>
            </div>
          ))}
        </dl>
        {summary.died && <p className="offline-died">{t('offline.died')}</p>}
        <button className="panel-btn primary" onPointerDown={onClose}>
          {t('offline.ok')}
        </button>
        <div className="panel-hazard bottom" />
      </div>
    </div>
  );
}
