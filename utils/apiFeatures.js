class ApiFeatures {
    constructor(query, reqQuery) {
        this.query = query;
        this.reqQuery = reqQuery;
    }

    paginationSortFilterField() {
        return this.filter()
            .sort()
            .fields()
            .pagination();
    }

    filter() {
        let reqQuery = { ...this.reqQuery };
        const excludedFields = ['page', 'sort', 'limit', 'fields'];

        excludedFields.forEach(el => delete reqQuery[el]);

        const queryString = JSON.stringify(reqQuery);
        reqQuery = JSON.parse(queryString.replace(/\b(gt|gte|lt|lte)\b/g, match => `$${match}`));

        this.query = this.query.find(reqQuery);

        return this;
    }

    sort() {
        if (this.reqQuery.sort) {
            const sortBy = this.reqQuery.sort.replace(/,/g, ' ');
            this.query = this.query.sort(sortBy);
        } else {
            this.query = this.query.sort('-createAt');
        }

        return this;
    }

    fields() {
        if (this.reqQuery.fields) {
            const fields = this.reqQuery.fields.replace(/,/g, ' ');
            this.query = this.query.select(fields);
        } else {
            this.query = this.query.select('-__v');
        }

        return this;
    }

    pagination() {
        const page = this.reqQuery.page * 1 || 1;
        const limit = this.reqQuery.limit * 1 || 100;
        const skip = (page - 1) * limit;

        this.query = this.query.skip(skip).limit(limit);

        return this;
    }
}

module.exports = ApiFeatures;
