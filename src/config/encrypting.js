const bcrypt = require('bcrypt')
const controller = {}

controller.cryptPassword = (password) => bcrypt.hashSync(password, bcrypt.genSalt(10))

controller.verifyPassword = (password, hashedPassword) => bcrypt.compareSync(password, hashedPassword)

module.exports = controller