const { Router } = require('express');
const router = Router();
const {defaultRoute, info} = require('../controllers/defaultRoutesController')

router.route('/')
      .get(defaultRoute)

router.route('/info')
      .get(info)


module.exports = router;