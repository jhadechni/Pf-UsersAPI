const { Router } = require('express');
const router = Router();
const { createCertificateTIL, verInfoTransaction, updateTILCertificate } = require('../controllers/transactionsRoutesController')

router.route('/createCertificate/TIL')
    .post(createCertificateTIL)

router.route('/verInfo/TIL')
    .get(verInfoTransaction)

router.route('/updateCertificate/TIL')
    .put(updateTILCertificate)

module.exports = router;