const { Router } = require('express');
const router = Router();
const { createCertificateTIL, verInfoTransaction, updateTILCertificate, verInfoAllTransactions, transferCertificateTIL, verInfoTransactionPQRSD, createCertificatePQRSD, modifyStatusPQRSD, closePQRSD } = require('../controllers/transactionsRoutesController')

router.route('/createCertificate/TIL')
    .post(createCertificateTIL)

router.route('/verInfo/TIL')
    .get(verInfoTransaction)

router.route('/verInfo/All')
    .get(verInfoAllTransactions)

router.route('/updateCertificate/TIL')
    .put(updateTILCertificate)

router.route('/transfer/TIL')
    .post(transferCertificateTIL)

//PQRSD
router.route('/createCertificate/PQRSD')
    .post(createCertificatePQRSD)

router.route('/modifyStatus/PQRSD')
    .put(modifyStatusPQRSD)

router.route('/closePQRSD')
    .put(closePQRSD)

router.route('/verInfo/PQRSD')
    .get(verInfoTransactionPQRSD)

module.exports = router;