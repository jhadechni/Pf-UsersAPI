const { Router } = require('express');
const router = Router();
const {register, login, getUser, consultarAcciones} = require('../controllers/userRoutesController')

//SEARCH USER
router.route('/')
      .get(getUser)

//REGISTER
router.route('/register')
      .post(register)

//LOGIN
router.route('/login')
      .post(login)

//VIEW USER ACTIONS
router.route('/actions')
      .get(consultarAcciones)


module.exports = router;