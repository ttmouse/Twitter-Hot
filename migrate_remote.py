
import json
import os
import psycopg2
from datetime import datetime

# DB Connection Config (Internal Docker Network)
# Using 'db' as hostname because this script runs inside the 'backend' container
DB_HOST = "db"
DB_NAME = os.environ.get('POSTGRES_DB', 'twitterhot')
DB_USER = os.environ.get('POSTGRES_USER', 'twitteruser')
DB_PASS = os.environ.get('POSTGRES_PASSWORD', 'TwitterHotSecurePass2026!')

BACKUP_FILE = 'neondb_backup_20260112_213330.json'

def migrate():
    print("Starting migration...")
    
    # 1. Read JSON Backup
    if not os.path.exists(BACKUP_FILE):
        print(f"Error: Backup file {BACKUP_FILE} not found!")
        return

    with open(BACKUP_FILE, 'r') as f:
        daily_records = json.load(f)
    
    print(f"Loaded {len(daily_records)} daily records.")

    # 2. Connect to DB
    try:
        conn = psycopg2.connect(
            host=DB_HOST,
            database=DB_NAME,
            user=DB_USER,
            password=DB_PASS
        )
        cur = conn.cursor()
    except Exception as e:
        print(f"DB Connection Failed: {e}")
        return

    # 3. Process and Insert
    total_tweets = 0
    try:
        for record in daily_records:
            publish_date = record.get('date')
            urls = record.get('urls', [])
            
            # Since the old format only had URLs, we have to infer or fetch details.
            # For migration purposes, we will insert placeholder entries if we don't have details,
            # OR we just migrate them as-is.
            # But the user wants the new structure.
            # Without re-fetching from Twitter, we only have the URL.
            # Strategy: Insert with NULL content/author, but valid date and tweet_id.
            
            for url in urls:
                # Extract tweet_id from URL
                # url example: https://twitter.com/user/status/123456789
                parts = url.split('/')
                tweet_id = parts[-1]
                if '?' in tweet_id:
                    tweet_id = tweet_id.split('?')[0]
                
                # Insert into new tweets table
                # We use ON CONFLICT DO NOTHING to avoid duplicates
                cur.execute("""
                    INSERT INTO tweets (tweet_id, publish_date, content, media_urls, author, tags)
                    VALUES (%s, %s, %s, %s, %s, %s)
                    ON CONFLICT (tweet_id) DO NOTHING
                """, (
                    tweet_id, 
                    publish_date, 
                    f"Migrated from {publish_date}",  # Placeholder content
                    json.dumps([]),                   # Empty media list
                    json.dumps({"name": "Unknown", "screen_name": "unknown"}), # Placeholder author
                    []                                # Empty tags
                ))
                total_tweets += 1
                
        conn.commit()
        print(f"Migration successful! Processed {total_tweets} tweets.")
        
    except Exception as e:
        conn.rollback()
        print(f"Migration error: {e}")
    finally:
        cur.close()
        conn.close()

if __name__ == "__main__":
    migrate()
