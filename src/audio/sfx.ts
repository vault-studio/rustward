// SFX sintetizados con WebAudio: cero assets binarios, cero copyright.
// (Específico de web; en Android se sustituirá por expo-av o similar.)

let ctx: AudioContext | null = null;
let muted = false;

export function setMuted(value: boolean): void {
  muted = value;
}

// Debe llamarse desde un gesto del usuario (política de autoplay).
export function initAudio(): void {
  try {
    if (!ctx) {
      const AC = window.AudioContext ?? (window as any).webkitAudioContext;
      if (!AC) return;
      ctx = new AC();
    }
    if (ctx.state === 'suspended') void ctx.resume();
  } catch {
    /* audio no disponible: el juego sigue */
  }
}

function tone(
  freq: number,
  durationS: number,
  type: OscillatorType,
  volume: number,
  freqEnd?: number,
  delayS = 0,
): void {
  if (muted || !ctx || ctx.state !== 'running') return;
  try {
    const t0 = ctx.currentTime + delayS;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t0);
    if (freqEnd !== undefined) {
      osc.frequency.exponentialRampToValueAtTime(Math.max(1, freqEnd), t0 + durationS);
    }
    gain.gain.setValueAtTime(volume, t0);
    gain.gain.exponentialRampToValueAtTime(0.0001, t0 + durationS);
    osc.connect(gain).connect(ctx.destination);
    osc.start(t0);
    osc.stop(t0 + durationS + 0.02);
  } catch {
    /* ignorar fallos puntuales de audio */
  }
}

export const sfx = {
  hit: () => tone(170, 0.06, 'square', 0.04, 120),
  crit: () => tone(340, 0.14, 'square', 0.07, 180),
  exec: () => {
    tone(520, 0.1, 'sawtooth', 0.06, 260);
    tone(90, 0.18, 'square', 0.06, 40, 0.03);
  },
  playerHurt: () => tone(110, 0.09, 'sawtooth', 0.045, 70),
  coin: () => {
    tone(880, 0.07, 'sine', 0.05);
    tone(1320, 0.09, 'sine', 0.045, undefined, 0.06);
  },
  emerald: () => {
    tone(660, 0.09, 'sine', 0.06);
    tone(990, 0.1, 'sine', 0.055, undefined, 0.08);
    tone(1480, 0.12, 'sine', 0.05, undefined, 0.16);
  },
  boss: () => {
    tone(65, 0.5, 'sawtooth', 0.09, 45);
    tone(98, 0.4, 'square', 0.05, 60, 0.08);
  },
  death: () => {
    tone(220, 0.25, 'sawtooth', 0.07, 55);
    tone(110, 0.5, 'square', 0.06, 30, 0.15);
  },
  buy: () => tone(600, 0.05, 'square', 0.04, 750),
  metaBuy: () => {
    tone(440, 0.1, 'square', 0.05);
    tone(660, 0.12, 'square', 0.05, undefined, 0.09);
  },
  tap: () => tone(240, 0.04, 'square', 0.03, 190),
  revive: () => {
    tone(330, 0.12, 'sine', 0.06);
    tone(494, 0.12, 'sine', 0.06, undefined, 0.1);
    tone(659, 0.18, 'sine', 0.06, undefined, 0.2);
  },
  tierUp: () => {
    tone(392, 0.1, 'square', 0.06);
    tone(523, 0.1, 'square', 0.06, undefined, 0.09);
    tone(784, 0.2, 'square', 0.055, undefined, 0.18);
  },
};
