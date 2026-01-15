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

  try {
    // 1. 优先查询新架构的 tweets 表（包含 Grok 导入的数据）
    let result = await pool.query(
      "SELECT DISTINCT publish_date FROM tweets ORDER BY publish_date DESC"
    );

    let dates = result.rows.map(row => ({
      date: row.publish_date,
      created_at: null
    }));

    // 2. 如果 tweets 表没有数据，fallback 到旧架构的 daily_tweets 表
    if (dates.length === 0) {
      console.log('No data in tweets table, checking daily_tweets...');
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

    // 如果 tweets 表不存在（旧数据库），尝试只查询 daily_tweets
    if (error.message.includes('tweets') || error.code === '42P01') {
      console.log('tweets table not found, using daily_tweets fallback...');
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
