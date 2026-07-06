# RUSTWARD (web)

Idle roguelite post-apocalíptico. MVP web (React + Vite + TypeScript), diseñado mobile-first y con la lógica de juego aislada para portarla a Android (Expo/React Native) sin reescribirla.

## Desarrollo

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # type-check + build de producción en dist/
```

## Arquitectura

- `src/config/balance.ts` — ⚠️ todas las constantes de balance. Copiar literal a Android.
- `src/engine/` — ⚠️ motor agnóstico de plataforma (fórmulas, combate, spawner, loop rAF ref-based con commits throttled).
- `src/store/` — ⚠️ Zustand: `useRunStore` (estado de la run, volátil) y `useMetaStore` (esmeraldas + récord, persiste en `localStorage`).
- `src/i18n/` — ⚠️ ES/EN, mismos JSON que usará la versión Android.
- `src/utils/formatNumber.ts` — ⚠️ números grandes (K/M/B/T + aa, ab…).
- `src/components/` — presentación web (lo único que se recrea al portar).
- `src/assets/svg/` — todos los assets como componentes SVG en TSX, originales, sin IP de terceros.

Documento maestro de diseño: `RUSTWARD_WEB_PROMPT.md` (v1).
