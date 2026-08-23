import { useEffect, useRef } from 'react';
import { BALANCE as B } from '../../config/balance';
import { worldAt } from '../../config/worlds';
import { phaseInWorldOf, phaseScreenRange, worldIndexOf } from '../../engine/formulas';
import { pointsAlongCurve, type Point } from '../../utils/curve';
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

function quadPath(p0: Point, control: Point, p1: Point): string {
  return `M ${p0.x} ${p0.y} Q ${control.x} ${control.y} ${p1.x} ${p1.y}`;
}

// Mapa de mundo: UN mapa pintado con 5 zonas de boss fijas (una por fase),
// unidas por un camino curvo con 9 pantallas + la zona como remate. 100%
// reutilizable para otros mundos — solo cambian `mapBg`/`zones`/`start`/
// `pathControls` en config/worlds.ts, nada aquí depende del mundo concreto.
export default function WorldMap({ currentScreen, bestScreen, onClose }: Props) {
  const t = useT();
  const scrollRef = useRef<HTMLDivElement>(null);
  const currentZoneRef = useRef<HTMLDivElement>(null);

  const worldIdx = worldIndexOf(currentScreen);
  const { def: world, generated } = worldAt(worldIdx);
  const worldName = generated ? `${t('hud.world')} ${worldIdx + 1}` : t(world.nameKey);
  const currentPhase = phaseInWorldOf(currentScreen);

  useEffect(() => {
    const container = scrollRef.current;
    const target = currentZoneRef.current;
    if (!container || !target) return;
    const targetTop = target.offsetTop - container.clientHeight / 2;
    container.scrollTo({ top: Math.max(0, targetTop), behavior: 'auto' });
  }, []);

  const phaseCount = world.zones.length;

  return (
    <div className="overlay map-overlay">
      <div className="panel worldmap-panel">
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
        <div className="worldmap-scroll" ref={scrollRef}>
          <div className="worldmap-stage">
            <img src={world.mapBg} alt="" className="worldmap-img" draggable={false} />
            <svg
              className="worldmap-svg"
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
              aria-hidden="true"
            >
              {world.zones.map((zone, i) => {
                const from = i === 0 ? world.start : world.zones[i - 1];
                const [, endScreen] = phaseScreenRange(worldIdx, i + 1);
                const segStatus = statusFor(endScreen, currentScreen, bestScreen);
                return (
                  <path
                    key={i}
                    d={quadPath(from, world.pathControls[i], zone)}
                    className={`worldmap-path ${segStatus}`}
                  />
                );
              })}
            </svg>

            {Array.from({ length: phaseCount }, (_, i) => {
              const phaseNum = i + 1;
              const from = i === 0 ? world.start : world.zones[i - 1];
              const zone = world.zones[i];
              const [start] = phaseScreenRange(worldIdx, phaseNum);
              const waypoints = pointsAlongCurve(
                from,
                world.pathControls[i],
                zone,
                B.BOSS_EVERY - 1,
              );
              const isCurrentPhase = phaseNum === currentPhase;

              return (
                <div key={phaseNum} className="worldmap-phase">
                  {waypoints.map((p, j) => {
                    const screen = start + j;
                    const status = statusFor(screen, currentScreen, bestScreen);
                    return (
                      <span
                        key={j}
                        className={`worldmap-dot ${status}`}
                        style={{ left: `${p.x}%`, top: `${p.y}%` }}
                      />
                    );
                  })}
                  <div
                    ref={isCurrentPhase ? currentZoneRef : undefined}
                    className={`worldmap-zone ${statusFor(start + B.BOSS_EVERY - 1, currentScreen, bestScreen)} ${isCurrentPhase ? 'is-current' : ''}`}
                    style={{ left: `${zone.x}%`, top: `${zone.y}%` }}
                  >
                    <BossSkullSolid size={22} tint={zone.tint} />
                    <span className="worldmap-phase-num">{phaseNum}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        <div className="panel-hazard bottom" />
      </div>
    </div>
  );
}
