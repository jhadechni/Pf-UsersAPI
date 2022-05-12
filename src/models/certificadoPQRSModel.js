const mongoose = require('mongoose')

const certificadoPQRSSchema = new mongoose.Schema({
    type: {
        type: String,
        required: true,
        enum: ['PETICION', 'QUEJA', 'RECLAMO', 'DENUNCIA']
    },
    folioStatus: { type: Boolean, required: true },
    names: { type: String, required: true },
    phoneNumber: { type: String, required: true },
    email: { type: String, required: true },
    aplicationSite: {
        type: String,
        required: true,
        enum: ['OFICINA DE INSTRUMENTOS PUBLICOS', 'NOTARIA', 'CURADURIA', 'GESTOR CASTRAL']
    }
})


module.exports = mongoose.model('certificadosPQRS', certificadoPQRSSchema)