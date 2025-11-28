const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

const pool = new Pool({
    user: 'admin',
    host: 'db',
    database: 'my_db',
    password: 'root',
    port: 5432,
});

app.get('/api/data', async (req, res) => {
    const result = await pool.query('SELECT * FROM table_name');
    res.send({ express: result.rows });
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});