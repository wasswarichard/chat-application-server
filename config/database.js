const { Pool } = require('pg');

const pool = new Pool({
    port: '5432',

    host: 'ec2-54-211-77-238.compute-1.amazonaws.com',
    database: 'dfbls2ch5b8sbn',
    user: 'fzrhcdakikyvtp',
    password: '0e57c54e1aec6aa1424ce06de7ac60463ae53522b6546a42013bb7b855d9c7cb',

    // user: 'postgres',
    // host: 'localhost',
    // database: 'application',
    // password: 'root',

    // host: '34.93.81.97',
    // password: 'WtafTrl1',
    // database: 'postgres',
    // user: 'postgres',
});

module.exports = pool;
