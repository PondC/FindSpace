const Pool = require('pg').Pool;

const pool = new Pool({
    user: 'postgres',
    password: 'chulatinder',
    host: '34.87.118.219',
    port: 5432,
    database: 'postgres'
});

module.exports = pool;