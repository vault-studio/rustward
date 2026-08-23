// ⚠️ Agnóstico de plataforma — geometría pura, sin dependencias de SVG/DOM.
export interface Point {
  x: number;
  y: number;
}

function dist(a: Point, b: Point): number {
  return Math.hypot(b.x - a.x, b.y - a.y);
}

// `count` puntos a distancia (longitud de arco) uniforme a lo largo de una
// polilínea de N puntos, sin incluir los extremos — para que los puntos se
// "sientan" bien repartidos por el mapa aunque el camino serpentee mucho,
// en vez de amontonarse en los tramos con más curvatura.
export function pointsEvenlySpacedOnPolyline(points: Point[], count: number): Point[] {
  const cumulative = [0];
  for (let i = 1; i < points.length; i++) {
    cumulative.push(cumulative[i - 1] + dist(points[i - 1], points[i]));
  }
  const total = cumulative[cumulative.length - 1];

  return Array.from({ length: count }, (_, k) => {
    const targetDist = (total * (k + 1)) / (count + 1);
    let i = 0;
    while (i < cumulative.length - 2 && cumulative[i + 1] < targetDist) i++;
    const segStart = cumulative[i];
    const segEnd = cumulative[i + 1];
    const segT = segEnd > segStart ? (targetDist - segStart) / (segEnd - segStart) : 0;
    const a = points[i];
    const b = points[i + 1];
    return { x: a.x + (b.x - a.x) * segT, y: a.y + (b.y - a.y) * segT };
  });
}

// Convierte una polilínea trazada a mano en un `d` de SVG suavizado
// (Catmull-Rom → Bézier cúbica) — el camino se ve como una curva fluida en
// vez de segmentos rectos entre los puntos medidos.
export function smoothPathD(points: Point[]): string {
  if (points.length === 0) return '';
  if (points.length === 1) return '';
  if (points.length === 2) {
    return `M ${points[0].x} ${points[0].y} L ${points[1].x} ${points[1].y}`;
  }
  let d = `M ${points[0].x} ${points[0].y}`;
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[Math.max(0, i - 1)];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[Math.min(points.length - 1, i + 2)];
    const c1 = { x: p1.x + (p2.x - p0.x) / 6, y: p1.y + (p2.y - p0.y) / 6 };
    const c2 = { x: p2.x - (p3.x - p1.x) / 6, y: p2.y - (p3.y - p1.y) / 6 };
    d += ` C ${c1.x} ${c1.y} ${c2.x} ${c2.y} ${p2.x} ${p2.y}`;
  }
  return d;
}
