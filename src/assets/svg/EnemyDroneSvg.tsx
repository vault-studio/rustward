// Dron de chatarra flotante. El rotor y el bamboleo se animan por CSS.
export default function EnemyDroneSvg() {
  return (
    <svg
      viewBox="0 0 120 120"
      xmlns="http://www.w3.org/2000/svg"
      className="enemy-svg drone"
      aria-hidden="true"
    >
      {/* rotor */}
      <rect className="rotor" x="28" y="14" width="64" height="5" rx="2.5" fill="#5c5040" />
      <rect x="57" y="18" width="6" height="12" fill="#3a332a" />

      {/* carcasa */}
      <path
        d="M38 30 L82 30 L92 52 L82 74 L38 74 L28 52 Z"
        fill="#4a3f33"
        stroke="#241f19"
        strokeWidth="2"
      />
      {/* rayas hazard */}
      <path d="M40 68 l8 -8 M50 68 l8 -8 M60 68 l8 -8" stroke="#E4B23C" strokeWidth="3" />
      <path d="M38 32 L82 32" stroke="#2c2620" strokeWidth="3" />

      {/* ojo único */}
      <circle cx="52" cy="50" r="9" fill="#16130F" stroke="#241f19" strokeWidth="2" />
      <circle cx="52" cy="50" r="4.5" fill="#F0B23C" />
      <circle cx="50.5" cy="48.5" r="1.4" fill="#fff2cc" />

      {/* remaches */}
      <circle cx="80" cy="36" r="1.7" fill="#241f19" />
      <circle cx="86" cy="52" r="1.7" fill="#241f19" />
      <circle cx="80" cy="68" r="1.7" fill="#241f19" />

      {/* garra colgante */}
      <path d="M60 74 L60 88" stroke="#3a332a" strokeWidth="3" />
      <path d="M60 88 l-7 8 M60 88 l7 8 M60 88 l0 10" stroke="#3a332a" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}
