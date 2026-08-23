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
// extremos (t = 1/(count+1) .. count/(count+1)). Espaciado uniforme en el
// parámetro t, NO en distancia real — en curvas muy dobladas los puntos se
// amontonan hacia el lado de mayor curvatura. Ver pointsEvenlySpaced.
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

// `count` puntos distribuidos a distancia (longitud de arco) uniforme a lo
// largo de la curva — para que se "sientan" bien repartidos por el mapa
// aunque la curva se doble mucho. Muestrea la curva en `samples` pasos,
// acumula la longitud recorrida y reubica cada punto por interpolación
// lineal dentro del tramo muestreado donde cae su distancia objetivo.
export function pointsEvenlySpaced(
  p0: Point,
  control: Point,
  p1: Point,
  count: number,
  samples = 60,
): Point[] {
  const samplePoints = Array.from({ length: samples + 1 }, (_, i) =>
    quadraticBezierPoint(p0, control, p1, i / samples),
  );
  const cumulative = [0];
  for (let i = 1; i < samplePoints.length; i++) {
    const dx = samplePoints[i].x - samplePoints[i - 1].x;
    const dy = samplePoints[i].y - samplePoints[i - 1].y;
    cumulative.push(cumulative[i - 1] + Math.hypot(dx, dy));
  }
  const total = cumulative[cumulative.length - 1];

  return Array.from({ length: count }, (_, k) => {
    const targetDist = (total * (k + 1)) / (count + 1);
    let i = 0;
    while (i < cumulative.length - 2 && cumulative[i + 1] < targetDist) i++;
    const segStart = cumulative[i];
    const segEnd = cumulative[i + 1];
    const segT = segEnd > segStart ? (targetDist - segStart) / (segEnd - segStart) : 0;
    const a = samplePoints[i];
    const b = samplePoints[i + 1];
    return { x: a.x + (b.x - a.x) * segT, y: a.y + (b.y - a.y) * segT };
  });
}
