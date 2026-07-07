import CharacterSvg from '../../assets/svg/CharacterSvg';

interface Props {
  dead: boolean;
  tier: number;
  hit: boolean;
  tierUp: boolean;
}

export default function Character({ dead, tier, hit, tierUp }: Props) {
  return (
    <div
      className={`char-wrap tier-${tier} ${dead ? 'dead' : ''} ${
        hit ? 'hit' : ''
      } ${tierUp ? 'tierup' : ''}`}
    >
      <CharacterSvg tier={tier} />
    </div>
  );
}
