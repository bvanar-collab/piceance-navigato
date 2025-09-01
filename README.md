# NOWI Data Management System

Complete system for managing Non-Operated Working Interest (NOWI) data for the Piceance Basin.

## Components

### 1. Web Application
- React-based dashboard for NOWI data management
- Excel import/export functionality
- PLSS location management
- Analytics and reporting

### 2. Docker ECMC Scraper (`piceance_agent_bootstrap.sh`)
- Real-time scraping of Colorado ECMC website
- PDF analysis for working interest extraction
- Selenium-based automation
- Batch processing capabilities

## Usage

### Web Application
```bash
npm install
npm run dev
```

### Docker Scraper
```bash
# Make executable
chmod +x piceance_agent_bootstrap.sh

# Run with Piceance Basin preset (180 PLSS locations)
./piceance_agent_bootstrap.sh --preset piceance

# Run with custom PLSS entries
./piceance_agent_bootstrap.sh --plss "5S-94W-1,5S-94W-6,5S-94W-12" --county Garfield
```

## Requirements
- Node.js 18+
- Docker
- Chrome/Chromium browser
- Python 3.11+

## Output
- Excel files with NOWI owner data
- Real-time dashboard analytics
- PDF evidence links
- Contact information

## Features
- ✅ Real ECMC data scraping
- ✅ Web-based dashboard
- ✅ Excel import/export
- ✅ Contact information extraction
- ✅ Batch processing
- ✅ Progress tracking
- ✅ Error handling

## Project info

**URL**: https://lovable.dev/projects/0d0b6328-23d5-4ade-a05a-91d7d1d63d1c

## Technologies Used

This project is built with:
- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS
- Docker
- Selenium
- Python

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/tips-tricks/custom-domain#step-by-step-guide)
