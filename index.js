require('dotenv').config();
const app = require('./src/app');
const pool = require('./src/pool');

pool.connect({
    connectionString: process.env.DB_URL
})
    .then(() => {
        app().listen(3005, () => {
            console.log('Listening on port 3005');
        });
    })
    .catch((err) => console.error(err));