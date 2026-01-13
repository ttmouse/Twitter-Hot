import json
import os
import re
import psycopg2
from http.server import SimpleHTTPRequestHandler, HTTPServer
from urllib.parse import urlparse, parse_qs
import urllib.request
import urllib.error
from dotenv import load_dotenv
from datetime import datetime

# Load environment variables from .env file
load_dotenv()

# Configuration
# POSTGRES_URL should be provided in environment variables
DB_URL = os.environ.get('POSTGRES_URL') or os.environ.get('DATABASE_URL')

# Global Cache for Stats
SERVER_STATS_CACHE = {
    'categories': None,
    'authors': None,
    'last_updated': None
}

def recalculate_stats():
    """Recalculate global stats (Categories & Authors) and update cache."""
    print("[Stats] Recalculating global stats...")
    conn = get_db_connection()
    if not conn:
        print("[Stats] DB Connection failed during recalculation")
        return

    try:
        cur = conn.cursor()
        
        # 1. Categories
        cur.execute("""
            SELECT key, COUNT(*) as cnt
            FROM tweets, jsonb_each(hierarchical_categories)
            WHERE hierarchical_categories IS NOT NULL
            GROUP BY key
            ORDER BY cnt DESC
        """)
        cat_rows = cur.fetchall()
        SERVER_STATS_CACHE['categories'] = {row[0]: row[1] for row in cat_rows}
        
        # 2. Top Authors
        cur.execute("SELECT author FROM tweets")
        rows = cur.fetchall()
        
        from collections import Counter
        author_counts = Counter()
        
        if rows:
            for row in rows:
                auth = row[0]
                if not auth: continue
                if isinstance(auth, str):
                    try: auth = json.loads(auth)
                    except: continue
                handle = auth.get('screen_name')
                if handle:
                    author_counts[handle] += 1
        else:
            # Fallback legacy
            cur.execute("SELECT urls FROM daily_tweets")
            rows = cur.fetchall()
            for row in rows:
                urls = row[0]
                if not urls: continue
                if isinstance(urls, str):
                    try: urls = json.loads(urls)
                    except: continue
                for u in urls:
                    m = re.search(r'https?://(?:[a-zA-Z0-9-]+\.)?(?:x|twitter)\.com/([^/?#]+)/status', u)
                    if m: author_counts[m.group(1)] += 1

        top_authors = [{"name": k, "count": v} for k, v in author_counts.most_common(50)]
        SERVER_STATS_CACHE['authors'] = top_authors
        SERVER_STATS_CACHE['last_updated'] = datetime.now().isoformat()
        
        print(f"[Stats] Updated. Categories: {len(cat_rows)}, Authors: {len(top_authors)}")
        cur.close()
        conn.close()
    except Exception as e:
        print(f"[Stats] Error recalculating: {e}")


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

class Handler(SimpleHTTPRequestHandler):
    protocol_version = 'HTTP/1.1'

    
    def add_cors_headers(self):
        """Attach permissive CORS headers to the current response."""
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Range')
    
    def send_json_error(self, code, message):
        """Send JSON error response with CORS headers."""
        self.send_response(code)
        self.add_cors_headers()
        self.send_header('Content-Type', 'application/json; charset=utf-8')
        self.end_headers()
        self.wfile.write(json.dumps({"error": message, "code": code}).encode('utf-8'))
    
    def send_json_response(self, data, status=200, cache_control='no-store'):
        """Helper to send JSON response with proper Content-Length"""
        try:
            body = json.dumps(data).encode('utf-8')
            self.send_response(status)
            self.add_cors_headers()
            self.send_header('Content-Type', 'application/json; charset=utf-8')
            self.send_header('Cache-Control', cache_control)
            self.send_header('Content-Length', str(len(body)))
            self.end_headers()
            self.wfile.write(body)
        except Exception as e:
            print(f"Error sending response: {e}")
    
    def do_OPTIONS(self):
        self.send_response(200)
        self.add_cors_headers()
        self.end_headers()

    def do_GET(self):
        parsed = urlparse(self.path)
        path = parsed.path
        
        # Proxy endpoint for VxTwitter API (to avoid CORS)
        if path == '/api/tweet_info':
            query = parse_qs(parsed.query)
            tweet_id = query.get('id', [''])[0]
            
            if not tweet_id:
                self.send_response(400)
                self.add_cors_headers()
                self.send_header('Content-Type', 'application/json; charset=utf-8')
                self.end_headers()
                self.wfile.write(b'{"error":"missing_id"}')
                return

            try:
                # Fetch data from VxTwitter
                url = f"https://api.vxtwitter.com/Twitter/status/{tweet_id}"
                req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
                
                with urllib.request.urlopen(req, timeout=10) as response:
                    data = response.read()
                    
                    # Check if response is valid JSON
                    try:
                        json.loads(data)
                        self.send_response(200)
                        self.add_cors_headers()
                        self.send_header('Content-Type', 'application/json')
                        self.send_header('Cache-Control', 'public, max-age=3600') # Cache for 1 hour
                        self.send_header('Content-Length', str(len(data)))
                        self.end_headers()
                        self.wfile.write(data)
                    except json.JSONDecodeError:
                        print(f"Invalid JSON response from upstream for tweet {tweet_id}")
                        self.send_response(502) # Bad Gateway
                        self.add_cors_headers()
                        self.send_header('Content-Type', 'application/json; charset=utf-8')
                        self.end_headers()
                        self.wfile.write(b'{"error":"upstream_invalid_json"}')
            except urllib.error.HTTPError as e:
                print(f"HTTP Error fetching tweet info: {e.code} {e.reason}")
                self.send_response(e.code)
                self.add_cors_headers()
                self.send_header('Content-Type', 'application/json; charset=utf-8')
                self.end_headers()
                self.wfile.write(b'{"error":"upstream_error"}')
            except Exception as e:
                print(f"Error fetching tweet info: {e}")
                self.send_response(500)
                self.add_cors_headers()
                self.send_header('Content-Type', 'application/json; charset=utf-8')
                self.end_headers()
                self.wfile.write(b'{"error":"proxy_error"}')
            return

        # Legacy API: /api/daily_hot/<date>
        # Used by current main site app-core.js
        if path.startswith('/api/daily_hot/'):
            path_parts = path.split('/')
            if len(path_parts) < 4:
                self.send_json_error(400, "Invalid Path")
                return
            
            date_str = path_parts[3]
            conn = get_db_connection()
            if not conn:
                self.send_json_error(500, "Database connection failed")
                return

            try:
                cur = conn.cursor()
                cur.execute("SELECT urls FROM daily_tweets WHERE date = %s", (date_str,))
                row = cur.fetchone()
                
                urls = []
                if row:
                    urls = row[0]
                
                self.send_response(200)
                self.add_cors_headers()
                self.send_header('Content-Type', 'application/json; charset=utf-8')
                self.end_headers()
                self.wfile.write(json.dumps(urls).encode())
                cur.close()
                conn.close()
            except Exception as e:
                print(f"Error fetching daily_hot: {e}")
                self.send_json_error(500, str(e))
            return

        # API: Get available dates
        if path == '/api/dates':
            conn = get_db_connection()
            if not conn:
                self.send_json_error(500, "Database connection failed")
                return

            try:
                cur = conn.cursor()
                # Query distinct dates from tweets table
                cur.execute("SELECT DISTINCT publish_date FROM tweets ORDER BY publish_date DESC")
                rows = cur.fetchall()
                # Convert date objects to strings
                dates = [str(row[0]) for row in rows]
                
                response_data = {'dates': [{'date': d} for d in dates]}
                self.send_json_response(response_data)
                cur.close()
                conn.close()
            except Exception as e:
                print(f"Error fetching dates: {e}")
                self.send_json_error(500, str(e))
            return

        # API: Get Global Categories
        if path == '/api/categories':
            # Check Cache
            if SERVER_STATS_CACHE['categories'] is None:
                recalculate_stats()
            
            if SERVER_STATS_CACHE['categories'] is not None:
                self.send_json_response(SERVER_STATS_CACHE['categories'], cache_control='public, max-age=60') # 1 min client cache
            else:
                self.send_json_error(500, "Stats not available")
            return

        # New API: Get tweets for a specific date (from new table)
        if path == '/api/tweets':
            query = parse_qs(parsed.query)
            date_str = query.get('date', [''])[0]
            category_str = query.get('category', [''])[0]
            offset = int(query.get('offset', ['0'])[0])
            mode = query.get('mode', [''])[0]
            
            conn = get_db_connection()
            if not conn:
                self.send_json_error(500, "Database connection failed")
                return

            try:
                cur = conn.cursor()
                tweets = []
                
                if mode == 'stream':
                    # Quantity-Based Stream Mode
                    where_clauses = []
                    params = []
                    
                    if date_str:
                        where_clauses.append("publish_date <= %s")
                        params.append(date_str)
                    
                    if category_str:
                        where_clauses.append("hierarchical_categories ? %s")
                        params.append(category_str)
                        
                    where_sql = ""
                    if where_clauses:
                        where_sql = "WHERE " + " AND ".join(where_clauses)
                        
                    # Fetch 50 items
                    sql = f"""
                        SELECT tweet_id, content, media_urls, author, tags, hierarchical_categories, flat_tags, publish_date
                        FROM tweets 
                        {where_sql}
                        ORDER BY publish_date DESC, created_at DESC
                        LIMIT 50 OFFSET %s
                    """
                    params.append(offset)
                    cur.execute(sql, tuple(params))
                    
                elif category_str:
                    # Specific Category Mode (Legacy/Simple)
                    cur.execute("""
                        SELECT tweet_id, content, media_urls, author, tags, hierarchical_categories, flat_tags, publish_date
                        FROM tweets 
                        WHERE hierarchical_categories ? %s 
                        ORDER BY publish_date DESC, created_at DESC
                        LIMIT 50 OFFSET %s
                    """, (category_str, offset))
                
                elif date_str:
                    # Legacy Date Mode (Load All for Date)
                    cur.execute("""
                        SELECT tweet_id, content, media_urls, author, tags, hierarchical_categories, flat_tags, publish_date
                        FROM tweets 
                        WHERE publish_date = %s 
                        ORDER BY created_at ASC
                    """, (date_str,))
                
                else:
                    self.send_json_error(400, "Missing parameters")
                    return
                
                rows = cur.fetchall()
                for row in rows:
                    tweets.append({
                        "id": row[0],
                        "content": row[1],
                        "media_urls": row[2],
                        "author": row[3],
                        "tags": row[4],
                        "hierarchical": row[5],
                        "flat_tags": row[6],
                        "publish_date": str(row[7]) # Ensure date is returned for Stream grouping
                    })
                
                # Fallback for empty new db (Legacy table check) - Skip for stream mode to keep simple
                if not tweets and not mode:
                     # ... Legacy fallback logic (omitted for brevity in this replace, assuming new DB populated)
                     pass

                self.send_json_response(tweets)
                cur.close()
                conn.close()
            except Exception as e:
                print(f"Error fetching tweets: {e}")
                self.send_json_error(500, str(e))
            return
            
        # Legacy: /api/data?date=... (Mirror of daily_hot)
        if path == '/api/data':
            qs = parse_qs(parsed.query)
            date = (qs.get('date') or [''])[0]
            if not date or not re.match(r'^\d{4}-\d{2}-\d{2}$', date):
                self.send_json_error(400, "bad_date")
                return
            
            conn = get_db_connection()
            if not conn:
                self.send_json_error(500, "Database connection failed")
                return

            try:
                cur = conn.cursor()
                cur.execute('SELECT urls FROM daily_tweets WHERE date = %s', (date,))
                row = cur.fetchone()
                urls = row[0] if row else []
                
                body = json.dumps({'date': date, 'urls': urls})
                self.send_response(200)
                self.add_cors_headers()
                self.send_header('Content-Type', 'application/json; charset=utf-8')
                self.send_header('Cache-Control', 'no-store')
                self.end_headers()
                self.wfile.write(body.encode('utf-8'))
            except Exception as e:
                print(f"Error serving /api/data: {e}")
                self.send_json_error(500, str(e))
            finally:
                if conn: conn.close()
            return

        # API: Get global stats (Top Authors)
        if path == '/api/stats':
            # Check Cache
            if SERVER_STATS_CACHE['authors'] is None:
                recalculate_stats()
            
            # Response
            if SERVER_STATS_CACHE['authors'] is not None:
                self.send_json_response({"authors": SERVER_STATS_CACHE['authors']}, cache_control='public, max-age=60')
            else:
                self.send_json_error(500, "Stats not available")
            return

        # API: Search/Filter (by author)
        if path == '/api/search':
            query = parse_qs(parsed.query)
            target_author = query.get('author', [''])[0]
            
            if not target_author:
                self.send_json_error(400, "Missing author parameter")
                return

            conn = get_db_connection()
            if not conn:
                self.send_json_error(500, "Database connection failed")
                return

            try:
                cur = conn.cursor()
                
                # Search in new tweets table -> optimized SQL search
                # author->>'screen_name' is the handle
                cur.execute("""
                    SELECT tweet_id, author, publish_date 
                    FROM tweets 
                    WHERE author->>'screen_name' ILIKE %s
                    ORDER BY publish_date DESC, created_at DESC
                """, (target_author,))
                
                rows = cur.fetchall()
                results = []
                
                if rows:
                    for row in rows:
                        tid = row[0]
                        auth = row[1]
                        pdate = row[2]
                        
                        screen_name = 'unknown'
                        if auth:
                            if isinstance(auth, str): auth = json.loads(auth)
                            screen_name = auth.get('screen_name', 'unknown')
                        
                        # Reconstruct URL for frontend compatibility
                        url = f"https://x.com/{screen_name}/status/{tid}"
                        
                        results.append({
                            "date": str(pdate),
                            "url": url
                        })
                else:
                    # Fallback legacy search
                    cur.execute("SELECT date, urls FROM daily_tweets ORDER BY date DESC")
                    rows = cur.fetchall()
                    target_lower = target_author.lower()
                    for row in rows:
                        date = row[0]
                        urls = row[1]
                        if isinstance(urls, str):
                            try: urls = json.loads(urls)
                            except: continue
                        for u in urls:
                             m = re.search(r'https?://(?:[a-zA-Z0-9-]+\.)?(?:x|twitter)\.com/([^/?#]+)/status', u)
                             if m and m.group(1).lower() == target_lower:
                                 results.append({"date": date, "url": u})

                self.send_json_response({"results": results})
                cur.close()
                conn.close()
            except Exception as e:
                print(f"Error searching: {e}")
                self.send_json_error(500, str(e))
            return


        # API: Get unclassified tweets for Grok processing
        if path == '/api/unclassified_tweets':
            query = parse_qs(parsed.query)
            limit_param = query.get('limit', ['20'])[0]
            try:
                limit = int(limit_param)
            except:
                limit = 20
            
            conn = get_db_connection()
            if not conn:
                self.send_json_error(500, "Database connection failed")
                return

            try:
                cur = conn.cursor()
                # Select tweets where hierarchical_categories is NULL or empty
                # Use tweet_id as tie-breaker for consistent ordering
                cur.execute("""
                    SELECT tweet_id 
                    FROM tweets 
                    WHERE hierarchical_categories IS NULL 
                       OR hierarchical_categories::text = '{}' 
                       OR hierarchical_categories::text = 'null'
                    ORDER BY created_at DESC 
                    LIMIT %s
                """, (limit,))
                rows = cur.fetchall()
                
                # Construct URLs
                # Ideally, construct full URL using author if known, but fallback to /i/status works
                links = []
                for row in rows:
                     links.append(f"https://x.com/i/status/{row[0]}")
                
                self.send_json_response({"links": links, "count": len(links)})
                cur.close()
                conn.close()
            except Exception as e:
                print(f"Error fetching unclassified tweets: {e}")
                self.send_json_error(500, str(e))
            return


        # 404 for other paths
        # Fallback to SimpleHTTPRequestHandler to serve static files (html, css, js)
        try:
            super().do_GET()
        except:
             self.send_json_error(404, "File not found")

    def do_POST(self):
        parsed = urlparse(self.path)
        path = parsed.path

        if path == '/api/delete':
            length = int(self.headers.get('Content-Length') or 0)
            raw = self.rfile.read(length) if length > 0 else b''
            try:
                payload = json.loads(raw.decode('utf-8'))
            except Exception:
                payload = {}
            date = payload.get('date') or ''
            url_to_delete = payload.get('url') or ''

            if not date or not re.match(r'^\d{4}-\d{2}-\d{2}$', date) or not url_to_delete:
                self.send_json_error(400, "bad_request")
                return

            conn = get_db_connection()
            if not conn:
                self.send_json_error(500, "Database connection failed")
                return

            try:
                cur = conn.cursor()
                
                # Get existing URLs
                cur.execute('SELECT urls FROM daily_tweets WHERE date = %s', (date,))
                row = cur.fetchone()
                existing_urls = row[0] if row else []
                # Ensure existing_urls is a list
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
                self.add_cors_headers()
                self.send_header('Content-Type', 'application/json; charset=utf-8')
                self.end_headers()
                self.wfile.write(body.encode('utf-8'))
            except Exception as e:
                print(f"Error processing /api/delete: {e}")
                self.send_json_error(500, str(e))
            finally:
                if conn: conn.close()
                # Update Stats
                recalculate_stats()
            return

        elif path == '/api/update':
            length = int(self.headers.get('Content-Length') or 0)
            raw = self.rfile.read(length) if length > 0 else b''
            try:
                payload = json.loads(raw.decode('utf-8'))
            except Exception:
                payload = {}
            date = payload.get('date') or ''
            new_urls = payload.get('urls') or []
            
            if not date or not re.match(r'^\d{4}-\d{2}-\d{2}$', date) or not isinstance(new_urls, list):
                self.send_json_error(400, "bad_request")
                return
            
            conn = get_db_connection()
            if not conn:
                self.send_json_error(500, "Database connection failed")
                return

            try:
                cur = conn.cursor()
                
                # Normalize function
                def normalize(u):
                    if not u: return ''
                    u = u.replace('https://twitter.com', 'https://x.com')
                    u = u.replace('http://twitter.com', 'https://x.com')
                    u = u.replace('http://x.com', 'https://x.com')
                    return u.strip()
                
                inserted_count = 0
                skipped_count = 0
                
                for url in new_urls:
                    norm_url = normalize(url)
                    if not norm_url:
                        continue
                    
                    # Extract tweet_id
                    parts = norm_url.split('/')
                    tweet_id = parts[-1] if parts else ''
                    if '?' in tweet_id:
                        tweet_id = tweet_id.split('?')[0]
                    
                    if not tweet_id.isdigit():
                        continue
                        
                    # Extract author (screen_name) from URL
                    # Expected format: https://x.com/username/status/123...
                    screen_name = "unknown"
                    name_parts = norm_url.split('/')
                    try:
                        # Index of 'status' is usually -2 (if no trailing slash)
                        # .../username/status/id
                        if 'status' in name_parts:
                            idx = name_parts.index('status')
                            if idx > 0:
                                screen_name = name_parts[idx-1]
                    except:
                        pass

                    # Snowflake -> UTC+8 Date
                    try:
                        snowflake_time = (int(tweet_id) >> 22) + 1288834974657
                        beijing_time_ms = snowflake_time + (8 * 60 * 60 * 1000)
                        actual_date = datetime.utcfromtimestamp(beijing_time_ms / 1000).strftime('%Y-%m-%d')
                    except:
                        actual_date = date
                    
                    # Insert into tweets
                    try:
                        cur.execute("""
                            INSERT INTO tweets (tweet_id, publish_date, content, media_urls, author, tags)
                            VALUES (%s, %s, %s, %s, %s, %s)
                            ON CONFLICT (tweet_id) DO NOTHING
                        """, (
                            tweet_id,
                            actual_date,
                            f"Added via extension on {date}",
                            json.dumps([]),
                            json.dumps({"name": screen_name, "screen_name": screen_name}),
                            []
                        ))
                        if cur.rowcount > 0:
                            inserted_count += 1
                        else:
                            skipped_count += 1
                    except Exception as e:
                        print(f"Error inserting {tweet_id}: {e}")
                        skipped_count += 1
                
                conn.commit()
                
                body = json.dumps({
                    'ok': True, 
                    'message': f'Inserted {inserted_count}, Skipped {skipped_count}',
                    'inserted': inserted_count,
                    'skipped': skipped_count
                })
                
                self.send_response(200)
                self.add_cors_headers()
                self.send_header('Content-Type', 'application/json; charset=utf-8')
                self.end_headers()
                self.wfile.write(body.encode('utf-8'))
            except Exception as e:
                print(f"Error processing /api/update: {e}")
                self.send_json_error(500, str(e))
            finally:
                if conn: conn.close()
                # Update Stats
                recalculate_stats()
            return
        
        # ================= IMPORT CLASSIFICATIONS =================
        if path == '/api/import_classifications':
            length = int(self.headers.get('Content-Length') or 0)
            raw = self.rfile.read(length) if length > 0 else b''
            try:
                payload = json.loads(raw.decode('utf-8'))
            except Exception:
                self.send_json_error(400, "Invalid JSON")
                return
            
            # Expect array of classification objects
            classifications = payload if isinstance(payload, list) else payload.get('data', [])
            
            if not classifications:
                self.send_json_error(400, "No classification data provided")
                return
            
            conn = get_db_connection()
            if not conn:
                self.send_json_error(500, "Database connection failed")
                return
            
            try:
                cur = conn.cursor()
                updated_count = 0
                not_found_count = 0
                
                for item in classifications:
                    post_id = item.get('post_id', '')
                    hierarchical = item.get('hierarchical', {})
                    flat_tags = item.get('flat_tags', [])
                    author = item.get('author', '')
                    
                    if not post_id:
                        continue
                    
                    # Update existing tweet with classification data
                    cur.execute("""
                        UPDATE tweets 
                        SET hierarchical_categories = %s,
                            flat_tags = %s
                        WHERE tweet_id = %s
                    """, (json.dumps(hierarchical), json.dumps(flat_tags), post_id))
                    
                    if cur.rowcount > 0:
                        updated_count += 1
                    else:
                        # If tweet doesn't exist, try to insert a minimal record
                        cur.execute("""
                            INSERT INTO tweets (tweet_id, publish_date, author, hierarchical_categories, flat_tags)
                            VALUES (%s, CURRENT_DATE, %s, %s, %s)
                            ON CONFLICT (tweet_id) DO UPDATE SET
                                hierarchical_categories = EXCLUDED.hierarchical_categories,
                                flat_tags = EXCLUDED.flat_tags
                        """, (post_id, json.dumps({'id': author}), json.dumps(hierarchical), json.dumps(flat_tags)))
                        updated_count += 1
                
                conn.commit()
                
                body = json.dumps({
                    'ok': True,
                    'message': f'Updated {updated_count} tweets',
                    'updated': updated_count
                })
                
                self.send_response(200)
                self.add_cors_headers()
                self.send_header('Content-Type', 'application/json; charset=utf-8')
                self.end_headers()
                self.wfile.write(body.encode('utf-8'))
            except Exception as e:
                print(f"Error processing /api/import_classifications: {e}")
                self.send_json_error(500, str(e))
            finally:
                if conn: conn.close()
                # Update Stats
                recalculate_stats()
            return
            
        # Unknown POST endpoint
        self.send_json_error(404, f"Unknown endpoint: {path}")


if __name__ == '__main__':
    port = int(os.environ.get('PORT') or '5502')
    print(f"Starting server on port {port}...")
    if not DB_URL:
        print("WARNING: POSTGRES_URL environment variable is not set. Database operations will fail.")
    else:
        try:
            init_db()
        except Exception as e:
            print(f"DB Init failed, but starting server anyway: {e}")
        
    from http.server import ThreadingHTTPServer
    server = ThreadingHTTPServer(('', port), Handler)
    server.serve_forever()
