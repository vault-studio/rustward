// ⚠️ Agnóstico de plataforma — copiar literal a Android.
const SUFFIXES = ['', 'K', 'M', 'B', 'T'];

function trimmed(value: number): string {
  if (value >= 100) return value.toFixed(0);
  if (value >= 10) return value.toFixed(1);
  return value.toFixed(2);
}

export function formatNumber(n: number): string {
  if (!Number.isFinite(n)) return '∞';
  if (n < 0) return `-${formatNumber(-n)}`;
  if (n < 1000) return Math.floor(n).toString();

  const tier = Math.floor(Math.log10(n) / 3);
  const scaled = n / Math.pow(10, tier * 3);

  if (tier < SUFFIXES.length) return trimmed(scaled) + SUFFIXES[tier];

  // Notación de letras estilo idle: aa, ab, ac…
  const letterIndex = tier - SUFFIXES.length;
  const first = String.fromCharCode(97 + Math.floor(letterIndex / 26));
  const second = String.fromCharCode(97 + (letterIndex % 26));
  return trimmed(scaled) + first + second;
}

export function formatTime(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${String(seconds).padStart(2, '0')}`;
}
