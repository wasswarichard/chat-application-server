const { Pool } = require('pg');

const pool = new Pool({
    user: 'postgres',
    host: '34.93.81.97',
    password: 'WtafTrl1',
    database: 'postgres',
    port: '5432'
});

module.exports = pool;
