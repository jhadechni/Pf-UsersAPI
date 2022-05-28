const { Router } = require('express');
const router = Router();
const { createCertificateTIL, verInfoTransaction, updateTILCertificate, verInfoAllTransactions, transferCertificateTIL } = require('../controllers/transactionsRoutesController')

router.route('/createCertificate/TIL')
    .post(createCertificateTIL)

router.route('/verInfo/TIL')
    .get(verInfoTransaction)

router.route('/verInfo/TIL/All')
    .get(verInfoAllTransactions)

router.route('/updateCertificate/TIL')
    .put(updateTILCertificate)

router.route('/transfer/TIL')
    .post(transferCertificateTIL)

module.exports = router;