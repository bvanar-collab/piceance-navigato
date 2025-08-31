import { useState } from "react";
import { PLSSForm } from "./PLSSForm";
import { ECMCScriptGenerator } from "./ECMCScriptGenerator";
import { ExcelImporter, type NOWIOwner } from "./ExcelImporter";
import { Dashboard } from "./Dashboard";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";

export const NOWIDataManager = () => {
  const [plssEntries, setPLSSEntries] = useState<string[]>([]);
  const [county, setCounty] = useState<string>("");
  const [importedData, setImportedData] = useState<NOWIOwner[]>([]);

  const handlePLSSChange = (entries: string[], selectedCounty: string) => {
    setPLSSEntries(entries);
    setCounty(selectedCounty);
  };

  const handleDataImported = (data: NOWIOwner[]) => {
    setImportedData(data);
  };

  return (
    <div className="min-h-screen bg-background p-6 space-y-8">
      <div className="max-w-6xl mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">ECMC NOWI Agent</h1>
          <p className="text-muted-foreground">Piceance Basin Working Interest Data Management</p>
        </header>

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