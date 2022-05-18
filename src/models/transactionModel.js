const mongoose = require('mongoose')

const transactionSchema = new mongoose.Schema({
    cedula: { type: String, required: true, unique: true },
    tx_hash: { type: String, required: true, unique: true },
    price: { type: String, required: true },
    prevOwner: { type: String, required: true },
    actualOwner: { type: String, required: true },
    status: { type: String, required: true },
    type: {
        type: String,
        enum: ['CTRA', 'PQRSD'],
    },
})


module.exports = mongoose.model('transactions', transactionSchema)