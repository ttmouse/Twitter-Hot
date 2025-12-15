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
    // 查询所有有内容的日期，按日期降序排列
    const result = await pool.query(
      'SELECT date, created_at FROM daily_tweets ORDER BY date DESC'
    );
    
    // 格式化日期数据
    const dates = result.rows.map(row => ({
      date: row.date,
      created_at: row.created_at
    }));
    
    res.setHeader('Cache-Control', 'no-store');
    res.json({ dates });
  } catch (error) {
    console.error('Database query error:', error);
    res.status(500).json({ error: 'database_error' });
  }
};
