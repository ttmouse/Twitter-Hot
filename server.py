import os
from http.server import ThreadingHTTPServer
from server.config import PORT, DB_URL
from server.db import init_db
from server.handler import Handler

if __name__ == '__main__':
    print(f"Starting server on port {PORT}...")
    if not DB_URL:
        print("WARNING: POSTGRES_URL environment variable is not set. Database operations will fail.")
    else:
        try:
            init_db()
        except Exception as e:
            print(f"DB Init failed, but starting server anyway: {e}")
        
    server = ThreadingHTTPServer(('', PORT), Handler)
    server.serve_forever()
