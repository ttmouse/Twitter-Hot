const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || process.env.POSTGRES_URL,
  ssl: { rejectUnauthorized: false }
});

const initTable = async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS daily_pv (
        date VARCHAR(10) PRIMARY KEY,
        pv BIGINT NOT NULL DEFAULT 0,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
  } catch (error) {
    console.error('Error initializing pv table:', error);
  }
};

module.exports = async (req, res) => {
  const method = req.method || 'GET';
  if (method !== 'GET' && method !== 'POST') {
    res.status(405).end();
    return;
  }

  await initTable();

  if (method === 'GET') {
    const date = (req.query && req.query.date) || '';
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      res.status(400).json({ error: 'bad_date' });
      return;
    }
    try {
      const r = await pool.query('SELECT pv FROM daily_pv WHERE date = $1', [date]);
      const pv = r.rows.length ? Number(r.rows[0].pv) : 0;
      res.setHeader('Cache-Control', 'no-store');
      res.json({ date, pv });
    } catch (error) {
      console.error('Database query error:', error);
      res.status(500).json({ error: 'database_error' });
    }
    return;
  }

  let body = '';
  await new Promise(resolve => {
    req.on('data', c => body += c);
    req.on('end', resolve);
  });

  let payload = {};
  try {
    payload = JSON.parse(body || '{}');
  } catch (e) {
    res.status(400).json({ error: 'invalid_json' });
    return;
  }

  const date = payload.date || '';
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    res.status(400).json({ error: 'bad_date' });
    return;
  }

  try {
    await pool.query(
      `INSERT INTO daily_pv (date, pv, updated_at)
       VALUES ($1, 1, CURRENT_TIMESTAMP)
       ON CONFLICT (date)
       DO UPDATE SET pv = daily_pv.pv + 1, updated_at = CURRENT_TIMESTAMP`,
      [date]
    );
    res.setHeader('Cache-Control', 'no-store');
    res.json({ ok: true });
  } catch (error) {
    console.error('Database save error:', error);
    res.status(500).json({ error: 'database_error' });
  }
};

