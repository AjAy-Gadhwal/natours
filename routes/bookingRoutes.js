const express = require('express');
const { getCheckoutSession, getBookings, getBooking, createBooking, updateBooking, deleteBooking } = require('./../controllers/bookingController');
const { authentication, authorization } = require('./../controllers/authController');

const router = express.Router();
router.use(authentication);

router.get('/checkout-session/:tourId', getCheckoutSession);

router.use(authorization('admin', 'lead-guide'));

router
    .route('/')
    .get(getBookings)
    .post(createBooking);

router
    .route('/:id')
    .get(getBooking)
    .delete(deleteBooking)
    .patch(updateBooking);

module.exports = router;
