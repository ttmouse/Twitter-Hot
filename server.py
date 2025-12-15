import json
import os
import re
import psycopg2
from http.server import SimpleHTTPRequestHandler, HTTPServer
from urllib.parse import urlparse, parse_qs
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Configuration
# POSTGRES_URL should be provided in environment variables
DB_URL = os.environ.get('POSTGRES_URL') or os.environ.get('DATABASE_URL')

def get_db_connection():
    if not DB_URL:
        print("Error: POSTGRES_URL or DATABASE_URL environment variable not set.")
        return None
    try:
        conn = psycopg2.connect(DB_URL, sslmode='require')
        return conn
    except Exception as e:
        print(f"Error connecting to database: {e}")
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
        conn.commit()
        cur.close()
        conn.close()
        print("Database table initialized successfully")
    except Exception as e:
        print(f"Error initializing database: {e}")

import urllib.request

class Handler(SimpleHTTPRequestHandler):
    def do_GET(self):
        parsed = urlparse(self.path)
        
        # Proxy endpoint for VxTwitter API (to avoid CORS)
        if parsed.path == '/api/tweet_info':
            query = parse_qs(parsed.query)
            tweet_id = query.get('id', [''])[0]
            
            if not tweet_id:
                self.send_response(400)
                self.end_headers()
                self.wfile.write(b'{"error":"missing_id"}')
                return

            try:
                # Fetch data from VxTwitter
                url = f"https://api.vxtwitter.com/Twitter/status/{tweet_id}"
                req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
                
                with urllib.request.urlopen(req) as response:
                    data = response.read()
                    self.send_response(200)
                    self.send_header('Content-Type', 'application/json')
                    self.send_header('Cache-Control', 'public, max-age=3600') # Cache for 1 hour
                    self.end_headers()
                    self.wfile.write(data)
            except Exception as e:
                print(f"Error fetching tweet info: {e}")
                self.send_response(500)
                self.end_headers()
                self.wfile.write(b'{"error":"proxy_error"}')
            return

        if parsed.path == '/api/dates':
            conn = get_db_connection()
            if not conn:
                self.send_error(500, "Database connection failed")
                return

            try:
                cur = conn.cursor()
                cur.execute('SELECT date FROM daily_tweets ORDER BY date DESC')
                rows = cur.fetchall()
                dates = [row[0] for row in rows]
                
                response_data = {'dates': [{'date': d} for d in dates]}
                body = json.dumps(response_data)
                
                self.send_response(200)
                self.send_header('Content-Type', 'application/json; charset=utf-8')
                self.send_header('Cache-Control', 'no-store')
                self.end_headers()
                self.wfile.write(body.encode('utf-8'))
            except Exception as e:
                print(f"Error serving /api/dates: {e}")
                self.send_error(500, str(e))
            finally:
                if conn: conn.close()
            return

        elif parsed.path == '/api/data':
            qs = parse_qs(parsed.query)
            date = (qs.get('date') or [''])[0]
            if not date or not re.match(r'^\d{4}-\d{2}-\d{2}$', date):
                self.send_response(400)
                self.send_header('Content-Type', 'application/json; charset=utf-8')
                self.end_headers()
                self.wfile.write(b'{"error":"bad_date"}')
                return
            
            conn = get_db_connection()
            if not conn:
                self.send_error(500, "Database connection failed")
                return

            try:
                cur = conn.cursor()
                cur.execute('SELECT urls FROM daily_tweets WHERE date = %s', (date,))
                row = cur.fetchone()
                urls = row[0] if row else []
                
                body = json.dumps({'date': date, 'urls': urls})
                self.send_response(200)
                self.send_header('Content-Type', 'application/json; charset=utf-8')
                self.send_header('Cache-Control', 'no-store')
                self.end_headers()
                self.wfile.write(body.encode('utf-8'))
            except Exception as e:
                print(f"Error serving /api/data: {e}")
                self.send_error(500, str(e))
            finally:
                if conn: conn.close()
            return
            
        return super().do_GET()

    def do_POST(self):
        parsed = urlparse(self.path)
        if parsed.path == '/api/delete':
            length = int(self.headers.get('Content-Length') or 0)
            raw = self.rfile.read(length) if length > 0 else b''
            try:
                payload = json.loads(raw.decode('utf-8'))
            except Exception:
                payload = {}
            date = payload.get('date') or ''
            url_to_delete = payload.get('url') or ''

            if not date or not re.match(r'^\d{4}-\d{2}-\d{2}$', date) or not url_to_delete:
                self.send_response(400)
                self.send_header('Content-Type', 'application/json; charset=utf-8')
                self.end_headers()
                self.wfile.write(b'{"error":"bad_request"}')
                return

            conn = get_db_connection()
            if not conn:
                self.send_error(500, "Database connection failed")
                return

            try:
                cur = conn.cursor()
                
                # Get existing URLs
                cur.execute('SELECT urls FROM daily_tweets WHERE date = %s', (date,))
                row = cur.fetchone()
                existing_urls = row[0] if row else []
                # Ensure existing_urls is a list (handle potential string return from DB)
                if isinstance(existing_urls, str):
                    try:
                        existing_urls = json.loads(existing_urls)
                    except:
                        existing_urls = []
                if not isinstance(existing_urls, list):
                    existing_urls = []
                
                if url_to_delete in existing_urls:
                    existing_urls.remove(url_to_delete)
                    
                    # Update DB
                    cur.execute("""
                        INSERT INTO daily_tweets (date, urls) 
                        VALUES (%s, %s) 
                        ON CONFLICT (date) 
                        DO UPDATE SET urls = %s, created_at = CURRENT_TIMESTAMP
                    """, (date, json.dumps(existing_urls), json.dumps(existing_urls)))
                    
                    conn.commit()
                    
                    body = json.dumps({'ok': True, 'message': 'Deleted successfully'})
                else:
                     body = json.dumps({'ok': False, 'message': 'URL not found'})

                self.send_response(200)
                self.send_header('Content-Type', 'application/json; charset=utf-8')
                self.end_headers()
                self.wfile.write(body.encode('utf-8'))
            except Exception as e:
                print(f"Error processing /api/delete: {e}")
                self.send_error(500, str(e))
            finally:
                if conn: conn.close()
            return

        elif parsed.path == '/api/update':
            length = int(self.headers.get('Content-Length') or 0)
            raw = self.rfile.read(length) if length > 0 else b''
            try:
                payload = json.loads(raw.decode('utf-8'))
            except Exception:
                payload = {}
            date = payload.get('date') or ''
            new_urls = payload.get('urls') or []
            
            if not date or not re.match(r'^\d{4}-\d{2}-\d{2}$', date) or not isinstance(new_urls, list):
                self.send_response(400)
                self.send_header('Content-Type', 'application/json; charset=utf-8')
                self.end_headers()
                self.wfile.write(b'{"error":"bad_request"}')
                return
            
            conn = get_db_connection()
            if not conn:
                self.send_error(500, "Database connection failed")
                return

            try:
                cur = conn.cursor()
                
                # First, get existing URLs to merge
                cur.execute('SELECT urls FROM daily_tweets WHERE date = %s', (date,))
                row = cur.fetchone()
                existing_urls = row[0] if row else []
                
                # Normalize function: unify domain and strip whitespace
                def normalize(u):
                    if not u: return ''
                    # Replace twitter.com with x.com to prevent duplicates
                    u = u.replace('https://twitter.com', 'https://x.com')
                    u = u.replace('http://twitter.com', 'https://x.com')
                    u = u.replace('http://x.com', 'https://x.com')
                    return u.strip()

                # Merge and de-duplicate with Normalization
                combined = existing_urls + new_urls
                seen = set()
                deduplicated_urls = []
                
                for u in combined:
                    norm = normalize(u)
                    if norm and norm not in seen:
                        seen.add(norm)
                        deduplicated_urls.append(norm) # Save the normalized x.com version
                
                # Upsert
                cur.execute("""
                    INSERT INTO daily_tweets (date, urls) 
                    VALUES (%s, %s) 
                    ON CONFLICT (date) 
                    DO UPDATE SET urls = %s, created_at = CURRENT_TIMESTAMP
                """, (date, json.dumps(deduplicated_urls), json.dumps(deduplicated_urls)))
                
                conn.commit()
                
                body = json.dumps({
                    'ok': True, 
                    'message': f'Saved {len(deduplicated_urls)} URLs',
                    'totalUrls': len(deduplicated_urls),
                    'newUrls': len(new_urls)
                })
                
                self.send_response(200)
                self.send_header('Content-Type', 'application/json; charset=utf-8')
                self.end_headers()
                self.wfile.write(body.encode('utf-8'))
            except Exception as e:
                print(f"Error processing /api/update: {e}")
                self.send_error(500, str(e))
            finally:
                if conn: conn.close()
            return
            
        self.send_response(404)
        self.end_headers()

if __name__ == '__main__':
    port = int(os.environ.get('PORT') or '5500')
    print(f"Starting server on port {port}...")
    if not DB_URL:
        print("WARNING: POSTGRES_URL environment variable is not set. Database operations will fail.")
    else:
        init_db()
        
    server = HTTPServer(('', port), Handler)
    server.serve_forever()
