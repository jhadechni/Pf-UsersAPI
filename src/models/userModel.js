const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  surnames: { type: String, required: true },
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  cedula: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  blockchain_PK: {
    type: String,
    default: '',
    required: true
  },
  walletPublicAddress: { type: String, default: '', required: true },
  role: {
    type: String,
    enum: ['USER', 'ADMIN'],
    default: 'USER'
  },
})


module.exports = mongoose.model('users', userSchema)