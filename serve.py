#!/usr/bin/env python3
"""
Simple web server to serve the WhisperCart mobile app
"""
import http.server
import socketserver
import webbrowser
import os
import sys

PORT = 8080

class MyHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        # Add CORS headers
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        super().end_headers()

def main():
    # Change to the directory containing the HTML files
    os.chdir(os.path.dirname(os.path.abspath(__file__)))
    
    with socketserver.TCPServer(("", PORT), MyHTTPRequestHandler) as httpd:
        print(f"WhisperCart Mobile Server running at:")
        print(f"   Mobile: http://192.168.31.180:{PORT}/mobile.html")
        print(f"   Desktop: http://localhost:{PORT}/test.html")
        print(f"   Backend: http://192.168.31.180:5000")
        print(f"\nOn your iPhone:")
        print(f"   1. Open Safari")
        print(f"   2. Go to: http://192.168.31.180:{PORT}/mobile.html")
        print(f"   3. Tap Share -> Add to Home Screen")
        print(f"\nPress Ctrl+C to stop the server")
        
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print(f"\nServer stopped")

if __name__ == "__main__":
    main()
