const pool = require('./db');

async function addGoogleIdColumn() {
    try {
        await pool.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS google_id VARCHAR(255) UNIQUE;');
        console.log('Successfully added google_id column');
        process.exit(0);
    } catch (err) {
        console.error('Error:', err.message);
        process.exit(1);
    }
}

addGoogleIdColumn();
