controller = {}
const userModel = require('../models/userModel')
const transactionModel = require('../models/transactionModel')
const crypto = require('crypto')
const axios = require('axios')
const { createPDFTIL } = require('../config/filesCreation')



controller.createCertificateTIL = async (req, res) => {
    if (!req.body.cedula || !req.body.description || !req.body.adminCedula || !req.body.valorActo || !req.body.city) { res.sendStatus(400) }
    const isAdmin = await userModel.findOne({ cedula: req.body.adminCedula })
    if (isAdmin.role != "ADMIN") { res.status(403).send({ message: 'Action not allowed' }) }
    try {
        if (!await auth.verifyToken(req, res)) { res.sendStatus(401) }
        const user = await userModel.find({ cedula: req.body.cedula })
        const enrollmentNumber = crypto.randomBytes(7).toString('hex')

        const metadata = {
            "enrollmentNumber": enrollmentNumber,
            "ownerId": user.cedula,
            "adminId": isAdmin.cedula,
            "description": req.body.description,
            "actValue": req.body.valorActo,
            "city": req.body.city
        }

        const payload = {
            "metadata": metadata,
            "ownerPk": user.blockchain_PK,
            "authPk": isAdmin.blockchain_PK
        }

        const response = await axios.post(process.env.BLOCKCHAIN_API_URI.concat('/certificate/create'), { payload }) || 'Couldnt communicate'

        const transactionData = {
            "enrollmentNumber": enrollmentNumber,
            "cedula": metadata.ownerId,
            "tx_hash": response.data.txHash,
            "price": response.data.fee,
            "prevOwner": response.data.prevOwner,
            "actualOwner": response.data.currentOwner,
            "status": response.data.status,
            "timeStamp": response.data.date,
            "actValue": metadata.actValue,
            "description": metadata.description,
            "adminId": isAdmin.cedula,
            "type": "CTRA"
        }

        await transactionModel.create(transactionData)
        res.status(201).json({ message: "Certificate created sucefully!" })

    } catch (error) {

        console.log(error)
        res.status(500).json({ message: 'Server internal error' })

    }
}

controller.updateTILCertificate = async (req, res) => {

}


controller.verInfoTransaction = async (req, res) => {
    if (req.query.enrollmentNumber) {
        if (!await auth.verifyToken(req, res)) { res.sendStatus(401) }
        const transaction = await transactionModel.find({ enrollmentNumber: req.query.enrollmentNumber }, '-tx_hash')
        createPDFTIL(transaction)
        res.download('./salida.pdf')
    } else {
        if (!req.query.cedula) { res.sendStatus(400) }
        if (!await auth.verifyToken(req, res)) { res.sendStatus(401) }
        try {
            const certificados = await transactionModel.find({ cedula: req.query.cedula }, '-tx_hash')
            res.status(200).json({ certificados: certificados })
        } catch (error) {
            console.log(error)
            res.status(500).json({ message: 'Server internal error' })
        }
    }

}

controller.createCertificatePQRSD = async (req,res) => {
    if (!req.body.cedula || !req.body.description || !req.body.adminCedula || !req.body.valorActo || !req.body.city) { res.sendStatus(400) }
}



module.exports = controller