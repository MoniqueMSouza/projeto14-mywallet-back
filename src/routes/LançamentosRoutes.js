import { listarLançamentos, cadastrarEntrada, cadastrarSaida } from "../controller/Lançamentos.js";
import { Router } from "express";

const lançamentosRouter = Router()

//Rotas dos lançamentos
lançamentosRouter.get("/home", listarLançamentos)
lançamentosRouter.post("/nova-entrada",cadastrarEntrada )
lançamentosRouter.post("/nova-saida", cadastrarSaida )

export default lançamentosRouter