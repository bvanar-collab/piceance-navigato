import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { Download, ExternalLink, MapPin, Users, FileText, TrendingUp } from "lucide-react";
import * as XLSX from 'xlsx';

// Mock data for demo
const mockOwners = [
  {
    owner_name: "Dividend Energy Partners LLC",
    county: "Garfield",
    twp: "6S",
    rng: "95W",
    sec: 12,
    dsu_key: "6S-95W-SEC12",
    wi_signal: "Order-WI",
    evidence_link: "https://ecmc.state.co.us/documents/orders/2024/order-123.pdf",
    contact_email: "acquisitions@dividend-energy.com",
    contact_phone: "(303) 555-0123",
    mailing_address: "1801 California St, Denver, CO 80202"
  },
  {
    owner_name: "Pioneer Natural Resources",
    county: "Garfield", 
    twp: "6S",
    rng: "95W",
    sec: 13,
    dsu_key: "6S-95W-SEC13",
    wi_signal: "Order-WI",
    evidence_link: "https://ecmc.state.co.us/documents/orders/2024/order-124.pdf",
    contact_email: "landman@pxd.com",
    contact_phone: "(972) 444-9001",
    mailing_address: "777 Hidden Ridge, Irving, TX 75038"
  },
  {
    owner_name: "Chesapeake Operating LLC",
    county: "Rio Blanco",
    twp: "7S", 
    rng: "96W",
    sec: 6,
    dsu_key: "7S-96W-SEC06",
    wi_signal: "Order-WI",
    evidence_link: "https://ecmc.state.co.us/documents/orders/2024/order-125.pdf",
    contact_email: "operations@chk.com",
    contact_phone: "(405) 848-8000",
    mailing_address: "6100 N Western Ave, Oklahoma City, OK 73118"
  },
  {
    owner_name: "EOG Resources Inc",
    county: "Garfield",
    twp: "6S",
    rng: "94W",
    sec: 25,
    dsu_key: "6S-94W-SEC25",
    wi_signal: "Order-WI",
    evidence_link: "https://ecmc.state.co.us/documents/orders/2024/order-126.pdf",
    contact_email: "landservices@eogresources.com",
    contact_phone: "(713) 651-7000",
    mailing_address: "1111 Bagby, Houston, TX 77002"
  },
  {
    owner_name: "Ovintiv Inc",
    county: "Rio Blanco",
    twp: "7S",
    rng: "95W",
    sec: 18,
    dsu_key: "7S-95W-SEC18",
    wi_signal: "Order-WI", 
    evidence_link: "https://ecmc.state.co.us/documents/orders/2024/order-127.pdf",
    contact_email: "contracts@ovintiv.com",
    contact_phone: "(303) 623-2300",
    mailing_address: "1700 Lincoln St, Denver, CO 80203"
  },
  {
    owner_name: "Devon Energy Corporation",
    county: "Garfield",
    twp: "5S",
    rng: "95W", 
    sec: 35,
    dsu_key: "5S-95W-SEC35",
    wi_signal: "Order-WI",
    evidence_link: "https://ecmc.state.co.us/documents/orders/2024/order-128.pdf",
    contact_email: "land@dvn.com",
    contact_phone: "(405) 235-3611",
    mailing_address: "333 W Sheridan Ave, Oklahoma City, OK 73102"
  },
  {
    owner_name: "ConocoPhillips Company",
    county: "Rio Blanco",
    twp: "8S",
    rng: "96W",
    sec: 14,
    dsu_key: "8S-96W-SEC14", 
    wi_signal: "Order-WI",
    evidence_link: "https://ecmc.state.co.us/documents/orders/2024/order-129.pdf",
    contact_email: "landacquisitions@conocophillips.com",
    contact_phone: "(281) 293-1000",
    mailing_address: "925 N Eldridge Pkwy, Houston, TX 77079"
  },
  {
    owner_name: "PDC Energy Inc",
    county: "Garfield",
    twp: "6S", 
    rng: "96W",
    sec: 8,
    dsu_key: "6S-96W-SEC08",
    wi_signal: "Order-WI",
    evidence_link: "https://ecmc.state.co.us/documents/orders/2024/order-130.pdf",
    contact_email: "legal@pdce.com",
    contact_phone: "(303) 860-5800",
    mailing_address: "1775 Sherman St, Denver, CO 80203"
  },
  {
    owner_name: "Extraction Oil & Gas Inc",
    county: "Rio Blanco",
    twp: "7S",
    rng: "97W",
    sec: 22,
    dsu_key: "7S-97W-SEC22",
    wi_signal: "Order-WI",
    evidence_link: "https://ecmc.state.co.us/documents/orders/2024/order-131.pdf", 
    contact_email: "operations@extractionog.com",
    contact_phone: "(720) 557-8300",
    mailing_address: "370 17th St, Denver, CO 80202"
  },
  {
    owner_name: "Alta Mesa Holdings LP",
    county: "Garfield",
    twp: "5S",
    rng: "94W",
    sec: 16,
    dsu_key: "5S-94W-SEC16",
    wi_signal: "Order-WI",
    evidence_link: "https://ecmc.state.co.us/documents/orders/2024/order-132.pdf",
    contact_email: "info@altamesa.com", 
    contact_phone: "(405) 209-0860",
    mailing_address: "15 E 5th St, Tulsa, OK 74103"
  },
];

export const Dashboard = () => {
  const stats = {
    totalOwners: 247,
    validWorkingInterest: 189,
    exclusions: 58,
    completedSections: 142,
    totalSections: 175
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