import { TicketIcon } from '@heroicons/react/24/solid'
import { Elements } from '@stripe/react-stripe-js'
import axios from 'axios'
import { useContext, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import Navbar from '../components/Navbar'
import PaymentForm from '../components/PaymentForm'
import PaymentMethodSelector from '../components/PaymentMethodSelector'
import RazorpayPayment from '../components/RazorpayPayment'
import ShowtimeDetails from '../components/ShowtimeDetails'
import stripePromise from '../config/stripe'
import { AuthContext } from '../context/AuthContext'

const Purchase = () => {
	const navigate = useNavigate()
	const { auth } = useContext(AuthContext)
	const location = useLocation()
	const showtime = location.state.showtime
	const selectedSeats = location.state.selectedSeats || []
	const [isPurchasing, SetIsPurchasing] = useState(false)
	const [showPayment, setShowPayment] = useState(false)
	const [showMethodSelector, setShowMethodSelector] = useState(false)
	const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('razorpay')
	const [paymentData, setPaymentData] = useState(null)

	// Original purchase function (kept as fallback for free tickets)
	const onDirectPurchase = async (data) => {
		SetIsPurchasing(true)
		try {
			const response = await axios.post(
				`/showtime/${showtime._id}`,
				{ seats: selectedSeats },
				{
					headers: {
						Authorization: `Bearer ${auth.token}`
					}
				}
			)
			// console.log(response.data)
			navigate('/cinema')
			toast.success('Purchase seats successful!', {
				position: 'top-center',
				autoClose: 2000,
				pauseOnHover: false
			})
		} catch (error) {
			console.error(error)
			toast.error(error.response.data.message || 'Error', {
				position: 'top-center',
				autoClose: 2000,
				pauseOnHover: false
			})
		} finally {
			SetIsPurchasing(false)
		}
	}

	// Function to show payment method selection
	const onPurchase = () => {
		setShowMethodSelector(true)
	}

	// Function to handle payment method selection
	const handlePaymentMethodSelect = (method) => {
		setSelectedPaymentMethod(method)
		setShowMethodSelector(false)
		initiatePayment(method)
	}

	// PAYMENT FUNCTIONALITY - COMMENTED OUT FOR NOW
	// TODO: Implement payment integration later
	// For now, we'll save the booking directly without payment
	const initiatePayment = async (paymentMethod) => {
		SetIsPurchasing(true)
		try {
			// Actually save the booking to database (same as onDirectPurchase)
			const response = await axios.post(
				`/showtime/${showtime._id}`,
				{ seats: selectedSeats },
				{
					headers: {
						Authorization: `Bearer ${auth.token}`
					}
				}
			)
			
			toast.success(`Booking confirmed! (Payment with ${paymentMethod} simulated)`, {
				position: 'top-center',
				autoClose: 3000,
				pauseOnHover: false
			})
			
			// Redirect to tickets page to see the booking
			navigate('/ticket')
		} catch (error) {
			console.error(error)
			toast.error(error.response?.data?.message || 'Booking failed', {
				position: 'top-center',
				autoClose: 3000,
				pauseOnHover: false
			})
		} finally {
			SetIsPurchasing(false)
		}
	}

	/* ORIGINAL PAYMENT CODE - COMMENTED OUT
	const initiatePayment = async (paymentMethod) => {
		SetIsPurchasing(true)
		try {
			const response = await axios.post(
				'/payment/create-intent',
				{
					showtimeId: showtime._id,
					seats: selectedSeats,
					paymentMethod: paymentMethod
				},
				{
					headers: {
						Authorization: `Bearer ${auth.token}`
					}
				}
			)

			if (response.data.success) {
				setPaymentData(response.data)
				setShowPayment(true)
			}
		} catch (error) {
			console.error('Payment initiation error:', error)
			console.error('Error response:', error.response?.data)
			console.error('Error status:', error.response?.status)
			console.error('Request config:', error.config)
			const errorMessage = error.response?.data?.message || 'Failed to initiate payment'
			console.log('Detailed error message:', errorMessage)
			toast.error(errorMessage, {
				position: 'top-center',
				autoClose: 3000,
				pauseOnHover: false
			})
		} finally {
			SetIsPurchasing(false)
		}
	}
	*/

	const onPaymentSuccess = (response) => {
		toast.success('Payment successful! Your tickets have been booked.', {
			position: 'top-center',
			autoClose: 3000,
			pauseOnHover: false
		})
		navigate('/ticket')
	}

	return (
		<div className="flex min-h-screen flex-col gap-4 bg-gradient-to-br from-indigo-900 to-blue-500 pb-8 sm:gap-8">
			<Navbar />
			<div className="mx-4 h-fit rounded-lg bg-gradient-to-br from-indigo-200 to-blue-100 p-4 drop-shadow-xl sm:mx-8 sm:p-6">
				<ShowtimeDetails showtime={showtime} />
				<div className="flex flex-col justify-between rounded-b-lg bg-gradient-to-br from-indigo-100 to-white text-center text-lg drop-shadow-lg md:flex-row">
					<div className="flex flex-col items-center gap-x-4 px-4 py-2 md:flex-row">
						<p className="font-semibold">Selected Seats : </p>
						<p className="text-start">{selectedSeats.join(', ')}</p>
						{!!selectedSeats.length && <p className="whitespace-nowrap">({selectedSeats.length} seats)</p>}
					</div>
					{!!selectedSeats.length && !showPayment && !showMethodSelector && (
						<button
							onClick={() => onPurchase()}
							className="flex items-center justify-center gap-2 rounded-b-lg  bg-gradient-to-br from-indigo-600 to-blue-500 px-4 py-1 font-semibold text-white hover:from-indigo-500 hover:to-blue-500 disabled:from-slate-500 disabled:to-slate-400 md:rounded-none md:rounded-br-lg"
							disabled={isPurchasing}
						>
							{isPurchasing ? (
								'Processing...'
							) : (
								<>
									<p>Proceed to Payment</p>
									<TicketIcon className="h-7 w-7 text-white" />
								</>
							)}
						</button>
					)}
				</div>

				{/* Payment Method Selection */}
				{showMethodSelector && (
					<div className="mt-6">
						<div className="mb-4">
							<button
								onClick={() => setShowMethodSelector(false)}
								className="text-blue-600 hover:text-blue-800 font-medium"
							>
								← Back to booking details
							</button>
						</div>
						<PaymentMethodSelector
							onMethodSelect={handlePaymentMethodSelect}
							selectedSeats={selectedSeats}
						/>
					</div>
				)}

				{/* Payment Section - COMMENTED OUT FOR NOW */}
				{/* 
				{showPayment && paymentData && (
					<div className="mt-6 p-4 bg-white rounded-lg">
						<div className="mb-4">
							<button
								onClick={() => {
									setShowPayment(false)
									setShowMethodSelector(true)
								}}
								className="text-blue-600 hover:text-blue-800 font-medium"
							>
								← Change payment method
							</button>
						</div>
						
						{paymentData.paymentMethod === 'stripe' ? (
							<Elements stripe={stripePromise}>
								<PaymentForm
									clientSecret={paymentData.clientSecret}
									paymentIntentId={paymentData.paymentIntentId}
									totalAmount={paymentData.amount}
									onPaymentSuccess={onPaymentSuccess}
									isProcessing={isPurchasing}
									setIsProcessing={SetIsPurchasing}
								/>
							</Elements>
						) : (
							<RazorpayPayment
								paymentData={paymentData}
								onPaymentSuccess={onPaymentSuccess}
								isProcessing={isPurchasing}
								setIsProcessing={SetIsPurchasing}
								showtimeId={showtime._id}
								selectedSeats={selectedSeats}
							/>
						)}
					</div>
				)}
				*/}
			</div>
		</div>
	)
}

export default Purchase















