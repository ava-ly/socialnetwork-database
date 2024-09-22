const { connectionString } = require('pg/lib/defaults');
const app = require('./src/app');
const pool = require('./src/pool');

pool.connect({
    connectionString: 'postgresql://social-owner:k0pgbh2HZRwd@ep-misty-credit-a10b0i5m.ap-southeast-1.aws.neon.tech/social-db?sslmode=require'
})
    .then(() => {
        app().listen(3005, () => {
            console.log('Listening on port 3005');
        });
    })
    .catch((err) => console.error(err));