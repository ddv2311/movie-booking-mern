import React, { useState } from 'react'
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js'
import { CreditCardIcon } from '@heroicons/react/24/outline'
import { toast } from 'react-toastify'
import axios from 'axios'

const PaymentForm = ({ clientSecret, paymentIntentId, onPaymentSuccess, totalAmount, isProcessing, setIsProcessing }) => {
	const stripe = useStripe()
	const elements = useElements()
	const [error, setError] = useState(null)

	const handleSubmit = async (event) => {
		event.preventDefault()

		if (!stripe || !elements) {
			return
		}

		setIsProcessing(true)
		setError(null)

		const card = elements.getElement(CardElement)

		const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
			payment_method: {
				card: card,
			}
		})

		if (error) {
			setError(error.message)
			setIsProcessing(false)
			toast.error(error.message, {
				position: 'top-center',
				autoClose: 3000,
				pauseOnHover: false
			})
		} else {
			// Payment succeeded, confirm with backend
			try {
				const response = await axios.post('/payment/confirm', {
					paymentIntentId: paymentIntent.id
				})

				if (response.data.success) {
					onPaymentSuccess(response.data)
				}
			} catch (backendError) {
				console.error('Backend confirmation error:', backendError)
				setError('Payment succeeded but booking confirmation failed. Please contact support.')
				toast.error('Payment succeeded but booking confirmation failed. Please contact support.', {
					position: 'top-center',
					autoClose: 5000,
					pauseOnHover: false
				})
			} finally {
				setIsProcessing(false)
			}
		}
	}

	const cardElementOptions = {
		style: {
			base: {
				fontSize: '16px',
				color: '#424770',
				'::placeholder': {
					color: '#aab7c4',
				},
			},
			invalid: {
				color: '#9e2146',
			},
		},
	}

	return (
		<div className="w-full max-w-md mx-auto">
			<div className="bg-white rounded-lg shadow-lg p-6">
				<div className="flex items-center justify-center mb-4">
					<CreditCardIcon className="h-8 w-8 text-blue-600 mr-2" />
					<h3 className="text-xl font-semibold text-gray-900">Complete Payment</h3>
				</div>

				<div className="mb-4 p-3 bg-gray-50 rounded-md">
					<p className="text-sm text-gray-600">Total Amount:</p>
					<p className="text-2xl font-bold text-gray-900">${(totalAmount / 100).toFixed(2)}</p>
				</div>

				<form onSubmit={handleSubmit}>
					<div className="mb-4">
						<label className="block text-sm font-medium text-gray-700 mb-2">
							Card Information
						</label>
						<div className="p-3 border border-gray-300 rounded-md bg-white">
							<CardElement options={cardElementOptions} />
						</div>
					</div>

					{error && (
						<div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
							<p className="text-sm text-red-600">{error}</p>
						</div>
					)}

					<button
						type="submit"
						disabled={!stripe || isProcessing}
						className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-md hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
					>
						{isProcessing ? (
							<div className="flex items-center justify-center">
								<div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
								Processing Payment...
							</div>
						) : (
							`Pay $${(totalAmount / 100).toFixed(2)}`
						)}
					</button>
				</form>

				<div className="mt-4 text-center">
					<p className="text-xs text-gray-500">
						Powered by <span className="font-semibold">Stripe</span> • Your payment is secure
					</p>
				</div>
			</div>
		</div>
	)
}

export default PaymentForm 