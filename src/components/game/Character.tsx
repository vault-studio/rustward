import CharacterSvg from '../../assets/svg/CharacterSvg';

export default function Character({ dead }: { dead: boolean }) {
  return (
    <div className={`char-wrap ${dead ? 'dead' : ''}`}>
      <CharacterSvg />
    </div>
  );
}
