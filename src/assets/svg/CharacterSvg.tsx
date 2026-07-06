// Superviviente original: respirador remendado, abrigo de chatarra.
// El walk cycle se anima por CSS sobre las clases .leg-front / .leg-back.
export default function CharacterSvg() {
  return (
    <svg
      viewBox="0 0 120 160"
      xmlns="http://www.w3.org/2000/svg"
      className="char-svg"
      aria-hidden="true"
    >
      {/* pierna trasera */}
      <g className="leg leg-back">
        <rect x="50" y="98" width="11" height="38" rx="4" fill="#3a332a" />
        <rect x="47" y="131" width="18" height="9" rx="2" fill="#241f19" />
      </g>
      {/* pierna delantera */}
      <g className="leg leg-front">
        <rect x="61" y="98" width="11" height="38" rx="4" fill="#4a4034" />
        <rect x="59" y="131" width="18" height="9" rx="2" fill="#2c2620" />
      </g>

      {/* bufanda al viento */}
      <path
        className="scarf"
        d="M50 56 Q36 62 30 74 Q40 68 50 63 Z"
        fill="#C9621E"
        opacity="0.9"
      />

      {/* abrigo / torso */}
      <path
        d="M47 56 L77 56 L83 104 L43 104 Z"
        fill="#4a3f33"
        stroke="#2A2620"
        strokeWidth="2"
      />
      <path d="M62 58 L60 102" stroke="#3a332a" strokeWidth="2" />
      <rect x="43" y="86" width="40" height="6" fill="#C9621E" opacity="0.85" />
      <rect x="59" y="85" width="8" height="8" fill="#8a7f6a" />

      {/* hombrera de chatarra */}
      <path
        d="M44 54 L66 48 L68 61 L46 66 Z"
        fill="#7a6a55"
        stroke="#2A2620"
        strokeWidth="2"
      />
      <circle cx="50" cy="58" r="1.6" fill="#2A2620" />
      <circle cx="60" cy="55" r="1.6" fill="#2A2620" />

      {/* brazo con arma de chatarra */}
      <g className="arm">
        <rect
          x="62"
          y="63"
          width="27"
          height="9"
          rx="4"
          fill="#4a3f33"
          stroke="#2A2620"
          strokeWidth="1.5"
        />
        <rect x="85" y="57" width="16" height="8" rx="2" fill="#3a332a" />
        <rect x="95" y="64" width="4" height="8" fill="#3a332a" />
        <rect x="99" y="58" width="5" height="4" fill="#C9621E" />
      </g>

      {/* cabeza + máscara de gas */}
      <g className="head">
        <circle cx="62" cy="38" r="14" fill="#5c5040" stroke="#2A2620" strokeWidth="2" />
        <circle cx="68" cy="35" r="4.5" fill="#F0B23C" stroke="#2A2620" strokeWidth="1.5" />
        <circle cx="55" cy="35" r="4.5" fill="#F0B23C" stroke="#2A2620" strokeWidth="1.5" />
        <circle cx="68" cy="35" r="1.5" fill="#8a5c14" />
        <circle cx="55" cy="35" r="1.5" fill="#8a5c14" />
        <rect x="57" y="43" width="10" height="9" rx="3" fill="#3a332a" stroke="#2A2620" strokeWidth="1.5" />
        <circle cx="62" cy="47.5" r="1.8" fill="#C9621E" />
        {/* capucha remendada */}
        <path d="M49 32 Q54 20 66 22 Q60 25 56 30 Z" fill="#4a3f33" />
      </g>
    </svg>
  );
}
