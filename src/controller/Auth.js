import bcrypt from 'bcrypt'
import joi from 'joi'
import { v4 as uuid } from 'uuid';
import db from '../config/database.js'

const usuarioSchema = joi.object({
    name: joi.string().required(),
    email: joi.string().email().required(),
    password: joi.string().required(),
    confirmPassword: joi.string().valid(joi.ref('password')).required()
})
const token = uuid()

export async function cadastrar(req, res){
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

}
export async function entrar(req, res){
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
}


