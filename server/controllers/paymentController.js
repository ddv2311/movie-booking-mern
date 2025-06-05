const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY || 'sk_test_default_key_replace_this')
const Razorpay = require('razorpay')
const Showtime = require('../models/Showtime')
const User = require('../models/User')

// Initialize Razorpay
const razorpay = new Razorpay({
	key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_default',
	key_secret: process.env.RAZORPAY_KEY_SECRET || 'default_secret'
})

//@desc     Create payment intent (Stripe & Razorpay)
//@route    POST /payment/create-intent
//@access   Private
exports.createPaymentIntent = async (req, res, next) => {
	try {
		console.log('Creating payment intent...')
		console.log('Stripe key available:', !!process.env.STRIPE_SECRET_KEY)
		console.log('Razorpay key available:', !!process.env.RAZORPAY_KEY_ID)
		console.log('Request body:', req.body)
		console.log('User:', req.user?.username)
		console.log('Authorization header:', req.headers.authorization)
		
		// Validate required fields
		const { showtimeId, seats, paymentMethod = 'razorpay' } = req.body
		
		if (!showtimeId) {
			return res.status(400).json({ success: false, message: 'Showtime ID is required' })
		}
		
		if (!seats || !Array.isArray(seats) || seats.length === 0) {
			return res.status(400).json({ success: false, message: 'Seats are required' })
		}
		
		const user = req.user
		
		if (!user) {
			return res.status(401).json({ success: false, message: 'User authentication required' })
		}

		// Validate showtime and seats
		const showtime = await Showtime.findById(showtimeId)
			.populate('movie')
			.populate({ path: 'theater', populate: { path: 'cinema', select: 'name' }, select: 'number cinema seatPlan' })

		if (!showtime) {
			return res.status(400).json({ success: false, message: `Showtime not found with id of ${showtimeId}` })
		}

		// Validate seat availability (same logic as purchase)
		const isSeatValid = seats.every((seatNumber) => {
			const [row, number] = seatNumber.match(/([A-Za-z]+)(\d+)/).slice(1)
			const maxRow = showtime.theater.seatPlan.row
			const maxCol = showtime.theater.seatPlan.column

			if (maxRow.length !== row.length) {
				return maxRow.length > row.length
			}

			return maxRow.localeCompare(row) >= 0 && number <= maxCol
		})

		if (!isSeatValid) {
			return res.status(400).json({ success: false, message: 'Seat is not valid' })
		}

		const isSeatAvailable = seats.every((seatNumber) => {
			const [row, number] = seatNumber.match(/([A-Za-z]+)(\d+)/).slice(1)
			return !showtime.seats.some((seat) => seat.row === row && seat.number === parseInt(number, 10))
		})

		if (!isSeatAvailable) {
			return res.status(400).json({ success: false, message: 'Seat not available' })
		}

		// Calculate amount (₹300 per seat for Indian market)
		const pricePerSeatINR = 300 // ₹300 per seat
		const pricePerSeatUSD = 1000 // $10 per seat in cents
		
		if (paymentMethod === 'razorpay') {
			// Razorpay payment (Indian Rupees)
			const totalAmountINR = seats.length * pricePerSeatINR * 100 // Razorpay expects amount in paise
			
			const razorpayOrder = await razorpay.orders.create({
				amount: totalAmountINR,
				currency: 'INR',
				receipt: `receipt_${Date.now()}`,
				notes: {
					userId: user._id.toString(),
					showtimeId: showtimeId,
					seats: JSON.stringify(seats),
					movieName: showtime.movie.name,
					theaterInfo: `${showtime.theater.cinema.name} - Theater ${showtime.theater.number}`,
					showtime: showtime.showtime.toISOString()
				}
			})

			res.status(200).json({
				success: true,
				paymentMethod: 'razorpay',
				orderId: razorpayOrder.id,
				amount: totalAmountINR,
				currency: 'INR',
				key: process.env.RAZORPAY_KEY_ID,
				prefill: {
					name: user.username,
					email: user.email
				}
			})
		} else if (paymentMethod === 'stripe') {
			// Stripe payment (USD)
			const totalAmountUSD = seats.length * pricePerSeatUSD
			
			const paymentIntent = await stripe.paymentIntents.create({
				amount: totalAmountUSD,
				currency: 'usd',
				metadata: {
					userId: user._id.toString(),
					showtimeId: showtimeId,
					seats: JSON.stringify(seats),
					movieName: showtime.movie.name,
					theaterInfo: `${showtime.theater.cinema.name} - Theater ${showtime.theater.number}`,
					showtime: showtime.showtime.toISOString()
				}
			})

			res.status(200).json({
				success: true,
				paymentMethod: 'stripe',
				clientSecret: paymentIntent.client_secret,
				paymentIntentId: paymentIntent.id,
				amount: totalAmountUSD,
				currency: 'USD'
			})
		} else {
			return res.status(400).json({ success: false, message: 'Invalid payment method' })
		}
	} catch (err) {
		console.error('Payment intent creation error:', err)
		console.error('Error details:', {
			message: err.message,
			stack: err.stack,
			code: err.code,
			type: err.type
		})
		
		let errorMessage = 'Failed to create payment intent'
		
		if (err.message) {
			errorMessage = err.message
		}
		
		// Check for specific Razorpay/Stripe errors
		if (err.error && err.error.description) {
			errorMessage = err.error.description
		}
		
		console.log('Sending error response:', errorMessage)
		res.status(400).json({ success: false, message: errorMessage })
	}
}

//@desc     Confirm payment and complete booking
//@route    POST /payment/confirm
//@access   Private
exports.confirmPayment = async (req, res, next) => {
	try {
		const { paymentIntentId } = req.body
		const user = req.user

		// Retrieve payment intent from Stripe
		const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId)

		if (paymentIntent.status !== 'succeeded') {
			return res.status(400).json({ success: false, message: 'Payment not completed' })
		}

		// Extract booking details from metadata
		const { userId, showtimeId, seats: seatsJson } = paymentIntent.metadata
		const seats = JSON.parse(seatsJson)

		// Verify user matches
		if (userId !== user._id.toString()) {
			return res.status(400).json({ success: false, message: 'Payment user mismatch' })
		}

		// Get showtime and verify seats are still available
		const showtime = await Showtime.findById(showtimeId).populate({ path: 'theater', select: 'seatPlan' })

		if (!showtime) {
			return res.status(400).json({ success: false, message: 'Showtime not found' })
		}

		// Double-check seat availability
		const isSeatAvailable = seats.every((seatNumber) => {
			const [row, number] = seatNumber.match(/([A-Za-z]+)(\d+)/).slice(1)
			return !showtime.seats.some((seat) => seat.row === row && seat.number === parseInt(number, 10))
		})

		if (!isSeatAvailable) {
			return res.status(400).json({ success: false, message: 'Seats no longer available' })
		}

		// Book the seats (same logic as original purchase)
		const seatUpdates = seats.map((seatNumber) => {
			const [row, number] = seatNumber.match(/([A-Za-z]+)(\d+)/).slice(1)
			return { row, number: parseInt(number, 10), user: user._id }
		})

		showtime.seats.push(...seatUpdates)
		const updatedShowtime = await showtime.save()

		// Add tickets to user
		const updatedUser = await User.findByIdAndUpdate(
			user._id,
			{
				$push: { 
					tickets: { 
						showtime, 
						seats: seatUpdates,
						paymentIntentId: paymentIntentId,
						totalAmount: paymentIntent.amount,
						paymentDate: new Date()
					} 
				}
			},
			{ new: true }
		)

		res.status(200).json({ 
			success: true, 
			data: updatedShowtime, 
			updatedUser,
			paymentDetails: {
				amount: paymentIntent.amount,
				currency: paymentIntent.currency,
				paymentIntentId: paymentIntentId
			}
		})
	} catch (err) {
		console.error('Payment confirmation error:', err)
		res.status(400).json({ success: false, message: 'Failed to confirm payment' })
	}
}

//@desc     Confirm Razorpay payment and complete booking
//@route    POST /payment/confirm-razorpay
//@access   Private
exports.confirmRazorpayPayment = async (req, res, next) => {
	try {
		const { orderId, paymentId, signature, showtimeId, seats } = req.body
		const user = req.user

		// Verify Razorpay payment signature
		const crypto = require('crypto')
		const body = orderId + "|" + paymentId
		const expectedSignature = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
			.update(body.toString())
			.digest('hex')

		if (expectedSignature !== signature) {
			return res.status(400).json({ success: false, message: 'Invalid payment signature' })
		}

		// Get showtime and verify seats are still available
		const showtime = await Showtime.findById(showtimeId).populate({ path: 'theater', select: 'seatPlan' })

		if (!showtime) {
			return res.status(400).json({ success: false, message: 'Showtime not found' })
		}

		// Double-check seat availability
		const isSeatAvailable = seats.every((seatNumber) => {
			const [row, number] = seatNumber.match(/([A-Za-z]+)(\d+)/).slice(1)
			return !showtime.seats.some((seat) => seat.row === row && seat.number === parseInt(number, 10))
		})

		if (!isSeatAvailable) {
			return res.status(400).json({ success: false, message: 'Seats no longer available' })
		}

		// Book the seats
		const seatUpdates = seats.map((seatNumber) => {
			const [row, number] = seatNumber.match(/([A-Za-z]+)(\d+)/).slice(1)
			return { row, number: parseInt(number, 10), user: user._id }
		})

		showtime.seats.push(...seatUpdates)
		const updatedShowtime = await showtime.save()

		// Calculate amount for storage
		const pricePerSeat = 300 // ₹300 per seat
		const totalAmount = seats.length * pricePerSeat * 100 // in paise

		// Add tickets to user
		const updatedUser = await User.findByIdAndUpdate(
			user._id,
			{
				$push: { 
					tickets: { 
						showtime, 
						seats: seatUpdates,
						paymentIntentId: paymentId,
						totalAmount: totalAmount,
						paymentDate: new Date(),
						paymentMethod: 'razorpay',
						currency: 'INR'
					} 
				}
			},
			{ new: true }
		)

		res.status(200).json({ 
			success: true, 
			data: updatedShowtime, 
			updatedUser,
			paymentDetails: {
				amount: totalAmount,
				currency: 'INR',
				paymentId: paymentId,
				orderId: orderId
			}
		})
	} catch (err) {
		console.error('Razorpay payment confirmation error:', err)
		res.status(400).json({ success: false, message: 'Failed to confirm Razorpay payment' })
	}
} 