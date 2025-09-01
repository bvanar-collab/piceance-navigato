import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/components/ui/use-toast";
import { ECMCScraperService } from '@/utils/ECMCScraperService';
import { AlertCircle, Globe, Zap } from 'lucide-react';
import { Alert, AlertDescription } from "@/components/ui/alert";

interface NOWIOwner {
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

interface RealDataScraperProps {
  onDataScraped: (data: NOWIOwner[]) => void;
  plssEntries: string[];
  county: string;
}

export const RealDataScraper: React.FC<RealDataScraperProps> = ({ 
  onDataScraped, 
  plssEntries, 
  county 
}) => {
  const { toast } = useToast();
  const [isScrapingData, setIsScrapingData] = useState(false);
  const [scrapingProgress, setScrapingProgress] = useState(0);
  const [scrapedCount, setScrapedCount] = useState(0);

  const handleScrapeData = async () => {
    if (!plssEntries.length || !county) {
      toast({
        title: "Error",
        description: "Please add PLSS entries and select a county first",
        variant: "destructive",
      });
      return;
    }

    setIsScrapingData(true);
    setScrapingProgress(10);
    setScrapedCount(0);

    try {
      toast({
        title: "Starting ECMC Data Scraping",
        description: `Processing ${plssEntries.length} PLSS entries from ${county} County...`,
      });

      setScrapingProgress(30);
      
      const result = await ECMCScraperService.scrapeECMCData(county, plssEntries);
      
      setScrapingProgress(90);

      if (result.success && result.data) {
        setScrapedCount(result.data.length);
        onDataScraped(result.data);
        
        toast({
          title: "Scraping Complete!",
          description: `Successfully processed ${result.data.length} NOWI records from ECMC data`,
        });
      } else {
        toast({
          title: "Scraping Failed",
          description: result.error || "Failed to process ECMC data",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error during data scraping:', error);
      toast({
        title: "Error",
        description: "An error occurred while processing data",
        variant: "destructive",
      });
    } finally {
      setIsScrapingData(false);
      setScrapingProgress(100);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="h-5 w-5" />
          ECMC Data Processor
        </CardTitle>
        <CardDescription>
          Process NOWI data for your PLSS entries using ECMC information patterns
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            This tool processes NOWI data patterns based on ECMC information for {plssEntries.length} PLSS entries in {county} County.
            Results are generated using realistic data patterns from Colorado energy records.
          </AlertDescription>
        </Alert>

        {isScrapingData && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Processing ECMC data patterns...</span>
              <span>{scrapedCount} records processed</span>
            </div>
            <Progress value={scrapingProgress} className="w-full" />
          </div>
        )}

        <div className="flex gap-2">
          <Button 
            onClick={handleScrapeData} 
            disabled={isScrapingData || !plssEntries.length}
            className="flex-1"
          >
            {isScrapingData ? "Processing Data..." : "Process NOWI Data"}
          </Button>
        </div>

        <div className="text-sm text-muted-foreground">
          <p><strong>Target:</strong> {plssEntries.length} PLSS entries in {county} County</p>
          <p><strong>Source:</strong> ECMC data patterns and Colorado energy records</p>
          <p><strong>Note:</strong> For full live scraping capabilities, integrate with a backend service</p>
        </div>
      </CardContent>
    </Card>
  );
};