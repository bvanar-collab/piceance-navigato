#!/usr/bin/env bash
set -euo pipefail

# ------------------------------------------------------------
# Piceance NOWI Agent — Real ECMC Data Scraper
# Creates Docker environment and scrapes ECMC for real data
# ------------------------------------------------------------

PLSS_BATCH=""
COUNTY="Garfield"
PRESET=""

while [[ $# -gt 0 ]]; do
  case "$1" in
    --plss)   PLSS_BATCH="$2"; shift 2 ;;
    --county) COUNTY="$2"; shift 2 ;;
    --preset) PRESET="$2"; shift 2 ;;
    *) echo "Unknown arg: $1"; exit 1 ;;
  esac
done

ROOT="${PWD}/piceance-nowi"
mkdir -p "${ROOT}"
cd "${ROOT}"

echo "🚀 ECMC NOWI Agent Bootstrap"
echo "=============================="
echo "County: ${COUNTY}"
echo "Preset: ${PRESET}"

if [[ -d "piceance-nowi" ]]; then
  echo "📁 Directory piceance-nowi already exists. Removing..."
  rm -rf piceance-nowi
fi

echo "📦 Creating Docker setup..."

# Create requirements.txt
cat > requirements.txt <<'REQ'
requests
beautifulsoup4
tenacity
pdfminer.six
rapidfuzz
openpyxl
selenium
undetected-chromedriver
python-dotenv
REQ

# Create Dockerfile
cat > Dockerfile <<'DOCKER'
FROM python:3.11-slim
WORKDIR /app
RUN apt-get update && apt-get install -y \
    wget \
    curl \
    gnupg \
    unzip \
    && rm -rf /var/lib/apt/lists/*

# Install Chrome for Selenium
RUN wget -q -O - https://dl.google.com/linux/linux_signing_key.pub | apt-key add - \
    && echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google-chrome.list \
    && apt-get update \
    && apt-get install -y google-chrome-stable \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
CMD ["python", "ecmc_scraper.py", "--help"]
DOCKER

# Real ECMC scraper with Selenium
cat > ecmc_scraper.py <<'PY'
import re
import time
import argparse
import requests
from io import BytesIO
from pdfminer.high_level import extract_text
from openpyxl import Workbook, load_workbook
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.options import Options
import undetected_chromedriver as uc

ECMC_ORDERS_URL = "https://ecmc.state.co.us/Orders/Orders.aspx"

class ECMCScraper:
    def __init__(self):
        self.setup_driver()
    
    def setup_driver(self):
        options = Options()
        options.add_argument('--headless=new')
        options.add_argument('--no-sandbox')
        options.add_argument('--disable-dev-shm-usage')
        options.add_argument('--disable-gpu')
        options.add_argument('--disable-web-security')
        
        try:
            self.driver = uc.Chrome(options=options)
        except Exception as e:
            print(f"Error setting up Chrome driver: {e}")
            self.driver = None
    
    def scrape_plss_location(self, township, township_dir, range_num, range_dir, section):
        """Scrape ECMC for a specific PLSS location"""
        if not self.driver:
            return []
        
        try:
            self.driver.get(ECMC_ORDERS_URL)
            wait = WebDriverWait(self.driver, 20)
            
            # Fill in PLSS location form
            township_field = wait.until(EC.presence_of_element_located((By.ID, "txtTownship")))
            township_field.clear()
            township_field.send_keys(str(township))
            
            range_field = self.driver.find_element(By.ID, "txtRange")
            range_field.clear()
            range_field.send_keys(str(range_num))
            
            section_field = self.driver.find_element(By.ID, "txtSection")
            section_field.clear()
            section_field.send_keys(str(section))
            
            # Submit search
            search_button = self.driver.find_element(By.ID, "btnSearch")
            search_button.click()
            
            time.sleep(3)  # Wait for results
            
            # Look for PDF links
            pdf_links = self.driver.find_elements(By.XPATH, "//a[contains(@href, '.pdf')]")
            
            owners = []
            for link in pdf_links[:5]:  # Limit to first 5 PDFs per location
                pdf_url = link.get_attribute('href')
                if pdf_url:
                    owner_data = self.analyze_pdf(pdf_url, township, township_dir, range_num, range_dir, section)
                    if owner_data:
                        owners.extend(owner_data)
                    time.sleep(1)  # Be respectful
            
            return owners
            
        except Exception as e:
            print(f"Error scraping PLSS {township}{township_dir}-{range_num}{range_dir}-{section}: {e}")
            return []
    
    def analyze_pdf(self, pdf_url, township, township_dir, range_num, range_dir, section):
        """Download and analyze PDF for working interest information"""
        try:
            response = requests.get(pdf_url, timeout=30)
            response.raise_for_status()
            
            # Extract text from PDF
            text = extract_text(BytesIO(response.content))
            
            if not text:
                return []
            
            # Look for company names and working interest indicators
            lines = text.split('\n')
            potential_owners = []
            
            wi_keywords = ['working interest', 'participating', 'non-consent', 'operator', 'lessee']
            company_indicators = ['LLC', 'INC', 'CORP', 'COMPANY', 'PARTNERS', 'TRUST', 'LP']
            
            for line in lines:
                line = line.strip()
                if any(indicator in line.upper() for indicator in company_indicators):
                    # This line might contain a company name
                    if any(keyword in line.lower() for keyword in wi_keywords):
                        # This line mentions working interest
                        potential_owners.append({
                            'Owner_Name': line[:100],  # Truncate long names
                            'Entity_Type': self.determine_entity_type(line),
                            'County': 'Garfield',  # Default for Piceance Basin
                            'Twp': township,
                            'Twp_Dir': township_dir,
                            'Rng': range_num,
                            'Rng_Dir': range_dir,
                            'Sec': section,
                            'DSU_Key': f"{township}{township_dir}-{range_num}{range_dir}-SEC{section:02d}",
                            'WI_Signal': 'Order-WI',
                            'Evidence_Link': pdf_url,
                            'Confidence': 'Probable'
                        })
            
            return potential_owners[:3]  # Return max 3 owners per PDF
            
        except Exception as e:
            print(f"Error analyzing PDF {pdf_url}: {e}")
            return []
    
    def determine_entity_type(self, name):
        """Determine entity type from name"""
        name_upper = name.upper()
        if 'LLC' in name_upper:
            return 'LLC'
        elif any(corp in name_upper for corp in ['CORP', 'INC']):
            return 'Corporation'
        elif 'TRUST' in name_upper:
            return 'Trust'
        elif 'LP' in name_upper:
            return 'Limited Partnership'
        else:
            return 'Individual'
    
    def parse_plss_entry(self, plss_entry):
        """Parse PLSS entry like '5S-94W-1' into components"""
        match = re.match(r'(\d+)([NS])-(\d+)([EW])-(\d+)', plss_entry.upper())
        if match:
            return (
                int(match.group(1)),  # township
                match.group(2),       # township direction
                int(match.group(3)),  # range
                match.group(4),       # range direction
                int(match.group(5))   # section
            )
        return None
    
    def scrape_multiple_locations(self, plss_entries):
        """Scrape multiple PLSS locations"""
        all_owners = []
        
        for entry in plss_entries:
            parsed = self.parse_plss_entry(entry)
            if parsed:
                township, township_dir, range_num, range_dir, section = parsed
                print(f"🔍 Scraping {entry}...")
                
                owners = self.scrape_plss_location(township, township_dir, range_num, range_dir, section)
                all_owners.extend(owners)
                
                time.sleep(2)  # Be respectful between requests
            else:
                print(f"⚠️  Invalid PLSS format: {entry}")
        
        return all_owners
    
    def save_to_excel(self, owners, filename):
        """Save owners data to Excel file"""
        # Create new workbook with proper structure
        wb = Workbook()
        ws = wb.active
        ws.title = "OWNERS"
        
        # Headers
        headers = [
            'Owner_Name', 'Canonical_Name', 'Entity_Type', 'State_of_Incorp', 'CO_SOS_ID',
            'County', 'Twp', 'Twp_Dir', 'Rng', 'Rng_Dir', 'Sec',
            'DSU_Key', 'Well_API_or_DSUs', 'Operator_of_Record', 'WI_Signal',
            'NOWI_Status', 'Confidence', 'Evidence_Link', 'Mailing_Address', 
            'Email', 'Phone', 'Contact_Source_URL', 'Notes'
        ]
        
        ws.append(headers)
        
        # Add owner data
        for owner in owners:
            row = [
                owner.get('Owner_Name', ''),
                owner.get('Owner_Name', ''),  # Canonical name same as owner name
                owner.get('Entity_Type', ''),
                'CO',  # State of incorporation
                '',    # CO SOS ID
                owner.get('County', ''),
                owner.get('Twp', ''),
                owner.get('Twp_Dir', ''),
                owner.get('Rng', ''),
                owner.get('Rng_Dir', ''),
                owner.get('Sec', ''),
                owner.get('DSU_Key', ''),
                '',    # Well API
                '',    # Operator of record
                owner.get('WI_Signal', ''),
                'NOWI',  # NOWI Status
                owner.get('Confidence', ''),
                owner.get('Evidence_Link', ''),
                '',    # Mailing address
                '',    # Email
                '',    # Phone
                'ECMC Orders',  # Contact source
                'Real ECMC scrape'  # Notes
            ]
            ws.append(row)
        
        wb.save(filename)
        print(f"✅ Saved {len(owners)} records to {filename}")
    
    def close(self):
        if self.driver:
            self.driver.quit()

def main():
    parser = argparse.ArgumentParser(description='Scrape ECMC for NOWI data')
    parser.add_argument('--plss', required=True, help='Comma-separated PLSS entries')
    parser.add_argument('--county', default='Garfield', help='County name')
    parser.add_argument('--output', default='Piceance_NOWI_Template.xlsx', help='Output Excel file')
    
    args = parser.parse_args()
    
    plss_entries = [entry.strip() for entry in args.plss.split(',') if entry.strip()]
    
    print(f"🚀 Starting ECMC scrape for {len(plss_entries)} locations...")
    
    scraper = ECMCScraper()
    
    try:
        owners = scraper.scrape_multiple_locations(plss_entries)
        
        if owners:
            scraper.save_to_excel(owners, args.output)
            print(f"✅ Scraping complete! Found {len(owners)} owner records")
        else:
            print("⚠️  No owner data found")
            
    finally:
        scraper.close()

if __name__ == "__main__":
    main()
PY

echo "✅ Setup complete!"

# Build Docker image
echo "🏗️  Building Docker image..."
docker build -t ecmc-scraper:latest .

# Create initial Excel template
echo "📊 Creating Excel template..."
python3 -c "
from openpyxl import Workbook

wb = Workbook()
ws = wb.active
ws.title = 'OWNERS'

headers = [
    'Owner_Name', 'Canonical_Name', 'Entity_Type', 'State_of_Incorp', 'CO_SOS_ID',
    'County', 'Twp', 'Twp_Dir', 'Rng', 'Rng_Dir', 'Sec',
    'DSU_Key', 'Well_API_or_DSUs', 'Operator_of_Record', 'WI_Signal',
    'NOWI_Status', 'Confidence', 'Evidence_Link', 'Mailing_Address', 
    'Email', 'Phone', 'Contact_Source_URL', 'Notes'
]

ws.append(headers)
wb.save('Piceance_NOWI_Template.xlsx')
print('Template created successfully')
"

# Handle preset
if [[ -n "${PRESET}" ]]; then
  if [[ "${PRESET}" == "piceance" ]]; then
    echo "🎯 Using Piceance Basin preset..."
    # Generate comprehensive Piceance Basin PLSS entries
    PLSS_BATCH="5S-94W-1,5S-94W-6,5S-94W-12,5S-94W-18,5S-94W-24,5S-94W-30,5S-94W-36,5S-95W-1,5S-95W-6,5S-95W-12,5S-95W-18,5S-95W-24,5S-95W-30,5S-95W-36,5S-96W-1,5S-96W-6,5S-96W-12,5S-96W-18,5S-96W-24,5S-96W-30,5S-96W-36,5S-97W-1,5S-97W-6,5S-97W-12,5S-97W-18,5S-97W-24,5S-97W-30,5S-97W-36,5S-98W-1,5S-98W-6,5S-98W-12,5S-98W-18,5S-98W-24,5S-98W-30,5S-98W-36,6S-94W-1,6S-94W-6,6S-94W-12,6S-94W-18,6S-94W-24,6S-94W-30,6S-94W-36,6S-95W-1,6S-95W-6,6S-95W-12,6S-95W-18,6S-95W-24,6S-95W-30,6S-95W-36,6S-96W-1,6S-96W-6,6S-96W-12,6S-96W-18,6S-96W-24,6S-96W-30,6S-96W-36,6S-97W-1,6S-97W-6,6S-97W-12,6S-97W-18,6S-97W-24,6S-97W-30,6S-97W-36,6S-98W-1,6S-98W-6,6S-98W-12,6S-98W-18,6S-98W-24,6S-98W-30,6S-98W-36,7S-94W-1,7S-94W-6,7S-94W-12,7S-94W-18,7S-94W-24,7S-94W-30,7S-94W-36,7S-95W-1,7S-95W-6,7S-95W-12,7S-95W-18,7S-95W-24,7S-95W-30,7S-95W-36,7S-96W-1,7S-96W-6,7S-96W-12,7S-96W-18,7S-96W-24,7S-96W-30,7S-96W-36,7S-97W-1,7S-97W-6,7S-97W-12,7S-97W-18,7S-97W-24,7S-97W-30,7S-97W-36,7S-98W-1,7S-98W-6,7S-98W-12,7S-98W-18,7S-98W-24,7S-98W-30,7S-98W-36,8S-94W-1,8S-94W-6,8S-94W-12,8S-94W-18,8S-94W-24,8S-94W-30,8S-94W-36,8S-95W-1,8S-95W-6,8S-95W-12,8S-95W-18,8S-95W-24,8S-95W-30,8S-95W-36,8S-96W-1,8S-96W-6,8S-96W-12,8S-96W-18,8S-96W-24,8S-96W-30,8S-96W-36,8S-97W-1,8S-97W-6,8S-97W-12,8S-97W-18,8S-97W-24,8S-97W-30,8S-97W-36,8S-98W-1,8S-98W-6,8S-98W-12,8S-98W-18,8S-98W-24,8S-98W-30,8S-98W-36,9S-94W-1,9S-94W-6,9S-94W-12,9S-94W-18,9S-94W-24,9S-94W-30,9S-94W-36,9S-95W-1,9S-95W-6,9S-95W-12,9S-95W-18,9S-95W-24,9S-95W-30,9S-95W-36,9S-96W-1,9S-96W-6,9S-96W-12,9S-96W-18,9S-96W-24,9S-96W-30,9S-96W-36,9S-97W-1,9S-97W-6,9S-97W-12,9S-97W-18,9S-97W-24,9S-97W-30,9S-97W-36,9S-98W-1,9S-98W-6,9S-98W-12,9S-98W-18,9S-98W-24,9S-98W-30,9S-98W-36"
    COUNTY="Garfield"
  else
    echo "❌ ERROR: Unknown preset ${PRESET}"
    exit 1
  fi
fi

if [[ -z "${PLSS_BATCH}" ]]; then
  echo "❌ ERROR: Please provide either --preset piceance or --plss 'entries'"
  exit 1
fi

# Run the real ECMC scraper
echo "🔍 Running scraper with PLSS entries..."
echo "🔍 Scraping ECMC data for ${COUNTY} County"
echo "📍 PLSS Entries: ${PLSS_BATCH}"

# Process in smaller batches to be respectful to ECMC
IFS=',' read -ra ENTRIES <<< "${PLSS_BATCH}"
BATCH_SIZE=10

for ((i=0; i<${#ENTRIES[@]}; i+=BATCH_SIZE)); do
    BATCH_ENTRIES="${ENTRIES[@]:$i:$BATCH_SIZE}"
    BATCH_CSV=$(IFS=','; echo "${BATCH_ENTRIES[*]}")
    
    echo "Processing PLSS batch: ${BATCH_CSV}"
    
    docker run --rm -v "$(pwd)":/app ecmc-scraper:latest \
        python ecmc_scraper.py \
        --plss "${BATCH_CSV}" \
        --county "${COUNTY}" \
        --output "Piceance_NOWI_Template.xlsx"
    
    echo "Batch complete. Waiting before next batch..."
    sleep 5
done

echo "✅ Done! Excel file created: Piceance_NOWI_Template.xlsx"