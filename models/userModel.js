const mongoose = require('mongoose');
const validator = require('validator');
const bcryptjs = require('bcryptjs');
const crypto = require('crypto');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'A user must have a name.']
    },
    email: {
        type: String,
        required: [true, 'A user must have a email.'],
        unique: true,
        lowercase: true,
        validate: [validator.isEmail, 'Please enter valid email.']
    },
    photo: {
        type: String,
        default: 'default.jpg'
    },
    role: {
        type: String,
        enum: ['user', 'guide', 'lead-guide', 'admin'],
        default: 'user'
    },
    password: {
        type: String,
        required: [true, 'A user must have a password.'],
        minlength: [8, 'Please enter valid password minimum length 8 charaters.'],
        select: false
    },
    passwordConfirm: {
        type: String,
        required: [true, 'A user must have a confirm password.'],
        validate: {
            validator: function(passConfirm) {
                return passConfirm === this.password;
            },
            message: 'Password are not the same.'
        }
    },
    passwordChangeAt: Date,
    passwordResetToken: String,
    passwordResetExpires: Date,
    active: {
        type: Boolean,
        default: true,
        select: false
    }
});

userSchema.pre('save', async function(next) {
    if (!this.isModified('password')) return next();

    this.password = await bcryptjs.hash(this.password, 12);
    this.passwordConfirm = undefined;

    next();
});

userSchema.pre('save', async function(next) {
    if (!this.isModified('password') || this.isNew) return next();

    this.passwordChangeAt = Date.now() - 1000;
    next();
});

userSchema.pre(/^find/, function(next) {
    this.find({ active: { $ne: false } });
    next();
});

userSchema.methods.correctPassword = async function(candidatePassword, userPassword) {
    return await bcryptjs.compare(candidatePassword, userPassword);
};

userSchema.methods.changePasswordAfter = function(JwtTimestamp) {
    if (this.passwordChangeAt) {
        const changedTimestamp = parseInt(this.passwordChangeAt.getTime() / 1000, 10);
        console.log(changedTimestamp, JwtTimestamp);

        return JwtTimestamp < changedTimestamp;
    }

    return false;
};

userSchema.methods.createPasswordResetToken = function() {
    const resetToken = crypto.randomBytes(32).toString('hex');
    this.passwordResetToken = crypto
        .createHash('sha256')
        .update(resetToken)
        .digest('hex');

    this.passwordResetExpires = Date.now() + 10 * 60 * 1000;
    console.log({ resetToken }, this.passwordResetToken);

    return resetToken;
};

const User = mongoose.model('User', userSchema);
module.exports = User;
