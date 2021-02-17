const express = require('express');
const { getOverview, getTour, getLogin, getMe, getMyTours, updateUserData, alerts } = require('./../controllers/viewController');
const { isLogin, authentication } = require('./../controllers/authController');

const router = express.Router();

router.use(alerts);
router.get('/', isLogin, getOverview);
router.get('/tour/:slug', isLogin, getTour);
router.get('/login', isLogin, getLogin);

router.get('/me', authentication, getMe);
router.get('/my-tours', authentication, getMyTours);

router.post('/submit-user-data', authentication, updateUserData);

module.exports = router;
