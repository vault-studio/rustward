import { UPGRADE_IDS, type UpgradeId } from '../../config/balance';
import { upgradeCost } from '../../engine/formulas';
import type { Snapshot } from '../../engine/gameLoop';
import UpgradeButton from './UpgradeButton';

interface Props {
  snap: Snapshot;
  onBuy: (id: UpgradeId) => void;
}

export default function UpgradeBar({ snap, onBuy }: Props) {
  return (
    <nav className="upgrade-bar">
      {UPGRADE_IDS.map((id) => {
        const level = snap.levels[id];
        const cost = upgradeCost(id, level);
        return (
          <UpgradeButton
            key={id}
            id={id}
            level={level}
            cost={cost}
            canAfford={snap.status === 'playing' && snap.gold >= cost}
            onBuy={onBuy}
          />
        );
      })}
    </nav>
  );
}
