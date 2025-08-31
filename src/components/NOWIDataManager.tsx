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
              <span className="bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">4</span>
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