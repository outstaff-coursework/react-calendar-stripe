import Stripe from './src/stripe.js'


const returnLibrary = () => {
    return {
        Stripe: Stripe
    }
}

export default returnLibrary()
