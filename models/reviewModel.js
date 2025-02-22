const mongoose = require('mongoose');
const Tour = require('./tourModel');

const reviewSchema = new mongoose.Schema(
    {
        review: {
            type: String,
            required: [true, 'Review can not be empty.']
        },
        rating: {
            type: Number,
            min: 1,
            max: 5,
            default: 0
        },
        createdAt: {
            type: Date,
            default: Date.now()
        },
        tour: {
            type: mongoose.Types.ObjectId,
            ref: 'Tour',
            required: [true, 'Review must belong to a tour.']
        },
        user: {
            type: mongoose.Types.ObjectId,
            ref: 'User',
            required: [true, 'Review must belong to a user.']
        }
    },
    { toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

reviewSchema.index({ tour: 1, user: 1 }, { unique: true });

reviewSchema.pre(/^find/, function(next) {
    // this.populate({ path: 'tour', select: 'name' }).populate({ path: 'user', select: 'name photo' });
    this.populate({ path: 'user', select: 'name photo' });
    next();
});

reviewSchema.statics.calcAverageRatings = async function(tourId) {
    const stats = await this.aggregate([
        {
            $match: { tour: tourId }
        },
        {
            $group: {
                _id: '$tour',
                numRating: { $sum: 1 },
                avgRating: { $avg: '$rating' }
            }
        }
    ]);

    const stat = stats[0] || { avgRating: 4.5, numRating: 0 };
    await Tour.findByIdAndUpdate(tourId, { ratingsAverage: stat.avgRating, ratingsQuantity: stat.numRating });
};

reviewSchema.post('save', function(docs, next) {
    this.constructor.calcAverageRatings(this.tour);
    next();
});

reviewSchema.post(/^findOneAnd/, async function(docs, next) {
    await docs.constructor.calcAverageRatings(docs.tour);
    next();
});

const Review = mongoose.model('Review', reviewSchema);
module.exports = Review;
