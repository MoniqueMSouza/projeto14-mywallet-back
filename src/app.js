import express from "express";
import cors from "cors";
import chalk from "chalk"
import { MongoClient } from "mongodb";
import dotenv from 'dotenv'
import bcrypt from 'bcrypt'
import joi from 'joi'
import { v4 as uuid } from 'uuid';
import dayjs from 'dayjs'

const token = uuid()
dotenv.config()

const mongoClient = new MongoClient(process.env.DATABASE_URL);
let db;

try {
  mongoClient.connect()
  db = mongoClient.db();
  console.log('Conectou com o mongodb!')
} catch (error) {
  console.log('Deu erro no banco de dados!')
}

const usuarioSchema = joi.object({
  name: joi.string().required(),
  email: joi.string().email().required(),
  password: joi.string().required(),
  confirmPassword: joi.string().valid(joi.ref('password')).required()
})

const app = express();
app.use(cors());
app.use(express.json());

app.post("/cadastrar", async (req, res) => {
  const { name, email, password, confirmPassword } = req.body

  const { error } = usuarioSchema.validate({ name, email, password, confirmPassword })

  if (error) {
    const errorMessages = error.details.map(err => err.message)
    return res.status(422).send(errorMessages)
  }

  const passwordHashed = bcrypt.hashSync(password, 10)

  try {
    await db.collection("usuarios").insertOne({ name, email, password: passwordHashed })
    res.status(201).send("Usuario Cadastrado")

  } catch (error) {
    res.status(500).send("Erro:" + error.message)
  }
})
app.post("/entrar", async (req, res) => {
  const { email, password } = req.body

  try {

    const checarUsuario = await db.collection('usuarios').findOne({ email })
    if (!checarUsuario) return res.status(400).send("Usuário ou senha inválidos!")

    const isCorrectPassword = bcrypt.compareSync(password, checarUsuario.password)

    if (!isCorrectPassword) {
      return res.status(400).send("Usuário ou senha inválidos!")
    }

    const token = uuid();

    await db.collection("sessoes").insertOne({ idUsuario: checarUsuario._id, token })

    res.status(200).send(token)

  } catch (error) {
    res.status(500).send("Erro:" + error.message)
  }
})
app.get("/home", async (req, res) => {

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
})
app.post("/nova-entrada", async (req, res) => {

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
      { valor, description, idUsuario: sessaoAtiva.idUsuario, data: dayjs().format("DD/MM") })
    res.send("Enviado")

  } catch (err) {
    console.log(err)
    res.status(500).send("Erro no servidor")
  }

})
app.post("/nova-saida", async (req, res) => {

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
      { valor, description, idUsuario: sessaoAtiva.idUsuario, data: dayjs().format("DD/MM") })
    res.send("Enviado")

  } catch (err) {
    console.log(err)
    res.status(500).send("Erro no servidor")
  }
})

app.listen(5000, () => {
  console.log(chalk.blue('Servidor Funcionando na porta 5000'));
})