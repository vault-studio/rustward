// ⚠️ Agnóstico de plataforma — en Android solo cambia el storage
// (localStorage → AsyncStorage) en createJSONStorage.
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export type Language = 'es' | 'en';

interface MetaState {
  emeralds: number;
  bestScreen: number;
  language: Language;
  addEmeralds: (amount: number) => void;
  reportScreen: (screen: number) => void;
  setLanguage: (language: Language) => void;
}

export const useMetaStore = create<MetaState>()(
  persist(
    (set) => ({
      emeralds: 0,
      bestScreen: 1,
      language: 'es',
      addEmeralds: (amount) =>
        set((state) => ({ emeralds: state.emeralds + amount })),
      reportScreen: (screen) =>
        set((state) =>
          screen > state.bestScreen ? { bestScreen: screen } : state,
        ),
      setLanguage: (language) => set({ language }),
    }),
    {
      name: 'rustward-meta',
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
