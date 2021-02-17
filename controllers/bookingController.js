const stripe = require('stripe')(`${process.env.STRIPE_SECRET_KEY}`);
const Tour = require('./../models/tourModel');
const User = require('./../models/userModel');
const Booking = require('./../models/bookingModel');
const CatchAsync = require('./../utils/catchAsync');
const factory = require('./handlerFactory');

exports.getCheckoutSession = CatchAsync(async (req, res, next) => {
    // STRIPE_SECRET_KEY
    const tour = await Tour.findById(req.params.tourId);

    const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        success_url: `${req.protocol}://${req.get('host')}/my-tours`,
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
                        images: [`${req.protocol}://${req.get('host')}/img/tours/${tour.imageCover}`]
                    },
                    unit_amount: tour.price * 100
                },
                quantity: 1
            }
        ]
    });

    return res.status(200).json({ status: 'success', session });
});

const createBookingCheckout = CatchAsync(async session => {
    const tour = await Tour.findById(session.client_reference_id);
    const user = await User.findOne({ email: session.customer_email });
    const price = session.amount_total / 100;
    await Booking.create({ tour: tour._id, user: user._id, price });
});

exports.webhookCheckout = CatchAsync(async (req, res, next) => {
    let event;
    try {
        const signature = req.headers['stripe-signature'];

        event = stripe.webhooks.constructEvent(req.body, signature, process.env.STRIPE_WEBHOOK_SECRET);
    } catch (error) {
        return res.status(400).send(`Webhook error : ${error.message}`);
    }

    console.log('event : ', event);

    if (event.type === 'checkout.session.completed') {
        createBookingCheckout(event.data.object);
    }

    return res.status(200).json({ received: true });
});

exports.getBookings = factory.getAll(Booking);
exports.getBooking = factory.getOne(Booking);
exports.createBooking = factory.createOne(Booking);
exports.updateBooking = factory.updateOne(Booking);
exports.deleteBooking = factory.deleteOne(Booking);
