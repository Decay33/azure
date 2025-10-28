"""
Simple HTTP Server for Tower Builder game
This script starts a simple HTTP server in the current directory
This helps overcome CORS issues with ES modules
"""

import http.server
import socketserver
import webbrowser
import os
from threading import Timer

# Configuration
PORT = 8000
DIRECTORY = os.path.dirname(os.path.abspath(__file__))
GAME_URL = f"http://localhost:{PORT}/towerbuilder/index-fixed.html"

class Handler(http.server.SimpleHTTPRequestHandler):
    # Set the directory to serve files from
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)
    
    # Add CORS headers to allow ES modules to load
    def end_headers(self):
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET')
        self.send_header('Cache-Control', 'no-store, no-cache, must-revalidate')
        return super().end_headers()

def open_browser():
    """Open browser after server starts"""
    webbrowser.open(GAME_URL)

if __name__ == "__main__":
    # Create server
    with socketserver.TCPServer(("", PORT), Handler) as httpd:
        print(f"Serving Tower Builder at http://localhost:{PORT}")
        print(f"Opening game page: {GAME_URL}")
        print("Press Ctrl+C to stop the server")
        
        # Open browser after a short delay
        Timer(1.0, open_browser).start()
        
        # Start server
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\nServer stopped by user") 