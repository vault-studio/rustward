// ⚠️ Agnóstico de plataforma — en Android solo cambia el storage
// (localStorage → AsyncStorage) en createJSONStorage.
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { META_IDS, type MetaId } from '../config/balance';
import { metaCost, metaIsMaxed } from '../engine/formulas';

export type Language = 'es' | 'en';

const zeroMetaLevels = (): Record<MetaId, number> =>
  META_IDS.reduce(
    (acc, id) => ({ ...acc, [id]: 0 }),
    {} as Record<MetaId, number>,
  );

interface MetaState {
  emeralds: number;
  bestScreen: number;
  totalRuns: number;
  language: Language;
  muted: boolean;
  tapHintSeen: boolean;
  metaLevels: Record<MetaId, number>;
  addEmeralds: (amount: number) => void;
  spendEmeralds: (amount: number) => boolean;
  buyMeta: (id: MetaId) => boolean;
  reportScreen: (screen: number) => void;
  incRuns: () => void;
  setLanguage: (language: Language) => void;
  toggleMuted: () => void;
  markTapHintSeen: () => void;
}

export const useMetaStore = create<MetaState>()(
  persist(
    (set, get) => ({
      emeralds: 0,
      bestScreen: 1,
      totalRuns: 0,
      language: 'es',
      muted: false,
      tapHintSeen: false,
      metaLevels: zeroMetaLevels(),
      addEmeralds: (amount) =>
        set((state) => ({ emeralds: state.emeralds + amount })),
      spendEmeralds: (amount) => {
        if (get().emeralds < amount) return false;
        set((state) => ({ emeralds: state.emeralds - amount }));
        return true;
      },
      buyMeta: (id) => {
        const { emeralds, metaLevels } = get();
        const level = metaLevels[id];
        if (metaIsMaxed(id, level)) return false;
        const cost = metaCost(id, level);
        if (emeralds < cost) return false;
        set((state) => ({
          emeralds: state.emeralds - cost,
          metaLevels: { ...state.metaLevels, [id]: state.metaLevels[id] + 1 },
        }));
        return true;
      },
      reportScreen: (screen) =>
        set((state) =>
          screen > state.bestScreen ? { bestScreen: screen } : state,
        ),
      incRuns: () => set((state) => ({ totalRuns: state.totalRuns + 1 })),
      setLanguage: (language) => set({ language }),
      toggleMuted: () => set((state) => ({ muted: !state.muted })),
      markTapHintSeen: () => set({ tapHintSeen: true }),
    }),
    {
      name: 'rustward-meta',
      storage: createJSONStorage(() => localStorage),
      merge: (persisted, current) => {
        const p = (persisted ?? {}) as Partial<MetaState>;
        return {
          ...current,
          ...p,
          metaLevels: { ...zeroMetaLevels(), ...(p.metaLevels ?? {}) },
        };
      },
    },
  ),
);
