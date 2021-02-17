const express = require('express');
const { getReviews, createReview, deleteReview, getReview, updateReview, setTourAndUserIds } = require('./../controllers/reviewController');
const { authentication, authorization } = require('./../controllers/authController');

const router = express.Router({ mergeParams: true });

router.use(authentication);

router
    .route('/')
    .get(getReviews)
    .post(authorization('user'), setTourAndUserIds, createReview);

router
    .route('/:id')
    .get(getReview)
    .delete(authorization('user', 'admin'), deleteReview)
    .patch(authorization('user', 'admin'), updateReview);

module.exports = router;
