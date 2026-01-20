import json
import re
from collections import Counter
from datetime import datetime
from .db import get_db_connection

# Global Cache for Stats
SERVER_STATS_CACHE = {
    'categories': None,
    'authors': None,
    'tags': None,
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
        cur.execute("SELECT hierarchical_categories FROM tweets WHERE hierarchical_categories IS NOT NULL")
        cat_rows_raw = cur.fetchall()
        
        category_stats = {} # { parent: { "count": X, "children": { child: Y } } }
        for row in cat_rows_raw:
            h_cats = row[0]
            if not h_cats: continue
            if isinstance(h_cats, str):
                try: h_cats = json.loads(h_cats)
                except: continue
            
            if not isinstance(h_cats, dict): continue
            
            for parent, children in h_cats.items():
                if parent not in category_stats:
                    category_stats[parent] = {"count": 0, "children": {}}
                category_stats[parent]["count"] += 1
                
                if isinstance(children, list):
                    for child in children:
                        if not child: continue
                        if child not in category_stats[parent]["children"]:
                            category_stats[parent]["children"][child] = 0
                        category_stats[parent]["children"][child] += 1
        
        SERVER_STATS_CACHE['categories'] = category_stats
        
        # 2. Flat Tags
        cur.execute("SELECT flat_tags FROM tweets WHERE flat_tags IS NOT NULL")
        tag_rows = cur.fetchall()
        
        tag_counts = Counter()
        for row in tag_rows:
            tags = row[0]
            if not tags: continue
            if isinstance(tags, str):
                try: tags = json.loads(tags)
                except: continue
            if isinstance(tags, list):
                for tag in tags:
                    if tag and isinstance(tag, str):
                        tag_counts[tag] += 1
        
        # Return top 200 tags sorted by count
        top_tags = [{"name": k, "count": v} for k, v in tag_counts.most_common(200)]
        SERVER_STATS_CACHE['tags'] = top_tags
        
        # 3. Top Authors
        cur.execute("SELECT author FROM tweets")
        rows = cur.fetchall()
        
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
        
        print(f"[Stats] Updated. Categories: {len(category_stats)}, Tags: {len(top_tags)}, Authors: {len(top_authors)}")
        cur.close()
        conn.close()
    except Exception as e:
        print(f"[Stats] Error recalculating: {e}")
