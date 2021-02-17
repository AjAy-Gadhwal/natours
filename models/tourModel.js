const mongoose = require('mongoose');
const slugify = require('slugify');
// const validator = require('validator');

const tourSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'A tour must have a name.'],
            unique: true,
            trim: true,
            maxlength: [40, 'A tour name must have less or equal then 40 characters.'],
            minlength: [10, 'A tour name must have more or equal then 10 characters.']
            // validate: [validator.isAlpha, 'A tour name must only conyaines characters.']
        },
        slug: {
            type: String
        },
        duration: {
            type: Number,
            required: [true, 'A tour must have a duration.']
        },
        maxGroupSize: {
            type: Number,
            required: [true, 'A tour must have a maximum group size.']
        },
        difficulty: {
            type: String,
            required: [true, 'A tour must have a difficulty.'],
            trim: true,
            enum: {
                values: ['easy', 'medium', 'difficult'],
                message: 'A tour difficulty either easy, medium, difficult.'
            }
        },
        ratingsAverage: {
            type: Number,
            default: 4.5,
            min: [1, 'A tour rating must be above 1.0'],
            max: [5, 'A tour rating must be above 5.0'],
            set: val => parseFloat(val).toPrecision(2)
        },
        ratingsQuantity: {
            type: Number,
            default: 0
        },
        price: {
            type: Number,
            required: [true, 'A tour must have a price.']
        },
        discount: {
            type: Number,
            validate: {
                validator: function(dic) {
                    return dic < this.price;
                },
                message: 'Dicount price ({VALUE}) should be below price.'
            }
        },
        summary: {
            type: String,
            required: [true, 'A tour must have a summary.'],
            trim: true
        },
        description: {
            type: String,
            trim: true
        },
        imageCover: {
            type: String,
            required: [true, 'A tour must have a cover image.'],
            trim: true
        },
        images: [String],
        createdAt: {
            type: Date,
            default: Date.now(),
            select: false
        },
        startDates: [Date],
        secretTour: {
            type: Boolean,
            default: false
        },
        startLocation: {
            type: {
                type: String,
                default: 'Point',
                enum: ['Point']
            },
            coordinates: [Number],
            address: String,
            description: String
        },
        locations: [
            {
                type: {
                    type: String,
                    default: 'Point',
                    enum: 'Point'
                },
                coordinates: [Number],
                address: String,
                description: String,
                day: Number
            }
        ],
        guides: [
            {
                type: mongoose.Types.ObjectId,
                ref: 'User'
            }
        ]
    },
    { toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

tourSchema.index({ price: 1, ratingsAverage: -1 });
tourSchema.index({ slug: 1 });
tourSchema.index({ startLocation: '2dsphere' });

tourSchema.virtual('durationWeeks').get(function() {
    return this.duration / 7;
});

// virtual populate
tourSchema.virtual('reviews', { ref: 'Review', foreignField: 'tour', localField: '_id' });

tourSchema.pre('save', function(next) {
    this.slug = slugify(this.name, { lower: true });
    next();
});

tourSchema.pre(/^find/, function(next) {
    this.find({ secretTour: { $ne: true } });
    next();
});

tourSchema.pre(/^find/, function(next) {
    this.populate({ path: 'guides', select: '-__v -passwordChangeAt' });
    next();
});

const Tour = mongoose.model('Tour', tourSchema);
module.exports = Tour;
