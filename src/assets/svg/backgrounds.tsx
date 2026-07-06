// Capas del parallax. Cada capa se repite horizontalmente (dos copias por track),
// así que el borde izquierdo y derecho de cada viewBox deben coincidir.
export const BgSkyline = () => (
  <svg viewBox="0 0 800 220" preserveAspectRatio="none" aria-hidden>
    <path
      d="M0 220 L0 150 L30 150 L30 100 L58 100 L58 138 L92 138 L92 74 L110 66 L128 74 L128 128
         L170 128 L170 92 L196 92 L196 40 L206 34 L216 40 L216 118 L258 118 L258 148 L300 148
         L300 96 L336 96 L336 130 L378 130 L378 60 L392 52 L410 60 L410 110 L448 110 L448 144
         L494 144 L494 84 L520 84 L520 122 L560 122 L560 70 L572 62 L590 70 L590 136 L636 136
         L636 104 L668 104 L668 146 L706 146 L706 88 L734 88 L734 128 L770 128 L770 150 L800 150
         L800 220 Z"
      fill="#211d17"
    />
    {/* antenas y ventanas encendidas */}
    <path d="M206 34 L206 14 M392 52 L392 30 M572 62 L572 44" stroke="#211d17" strokeWidth="3" />
    <circle cx="206" cy="13" r="2" fill="#C9621E" opacity="0.8" />
    <rect x="100" y="86" width="4" height="5" fill="#F0B23C" opacity="0.35" />
    <rect x="200" y="60" width="4" height="5" fill="#F0B23C" opacity="0.3" />
    <rect x="384" y="76" width="4" height="5" fill="#F0B23C" opacity="0.35" />
    <rect x="566" y="86" width="4" height="5" fill="#F0B23C" opacity="0.3" />
    <rect x="716" y="100" width="4" height="5" fill="#F0B23C" opacity="0.35" />
  </svg>
);

export const BgMidRuins = () => (
  <svg viewBox="0 0 800 160" preserveAspectRatio="none" aria-hidden>
    <path
      d="M0 160 L0 120 L44 96 L88 118 L120 100 L164 124 L210 92 L248 120 L286 104 L330 126
         L374 98 L416 122 L458 108 L502 128 L544 94 L586 120 L628 106 L672 126 L716 100
         L758 122 L800 120 L800 160 Z"
      fill="#2a2620"
    />
    {/* vigas asomando */}
    <path d="M210 92 L204 70 M212 92 L222 72" stroke="#3a332a" strokeWidth="4" />
    <path d="M544 94 L538 74 M548 94 L558 76" stroke="#3a332a" strokeWidth="4" />
    {/* coche calcinado */}
    <path d="M300 126 q6 -12 22 -12 q16 0 20 12 Z" fill="#332d25" />
    <circle cx="310" cy="127" r="4" fill="#241f19" />
    <circle cx="334" cy="127" r="4" fill="#241f19" />
  </svg>
);

export const BgGround = () => (
  <svg viewBox="0 0 800 90" preserveAspectRatio="none" aria-hidden>
    <rect width="800" height="90" fill="#241f19" />
    <rect width="800" height="7" fill="#332d25" />
    {/* grietas */}
    <path d="M60 8 l14 26 l-8 20 M74 34 l16 8" stroke="#16130F" strokeWidth="2.5" fill="none" />
    <path d="M300 8 l-10 30 l14 18 M290 38 l-18 6" stroke="#16130F" strokeWidth="2.5" fill="none" />
    <path d="M540 8 l8 24 l-12 22 M548 32 l18 10" stroke="#16130F" strokeWidth="2.5" fill="none" />
    <path d="M710 8 l-8 20 l10 16" stroke="#16130F" strokeWidth="2" fill="none" />
    {/* tubería asomando */}
    <rect x="420" y="14" width="52" height="10" rx="5" fill="#3a332a" />
    <circle cx="472" cy="19" r="7" fill="#3a332a" stroke="#241f19" strokeWidth="2" />
    <circle cx="472" cy="19" r="3" fill="#16130F" />
    {/* escombros */}
    <path d="M140 12 l10 0 l4 8 l-16 0 Z" fill="#2c2620" />
    <path d="M620 14 l12 0 l5 9 l-19 0 Z" fill="#2c2620" />
  </svg>
);
