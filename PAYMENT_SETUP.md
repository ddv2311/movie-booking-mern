# Payment Integration Setup Guide

## Overview
This project now includes **dual payment integration** for movie ticket bookings:
- **Razorpay** for Indian users (UPI, Cards, Net Banking, Wallets)
- **Stripe** for International users (Credit/Debit Cards)

The payment system is seamlessly integrated into the existing purchase flow with automatic method selection.

## Prerequisites
1. **For Indian Payments**: Create a Razorpay account at [https://razorpay.com](https://razorpay.com)
2. **For International Payments**: Create a Stripe account at [https://stripe.com](https://stripe.com)
3. Get your API keys from respective dashboards

## Setup Instructions

### 1. Install Dependencies
```bash
# Frontend dependencies (already added to package.json)
cd client
npm install @stripe/stripe-js @stripe/react-stripe-js

# Backend dependencies (already added to package.json)
cd ../server
npm install stripe razorpay
```

### 2. Environment Variables

#### Frontend (.env.local in client directory)
```
VITE_SERVER_URL=http://localhost:5000
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key_here
```

#### Backend (.env in server directory)
```
DATABASE=mongodb://localhost:27017/movie-booking
JWT_SECRET=your_jwt_secret_here
JWT_EXPIRE=30d
JWT_COOKIE_EXPIRE=30
PORT=5000

# Stripe Keys (International Payments)
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key_here

# Razorpay Keys (Indian Payments)
RAZORPAY_KEY_ID=rzp_test_your_key_id_here
RAZORPAY_KEY_SECRET=your_razorpay_secret_here

NODE_ENV=development
```

### 3. Stripe Dashboard Configuration
1. Log into your Stripe Dashboard
2. Go to Developers > API Keys
3. Copy your Publishable Key (starts with `pk_test_`) for the frontend
4. Copy your Secret Key (starts with `sk_test_`) for the backend
5. For production, use live keys (starts with `pk_live_` and `sk_live_`)

## How It Works

### Payment Flow
1. User selects seats and clicks "Proceed to Payment"
2. Backend creates a Stripe PaymentIntent with booking details
3. Frontend displays the Stripe payment form
4. User enters card details and submits payment
5. Stripe processes the payment securely
6. Backend confirms payment and completes the booking
7. User receives confirmation and can view tickets

### Security Features
- Payment processing handled entirely by Stripe (PCI compliant)
- No card details stored on your servers
- PaymentIntent metadata includes booking verification
- Double-verification of seat availability before and after payment

### Pricing Configuration
Currently set to $10.00 per seat. To modify pricing:
1. Edit `pricePerSeat` in `server/controllers/paymentController.js`
2. You can make this dynamic by adding price fields to your Movie or Theater models

## Testing

### Test Card Numbers (Stripe Test Mode)
- **Successful payment**: 4242 4242 4242 4242
- **Declined payment**: 4000 0000 0000 0002
- **Requires authentication**: 4000 0025 0000 3155

Use any future expiry date, any 3-digit CVC, and any 5-digit ZIP code.

## Features Added

### New API Endpoints
- `POST /payment/create-intent` - Creates a PaymentIntent for booking
- `POST /payment/confirm` - Confirms payment and completes booking

### Frontend Components
- `PaymentForm.jsx` - Stripe Elements payment form
- Updated `Purchase.jsx` - Integrated payment flow
- Updated `Tickets.jsx` - Shows payment amount on tickets

### Database Changes
- Added payment fields to User tickets schema:
  - `paymentIntentId` - Stripe PaymentIntent ID
  - `totalAmount` - Amount paid in cents
  - `paymentDate` - When payment was made

## Production Deployment

### Environment Setup
1. Replace test keys with live Stripe keys
2. Set `NODE_ENV=production`
3. Configure proper domain for Stripe webhooks (optional for future features)

### Security Considerations
- Ensure HTTPS is enabled in production
- Use environment variables for all sensitive keys
- Consider implementing Stripe webhooks for additional security
- Add rate limiting for payment endpoints

## Troubleshooting

### Common Issues
1. **"Stripe not defined"** - Check if VITE_STRIPE_PUBLISHABLE_KEY is set
2. **Payment Intent creation fails** - Verify STRIPE_SECRET_KEY is correct
3. **CORS issues** - Ensure backend CORS is configured for your domain

### Support
- Stripe Documentation: [https://stripe.com/docs](https://stripe.com/docs)
- Test your integration: [https://stripe.com/docs/testing](https://stripe.com/docs/testing)

## Future Enhancements
- Add Stripe webhooks for payment status updates
- Implement refund functionality
- Add payment history and receipts
- Support multiple currencies
- Add discount codes and promotions
- Implement subscription-based features 