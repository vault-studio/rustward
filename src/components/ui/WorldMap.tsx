import { useEffect, useRef } from 'react';
import { BALANCE as B } from '../../config/balance';
import { worldAt } from '../../config/worlds';
import { phaseInWorldOf, phaseScreenRange, worldIndexOf } from '../../engine/formulas';
import { useT } from '../../i18n';
import { BossSkullSolid } from '../../assets/svg/icons';

interface Props {
  currentScreen: number;
  bestScreen: number;
  onClose: () => void;
}

type DotStatus = 'done' | 'current' | 'locked';

function statusFor(screen: number, currentScreen: number, bestScreen: number): DotStatus {
  if (screen === currentScreen) return 'current';
  if (screen <= bestScreen) return 'done';
  return 'locked';
}

// Mapa de mundo: fila de fases con scroll horizontal, 9 pantallas + 1 boss
// cada una. 100% reutilizable para otros mundos — solo cambia `world.mapBg`
// (ver config/worlds.ts), nada aquí depende del mundo concreto.
export default function WorldMap({ currentScreen, bestScreen, onClose }: Props) {
  const t = useT();
  const currentPhaseRef = useRef<HTMLDivElement>(null);

  const worldIdx = worldIndexOf(currentScreen);
  const { def: world, generated } = worldAt(worldIdx);
  const worldName = generated ? `${t('hud.world')} ${worldIdx + 1}` : t(world.nameKey);
  const currentPhase = phaseInWorldOf(currentScreen);

  useEffect(() => {
    currentPhaseRef.current?.scrollIntoView({ inline: 'center', block: 'nearest' });
  }, []);

  const phases = Array.from({ length: B.PHASES_PER_WORLD }, (_, i) => i + 1);

  return (
    <div className="overlay map-overlay">
      <div className="panel map-panel">
        <div className="panel-hazard" />
        <div className="map-header">
          <h2 className="panel-title map-title">{worldName}</h2>
          <button
            className="map-close"
            onPointerDown={(e) => {
              e.preventDefault();
              onClose();
            }}
            aria-label={t('meta.close')}
          >
            ✕
          </button>
        </div>
        <div className="map-track" style={{ backgroundImage: `url(${world.mapBg})` }}>
          {phases.map((phaseNum) => {
            const [start] = phaseScreenRange(worldIdx, phaseNum);
            const isCurrent = phaseNum === currentPhase;
            return (
              <div
                key={phaseNum}
                ref={isCurrent ? currentPhaseRef : undefined}
                className={`map-phase ${isCurrent ? 'is-current' : ''}`}
              >
                <span className="map-phase-num">{phaseNum}</span>
                <div className="map-dots">
                  {Array.from({ length: B.BOSS_EVERY }, (_, i) => {
                    const screen = start + i;
                    const status = statusFor(screen, currentScreen, bestScreen);
                    const isBossDot = i === B.BOSS_EVERY - 1;
                    return isBossDot ? (
                      <span key={i} className={`map-boss-dot ${status}`}>
                        <BossSkullSolid size={16} />
                      </span>
                    ) : (
                      <span key={i} className={`map-dot ${status}`} />
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
        <div className="panel-hazard bottom" />
      </div>
    </div>
  );
}
