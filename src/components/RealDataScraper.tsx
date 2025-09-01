import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/components/ui/use-toast";
import { FirecrawlService } from '@/utils/FirecrawlService';
import { AlertCircle, Key, Globe } from 'lucide-react';
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
  const [apiKey, setApiKey] = useState('');
  const [isApiKeySet, setIsApiKeySet] = useState(!!FirecrawlService.getApiKey());
  const [isScrapingData, setIsScrapingData] = useState(false);
  const [scrapingProgress, setScrapingProgress] = useState(0);
  const [scrapedCount, setScrapedCount] = useState(0);

  const handleSetApiKey = async () => {
    if (!apiKey.trim()) {
      toast({
        title: "Error",
        description: "Please enter a valid Firecrawl API key",
        variant: "destructive",
      });
      return;
    }

    const isValid = await FirecrawlService.testApiKey(apiKey);
    if (isValid) {
      FirecrawlService.saveApiKey(apiKey);
      setIsApiKeySet(true);
      setApiKey('');
      toast({
        title: "Success",
        description: "Firecrawl API key saved successfully",
      });
    } else {
      toast({
        title: "Error",
        description: "Invalid API key. Please check and try again.",
        variant: "destructive",
      });
    }
  };

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
    setScrapingProgress(0);
    setScrapedCount(0);

    try {
      toast({
        title: "Starting Real Data Scraping",
        description: `Scraping ${plssEntries.length} PLSS entries from ECMC...`,
      });

      const result = await FirecrawlService.scrapeECMCData(county, plssEntries);

      if (result.success && result.data) {
        setScrapedCount(result.data.length);
        onDataScraped(result.data);
        
        toast({
          title: "Scraping Complete!",
          description: `Successfully scraped ${result.data.length} NOWI records from ECMC`,
        });
      } else {
        toast({
          title: "Scraping Failed",
          description: result.error || "Failed to scrape data from ECMC",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error during data scraping:', error);
      toast({
        title: "Error",
        description: "An error occurred while scraping data",
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
          <Globe className="h-5 w-5" />
          Real ECMC Data Scraper
        </CardTitle>
        <CardDescription>
          Scrape real NOWI data directly from the ECMC website using Firecrawl
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {!isApiKeySet ? (
          <div className="space-y-4">
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                You need a Firecrawl API key to scrape real data from ECMC. 
                Get one at <a href="https://firecrawl.dev" target="_blank" rel="noopener noreferrer" className="underline">firecrawl.dev</a>
              </AlertDescription>
            </Alert>
            
            <div className="space-y-2">
              <Label htmlFor="apiKey" className="flex items-center gap-2">
                <Key className="h-4 w-4" />
                Firecrawl API Key
              </Label>
              <div className="flex gap-2">
                <Input
                  id="apiKey"
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="Enter your Firecrawl API key"
                  className="flex-1"
                />
                <Button onClick={handleSetApiKey} disabled={!apiKey.trim()}>
                  Save Key
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Ready to scrape real NOWI data from ECMC. This will search for actual owner records 
                for {plssEntries.length} PLSS entries in {county} County.
              </AlertDescription>
            </Alert>

            {isScrapingData && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Scraping in progress...</span>
                  <span>{scrapedCount} records found</span>
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
                {isScrapingData ? "Scraping Data..." : "Scrape Real NOWI Data"}
              </Button>
              <Button 
                variant="outline" 
                onClick={() => {
                  localStorage.removeItem('firecrawl_api_key');
                  setIsApiKeySet(false);
                }}
              >
                Change API Key
              </Button>
            </div>

            <div className="text-sm text-muted-foreground">
              <p><strong>Target:</strong> {plssEntries.length} PLSS entries in {county} County</p>
              <p><strong>Source:</strong> Colorado Energy & Carbon Management Commission (ECMC)</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};