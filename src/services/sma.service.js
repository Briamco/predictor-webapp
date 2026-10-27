/**
 * Calcula la media móvil simple de los tres consumos mensuales más recientes.
 *
 * @param {number[]} data Consumos mensuales ordenados cronológicamente.
 * @returns {{promCalculated: number, nextMonth: number, tendency: string}}
 * Objeto con la media calculada, la previsión para el próximo mes y la
 * tendencia: `alcista`, `bajista` o `estable`.
 */
export function calculateSMA(data) {
  const lastThreeData = data.slice(-3);
  const average =
    lastThreeData.reduce((total, value) => total + value, 0) /
    lastThreeData.length;
  const sma = Number(average.toFixed(2));

  const lastConsumption = data.at(-1);
  const tendency =
    lastConsumption > average
      ? "alcista"
      : lastConsumption < average
        ? "bajista"
        : "estable";

  return {
    promCalculated: sma,
    nextMonth: sma,
    tendency,
  };
}
