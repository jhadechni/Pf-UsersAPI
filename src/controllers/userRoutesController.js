const controller = {}
const userModel = require('../models/userModel.js')
const crypting = require('../config/encrypting')
const auth = require('../config/auth')
const axios = require('axios')
const jwt = require('jsonwebtoken')

//Login
controller.login = async (req, res) => {
    try {
        const user = await userModel.findOne({ username: req.body.username }, '-blockchain_PK')
        const payload = {
            'username': user.username,
            'password': user.password
        }
        const accesToken = auth.createToken(payload)
        if (user) {
            const validPassword = crypting.verifyPassword(req.body.password, user.password);
            if (validPassword) {
                res.status(200).json({ message : 'Login sucefully!', accesToken: accesToken })
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
    const user = await userModel.findOne({ cedula: req.body.cedula, username: req.body.username })
    try {
        if (!user) {
            req.body.password = crypting.cryptPassword(req.body.password, salt)
            //make blockchain user creation request
            const response = await axios.get('https://big-pumas-beg-190-26-207-103.loca.lt/users/createIdentity') ?? "Couldnt communicate"
            const info = {
                "name": req.body.name,
                "surnames": req.body.surnames,
                "username": req.body.username,
                "password": req.body.password,
                "cedula": req.body.cedula,
                "email": req.body.email,
                "blockchain_PK": response.data.key
            }
            await userModel.create(info)
            const payload = {
                'username': req.body.username,
                'password': req.body.password
            }
            const accesToken = auth.createToken(payload)
            res.status(201).json({ message: "User created sucefully!" , token : accesToken})
        } else {
            res.status(208).json({ message: "User already exist" })
        }
    } catch (error) {
        console.log(error)
        res.status(500).json({ data: "Server internal error" })
    }
}

//get User
controller.getUser = async (req, res) => {
    try {
        const user = await userModel.findOne({ cedula: req.query.cedula }, '-password -blockchain_PK -__v -_id')
        if (!user) {
            res.status(404).json({ data: "User not found" })
        } else {
            if (await auth.verifyToken(req,res)) {
                res.status(200).json(user)
            } else {
                res.sendStatus(401)
            }
           
        }
    } catch (error) {
        console.log(error)
        res.status(500).json({ data: "Server internal error" })
    }
}

controller.consultarAcciones = async (req, res) => {
    try {
        const user = await userModel.findOne({ cedula: req.query.cedula }, '-password -blockchain_PK')
        if (!user) {
            res.status(404).json({ data: "User not found" })
        } else {
            if (await auth.verifyToken(req, res)) {
                const actions = {
                    "user": ["Editar información", "Consultar certificado de tradición", "Crear PQRSD"],
                    "admin": ["Editar información", "Editar rol de un usuario", "Crear certificado de tradición", "Modificar certificado de tradición", "Crear PQRSD", "Modificar PQRSD"]
                }
                if (user.role === "USER") {
                    res.status(200).json({ actions: actions.user })
                } else {
                    res.status(200).json({ actions: actions.admin })
                }
            } else {
                res.sendStatus(403)
            }
        }

    } catch (error) {
        console.log(error)
        res.status(500).json({ data: "Server internal error" })
    }
}

/* async function verifyToken (req, res) {
    try {
        const authHeader = await req.headers['authorization']
        const token = authHeader && authHeader.split(' ')[1]
        jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
        return true
    } catch (error) {
        console.log(error)
        return false
    }
} */
module.exports = controller;