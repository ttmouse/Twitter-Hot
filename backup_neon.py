
import os
import json
import psycopg2
from datetime import datetime

# NeonDB connection string from .env
DB_URL = "postgresql://neondb_owner:npg_ik9hAnJjHa8b@ep-crimson-thunder-ah0e1rh0-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require"

def backup_db():
    print(f"Connecting to NeonDB...")
    try:
        conn = psycopg2.connect(DB_URL)
        cur = conn.cursor()
        
        # Query all data from daily_tweets
        print("Fetching data from 'daily_tweets' table...")
        cur.execute("SELECT date, urls, created_at FROM daily_tweets ORDER BY date DESC")
        rows = cur.fetchall()
        
        data = []
        for row in rows:
            date_str = row[0]
            urls_json = row[1]
            created_at = row[2].isoformat() if row[2] else None
            
            data.append({
                "date": date_str,
                "urls": urls_json,
                "created_at": created_at
            })
            
        filename = f"neondb_backup_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
        
        with open(filename, 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=2, ensure_ascii=False)
            
        print(f"\n[Success] Backup complete!")
        print(f"Saved {len(rows)} records to: {os.path.abspath(filename)}")
        
        cur.close()
        conn.close()
        
    except Exception as e:
        print(f"\n[Error] Backup failed: {e}")

if __name__ == "__main__":
    backup_db()
