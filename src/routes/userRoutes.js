const { Router } = require('express');
const router = Router();
const {register, login, getUser, consultarAcciones, editInfo} = require('../controllers/userRoutesController')

//SEARCH USER
router.route('/')
      .get(getUser)

//VIEW USER ACTIONS
router.route('/edit')
      .post(editInfo)

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