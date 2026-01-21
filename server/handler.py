from http.server import SimpleHTTPRequestHandler
from urllib.parse import urlparse
import json

from .utils import ResponseMixin
from .routes import tweets, stats, admin


class Handler(SimpleHTTPRequestHandler, ResponseMixin):
    protocol_version = "HTTP/1.1"

    def do_OPTIONS(self):
        self.send_response(200)
        self.add_cors_headers()
        self.end_headers()

    def do_GET(self):
        parsed = urlparse(self.path)
        path = parsed.path

        # Proxy for VxTwitter
        if path == "/api/tweet_info":
            tweets.handle_tweet_info(self, parsed)
            return

        # Legacy API
        if path.startswith("/api/daily_hot/"):
            tweets.handle_daily_hot(self, path)
            return

        # Dates API
        if path == "/api/dates":
            stats.handle_dates(self)
            return

        # Categories Global Stats API
        if path == "/api/categories":
            stats.handle_categories(self)
            return

        # Stream/Fetch API
        if path == "/api/tweets":
            tweets.handle_tweets(self, parsed)
            return

        # Data Legacy API
        if path == "/api/data":
            tweets.handle_legacy_data(self, parsed)
            return

        # Global Stats (Authors) API
        if path == "/api/stats":
            stats.handle_stats(self)
            return

        # Tags API
        if path == "/api/tags":
            stats.handle_tags(self)
            return

        # Search API
        if path == "/api/search":
            tweets.handle_search(self, parsed)
            return

        # Unclassified Tweets API
        if path == "/api/unclassified_tweets":
            tweets.handle_unclassified_tweets(self, parsed)
            return

        # Fallback to serving static files
        try:
            super().do_GET()
        except:
            self.send_json_error(404, "File not found")

    def do_POST(self):
        parsed = urlparse(self.path)
        path = parsed.path

        # Parse Body
        length = int(self.headers.get("Content-Length") or 0)
        raw = self.rfile.read(length) if length > 0 else b""
        try:
            payload = json.loads(raw.decode("utf-8"))
        except Exception:
            payload = {}

        if path == "/api/delete":
            admin.handle_delete(self, payload)
            return

        if path == "/api/delete_by_id":
            admin.handle_delete_by_id(self, payload)
            return

        if path == "/api/update":
            admin.handle_update(self, payload)
            return

        if path == "/api/import_classifications":
            admin.handle_import(self, payload)
            return

        self.send_json_error(404, f"Unknown endpoint: {path}")
