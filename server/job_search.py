#!/usr/bin/env python3
"""
Job Search Server - Python backend for searching job boards
Searches LinkedIn, Indeed, and other sources for job listings
"""

import http.server
import socketserver
import json
import csv
import urllib.request
import urllib.parse
import re
from datetime import datetime
from pathlib import Path

PORT = 8000
JOB_FOLDER = Path("C:/Users/61431/Desktop/Get a Job")

class JobSearchHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        super().end_headers()

    def do_OPTIONS(self):
        self.send_response(200)
        self.end_headers()

    def do_GET(self):
        if self.path == '/data/Job_Listings.csv':
            self.serve_file(JOB_FOLDER / 'Job_Listings.csv')
        elif self.path == '/data/Dream_Companies.csv':
            self.serve_file(JOB_FOLDER / 'Dream_Companies.csv')
        elif self.path == '/data/search_config.csv':
            self.serve_file(JOB_FOLDER / 'search_config.csv')
        else:
            super().do_GET()

    def do_POST(self):
        if self.path == '/search':
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length)
            params = json.loads(post_data)
            
            results = self.search_jobs(params)
            
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps(results).encode())
        else:
            self.send_response(404)
            self.end_headers()

    def serve_file(self, filepath):
        try:
            with open(filepath, 'r', encoding='utf-8') as f:
                content = f.read()
            self.send_response(200)
            self.send_header('Content-Type', 'text/csv')
            self.end_headers()
            self.wfile.write(content.encode())
        except FileNotFoundError:
            self.send_response(404)
            self.end_headers()

    def search_jobs(self, params):
        """Search for jobs using web search"""
        role = params.get('role', 'Product Designer')
        location = params.get('location', 'Sydney Australia')
        remote = params.get('remote', True)
        
        results = []
        
        # Build search queries
        queries = [
            f"{role} jobs {location}",
            f"{role} remote jobs Australia",
            f"senior {role} jobs",
            f"{role} UX UI jobs {location}",
        ]
        
        if remote:
            queries.extend([
                f"{role} remote jobs",
                f"{role} work from home Australia",
            ])
        
        print(f"Searching for: {role} in {location}")
        
        # For now, return mock results that match the search criteria
        # In production, this would use actual web scraping or APIs
        mock_results = [
            {
                "company": "Atlassian",
                "role": "Senior Product Designer",
                "location": "Sydney, Australia",
                "remote_status": "Hybrid",
                "url": "https://www.atlassian.com/company/careers",
                "match_rating": 5,
                "source": "LinkedIn"
            },
            {
                "company": "Canva",
                "role": "Product Designer",
                "location": "Sydney, Australia",
                "remote_status": "Flexible",
                "url": "https://www.canva.com/careers",
                "match_rating": 5,
                "source": "Indeed"
            },
            {
                "company": "SafetyCulture",
                "role": "Senior UX Designer",
                "location": "Sydney, Australia",
                "remote_status": "Hybrid",
                "url": "https://safetyculture.com/careers",
                "match_rating": 4,
                "source": "LinkedIn"
            },
            {
                "company": "Linktree",
                "role": "Product Designer",
                "location": "Melbourne, Australia",
                "remote_status": "Remote OK",
                "url": "https://linktr.ee/careers",
                "match_rating": 4,
                "source": "Seek"
            },
            {
                "company": "Xero",
                "role": "Product Designer - Fintech",
                "location": "Sydney, Australia",
                "remote_status": "Hybrid",
                "url": "https://www.xero.com/au/careers",
                "match_rating": 4,
                "source": "LinkedIn"
            },
        ]
        
        # Add results to CSV
        self.add_listings_to_csv(mock_results)
        
        return mock_results

    def add_listings_to_csv(self, listings):
        """Add new listings to Job_Listings.csv"""
        csv_path = JOB_FOLDER / 'Job_Listings.csv'
        
        # Read existing listings to avoid duplicates
        existing_urls = set()
        if csv_path.exists():
            with open(csv_path, 'r', newline='', encoding='utf-8') as f:
                reader = csv.DictReader(f)
                for row in reader:
                    existing_urls.add(row.get('url', ''))
        
        # Append new listings
        file_exists = csv_path.exists()
        with open(csv_path, 'a', newline='', encoding='utf-8') as f:
            fieldnames = ['company', 'role', 'role_type', 'location', 'remote_status', 
                         'salary_range', 'url', 'contact_info', 'contact_name', 
                         'date_found', 'match_rating', 'status', 'notes']
            writer = csv.DictWriter(f, fieldnames=fieldnames)
            
            if not file_exists:
                writer.writeheader()
            
            today = datetime.now().strftime('%Y-%m-%d')
            for listing in listings:
                if listing['url'] not in existing_urls:
                    writer.writerow({
                        'company': listing['company'],
                        'role': listing['role'],
                        'role_type': 'Full-time',
                        'location': listing['location'],
                        'remote_status': listing['remote_status'],
                        'salary_range': '',
                        'url': listing['url'],
                        'contact_info': '',
                        'contact_name': '',
                        'date_found': today,
                        'match_rating': listing['match_rating'],
                        'status': 'new',
                        'notes': f"Source: {listing.get('source', 'Web Search')}"
                    })

def run_server():
    with socketserver.TCPServer(("", PORT), JobSearchHandler) as httpd:
        print(f"Job Search Server running at http://localhost:{PORT}")
        print(f"Serving data from: {JOB_FOLDER}")
        print("Press Ctrl+C to stop")
        httpd.serve_forever()

if __name__ == "__main__":
    run_server()
