import { BALANCE as B } from '../../config/balance';
import { worldAt } from '../../config/worlds';
import type { Snapshot } from '../../engine/gameLoop';
import { phaseInWorldOf, screenInPhaseOf, worldIndexOf } from '../../engine/formulas';
import { useMetaStore } from '../../store/useMetaStore';
import { useT } from '../../i18n';
import { formatNumber } from '../../utils/formatNumber';
import { CoinSolid, EmeraldSolid } from '../../assets/svg/icons';

interface Props {
  snap: Snapshot;
  onOpenShop: () => void;
  onOpenMap: () => void;
}

export default function Hud({ snap, onOpenShop, onOpenMap }: Props) {
  const t = useT();
  const emeralds = useMetaStore((s) => s.emeralds);
  const language = useMetaStore((s) => s.language);
  const setLanguage = useMetaStore((s) => s.setLanguage);
  const muted = useMetaStore((s) => s.muted);
  const toggleMuted = useMetaStore((s) => s.toggleMuted);

  const worldIdx = worldIndexOf(snap.screen);
  const { def: world, generated } = worldAt(worldIdx);
  const worldName = generated ? `${t('hud.world')} ${worldIdx + 1}` : t(world.nameKey);
  const phaseNum = phaseInWorldOf(snap.screen);
  const screenInPhase = screenInPhaseOf(snap.screen);

  const progress = snap.isBoss ? t('hud.boss') : `${screenInPhase}/${B.BOSS_EVERY}`;
  const hpPct =
    snap.stats.maxHP > 0 ? (snap.playerHP / snap.stats.maxHP) * 100 : 0;

  return (
    <header className="hud">
      <button
        className="hud-world-btn"
        onPointerDown={(e) => {
          e.preventDefault();
          onOpenMap();
        }}
      >
        <span className="hud-world-name">{worldName}</span>
        <span className="hud-world-caret">▸</span>
      </button>
      <div className="hud-top">
        <div className="hud-screen">
          <span className="hud-screen-label">{t('hud.phase')}</span>
          <span className="hud-screen-num">{phaseNum}</span>
          <span className={`hud-boss-progress ${snap.isBoss ? 'is-boss' : ''}`}>
            {progress}
          </span>
        </div>
        <div className="hud-right">
          <div className="hud-currency gold" title={t('hud.gold')}>
            <CoinSolid />
            <span>{formatNumber(snap.gold)}</span>
          </div>
          <button
            className="hud-currency emerald shop-btn"
            title={t('meta.title')}
            onPointerDown={(e) => {
              e.preventDefault();
              onOpenShop();
            }}
          >
            <EmeraldSolid />
            <span>{formatNumber(emeralds)}</span>
            <span className="shop-plus">+</span>
          </button>
          <button
            className="icon-btn"
            title="sound"
            onPointerDown={(e) => {
              e.preventDefault();
              toggleMuted();
            }}
          >
            {muted ? '🔇' : '🔊'}
          </button>
          <button
            className="lang-btn"
            onPointerDown={() => setLanguage(language === 'es' ? 'en' : 'es')}
          >
            {language.toUpperCase()}
          </button>
        </div>
      </div>
      <div className="hpbar player">
        <div className="hpbar-fill" style={{ width: `${hpPct}%` }} />
        <span className="hpbar-text">
          {formatNumber(Math.ceil(snap.playerHP))} / {formatNumber(snap.stats.maxHP)}
        </span>
      </div>
    </header>
  );
}
