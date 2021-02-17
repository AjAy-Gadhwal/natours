const AppError = require('./../utils/appError');

const handleDublicateFieldsDB = err => {
    const value = err.errmsg.match(/(["'])(\\?.)*?\1/)[0];
    return new AppError(`Dublicate field value: ${value}. Please use another value.`, 400);
};

const handleValidationErrorDB = err => {
    const errors = Object.values(err.errors).map(el => el.message);
    return new AppError(`Invalid input data. ${errors.join(', ')}`, 400);
};

const handleCastErrorDB = err => new AppError(`Invalid ${err.path}: ${err.value}.`, 400);
const handleJsonWebTokenError = () => new AppError(`Invalid token please login again.`, 401);
const handleTokenExpireError = () => new AppError(`Your token has expired! Please login again.`, 401);

const sendErrorDev = (err, req, res) => {
    if (req.originalUrl.startsWith('/api')) {
        res.status(err.statusCode).json({
            status: err.status,
            error: err,
            message: err.message,
            stack: err.stack
        });
    } else {
        res.status(err.statusCode).render('error', {
            title: 'Something went wrong!',
            msg: err.message
        });
    }
};

const sendErrorProd = (err, req, res) => {
    if (req.originalUrl.startsWith('/api')) {
        if (err.isOperational) {
            res.status(err.statusCode).json({
                status: err.status,
                message: err.message
            });
        } else {
            res.status(500).json({
                status: 'error',
                message: 'Something went very wrong!'
            });
        }
    } else {
        res.status(err.statusCode).render('error', {
            title: 'Something went wrong!',
            msg: err.isOperational ? err.message : 'Please try again later.'
        });
    }
};

module.exports = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';

    if (process.env.NODE_ENV === 'development') {
        sendErrorDev(err, req, res);
    } else if (process.env.NODE_ENV === 'production') {
        let error = { ...err };
        error.message = err.message;

        if (err.name === 'CastError') {
            error = handleCastErrorDB(err);
        }

        if (err.code === 11000) {
            error = handleDublicateFieldsDB(err);
        }

        if (err.name === 'ValidationError') {
            error = handleValidationErrorDB(err);
        }

        if (err.name === 'JsonWebTokenError') {
            error = handleJsonWebTokenError(err);
        }

        if (err.name === 'TokenExpireError') {
            error = handleTokenExpireError(err);
        }

        sendErrorProd(error, req, res);
    }
};
