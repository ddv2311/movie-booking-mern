import { loadStripe } from '@stripe/stripe-js'

// Make sure to call `loadStripe` outside of a component's render to avoid
// recreating the `Stripe` object on every render.
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || 'pk_test_51RWi7YC7NO85QmK2RIWAxn0BUnsRKqIMDK95UOjola361Hsb1Kuji6mz4bC5CxcUyvswDqPykcuCbwn4ByKavKCu00V9qUqR0L')

export default stripePromise 