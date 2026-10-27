/**
 * Calcula una regresión lineal sobre una serie de datos indexada por mes.
 *
 * @param {number[]} data Valores observados, donde cada posición representa
 * un mes consecutivo comenzando en 1.
 * @returns {{m: number, b: number, nextMonth: number, tendency: string}}
 * Pendiente, intersección, predicción para el mes siguiente y tendencia.
 */
export function calculateRegression(data) {
  const n = data.length;

  const { sumX, sumY, sumXY, sumX2 } = data.reduce(
    (sums, y, index) => {
      const x = index + 1;

      return {
        sumX: sums.sumX + x,
        sumY: sums.sumY + y,
        sumXY: sums.sumXY + x * y,
        sumX2: sums.sumX2 + x * x,
      };
    },
    { sumX: 0, sumY: 0, sumXY: 0, sumX2: 0 },
  );

  const rawSlope =
    (sumXY - (sumX * sumY) / n) / (sumX2 - (sumX * sumX) / n);
  const m = Math.abs(rawSlope) < 1e-10 ? 0 : rawSlope;
  const promX = sumX / n;
  const promY = sumY / n;
  const b = promY - m * promX;

  const nextMonth = Number((m * (n + 1) + b).toFixed(2));
  const tendency = m > 0 ? "alcista" : m < 0 ? "bajista" : "estable";

  return {
    m: Number(m.toFixed(4)),
    b: Number(b.toFixed(4)),
    nextMonth,
    tendency,
  };
}
