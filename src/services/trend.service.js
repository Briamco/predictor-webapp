/**
 * Calcula la tendencia predominante entre valores consecutivos.
 *
 * Cada comparación se clasifica como subida, bajada o estabilidad. La
 * tendencia general corresponde a la categoría con mayor frecuencia; en
 * caso de empate, se considera estable.
 *
 * @param {number[]} data Valores numéricos ordenados cronológicamente.
 * @returns {{upCount: number, downCount: number, stableCount: number, tendency: "alcista" | "bajista" | "estable"}}
 * Conteos de cada tipo de variación y tendencia predominante.
 */
export function calculateTrend(data) {
  const trendData = data.slice(1).map((value, index) => {
    const previousValue = data[index];

    if (value > previousValue) return "sube";
    if (value < previousValue) return "baja";
    return "estable";
  });

  const upCount = trendData.filter((trend) => trend === "sube").length;
  const downCount = trendData.filter((trend) => trend === "baja").length;
  const stableCount = trendData.filter((trend) => trend === "estable").length;

  const maxCount = Math.max(upCount, downCount, stableCount);
  const leaders = [upCount, downCount, stableCount].filter(
    (count) => count === maxCount,
  ).length;
  const tendency =
    leaders > 1
      ? "estable"
      : upCount === maxCount
        ? "alcista"
        : downCount === maxCount
          ? "bajista"
          : "estable";

  return {
    upCount,
    downCount,
    stableCount,
    tendency,
  };
}
