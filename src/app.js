import express from "express";
import cors from "cors";
import chalk from "chalk"
import authRouter from "./routes/AuthRoutes.js";
import lançamentosRouter from "./routes/LançamentosRoutes.js";


const app = express();
app.use(cors());
app.use(express.json());

app.use(authRouter)
app.use(lançamentosRouter)

app.listen(5000, () => {
  console.log(chalk.blue('Servidor Funcionando na porta 5000'));
})