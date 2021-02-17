const ApiFeatures = require('./../utils/apiFeatures');
const CatchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');

exports.deleteOne = Model =>
    CatchAsync(async (req, res, next) => {
        const doc = await Model.findByIdAndDelete(req.params.id);

        if (!doc) {
            return next(new AppError('No document found with that ID', 404));
        }

        return res.status(204).json({ status: 'success', data: {} });
    });

exports.updateOne = Model =>
    CatchAsync(async (req, res, next) => {
        const doc = await Model.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });

        if (!doc) {
            return next(new AppError('No document found with that ID', 404));
        }

        return res.status(200).json({ status: 'success', data: { [Model.collection.collectionName.toLowerCase()]: doc } });
    });

exports.createOne = Model =>
    CatchAsync(async (req, res, next) => {
        const doc = await Model.create(req.body);

        return res.status(201).json({
            status: 'success',
            data: {
                [Model.collection.collectionName.toLowerCase()]: doc
            }
        });
    });

exports.getOne = (Model, popOptions) =>
    CatchAsync(async (req, res, next) => {
        const query = Model.findById(req.params.id);
        if (popOptions) {
            query.populate(popOptions);
        }

        const doc = await query;

        if (!doc) {
            return next(new AppError('No document found with that ID', 404));
        }

        return res.status(200).json({ status: 'success', data: { [Model.collection.collectionName.toLowerCase()]: doc } });
    });

exports.getAll = Model =>
    CatchAsync(async (req, res, next) => {
        let filter = {};
        if (req.params.tourId) filter = { tour: req.params.tourId };

        const feature = new ApiFeatures(Model.find(filter), req.query).paginationSortFilterField();

        // const doc = await feature.query.explain();
        const doc = await feature.query;

        return res.status(200).json({ status: 'success', result: doc.length, data: { [Model.collection.collectionName.toLowerCase()]: doc } });
    });
