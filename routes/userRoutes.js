const express = require('express');
const {
    getUsers,
    getUser,
    createUser,
    updateUser,
    deleteUser,
    getCurrentUser,
    updateCurrentUser,
    deleteCurrentUser,
    uploadUserPhoto,
    resizeUserPhoto
} = require('./../controllers/userController');
const {
    authentication,
    authorization,
    signUp,
    login,
    logout,
    forgotPassword,
    resetPassword,
    updatePassword
} = require('./../controllers/authController');

const router = express.Router();

// Without authentication
router.post('/signup', signUp);
router.post('/login', login);
router.get('/logout', logout);
router.post('/forgotPassword', forgotPassword);
router.patch('/resetPassword/:token', resetPassword);

// With authentication all routers after this middleware
router.use(authentication);

router.patch('/updatePassword', updatePassword);
router.get('/getCurrentUser', getCurrentUser, getUser);
router.patch('/updateCurrentUser', uploadUserPhoto, resizeUserPhoto, updateCurrentUser);
router.delete('/deleteCurrentUser', deleteCurrentUser);

router.use(authorization('admin'));

router
    .route('/')
    .get(getUsers)
    .post(createUser);

router
    .route('/:id')
    .get(getUser)
    .patch(updateUser)
    .delete(deleteUser);

module.exports = router;
