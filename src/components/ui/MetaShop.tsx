import { META_IDS, type MetaId } from '../../config/balance';
import { metaCost, metaIsMaxed } from '../../engine/formulas';
import { useMetaStore } from '../../store/useMetaStore';
import { useT } from '../../i18n';
import { formatNumber } from '../../utils/formatNumber';
import {
  EmeraldSolid,
  IconAttack,
  IconDefense,
  IconGold,
  IconSpeed,
  UpgradeIcon,
} from '../../assets/svg/icons';
import { sfx } from '../../audio/sfx';

const META_ICONS: Record<MetaId, () => JSX.Element> = {
  mDamage: IconAttack,
  mHealth: IconDefense,
  mGold: IconGold,
  mStartGold: () => <UpgradeIcon id="gold" />,
  mStartScreen: IconSpeed,
};

export default function MetaShop({ onClose }: { onClose: () => void }) {
  const t = useT();
  const emeralds = useMetaStore((s) => s.emeralds);
  const metaLevels = useMetaStore((s) => s.metaLevels);
  const buyMeta = useMetaStore((s) => s.buyMeta);

  return (
    <div className="overlay">
      <div className="panel meta-panel">
        <div className="panel-hazard" />
        <h2 className="panel-title">{t('meta.title')}</h2>
        <p className="meta-subtitle">{t('meta.subtitle')}</p>
        <div className="meta-balance">
          <EmeraldSolid size={16} />
          <span>{formatNumber(emeralds)}</span>
        </div>
        <div className="meta-list">
          {META_IDS.map((id) => {
            const Icon = META_ICONS[id];
            const level = metaLevels[id];
            const maxed = metaIsMaxed(id, level);
            const cost = metaCost(id, level);
            const canBuy = !maxed && emeralds >= cost;
            return (
              <div className="meta-row" key={id}>
                <span className="meta-icon">
                  <Icon />
                </span>
                <span className="meta-info">
                  <span className="meta-name">
                    {t(`meta.${id}`)}{' '}
                    <span className="meta-lvl">
                      {t('upgrades.level')} {level}
                    </span>
                  </span>
                  <span className="meta-desc">{t(`meta.${id}_desc`)}</span>
                </span>
                <button
                  className="meta-buy"
                  disabled={!canBuy}
                  onPointerDown={(e) => {
                    e.preventDefault();
                    if (buyMeta(id)) sfx.metaBuy();
                  }}
                >
                  {maxed ? (
                    t('meta.max')
                  ) : (
                    <>
                      <EmeraldSolid size={11} /> {formatNumber(cost)}
                    </>
                  )}
                </button>
              </div>
            );
          })}
        </div>
        <button className="panel-btn" onPointerDown={onClose}>
          {t('meta.close')}
        </button>
        <div className="panel-hazard bottom" />
      </div>
    </div>
  );
}
