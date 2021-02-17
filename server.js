const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config({ path: './config.env' });

process.on('uncaughtException', err => {
    console.log('Uncaught Exception : Stop server');
    console.log(err.name, err.message);

    process.exit(1);
});

const app = require('./app');

const port = process.env.PORT || 3000;
const dbUrl = process.env.DATABASE.replace('<PASSWORD>', process.env.DATABASE_PASSWORD);

mongoose
    .connect(dbUrl, {
        useNewUrlParser: true,
        useCreateIndex: true,
        useFindAndModify: false,
        useUnifiedTopology: true
    })
    .then(() => console.log('Db Connectioned'));

const server = app.listen(port, () => {
    console.log(`App Running On Port ${port}.`);
});

process.on('unhandledRejection', err => {
    console.log('Unhandled Rejection : Stop server');
    console.log(err.name, err.message);

    server.close(() => {
        process.exit(1);
    });
});
