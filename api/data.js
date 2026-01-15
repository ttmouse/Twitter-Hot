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
    console.error('Error initializing table:', error);
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

  const date = (req.query && req.query.date) || '';
  
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    res.status(400).json({ error: 'bad_date' });
    return;
  }

  try {
    const proxyResponse = await fetch(`https://ttmouse.com/api/data?date=${encodeURIComponent(date)}`).catch(() => null);
    if (proxyResponse && proxyResponse.ok) {
      const data = await proxyResponse.json();
      res.setHeader('Cache-Control', 'no-store');
      res.json(data);
      return;
    }

    const result = await pool.query('SELECT urls FROM daily_tweets WHERE date = $1', [date]);

    if (result.rows.length > 0 && Array.isArray(result.rows[0].urls) && result.rows[0].urls.length > 0) {
      const urls = result.rows[0].urls;
      res.setHeader('Cache-Control', 'no-store');
      res.json({ date, urls });
      return;
    }

    const tweetResult = await pool.query(
      'SELECT tweet_id, author FROM tweets WHERE publish_date = $1 ORDER BY created_at ASC',
      [date]
    );

    const urls = tweetResult.rows.map(row => {
      let screenName = 'unknown';
      if (row.author) {
        try {
          const author = typeof row.author === 'string' ? JSON.parse(row.author) : row.author;
          if (author && author.screen_name) screenName = author.screen_name;
        } catch (e) {
          screenName = 'unknown';
        }
      }
      return screenName === 'unknown'
        ? `https://x.com/i/status/${row.tweet_id}`
        : `https://x.com/${screenName}/status/${row.tweet_id}`;
    });

    res.setHeader('Cache-Control', 'no-store');
    res.json({ date, urls });
  } catch (error) {
    console.error('Database query error:', error);
    res.status(500).json({ error: 'database_error' });
  }
};
