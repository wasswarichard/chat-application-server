const { Pool } = require('pg');

const pool = new Pool({
    user: 'postgres',
    // host: '34.93.81.97',
    host: 'localhost',
    // password: 'WtafTrl1',
    password: 'root',
    // database: 'postgres',
    database: 'application',
    port: '5432'
});

module.exports = pool;
