
import os
import json
import psycopg2
from dotenv import load_dotenv

load_dotenv()

DB_URL = os.environ.get('POSTGRES_URL')

def get_db_connection():
    if not DB_URL:
        return None
    try:
        conn = psycopg2.connect(DB_URL)
        return conn
    except Exception as e:
        print(f"DB Connection Error: {e}")
        return None

def fix_authors():
    if not os.path.exists('neondb_backup_20260112_213330.json'):
        print("Backup file not found!")
        return

    print("Loading backup data...")
    with open('neondb_backup_20260112_213330.json', 'r') as f:
        data = json.load(f)
        
    conn = get_db_connection()
    if not conn:
        print("Failed to connect to DB")
        return

    cur = conn.cursor()
    
    updated_count = 0
    processed_urls = 0
    
    print(f"Processing {len(data)} daily entries...")
    
    for entry in data:
        urls = entry.get('urls', [])
        # Handle string encoded JSON if happened
        if isinstance(urls, str):
            try: urls = json.loads(urls)
            except: continue
            
        for url in urls:
            processed_urls += 1
            # Parse URL
            # https://x.com/username/status/123456...
            # Also handle http vs https, www vs mobile
            # Simple split by /
            parts = url.split('/')
            
            try:
                # Find 'status' segment
                # If url ends with status/id
                # parts usually [..., username, status, id]
                
                # Check for query params in ID
                if 'status' in parts:
                    idx = parts.index('status')
                    if idx + 1 < len(parts) and idx > 0:
                        tweet_id = parts[idx+1].split('?')[0]
                        screen_name = parts[idx-1]
                        
                        # Fix: Check for subdomains if screen_name is domain?
                        # x.com/username/status... -> parts: ['https:', '', 'x.com', 'username', 'status', 'id']
                        # username is indeed idx-1
                        
                        # Perform Update
                        # We only update if author is currently unknown
                        cur.execute("""
                            UPDATE tweets 
                            SET author = %s 
                            WHERE tweet_id = %s AND (author->>'screen_name' = 'unknown' OR author->>'screen_name' IS NULL)
                        """, (json.dumps({"name": screen_name, "screen_name": screen_name}), tweet_id))
                        
                        updated_count += cur.rowcount
            except Exception as e:
                print(f"Error processing URL {url}: {e}")
                
    conn.commit()
    cur.close()
    conn.close()
    print(f"Finished. Processed {processed_urls} URLs. Updated {updated_count} tweets.")

if __name__ == "__main__":
    fix_authors()
