import dayjs from 'dayjs'
import joi from 'joi'
import db from '../config/database.js'

export async function listarLançamentos(req, res){
    const { authorization } = req.headers
    const token = authorization?.replace("Bearer ", '')


    if (!token) return res.status(422).send("Informe o token!")


    try {
        const ativo = await db.collection("sessoes").findOne({ token })

        if (!ativo) return res.status(401).send("Você não está logado! Faça o login!")

        const gastos = await db.collection("carteira").find({ idUsuario: (ativo.idUsuario) }).toArray();

        if (!gastos) return res.sendStatus(401);

        return res.send(gastos)
    } catch (error) {
        return res.status(500).send(error.message);
    }
}
export async function cadastrarEntrada(req, res){

    const { valor, description } = req.body
    const { authorization } = req.headers
    const token = authorization?.replace("Bearer ", '')


    if (!token) return res.status(422).send("Informe o token!")

    const entradaSchema = joi.object({
        valor: joi.number().required(),
        description: joi.string().required(),
    })

    const { error } = entradaSchema.validate({ valor, description })
    if (error) return res.status(422).send(error.message)


    try {

        const sessaoAtiva = await db.collection("sessoes").findOne({ token })

        if (!sessaoAtiva) return res.status(401).send("Você não está autorizado!")

        await db.collection("carteira").insertOne(
            { valor, description, idUsuario: sessaoAtiva.idUsuario, data: dayjs().format("DD/MM"), tipo: "entrada" })
        res.send("Enviado")

    } catch (err) {
        console.log(err)
        res.status(500).send("Erro no servidor")
    }
}
export async function cadastrarSaida(req, res){
    const { valor, description } = req.body
    const { authorization } = req.headers
    const token = authorization?.replace("Bearer ", '')


    if (!token) return res.status(422).send("Informe o token!")

    const saidaSchema = joi.object({
        valor: joi.number().required(),
        description: joi.string().required(),
    })

    const { error } = saidaSchema.validate({ valor, description })
    if (error) return res.status(422).send(error.message)


    try {

        const sessaoAtiva = await db.collection("sessoes").findOne({ token })

        if (!sessaoAtiva) return res.status(401).send("Você não está autorizado!")

        await db.collection("carteira").insertOne(
            { valor, description, idUsuario: sessaoAtiva.idUsuario, data: dayjs().format("DD/MM"), tipo: "saída" })
        res.send("Enviado")

    } catch (err) {
        console.log(err)
        res.status(500).send("Erro no servidor")
    }
}




