/* eslint-disable */
import axios from 'axios';
import { showAlert } from './alerts';

const stripe = Stripe('pk_test_9sorkhLDrfaA3ejdwtLZ28Mt');

export const bookTour = async tourId => {
    try {
        const res = await axios({
            method: 'GET',
            url: `/api/v1/booking/checkout-session/${tourId}`
        });

        stripe.redirectToCheckout({
            sessionId: res.data.session.id
        });

        if (res.data.status === 'success') {
            showAlert('success', 'Payment processing in successfully!');
        }
    } catch (error) {
        showAlert('error', error.response.data.message);
    }
};
