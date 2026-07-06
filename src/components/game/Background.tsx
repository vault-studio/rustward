import skyUrl from '../../assets/img/bg-skyline.jpg';
import ruinsUrl from '../../assets/img/bg-mid-ruins.png';
import groundUrl from '../../assets/img/bg-ground.png';

// Cada capa repite la imagen en espejo (A, A-invertida, A, A-invertida):
// el ciclo translateX(-50%) recorre exactamente un periodo y el loop
// queda sin costuras aunque la imagen no sea tileable.
function MirrorTrack({ src, className }: { src: string; className: string }) {
  return (
    <div className={`layer ${className}`}>
      <img src={src} alt="" draggable={false} />
      <img src={src} alt="" draggable={false} className="flip" />
      <img src={src} alt="" draggable={false} />
      <img src={src} alt="" draggable={false} className="flip" />
    </div>
  );
}

const ASH = [
  { left: '12%', duration: '7s', delay: '0s' },
  { left: '38%', duration: '9s', delay: '2.2s' },
  { left: '64%', duration: '6.4s', delay: '1s' },
  { left: '85%', duration: '8.2s', delay: '3.4s' },
];

export default function Background() {
  return (
    <>
      <MirrorTrack src={skyUrl} className="layer-sky" />
      <MirrorTrack src={ruinsUrl} className="layer-mid" />
      <MirrorTrack src={groundUrl} className="layer-ground" />
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
