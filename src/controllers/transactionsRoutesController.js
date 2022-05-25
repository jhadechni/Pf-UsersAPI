controller = {}
const userModel = require('../models/userModel')
const transactionModel = require('../models/transactionModel')
const crypto = require('crypto')
const axios = require('axios')
const auth = require('../config/auth')
const { createPDFTIL } = require('../config/filesCreation')



controller.createCertificateTIL = async (req, res) => {

    try {
        if (!req.body.cedula || !req.body.description || !req.body.adminCedula || !req.body.valorActo || !req.body.city) { return res.sendStatus(400) }

        const isAdmin = await userModel.findOne({ cedula: req.body.adminCedula })

        const user = await userModel.findOne({ cedula: req.body.cedula })

        if (!isAdmin || !user) { return res.status(404).json({ message: 'User or admin not found' }) }

        if (isAdmin.role != "ADMIN") { return res.status(403).send({ message: 'Action not allowed' }) }

        if (!await auth.verifyToken(req, res)) { return res.sendStatus(401) }

        const enrollmentNumber = crypto.randomBytes(7).toString('hex')

        const metadata = {
            "enrollmentNumber": enrollmentNumber,
            "ownerId": user.cedula,
            "adminId": isAdmin.cedula,
            "description": req.body.description,
            "actValue": req.body.valorActo,
            "city": req.body.city
        }

        const data = {
            "metadata": metadata,
            "ownerPk": user.blockchain_PK,
            "authPk": isAdmin.blockchain_PK
        }
        const response = await axios.post(process.env.BLOCKCHAIN_API_URI.concat('/certificate/create'), { data }) || 'Couldnt communicate'

        const date = new Date(response.data.timestamp * 1000)
        const transactionData = {
            "enrollmentNumber": enrollmentNumber,
            "cedula": metadata.ownerId,
            "tx_hash": response.data.txHash,
            "b_tk_id":response.data.tokenId,
            "price": response.data.fee,
            "prevOwner": response.data.prevOwner,
            "actualOwner": response.data.currentOwner,
            "status": response.data.status,
            "timeStamp": date,
            "actValue": metadata.actValue,
            "description": metadata.description,
            "adminId": isAdmin.cedula,
            "city": metadata.city,
            "type": "CTRA"
        }
        console.log(transactionData)
        await transactionModel.create(transactionData)
        return res.status(201).json({ message: "Certificate created sucefully!" })

    } catch (error) {
        console.log(error)
        return res.sendStatus(500)
    }
}

controller.updateTILCertificate = async (req, res) => {

    try {
        console.log('Updating certificate')

        if (!req.body.cedula || !req.body.description || !req.body.adminCedula || !req.body.valorActo || !req.body.city || !req.body.enrollmentNumber) { return res.sendStatus(400) }

        const isAdmin = await userModel.findOne({ cedula: req.body.adminCedula })

        const user = await userModel.findOne({ cedula: req.body.cedula })

        const certificate = await transactionModel.findOne({enrollmentNumber: req.body.enrollmentNumber})

        if (!isAdmin || !user || !certificate) { return res.status(404).json({ message: 'User, admin or certificate not found' }) }

        if(user.cedula != certificate.ownerId) {return res.status(403).json({message : 'User with this id is not the certificate owner'})}

        if (isAdmin.role != "ADMIN") { return res.status(403).json({ message: 'Action not allowed' }) }

        if (!await auth.verifyToken(req, res)) { return res.sendStatus(401) }

        const metadata = {
            "enrollmentNumber": req.body.enrollmentNumber,
            "ownerId": user.cedula,
            "adminId": isAdmin.cedula,
            "description": req.body.description,
            "actValue": req.body.valorActo,
            "city": req.body.city
        }

        const data = {
            "metadata": metadata,
            "tokenId": certificate.b_tk_id,
            "authPk": isAdmin.blockchain_PK
        }

        console.log(data)
        const response = await axios.put(process.env.BLOCKCHAIN_API_URI.concat('/certificate/update'), { data }) || 'Couldnt communicate'

        const date = new Date(response.data.timestamp * 1000)

        const transactionData = {
            "enrollmentNumber": metadata.enrollmentNumber,
            "cedula": metadata.ownerId,
            "tx_hash": response.data.txHash,
            "price": response.data.fee,
            "prevOwner": response.data.prevOwner,
            "actualOwner": response.data.currentOwner,
            "status": response.data.status,
            "timeStamp": date,
            "actValue": metadata.actValue,
            "description": metadata.description,
            "adminId": isAdmin.cedula,
            "city": metadata.city,
            "type": "CTRA"
        }

        console.log(transactionData)
        await transactionModel.create(transactionData)
        return res.status(201).json({ message: "Certificate updated sucefully!" })

    } catch (error) {
        console.log(error)
        return res.status(500).json({ message: 'Server internal error' })

    }

}


controller.verInfoTransaction = async (req, res) => {
    if (req.query.enrollmentNumber) {
        if (!await auth.verifyToken(req, res)) { return res.sendStatus(401) }
        const transaction = await transactionModel.find({ enrollmentNumber: req.query.enrollmentNumber }, '-tx_hash')
        createPDFTIL(transaction)
        res.download('src/outputs/salida.pdf')
    } else {
        if (!req.query.cedula) { return res.sendStatus(400) }
        if (!await auth.verifyToken(req, res)) { return res.sendStatus(401) }
        try {
            const certificados = await transactionModel.find({ cedula: req.query.cedula }, '-tx_hash')
            return res.status(200).json({ certificados: certificados })
        } catch (error) {
            console.log(error)
            return res.status(500).json({ message: 'Server internal error' })
        }
    }

}

controller.createCertificatePQRSD = async (req, res) => {
    if (!req.body.cedula || !req.body.description || !req.body.adminCedula || !req.body.valorActo || !req.body.city) { res.sendStatus(400) }
}



module.exports = controller