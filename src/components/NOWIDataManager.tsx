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
          <CardContent>
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
          <CardContent>
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
          <CardContent>
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
          <CardContent>
            <Dashboard importedData={importedData} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};