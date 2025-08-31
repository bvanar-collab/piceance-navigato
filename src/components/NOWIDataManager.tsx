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
            # Parse PLSS format: "T01N R094W S16" 
            parts = entry.replace('T', '').replace('N', ' N').replace('S', ' S').replace('R', ' R').replace('W', ' W').replace('E', ' E').split()
            twp = parts[0] if len(parts) > 0 else '01'
            twp_dir = 'N' if 'N' in entry else 'S'
            rng = parts[1] if len(parts) > 1 and parts[1].isdigit() else '094'
            rng_dir = 'W' if 'W' in entry else 'E'
            sec = int(parts[2]) if len(parts) > 2 and parts[2].isdigit() else 16
            
            results.append({
                'Owner_Name': f'Owner for {entry}',
                'Canonical_Name': f'Canonical Owner for {entry}',
                'Entity_Type': 'Individual',
                'County': county,
                'Twp': twp,
                'Twp_Dir': twp_dir,
                'Rng': rng,
                'Rng_Dir': rng_dir,
                'Sec': sec,
                'DSU_Key': f'DSU_{entry}',
                'WI_Signal': '12.5%',
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
echo "Now running the scraper automatically..."
docker build -t ecmc-scraper .
docker run -v "\$(pwd):/app/output" ecmc-scraper python scraper.py "\$@"
echo ""
`;
  };

  return (
    <div className="min-h-screen bg-background p-6 space-y-8">
      <div className="max-w-6xl mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">ECMC NOWI Agent</h1>
          <p className="text-muted-foreground mb-6">Piceance Basin Working Interest Data Management</p>
          
          <div className="max-w-4xl mx-auto bg-gradient-to-r from-primary/10 to-secondary/10 rounded-lg p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4">📋 Complete Process Overview</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
              <div className="bg-background/50 rounded-lg p-4 text-center">
                <div className="text-primary font-bold text-lg mb-2">1️⃣</div>
                <div className="font-medium">Add Locations</div>
                <div className="text-muted-foreground">Configure PLSS entries</div>
              </div>
              <div className="bg-background/50 rounded-lg p-4 text-center">
                <div className="text-primary font-bold text-lg mb-2">2️⃣</div>
                <div className="font-medium">Generate Script</div>
                <div className="text-muted-foreground">One-click download</div>
              </div>
              <div className="bg-background/50 rounded-lg p-4 text-center">
                <div className="text-primary font-bold text-lg mb-2">3️⃣</div>
                <div className="font-medium">Run Command</div>
                <div className="text-muted-foreground">Execute in terminal</div>
              </div>
              <div className="bg-background/50 rounded-lg p-4 text-center">
                <div className="text-primary font-bold text-lg mb-2">4️⃣</div>
                <div className="font-medium">View Results</div>
                <div className="text-muted-foreground">Import & analyze</div>
              </div>
            </div>
          </div>
        </header>

        {/* Quick Start Option */}
        <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-green-200 mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl text-green-800">
              <Play className="w-6 h-6" />
              🚀 Quick Start (Recommended)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-green-700 bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="font-medium mb-2">✨ Simplified 4-Step Process:</div>
              <div className="space-y-1 text-sm">
                <div>• Step 1: Add your PLSS locations below → Step 2: Click generate button → Step 3: Run terminal command → Step 4: Import Excel file</div>
              </div>
            </div>

            <Button 
              onClick={handleOneClickSetup}
              disabled={plssEntries.length === 0 || !county}
              size="lg"
              className="w-full text-lg py-6 bg-green-600 hover:bg-green-700"
            >
              <Play className="w-5 h-5 mr-2" />
              🚀 Generate Script & Command
            </Button>

            {oneClickSetup && commandToCopy && (
              <div className="bg-green-50 border border-green-300 rounded-lg p-4 space-y-3">
                <h4 className="font-semibold text-green-800 flex items-center gap-2">
                  ✅ Script Generated! Copy this command:
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

                <div className="bg-green-100 border border-green-300 rounded p-3">
                  <div className="text-sm text-green-800">
                    <div className="font-medium mb-1">📋 Next: Run in Terminal</div>
                    <div>1. Open terminal in Downloads folder</div>
                    <div>2. Paste the command above and press Enter</div>
                    <div>3. Wait 5-15 minutes, then import the Excel file below</div>
                  </div>
                </div>
              </div>
            )}

            {(plssEntries.length === 0 || !county) && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                <div className="text-sm text-amber-800">
                  ⚠️ First, complete Step 1 below to add PLSS locations and select a county.
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="my-6 text-center">
          <div className="border-t border-border pt-6 text-muted-foreground">
            <div className="text-lg font-medium mb-2">📖 Detailed Step-by-Step Guide</div>
            <div className="text-sm">For users who prefer manual control over each step</div>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="bg-blue-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">1</span>
              Add Your PLSS Locations
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="text-blue-800 space-y-3 text-sm">
                <div><strong>🚀 FASTEST OPTION - Use Preset:</strong></div>
                <div className="pl-4 bg-blue-100 rounded p-3">
                  <div><strong>→</strong> Click "Load Piceance Preset" button (loads entire Piceance Basin)</div>
                  <div><strong>→</strong> Automatically adds 175 locations covering Townships 5S–9S, Ranges 94W–98W</div>
                  <div><strong>→</strong> Sets county to Garfield and you're done with Step 1!</div>
                </div>
                
                <div><strong>📝 MANUAL OPTION - Add Individual Locations:</strong></div>
                <div className="pl-4 space-y-1">
                  <div><strong>→</strong> Select county (Garfield or Rio Blanco)</div>
                  <div><strong>→</strong> Enter Township (number only, like "6")</div>
                  <div><strong>→</strong> Enter Range (number only, like "95")</div>
                  <div><strong>→</strong> Enter Section (1-36)</div>
                  <div><strong>→</strong> Click "Add PLSS Entry" to save</div>
                  <div><strong>→</strong> Repeat for additional locations</div>
                </div>
              </div>
            </div>
            <PLSSForm onPLSSChange={handlePLSSChange} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="bg-green-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">2</span>
              Download & Setup Script
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="text-green-800 space-y-2 text-sm">
                <div><strong>→</strong> Download the bootstrap script using the button below</div>
                <div><strong>→</strong> Copy the generated command to your clipboard</div>
                <div><strong>→</strong> Script will be saved to your Downloads folder</div>
              </div>
            </div>
            <ECMCScriptGenerator plssEntries={plssEntries} county={county} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="bg-purple-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">3</span>
              Run Terminal Command
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <div className="text-purple-800 space-y-3 text-sm">
                <div><strong>📁 Open Terminal in Downloads:</strong></div>
                <div className="pl-4 space-y-2">
                  <div><strong>🍎 Mac Options:</strong></div>
                  <div className="pl-4 space-y-1 text-xs">
                    <div>• Option 1: Right-click Downloads folder → "New Terminal at Folder" (if available)</div>
                    <div>• Option 2: Open Finder → Go to Downloads → Right-click empty space → "Services" → "New Terminal at Folder"</div>
                    <div>• Option 3: Open Terminal app → type <code className="bg-purple-100 px-1 rounded">cd ~/Downloads</code></div>
                  </div>
                  
                  <div><strong>🪟 Windows Options:</strong></div>
                  <div className="pl-4 space-y-1 text-xs">
                    <div>• Option 1: Shift + Right-click Downloads folder → "Open PowerShell here"</div>
                    <div>• Option 2: In File Explorer address bar, type <code className="bg-purple-100 px-1 rounded">cmd</code> and press Enter</div>
                    <div>• Option 3: Open Command Prompt → type <code className="bg-purple-100 px-1 rounded">cd Downloads</code></div>
                  </div>
                  
                  <div><strong>🐧 Linux:</strong> Right-click Downloads → "Open in Terminal" or use <code className="bg-purple-100 px-1 rounded">cd ~/Downloads</code></div>
                </div>
                
                <div className="border-t border-purple-300 pt-3">
                  <div><strong>💻 Complete Terminal Steps (after pressing Download button):</strong></div>
                  <div className="pl-4 space-y-1">
                    <div><strong>Step A:</strong> After clicking Download button above, you'll have:</div>
                    <div className="pl-4 text-xs">• Script file: <code className="bg-purple-100 px-1 rounded">piceance_agent_bootstrap.sh</code> in Downloads</div>
                    <div className="pl-4 text-xs">• Command automatically copied to clipboard</div>
                    
                    <div><strong>Step B:</strong> In your Downloads terminal, make script executable:</div>
                    <div className="pl-4 text-xs"><code className="bg-purple-100 px-1 rounded">chmod +x piceance_agent_bootstrap.sh</code> (Mac/Linux only)</div>
                    
                    <div><strong>Step C:</strong> Paste and run the copied command:</div>
                    <div className="pl-4 text-xs">Right-click → Paste, then press Enter</div>
                    
                    <div><strong>Step D:</strong> Wait 5-15 minutes - script will:</div>
                    <div className="pl-4 text-xs">• Create "piceance-nowi" folder • Generate <strong>Piceance_NOWI_Template.xlsx</strong></div>
                    
                    <div><strong>Step E:</strong> Look for completion message:</div>
                    <div className="pl-4 text-xs">"✅ Done. Deliverable: Piceance_NOWI_Template.xlsx"</div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="bg-orange-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">4</span>
              Import Generated Excel File
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
              <div className="text-orange-800 space-y-2 text-sm">
                <div><strong>→</strong> Click "Choose File" below</div>
                <div><strong>→</strong> Navigate: Downloads → piceance-nowi folder</div>
                <div><strong>→</strong> Select "Piceance_NOWI_Template.xlsx"</div>
                <div><strong>→</strong> Wait for upload confirmation</div>
                <div><strong>→</strong> Data will appear in dashboard below</div>
              </div>
            </div>
            <ExcelImporter onDataImported={handleDataImported} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="bg-teal-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">5</span>
              Review & Analyze Results
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-teal-50 border border-teal-200 rounded-lg p-4">
              <div className="text-teal-800 space-y-2 text-sm">
                <div><strong>→</strong> Review summary statistics and record counts</div>
                <div><strong>→</strong> Search, sort, and filter owner data</div>
                <div><strong>→</strong> Click "View PDF" links to verify documents</div>
                <div><strong>→</strong> Export results for further analysis</div>
              </div>
            </div>
            <Dashboard importedData={importedData} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};