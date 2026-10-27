const REGISTER_COUNT = 12;
const NUMBER_FORMATTER = new Intl.NumberFormat("es-DO", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});
const SLOPE_FORMATTER = new Intl.NumberFormat("es-DO", {
  minimumFractionDigits: 0,
  maximumFractionDigits: 4,
});
const MONTH_NAME_FORMATTER = new Intl.DateTimeFormat("es-DO", {
  month: "long",
  timeZone: "UTC",
});

export const PREDICTION_MODES = [
  { value: "sma", label: "Promedio Móvil Simple (SMA)" },
  { value: "regression", label: "Regresión Lineal" },
  { value: "variation", label: "Variación Porcentual" },
  { value: "trend", label: "Detección de Tendencia" },
];

export function isPredictionMode(mode) {
  return PREDICTION_MODES.some((predictionMode) => predictionMode.value === mode);
}

export function getPredictionModes(selectedMode) {
  return PREDICTION_MODES.map((predictionMode) => ({
    ...predictionMode,
    selected: predictionMode.value === selectedMode,
  }));
}

function asArray(value) {
  if (Array.isArray(value)) return value;
  return value === undefined || value === null ? [] : [value];
}

/**
 * Prepara las 12 filas del formulario y conserva los datos enviados.
 * @param {string|string[]} dates
 * @param {string|string[]} consumption
 * @returns {Array<{number: number, date: string, consumption: string}>}
 */
export function createFormRegisters(dates = [], consumption = []) {
  const dateValues = asArray(dates);
  const consumptionValues = asArray(consumption);

  return Array.from({ length: REGISTER_COUNT }, (_, index) => {
    const rawDate = String(dateValues[index] ?? "").trim();
    const monthValue = rawDate.match(/^(\d{4}-\d{2})/);

    return {
      number: index + 1,
      date: monthValue ? monthValue[1] : rawDate,
      consumption: String(consumptionValues[index] ?? "").trim(),
    };
  });
}

function formatNumber(value) {
  return NUMBER_FORMATTER.format(value);
}

function formatMonth(month) {
  const [year, monthNumber] = month.split("-");
  const monthName = MONTH_NAME_FORMATTER.format(
    new Date(Date.UTC(2000, Number(monthNumber) - 1, 1)),
  );

  return `${monthName} de ${year}`;
}

function nextMonth(month) {
  const [year, monthNumber] = month.split("-").map(Number);
  const nextYear = monthNumber === 12 ? year + 1 : year;
  const nextMonthNumber = monthNumber === 12 ? 1 : monthNumber + 1;

  return `${String(nextYear).padStart(4, "0")}-${String(nextMonthNumber).padStart(2, "0")}`;
}

function describeTendency(tendency) {
  const labels = {
    alcista: "Tendencia alcista",
    bajista: "Tendencia bajista",
    estable: "Tendencia estable",
    aumento: "Consumo en aumento",
    disminucion: "Consumo en disminución",
  };

  return labels[tendency] || "Tendencia no determinable";
}

/**
 * Prepara los datos que muestra la sección de resultados.
 * @param {string} mode
 * @param {object} calculation
 * @param {Array<{date: string, consumption: number}>} registers
 * @returns {object}
 */
export function buildPredictionResult(mode, calculation, registers) {
  const nextPeriod = nextMonth(registers.at(-1).date);
  const nextPeriodLabel = `Mes 13 · ${formatMonth(nextPeriod)}`;

  if (mode === "sma") {
    return {
      title: "Promedio Móvil Simple (SMA)",
      summary: `Estimación de consumo para ${formatMonth(nextPeriod)} a partir de los tres meses más recientes.`,
      tendency: calculation.tendency,
      tendencyLabel: describeTendency(calculation.tendency),
      metrics: [
        { label: "Promedio de los últimos 3 meses", value: `${formatNumber(calculation.promCalculated)} kWh` },
        { label: `Consumo estimado · ${nextPeriodLabel}`, value: `${formatNumber(calculation.nextMonth)} kWh` },
      ],
    };
  }

  if (mode === "regression") {
    return {
      title: "Regresión Lineal",
      summary: "Proyección del mes 13 basada en los 12 consumos históricos, usando el número de mes como variable de tiempo.",
      tendency: calculation.tendency,
      tendencyLabel: describeTendency(calculation.tendency),
      metrics: [
        { label: `Consumo estimado · ${nextPeriodLabel}`, value: `${formatNumber(calculation.nextMonth)} kWh` },
        { label: "Pendiente (m)", value: SLOPE_FORMATTER.format(calculation.m) },
        { label: "Intercepto (b)", value: SLOPE_FORMATTER.format(calculation.b) },
      ],
      note: "La pendiente positiva indica una tendencia alcista; la negativa, bajista; y una pendiente igual a cero, estable.",
    };
  }

  if (mode === "variation") {
    return {
      title: "Variación Porcentual",
      summary: "Cambio porcentual de cada mes respecto al anterior y promedio de las variaciones calculables.",
      tendency: calculation.tendency,
      tendencyLabel: describeTendency(calculation.tendency),
      metrics: [
        {
          label: "Promedio general de variación",
          value: calculation.average === null ? "n/a" : `${formatNumber(calculation.average)}%`,
        },
        { label: "Períodos calculables", value: `${calculation.calculatedPeriods} de 11` },
      ],
      variations: calculation.variations.map((variation, index) => ({
        month: `Mes ${index + 1}`,
        date: formatMonth(registers[index].date),
        value: variation === null ? "n/a" : `${formatNumber(variation)}%`,
      })),
      note: "El primer mes no tiene periodo anterior. Si el consumo anterior es 0, la variación se muestra como n/a y no participa en el promedio.",
    };
  }

  if (mode === "trend") {
    return {
      title: "Detección de Tendencia",
      summary: "Comparación secuencial de los 12 meses para identificar el comportamiento predominante.",
      tendency: calculation.tendency,
      tendencyLabel: describeTendency(calculation.tendency),
      metrics: [
        { label: "Meses que aumentaron", value: String(calculation.upCount) },
        { label: "Meses que disminuyeron", value: String(calculation.downCount) },
        { label: "Meses estables", value: String(calculation.stableCount) },
      ],
      note: "Se comparan los 11 pares de meses consecutivos. En caso de empate por la mayor cantidad, la tendencia final es estable.",
    };
  }

  throw new RangeError(`Método de predicción desconocido: ${mode}`);
}
