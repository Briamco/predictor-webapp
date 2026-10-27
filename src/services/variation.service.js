/**
 * Calcula los cambios porcentuales entre meses y su promedio.
 *
 * El primer mes no tiene periodo previo. Cuando el consumo anterior es cero,
 * la variación de ese periodo no se puede calcular y se excluye del promedio.
 * @param {number[]} data Consumos mensuales ordenados cronológicamente.
 * @returns {{variations: (number|null)[], average: (number|null), calculatedPeriods: number, tendency: string|null}}
 */
export function calculateVariation(data) {
  const variations = data.map((value, index) => {
    if (index === 0) return null;

    const previousValue = data[index - 1];
    if (previousValue === 0) return null;

    return ((value - previousValue) / previousValue) * 100;
  });

  const calculatedValues = variations.filter((value) => value !== null);
  const rawAverage = calculatedValues.length
    ? calculatedValues.reduce((total, value) => total + value, 0) /
      calculatedValues.length
    : null;

  const average = rawAverage === null ? null : Number(rawAverage.toFixed(2));
  const tendency =
    rawAverage === null
      ? null
      : rawAverage > 1
        ? "aumento"
        : rawAverage < -1
          ? "disminucion"
          : "estable";

  return {
    variations: variations.map((value) =>
      value === null ? null : Number(value.toFixed(2)),
    ),
    average,
    calculatedPeriods: calculatedValues.length,
    tendency,
  };
}
