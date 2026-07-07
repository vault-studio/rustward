// Superviviente original: respirador remendado, abrigo de chatarra.
// El aspecto evoluciona por tiers (0..4) según los niveles de la run:
// cada tier apila capas de equipo sobre el anterior. El walk cycle se
// anima por CSS sobre las clases .leg-front / .leg-back.
interface Props {
  tier?: number;
}

// Paleta del torso/abrigo por tier: chatarra → placas → gunmetal → exo.
const COAT: Record<number, { coat: string; trim: string; belt: string }> = {
  0: { coat: '#4a3f33', trim: '#2A2620', belt: '#C9621E' },
  1: { coat: '#52483a', trim: '#2A2620', belt: '#C9621E' },
  2: { coat: '#5c5040', trim: '#241f19', belt: '#E08A2B' },
  3: { coat: '#3a3f45', trim: '#1c1f24', belt: '#E08A2B' },
  4: { coat: '#2f3a3f', trim: '#161d20', belt: '#3FBF7F' },
};

export default function CharacterSvg({ tier = 0 }: Props) {
  const t = Math.max(0, Math.min(4, tier));
  const c = COAT[t];
  const lensColor = t >= 3 ? '#ffd97a' : '#F0B23C';

  return (
    <svg
      viewBox="0 0 120 160"
      xmlns="http://www.w3.org/2000/svg"
      className={`char-svg tier-${t}`}
      aria-hidden="true"
    >
      {/* pierna trasera */}
      <g className="leg leg-back">
        <rect x="50" y="98" width="11" height="38" rx="4" fill="#3a332a" />
        <rect x="47" y="131" width="18" height="9" rx="2" fill="#241f19" />
        {t >= 1 && <rect x="49" y="106" width="13" height="7" rx="2" fill="#5c5040" />}
      </g>
      {/* pierna delantera */}
      <g className="leg leg-front">
        <rect x="61" y="98" width="11" height="38" rx="4" fill="#4a4034" />
        <rect x="59" y="131" width="18" height="9" rx="2" fill="#2c2620" />
        {t >= 1 && <rect x="60" y="106" width="13" height="7" rx="2" fill="#6b5c48" />}
        {t >= 3 && <rect x="60" y="116" width="13" height="5" rx="2" fill="#4a5158" />}
      </g>

      {/* mochila (tier 3+) */}
      {t >= 3 && (
        <g>
          <rect x="34" y="62" width="14" height="26" rx="3" fill="#33383e" stroke="#1c1f24" strokeWidth="2" />
          <rect x="37" y="56" width="3" height="8" fill="#1c1f24" />
          <path d="M38.5 56 L38.5 44" stroke="#5c5040" strokeWidth="2" />
          <circle cx="38.5" cy="43" r="2" fill={t >= 4 ? '#3FBF7F' : '#C9621E'} className="antenna-light" />
          <rect x="36" y="70" width="10" height="4" fill="#1c1f24" />
        </g>
      )}

      {/* bufanda al viento */}
      <path
        className="scarf"
        d={
          t >= 4
            ? 'M50 56 Q30 60 20 76 Q34 70 44 66 Q38 74 34 84 Q44 74 50 64 Z'
            : 'M50 56 Q36 62 30 74 Q40 68 50 63 Z'
        }
        fill={t >= 2 ? '#E08A2B' : '#C9621E'}
        opacity="0.9"
      />

      {/* abrigo / torso */}
      <path
        d="M47 56 L77 56 L83 104 L43 104 Z"
        fill={c.coat}
        stroke={c.trim}
        strokeWidth="2"
      />
      <path d="M62 58 L60 102" stroke={c.trim} strokeWidth="2" />
      <rect x="43" y="86" width="40" height="6" fill={c.belt} opacity="0.85" />
      <rect x="59" y="85" width="8" height="8" fill="#8a7f6a" />

      {/* peto de placas (tier 2+) */}
      {t >= 2 && (
        <g>
          <path d="M49 60 L75 60 L78 82 L46 82 Z" fill={t >= 3 ? '#4a5158' : '#7a6a55'} stroke={c.trim} strokeWidth="2" />
          <path d="M48 71 L77 71" stroke={c.trim} strokeWidth="1.5" />
          <circle cx="52" cy="65" r="1.5" fill={c.trim} />
          <circle cx="72" cy="65" r="1.5" fill={c.trim} />
          <circle cx="52" cy="77" r="1.5" fill={c.trim} />
          <circle cx="72" cy="77" r="1.5" fill={c.trim} />
        </g>
      )}
      {/* núcleo esmeralda (tier 4) */}
      {t >= 4 && (
        <g className="core">
          <circle cx="62" cy="70" r="5" fill="#16130F" stroke="#1F6B4A" strokeWidth="2" />
          <circle cx="62" cy="70" r="2.6" fill="#3FBF7F" />
          <path d="M53 70 L57 70 M67 70 L71 70" stroke="#3FBF7F" strokeWidth="1.5" opacity="0.7" />
        </g>
      )}

      {/* hombrera izquierda (siempre) */}
      <path
        d="M44 54 L66 48 L68 61 L46 66 Z"
        fill={t >= 3 ? '#4a5158' : '#7a6a55'}
        stroke={c.trim}
        strokeWidth="2"
      />
      <circle cx="50" cy="58" r="1.6" fill={c.trim} />
      <circle cx="60" cy="55" r="1.6" fill={c.trim} />
      {/* hombrera masiva con pincho (tier 4) */}
      {t >= 4 && (
        <g>
          <path d="M40 50 L68 43 L70 60 L44 66 Z" fill="#3d464c" stroke="#161d20" strokeWidth="2.5" />
          <path d="M44 50 L38 38 L50 46 Z" fill="#3d464c" stroke="#161d20" strokeWidth="2" />
          <path d="M46 62 l8 -2 M46 58 l8 -2" stroke="#E4B23C" strokeWidth="2.5" />
        </g>
      )}

      {/* brazo con arma — crece por tier */}
      <g className="arm">
        <rect
          x="62"
          y="63"
          width="27"
          height="9"
          rx="4"
          fill={c.coat}
          stroke={c.trim}
          strokeWidth="1.5"
        />
        {t <= 1 && (
          <g>
            <rect x="85" y="57" width="16" height="8" rx="2" fill="#3a332a" />
            <rect x="95" y="64" width="4" height="8" fill="#3a332a" />
            <rect x="99" y="58" width="5" height="4" fill="#C9621E" />
          </g>
        )}
        {t === 1 && <rect x="99" y="55" width="14" height="4" rx="1.5" fill="#3a332a" />}
        {(t === 2 || t === 3) && (
          <g>
            <rect x="82" y="56" width="30" height="8" rx="2" fill={t >= 3 ? '#33383e' : '#3a332a'} stroke={c.trim} strokeWidth="1.5" />
            <rect x="92" y="63" width="5" height="10" fill={t >= 3 ? '#33383e' : '#3a332a'} />
            <rect x="86" y="64" width="4" height="7" fill="#2c2620" />
            <rect x="108" y="53" width="6" height="5" fill="#C9621E" />
            {t >= 3 && <rect x="98" y="52" width="10" height="4" rx="1.5" fill="#1c1f24" />}
          </g>
        )}
        {t >= 4 && (
          <g>
            <rect x="80" y="53" width="34" height="12" rx="3" fill="#33383e" stroke="#161d20" strokeWidth="2" />
            <rect x="90" y="64" width="6" height="11" fill="#33383e" />
            <rect x="112" y="55" width="6" height="8" fill="#16130F" />
            <circle cx="115" cy="59" r="2" fill="#3FBF7F" className="muzzle-glow" />
            <path d="M84 53 l6 0 M92 53 l6 0" stroke="#E4B23C" strokeWidth="2.5" />
            <rect x="96" y="49" width="12" height="5" rx="2" fill="#1c1f24" />
          </g>
        )}
      </g>

      {/* cabeza + máscara de gas */}
      <g className="head">
        <circle cx="62" cy="38" r="14" fill={t >= 3 ? '#454c53' : '#5c5040'} stroke={c.trim} strokeWidth="2" />
        <circle cx="68" cy="35" r="4.5" fill={lensColor} stroke={c.trim} strokeWidth="1.5" />
        <circle cx="55" cy="35" r="4.5" fill={lensColor} stroke={c.trim} strokeWidth="1.5" />
        <circle cx="68" cy="35" r="1.5" fill="#8a5c14" />
        <circle cx="55" cy="35" r="1.5" fill="#8a5c14" />
        <rect x="57" y="43" width="10" height="9" rx="3" fill="#3a332a" stroke={c.trim} strokeWidth="1.5" />
        <circle cx="62" cy="47.5" r="1.8" fill={t >= 4 ? '#3FBF7F' : '#C9621E'} />
        {/* capucha (tiers bajos) o casco (tier 2+) */}
        {t < 2 && <path d="M49 32 Q54 20 66 22 Q60 25 56 30 Z" fill="#4a3f33" />}
        {t >= 2 && (
          <g>
            <path d="M48 34 Q50 20 62 19 Q74 20 76 34 L72 30 Q68 24 62 24 Q56 24 52 30 Z" fill={t >= 3 ? '#4a5158' : '#7a6a55'} stroke={c.trim} strokeWidth="2" />
            <circle cx="52" cy="28" r="1.3" fill={c.trim} />
            <circle cx="72" cy="28" r="1.3" fill={c.trim} />
          </g>
        )}
        {/* cresta del casco (tier 4) */}
        {t >= 4 && <path d="M56 21 Q62 12 68 21 L65 23 Q62 18 59 23 Z" fill="#E4B23C" stroke="#161d20" strokeWidth="1.5" />}
      </g>
    </svg>
  );
}
