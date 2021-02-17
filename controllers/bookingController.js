const stripe = require('stripe')(`${process.env.STRIPE_SECRET_KEY}`);
const Tour = require('./../models/tourModel');
const Booking = require('./../models/bookingModel');
const CatchAsync = require('./../utils/catchAsync');
const factory = require('./handlerFactory');

exports.getCheckoutSession = CatchAsync(async (req, res, next) => {
    // STRIPE_SECRET_KEY
    const tour = await Tour.findById(req.params.tourId);

    const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        success_url: `${req.protocol}://${req.get('host')}/?tour=${tour.id}&user=${req.user.id}&price=${tour.price}`,
        cancel_url: `${req.protocol}://${req.get('host')}/tour/${tour.slug}`,
        customer_email: req.user.email,
        client_reference_id: req.params.tourId,
        mode: 'payment',
        line_items: [
            {
                price_data: {
                    currency: 'usd',
                    product_data: {
                        name: `${tour.name} Tour`,
                        description: `${tour.summary}`,
                        images: [`https://www.natours.dev/img/tours/${tour.imageCover}`]
                    },
                    unit_amount: tour.price * 100
                },
                quantity: 1
            }
        ]
    });

    return res.status(200).json({ status: 'success', session });
});

exports.createBookingCheckout = CatchAsync(async (req, res, next) => {
    const { tour, user, price } = req.query;

    if (!tour && !user && !price) {
        return next();
    }

    await Booking.create({ tour, user, price });

    res.redirect(`${req.originalUrl.split('?')[0]}`);
});

exports.getBookings = factory.getAll(Booking);
exports.getBooking = factory.getOne(Booking);
exports.createBooking = factory.createOne(Booking);
exports.updateBooking = factory.updateOne(Booking);
exports.deleteBooking = factory.deleteOne(Booking);
