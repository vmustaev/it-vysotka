const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

// PostgreSQL Connection
const pool = new Pool({
    user: 'admin',
    host: 'db',
    database: 'my_db',
    password: 'root',
    port: 5432,
});

// Sample endpoint
app.get('/api/data', async (req, res) => {
    const result = await pool.query('SELECT * FROM your_table');
    res.send(result.rows);
});

// Start server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});