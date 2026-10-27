import { validatePredictionInput } from "../utils/validator.js";
import { calculatePrediction } from "../services/index.js";
import {
  buildPredictionResult,
  createFormRegisters,
  getPredictionModes,
  isPredictionMode,
} from "../utils/prediction-view.js";

function renderPage(res, {
  error = null,
  mode = "sma",
  registers = createFormRegisters(),
  result = null,
  status = 200,
} = {}) {
  return res.status(status).render("index", {
    title: result ? "Resultado de la predicción" : "Predictor de Consumo Eléctrico",
    error,
    formOpen: Boolean(error),
    result,
    registers,
    modes: getPredictionModes(mode),
  });
}

export function renderHome(_req, res) {
  return renderPage(res);
}

/**
 * Valida la serie mensual y calcula el método seleccionado en el servidor.
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 * @returns {void}
 */
export function renderPrediction(req, res) {
  const body = req.body ?? {};
  const { dates, consumption } = body;
  const mode = Array.isArray(body.mode) ? body.mode[0] : body.mode;
  const registers = createFormRegisters(dates, consumption);

  if (!isPredictionMode(mode)) {
    return renderPage(res, {
      error: "Selecciona uno de los cuatro métodos de predicción disponibles.",
      mode: "sma",
      registers,
      status: 400,
    });
  }

  const validation = validatePredictionInput(dates, consumption);

  if (!validation.isValid) {
    return renderPage(res, {
      error: validation.error,
      mode,
      registers,
      status: 400,
    });
  }

  const { consumptionNums, registers: validRegisters } = validation;
  const calculation = calculatePrediction(mode, consumptionNums);

  return renderPage(res, {
    mode,
    registers: validRegisters.map((register, index) => ({
      ...register,
      number: index + 1,
      consumption: String(register.consumption),
    })),
    result: buildPredictionResult(mode, calculation, validRegisters),
  });
}
