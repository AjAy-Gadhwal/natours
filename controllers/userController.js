const multer = require('multer');
const sharp = require('sharp');
const User = require('./../models/userModel');
const CatchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const factory = require('./handlerFactory');

// const multerStrorage = multer.diskStorage({
//     destination: (req, file, cb) => {
//         cb(null, 'public/img/users');
//     },
//     filename: (req, file, cb) => {
//         const ext = file.mimetype.split('/')[1];
//         cb(null, `user-${req.user.id}-${Date.now()}.${ext}`);
//     }
// });

const multerStrorage = multer.memoryStorage();

const multerFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image')) {
        cb(null, true);
    } else {
        cb(new AppError('Not an image! Please upload only images.', 400), false);
    }
};

const upload = multer({
    storage: multerStrorage,
    fileFilter: multerFilter
});
exports.uploadUserPhoto = upload.single('photo');

exports.resizeUserPhoto = CatchAsync(async (req, res, next) => {
    if (!req.file) {
        return next();
    }

    req.file.filename = `user-${req.user.id}-${Date.now()}.jpeg`;
    await sharp(req.file.buffer)
        .resize(500, 500)
        .toFormat('jpeg')
        .jpeg({ quality: 90 })
        .toFile(`public/img/users/${req.file.filename}`);

    return next();
});

const filterObj = (obj, ...fields) => {
    const newObj = {};
    Object.keys(obj).forEach(el => {
        if (fields.includes(el)) {
            newObj[el] = obj[el];
        }
    });

    return newObj;
};

exports.getCurrentUser = (req, res, next) => {
    req.params.id = req.user.id;
    next();
};

exports.updateCurrentUser = CatchAsync(async (req, res, next) => {
    console.log(req.body);
    console.log(req.file);

    if (req.body.password || req.body.passwordConfirm) {
        return next(new AppError('This route is not for password updates. Please use /updatePassword.', 400));
    }

    const updateData = filterObj(req.body, 'name', 'email');
    if (req.file) updateData.photo = req.file.filename;

    const user = await User.findByIdAndUpdate(req.user.id, updateData, { new: true, runValidators: true });
    console.log('user : ', user);

    return res.status(200).json({ status: 'success', data: { user } });
});

exports.deleteCurrentUser = CatchAsync(async (req, res, next) => {
    await User.findByIdAndUpdate(req.user.id, { active: false }, { new: true, runValidators: true });
    return res.status(204).json({ status: 'success', data: null });
});

exports.createUser = (req, res) => {
    return res.status(500).json({
        status: 'success',
        message: 'This route is not defined. Please use /signup instead.'
    });
};

exports.getUsers = factory.getAll(User);
exports.getUser = factory.getOne(User);
exports.updateUser = factory.updateOne(User);
exports.deleteUser = factory.deleteOne(User);
