const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema(
    {
        tour: {
            type: mongoose.Types.ObjectId,
            ref: 'Tour',
            required: [true, 'Booking must belong to a tour.']
        },
        user: {
            type: mongoose.Types.ObjectId,
            ref: 'User',
            required: [true, 'Booking must belong to a user.']
        },
        price: {
            type: Number,
            required: [true, 'A tour must have a price.']
        },
        createdAt: {
            type: Date,
            default: Date.now(),
            select: false
        },
        paid: {
            type: Boolean,
            default: true
        }
    },
    { toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

bookingSchema.pre(/^find/, function(next) {
    this.populate('user').populate({
        path: 'tour',
        select: 'name'
    });

    next();
});

const Booking = mongoose.model('Booking', bookingSchema);
module.exports = Booking;
