// ⚠️ Agnóstico de plataforma — Zustand funciona igual en React Native.
// Estado de la run para la UI: snapshot commiteado por el motor + eventos de daño.
import { create } from 'zustand';
import type { DamageEvent, Snapshot } from '../engine/gameLoop';

interface RunUIState {
  snap: Snapshot | null;
  events: DamageEvent[];
  commit: (snap: Snapshot, incoming: DamageEvent[]) => void;
  removeEvent: (id: number) => void;
}

export const useRunStore = create<RunUIState>()((set) => ({
  snap: null,
  events: [],
  commit: (snap, incoming) =>
    set((state) => ({
      snap,
      events: incoming.length
        ? [...state.events, ...incoming].slice(-30)
        : state.events,
    })),
  removeEvent: (id) =>
    set((state) => ({ events: state.events.filter((e) => e.id !== id) })),
}));
