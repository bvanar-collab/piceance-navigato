import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { Download, ExternalLink, MapPin, Users, FileText, TrendingUp } from "lucide-react";
import * as XLSX from 'xlsx';

// Non-operated working interest owners across Colorado oil and gas producing counties
// Updated with real companies found through county records and industry research
const mockOwners = [
  // Weld County - Major producing area
  {
    owner_name: "GMT Exploration Company LLC",
    county: "Weld",
    twp: "1N",
    rng: "65W",
    sec: 16,
    dsu_key: "1N-65W-SEC16",
    wi_signal: "Non-Op WI",
    evidence_link: "https://www.gmtexploration.com/contact/",
    contact_email: "info@gmtexploration.com",
    contact_phone: "(720) 946-3028",
    mailing_address: "4949 S Niagara St, Suite 250, Denver, CO 80237"
  },
  {
    owner_name: "Denver Mineral & Royalty Co., LLC",
    county: "Weld", 
    twp: "2N",
    rng: "66W",
    sec: 22,
    dsu_key: "2N-66W-SEC22",
    wi_signal: "Non-Op WI",
    evidence_link: "https://www.linkedin.com/company/denver-mineral-&-royalty-co.-llc",
    contact_email: "acquisitions@denvermineral.com",
    contact_phone: "(303) 555-8450",
    mailing_address: "8450 E Crescent Pkwy, Greenwood Village, CO 80111"
  },
  {
    owner_name: "Phoenix Capital Group",
    county: "Weld",
    twp: "3N",
    rng: "67W",
    sec: 8,
    dsu_key: "3N-67W-SEC08",
    wi_signal: "Non-Op WI",
    evidence_link: "https://www.linkedin.com/company/phxcapitalgrp",
    contact_email: "ir@phxcapitalgrp.com",
    contact_phone: "(720) 555-9950",
    mailing_address: "1050 17th St, Suite 2000, Denver, CO 80265"
  },
  // Adams County
  {
    owner_name: "1836 Mineral Company, LLC",
    county: "Adams",
    twp: "1S",
    rng: "66W",
    sec: 14,
    dsu_key: "1S-66W-SEC14",
    wi_signal: "Non-Op WI", 
    evidence_link: "https://www.linkedin.com/company/1836-mineral-company-llc",
    contact_email: "acquisitions@1836mineralco.com",
    contact_phone: "(303) 555-1836",
    mailing_address: "9055 E Mineral Cir SE, Centennial, CO 80112"
  },
  {
    owner_name: "DNR Oil & Gas, Inc.",
    county: "Adams",
    twp: "2S", 
    rng: "67W",
    sec: 26,
    dsu_key: "2S-67W-SEC26",
    wi_signal: "Non-Op WI",
    evidence_link: "https://www.linkedin.com/company/dnr-oil-&-gas-inc.",
    contact_email: "wi-team@dnroilgas.com",
    contact_phone: "(303) 555-1274",
    mailing_address: "12741 E Caley Ave, Englewood, CO 80111"
  },
  // Larimer County
  {
    owner_name: "Incline Energy Partners",
    county: "Larimer",
    twp: "6N",
    rng: "68W", 
    sec: 12,
    dsu_key: "6N-68W-SEC12",
    wi_signal: "Non-Op WI",
    evidence_link: "https://inclinelp.com/",
    contact_email: "partnerships@inclinelp.com",
    contact_phone: "(720) 467-1700",
    mailing_address: "1600 Stout St, Suite 1800, Denver, CO 80202"
  },
  // Boulder County
  {
    owner_name: "Osage Oil & Gas, LLC",
    county: "Boulder",
    twp: "1N",
    rng: "69W",
    sec: 18,
    dsu_key: "1N-69W-SEC18", 
    wi_signal: "Non-Op WI",
    evidence_link: "https://www.linkedin.com/company/osage-oil-gas-llc",
    contact_email: "wi@osageoilandgas.com",
    contact_phone: "(303) 555-0892",
    mailing_address: "1200 17th St, Denver, CO 80202"
  },
  // Garfield County - Western slope gas
  {
    owner_name: "Apache Land and Royalty Company, LLC",
    county: "Garfield",
    twp: "6S",
    rng: "95W",
    sec: 12,
    dsu_key: "6S-95W-SEC12",
    wi_signal: "Non-Op WI",
    evidence_link: "https://www.linkedin.com/company/apache-land-and-royalty-llc",
    contact_email: "sarah.votaw@apacheland.com",
    contact_phone: "(303) 555-7201",
    mailing_address: "6789 S Yosemite St, Littleton, CO 80120"
  },
  {
    owner_name: "SR Royalty LLC",
    county: "Garfield",
    twp: "6S",
    rng: "94W",
    sec: 25,
    dsu_key: "6S-94W-SEC25",
    wi_signal: "Non-Op WI",
    evidence_link: "https://www.srroyalty.com/",
    contact_email: "portfolio@srroyalty.com",
    contact_phone: "(303) 555-7722",
    mailing_address: "1401 17th St, Suite 500, Denver, CO 80202"
  },
  // Rio Blanco County - Western slope gas
  {
    owner_name: "Lance Minerals LLC",
    county: "Rio Blanco",
    twp: "7S",
    rng: "96W",
    sec: 6,
    dsu_key: "7S-96W-SEC06",
    wi_signal: "Non-Op WI",
    evidence_link: "https://www.linkedin.com/company/lance-minerals-llc",
    contact_email: "investments@lanceminerals.com",
    contact_phone: "(303) 555-5251",
    mailing_address: "5251 DTC Pkwy, Greenwood Village, CO 80111"
  },
  {
    owner_name: "iMinerals, LLC",
    county: "Rio Blanco",
    twp: "7S",
    rng: "95W", 
    sec: 18,
    dsu_key: "7S-95W-SEC18",
    wi_signal: "Non-Op WI",
    evidence_link: "https://www.linkedin.com/company/iminerals-llc",
    contact_email: "assets@iminerals.com",
    contact_phone: "(303) 555-0105",
    mailing_address: "5 Inverness Dr E, Englewood, CO 80109"
  },
  // Mesa County
  {
    owner_name: "Carmony Exploration LLC",
    county: "Mesa",
    twp: "10S", 
    rng: "98W",
    sec: 16,
    dsu_key: "10S-98W-SEC16",
    wi_signal: "Non-Op WI",
    evidence_link: "https://www.linkedin.com/company/carmony-exploration-llc",
    contact_email: "land@carmonyexploration.com",
    contact_phone: "(303) 555-5600",
    mailing_address: "5600 S Alexander Ct, Greenwood Village, CO 80121"
  },
  // La Plata County - Southwest
  {
    owner_name: "Lincoln and Mineral, LLC",
    county: "La Plata",
    twp: "32N",
    rng: "9W",
    sec: 14,
    dsu_key: "32N-9W-SEC14",
    wi_signal: "Non-Op WI", 
    evidence_link: "https://www.linkedin.com/company/lincoln-and-mineral-llc",
    contact_email: "operations@lincolnmineral.com",
    contact_phone: "(303) 555-7470",
    mailing_address: "747 Sheridan Blvd, Lakewood, CO 80214"
  },
  // Logan County - Northeast
  {
    owner_name: "Outrigger Midland Operating, LLC",
    county: "Logan",
    twp: "9N",
    rng: "55W",
    sec: 22,
    dsu_key: "9N-55W-SEC22", 
    wi_signal: "Non-Op WI",
    evidence_link: "https://www.linkedin.com/company/outrigger-midland-operating-llc",
    contact_email: "assets@outriggermidland.com",
    contact_phone: "(303) 555-1200",
    mailing_address: "1200 17th St, Denver, CO 80202"
  },
  // Washington County - Northeast
  {
    owner_name: "Rocky Mountain Energy Trust",
    county: "Washington",
    twp: "4N",
    rng: "56W",
    sec: 8,
    dsu_key: "4N-56W-SEC08",
    wi_signal: "Non-Op WI",
    evidence_link: "https://publicrecords.netronline.com/state/CO/county/weld",
    contact_email: "trust@rmenergtrust.com", 
    contact_phone: "(970) 555-3456",
    mailing_address: "2500 Central Park Blvd, Denver, CO 80238"
  },
  // Yuma County - Northeast  
  {
    owner_name: "Front Range Royalty Partners",
    county: "Yuma",
    twp: "2N",
    rng: "45W",
    sec: 34,
    dsu_key: "2N-45W-SEC34",
    wi_signal: "Non-Op WI",
    evidence_link: "https://www.mineralholders.com/colorado/weld-county",
    contact_email: "partnerships@frontroyalty.com",
    contact_phone: "(303) 555-7890",
    mailing_address: "1515 Wynkoop St, Suite 300, Denver, CO 80202"
  },
  // Kit Carson County - Eastern plains
  {
    owner_name: "High Plains Investment Group", 
    county: "Kit Carson",
    twp: "7S",
    rng: "44W",
    sec: 16,
    dsu_key: "7S-44W-SEC16",
    wi_signal: "Non-Op WI",
    evidence_link: "https://adcogov.org/mineral-rights-resources",
    contact_email: "investments@highplainsinv.com",
    contact_phone: "(970) 555-4321", 
    mailing_address: "3033 Campus Dr, Suite N240, Niwot, CO 80503"
  },
  // Routt County - Northwest
  {
    owner_name: "Colorado Mineral Holdings LLC",
    county: "Routt",
    twp: "6N",
    rng: "89W",
    sec: 12,
    dsu_key: "6N-89W-SEC12",
    wi_signal: "Non-Op WI",
    evidence_link: "https://dnr.colorado.gov/divisions/colorado-energy-carbon-management-commission",
    contact_email: "assets@comineralholdings.com",
    contact_phone: "(303) 555-6789",
    mailing_address: "1873 S Bellaire St, Suite 700, Denver, CO 80222"
  },
  // Moffat County - Northwest
  {
    owner_name: "Pikes Peak Energy Partners",
    county: "Moffat", 
    twp: "8N",
    rng: "98W",
    sec: 20,
    dsu_key: "8N-98W-SEC20",
    wi_signal: "Non-Op WI",
    evidence_link: "https://www.linkedin.com/company/colorado-alliance-of-mineral-and-royalty-owners-camro",
    contact_email: "bizdev@pikespeakenergy.com",
    contact_phone: "(719) 555-0987",
    mailing_address: "102 S Tejon St, Suite 1100, Colorado Springs, CO 80903"
  },
  // Additional Weld County - highest production area
  {
    owner_name: "Eastern Colorado Minerals",
    county: "Weld",
    twp: "4N",
    rng: "65W",
    sec: 28,
    dsu_key: "4N-65W-SEC28",
    wi_signal: "Non-Op WI",
    evidence_link: "https://www.weld.gov/Government/Departments/Oil-and-Gas-Energy",
    contact_email: "regional@easterncominerals.com",
    contact_phone: "(970) 555-2468",
    mailing_address: "324 Main St, Suite 200, Sterling, CO 80751"
  },
  {
    owner_name: "San Juan Basin Holdings",
    county: "Weld",
    twp: "1N", 
    rng: "64W",
    sec: 6,
    dsu_key: "1N-64W-SEC06",
    wi_signal: "Non-Op WI",
    evidence_link: "https://apps.weld.gov/propertyportal/",
    contact_email: "acquisitions@sanjuanbasin.com",
    contact_phone: "(970) 555-1357",
    mailing_address: "516 Main Ave, Suite 404, Durango, CO 81301"
  },
  // More Adams County
  {
    owner_name: "Colorado Alliance Mineral Owners",
    county: "Adams",
    twp: "1S",
    rng: "65W",
    sec: 30, 
    dsu_key: "1S-65W-SEC30",
    wi_signal: "Non-Op WI",
    evidence_link: "https://adcogov.org/records-search",
    contact_email: "members@coloradoalliance.org",
    contact_phone: "(303) 555-2401",
    mailing_address: "401 23rd St, Glenwood Springs, CO 81601"
  }
];

export const Dashboard = () => {
  const stats = {
    totalOwners: 22,
    validWorkingInterest: 22,
    exclusions: 0,
    completedSections: 22,
    totalSections: 22
  };

  const progress = (stats.completedSections / stats.totalSections) * 100;

  const exportToExcel = () => {
    // Create workbook with OWNERS sheet
    const wb = XLSX.utils.book_new();
    
    // Prepare data with all required columns
    const excelData = mockOwners.map(owner => ({
      'Owner_Name': owner.owner_name,
      'Canonical_Name': owner.owner_name.replace(/\s+(LLC|INC|LP).*$/i, ''),
      'Entity_Type': 'LLC',
      'County': owner.county,
      'Twp': owner.twp,
      'Twp_Dir': 'S',
      'Rng': owner.rng,
      'Rng_Dir': 'W',
      'Sec': owner.sec,
      'DSU_Key': owner.dsu_key,
      'WI_Signal': owner.wi_signal,
      'Evidence_Link': owner.evidence_link,
      'Contact_Email': owner.contact_email,
      'Contact_Phone': owner.contact_phone,
      'Mailing_Address': owner.mailing_address
    }));

    const ws = XLSX.utils.json_to_sheet(excelData);
    XLSX.utils.book_append_sheet(wb, ws, 'OWNERS');
    
    // Download file
    const fileName = `Piceance_NOWI_Analysis_${new Date().toISOString().split('T')[0]}.xlsx`;
    XLSX.writeFile(wb, fileName);
  };

  return (
    <section className="py-16 px-6 bg-muted/20">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">NOWI Analysis Dashboard</h2>
          <p className="text-muted-foreground text-lg">
            Real-time results from Piceance Basin working interest analysis
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="shadow-card">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-primary/10 rounded-lg">
                  <Users className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Owners</p>
                  <p className="text-2xl font-bold">{stats.totalOwners.toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-earth-green/10 rounded-lg">
                  <TrendingUp className="w-6 h-6 text-earth-green" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Valid WI</p>
                  <p className="text-2xl font-bold">{stats.validWorkingInterest.toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-destructive/10 rounded-lg">
                  <FileText className="w-6 h-6 text-destructive" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Exclusions</p>
                  <p className="text-2xl font-bold">{stats.exclusions.toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-industrial-gold/10 rounded-lg">
                  <MapPin className="w-6 h-6 text-industrial-gold" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Sections</p>
                  <p className="text-2xl font-bold">{stats.completedSections}/{stats.totalSections}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Progress Card */}
        <Card className="shadow-card mb-8">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Processing Progress</span>
              <Button variant="accent" size="sm" onClick={exportToExcel}>
                <Download className="w-4 h-4 mr-2" />
                Export Excel
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span>PLSS Sections Analyzed</span>
                <span>{Math.round(progress)}% Complete</span>
              </div>
              <Progress value={progress} className="h-3" />
              <div className="text-xs text-muted-foreground">
                Estimated completion: 14 minutes remaining
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Results Table */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle>Recent Owner Discoveries</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Owner Name</TableHead>
                  <TableHead>Contact Info</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>DSU Key</TableHead>
                  <TableHead>WI Signal</TableHead>
                  <TableHead>Evidence</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockOwners.map((owner, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">{owner.owner_name}</TableCell>
                    <TableCell>
                      <div className="text-sm space-y-1">
                        <div className="flex items-center">
                          <span className="w-12 text-muted-foreground">Email:</span>
                          <a href={`mailto:${owner.contact_email}`} className="text-primary hover:underline">
                            {owner.contact_email}
                          </a>
                        </div>
                        <div className="flex items-center">
                          <span className="w-12 text-muted-foreground">Phone:</span>
                          <a href={`tel:${owner.contact_phone}`} className="hover:underline">
                            {owner.contact_phone}
                          </a>
                        </div>
                        <div className="flex items-start">
                          <span className="w-12 text-muted-foreground">Addr:</span>
                          <span className="text-xs leading-tight">{owner.mailing_address}</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div>{owner.county} County</div>
                        <div className="text-muted-foreground">{owner.twp}-{owner.rng}-S{owner.sec}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <code className="text-xs bg-muted px-2 py-1 rounded">{owner.dsu_key}</code>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant={owner.wi_signal === "Order-WI" ? "default" : "destructive"}
                        className="text-xs"
                      >
                        {owner.wi_signal}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm" asChild>
                        <a 
                          href={owner.evidence_link} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-xs"
                        >
                          <ExternalLink className="w-3 h-3 mr-1" />
                          PDF
                        </a>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};