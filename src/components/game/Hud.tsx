import { BALANCE as B } from '../../config/balance';
import type { Snapshot } from '../../engine/gameLoop';
import { useMetaStore } from '../../store/useMetaStore';
import { useT } from '../../i18n';
import { formatNumber } from '../../utils/formatNumber';
import { CoinSolid, EmeraldSolid } from '../../assets/svg/icons';

export default function Hud({ snap }: { snap: Snapshot }) {
  const t = useT();
  const emeralds = useMetaStore((s) => s.emeralds);
  const language = useMetaStore((s) => s.language);
  const setLanguage = useMetaStore((s) => s.setLanguage);

  const inCycle = snap.screen % B.BOSS_EVERY;
  const progress = snap.isBoss
    ? t('hud.boss')
    : `${inCycle}/${B.BOSS_EVERY}`;
  const hpPct =
    snap.stats.maxHP > 0 ? (snap.playerHP / snap.stats.maxHP) * 100 : 0;

  return (
    <header className="hud">
      <div className="hud-top">
        <div className="hud-screen">
          <span className="hud-screen-label">{t('hud.screen')}</span>
          <span className="hud-screen-num">{snap.screen}</span>
          <span className={`hud-boss-progress ${snap.isBoss ? 'is-boss' : ''}`}>
            {progress}
          </span>
        </div>
        <div className="hud-right">
          <div className="hud-currency gold" title={t('hud.gold')}>
            <CoinSolid />
            <span>{formatNumber(snap.gold)}</span>
          </div>
          <div className="hud-currency emerald" title={t('hud.emeralds')}>
            <EmeraldSolid />
            <span>{formatNumber(emeralds)}</span>
          </div>
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
