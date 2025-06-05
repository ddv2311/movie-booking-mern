const express = require('express')
const { createPaymentIntent, confirmPayment, confirmRazorpayPayment } = require('../controllers/paymentController')

const router = express.Router()

const { protect } = require('../middleware/auth')

router.post('/create-intent', protect, createPaymentIntent)
router.post('/confirm', protect, confirmPayment)
router.post('/confirm-razorpay', protect, confirmRazorpayPayment)

module.exports = router 