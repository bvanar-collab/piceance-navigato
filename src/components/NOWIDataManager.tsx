import { useState } from "react";
import { PLSSForm } from "./PLSSForm";
import { ECMCScriptGenerator } from "./ECMCScriptGenerator";
import { ExcelImporter, type NOWIOwner } from "./ExcelImporter";
import { Dashboard } from "./Dashboard";

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
    <div className="min-h-screen">
      <PLSSForm onPLSSChange={handlePLSSChange} />
      <ECMCScriptGenerator plssEntries={plssEntries} county={county} />
      <ExcelImporter onDataImported={handleDataImported} />
      <Dashboard importedData={importedData} />
    </div>
  );
};