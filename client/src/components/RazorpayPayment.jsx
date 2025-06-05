import React, { useState } from 'react'
import { CreditCardIcon, DevicePhoneMobileIcon, BanknotesIcon } from '@heroicons/react/24/outline'
import { toast } from 'react-toastify'
import axios from 'axios'

const RazorpayPayment = ({ paymentData, onPaymentSuccess, isProcessing, setIsProcessing, showtimeId, selectedSeats }) => {
	const [error, setError] = useState(null)

	const loadRazorpay = () => {
		return new Promise((resolve) => {
			const script = document.createElement('script')
			script.src = 'https://checkout.razorpay.com/v1/checkout.js'
			script.onload = () => {
				resolve(true)
			}
			script.onerror = () => {
				resolve(false)
			}
			document.body.appendChild(script)
		})
	}

	const handleRazorpayPayment = async () => {
		const res = await loadRazorpay()

		if (!res) {
			toast.error('Razorpay SDK failed to load. Are you online?', {
				position: 'top-center',
				autoClose: 3000,
				pauseOnHover: false
			})
			return
		}

		setIsProcessing(true)
		setError(null)

		const options = {
			key: paymentData.key,
			amount: paymentData.amount,
			currency: paymentData.currency,
			name: 'CineBooking',
			description: 'Movie Ticket Booking',
			order_id: paymentData.orderId,
			prefill: paymentData.prefill,
			theme: {
				color: '#3B82F6'
			},
			method: {
				upi: true,
				card: true,
				wallet: true,
				netbanking: true
			},
			handler: async function (response) {
				try {
					// Verify payment with backend
					const verifyResponse = await axios.post('/payment/confirm-razorpay', {
						orderId: response.razorpay_order_id,
						paymentId: response.razorpay_payment_id,
						signature: response.razorpay_signature,
						showtimeId: showtimeId,
						seats: selectedSeats
					})

					if (verifyResponse.data.success) {
						onPaymentSuccess(verifyResponse.data)
					} else {
						throw new Error('Payment verification failed')
					}
				} catch (error) {
					console.error('Payment verification error:', error)
					setError('Payment verification failed. Please contact support.')
					toast.error('Payment verification failed. Please contact support.', {
						position: 'top-center',
						autoClose: 5000,
						pauseOnHover: false
					})
				} finally {
					setIsProcessing(false)
				}
			},
			modal: {
				ondismiss: function () {
					setIsProcessing(false)
					toast.info('Payment cancelled', {
						position: 'top-center',
						autoClose: 2000,
						pauseOnHover: false
					})
				}
			}
		}

		const paymentObject = new window.Razorpay(options)
		paymentObject.open()
	}

	return (
		<div className="w-full max-w-md mx-auto">
			<div className="bg-white rounded-lg shadow-lg p-6">
				<div className="flex items-center justify-center mb-4">
					<img 
						src="https://razorpay.com/assets/razorpay-logo.svg" 
						alt="Razorpay" 
						className="h-8 mr-2"
					/>
					<h3 className="text-xl font-semibold text-gray-900">Indian Payment Options</h3>
				</div>

				<div className="mb-4 p-3 bg-gray-50 rounded-md">
					<p className="text-sm text-gray-600">Total Amount:</p>
					<p className="text-2xl font-bold text-gray-900">₹{(paymentData.amount / 100).toFixed(2)}</p>
				</div>

				{/* Payment Methods Info */}
				<div className="mb-6 grid grid-cols-2 gap-3">
					<div className="flex items-center p-3 bg-blue-50 rounded-md">
						<DevicePhoneMobileIcon className="h-6 w-6 text-blue-600 mr-2" />
						<div>
							<p className="text-sm font-medium text-blue-900">UPI</p>
							<p className="text-xs text-blue-700">GPay, PhonePe, Paytm</p>
						</div>
					</div>
					<div className="flex items-center p-3 bg-green-50 rounded-md">
						<CreditCardIcon className="h-6 w-6 text-green-600 mr-2" />
						<div>
							<p className="text-sm font-medium text-green-900">Cards</p>
							<p className="text-xs text-green-700">Debit & Credit</p>
						</div>
					</div>
					<div className="flex items-center p-3 bg-purple-50 rounded-md">
						<BanknotesIcon className="h-6 w-6 text-purple-600 mr-2" />
						<div>
							<p className="text-sm font-medium text-purple-900">Net Banking</p>
							<p className="text-xs text-purple-700">All major banks</p>
						</div>
					</div>
					<div className="flex items-center p-3 bg-orange-50 rounded-md">
						<DevicePhoneMobileIcon className="h-6 w-6 text-orange-600 mr-2" />
						<div>
							<p className="text-sm font-medium text-orange-900">Wallets</p>
							<p className="text-xs text-orange-700">Paytm, Mobikwik</p>
						</div>
					</div>
				</div>

				{error && (
					<div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
						<p className="text-sm text-red-600">{error}</p>
					</div>
				)}

				<button
					onClick={handleRazorpayPayment}
					disabled={isProcessing}
					className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-md hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
				>
					{isProcessing ? (
						<div className="flex items-center justify-center">
							<div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
							Processing Payment...
						</div>
					) : (
						`Pay ₹${(paymentData.amount / 100).toFixed(2)}`
					)}
				</button>

				<div className="mt-4 text-center">
					<p className="text-xs text-gray-500">
						Powered by <span className="font-semibold">Razorpay</span> • Secure Indian Payment Gateway
					</p>
					<p className="text-xs text-gray-400 mt-1">
						Supports UPI, Cards, Net Banking, and Wallets
					</p>
				</div>
			</div>
		</div>
	)
}

export default RazorpayPayment 