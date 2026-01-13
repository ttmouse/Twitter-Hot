
import os
import json
import sys
import psycopg2

# Connect to DB using the env var set in the container
DB_URL = os.environ.get("DATABASE_URL")

def restore(json_file):
    print(f"Connecting to DB...")
    conn = psycopg2.connect(DB_URL)
    cur = conn.cursor()
    
    print(f"Reading {json_file}...")
    with open(json_file, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    print(f"Restoring {len(data)} records...")
    count = 0
    for item in data:
        date = item['date']
        urls = item['urls']
        # Depending on how it's stored in JSON, might be list or string.
        # backup_neon.py dump says: urls_json = row[1] (which is JSON type in DB?)
        # backup script: data.append("urls": urls_json)
        # If urls_json is already a list (psycopg2 converts JSONB to list/dict), clean dump makes it list.
        # Postgres requires JSON string or adapter handles list?
        # Psycopg2 Json adapter handles list.
        
        cur.execute("""
            INSERT INTO daily_tweets (date, urls) 
            VALUES (%s, %s)
            ON CONFLICT (date) DO UPDATE SET urls = EXCLUDED.urls
        """, (date, json.dumps(urls)))
        count += 1
        
    conn.commit()
    cur.close()
    conn.close()
    print(f"Done. Restored {count} records.")

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python restore_data.py <backup_file.json>")
        sys.exit(1)
    restore(sys.argv[1])
