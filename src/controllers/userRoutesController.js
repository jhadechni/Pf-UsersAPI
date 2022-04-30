const controller = {}
const userModel = require('../models/userModel.js')
const bcrypt = require('bcrypt');
const axios = require('axios');

//get User
controller.getUser = async (req, res) => {
    try {
        const user = await userModel.findOne({ cedula: req.query.cedula }, '-password -blockchain_PK -__v -_id')
        if (!user) {
            res.status(404).json({ data: "User not found" })
        } else {
            res.status(200).json(user)
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
            const salt = await bcrypt.genSalt(10);
            req.body.password = await bcrypt.hash(req.body.password, salt)
            //make blockchain user creation request
            /*
                const res = await axios.get('https://balockchainapi_url')
            */
            const info = {
                "data": req.body,
                "pk": "pk"
            }
            await userModel.create(info.data)
            res.status(201).json({ data: "User created sucefully!" })
        } else {
            res.status(208).json({ data: "User already exist" })
        }
    } catch (error) {
        console.log(error)
        res.status(500).json({ data: "Server internal error" })
    }
}

//Login
controller.login = async (req, res) => {
    try {
        const user = await userModel.findOne({ username: req.body.username }, '-blockchain_PK')
        if (user) {
            const validPassword = await bcrypt.compare(req.body.password, user.password);
            if (validPassword) {
                res.status(200).json({data : "Login sucefully!"})
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

controller.consultarAcciones = async (req, res) => {
    try {
        const user = await userModel.findOne({ cedula: req.query.cedula }, '-password -blockchain_PK')
        if (!user) {
            res.status(404).json({ data: "User not found" })
        } else {
            const actions = {
                "user": "Editar información, Consultar certificado de tradición, Crear PQRSD",
                "admin": "Editar información, Editar rol de un usuario, Crear certificado de tradición, Modificar certificado de tradición, Crear PQRSD, Modificar PQRSD"
            }
            if (user.role === "USER") {
                res.status(200).json({ actions: actions.user })
            } else {
                res.status(200).json({ actions: actions.admin })
            }
        }

    } catch (error) {
        console.log(error)
        res.status(500).json({ data: "Server internal error" })
    }
}

module.exports = controller;