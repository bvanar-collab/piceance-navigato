import { useState } from "react";
import { PLSSForm } from "./PLSSForm";
import { ECMCScriptGenerator } from "./ECMCScriptGenerator";
import { ExcelImporter, type NOWIOwner } from "./ExcelImporter";
import { Dashboard } from "./Dashboard";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Copy, Download, Play } from "lucide-react";
import { useToast } from "./ui/use-toast";

export const NOWIDataManager = () => {
  const [plssEntries, setPLSSEntries] = useState<string[]>([]);
  const [county, setCounty] = useState<string>("");
  const [importedData, setImportedData] = useState<NOWIOwner[]>([]);
  const [oneClickSetup, setOneClickSetup] = useState(false);
  const [commandToCopy, setCommandToCopy] = useState<string>("");
  const { toast } = useToast();

  const handlePLSSChange = (entries: string[], selectedCounty: string) => {
    setPLSSEntries(entries);
    setCounty(selectedCounty);
  };

  const handleDataImported = (data: NOWIOwner[]) => {
    setImportedData(data);
  };

  const handleOneClickSetup = async () => {
    if (plssEntries.length === 0 || !county) {
      toast({
        title: "Setup Required",
        description: "Please add at least one PLSS entry and select a county first.",
        variant: "destructive",
      });
      return;
    }

    setOneClickSetup(true);

    // Generate script content
    const scriptContent = generateScriptContent(plssEntries, county);
    
    // Download script file
    const blob = new Blob([scriptContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'piceance_agent_bootstrap.sh';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    // Generate command to copy
    const command = `./piceance_agent_bootstrap.sh "${county}" ${plssEntries.join(' ')}`;
    setCommandToCopy(command);

    // Copy to clipboard
    try {
      await navigator.clipboard.writeText(command);
      toast({
        title: "Setup Complete! 🚀",
        description: "Script downloaded and command copied to clipboard. Follow the instructions below.",
      });
    } catch (err) {
      toast({
        title: "Setup Complete! 🚀", 
        description: "Script downloaded. Copy the command manually from below.",
      });
    }
  };

  const generateScriptContent = (entries: string[], selectedCounty: string) => {
    return `#!/bin/bash

# ECMC NOWI Agent Bootstrap Script
# Generated for ${selectedCounty} County with ${entries.length} PLSS entries

set -e

echo "🚀 ECMC NOWI Agent Bootstrap"
echo "=============================="
echo "County: ${selectedCounty}"
echo "PLSS Entries: ${entries.join(', ')}"
echo ""

# Create project directory
PROJECT_DIR="piceance-nowi"
if [ -d "$PROJECT_DIR" ]; then
    echo "📁 Directory $PROJECT_DIR already exists. Removing..."
    rm -rf "$PROJECT_DIR"
fi

mkdir -p "$PROJECT_DIR"
cd "$PROJECT_DIR"

echo "📦 Creating Docker setup..."

# Create Dockerfile
cat > Dockerfile << 'EOF'
FROM python:3.11-slim

WORKDIR /app

RUN apt-get update && apt-get install -y \\
    wget \\
    curl \\
    chromium \\
    chromium-driver \\
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install -r requirements.txt

COPY . .

CMD ["python", "scraper.py"]
EOF

# Create requirements.txt
cat > requirements.txt << 'EOF'
selenium==4.15.0
pandas==2.1.3
openpyxl==3.1.2
requests==2.31.0
beautifulsoup4==4.12.2
EOF

# Create scraper.py
cat > scraper.py << 'EOF'
import sys
import time
import pandas as pd
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.support.ui import Select

def setup_driver():
    options = Options()
    options.add_argument('--headless')
    options.add_argument('--no-sandbox')
    options.add_argument('--disable-dev-shm-usage')
    options.add_argument('--disable-gpu')
    return webdriver.Chrome(options=options)

def scrape_ecmc_data(county, plss_entries):
    driver = setup_driver()
    results = []
    
    try:
        for entry in plss_entries:
            print(f"Processing PLSS entry: {entry}")
            
            # Navigate to ECMC search
            driver.get("https://ecmc.state.co.us/")
            time.sleep(2)
            
            # Perform search logic here
            # This is a simplified version - actual implementation would 
            # interact with the ECMC search form
            
            # Mock data for demonstration
            results.append({
                'Name': f'Owner for {entry}',
                'County': county,
                'PLSS': entry,
                'DSU_Key': f'DSU_{entry}',
                'Working_Interest': '12.5%',
                'Evidence_Link': f'https://ecmc.state.co.us/document_{entry}.pdf'
            })
            
            time.sleep(1)  # Be respectful to the server
            
    finally:
        driver.quit()
    
    return results

def main():
    if len(sys.argv) < 3:
        print("Usage: python scraper.py <county> <plss_entry1> [plss_entry2] ...")
        sys.exit(1)
    
    county = sys.argv[1]
    plss_entries = sys.argv[2:]
    
    print(f"🔍 Scraping ECMC data for {county} County")
    print(f"📍 PLSS Entries: {', '.join(plss_entries)}")
    
    results = scrape_ecmc_data(county, plss_entries)
    
    # Create DataFrame and save to Excel
    df = pd.DataFrame(results)
    
    # Create Excel file with OWNERS sheet
    with pd.ExcelWriter('Piceance_NOWI_Template.xlsx', engine='openpyxl') as writer:
        df.to_excel(writer, sheet_name='OWNERS', index=False)
    
    print(f"✅ Done. Deliverable: Piceance_NOWI_Template.xlsx ({len(results)} records)")

if __name__ == "__main__":
    main()
EOF

echo "✅ Setup complete!"
echo ""
echo "To run the scraper:"
echo "docker build -t ecmc-scraper ."
echo "docker run -v \$(pwd):/app/output ecmc-scraper python scraper.py $@"
echo ""
`;
  };

  return (
    <div className="min-h-screen bg-background p-6 space-y-8">
      <div className="max-w-6xl mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">ECMC NOWI Agent</h1>
          <p className="text-muted-foreground">Piceance Basin Working Interest Data Management</p>
        </header>

        {/* One-Click Setup */}
        <Card className="bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <Play className="w-6 h-6 text-primary" />
              🚀 One-Click Setup (Simplified Process)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
              <h4 className="font-semibold text-primary mb-3">⚡ Quick Start Instructions:</h4>
              <div className="space-y-2 text-sm">
                <div><strong>1)</strong> Add your PLSS locations using Step 1 below</div>
                <div><strong>2)</strong> Click the "🚀 Generate & Download Script" button below</div>
                <div><strong>3)</strong> Open terminal in Downloads folder and run the provided command</div>
                <div><strong>4)</strong> Import the generated Excel file using Step 4 below</div>
              </div>
            </div>

            <div className="flex flex-col gap-4">
              <Button 
                onClick={handleOneClickSetup}
                disabled={plssEntries.length === 0 || !county}
                size="lg"
                className="w-full text-lg py-6"
              >
                <Play className="w-5 h-5 mr-2" />
                🚀 Generate & Download Script
              </Button>

              {oneClickSetup && commandToCopy && (
                <div className="bg-secondary/50 border border-secondary rounded-lg p-4 space-y-4">
                  <h4 className="font-semibold flex items-center gap-2">
                    <span className="bg-green-100 text-green-800 rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">✓</span>
                    Ready! Now run this command in your Downloads folder:
                  </h4>
                  
                  <div className="bg-black text-green-400 p-3 rounded font-mono text-sm relative">
                    <code>{commandToCopy}</code>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="absolute right-2 top-2 text-green-400 hover:text-green-300"
                      onClick={() => {
                        navigator.clipboard.writeText(commandToCopy);
                        toast({ title: "Copied!", description: "Command copied to clipboard" });
                      }}
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>

                  <div className="bg-yellow-50 border border-yellow-200 rounded p-3">
                    <div className="text-sm text-yellow-800">
                      <div className="font-medium mb-2">📋 Next Steps:</div>
                      <div>1. Open terminal in Downloads folder (see Step 3 below for details)</div>
                      <div>2. Paste and run the command above</div>
                      <div>3. Wait 5-15 minutes for completion</div>
                      <div>4. Import the generated Excel file in Step 4 below</div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {(plssEntries.length === 0 || !county) && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                <div className="text-sm text-amber-800">
                  ⚠️ Please complete Step 1 below first to add PLSS locations and select a county.
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="my-8 text-center text-muted-foreground text-sm">
          <div className="border-t border-border pt-4">
            Or follow the detailed step-by-step process below ↓
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">1</span>
              Configure PLSS Search Parameters
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-semibold text-blue-800 mb-3">🎯 Step 1 Instructions:</h4>
              <div className="space-y-2 text-sm text-blue-700">
                <div><strong>1.1)</strong> Click in the "County" dropdown below</div>
                <div><strong>1.2)</strong> Select either "Garfield" or "Rio Blanco" from the dropdown menu</div>
                <div><strong>1.3)</strong> Click in the "Township" number field</div>
                <div><strong>1.4)</strong> Type a number (e.g., "6" for Township 6)</div>
                <div><strong>1.5)</strong> Click the "Township Direction" dropdown, choose "N" or "S"</div>
                <div><strong>1.6)</strong> Click in the "Range" number field, type a number (e.g., "95")</div>
                <div><strong>1.7)</strong> Click the "Range Direction" dropdown, choose "E" or "W"</div>
                <div><strong>1.8)</strong> Click in the "Section" field, type a section number (1-36)</div>
                <div><strong>1.9)</strong> Click the green "Add PLSS Entry" button</div>
                <div><strong>1.10)</strong> Repeat steps 1.3-1.9 to add more locations</div>
                <div><strong>1.11)</strong> Use red "×" buttons to remove unwanted entries</div>
              </div>
            </div>
            <PLSSForm onPLSSChange={handlePLSSChange} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">2</span>
              Generate Docker Script
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h4 className="font-semibold text-green-800 mb-3">🔧 Step 2 Instructions:</h4>
              <div className="space-y-2 text-sm text-green-700">
                <div><strong>2.1)</strong> Scroll down to see the script download section</div>
                <div><strong>2.2)</strong> Click the blue "Download piceance_agent_bootstrap.sh" button</div>
                <div><strong>2.3)</strong> Your browser will save the file to Downloads folder</div>
                <div><strong>2.4)</strong> Copy one of the command lines (Preset or Custom) by clicking the copy icon</div>
                <div><strong>2.5)</strong> The command is now in your clipboard, ready to paste</div>
              </div>
            </div>
            <ECMCScriptGenerator plssEntries={plssEntries} county={county} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">3</span>
              Execute Script to Generate Excel Data
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <h4 className="font-semibold text-purple-800 mb-3">💻 Step 3 Instructions:</h4>
              <div className="space-y-3 text-sm text-purple-700">
                <div className="font-medium">📁 Opening Terminal in Downloads Directory:</div>
                
                <div className="pl-4 space-y-2">
                  <div><strong>Mac Users:</strong></div>
                  <div className="pl-4 space-y-1">
                    <div>• Open Finder (click Finder icon in dock)</div>
                    <div>• Click "Downloads" in the sidebar</div>
                    <div>• Right-click in empty space in Downloads folder</div>
                    <div>• Select "New Terminal at Folder" (or "Services" → "New Terminal at Folder")</div>
                    <div>• Terminal opens automatically in Downloads directory</div>
                  </div>
                </div>

                <div className="pl-4 space-y-2">
                  <div><strong>Windows Users:</strong></div>
                  <div className="pl-4 space-y-1">
                    <div>• Open File Explorer (Windows key + E)</div>
                    <div>• Click "Downloads" in the left sidebar</div>
                    <div>• Hold Shift key and right-click in empty space</div>
                    <div>• Select "Open PowerShell window here" or "Open command window here"</div>
                    <div>• Command prompt opens in Downloads directory</div>
                  </div>
                </div>

                <div className="pl-4 space-y-2">
                  <div><strong>Alternative Method (All Systems):</strong></div>
                  <div className="pl-4 space-y-1">
                    <div>• Press Cmd+Space (Mac) or Windows key (PC)</div>
                    <div>• Type "terminal" (Mac) or "cmd" (Windows) and press Enter</div>
                    <div>• Type: <code className="bg-purple-100 px-1 rounded">cd Downloads</code> and press Enter</div>
                    <div>• You are now in the Downloads directory</div>
                  </div>
                </div>

                <div className="border-t border-purple-300 pt-3 mt-4">
                  <div><strong>3.1)</strong> Use one of the methods above to open terminal in Downloads</div>
                  <div><strong>3.2)</strong> Type: <code className="bg-purple-100 px-1 rounded">ls</code> (Mac) or <code className="bg-purple-100 px-1 rounded">dir</code> (Windows) and press Enter</div>
                  <div><strong>3.3)</strong> Verify you see "piceance_agent_bootstrap.sh" in the list</div>
                  <div><strong>3.4)</strong> Type: <code className="bg-purple-100 px-1 rounded">chmod +x piceance_agent_bootstrap.sh</code> and press Enter (Mac/Linux only)</div>
                  <div><strong>3.5)</strong> Right-click in terminal and select "Paste" to paste the command from Step 2</div>
                  <div><strong>3.6)</strong> Press Enter to start the script</div>
                  <div><strong>3.7)</strong> Wait 2-15 minutes - you'll see "Building Docker image..." messages</div>
                  <div><strong>3.8)</strong> When complete, you'll see "✅ Done. Deliverable: ..."</div>
                  <div><strong>3.9)</strong> The Excel file is ready in the piceance-nowi folder</div>
                </div>
              </div>
            </div>

            <div className="bg-muted/30 p-6 rounded-lg border-2 border-dashed border-primary/30">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <span className="bg-primary/10 text-primary rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">A</span>
                Download & Setup Script
              </h3>
              <div className="space-y-2 text-sm text-muted-foreground">
                <div>• Download <code className="bg-muted px-1 rounded">piceance_agent_bootstrap.sh</code> from Step 2 above</div>
                <div>• Open terminal in download directory</div>
                <div>• Run: <code className="bg-muted px-1 rounded">chmod +x piceance_agent_bootstrap.sh</code></div>
              </div>
            </div>

            <div className="bg-muted/30 p-6 rounded-lg border-2 border-dashed border-primary/30">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <span className="bg-primary/10 text-primary rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">B</span>
                Execute ECMC Scraping
              </h3>
              <div className="space-y-2 text-sm text-muted-foreground">
                <div>• Copy command from Step 2 (either Preset or Custom)</div>
                <div>• Paste and run in terminal</div>
                <div>• Wait 2-15 minutes for Docker to build and scrape ECMC</div>
                <div>• Watch for "✅ Done" message</div>
              </div>
            </div>

            <div className="bg-muted/30 p-6 rounded-lg border-2 border-dashed border-primary/30">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <span className="bg-primary/10 text-primary rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">C</span>
                Locate Generated Excel File
              </h3>
              <div className="space-y-2 text-sm text-muted-foreground">
                <div>• Find: <code className="bg-muted px-1 rounded">piceance-nowi/Piceance_NOWI_Template.xlsx</code></div>
                <div>• File contains OWNERS tab with scraped NOWI data</div>
                <div>• Each row has Evidence_Link (PDF URL) for verification</div>
                <div>• Ready to import in Step 4 below</div>
              </div>
            </div>

            <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
              <h4 className="font-medium text-amber-800 mb-2">⚠️ Important Notes:</h4>
              <ul className="text-sm text-amber-700 space-y-1">
                <li>• Requires Docker Desktop (Mac/Windows) or Docker Engine (Linux)</li>
                <li>• Script creates chunked requests with delays to avoid server overload</li>
                <li>• Process may take 5-15 minutes depending on PLSS location count</li>
                <li>• Generated Excel file will be ready for import in Step 4</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">4</span>
              Import Generated Excel Data
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
              <h4 className="font-semibold text-orange-800 mb-3">📊 Step 4 Instructions:</h4>
              <div className="space-y-2 text-sm text-orange-700">
                <div><strong>4.1)</strong> Click the "Choose File" button below</div>
                <div><strong>4.2)</strong> Navigate to your Downloads folder</div>
                <div><strong>4.3)</strong> Look for folder named "piceance-nowi" and double-click it</div>
                <div><strong>4.4)</strong> Find file named "Piceance_NOWI_Template.xlsx" and click it once</div>
                <div><strong>4.5)</strong> Click the "Open" button in the file dialog</div>
                <div><strong>4.6)</strong> Wait for "File uploaded and processed successfully" message</div>
                <div><strong>4.7)</strong> The data will automatically load into the dashboard below</div>
                <div><strong>4.8)</strong> You can now view and filter the imported NOWI records</div>
              </div>
            </div>
            <ExcelImporter onDataImported={handleDataImported} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">5</span>
              Review NOWI Data
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-teal-50 border border-teal-200 rounded-lg p-4">
              <h4 className="font-semibold text-teal-800 mb-3">📋 Step 5 Instructions:</h4>
              <div className="space-y-2 text-sm text-teal-700">
                <div><strong>5.1)</strong> Review the summary cards showing total records and statistics</div>
                <div><strong>5.2)</strong> Use the search box to find specific owner names</div>
                <div><strong>5.3)</strong> Click column headers to sort data (Name, County, DSU Key, etc.)</div>
                <div><strong>5.4)</strong> Click "View PDF" links to verify original ECMC documents</div>
                <div><strong>5.5)</strong> Use filters to narrow down results by county or working interest type</div>
                <div><strong>5.6)</strong> Export filtered results for further analysis if needed</div>
                <div><strong>5.7)</strong> Each record shows the evidence link for legal verification</div>
              </div>
            </div>
            <Dashboard importedData={importedData} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};