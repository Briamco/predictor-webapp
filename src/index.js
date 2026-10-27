import express from "express";
import hbs from "hbs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import router from "./routes/index.js";

const projectRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
const viewsPath = join(projectRoot, "views");

hbs.registerPartials(join(viewsPath, "particions"));

const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.static(join(projectRoot, "public")));

app.set("view engine", "hbs");
app.set("views", viewsPath);

app.use(router);

const port = Number(process.env.PORT) || 3000;

app.listen(port, () => {
  console.log(`Predictor de Consumo disponible en http://localhost:${port}`);
});
