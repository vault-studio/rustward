// ⚠️ Agnóstico de plataforma — geometría pura, sin dependencias de SVG/DOM.
export interface Point {
  x: number;
  y: number;
}

// Punto en una curva de Bézier cuadrática (p0→p1 con `control`) en t (0..1).
export function quadraticBezierPoint(
  p0: Point,
  control: Point,
  p1: Point,
  t: number,
): Point {
  const mt = 1 - t;
  return {
    x: mt * mt * p0.x + 2 * mt * t * control.x + t * t * p1.x,
    y: mt * mt * p0.y + 2 * mt * t * control.y + t * t * p1.y,
  };
}

// `count` puntos distribuidos a lo largo de la curva, sin incluir los
// extremos (t = 1/(count+1) .. count/(count+1)).
export function pointsAlongCurve(
  p0: Point,
  control: Point,
  p1: Point,
  count: number,
): Point[] {
  return Array.from({ length: count }, (_, i) => {
    const t = (i + 1) / (count + 1);
    return quadraticBezierPoint(p0, control, p1, t);
  });
}
