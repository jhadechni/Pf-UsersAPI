const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
  name: String,
  surnames: String,
  username: String,
  password: String,
  cedula: String,
  email: String,
  blockchain_PK: { 
    type: String, 
    default: ' ' 
  },
  role: {
    type: String,
    enum: ['USER', 'ADMIN'],
    default: 'USER'
  },
})


module.exports = mongoose.model('users', userSchema)