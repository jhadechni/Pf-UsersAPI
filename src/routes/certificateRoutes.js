const { Router } = require('express');
const router = Router();
const { createCertificateTIL, verInfoTransaction } = require('../controllers/transactionsRoutesController')

router.route('/createCertificate/TIL')
    .post(createCertificateTIL)

router.route('/verInfo/TIL')
    .get(verInfoTransaction)


module.exports = router;