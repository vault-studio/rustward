import { useEffect, useRef } from 'react';
import { BALANCE as B } from '../../config/balance';
import { worldAt } from '../../config/worlds';
import { phaseInWorldOf, phaseScreenRange, worldIndexOf } from '../../engine/formulas';
import { pointsEvenlySpaced, type Point } from '../../utils/curve';
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

// Mapa de mundo: UN mapa pintado con 5 zonas de boss fijas. Solo se dibuja
// el camino (puntos + línea) de la FASE ACTUAL, hacia el boss al que vas
// — las otras 4 zonas quedan como iconos de contexto, sin ruta, para no
// saturar el mapa. 100% reutilizable para otros mundos: solo cambian
// `mapBg`/`zones`/`start`/`pathControls` en config/worlds.ts.
export default function WorldMap({ currentScreen, bestScreen, onClose }: Props) {
  const t = useT();
  const scrollRef = useRef<HTMLDivElement>(null);
  const currentZoneRef = useRef<HTMLDivElement>(null);

  const worldIdx = worldIndexOf(currentScreen);
  const { def: world, generated } = worldAt(worldIdx);
  const worldName = generated ? `${t('hud.world')} ${worldIdx + 1}` : t(world.nameKey);
  const currentPhase = phaseInWorldOf(currentScreen);
  const currentIdx = currentPhase - 1;

  const currentZone = world.zones[currentIdx];
  const currentFrom = currentIdx === 0 ? world.start : world.zones[currentIdx - 1];
  const [phaseStartScreen] = phaseScreenRange(worldIdx, currentPhase);
  const bossScreen = phaseStartScreen + B.BOSS_EVERY - 1;
  const pathStatus = statusFor(bossScreen, currentScreen, bestScreen);
  const waypoints = pointsEvenlySpaced(
    currentFrom,
    world.pathControls[currentIdx],
    currentZone,
    B.BOSS_EVERY - 1,
  );

  useEffect(() => {
    const container = scrollRef.current;
    const target = currentZoneRef.current;
    if (!container || !target) return;
    const targetTop = target.offsetTop - container.clientHeight / 2;
    container.scrollTo({ top: Math.max(0, targetTop), behavior: 'auto' });
  }, []);

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
              <path
                d={quadPath(currentFrom, world.pathControls[currentIdx], currentZone)}
                className={`worldmap-path ${pathStatus}`}
              />
            </svg>

            {currentIdx === 0 && (
              <span
                className="worldmap-start"
                style={{ left: `${world.start.x}%`, top: `${world.start.y}%` }}
              />
            )}

            {waypoints.map((p, j) => {
              const screen = phaseStartScreen + j;
              const status = statusFor(screen, currentScreen, bestScreen);
              return (
                <span
                  key={j}
                  className={`worldmap-dot ${status}`}
                  style={{ left: `${p.x}%`, top: `${p.y}%` }}
                />
              );
            })}

            {world.zones.map((zone, i) => {
              const phaseNum = i + 1;
              const [, zoneBossScreen] = phaseScreenRange(worldIdx, phaseNum);
              const status = statusFor(zoneBossScreen, currentScreen, bestScreen);
              const isCurrentPhase = phaseNum === currentPhase;
              return (
                <div
                  key={phaseNum}
                  ref={isCurrentPhase ? currentZoneRef : undefined}
                  className={`worldmap-zone ${status} ${isCurrentPhase ? 'is-current' : ''}`}
                  style={{ left: `${zone.x}%`, top: `${zone.y}%` }}
                >
                  <span className="skull-ring">
                    <BossSkullSolid size={isCurrentPhase ? 26 : 16} tint={zone.tint} />
                  </span>
                  <span className="worldmap-phase-num">{phaseNum}</span>
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
