import { Router } from "express";
import {
  renderHome,
  renderPrediction,
} from "../controllers/predictor.controller.js";

const router = Router();

router.get("/", renderHome);
router.post("/predict", renderPrediction);

export default router;
