const Pool = require("pg").Pool;

const pool = new Pool({
    user: process.env.PG_USER || "postgres",
    password: process.env.PG_PASSWORD || "0000",
    host: process.env.PG_HOST || "localhost",
    port: process.env.PG_PORT || 5432,
    database: process.env.PG_DATABASE || "smarthome"
}); 

module.exports = pool;