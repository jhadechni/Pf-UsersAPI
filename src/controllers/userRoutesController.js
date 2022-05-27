const controller = {}
const userModel = require('../models/userModel.js')
const transactionModel = require('../models/transactionModel')
const auth = require('../config/auth')
const bcrypt = require('bcrypt')
const axios = require('axios')

//Login
controller.login = async (req, res) => {
    try {
        if (!req.body.username || !req.body.password) return res.sendStatus(400)
        const user = await userModel.findOne({ username: req.body.username }, '-blockchain_PK -_id')
        if (user) {
            const payload = {
                'username': user.username,
                'password': user.password
            }
            const validPassword = await bcrypt.compare(req.body.password, payload.password);
            const accesToken = auth.createToken(payload)
            if (validPassword) {
                res.status(200).json({ message: 'Login sucefully!', accesToken: accesToken, info: user })
            } else {
                res.status(404).json({ data: "Password incorrect" })
            }
        } else {
            res.status(404).json({ data: "Username incorrect" })
        }

    } catch (error) {
        console.log(error)
        res.status(500).json({ data: "Server internal error" })
    }
}
//Register
controller.register = async (req, res) => {
    if (!req.body.username || !req.body.password || !req.body.name || !req.body.cedula || !req.body.email) return res.sendStatus(400)
    const user = await userModel.findOne({ cedula: req.body.cedula })
    try {
        if (!user) {
            const salt = await bcrypt.genSalt(10)
            req.body.password = await bcrypt.hash(req.body.password, salt)
            //make blockchain user creation request
            const response = await axios.get(process.env.BLOCKCHAIN_API_URI.concat('/users/createIdentity')) || "Couldnt communicate"
            const info = {
                "name": req.body.name,
                "surnames": req.body.surnames,
                "username": req.body.username,
                "password": req.body.password,
                "cedula": req.body.cedula,
                "email": req.body.email,
                "blockchain_PK": response.data.key,
                "walletPublicAddress": response.data.address
            }
            await userModel.create(info)
            const payload = {
                'username': req.body.username,
                'password': req.body.password
            }
            const accesToken = auth.createToken(payload)
            return res.status(201).json({ message: "User created sucefully!", token: accesToken })
        } else {
            return res.status(208).json({ message: "User already exist" })
        }
    } catch (error) {
        console.log(error)
        return res.status(500).json({ data: "Server internal error", error: error })
    }
}
//get User
controller.getUser = async (req, res) => {
    try {
        if (await auth.verifyToken(req, res)) {
            if (!req.query.cedula) return res.sendStatus(400)

            const userSaved = await userModel.findOne({ cedula: req.query.cedula }, '-password -blockchain_PK -__v -_id')

            if (!userSaved) {
                return res.status(404).json({ data: "User not found" })
            }
            const pqrsd = await transactionModel.find({type : 'PQRSD'})
            const certificates = await transactionModel.find({type : 'CTRA'})
            
            const user = {
                ...userSaved._doc,
                "numOfPQRSD" : pqrsd.length,
                "numOfCertificates" : certificates.length
            }

            console.log(user)

            return res.status(200).json(user)


        } else {
            return res.sendStatus(401)
        }
    } catch (error) {
        console.log(error)
        return res.status(500).json({ data: "Server internal error" })
    }
}
//Get actions
controller.consultarAcciones = async (req, res) => {
    try {
        if (!req.query.cedula) return res.sendStatus(400)
        const user = await userModel.findOne({ cedula: req.query.cedula }, '-password -blockchain_PK')
        if (!user) {
            return res.status(404).json({ data: "User not found" })
        } else {
            if (await auth.verifyToken(req, res)) {
                const actions = {
                    "user": ["Editar información", "Consultar certificado de transacciones", "Crear PQRSD", "Consultar PQRSD"],
                    "admin": ["Editar información", "Consultar certificado de transacciones", "Hacer administradores a otros usuarios", "Crear certificado de transacciones", "Modificar certificado de transacciones", "Crear PQRSD", "Modificar PQRSD", "Consultar PQRSD"]
                }
                if (user.role === "USER") {
                    return res.status(200).json({ actions: actions.user })
                } else {
                    return res.status(200).json({ actions: actions.admin })
                }
            } else {
                return res.sendStatus(403)
            }
        }

    } catch (error) {
        console.log(error)
        return res.status(500).json({ data: "Server internal error" })
    }
}
//Edit info
controller.editInfo = async (req, res) => {
    try {
        if (await auth.verifyToken(req, res)) {
            const salt = await bcrypt.genSalt(10)
            req.body.password = await bcrypt.hash(req.body.password, salt)
            const newUser = {
                "name": req.body.newName,
                "surnames": req.body.newSurname,
                "password": req.body.newPassword,
                "email": req.body.newEmail,
            }
            await userModel.findOneAndUpdate({ username: req.body.username }, newUser)
            return res.sendStatus(204)
        } else {
            return res.sendStatus(403)
        }
    } catch (error) {
        console.log(error)
        return res.status(500).json({ data: "Server internal error" })
    }
}
module.exports = controller;