const Tour = require('../models/tourModel');
const User = require('../models/userModel');
const Booking = require('../models/bookingModel');
const CatchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

exports.getOverview = CatchAsync(async (req, res, next) => {
    const tours = await Tour.find();
    return res.status(200).render('overview', { title: 'All Tours', tours: tours });
});

exports.getTour = CatchAsync(async (req, res, next) => {
    const tour = await Tour.findOne({ slug: req.params.slug }).populate({ path: 'reviews', fields: 'review rating user' });

    if (!tour) {
        return next(new AppError('There is no tour with that name.', 404));
    }

    return res.status(200).render('tour', { title: `${tour.name} Tour`, tour: tour });
});

exports.getLogin = (req, res, next) => {
    return res.status(200).render('login', { title: 'Login into your account' });
};

exports.getMe = (req, res, next) => {
    return res.status(200).render('account', { title: 'Your Account' });
};

exports.getMyTours = CatchAsync(async (req, res, next) => {
    const bookings = await Booking.find({ user: req.user.id });
    const tourIds = bookings.map(el => el.tour);
    const tours = await Tour.find({ _id: { $in: tourIds } });

    return res.status(200).render('overview', { title: 'My Tours', tours: tours });
});

exports.updateUserData = CatchAsync(async (req, res, next) => {
    const user = await User.findByIdAndUpdate(req.user.id, { name: req.body.name, email: req.body.email }, { new: true, runValidators: true });

    return res.status(200).render('account', { title: 'Your Account', user });
});
