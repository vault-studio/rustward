// ⚠️ Contenido de mundos — agnóstico de plataforma salvo la ruta de imagen
// (en Android, `mapBg` pasa a ser un require() de la misma imagen).
//
// Cada mundo es UN mapa pintado con 5 zonas de boss fijas (una por fase).
// El camino se dibuja como una curva de start→zona1→zona2→...→zona5, con
// 9 puntos (pantallas) distribuidos en cada tramo y la zona como remate
// (pantalla 10 = boss). Para añadir un mundo nuevo: pintar su mapa con 5
// zonas de boss, medir sus coordenadas (% del ancho/alto de la imagen) y
// añadir una entrada aquí — WorldMap.tsx no cambia, es 100% reutilizable.
import rustBeltMapBg from '../assets/img/world-rust-belt-map.jpg';
import type { Point } from '../utils/curve';

export interface MapZone extends Point {
  tint: string; // color del icono de boss en esa zona (ring/grieta)
}

export interface WorldDef {
  id: string;
  nameKey: string; // clave i18n en worlds.json → worlds.<id>
  mapBg: string;
  start: Point; // inicio del camino, antes de la fase 1
  zones: MapZone[]; // una por fase, en orden — length === BALANCE.PHASES_PER_WORLD
  pathControls: Point[]; // punto de control de la curva de cada tramo, mismo length que zones
}

export const WORLDS: WorldDef[] = [
  {
    id: 'rust_belt',
    nameKey: 'worlds.rust_belt',
    mapBg: rustBeltMapBg,
    start: { x: 50, y: 96 },
    zones: [
      { x: 32, y: 8, tint: '#9a958c' }, // ciudad en ruinas
      { x: 72, y: 15, tint: '#5fbf6f' }, // refinería tóxica
      { x: 78, y: 47, tint: '#7fa8c9' }, // instalación de la esfera
      { x: 24, y: 52, tint: '#c9621e' }, // mina
      { x: 71, y: 87, tint: '#e0b23c' }, // granero / hangar
    ],
    pathControls: [
      { x: 40, y: 45 },
      { x: 52, y: 4 },
      { x: 85, y: 28 },
      { x: 50, y: 52 },
      { x: 40, y: 72 },
    ],
  },
];

// Mundos más allá del último con arte propio reutilizan su mapa (mismas
// zonas/curvas) con un nombre genérico, hasta que se defina contenido nuevo.
export function worldAt(index: number): { def: WorldDef; generated: boolean } {
  if (index < WORLDS.length) return { def: WORLDS[index], generated: false };
  const last = WORLDS[WORLDS.length - 1];
  return { def: { ...last, id: `${last.id}-${index}` }, generated: true };
}
