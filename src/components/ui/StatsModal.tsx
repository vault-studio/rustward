import type { Snapshot } from '../../engine/gameLoop';
import { useT } from '../../i18n';
import { formatNumber } from '../../utils/formatNumber';
import {
  IconAttack,
  IconDefense,
  IconEmerald,
  IconExecution,
  IconGold,
  IconLuck,
  IconSpeed,
} from '../../assets/svg/icons';

interface Props {
  snap: Snapshot;
  onClose: () => void;
}

const fmt1 = (n: number) => n.toFixed(1);

export default function StatsModal({ snap, onClose }: Props) {
  const t = useT();
  const { stats } = snap;

  const rows: Array<{
    icon: JSX.Element;
    label: string;
    value: string;
    note?: string;
  }> = [
    {
      icon: <IconAttack />,
      label: t('stats.damage'),
      value: formatNumber(stats.damage),
    },
    {
      icon: <IconSpeed />,
      label: t('stats.speed'),
      value: `${fmt1(1000 / stats.attackInterval)}/s`,
    },
    {
      icon: <IconDefense />,
      label: t('stats.defense'),
      value: `-${fmt1(stats.flatDR)}`,
      note: `${t('stats.defense_hp')}: ${formatNumber(stats.maxHP)}`,
    },
    {
      icon: <IconLuck />,
      label: t('stats.luck'),
      value: `${fmt1(stats.critChance * 100)}%`,
      note: t('stats.luck_note'),
    },
    {
      icon: <IconExecution />,
      label: t('upgrades.execution'),
      value: `${fmt1(stats.execChance * 100)}%`,
      note: t('stats.execution_note'),
    },
    {
      icon: <IconGold />,
      label: t('upgrades.gold'),
      value: `+${fmt1((stats.goldMult - 1) * 100)}%`,
      note: t('stats.gold_note'),
    },
    {
      icon: <IconEmerald />,
      label: t('upgrades.emerald'),
      value: `+${fmt1((stats.emeraldMult - 1) * 100)}%`,
      note: t('stats.emerald_note'),
    },
  ];

  return (
    <div className="overlay">
      <div className="panel stats-panel">
        <div className="panel-hazard" />
        <h2 className="panel-title">{t('stats.title')}</h2>
        <div className="stats-list">
          {rows.map((r) => (
            <div className="stats-row" key={r.label}>
              <span className="stats-icon">{r.icon}</span>
              <span className="stats-info">
                <span className="stats-label">{r.label}</span>
                {r.note && <span className="stats-note">{r.note}</span>}
              </span>
              <span className="stats-value">{r.value}</span>
            </div>
          ))}
        </div>
        <button className="panel-btn" onPointerDown={onClose}>
          {t('meta.close')}
        </button>
        <div className="panel-hazard bottom" />
      </div>
    </div>
  );
}
