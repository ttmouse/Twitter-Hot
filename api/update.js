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

module.exports = async (req, res) => {
  setCorsHeaders(res);

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).end();
    return;
  }

  // 初始化表
  await initTable();

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
  const newUrls = payload.urls || [];

  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !Array.isArray(newUrls)) {
    res.status(400).json({ error: 'bad_request' });
    return;
  }

  try {
    // 首先检查是否已有该日期的数据
    const existingData = await pool.query(
      'SELECT urls FROM daily_tweets WHERE date = $1',
      [date]
    );
    
    let finalUrls = newUrls;
    
    // 如果已有数据，则合并链接（去重）
    if (existingData.rows.length > 0) {
      const existingUrls = existingData.rows[0].urls || [];
      // 合并现有链接和新链接，并去重
      const mergedUrls = [...existingUrls, ...newUrls];
      finalUrls = [...new Set(mergedUrls)]; // 使用Set进行去重
      
      console.log(`Merging ${newUrls.length} new URLs with ${existingUrls.length} existing URLs for date ${date}`);
    } else {
      console.log(`Creating new entry with ${newUrls.length} URLs for date ${date}`);
    }
    
    // 使用 UPSERT 语法（ON CONFLICT）来插入或更新数据
    const result = await pool.query(
      `INSERT INTO daily_tweets (date, urls) 
       VALUES ($1, $2) 
       ON CONFLICT (date) 
       DO UPDATE SET urls = $2, created_at = CURRENT_TIMESTAMP`,
      [date, JSON.stringify(finalUrls)]
    );

    res.json({ 
      ok: true, 
      message: `成功保存 ${finalUrls.length} 个链接（新增 ${newUrls.length} 个）`,
      totalUrls: finalUrls.length,
      newUrls: newUrls.length
    });
  } catch (error) {
    console.error('Database save error:', error);
    res.status(500).json({ error: 'database_error', details: error.message });
  }
};
