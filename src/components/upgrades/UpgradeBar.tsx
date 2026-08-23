import { UPGRADE_IDS, type UpgradeId } from '../../config/balance';
import { bulkCost, maxAffordable, upgradeCost } from '../../engine/formulas';
import type { Snapshot } from '../../engine/gameLoop';
import { IconCharacterStats } from '../../assets/svg/icons';
import UpgradeButton from './UpgradeButton';

export type BuyMode = 1 | 10 | 'max';

interface Props {
  snap: Snapshot;
  buyMode: BuyMode;
  onCycleBuyMode: () => void;
  onBuy: (id: UpgradeId, count: number) => void;
  onOpenStats: () => void;
}

export default function UpgradeBar({
  snap,
  buyMode,
  onCycleBuyMode,
  onBuy,
  onOpenStats,
}: Props) {
  return (
    <nav className="upgrade-bar">
      <div className="bar-toolbar">
        <button
          className="stats-btn"
          onPointerDown={(e) => {
            e.preventDefault();
            onOpenStats();
          }}
        >
          <IconCharacterStats />
        </button>
        <button
          className="buymode-btn"
          onPointerDown={(e) => {
            e.preventDefault();
            onCycleBuyMode();
          }}
        >
          x{buyMode === 'max' ? 'MAX' : buyMode}
        </button>
      </div>
      {UPGRADE_IDS.map((id) => {
        const level = snap.levels[id];
        let count: number;
        let cost: number;
        if (buyMode === 'max') {
          count = Math.max(1, maxAffordable(id, level, snap.gold));
          cost = bulkCost(id, level, count);
        } else {
          count = buyMode;
          cost = buyMode === 1 ? upgradeCost(id, level) : bulkCost(id, level, buyMode);
        }
        return (
          <UpgradeButton
            key={id}
            id={id}
            level={level}
            count={count}
            cost={cost}
            canAfford={snap.status === 'playing' && snap.gold >= cost}
            onBuy={onBuy}
          />
        );
      })}
    </nav>
  );
}
