import { BgGround, BgMidRuins, BgSkyline } from '../../assets/svg/backgrounds';

// Cada capa duplica su SVG para hacer loop infinito con translateX(-50%).
const ASH = [
  { left: '12%', duration: '7s', delay: '0s' },
  { left: '38%', duration: '9s', delay: '2.2s' },
  { left: '64%', duration: '6.4s', delay: '1s' },
  { left: '85%', duration: '8.2s', delay: '3.4s' },
];

export default function Background() {
  return (
    <>
      <div className="layer layer-sky">
        <BgSkyline />
        <BgSkyline />
      </div>
      <div className="layer layer-mid">
        <BgMidRuins />
        <BgMidRuins />
      </div>
      <div className="layer layer-ground">
        <BgGround />
        <BgGround />
      </div>
      {ASH.map((p, i) => (
        <span
          key={i}
          className="ash"
          style={{
            left: p.left,
            animationDuration: p.duration,
            animationDelay: p.delay,
          }}
        />
      ))}
      <div className="crt" />
    </>
  );
}
