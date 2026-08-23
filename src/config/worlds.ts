// ⚠️ Contenido de mundos — agnóstico de plataforma salvo la ruta de imagen
// (en Android, `mapBg` pasa a ser un require() de la misma imagen).
//
// Para añadir un mundo nuevo: generar el fondo de su bioma, importarlo aquí
// y añadir una entrada a WORLDS. El mapa (WorldMap.tsx) y toda la lógica de
// mundo/fase/pantalla (engine/formulas.ts) son 100% reutilizables — no hay
// nada más que tocar.
import rustBeltMapBg from '../assets/img/bg-skyline.jpg';

export interface WorldDef {
  id: string;
  nameKey: string; // clave i18n en worlds.json → worlds.<id>
  mapBg: string;
}

export const WORLDS: WorldDef[] = [
  { id: 'rust_belt', nameKey: 'worlds.rust_belt', mapBg: rustBeltMapBg },
];

// Mundos más allá del último con arte propio reutilizan su bioma con un
// nombre genérico ("MUNDO N"), hasta que se defina contenido nuevo.
export function worldAt(index: number): { def: WorldDef; generated: boolean } {
  if (index < WORLDS.length) return { def: WORLDS[index], generated: false };
  const last = WORLDS[WORLDS.length - 1];
  return { def: { ...last, id: `${last.id}-${index}` }, generated: true };
}
