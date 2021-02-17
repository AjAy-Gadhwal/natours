const express = require('express');
const {
    aliasTop5Tours,
    getTours,
    getTour,
    createTour,
    updateTour,
    deleteTour,
    getStats,
    getMonthlyPlan,
    getToursWithin,
    getDistances,
    uploadTourImages,
    resizeTourImages
} = require('./../controllers/tourController');
const { authentication, authorization } = require('./../controllers/authController');
const reviewRoutes = require('./../routes/reviewRoutes');

const router = express.Router();

// router.param('id', checkID);
router.use('/:tourId/reviews', reviewRoutes);

router.route('/top-5-cheap').get(aliasTop5Tours, getTours);
router.route('/stats').get(getStats);
router.route('/monthly-plan/:year').get(authentication, authorization('admin', 'lead-guide', 'guide'), getMonthlyPlan);

router.route('/tours-within/:distance/center/:latlng/unit/:unit').get(getToursWithin);
router.route('/distances/:latlng/unit/:unit').get(getDistances);

router
    .route('/')
    .get(getTours)
    .post(authentication, authorization('admin', 'lead-guide'), createTour);

router
    .route('/:id')
    .get(getTour)
    .patch(authentication, authorization('admin', 'lead-guide'), uploadTourImages, resizeTourImages, updateTour)
    .delete(authentication, authorization('admin', 'lead-guide'), deleteTour);

module.exports = router;
