const mongoose = require('mongoose')

const certificadoTILSchema = new mongoose.Schema({
  enrollmentNumber: {String, required: true},
  folioStatus: {Boolean, required: true},
  actorsIds: {String, required: true},
  description: {String, required: true},
  cedula: {String, required: true},
})


module.exports = mongoose.model('certificadosTIL', certificadoTILSchema)