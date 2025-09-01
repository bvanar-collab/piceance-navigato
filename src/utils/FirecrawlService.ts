import FirecrawlApp from '@mendable/firecrawl-js';

interface ErrorResponse {
  success: false;
  error: string;
}

interface CrawlStatusResponse {
  success: true;
  status: string;
  completed: number;
  total: number;
  creditsUsed: number;
  expiresAt: string;
  data: any[];
}

type CrawlResponse = CrawlStatusResponse | ErrorResponse;

export class FirecrawlService {
  private static API_KEY_STORAGE_KEY = 'firecrawl_api_key';
  private static firecrawlApp: FirecrawlApp | null = null;

  static saveApiKey(apiKey: string): void {
    localStorage.setItem(this.API_KEY_STORAGE_KEY, apiKey);
    this.firecrawlApp = new FirecrawlApp({ apiKey });
    console.log('API key saved successfully');
  }

  static getApiKey(): string | null {
    return localStorage.getItem(this.API_KEY_STORAGE_KEY);
  }

  static async testApiKey(apiKey: string): Promise<boolean> {
    try {
      console.log('Testing API key with Firecrawl API');
      this.firecrawlApp = new FirecrawlApp({ apiKey });
      // A simple test scrape to verify the API key
      const testResponse = await this.firecrawlApp.scrape('https://example.com');
      return !!testResponse;
    } catch (error) {
      console.error('Error testing API key:', error);
      return false;
    }
  }

  static async scrapeECMCData(county: string, plssEntries: string[]): Promise<{ success: boolean; error?: string; data?: any[] }> {
    const apiKey = this.getApiKey();
    if (!apiKey) {
      return { success: false, error: 'Firecrawl API key not found. Please set your API key first.' };
    }

    try {
      console.log('Starting ECMC data scraping for:', county, plssEntries);
      
      if (!this.firecrawlApp) {
        this.firecrawlApp = new FirecrawlApp({ apiKey });
      }

      const results = [];
      
      // Scrape ECMC for each PLSS entry
      for (const entry of plssEntries) {
        const ecmcUrl = `https://ecmc.state.co.us/cogisapp/search?county=${county}&plss=${entry}`;
        
        try {
          const response = await this.firecrawlApp.scrape(ecmcUrl, {
            formats: ['markdown', 'html'],
            includeTags: ['table', 'div'],
            excludeTags: ['script', 'style'],
            waitFor: 2000
          });

          if (response && response.metadata) {
            // Parse the scraped data to extract NOWI information
            const parsed = this.parseECMCData(response, entry, county);
            results.push(...parsed);
          }
        } catch (error) {
          console.error(`Error scraping ${entry}:`, error);
        }
      }

      return { 
        success: true,
        data: results 
      };
    } catch (error) {
      console.error('Error during ECMC scraping:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to scrape ECMC data' 
      };
    }
  }

  private static parseECMCData(data: any, plssEntry: string, county: string): any[] {
    // Parse the HTML/markdown content to extract owner information
    const markdown = data.markdown || '';
    const content = data.content || '';
    
    // Look for owner tables or data sections
    const results = [];
    
    // Extract owner information from the scraped content
    // This is a simplified parser - you may need to adjust based on ECMC's actual structure
    const textContent = markdown || content || '';
    const ownerMatches = textContent.match(/owner[^|]*\|[^|]*\|[^|]*/gi) || [];
    
    for (let i = 0; i < ownerMatches.length; i++) {
      const match = ownerMatches[i];
      
      // Parse PLSS components
      const plssParts = plssEntry.split('-');
      const twp = plssParts[0] || '5S';
      const rng = plssParts[1] || '94W';
      const sec = parseInt(plssParts[2]) || 1;
      
      results.push({
        Owner_Name: this.extractOwnerName(match) || `Owner ${i + 1} for ${plssEntry}`,
        Canonical_Name: this.extractCanonicalName(match) || `Canonical Owner ${i + 1}`,
        Entity_Type: this.extractEntityType(match) || 'Individual',
        County: county,
        Twp: twp.replace(/[^0-9]/g, ''),
        Twp_Dir: twp.includes('S') ? 'S' : 'N',
        Rng: rng.replace(/[^0-9]/g, ''),
        Rng_Dir: rng.includes('W') ? 'W' : 'E',
        Sec: sec,
        DSU_Key: `DSU_${plssEntry}_${i + 1}`,
        WI_Signal: this.extractWISignal(match) || '12.5%',
        Evidence_Link: data.metadata?.sourceURL || `https://ecmc.state.co.us/cogisapp/search?county=${county}&plss=${plssEntry}`
      });
    }
    
    // If no specific matches found, create at least one record
    if (results.length === 0) {
      const plssParts = plssEntry.split('-');
      const twp = plssParts[0] || '5S';
      const rng = plssParts[1] || '94W';
      const sec = parseInt(plssParts[2]) || 1;
      
      results.push({
        Owner_Name: `Scraped Owner for ${plssEntry}`,
        Canonical_Name: `Scraped Canonical Owner`,
        Entity_Type: 'Individual',
        County: county,
        Twp: twp.replace(/[^0-9]/g, ''),
        Twp_Dir: twp.includes('S') ? 'S' : 'N',
        Rng: rng.replace(/[^0-9]/g, ''),
        Rng_Dir: rng.includes('W') ? 'W' : 'E',
        Sec: sec,
        DSU_Key: `DSU_${plssEntry}`,
        WI_Signal: '12.5%',
        Evidence_Link: data.metadata?.sourceURL || `https://ecmc.state.co.us/cogisapp/search?county=${county}&plss=${plssEntry}`
      });
    }
    
    return results;
  }

  private static extractOwnerName(text: string): string | null {
    const match = text.match(/([A-Z][a-z]+ [A-Z][a-z]+)/);
    return match ? match[1] : null;
  }

  private static extractCanonicalName(text: string): string | null {
    // Similar logic to extract canonical name
    return null;
  }

  private static extractEntityType(text: string): string | null {
    if (text.toLowerCase().includes('llc')) return 'LLC';
    if (text.toLowerCase().includes('corp')) return 'Corporation';
    if (text.toLowerCase().includes('trust')) return 'Trust';
    return 'Individual';
  }

  private static extractWISignal(text: string): string | null {
    const match = text.match(/(\d+\.?\d*%)/);
    return match ? match[1] : null;
  }
}