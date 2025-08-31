import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { Download, ExternalLink, MapPin, Users, FileText, TrendingUp } from "lucide-react";
import * as XLSX from 'xlsx';

// Non-operated working interest owners across Colorado oil and gas producing counties
const mockOwners = [
  // Weld County - Major producing area
  {
    owner_name: "Denver Basin Energy Partners LLC",
    county: "Weld",
    twp: "1N",
    rng: "65W",
    sec: 16,
    dsu_key: "1N-65W-SEC16",
    wi_signal: "Non-Op WI",
    evidence_link: "https://ecmc.state.co.us/documents/orders/2024/order-301.pdf",
    contact_email: "investments@denverbasinen.com",
    contact_phone: "(303) 892-4500",
    mailing_address: "1144 15th St, Suite 3000, Denver, CO 80202"
  },
  {
    owner_name: "Rocky Mountain Royalty Trust",
    county: "Weld", 
    twp: "2N",
    rng: "66W",
    sec: 22,
    dsu_key: "2N-66W-SEC22",
    wi_signal: "Non-Op WI",
    evidence_link: "https://ecmc.state.co.us/documents/orders/2024/order-302.pdf",
    contact_email: "trustee@rmrt.com",
    contact_phone: "(303) 534-2200",
    mailing_address: "1601 17th St, Denver, CO 80202"
  },
  {
    owner_name: "Frontier Energy Holdings LP",
    county: "Weld",
    twp: "3N",
    rng: "67W",
    sec: 8,
    dsu_key: "3N-67W-SEC08",
    wi_signal: "Non-Op WI",
    evidence_link: "https://ecmc.state.co.us/documents/orders/2024/order-303.pdf",
    contact_email: "partners@frontierenergy.net",
    contact_phone: "(720) 361-7890",
    mailing_address: "999 18th St, Suite 2700, Denver, CO 80202"
  },
  // Adams County
  {
    owner_name: "Colorado Energy Investors LLC",
    county: "Adams",
    twp: "1S",
    rng: "66W",
    sec: 14,
    dsu_key: "1S-66W-SEC14",
    wi_signal: "Non-Op WI", 
    evidence_link: "https://ecmc.state.co.us/documents/orders/2024/order-304.pdf",
    contact_email: "info@coenergy.com",
    contact_phone: "(303) 825-1000",
    mailing_address: "1700 Broadway, Suite 1100, Denver, CO 80290"
  },
  {
    owner_name: "Plains Capital Energy Fund II",
    county: "Adams",
    twp: "2S", 
    rng: "67W",
    sec: 26,
    dsu_key: "2S-67W-SEC26",
    wi_signal: "Non-Op WI",
    evidence_link: "https://ecmc.state.co.us/documents/orders/2024/order-305.pdf",
    contact_email: "fund@plainscap.com",
    contact_phone: "(214) 981-0700",
    mailing_address: "2100 McKinney Ave, Dallas, TX 75201"
  },
  // Larimer County
  {
    owner_name: "Northern Colorado Energy Partners",
    county: "Larimer",
    twp: "6N",
    rng: "68W", 
    sec: 12,
    dsu_key: "6N-68W-SEC12",
    wi_signal: "Non-Op WI",
    evidence_link: "https://ecmc.state.co.us/documents/orders/2024/order-306.pdf",
    contact_email: "investments@ncoloenergy.com",
    contact_phone: "(970) 221-3400",
    mailing_address: "125 S Howes St, Fort Collins, CO 80521"
  },
  // Boulder County
  {
    owner_name: "Boulder Valley Mineral Trust",
    county: "Boulder",
    twp: "1N",
    rng: "69W",
    sec: 18,
    dsu_key: "1N-69W-SEC18", 
    wi_signal: "Non-Op WI",
    evidence_link: "https://ecmc.state.co.us/documents/orders/2024/order-307.pdf",
    contact_email: "trustees@bvmt.org",
    contact_phone: "(303) 442-8800",
    mailing_address: "2595 Canyon Blvd, Boulder, CO 80302"
  },
  // Garfield County - Western slope gas
  {
    owner_name: "Western Slope Energy LLC",
    county: "Garfield",
    twp: "6S",
    rng: "95W",
    sec: 12,
    dsu_key: "6S-95W-SEC12",
    wi_signal: "Non-Op WI",
    evidence_link: "https://ecmc.state.co.us/documents/orders/2024/order-308.pdf",
    contact_email: "admin@wsenergy.net",
    contact_phone: "(970) 945-2600",
    mailing_address: "802 Colorado Ave, Glenwood Springs, CO 81601"
  },
  {
    owner_name: "Piceance Basin Investors Group",
    county: "Garfield",
    twp: "6S",
    rng: "94W",
    sec: 25,
    dsu_key: "6S-94W-SEC25",
    wi_signal: "Non-Op WI",
    evidence_link: "https://ecmc.state.co.us/documents/orders/2024/order-309.pdf",
    contact_email: "info@piceanceinvest.com",
    contact_phone: "(970) 625-4200",
    mailing_address: "415 Main St, Rifle, CO 81650"
  },
  // Rio Blanco County - Western slope gas
  {
    owner_name: "Rangely Energy Holdings Inc",
    county: "Rio Blanco",
    twp: "7S",
    rng: "96W",
    sec: 6,
    dsu_key: "7S-96W-SEC06",
    wi_signal: "Non-Op WI",
    evidence_link: "https://ecmc.state.co.us/documents/orders/2024/order-310.pdf",
    contact_email: "holdings@rangelyenergy.com",
    contact_phone: "(970) 675-8400",
    mailing_address: "209 E Main St, Rangely, CO 81648"
  },
  {
    owner_name: "White River Energy Partners LP",
    county: "Rio Blanco",
    twp: "7S",
    rng: "95W", 
    sec: 18,
    dsu_key: "7S-95W-SEC18",
    wi_signal: "Non-Op WI",
    evidence_link: "https://ecmc.state.co.us/documents/orders/2024/order-311.pdf",
    contact_email: "partners@whiteriverenergy.com",
    contact_phone: "(970) 878-5200",
    mailing_address: "538 Main St, Meeker, CO 81641"
  },
  // Mesa County
  {
    owner_name: "Grand Junction Energy Fund LLC",
    county: "Mesa",
    twp: "10S", 
    rng: "98W",
    sec: 16,
    dsu_key: "10S-98W-SEC16",
    wi_signal: "Non-Op WI",
    evidence_link: "https://ecmc.state.co.us/documents/orders/2024/order-312.pdf",
    contact_email: "fund@gjenergy.com",
    contact_phone: "(970) 241-8300",
    mailing_address: "225 N 5th St, Grand Junction, CO 81501"
  },
  // La Plata County - Southwest
  {
    owner_name: "Four Corners Mineral Rights LLC",
    county: "La Plata",
    twp: "32N",
    rng: "9W",
    sec: 14,
    dsu_key: "32N-9W-SEC14",
    wi_signal: "Non-Op WI", 
    evidence_link: "https://ecmc.state.co.us/documents/orders/2024/order-313.pdf",
    contact_email: "rights@fourcornersmin.com",
    contact_phone: "(970) 247-3600",
    mailing_address: "835 Main Ave, Durango, CO 81301"
  },
  // Logan County - Northeast
  {
    owner_name: "Sterling Energy Investors LLC",
    county: "Logan",
    twp: "9N",
    rng: "55W",
    sec: 22,
    dsu_key: "9N-55W-SEC22", 
    wi_signal: "Non-Op WI",
    evidence_link: "https://ecmc.state.co.us/documents/orders/2024/order-314.pdf",
    contact_email: "investors@sterlingenergy.net",
    contact_phone: "(970) 522-1800",
    mailing_address: "128 N 3rd St, Sterling, CO 80751"
  },
  // Washington County - Northeast
  {
    owner_name: "High Plains Energy Holdings",
    county: "Washington",
    twp: "4N",
    rng: "56W",
    sec: 8,
    dsu_key: "4N-56W-SEC08",
    wi_signal: "Non-Op WI",
    evidence_link: "https://ecmc.state.co.us/documents/orders/2024/order-315.pdf",
    contact_email: "holdings@hpenergy.com", 
    contact_phone: "(970) 345-2200",
    mailing_address: "142 Birch Ave, Akron, CO 80720"
  },
  // Yuma County - Northeast  
  {
    owner_name: "Eastern Colorado Energy Trust",
    county: "Yuma",
    twp: "2N",
    rng: "45W",
    sec: 34,
    dsu_key: "2N-45W-SEC34",
    wi_signal: "Non-Op WI",
    evidence_link: "https://ecmc.state.co.us/documents/orders/2024/order-316.pdf",
    contact_email: "trust@ecenergy.org",
    contact_phone: "(970) 332-4500",
    mailing_address: "411 S Main St, Yuma, CO 80759"
  },
  // Kit Carson County - Eastern plains
  {
    owner_name: "Prairie Wind Energy Partners", 
    county: "Kit Carson",
    twp: "7S",
    rng: "44W",
    sec: 16,
    dsu_key: "7S-44W-SEC16",
    wi_signal: "Non-Op WI",
    evidence_link: "https://ecmc.state.co.us/documents/orders/2024/order-317.pdf",
    contact_email: "partners@prairiewindenergy.com",
    contact_phone: "(719) 346-8200", 
    mailing_address: "128 15th St, Burlington, CO 80807"
  },
  // Routt County - Northwest
  {
    owner_name: "Steamboat Springs Energy LLC",
    county: "Routt",
    twp: "6N",
    rng: "89W",
    sec: 12,
    dsu_key: "6N-89W-SEC12",
    wi_signal: "Non-Op WI",
    evidence_link: "https://ecmc.state.co.us/documents/orders/2024/order-318.pdf",
    contact_email: "info@ssenergy.com",
    contact_phone: "(970) 879-1500",
    mailing_address: "1136 Yampa St, Steamboat Springs, CO 80487"
  },
  // Moffat County - Northwest
  {
    owner_name: "Northwest Colorado Minerals Inc",
    county: "Moffat", 
    twp: "8N",
    rng: "98W",
    sec: 20,
    dsu_key: "8N-98W-SEC20",
    wi_signal: "Non-Op WI",
    evidence_link: "https://ecmc.state.co.us/documents/orders/2024/order-319.pdf",
    contact_email: "minerals@nwcominerals.com",
    contact_phone: "(970) 824-6400",
    mailing_address: "444 Yampa Ave, Craig, CO 81625"
  },
  // Additional Weld County - highest production area
  {
    owner_name: "Greeley Basin Energy Group LLC",
    county: "Weld",
    twp: "4N",
    rng: "65W",
    sec: 28,
    dsu_key: "4N-65W-SEC28",
    wi_signal: "Non-Op WI",
    evidence_link: "https://ecmc.state.co.us/documents/orders/2024/order-320.pdf",
    contact_email: "group@greeleybasin.com",
    contact_phone: "(970) 330-6700",
    mailing_address: "822 7th St, Greeley, CO 80631"
  },
  {
    owner_name: "DJ Basin Mineral Partners",
    county: "Weld",
    twp: "1N", 
    rng: "64W",
    sec: 6,
    dsu_key: "1N-64W-SEC06",
    wi_signal: "Non-Op WI",
    evidence_link: "https://ecmc.state.co.us/documents/orders/2024/order-321.pdf",
    contact_email: "partners@djbasinmin.com",
    contact_phone: "(303) 659-8900",
    mailing_address: "1426 Pearl St, Boulder, CO 80302"
  },
  // More Adams County
  {
    owner_name: "Commerce City Energy Holdings",
    county: "Adams",
    twp: "1S",
    rng: "65W",
    sec: 30, 
    dsu_key: "1S-65W-SEC30",
    wi_signal: "Non-Op WI",
    evidence_link: "https://ecmc.state.co.us/documents/orders/2024/order-322.pdf",
    contact_email: "holdings@ccenergy.net",
    contact_phone: "(303) 287-3400",
    mailing_address: "7887 E 60th Ave, Commerce City, CO 80022"
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