import json

class ResponseMixin:
    """Mixin for RequestHandler to provide JSON response capability."""
    
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
