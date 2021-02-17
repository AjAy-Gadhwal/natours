const crypto = require('crypto');
const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const User = require('./../models/userModel');
const CatchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const Email = require('./../utils/email');

const signToken = id => {
    return jwt.sign({ id: id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN
    });
};

const createSendToken = (user, statusCode, req, res) => {
    const token = signToken(user._id);
    user.password = undefined;

    res.cookie('jwt', token, {
        expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000),
        httpOnly: true,
        secure: req.secure || req.headers['x-forwarded-proto'] === 'https'
    });

    res.status(statusCode).json({
        status: 'success',
        token: token,
        data: {
            user: user
        },
        res: res.toString()
    });
};

exports.signUp = CatchAsync(async (req, res, next) => {
    const newUser = await User.create({
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
        passwordConfirm: req.body.passwordConfirm,
        passwordChangeAt: req.body.passwordChangeAt
    });

    const url = `${req.protocol}://${req.get('host')}/me`;
    new Email(newUser, url).sendWelcome();

    return createSendToken(newUser, 201, req, res);
});

exports.login = CatchAsync(async (req, res, next) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return next(new AppError('Please enter email and password.', 400));
    }

    const user = await User.findOne({ email: email }).select('+password');

    if (!user || !(await user.correctPassword(password, user.password))) {
        return next(new AppError('Please enter valid email and password.', 401));
    }

    return createSendToken(user, 201, req, res);
});

exports.logout = CatchAsync(async (req, res, next) => {
    res.cookie('jwt', '', {
        expires: new Date(Date.now() + 10 * 1000),
        httpOnly: true
    });

    return res.status(200).json({
        status: 'success'
    });
});

exports.forgotPassword = CatchAsync(async (req, res, next) => {
    const user = await User.findOne({ email: req.body.email });

    if (!user) {
        return next(new AppError('There is no user with email address.', 404));
    }

    const resetToken = user.createPasswordResetToken();
    await user.save({ validateBeforeSave: false });

    try {
        const resetUrl = `${req.protocol}://${req.get('host')}/api/v1/users/resetPassword/${resetToken}`;
        await new Email(user, resetUrl).sendResetPassword();
    } catch (error) {
        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;

        await user.save({ validateBeforeSave: false });

        return next(new AppError('There was an error sending the email. Try again later.'));
    }

    return res.status(200).json({
        status: 'success',
        message: 'Token sent to email!'
    });
});

exports.resetPassword = CatchAsync(async (req, res, next) => {
    const hashToken = crypto
        .createHash('sha256')
        .update(req.params.token)
        .digest('hex');

    const user = await User.findOne({ passwordResetToken: hashToken, passwordResetExpires: { $gt: Date.now() } });

    if (!user) {
        return next(new AppError('Token is invalid or has expired.', 400));
    }

    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;

    await user.save();

    return createSendToken(user, 201, req, res);
});

exports.updatePassword = CatchAsync(async (req, res, next) => {
    const { oldPassword, password, passwordConfirm } = req.body;

    if (!oldPassword) {
        return next(new AppError('Please enter old password.', 400));
    }

    const user = await User.findById(req.user.id).select('+password');

    if (!user || !(await user.correctPassword(oldPassword, user.password))) {
        return next(new AppError('Please enter valid old password.', 401));
    }

    user.password = password;
    user.passwordConfirm = passwordConfirm;
    await user.save();

    return createSendToken(user, 201, req, res);
});

exports.isLogin = CatchAsync(async (req, res, next) => {
    if (req.cookies.jwt) {
        const decoded = await promisify(jwt.verify)(req.cookies.jwt, process.env.JWT_SECRET);

        const user = await User.findById(decoded.id);

        if (user.changePasswordAfter(decoded.iat)) {
            return next();
        }

        res.locals.user = user;
    }

    next();
});

exports.authentication = CatchAsync(async (req, res, next) => {
    let token = '';

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies.jwt) {
        token = req.cookies.jwt;
    }

    if (!token) {
        return next(new AppError('You are not authorize to access.', 401));
    }

    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id);

    if (!user) {
        return next(new AppError('The user belonging to this token does no longer exist.', 401));
    }

    if (user.changePasswordAfter(decoded.iat)) {
        return next(new AppError('User recently changed password! Please login again.', 401));
    }

    req.user = user;
    res.locals.user = user;
    next();
});

exports.authorization = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return next(new AppError('You do not have permission to perform this action.', 403));
        }

        next();
    };
};
