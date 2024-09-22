import pkg from "pg";
const {Pool} = pkg;

export const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'day1',
    password: '123456',
    port: 5432
});

// module.exports = pool;


