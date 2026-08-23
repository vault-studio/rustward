import survivorUrl from '../../assets/img/character-survivor.png';

// Arte pintado único por ahora: se usa para las 5 skins hasta que existan
// versiones específicas por tier (equipo progresivamente más pesado). El
// array ya está indexado por tier para que, cuando llegue ese arte, baste
// con sustituir cada entrada — sin tocar Character.tsx ni GameScreen.tsx.
const CHARACTER_TIER_ART: readonly string[] = [
  survivorUrl,
  survivorUrl,
  survivorUrl,
  survivorUrl,
  survivorUrl,
];

interface Props {
  dead: boolean;
  tier: number;
  hit: boolean;
  tierUp: boolean;
}

export default function Character({ dead, tier, hit, tierUp }: Props) {
  const src = CHARACTER_TIER_ART[Math.max(0, Math.min(4, tier))];
  return (
    <div
      className={`char-wrap tier-${tier} ${dead ? 'dead' : ''} ${
        hit ? 'hit' : ''
      } ${tierUp ? 'tierup' : ''}`}
    >
      <span className="char-shadow" />
      <img src={src} alt="" draggable={false} className="char-painted" />
    </div>
  );
}
