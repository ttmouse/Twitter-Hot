const { Pool } = require('pg');

const setCorsHeaders = (res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
};

// 从环境变量获取数据库连接信息
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || process.env.POSTGRES_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

// 创建数据表（如果不存在）
const initTable = async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS daily_tweets (
        date VARCHAR(10) PRIMARY KEY,
        urls JSONB NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('Table initialized successfully');
    } catch (error) {
      console.error('Database query error:', error);
      
      // If tweets table doesn't exist, try only daily_tweets
      if (error.message && error.message.includes('tweets')) {
        try {
          const fallbackResult = await pool.query(
            'SELECT date, created_at FROM daily_tweets ORDER BY date DESC'
          );
          const dates = fallbackResult.rows.map(row => ({
            date: row.date,
            created_at: row.created_at
          }));
          res.setHeader('Cache-Control', 'no-store');
          res.json({ dates });
          return;
        } catch (fallbackError) {
          console.error('Fallback query error:', fallbackError);
          res.status(500).json({ error: 'database_error' });
        }
      }
      
      res.status(500).json({ error: 'database_error' });
    }
};

// 初始化表
initTable();

module.exports = async (req, res) => {
  setCorsHeaders(res);

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'GET') {
    res.status(405).end();
    return;
  }

  try {
    const proxyResponse = await fetch('https://ttmouse.com/api/dates').catch(e => {
      console.error('[api/dates] Proxy fetch error:', e);
      return null;
    });
    
    if (proxyResponse && proxyResponse.ok) {
      try {
        const data = await proxyResponse.json();
        if (data && Array.isArray(data.dates)) {
          res.setHeader('Cache-Control', 'no-store');
          res.json(data);
          return;
        }
      } catch (e) {
        console.error('[api/dates] Failed to parse proxy response:', e);
        // Fall through to local DB
      }
    }

    let result = await pool.query(
      "SELECT DISTINCT publish_date FROM tweets ORDER BY publish_date DESC"
    );

    let dates = result.rows.map(row => ({
      date: row.publish_date,
      created_at: null
    }));

    if (dates.length === 0) {
      result = await pool.query(
        'SELECT date, created_at FROM daily_tweets ORDER BY date DESC'
      );
      dates = result.rows.map(row => ({
        date: row.date,
        created_at: row.created_at
      }));
    }

    res.setHeader('Cache-Control', 'no-store');
    res.json({ dates });
  } catch (error) {
    console.error('Database query error:', error);

    if (error.message.includes('tweets') || error.code === '42P01') {
      try {
        const fallbackResult = await pool.query(
          'SELECT date, created_at FROM daily_tweets ORDER BY date DESC'
        );
        const dates = fallbackResult.rows.map(row => ({
          date: row.date,
          created_at: row.created_at
        }));
        res.setHeader('Cache-Control', 'no-store');
        res.json({ dates });
      } catch (fallbackError) {
        console.error('Fallback query error:', fallbackError);
        res.status(500).json({ error: 'database_error' });
      }
    } else {
      res.status(500).json({ error: 'database_error' });
    }
  }
};
