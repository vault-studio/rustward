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
