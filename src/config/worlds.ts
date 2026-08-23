// ⚠️ Contenido de mundos — agnóstico de plataforma salvo la ruta de imagen
// (en Android, `mapBg` pasa a ser un require() de la misma imagen).
//
// Cada mundo es UN mapa pintado con 5 zonas de boss fijas (una por fase) y
// un camino trazado a mano hasta cada una (medido sobre las rutas de color
// que pintó Carlos: verde=boss1, rojo=boss2, azul=boss3, amarillo=boss4,
// naranja=boss5 — extraídas por segmentación de color + lectura sobre
// rejilla de coordenadas). `paths[i]` incluye ambos extremos (inicio de la
// fase → zona i). Para añadir un mundo nuevo: pintar su mapa con 5 zonas
// de boss y 5 caminos de color, medir esas mismas coordenadas y añadir una
// entrada aquí — WorldMap.tsx no cambia, es 100% reutilizable.
import rustBeltMapBg from '../assets/img/world-rust-belt-map.jpg';
import type { Point } from '../utils/curve';

export interface MapZone extends Point {
  tint: string; // color del icono de boss en esa zona (ring/grieta)
}

export interface WorldDef {
  id: string;
  nameKey: string; // clave i18n en worlds.json → worlds.<id>
  mapBg: string;
  zones: MapZone[]; // una por fase, en orden — length === BALANCE.PHASES_PER_WORLD
  paths: Point[][]; // paths[i] = camino de la fase i+1 (inicio→zones[i]), mismo length que zones
}

export const WORLDS: WorldDef[] = [
  {
    id: 'rust_belt',
    nameKey: 'worlds.rust_belt',
    mapBg: rustBeltMapBg,
    zones: [
      { x: 77, y: 48, tint: '#7fa8c9' }, // boss1: instalación de la esfera
      { x: 33, y: 9, tint: '#9a958c' }, // boss2: ciudad en ruinas
      { x: 25, y: 56, tint: '#c9621e' }, // boss3: mina
      { x: 68, y: 16, tint: '#5fbf6f' }, // boss4: refinería tóxica
      { x: 71, y: 89, tint: '#e0b23c' }, // boss5: granero / hangar
    ],
    paths: [
      // boss1 — verde
      [
        { x: 35, y: 89 }, { x: 33, y: 85 }, { x: 32, y: 80 }, { x: 34, y: 75 },
        { x: 37, y: 70 }, { x: 41, y: 66 }, { x: 46, y: 63 }, { x: 51, y: 60 },
        { x: 58, y: 58 }, { x: 64, y: 56 }, { x: 70, y: 53 }, { x: 77, y: 48 },
      ],
      // boss2 — rojo
      [
        { x: 58, y: 46 }, { x: 50, y: 44 }, { x: 40, y: 42 }, { x: 35, y: 39 },
        { x: 38, y: 36 }, { x: 34, y: 32 }, { x: 29, y: 28 }, { x: 33, y: 24 },
        { x: 38, y: 20 }, { x: 34, y: 17 }, { x: 37, y: 14 }, { x: 33, y: 9 },
      ],
      // boss3 — azul
      [
        { x: 33, y: 10 }, { x: 37, y: 13 }, { x: 34, y: 17 }, { x: 38, y: 20 },
        { x: 33, y: 24 }, { x: 29, y: 28 }, { x: 33, y: 32 }, { x: 37, y: 36 },
        { x: 34, y: 40 }, { x: 30, y: 44 }, { x: 27, y: 50 }, { x: 25, y: 56 },
      ],
      // boss4 — amarillo
      [
        { x: 23, y: 58 }, { x: 27, y: 56 }, { x: 30, y: 53 }, { x: 35, y: 50 },
        { x: 40, y: 47 }, { x: 44, y: 44 }, { x: 48, y: 41 }, { x: 54, y: 38 },
        { x: 60, y: 35 }, { x: 63, y: 32 }, { x: 67, y: 29 }, { x: 64, y: 26 },
        { x: 68, y: 23 }, { x: 65, y: 20 }, { x: 68, y: 16 },
      ],
      // boss5 — naranja
      [
        { x: 55, y: 20 }, { x: 50, y: 25 }, { x: 47, y: 32 }, { x: 45, y: 38 },
        { x: 45, y: 45 }, { x: 40, y: 48 }, { x: 36, y: 52 }, { x: 33, y: 57 },
        { x: 30, y: 62 }, { x: 28, y: 67 }, { x: 26, y: 72 }, { x: 25, y: 77 },
        { x: 27, y: 82 }, { x: 35, y: 86 }, { x: 45, y: 88 }, { x: 55, y: 89 },
        { x: 65, y: 89 }, { x: 71, y: 89 },
      ],
    ],
  },
];

// Mundos más allá del último con arte propio reutilizan su mapa (mismas
// zonas/caminos) con un nombre genérico, hasta que se defina contenido nuevo.
export function worldAt(index: number): { def: WorldDef; generated: boolean } {
  if (index < WORLDS.length) return { def: WORLDS[index], generated: false };
  const last = WORLDS[WORLDS.length - 1];
  return { def: { ...last, id: `${last.id}-${index}` }, generated: true };
}
