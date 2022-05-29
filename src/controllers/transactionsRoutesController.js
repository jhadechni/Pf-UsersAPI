controller = {}
const userModel = require('../models/userModel')
const transactionModel = require('../models/transactionModel')
const crypto = require('crypto')
const axios = require('axios')
const auth = require('../config/auth')
const { infoTransactionQuery } = require('../queries/pipelines')
const { createPDFTIL, createPDFPQRSD } = require('../config/filesCreation')

//TIL Certificates
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
            "b_tk_id": response.data.tokenId,
            "price": response.data.fee,
            "prevOwner": response.data.prevOwner,
            "actualOwner": response.data.currentOwner,
            "status": response.data.status,
            "timeStamp": date,
            "actValue": metadata.actValue,
            "description": metadata.description,
            "adminId": isAdmin.cedula,
            "city": metadata.city,
            "metadata": metadata,
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
        if (!req.body.cedula || !req.body.description || !req.body.adminCedula || !req.body.valorActo || !req.body.city || !req.body.enrollmentNumber) { return res.sendStatus(400) }

        const isAdmin = await userModel.findOne({ cedula: req.body.adminCedula })

        const user = await userModel.findOne({ cedula: req.body.cedula })

        const certificate = await transactionModel.findOne({ enrollmentNumber: req.body.enrollmentNumber })

        if (!isAdmin || !user || !certificate) { return res.status(404).json({ message: 'User, admin or certificate not found' }) }

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
            "b_tk_id": data.tokenId,
            "price": response.data.fee,
            "prevOwner": response.data.prevOwner,
            "actualOwner": response.data.currentOwner,
            "status": response.data.status,
            "timeStamp": date,
            "actValue": metadata.actValue,
            "description": metadata.description,
            "adminId": isAdmin.cedula,
            "city": metadata.city,
            "metadata": metadata,
            "type": "CTRA"
        }

        console.log(transactionData)
        await transactionModel.create(transactionData)
        return res.status(200).json({ message: "Certificate updated sucefully!" })

    } catch (error) {
        console.log(error)
        return res.status(500).json({ message: 'Server internal error' })

    }

}

controller.verInfoTransaction = async (req, res) => {

    if (req.query.enrollmentNumber) {

        if (!await auth.verifyToken(req, res)) { return res.sendStatus(401) }

        const transactions = await transactionModel.find({ enrollmentNumber: req.query.enrollmentNumber }, '-tx_hash')

        if (transactions.length === 0) { return res.status(404).json({ message: 'Certificate with this enrollmentNumber doesnt exist.' }) }

        const pdf = await createPDFTIL(transactions)

        res.setHeader('Content-Type', 'application/pdf')
        return res.status(200).end(pdf)

    } else {

        if (!req.query.cedula) { return res.sendStatus(400) }

        const user = await userModel.findOne({ cedula: req.query.cedula })

        if (!user) { return res.status(404).json({ message: 'No user found' }) }

        if (!await auth.verifyToken(req, res)) { return res.sendStatus(401) }

        try {
            const certificados = await transactionModel.aggregate(infoTransactionQuery(req.query.cedula, 'CTRA'))

            if (certificados.length === 0) { return res.status(404).json({ message: 'No certificates found for this user' }) }

            return res.status(200).json({ certificados: certificados })

        } catch (error) {

            console.log(error)
            return res.status(500).json({ message: 'Server internal error' })

        }
    }

}

controller.verInfoAllTransactions = async (req, res) => {
    try {

        if (!req.query.cedula) { return res.sendStatus(400) }

        if (!await auth.verifyToken(req, res)) { return res.sendStatus(401) }

        const certificados = await transactionModel.find({ cedula: req.query.cedula })

        if (certificados.length === 0) { return res.status(404).json({ message: 'No certificates found for this user' }) }

        return res.status(200).json({ certificados: certificados })

    } catch (error) {

        console.log(error)

        return res.status(500).json({ message: "Server internal error" })

    }
}

controller.transferCertificateTIL = async (req, res) => {
    try {
        if (!req.body.actualCedula || !req.body.newCedula || !req.body.description || !req.body.adminCedula || !req.body.valorActo || !req.body.city || !req.body.enrollmentNumber) { return res.sendStatus(400) }

        const isAdmin = await userModel.findOne({ cedula: req.body.adminCedula })

        const user = await userModel.findOne({ cedula: req.body.actualCedula })

        const newUser = await userModel.findOne({ cedula: req.body.newCedula })

        const certificate = await transactionModel.find({ enrollmentNumber: req.body.enrollmentNumber }).sort({ timeStamp: -1 })

        if (!await auth.verifyToken(req, res)) { return res.sendStatus(401) }

        if (!isAdmin || !user || !certificate[0] || !newUser) { return res.status(404).json({ message: 'Users, admin or certificate not found' }) }

        console.log('user', user)
        console.log('new user', newUser)
        console.log('certificate 0', certificate[0])

        if (isAdmin.role != "ADMIN") { return res.status(403).json({ message: 'Action not allowed' }) }

        if (user.blockchain_PK != certificate[0].actualOwner) { return res.status(403).json({ message: 'This certificate doesnt belong to this user' }) }

        const metadata = {
            "enrollmentNumber": req.body.enrollmentNumber,
            "ownerId": newUser.cedula,
            "adminId": isAdmin.cedula,
            "description": req.body.description,
            "actValue": req.body.valorActo,
            "city": req.body.city
        }

        const data = {
            "fromPk": user.blockchain_PK,
            "toPk": newUser.blockchain_PK,
            "metadata": metadata,
            "tokenId": certificate[0].b_tk_id,
        }

        console.log(data)

        const response = await axios.post(process.env.BLOCKCHAIN_API_URI.concat('/certificate/transfer'), { data }) || 'Couldnt communicate'

        const date = new Date(response.data.timestamp * 1000)

        const transactionData = {
            "enrollmentNumber": metadata.enrollmentNumber,
            "cedula": metadata.ownerId,
            "tx_hash": response.data.txHash,
            "b_tk_id": data.tokenId,
            "price": response.data.fee,
            "prevOwner": response.data.prevOwner,
            "actualOwner": response.data.currentOwner,
            "status": response.data.status,
            "timeStamp": date,
            "actValue": metadata.actValue,
            "description": metadata.description,
            "adminId": isAdmin.cedula,
            "city": metadata.city,
            "metadata": metadata,
            "type": "CTRA"
        }


        await transactionModel.create(transactionData)
        return res.status(200).json({ message: "Certificate tranfered sucefully!" })

    } catch (error) {
        console.log(error)
        return res.status(500).json({ message: 'Server internal error' })

    }
}

//PQRSD Certificates
controller.createCertificatePQRSD = async (req, res) => {
    if (!req.body.cedula || !req.body.description
        || !req.body.type || !req.body.enrollmentNumber
        || !req.body.phoneNumber || !req.body.address
        || !req.body.applicationSite) { return res.sendStatus(400) }

    const user = await userModel.findOne({ cedula: req.body.cedula })

    if (!user) { return res.status(404).json({ message: 'User or admin not found' }) }

    if (!await auth.verifyToken(req, res)) { return res.sendStatus(401) }

    const enrollmentNumber = crypto.randomBytes(7).toString('hex')

    //TODO: view metadata 
    const metadata = {
        "enrollmentNumber": enrollmentNumber,
        "ownerId": user.cedula,
        "description": req.body.description,
        "type": req.body.type,
        "phoneNumber": req.body.phoneNumber,
        "address": req.body.address,
        "applicationSite": req.body.applicationSite,
        "city": req.body.city,
        "status": "Creado"
    }

    const data = {
        "ownerPk": user.blockchain_PK
    }

    const response = await axios.post(process.env.BLOCKCHAIN_API_URI.concat('/PQRSD/create'), { data }) || 'Couldnt communicate'

    const date = new Date(response.data.timestamp * 1000)

    const transactionData = {
        "enrollmentNumber": enrollmentNumber,
        "cedula": metadata.ownerId,
        "tx_hash": response.data.txHash,
        "b_tk_id": response.data.tokenId,
        "price": response.data.fee,
        "prevOwner": metadata.ownerId,
        "actualOwner": metadata.ownerId,
        "status": metadata.status,
        "timeStamp": date,
        "actValue": metadata.actValue,
        "description": metadata.description,
        "adminId": "X",
        "city": metadata.city,
        "metadata": metadata,
        "type": "PQRSD"
    }

    console.log(transactionData)
    await transactionModel.create(transactionData)
    return res.status(201).json({ message: "PQRSD created sucefully!" })

}

controller.modifyStatusPQRSD = async (req, res) => {

    if (!req.body.enrollmentNumber || !req.body.newStatus || !req.body.cedula || !req.body.cedulaAdmin) { return res.sendStatus(400) }

    if (!await auth.verifyToken(req, res)) { return res.sendStatus(401) }

    const user = await userModel.findOne({ cedula: req.body.cedula })

    const isAdmin = await userModel.findOne({ cedula: req.body.adminCedula })

    const certificate = await transactionModel.findOne({ enrollmentNumber: req.body.enrollmentNumber })

    if (!user || !certificate || !isAdmin) { return res.status(404).json({ message: 'User, admin or certificate not found' }) }

    if (isAdmin.role != "ADMIN") { return res.status(403).json({ message: 'Action not allowed' }) }

    if (certificate.metadata.status === "Cerrado") { return res.status(403).json({ message: 'PQRSD already closed' }) }

    const metadata = {
        "enrollmentNumber": req.body.enrollmentNumber,
        "ownerId": user.cedula,
        "description": certificate.description,
        "type": certificate.metadata.type,
        "phoneNumber": certificate.metadata.phoneNumber,
        "address": certificate.metadata.address,
        "applicationSite": certificate.metadata.applicationSite,
        "city": certificate.metadata.city,
        "status": req.body.status
    }

    const data = {
        "ownerPk": user.blockchain_PK,
        "tokenId": certificate.b_tk_id,
        "newStatus": req.body.newStatus
    }

    //WAITING FOR ENDPOINT
    const response = await axios.put(process.env.BLOCKCHAIN_API_URI.concat('/PQRSD/update'), { data }) || 'Couldnt communicate'

    const date = new Date(response.data.timestamp * 1000)

    const transactionData = {
        "enrollmentNumber": enrollmentNumber,
        "cedula": metadata.ownerId,
        "tx_hash": response.data.txHash,
        "b_tk_id": response.data.tokenId,
        "price": response.data.fee,
        "prevOwner": metadata.ownerId,
        "actualOwner": metadata.ownerId,
        "status": metadata.status,
        "timeStamp": date,
        "actValue": metadata.actValue,
        "description": metadata.description,
        "adminId": "X",
        "city": metadata.city,
        "metadata": metadata,
        "type": "PQRSD"
    }

    console.log(transactionData)
    await transactionModel.create(transactionData)
    return res.status(201).json({ message: "Certificate created sucefully!" })

}

controller.closePQRSD = async (req, res) => {
    if (!req.body.enrollmentNumber || !req.body.cedula || !req.body.cedulaAdmin) { return res.sendStatus(400) }

    if (!await auth.verifyToken(req, res)) { return res.sendStatus(401) }

    const user = await userModel.findOne({ cedula: req.body.cedula })

    const isAdmin = await userModel.findOne({ cedula: req.body.adminCedula })

    const certificate = await transactionModel.findOne({ enrollmentNumber: req.body.enrollmentNumber })

    if (!user || !certificate || !isAdmin) { return res.status(404).json({ message: 'User, admin or certificate not found' }) }

    if (isAdmin.role != "ADMIN") { return res.status(403).json({ message: 'Action not allowed' }) }

    const metadata = {
        "enrollmentNumber": req.body.enrollmentNumber,
        "ownerId": user.cedula,
        "description": certificate.description,
        "type": certificate.metadata.type,
        "phoneNumber": certificate.metadata.phoneNumber,
        "address": certificate.metadata.address,
        "applicationSite": certificate.metadata.applicationSite,
        "city": certificate.metadata.city,
        "status": "Cerrado"
    }

    const data = {
        "ownerPk": user.blockchain_PK,
        "tokenId": certificate.b_tk_id
    }

    const response = await axios.put(process.env.BLOCKCHAIN_API_URI.concat('/PQRSD/update'), { data }) || 'Couldnt communicate'

    const date = new Date(response.data.timestamp * 1000)

    const transactionData = {
        "enrollmentNumber": enrollmentNumber,
        "cedula": metadata.ownerId,
        "tx_hash": response.data.txHash,
        "b_tk_id": response.data.tokenId,
        "price": response.data.fee,
        "prevOwner": metadata.ownerId,
        "actualOwner": metadata.ownerId,
        "status": metadata.status,
        "timeStamp": date,
        "actValue": metadata.actValue,
        "description": metadata.description,
        "adminId": "X",
        "city": metadata.city,
        "metadata": metadata,
        "type": "PQRSD"
    }

    console.log(transactionData)
    await transactionModel.create(transactionData)
    return res.status(201).json({ message: "Certificate created sucefully!" })
}

controller.verInfoTransactionPQRSD = async (req, res) => {

    if (req.query.enrollmentNumber) {

        if (!await auth.verifyToken(req, res)) { return res.sendStatus(401) }

        const transactions = await transactionModel.find({ enrollmentNumber: req.query.enrollmentNumber, type: 'PQRSD' }, '-tx_hash')

        if (transactions.length === 0) { return res.status(404).json({ message: 'Certificate with this enrollmentNumber doesnt exist.' }) }

        const pdf = await createPDFPQRSD(transactions)

        res.setHeader('Content-Type', 'application/pdf')
        return res.status(200).end(pdf)

    } else {

        if (!req.query.cedula) { return res.sendStatus(400) }

        const user = await userModel.findOne({ cedula: req.query.cedula })

        if (!user) { return res.status(404).json({ message: 'No user found' }) }

        if (!await auth.verifyToken(req, res)) { return res.sendStatus(401) }

        try {
            const certificados = await transactionModel.aggregate(infoTransactionQuery(req.query.cedula, 'PQRSD'))

            if (certificados.length === 0) { return res.status(404).json({ message: 'No certificates found for this user' }) }

            return res.status(200).json({ certificados: certificados })

        } catch (error) {

            console.log(error)
            return res.status(500).json({ message: 'Server internal error' })

        }
    }
}




module.exports = controller