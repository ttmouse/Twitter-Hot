
import json
import os
import psycopg2
from datetime import datetime
from dotenv import load_dotenv

load_dotenv()

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
                
                # Snowflake ID decoding to get Date (UTC+8 Beijing Time)
                try:
                    # Twitter Epoch: 1288834974657 (Nov 04 2010 01:42:54 UTC)
                    snowflake_time = (int(tweet_id) >> 22) + 1288834974657
                    # Convert to UTC+8 (Beijing Time) by adding 8 hours in milliseconds
                    beijing_time_ms = snowflake_time + (8 * 60 * 60 * 1000)
                    actual_date = datetime.utcfromtimestamp(beijing_time_ms / 1000).strftime('%Y-%m-%d')
                except:
                    # Fallback to database record date if ID invalid
                    actual_date = publish_date
                
                # Insert into new tweets table
                # Upsert: Update date if ID exists (to fix previous wrong migration)
                cur.execute("""
                    INSERT INTO tweets (tweet_id, publish_date, content, media_urls, author, tags)
                    VALUES (%s, %s, %s, %s, %s, %s)
                    ON CONFLICT (tweet_id) 
                    DO UPDATE SET publish_date = EXCLUDED.publish_date
                """, (
                    tweet_id, 
                    actual_date, # Use calculated date from Snowflake ID
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
