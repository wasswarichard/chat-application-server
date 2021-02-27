const { Pool } = require('pg');

// const pool = new Pool({
//     port: '5432',

//     // user: 'postgres',
//     // host: 'localhost',
//     // database: 'application',
//     // password: 'root',
//
//     // host: '34.93.81.97',
//     // password: 'WtafTrl1',
//     // database: 'postgres',
//     // user: 'postgres',
// });


const pool = new Pool({
    // connectionString: process.env.DATABASE_URL,
    connectionString: 'postgres://fzrhcdakikyvtp:0e57c54e1aec6aa1424ce06de7ac60463ae53522b6546a42013bb7b855d9c7cb@ec2-54-211-77-238.compute-1.amazonaws.com:5432/dfbls2ch5b8sbn',
    ssl: {
        rejectUnauthorized: false
    }
});

module.exports = pool;
