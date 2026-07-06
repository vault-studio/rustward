import { useEffect } from 'react';
import type { DamageEvent } from '../../engine/gameLoop';
import { useRunStore } from '../../store/useRunStore';
import { formatNumber } from '../../utils/formatNumber';

const LIFETIME_MS = 900;

function DamageNumber({ ev }: { ev: DamageEvent }) {
  const removeEvent = useRunStore((s) => s.removeEvent);

  useEffect(() => {
    const timer = setTimeout(() => removeEvent(ev.id), LIFETIME_MS);
    return () => clearTimeout(timer);
  }, [ev.id, removeEvent]);

  // Offset pseudo-aleatorio pero estable por evento (no cambia entre renders).
  const jx = ((ev.id * 53) % 30) - 15;
  const jy = (ev.id * 29) % 18;
  const style =
    ev.target === 'enemy'
      ? { right: `${16 + jx / 3}%`, top: `${28 + jy}%` }
      : { left: `${10 + jx / 4}%`, top: `${32 + jy}%` };

  const text =
    ev.target === 'player'
      ? `-${formatNumber(ev.amount)}`
      : ev.kind === 'exec'
        ? '✕'
        : formatNumber(ev.amount);

  return (
    <span className={`dmg dmg-${ev.kind} dmg-${ev.target}`} style={style}>
      {text}
    </span>
  );
}

export default function DamageLayer() {
  const events = useRunStore((s) => s.events);
  return (
    <div className="dmg-layer">
      {events.map((ev) => (
        <DamageNumber key={ev.id} ev={ev} />
      ))}
    </div>
  );
}
