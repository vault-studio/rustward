// Iconos de las 7 mejoras + monedas del HUD. Trazos uniformes, estilo chapa.
import type { UpgradeId } from '../../config/balance';

const base = {
  width: 20,
  height: 20,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  'aria-hidden': true,
};

export const IconAttack = () => (
  <svg {...base}>
    <path d="M4 20 L14 10" />
    <path d="M13 5 l6 6 -3.5 3.5 -6 -6 Z" fill="currentColor" stroke="none" />
    <path d="M4 20 l-1 1" />
  </svg>
);

export const IconDefense = () => (
  <svg {...base}>
    <path d="M12 3 L20 6 V12 C20 17 16.5 20 12 21 C7.5 20 4 17 4 12 V6 Z" />
    <path d="M12 7 V17" strokeWidth="1.5" />
  </svg>
);

export const IconSpeed = () => (
  <svg {...base}>
    <path d="M10 8 h6 a3 3 0 0 1 0 8 h-6 Z" fill="currentColor" stroke="none" />
    <path d="M8 10 H3 M8 14 H5 M8 12 H1" strokeWidth="1.5" />
  </svg>
);

export const IconLuck = () => (
  <svg {...base}>
    <circle cx="9" cy="9" r="3.6" />
    <circle cx="15" cy="9" r="3.6" />
    <circle cx="12" cy="14" r="3.6" />
    <path d="M12 17 Q11 20 9 21" strokeWidth="1.5" />
  </svg>
);

export const IconGold = () => (
  <svg {...base}>
    <circle cx="12" cy="12" r="8.5" />
    <circle cx="12" cy="12" r="4.5" strokeWidth="1.5" />
  </svg>
);

export const IconEmerald = () => (
  <svg {...base}>
    <path d="M12 3 L20 10 L12 21 L4 10 Z" />
    <path d="M12 3 L15 10 L12 21 L9 10 Z" strokeWidth="1" />
  </svg>
);

export const IconExecution = () => (
  <svg {...base}>
    <circle cx="12" cy="12" r="8.5" />
    <circle cx="12" cy="12" r="4.5" strokeWidth="1.5" />
    <circle cx="12" cy="12" r="1.4" fill="currentColor" stroke="none" />
  </svg>
);

// Variantes rellenas para el HUD.
export const CoinSolid = ({ size = 14 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden>
    <circle cx="12" cy="12" r="9" fill="#F0B23C" stroke="#8a5c14" strokeWidth="2" />
    <circle cx="12" cy="12" r="4.5" fill="none" stroke="#8a5c14" strokeWidth="2" />
  </svg>
);

export const EmeraldSolid = ({ size = 14 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden>
    <path d="M12 2.5 L21 10 L12 21.5 L3 10 Z" fill="#3FBF7F" stroke="#1F6B4A" strokeWidth="2" />
    <path d="M12 2.5 L15.5 10 L12 21.5 L8.5 10 Z" fill="#6fe0a6" opacity="0.6" />
  </svg>
);

const UPGRADE_ICONS: Record<UpgradeId, () => JSX.Element> = {
  attack: IconAttack,
  defense: IconDefense,
  speed: IconSpeed,
  luck: IconLuck,
  gold: IconGold,
  emerald: IconEmerald,
  execution: IconExecution,
};

export function UpgradeIcon({ id }: { id: UpgradeId }) {
  const Icon = UPGRADE_ICONS[id];
  return <Icon />;
}

// Botón de estadísticas del personaje: cabeza con máscara + hombros.
export const IconCharacterStats = () => (
  <svg {...base}>
    <circle cx="12" cy="9" r="5.4" />
    <circle cx="9.7" cy="8.6" r="1.3" fill="currentColor" stroke="none" />
    <circle cx="14.3" cy="8.6" r="1.3" fill="currentColor" stroke="none" />
    <rect x="10.1" y="11" width="3.8" height="2.4" rx="1" />
    <path d="M5.5 21 Q5.5 15.2 12 15.2 Q18.5 15.2 18.5 21" />
  </svg>
);

// Calavera del mapa de mundo: hueso con grieta de acento, estética
// post-nuclear. `tint` colorea la grieta según la zona (ver config/worlds.ts).
export const BossSkullSolid = ({
  size = 16,
  tint = '#C9621E',
}: {
  size?: number;
  tint?: string;
}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
    <path
      d="M12 2.5 C7.6 2.5 4.5 5.8 4.5 9.8 C4.5 12.6 6 14.6 7.3 15.8 L7.3 18.2 C7.3 19.4 8.2 20.3 9.3 20.3 L14.7 20.3 C15.8 20.3 16.7 19.4 16.7 18.2 L16.7 15.8 C18 14.6 19.5 12.6 19.5 9.8 C19.5 5.8 16.4 2.5 12 2.5 Z"
      fill="#D8CBB4"
      stroke="#16130F"
      strokeWidth="1.1"
    />
    <ellipse cx="9" cy="10" rx="1.9" ry="2.3" fill="#16130F" />
    <ellipse cx="15" cy="10" rx="1.9" ry="2.3" fill="#16130F" />
    <path d="M12 11.5 L13.1 14 L10.9 14 Z" fill="#16130F" />
    <path
      d="M9.3 17 L9.3 20.1 M11.2 17 L11.2 20.1 M12.8 17 L12.8 20.1 M14.7 17 L14.7 20.1"
      stroke="#16130F"
      strokeWidth="1"
    />
    <path
      d="M12.5 3.5 L11.2 8 L13 9.4 L11.3 13.5"
      stroke={tint}
      strokeWidth="0.9"
      fill="none"
      opacity="0.85"
    />
  </svg>
);
