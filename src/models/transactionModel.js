const mongoose = require('mongoose')

const transactionSchema = new mongoose.Schema({
    enrollmentNumber: { type: String, required: true },
    cedula: { type: String, required: true },
    tx_hash: { type: String, required: true, unique: true },
    price: { type: String, required: true },
    prevOwner: { type: String, default: '' },
    actualOwner: { type: String, required: true },
    status: { type: String, required: true },
    timeStamp: { type: Number, required: true },
    description: { type: String, required: true },
    actValue: { type: String, required: true },
    adminId: { type: String, required: true },
    city: { type: String, required: true },
    type: {
        type: String,
        enum: ['CTRA', 'PQRSD'],
    },
})


module.exports = mongoose.model('transactions', transactionSchema)