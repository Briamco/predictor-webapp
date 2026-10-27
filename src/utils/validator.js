const REQUIRED_REGISTER_COUNT = 12;

function toArray(value) {
  if (Array.isArray(value)) return value;
  return value === undefined || value === null ? [] : [value];
}

function invalidResult(error) {
  return {
    isValid: false,
    consumptionNums: [],
    registers: [],
    error,
  };
}

function parseMonth(value, index) {
  const dateString = String(value ?? "").trim();
  const match = dateString.match(/^(\d{4})-(\d{2})(?:-(\d{2}))?$/);

  if (!match) {
    return {
      error: `El registro ${index + 1} debe tener una fecha válida con formato AAAA-MM.`,
    };
  }

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = match[3] === undefined ? 1 : Number(match[3]);

  if (year < 1 || month < 1 || month > 12) {
    return { error: `La fecha del registro ${index + 1} no es válida.` };
  }

  const isLeapYear = year % 400 === 0 || (year % 4 === 0 && year % 100 !== 0);
  const monthLengths = [31, isLeapYear ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  const daysInMonth = monthLengths[month - 1];
  if (day < 1 || day > daysInMonth) {
    return { error: `La fecha del registro ${index + 1} no es válida.` };
  }

  return {
    monthIndex: year * 12 + month - 1,
    normalized: `${match[1]}-${match[2]}`,
  };
}

function parseConsumption(value, index) {
  const valueString = String(value ?? "").trim();

  if (!/^(?:\d+(?:[.,]\d*)?|[.,]\d+)(?:[eE][+-]?\d+)?$/.test(valueString)) {
    return {
      error: `El consumo del registro ${index + 1} debe ser un número igual o mayor que 0.`,
    };
  }

  const number = Number(valueString.replace(",", "."));
  if (!Number.isFinite(number)) {
    return {
      error: `El consumo del registro ${index + 1} debe ser un número igual o mayor que 0.`,
    };
  }

  return { number };
}

/**
 * Valida que existan exactamente 12 consumos mensuales, consecutivos y en
 * orden cronológico, y que cada consumo sea un valor numérico no negativo.
 * @param {string|string[]} dates Fechas mensuales en formato AAAA-MM o AAAA-MM-DD.
 * @param {string|string[]} consumption Consumos expresados en kWh.
 * @returns {{isValid: boolean, consumptionNums: number[], registers: Array<{date: string, consumption: number}>, error: string|null}}
 */
export function validatePredictionInput(dates, consumption) {
  const datesArray = toArray(dates);
  const consumptionArray = toArray(consumption);

  if (
    datesArray.length !== REQUIRED_REGISTER_COUNT ||
    consumptionArray.length !== REQUIRED_REGISTER_COUNT
  ) {
    return invalidResult(
      `Ingresa exactamente 12 registros mensuales. Se recibieron ${datesArray.length} fechas y ${consumptionArray.length} consumos.`,
    );
  }

  const registers = [];
  const consumptionNums = [];
  let previousMonthIndex = null;

  for (let index = 0; index < REQUIRED_REGISTER_COUNT; index += 1) {
    const parsedMonth = parseMonth(datesArray[index], index);
    if (parsedMonth.error) return invalidResult(parsedMonth.error);

    if (
      previousMonthIndex !== null &&
      parsedMonth.monthIndex !== previousMonthIndex + 1
    ) {
      return invalidResult(
        `Las fechas deben estar ordenadas del mes más antiguo al más reciente y cubrir 12 meses consecutivos. Revisa el registro ${index + 1}.`,
      );
    }

    const parsedConsumption = parseConsumption(consumptionArray[index], index);
    if (parsedConsumption.error) return invalidResult(parsedConsumption.error);

    registers.push({
      date: parsedMonth.normalized,
      consumption: parsedConsumption.number,
    });
    consumptionNums.push(parsedConsumption.number);
    previousMonthIndex = parsedMonth.monthIndex;
  }

  return {
    isValid: true,
    consumptionNums,
    registers,
    error: null,
  };
}
