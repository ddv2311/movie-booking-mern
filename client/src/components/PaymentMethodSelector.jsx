import React, { useState } from 'react'
import { CreditCardIcon, DevicePhoneMobileIcon, GlobeAltIcon } from '@heroicons/react/24/outline'

const PaymentMethodSelector = ({ onMethodSelect, selectedSeats }) => {
	const [selectedMethod, setSelectedMethod] = useState('razorpay')

	const handleMethodSelect = (method) => {
		setSelectedMethod(method)
		onMethodSelect(method)
	}

	const seatCount = selectedSeats.length
	const priceINR = seatCount * 300
	const priceUSD = seatCount * 10

	return (
		<div className="w-full max-w-2xl mx-auto">
			<div className="bg-white rounded-lg shadow-lg p-6">
				<h3 className="text-xl font-semibold text-gray-900 mb-6 text-center">
					Choose Payment Method
				</h3>

				<div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
					{/* Razorpay (Indian) Option */}
					<div
						onClick={() => handleMethodSelect('razorpay')}
						className={`relative p-6 border-2 rounded-lg cursor-pointer transition-all duration-200 ${
							selectedMethod === 'razorpay'
								? 'border-blue-500 bg-blue-50'
								: 'border-gray-200 hover:border-gray-300'
						}`}
					>
						<div className="flex items-center justify-between mb-4">
							<div className="flex items-center">
								<DevicePhoneMobileIcon className="h-8 w-8 text-blue-600 mr-3" />
								<div>
									<h4 className="font-semibold text-gray-900">Indian Payments</h4>
									<p className="text-sm text-gray-600">UPI, Cards, Net Banking</p>
								</div>
							</div>
							{selectedMethod === 'razorpay' && (
								<div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
									<div className="w-2 h-2 bg-white rounded-full"></div>
								</div>
							)}
						</div>

						<div className="space-y-2">
							<div className="flex items-center text-sm text-gray-600">
								<span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
								UPI (GPay, PhonePe, Paytm)
							</div>
							<div className="flex items-center text-sm text-gray-600">
								<span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
								Debit & Credit Cards
							</div>
							<div className="flex items-center text-sm text-gray-600">
								<span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
								Net Banking (All Banks)
							</div>
							<div className="flex items-center text-sm text-gray-600">
								<span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
								Wallets (Paytm, Mobikwik)
							</div>
						</div>

						<div className="mt-4 p-3 bg-gray-50 rounded-md">
							<p className="text-lg font-bold text-gray-900">₹{priceINR}</p>
							<p className="text-sm text-gray-600">for {seatCount} seat{seatCount > 1 ? 's' : ''}</p>
						</div>
					</div>

					{/* Stripe (International) Option */}
					<div
						onClick={() => handleMethodSelect('stripe')}
						className={`relative p-6 border-2 rounded-lg cursor-pointer transition-all duration-200 ${
							selectedMethod === 'stripe'
								? 'border-purple-500 bg-purple-50'
								: 'border-gray-200 hover:border-gray-300'
						}`}
					>
						<div className="flex items-center justify-between mb-4">
							<div className="flex items-center">
								<GlobeAltIcon className="h-8 w-8 text-purple-600 mr-3" />
								<div>
									<h4 className="font-semibold text-gray-900">International</h4>
									<p className="text-sm text-gray-600">Credit & Debit Cards</p>
								</div>
							</div>
							{selectedMethod === 'stripe' && (
								<div className="w-5 h-5 bg-purple-500 rounded-full flex items-center justify-center">
									<div className="w-2 h-2 bg-white rounded-full"></div>
								</div>
							)}
						</div>

						<div className="space-y-2">
							<div className="flex items-center text-sm text-gray-600">
								<span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
								Visa, Mastercard
							</div>
							<div className="flex items-center text-sm text-gray-600">
								<span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
								American Express
							</div>
							<div className="flex items-center text-sm text-gray-600">
								<span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
								International Cards
							</div>
							<div className="flex items-center text-sm text-gray-600">
								<span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
								Secure Processing
							</div>
						</div>

						<div className="mt-4 p-3 bg-gray-50 rounded-md">
							<p className="text-lg font-bold text-gray-900">${priceUSD}</p>
							<p className="text-sm text-gray-600">for {seatCount} seat{seatCount > 1 ? 's' : ''}</p>
						</div>
					</div>
				</div>

				<div className="flex items-center justify-center text-sm text-gray-500">
					<CreditCardIcon className="h-4 w-4 mr-1" />
					All payments are secure and encrypted
				</div>
			</div>
		</div>
	)
}

export default PaymentMethodSelector 