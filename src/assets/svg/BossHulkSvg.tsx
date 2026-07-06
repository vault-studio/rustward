// Boss: moloso blindado de chatarra.
export default function BossHulkSvg() {
  return (
    <svg
      viewBox="0 0 200 200"
      xmlns="http://www.w3.org/2000/svg"
      className="boss-svg"
      aria-hidden="true"
    >
      {/* piernas */}
      <rect x="70" y="140" width="24" height="44" rx="6" fill="#312a22" stroke="#1c1712" strokeWidth="2" />
      <rect x="110" y="140" width="24" height="44" rx="6" fill="#3a332a" stroke="#1c1712" strokeWidth="2" />
      <rect x="62" y="178" width="36" height="12" rx="3" fill="#241f19" />
      <rect x="104" y="178" width="36" height="12" rx="3" fill="#241f19" />

      {/* torso blindado */}
      <path
        d="M56 70 L148 70 L142 148 L64 148 Z"
        fill="#4a4034"
        stroke="#241f19"
        strokeWidth="3"
      />
      <path d="M56 96 L146 96" stroke="#241f19" strokeWidth="2.5" />
      <path d="M60 122 L142 122" stroke="#241f19" strokeWidth="2.5" />
      {/* placa hazard */}
      <rect x="76" y="100" width="52" height="16" fill="#241f19" />
      <path d="M80 116 l10 -16 M94 116 l10 -16 M108 116 l10 -16 M122 116 l6 -10" stroke="#E4B23C" strokeWidth="5" />

      {/* remaches */}
      <circle cx="64" cy="78" r="2.5" fill="#241f19" />
      <circle cx="140" cy="78" r="2.5" fill="#241f19" />
      <circle cx="66" cy="140" r="2.5" fill="#241f19" />
      <circle cx="138" cy="140" r="2.5" fill="#241f19" />

      {/* hombreras */}
      <path d="M40 62 L84 52 L88 76 L46 84 Z" fill="#5c5040" stroke="#241f19" strokeWidth="3" />
      <path d="M116 52 L162 60 L156 84 L114 76 Z" fill="#5c5040" stroke="#241f19" strokeWidth="3" />
      <circle cx="52" cy="68" r="2.5" fill="#241f19" />
      <circle cx="150" cy="68" r="2.5" fill="#241f19" />

      {/* brazo-maza hacia el jugador */}
      <path d="M44 80 L20 116 L38 130 L58 96 Z" fill="#4a4034" stroke="#241f19" strokeWidth="3" />
      <path d="M14 108 L40 108 L40 138 L14 138 Z" fill="#5c5040" stroke="#241f19" strokeWidth="3" />
      <path d="M14 112 l-6 4 M14 122 l-7 1 M14 132 l-6 -2" stroke="#241f19" strokeWidth="3" strokeLinecap="round" />

      {/* cabeza pequeña con visor */}
      <path d="M84 44 L120 44 L124 70 L80 70 Z" fill="#3a332a" stroke="#241f19" strokeWidth="3" />
      <rect x="88" y="52" width="28" height="7" rx="2" fill="#F0B23C" />
      <rect x="88" y="52" width="28" height="7" rx="2" fill="none" stroke="#241f19" strokeWidth="1.5" />
      {/* tubos */}
      <path d="M122 60 Q136 58 138 70" stroke="#C9621E" strokeWidth="4" fill="none" />
      <path d="M82 60 Q70 58 68 68" stroke="#C9621E" strokeWidth="4" fill="none" />
    </svg>
  );
}
