const { Pool } = require('pg');

const setCorsHeaders = (res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
};

const pool = new Pool({
    connectionString: process.env.DATABASE_URL || process.env.POSTGRES_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

module.exports = async (req, res) => {
    setCorsHeaders(res);

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    if (req.method !== 'POST') {
        res.status(405).json({ error: 'Method not allowed' });
        return;
    }

    let body = req.body;
    // If body is string (sometimes happens with different content-types), parse it
    if (typeof body === 'string') {
        try {
            body = JSON.parse(body);
        } catch (e) {
            res.status(400).json({ error: 'invalid_json' });
            return;
        }
    }

    const date = body.date || '';
    const urlToDelete = body.url || '';

    if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !urlToDelete) {
        res.status(400).json({ error: 'bad_request' });
        return;
    }

    try {
        // 1. Get existing data
        const existingData = await pool.query(
            'SELECT urls FROM daily_tweets WHERE date = $1',
            [date]
        );

        if (existingData.rows.length === 0) {
            res.status(404).json({ error: 'not_found', message: 'No data found for this date' });
            return;
        }

        let urls = existingData.rows[0].urls || [];

        // Ensure urls is an array
        if (!Array.isArray(urls)) {
            urls = [];
        }

        // 2. Remove the URL
        const initialLength = urls.length;
        urls = urls.filter(u => u !== urlToDelete);

        if (urls.length === initialLength) {
            res.json({ ok: false, message: 'URL not found in list' });
            return;
        }

        // 3. Update DB
        await pool.query(
            `INSERT INTO daily_tweets (date, urls) 
       VALUES ($1, $2) 
       ON CONFLICT (date) 
       DO UPDATE SET urls = $2, created_at = CURRENT_TIMESTAMP`,
            [date, JSON.stringify(urls)]
        );

        res.json({
            ok: true,
            message: 'Deleted successfully',
            remaining: urls.length
        });

    } catch (error) {
        console.error('Delete error:', error);
        res.status(500).json({ error: 'database_error', details: error.message });
    }
};
