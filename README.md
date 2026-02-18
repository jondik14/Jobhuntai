# Job Hunt Dashboard

A simple dashboard to help you manage your job search, track applications, and find new opportunities.

## Features

- **Dashboard** - Overview of your job search stats and recent activity
- **Job Listings** - View and manage all your tracked job applications
- **Dream Companies** - Track companies you admire and want to work for
- **Find Jobs** - Search for new job opportunities (searches LinkedIn, Indeed, etc.)

## Getting Started

### 1. Start the Python Backend Server

The backend server handles job searches and data management.

Double-click `start-server.bat` or run in PowerShell:
```powershell
cd C:\Users\61431\job-search-dashboard\server
python job_search.py
```

You should see:
```
Job Search Server running at http://localhost:8000
Serving data from: C:\Users\61431\Desktop\Get a Job
Press Ctrl+C to stop
```

Leave this window running.

### 2. Start the Frontend Dashboard

In a new terminal/PowerShell window:

```powershell
cd C:\Users\61431\job-search-dashboard
npm run dev
```

This will start the dev server and give you a URL like `http://localhost:5173`

Open that URL in your browser.

## How to Use

### Finding Jobs

1. Go to the **Find Jobs** tab
2. Click **"Run Job Search"**
3. The system searches for Product Designer jobs in Sydney/Australia
4. New listings are automatically saved to your Job_Listings.csv
5. Go to **Job Listings** tab to see and manage them

### Managing Listings

- Each job card shows company, role, location, and match rating
- Click **Apply** to open the job posting
- Update status as you progress (new → applied → interview → offer)
- Filter by status using the dropdown

### Dream Companies

1. Go to **Dream Companies** tab
2. Click **Add Company** to track companies you admire
3. The system will help you track their news and career pages

### Your Data

All your data is stored in CSV files on your Desktop:
- `Desktop/Get a Job/Job_Listings.csv` - All job listings
- `Desktop/Get a Job/Dream_Companies.csv` - Companies you track
- `Desktop/Get a Job/Master/resume.md` - Your resume
- `Desktop/Get a Job/search_config.csv` - Your search preferences

You can edit these files directly if needed.

## Customizing Your Search

Edit `Desktop/Get a Job/search_config.csv` to change:
- Target roles
- Industries
- Location preferences
- Remote/hybrid/in-person preferences

Then restart the frontend to see changes.

## Troubleshooting

**Dashboard shows "No job listings yet"**
- Make sure the Python server is running
- Run a job search from the Find Jobs tab

**Can't connect to server**
- Check that port 8000 is not in use by another application
- Try restarting the Python server

**Changes not showing**
- Refresh the browser page
- Make sure both servers are running

## Note

The current job search uses mock/sample data. To search real job boards, you'll need to integrate with job board APIs (LinkedIn, Indeed, Seek) or use web scraping tools. The infrastructure is set up to add this easily.
