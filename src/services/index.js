import { calculateVariation } from "./variation.service.js";
import { calculateTrend } from "./trend.service.js";
import { calculateRegression } from "./regression.service.js";
import { calculateSMA } from "./sma.service.js";

export { calculateVariation, calculateTrend, calculateRegression, calculateSMA };

const calculators = {
  sma: calculateSMA,
  regression: calculateRegression,
  variation: calculateVariation,
  trend: calculateTrend,
};

/**
 * Enruta el método validado al servicio de cálculo correspondiente.
 * @param {string} mode
 * @param {number[]} data
 * @returns {object}
 */
export function calculatePrediction(mode, data) {
  if (!Object.prototype.hasOwnProperty.call(calculators, mode)) {
    throw new RangeError(`Método de predicción desconocido: ${mode}`);
  }

  return calculators[mode](data);
}
