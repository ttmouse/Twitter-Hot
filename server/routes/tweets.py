import json
import re
import urllib.request
import urllib.error
from urllib.parse import parse_qs, urlparse
from ..db import get_db_connection


def handle_tweet_info(handler, parsed_url):
    query = parse_qs(parsed_url.query)
    tweet_id = query.get("id", [""])[0]

    if not tweet_id:
        handler.send_json_error(400, "missing_id")
        return

    try:
        # Fetch data from VxTwitter
        url = f"https://api.vxtwitter.com/Twitter/status/{tweet_id}"
        req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})

        with urllib.request.urlopen(req, timeout=10) as response:
            data = response.read()

            # Check if response is valid JSON
            try:
                json.loads(data)
                handler.send_response(200)
                handler.add_cors_headers()
                handler.send_header("Content-Type", "application/json")
                handler.send_header(
                    "Cache-Control", "public, max-age=3600"
                )  # Cache for 1 hour
                handler.send_header("Content-Length", str(len(data)))
                handler.end_headers()
                handler.wfile.write(data)
            except json.JSONDecodeError:
                print(f"Invalid JSON response from upstream for tweet {tweet_id}")
                handler.send_json_error(502, "upstream_invalid_json")
    except urllib.error.HTTPError as e:
        print(f"HTTP Error fetching tweet info: {e.code} {e.reason}")
        handler.send_json_error(e.code, "upstream_error")
    except Exception as e:
        print(f"Error fetching tweet info: {e}")
        handler.send_json_error(500, "proxy_error")


def handle_daily_hot(handler, path):
    path_parts = path.split("/")
    if len(path_parts) < 4:
        handler.send_json_error(400, "Invalid Path")
        return

    date_str = path_parts[3]
    conn = get_db_connection()
    if not conn:
        handler.send_json_error(500, "Database connection failed")
        return

    try:
        cur = conn.cursor()
        cur.execute("SELECT urls FROM daily_tweets WHERE date = %s", (date_str,))
        row = cur.fetchone()

        urls = []
        if row:
            urls = row[0]

        handler.send_json_response(urls)
        cur.close()
        conn.close()
    except Exception as e:
        print(f"Error fetching daily_hot: {e}")
        handler.send_json_error(500, str(e))


def handle_tweets(handler, parsed_url):
    query = parse_qs(parsed_url.query)
    date_str = query.get("date", [""])[0]
    category_str = query.get("category", [""])[0]
    author_str = query.get("author", [""])[0]
    offset = int(query.get("offset", ["0"])[0])
    mode = query.get("mode", [""])[0]

    conn = get_db_connection()
    if not conn:
        handler.send_json_error(500, "Database connection failed")
        return

    try:
        cur = conn.cursor()
        tweets = []

        if mode == "stream":
            # Quantity-Based Stream Mode
            where_clauses = []
            params = []

            if date_str:
                where_clauses.append("publish_date <= %s")
                params.append(date_str)

            if category_str:
                where_clauses.append(
                    "(hierarchical_categories ? %s OR EXISTS (SELECT 1 FROM jsonb_each(hierarchical_categories) WHERE jsonb_typeof(value) = 'array' AND value ? %s))"
                )
                params.append(category_str)
                params.append(category_str)

            if author_str:
                # Filter by author screen_name inside JSONB
                # author->>'screen_name' is the format
                # Using ILIKE for case-insensitive matching
                where_clauses.append("author->>'screen_name' ILIKE %s")
                params.append(author_str)

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
            print(f"[DEBUG] SQL: {sql}")
            params.append(offset)
            print(f"[DEBUG] Params: {params}")
            cur.execute(sql, tuple(params))

        elif category_str:
            # Specific Category Mode (Legacy/Simple)
            cur.execute(
                """
                SELECT tweet_id, content, media_urls, author, tags, hierarchical_categories, flat_tags, publish_date
                FROM tweets 
                WHERE hierarchical_categories ? %s 
                   OR EXISTS (SELECT 1 FROM jsonb_each(hierarchical_categories) WHERE jsonb_typeof(value) = 'array' AND value ? %s)
                ORDER BY publish_date DESC, created_at DESC
                LIMIT 50 OFFSET %s
            """,
                (category_str, category_str, offset),
            )

        elif date_str:
            # Legacy Date Mode (Load All for Date)
            cur.execute(
                """
                SELECT tweet_id, content, media_urls, author, tags, hierarchical_categories, flat_tags, publish_date
                FROM tweets 
                WHERE publish_date = %s 
                ORDER BY created_at ASC
            """,
                (date_str,),
            )

        else:
            handler.send_json_error(400, "Missing parameters")
            return

        rows = cur.fetchall()
        print(f"[DEBUG] Fetched {len(rows)} rows")
        for row in rows:
            tweets.append(
                {
                    "id": row[0],
                    "content": row[1],
                    "media_urls": row[2],
                    "author": row[3],
                    "tags": row[4],
                    "hierarchical": row[5],
                    "flat_tags": row[6],
                    "publish_date": str(
                        row[7]
                    ),  # Ensure date is returned for Stream grouping
                }
            )

        handler.send_json_response(tweets)
        cur.close()
        conn.close()
    except Exception as e:
        print(f"Error fetching tweets: {e}")
        handler.send_json_error(500, str(e))


def handle_legacy_data(handler, parsed_url):
    qs = parse_qs(parsed_url.query)
    date = (qs.get("date") or [""])[0]
    if not date or not re.match(r"^\d{4}-\d{2}-\d{2}$", date):
        handler.send_json_error(400, "bad_date")
        return

    conn = get_db_connection()
    if not conn:
        handler.send_json_error(500, "Database connection failed")
        return

    try:
        cur = conn.cursor()
        cur.execute("SELECT urls FROM daily_tweets WHERE date = %s", (date,))
        row = cur.fetchone()
        urls = row[0] if row else []

        if not urls:
            cur.execute(
                "SELECT tweet_id, author FROM tweets WHERE publish_date = %s ORDER BY created_at ASC",
                (date,),
            )
            rows = cur.fetchall()
            urls = []
            for row in rows:
                tweet_id = row[0]
                author = row[1]
                screen_name = "unknown"
                if author:
                    try:
                        if isinstance(author, str):
                            author = json.loads(author)
                        screen_name = author.get("screen_name", "unknown")
                    except Exception:
                        screen_name = "unknown"
                if screen_name == "unknown":
                    urls.append(f"https://x.com/i/status/{tweet_id}")
                else:
                    urls.append(f"https://x.com/{screen_name}/status/{tweet_id}")

        handler.send_json_response({"date": date, "urls": urls})
    except Exception as e:
        print(f"Error serving /api/data: {e}")
        handler.send_json_error(500, str(e))
    finally:
        if conn:
            conn.close()


def handle_search(handler, parsed_url):
    query = parse_qs(parsed_url.query)
    target_author = query.get("author", [""])[0]

    if not target_author:
        handler.send_json_error(400, "Missing author parameter")
        return

    conn = get_db_connection()
    if not conn:
        handler.send_json_error(500, "Database connection failed")
        return

    try:
        cur = conn.cursor()

        # Search in new tweets table -> optimized SQL search
        # author->>'screen_name' is the handle
        cur.execute(
            """
            SELECT tweet_id, author, publish_date 
            FROM tweets 
            WHERE author->>'screen_name' ILIKE %s
            ORDER BY publish_date DESC, created_at DESC
        """,
            (target_author,),
        )

        rows = cur.fetchall()
        results = []

        if rows:
            for row in rows:
                tid = row[0]
                auth = row[1]
                pdate = row[2]

                screen_name = "unknown"
                if auth:
                    if isinstance(auth, str):
                        auth = json.loads(auth)
                    screen_name = auth.get("screen_name", "unknown")

                # Reconstruct URL for frontend compatibility
                url = f"https://x.com/{screen_name}/status/{tid}"

                results.append({"date": str(pdate), "url": url})
        else:
            # Fallback legacy search
            cur.execute("SELECT date, urls FROM daily_tweets ORDER BY date DESC")
            rows = cur.fetchall()
            target_lower = target_author.lower()
            for row in rows:
                date = row[0]
                urls = row[1]
                if isinstance(urls, str):
                    try:
                        urls = json.loads(urls)
                    except:
                        continue
                for u in urls:
                    m = re.search(
                        r"https?://(?:[a-zA-Z0-9-]+\.)?(?:x|twitter)\.com/([^/?#]+)/status",
                        u,
                    )
                    if m and m.group(1).lower() == target_lower:
                        results.append({"date": date, "url": u})

        handler.send_json_response({"results": results})
        cur.close()
        conn.close()
    except Exception as e:
        print(f"Error searching: {e}")
        handler.send_json_error(500, str(e))


def handle_unclassified_tweets(handler, parsed_url):
    query = parse_qs(parsed_url.query)
    limit_param = query.get("limit", ["20"])[0]
    try:
        limit = int(limit_param)
    except:
        limit = 20

    conn = get_db_connection()
    if not conn:
        handler.send_json_error(500, "Database connection failed")
        return

    try:
        cur = conn.cursor()
        # Select tweets where hierarchical_categories is NULL or empty
        # Use tweet_id as tie-breaker for consistent ordering
        cur.execute(
            """
            SELECT tweet_id 
            FROM tweets 
            WHERE hierarchical_categories IS NULL 
                OR hierarchical_categories::text = '{}' 
                OR hierarchical_categories::text = 'null'
            ORDER BY created_at DESC 
            LIMIT %s
        """,
            (limit,),
        )
        rows = cur.fetchall()

        # Construct URLs
        # Ideally, construct full URL using author if known, but fallback to /i/status works
        links = []
        for row in rows:
            links.append(f"https://x.com/i/status/{row[0]}")

        handler.send_json_response({"links": links, "count": len(links)})
        cur.close()
        conn.close()
    except Exception as e:
        print(f"Error fetching unclassified tweets: {e}")
        handler.send_json_error(500, str(e))
