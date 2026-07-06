// Carroñero andrajoso — mira hacia la izquierda (hacia el jugador).
export default function EnemyScavengerSvg() {
  return (
    <svg
      viewBox="0 0 120 150"
      xmlns="http://www.w3.org/2000/svg"
      className="enemy-svg scavenger"
      aria-hidden="true"
    >
      {/* piernas */}
      <rect x="50" y="100" width="10" height="34" rx="4" fill="#241f19" />
      <rect x="63" y="100" width="10" height="34" rx="4" fill="#312a22" />
      <rect x="46" y="128" width="16" height="7" rx="2" fill="#1c1712" />
      <rect x="60" y="128" width="16" height="7" rx="2" fill="#241f19" />

      {/* cuerpo encorvado */}
      <path
        d="M42 72 Q46 46 70 48 Q90 52 86 80 L81 104 L47 104 Z"
        fill="#3a332a"
        stroke="#241f19"
        strokeWidth="2"
      />
      {/* harapos */}
      <path d="M50 104 l5 11 l5 -11 l5 11 l5 -11 Z" fill="#3a332a" />
      <path d="M46 78 L84 74" stroke="#241f19" strokeWidth="1.5" />
      <path d="M48 90 L82 88" stroke="#241f19" strokeWidth="1.5" />

      {/* brazo garra hacia el jugador */}
      <path d="M44 74 L20 84 L24 92 L46 84 Z" fill="#312a22" stroke="#241f19" strokeWidth="1.5" />
      <path d="M21 84 l-8 -3 M22 88 l-9 1 M24 91 l-7 5" stroke="#241f19" strokeWidth="2" strokeLinecap="round" />

      {/* cabeza encapuchada */}
      <path
        d="M36 46 Q38 30 54 30 Q64 32 62 48 Q60 58 48 58 Q38 56 36 46 Z"
        fill="#312a22"
        stroke="#241f19"
        strokeWidth="2"
      />
      <circle cx="43" cy="45" r="2.6" fill="#3FBF7F" />
      <circle cx="52" cy="44" r="2.6" fill="#3FBF7F" />
      {/* parche de metal */}
      <rect x="52" y="34" width="8" height="6" fill="#5c5040" transform="rotate(12 56 37)" />
    </svg>
  );
}
