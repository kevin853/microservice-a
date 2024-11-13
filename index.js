const express = require('express');
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

const app = express();
app.use(express.json());

app.get('/quotes/random', async (req, res, next) => {
    try {
        const result = await pool.query(
            'SELECT * FROM Quotes ORDER BY RANDOM() LIMIT 1'
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'No quotes found.' });
        }

        res.status(200).json(result.rows[0]);
    } catch (error) {
        next(error);
    }
});

app.post('/quotes', async (req, res) => {
    try {
        const { text } = req.body;
        const result = await pool.query(
            'INSERT INTO Quotes (text) VALUES ($1) RETURNING *',
            [text]
        );
        res.status(201).json(result.rows[0]);
    } catch (error) {
        next(error);
    }
});

app.delete('/quotes/:id', async (req, res, next) => {
    try {
        const { id } = req.params;
        const result = await pool.query('DELETE FROM quotes WHERE id = $1', [
            id,
        ]);

        if (result.rowCount <= 0) {
            return res.status(404).json({ message: 'No quote found with Id.' });
        }

        res.status(200).json({ message: 'Quote deleted successfully.' });
    } catch (error) {
        next(error);
    }
});

app.use((error, req, res, next) => {
    console.error('Error:', error);
    res.status(500).json({ error: 'An internal server error occurred.' });
});

app.listen(process.env.PORT, () => {
    console.log(`Server running on localhost:${process.env.PORT}`);
});
