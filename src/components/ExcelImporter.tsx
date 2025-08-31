import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Upload, FileSpreadsheet, CheckCircle, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import * as XLSX from 'xlsx';

export interface NOWIOwner {
  Owner_Name: string;
  Canonical_Name: string;
  Entity_Type: string;
  County: string;
  Twp: string;
  Twp_Dir: string;
  Rng: string;
  Rng_Dir: string;
  Sec: number;
  DSU_Key: string;
  WI_Signal: string;
  Evidence_Link: string;
}

interface ExcelImporterProps {
  onDataImported: (data: NOWIOwner[]) => void;
}

export const ExcelImporter = ({ onDataImported }: ExcelImporterProps) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [importResults, setImportResults] = useState<{
    total: number;
    successful: number;
    errors: string[];
  } | null>(null);

  const { toast } = useToast();

  const validateOwner = (row: any, index: number): { owner?: NOWIOwner; error?: string } => {
    try {
      // Required fields validation
      const requiredFields = ['Owner_Name', 'County', 'Twp', 'Rng', 'Sec', 'DSU_Key', 'WI_Signal', 'Evidence_Link'];
      
      for (const field of requiredFields) {
        if (!row[field]) {
          return { error: `Row ${index + 2}: Missing required field '${field}'` };
        }
      }

      // Validate PLSS format
      if (!/^\d+[NS]$/.test(row.Twp + (row.Twp_Dir || 'S'))) {
        return { error: `Row ${index + 2}: Invalid township format` };
      }

      if (!/^\d+[EW]$/.test(row.Rng + (row.Rng_Dir || 'W'))) {
        return { error: `Row ${index + 2}: Invalid range format` };
      }

      const section = parseInt(row.Sec);
      if (isNaN(section) || section < 1 || section > 36) {
        return { error: `Row ${index + 2}: Section must be between 1-36` };
      }

      // Validate URL format
      try {
        new URL(row.Evidence_Link);
      } catch {
        return { error: `Row ${index + 2}: Invalid Evidence_Link URL format` };
      }

      const owner: NOWIOwner = {
        Owner_Name: row.Owner_Name.trim(),
        Canonical_Name: row.Canonical_Name || row.Owner_Name.replace(/\s+(LLC|INC|LP|CORP).*$/i, '').trim(),
        Entity_Type: row.Entity_Type || 'LLC',
        County: row.County.trim(),
        Twp: row.Twp.toString().trim(),
        Twp_Dir: row.Twp_Dir || 'S',
        Rng: row.Rng.toString().trim(),
        Rng_Dir: row.Rng_Dir || 'W',
        Sec: section,
        DSU_Key: row.DSU_Key.trim(),
        WI_Signal: row.WI_Signal.trim(),
        Evidence_Link: row.Evidence_Link.trim()
      };

      return { owner };
    } catch (error) {
      return { error: `Row ${index + 2}: Validation error - ${error}` };
    }
  };

  const processExcelFile = useCallback(async (file: File) => {
    setIsProcessing(true);
    setProgress(0);
    setImportResults(null);

    try {
      const buffer = await file.arrayBuffer();
      const workbook = XLSX.read(buffer, { type: 'buffer' });
      
      // Look for OWNERS sheet
      const sheetName = workbook.SheetNames.find(name => 
        name.toUpperCase() === 'OWNERS'
      ) || workbook.SheetNames[0];
      
      if (!sheetName) {
        throw new Error('No valid sheet found in Excel file');
      }

      const worksheet = workbook.Sheets[sheetName];
      const rawData = XLSX.utils.sheet_to_json(worksheet);
      
      if (rawData.length === 0) {
        throw new Error('Excel file contains no data rows');
      }

      const validOwners: NOWIOwner[] = [];
      const errors: string[] = [];

      // Process each row with progress updates
      for (let i = 0; i < rawData.length; i++) {
        const { owner, error } = validateOwner(rawData[i], i);
        
        if (owner) {
          validOwners.push(owner);
        } else if (error) {
          errors.push(error);
        }

        // Update progress
        setProgress(((i + 1) / rawData.length) * 100);
        
        // Allow UI to update
        if (i % 10 === 0) {
          await new Promise(resolve => setTimeout(resolve, 1));
        }
      }

      // Remove duplicates by (Canonical_Name, DSU_Key)
      const uniqueOwners = validOwners.filter((owner, index, self) => 
        index === self.findIndex(o => 
          o.Canonical_Name === owner.Canonical_Name && o.DSU_Key === owner.DSU_Key
        )
      );

      const results = {
        total: rawData.length,
        successful: uniqueOwners.length,
        errors: errors.slice(0, 10) // Show first 10 errors
      };

      setImportResults(results);
      onDataImported(uniqueOwners);

      toast({
        title: "Import completed",
        description: `Successfully imported ${uniqueOwners.length} NOWI owners`,
      });

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setImportResults({
        total: 0,
        successful: 0,
        errors: [errorMessage]
      });

      toast({
        title: "Import failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
      setProgress(0);
    }
  }, [onDataImported, toast]);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.match(/\.(xlsx|xls)$/i)) {
      toast({
        title: "Invalid file type",
        description: "Please upload an Excel file (.xlsx or .xls)",
        variant: "destructive",
      });
      return;
    }

    processExcelFile(file);
  };

  return (
    <section className="py-16 px-6">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Import ECMC Results</h2>
          <p className="text-muted-foreground text-lg">
            Upload the Piceance_NOWI_Template.xlsx file generated by the scraper script
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Upload Card */}
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="w-5 h-5" />
                Upload Excel File
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary/50 transition-colors">
                <FileSpreadsheet className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <Label htmlFor="excel-upload" className="cursor-pointer">
                  <div className="space-y-2">
                    <p className="text-sm font-medium">
                      Click to select Excel file
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Supports .xlsx and .xls files
                    </p>
                  </div>
                </Label>
                <Input
                  id="excel-upload"
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={handleFileUpload}
                  disabled={isProcessing}
                  className="hidden"
                />
              </div>

              {isProcessing && (
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span>Processing Excel file...</span>
                    <span>{Math.round(progress)}%</span>
                  </div>
                  <Progress value={progress} className="h-2" />
                </div>
              )}

              <div className="text-xs text-muted-foreground space-y-1">
                <p><strong>Expected format:</strong> OWNERS sheet with columns:</p>
                <p className="font-mono">Owner_Name, County, Twp, Rng, Sec, DSU_Key, WI_Signal, Evidence_Link</p>
              </div>
            </CardContent>
          </Card>

          {/* Results Card */}
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle>Import Results</CardTitle>
            </CardHeader>
            <CardContent>
              {!importResults ? (
                <div className="text-center py-12 text-muted-foreground">
                  <FileSpreadsheet className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p>Upload an Excel file to see import results</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Success Stats */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 bg-earth-green/10 rounded-lg border border-earth-green/20">
                      <div className="text-2xl font-bold text-earth-green">{importResults.successful}</div>
                      <div className="text-sm text-muted-foreground">Imported</div>
                    </div>
                    <div className="text-center p-4 bg-muted/50 rounded-lg border">
                      <div className="text-2xl font-bold">{importResults.total}</div>
                      <div className="text-sm text-muted-foreground">Total Rows</div>
                    </div>
                  </div>

                  {/* Status Badge */}
                  {importResults.errors.length === 0 ? (
                    <Badge variant="secondary" className="w-full justify-center py-2">
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Import Successful
                    </Badge>
                  ) : (
                    <Badge variant="destructive" className="w-full justify-center py-2">
                      <AlertTriangle className="w-4 h-4 mr-2" />
                      {importResults.errors.length} Errors Found
                    </Badge>
                  )}

                  {/* Errors */}
                  {importResults.errors.length > 0 && (
                    <div>
                      <h4 className="font-medium text-sm mb-2">Import Errors:</h4>
                      <div className="space-y-1 text-xs max-h-32 overflow-y-auto">
                        {importResults.errors.map((error, index) => (
                          <div key={index} className="text-destructive bg-destructive/5 p-2 rounded border">
                            {error}
                          </div>
                        ))}
                        {importResults.errors.length === 10 && (
                          <div className="text-muted-foreground italic">
                            ... and more errors (showing first 10)
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Deduplication Info */}
                  {importResults.successful < importResults.total - importResults.errors.length && (
                    <div className="text-xs text-muted-foreground bg-muted/30 p-3 rounded border">
                      <strong>Note:</strong> Duplicates removed based on (Canonical_Name, DSU_Key) pairs
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};