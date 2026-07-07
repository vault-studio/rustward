import type { UpgradeId } from '../../config/balance';
import { useT } from '../../i18n';
import { formatNumber } from '../../utils/formatNumber';
import { UpgradeIcon } from '../../assets/svg/icons';

interface Props {
  id: UpgradeId;
  level: number;
  count: number;
  cost: number;
  canAfford: boolean;
  onBuy: (id: UpgradeId, count: number) => void;
}

// Pointer Events: un solo handler para mouse/touch/stylus, y pulsación
// rápida repetida = varias compras.
export default function UpgradeButton({
  id,
  level,
  count,
  cost,
  canAfford,
  onBuy,
}: Props) {
  const t = useT();
  return (
    <button
      className="upg"
      disabled={!canAfford}
      onPointerDown={(e) => {
        e.preventDefault();
        onBuy(id, count);
      }}
      onContextMenu={(e) => e.preventDefault()}
    >
      <span className="upg-icon">
        <UpgradeIcon id={id} />
      </span>
      <span className="upg-name">{t(`upgrades.${id}`)}</span>
      <span className="upg-lvl">
        {t('upgrades.level')} {level}
      </span>
      <span className="upg-cost">{formatNumber(cost)}</span>
    </button>
  );
}
