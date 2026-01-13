from ..cache import SERVER_STATS_CACHE, recalculate_stats
from ..db import get_db_connection

def handle_dates(handler):
    conn = get_db_connection()
    if not conn:
        handler.send_json_error(500, "Database connection failed")
        return

    try:
        cur = conn.cursor()
        # Query distinct dates from tweets table
        cur.execute("SELECT DISTINCT publish_date FROM tweets ORDER BY publish_date DESC")
        rows = cur.fetchall()
        # Convert date objects to strings
        dates = [str(row[0]) for row in rows]
        
        # Fallback to daily_tweets if no dates found (Migration/Legacy Support)
        if not dates:
            print("Warning: No dates in 'tweets' table, checking 'daily_tweets'")
            cur.execute("SELECT DISTINCT date FROM daily_tweets ORDER BY date DESC")
            rows = cur.fetchall()
            dates = [str(row[0]) for row in rows]

        response_data = {'dates': [{'date': d} for d in dates]}
        handler.send_json_response(response_data)
        cur.close()
        conn.close()
    except Exception as e:
        print(f"Error fetching dates: {e}")
        handler.send_json_error(500, str(e))

def handle_categories(handler):
    # Check Cache
    if SERVER_STATS_CACHE['categories'] is None:
        recalculate_stats()
    
    if SERVER_STATS_CACHE['categories'] is not None:
        handler.send_json_response(SERVER_STATS_CACHE['categories'], cache_control='public, max-age=60') # 1 min client cache
    else:
        handler.send_json_error(500, "Stats not available")

def handle_stats(handler):
    # Check Cache
    if SERVER_STATS_CACHE['authors'] is None:
        recalculate_stats()
    
    # Response
    if SERVER_STATS_CACHE['authors'] is not None:
        handler.send_json_response({"authors": SERVER_STATS_CACHE['authors']}, cache_control='public, max-age=60')
    else:
        handler.send_json_error(500, "Stats not available")
