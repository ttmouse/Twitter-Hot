import psycopg2
from .config import DB_URL

def get_db_connection():
    if not DB_URL:
        print("Error: POSTGRES_URL or DATABASE_URL environment variable not set.")
        return None
    try:
        conn = psycopg2.connect(DB_URL)
        return conn
    except Exception as e:
        print(f"Error connecting to database: {e}")
        # Improve fallback for local dev if docker 'db' alias fails
        if 'could not translate host name "db"' in str(e):
             print("Tip: If running locally without Docker, check your .env POSTGRES_URL")
        return None

def init_db():
    conn = get_db_connection()
    if not conn:
        return
    try:
        cur = conn.cursor()
        cur.execute("""
            CREATE TABLE IF NOT EXISTS daily_tweets (
                date VARCHAR(10) PRIMARY KEY,
                urls JSONB NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)
        
        # New Schema: Individual Tweets
        cur.execute("""
            CREATE TABLE IF NOT EXISTS tweets (
                id SERIAL PRIMARY KEY,
                tweet_id VARCHAR(50) UNIQUE NOT NULL,
                publish_date DATE NOT NULL,
                content TEXT,
                media_urls JSONB,
                author JSONB,
                tags TEXT[],
                hierarchical_categories JSONB,
                flat_tags JSONB,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)
        # Add new columns if they don't exist (for existing tables)
        cur.execute("""
            DO $$ 
            BEGIN 
                IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='tweets' AND column_name='hierarchical_categories') THEN
                    ALTER TABLE tweets ADD COLUMN hierarchical_categories JSONB;
                END IF;
                IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='tweets' AND column_name='flat_tags') THEN
                    ALTER TABLE tweets ADD COLUMN flat_tags JSONB;
                END IF;
            END $$;
        """)
        # Index for faster date-based queries
        cur.execute("CREATE INDEX IF NOT EXISTS idx_tweets_publish_date ON tweets(publish_date);")
        
        conn.commit()
        cur.close()
        conn.close()
        print("Database tables initialized successfully")
    except Exception as e:
        print(f"Error initializing database: {e}")
