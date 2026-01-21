import json
import re
from datetime import datetime, timedelta
from ..db import get_db_connection
from ..cache import recalculate_stats


def handle_delete_by_id(handler, payload):
    tweet_id = payload.get("tweet_id") or ""

    if not tweet_id or not re.match(r"^\d{10,}$", tweet_id):
        handler.send_json_error(400, "invalid_tweet_id")
        return

    conn = get_db_connection()
    if not conn:
        handler.send_json_error(500, "Database connection failed")
        return

    try:
        cur = conn.cursor()
        cur.execute("DELETE FROM tweets WHERE tweet_id = %s", (tweet_id,))
        deleted = cur.rowcount
        conn.commit()

        if deleted > 0:
            recalculate_stats()
            handler.send_json_response(
                {"ok": True, "message": f"Deleted tweet {tweet_id}"}
            )
        else:
            handler.send_json_response({"ok": False, "message": "Tweet not found"})
    except Exception as e:
        print(f"Error deleting tweet: {e}")
        handler.send_json_error(500, str(e))
    finally:
        if conn:
            conn.close()


def handle_delete(handler, payload):
    date = payload.get("date") or ""
    url_to_delete = payload.get("url") or ""

    if not date or not re.match(r"^\d{4}-\d{2}-\d{2}$", date) or not url_to_delete:
        handler.send_json_error(400, "bad_request")
        return

    conn = get_db_connection()
    if not conn:
        handler.send_json_error(500, "Database connection failed")
        return

    try:
        cur = conn.cursor()

        # Get existing URLs
        cur.execute("SELECT urls FROM daily_tweets WHERE date = %s", (date,))
        row = cur.fetchone()
        existing_urls = row[0] if row else []
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
            cur.execute(
                """
                INSERT INTO daily_tweets (date, urls) 
                VALUES (%s, %s) 
                ON CONFLICT (date) 
                DO UPDATE SET urls = %s, created_at = CURRENT_TIMESTAMP
            """,
                (date, json.dumps(existing_urls), json.dumps(existing_urls)),
            )

            conn.commit()

            body = {"ok": True, "message": "Deleted successfully"}
        else:
            body = {"ok": False, "message": "URL not found"}

        handler.send_json_response(body)
    except Exception as e:
        print(f"Error processing /api/delete: {e}")
        handler.send_json_error(500, str(e))
    finally:
        if conn:
            conn.close()
        # Update Stats
        recalculate_stats()


def handle_update(handler, payload):
    date = payload.get("date") or ""
    new_urls = payload.get("urls") or []

    if (
        not date
        or not re.match(r"^\d{4}-\d{2}-\d{2}$", date)
        or not isinstance(new_urls, list)
    ):
        handler.send_json_error(400, "bad_request")
        return

    conn = get_db_connection()
    if not conn:
        handler.send_json_error(500, "Database connection failed")
        return

    try:
        cur = conn.cursor()

        def normalize(u):
            if not u:
                return ""
            u = u.replace("https://twitter.com", "https://x.com")
            u = u.replace("http://twitter.com", "https://x.com")
            u = u.replace("http://x.com", "https://x.com")
            return u.strip()

        inserted_count = 0
        skipped_count = 0

        for url in new_urls:
            norm_url = normalize(url)
            if not norm_url:
                continue

            parts = norm_url.split("/")
            tweet_id = parts[-1] if parts else ""
            if "?" in tweet_id:
                tweet_id = tweet_id.split("?")[0]
            if not tweet_id.isdigit() or len(tweet_id) < 10:
                skipped_count += 1
                continue

            screen_name = "unknown"
            name_parts = norm_url.split("/")
            try:
                if "status" in name_parts:
                    idx = name_parts.index("status")
                    if idx > 0:
                        screen_name = name_parts[idx - 1]
            except:
                pass

            try:
                snowflake_time = (int(tweet_id) >> 22) + 1288834974657
                beijing_time_ms = snowflake_time + (8 * 60 * 60 * 1000)
                actual_date = datetime.utcfromtimestamp(
                    beijing_time_ms / 1000
                ).strftime("%Y-%m-%d")

                # Sanity Check: Date cannot be in the future (Beijing Time)
                current_beijing_date = (
                    datetime.utcnow() + timedelta(hours=8)
                ).strftime("%Y-%m-%d")
                if actual_date > current_beijing_date:
                    print(f"Skipping future date: {actual_date} for {tweet_id}")
                    skipped_count += 1
                    continue
            except:
                actual_date = date

            try:
                cur.execute(
                    """
                    INSERT INTO tweets (tweet_id, publish_date, content, media_urls, author, tags)
                    VALUES (%s, %s, %s, %s, %s, %s)
                    ON CONFLICT (tweet_id) DO UPDATE SET
                        publish_date = EXCLUDED.publish_date,
                        author = CASE 
                            WHEN tweets.author->>'screen_name' = 'unknown' OR tweets.author IS NULL 
                            THEN EXCLUDED.author 
                            ELSE tweets.author 
                        END,
                        updated_at = CURRENT_TIMESTAMP
                """,
                    (
                        tweet_id,
                        actual_date,
                        f"Added via extension on {date}",
                        json.dumps([]),
                        json.dumps({"name": screen_name, "screen_name": screen_name}),
                        [],
                    ),
                )
                if cur.rowcount > 0:
                    inserted_count += 1
                else:
                    skipped_count += 1
            except Exception as e:
                skipped_count += 1

        conn.commit()

        body = {
            "ok": True,
            "message": f"Processed {inserted_count}, Skipped {skipped_count}",
            "inserted": inserted_count,
            "skipped": skipped_count,
        }

        handler.send_json_response(body)
    except Exception as e:
        print(f"Error processing /api/update: {e}")
        handler.send_json_error(500, str(e))
    finally:
        if conn:
            conn.close()
        recalculate_stats()


def handle_import(handler, payload):
    classifications = payload if isinstance(payload, list) else payload.get("data", [])

    if not classifications:
        handler.send_json_error(400, "No classification data provided")
        return

    conn = get_db_connection()
    if not conn:
        handler.send_json_error(500, "Database connection failed")
        return

    try:
        cur = conn.cursor()
        updated_count = 0

        for item in classifications:
            post_id = item.get("post_id", "")
            hierarchical = item.get("hierarchical", {})
            flat_tags = item.get("flat_tags", [])
            author = item.get("author", "")

            if not post_id:
                continue

            # Format author correctly for consistency
            author_json = json.dumps({"name": author, "screen_name": author})

            cur.execute(
                """
                UPDATE tweets 
                SET hierarchical_categories = %s,
                    flat_tags = %s,
                    author = %s
                WHERE tweet_id = %s
            """,
                (json.dumps(hierarchical), json.dumps(flat_tags), author_json, post_id),
            )

            if cur.rowcount > 0:
                updated_count += 1
            else:
                cur.execute(
                    """
                    INSERT INTO tweets (tweet_id, publish_date, author, hierarchical_categories, flat_tags)
                    VALUES (%s, CURRENT_DATE, %s, %s, %s)
                    ON CONFLICT (tweet_id) DO UPDATE SET
                        hierarchical_categories = EXCLUDED.hierarchical_categories,
                        flat_tags = EXCLUDED.flat_tags,
                        author = EXCLUDED.author
                """,
                    (
                        post_id,
                        author_json,
                        json.dumps(hierarchical),
                        json.dumps(flat_tags),
                    ),
                )
                updated_count += 1

        conn.commit()

        body = {
            "ok": True,
            "message": f"Updated {updated_count} tweets",
            "updated": updated_count,
        }

        handler.send_json_response(body)
    except Exception as e:
        print(f"Error processing /api/import_classifications: {e}")
        handler.send_json_error(500, str(e))
    finally:
        if conn:
            conn.close()
        recalculate_stats()
