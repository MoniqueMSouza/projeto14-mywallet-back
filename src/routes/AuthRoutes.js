import { entrar, cadastrar } from "../controller/Auth.js";
import { Router } from "express";

const authRouter = Router()

//Rotas de autenticação
authRouter.post("/cadastrar", cadastrar)
authRouter.post("/entrar",entrar )

export default authRouter