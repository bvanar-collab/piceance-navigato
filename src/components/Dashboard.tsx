import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { Download, ExternalLink, MapPin, Users, FileText, TrendingUp } from "lucide-react";
import * as XLSX from 'xlsx';

// Mock data for Colorado oil and gas producing counties
const mockOwners = [
  // Weld County - Largest producer
  {
    owner_name: "Occidental Petroleum Corporation",
    county: "Weld",
    twp: "1N",
    rng: "65W",
    sec: 16,
    dsu_key: "1N-65W-SEC16",
    wi_signal: "Order-WI",
    evidence_link: "https://ecmc.state.co.us/documents/orders/2024/order-201.pdf",
    contact_email: "landservices@oxy.com",
    contact_phone: "(713) 215-7000",
    mailing_address: "5 Greenway Plaza, Houston, TX 77046"
  },
  {
    owner_name: "PDC Energy Inc",
    county: "Weld",
    twp: "2N",
    rng: "66W",
    sec: 22,
    dsu_key: "2N-66W-SEC22",
    wi_signal: "Order-WI",
    evidence_link: "https://ecmc.state.co.us/documents/orders/2024/order-202.pdf",
    contact_email: "legal@pdce.com",
    contact_phone: "(303) 860-5800",
    mailing_address: "1775 Sherman St, Denver, CO 80203"
  },
  {
    owner_name: "Extraction Oil & Gas Inc",
    county: "Weld",
    twp: "3N",
    rng: "67W",
    sec: 8,
    dsu_key: "3N-67W-SEC08",
    wi_signal: "Order-WI",
    evidence_link: "https://ecmc.state.co.us/documents/orders/2024/order-203.pdf",
    contact_email: "operations@extractionog.com",
    contact_phone: "(720) 557-8300",
    mailing_address: "370 17th St, Denver, CO 80202"
  },
  // Adams County
  {
    owner_name: "Noble Energy Inc",
    county: "Adams",
    twp: "1S",
    rng: "66W", 
    sec: 14,
    dsu_key: "1S-66W-SEC14",
    wi_signal: "Order-WI",
    evidence_link: "https://ecmc.state.co.us/documents/orders/2024/order-204.pdf",
    contact_email: "landacquisitions@nblenergy.com",
    contact_phone: "(281) 872-3100",
    mailing_address: "1001 Noble Energy Way, Houston, TX 77070"
  },
  {
    owner_name: "Civitas Resources Inc",
    county: "Adams",
    twp: "2S",
    rng: "67W",
    sec: 26,
    dsu_key: "2S-67W-SEC26",
    wi_signal: "Order-WI",
    evidence_link: "https://ecmc.state.co.us/documents/orders/2024/order-205.pdf",
    contact_email: "contracts@civitasresources.com",
    contact_phone: "(303) 714-2000",
    mailing_address: "1625 Broadway, Denver, CO 80202"
  },
  // Larimer County
  {
    owner_name: "Marathon Oil Corporation",
    county: "Larimer",
    twp: "6N",
    rng: "68W",
    sec: 12,
    dsu_key: "6N-68W-SEC12",
    wi_signal: "Order-WI",
    evidence_link: "https://ecmc.state.co.us/documents/orders/2024/order-206.pdf",
    contact_email: "landservices@marathonoil.com",
    contact_phone: "(713) 629-6600",
    mailing_address: "5555 San Felipe St, Houston, TX 77056"
  },
  // Boulder County
  {
    owner_name: "8 Point Energy Partners",
    county: "Boulder",
    twp: "1N",
    rng: "69W",
    sec: 18,
    dsu_key: "1N-69W-SEC18",
    wi_signal: "Order-WI",
    evidence_link: "https://ecmc.state.co.us/documents/orders/2024/order-207.pdf",
    contact_email: "info@8pointenergy.com",
    contact_phone: "(303) 440-3600",
    mailing_address: "1900 16th St, Denver, CO 80202"
  },
  // Garfield County - Western slope gas
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
    owner_name: "EOG Resources Inc",
    county: "Garfield",
    twp: "6S",
    rng: "94W",
    sec: 25,
    dsu_key: "6S-94W-SEC25",
    wi_signal: "Order-WI",
    evidence_link: "https://ecmc.state.co.us/documents/orders/2024/order-208.pdf",
    contact_email: "landservices@eogresources.com",
    contact_phone: "(713) 651-7000",
    mailing_address: "1111 Bagby, Houston, TX 77002"
  },
  // Rio Blanco County - Western slope gas
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
    owner_name: "Ovintiv Inc",
    county: "Rio Blanco",
    twp: "7S",
    rng: "95W",
    sec: 18,
    dsu_key: "7S-95W-SEC18",
    wi_signal: "Order-WI",
    evidence_link: "https://ecmc.state.co.us/documents/orders/2024/order-209.pdf",
    contact_email: "contracts@ovintiv.com",
    contact_phone: "(303) 623-2300",
    mailing_address: "1700 Lincoln St, Denver, CO 80203"
  },
  // Mesa County
  {
    owner_name: "Bill Barrett Corporation",
    county: "Mesa",
    twp: "10S",
    rng: "98W",
    sec: 16,
    dsu_key: "10S-98W-SEC16",
    wi_signal: "Order-WI",
    evidence_link: "https://ecmc.state.co.us/documents/orders/2024/order-210.pdf",
    contact_email: "land@billbarrettcorp.com",
    contact_phone: "(303) 293-9100",
    mailing_address: "1099 18th St, Denver, CO 80202"
  },
  // La Plata County - Southwest
  {
    owner_name: "WPX Energy Inc",
    county: "La Plata",
    twp: "32N",
    rng: "9W",
    sec: 14,
    dsu_key: "32N-9W-SEC14",
    wi_signal: "Order-WI",
    evidence_link: "https://ecmc.state.co.us/documents/orders/2024/order-211.pdf",
    contact_email: "landservices@wpxenergy.com",
    contact_phone: "(918) 492-8000",
    mailing_address: "3500 One Williams Center, Tulsa, OK 74172"
  },
  // Logan County - Northeast
  {
    owner_name: "Bonanza Creek Energy Inc",
    county: "Logan",
    twp: "9N",
    rng: "55W",
    sec: 22,
    dsu_key: "9N-55W-SEC22",
    wi_signal: "Order-WI",
    evidence_link: "https://ecmc.state.co.us/documents/orders/2024/order-212.pdf",
    contact_email: "info@bonanzacreek.com",
    contact_phone: "(303) 861-8140",
    mailing_address: "410 17th St, Denver, CO 80202"
  },
  // Washington County - Northeast
  {
    owner_name: "Synergy Resources Corporation",
    county: "Washington",
    twp: "4N",
    rng: "56W",
    sec: 8,
    dsu_key: "4N-56W-SEC08",
    wi_signal: "Order-WI",
    evidence_link: "https://ecmc.state.co.us/documents/orders/2024/order-213.pdf",
    contact_email: "land@synrg.com",
    contact_phone: "(303) 626-9900",
    mailing_address: "1675 Broadway, Denver, CO 80202"
  },
  // Yuma County - Northeast
  {
    owner_name: "Kerr-McGee Rocky Mountain LLC",
    county: "Yuma",
    twp: "2N",
    rng: "45W",
    sec: 34,
    dsu_key: "2N-45W-SEC34",
    wi_signal: "Order-WI",
    evidence_link: "https://ecmc.state.co.us/documents/orders/2024/order-214.pdf",
    contact_email: "rockymtn@anadarko.com",
    contact_phone: "(832) 636-1000",
    mailing_address: "1201 Lake Robbins Dr, The Woodlands, TX 77380"
  },
  // Kit Carson County - Eastern plains
  {
    owner_name: "Whiting Petroleum Corporation",
    county: "Kit Carson",
    twp: "7S",
    rng: "44W",
    sec: 16,
    dsu_key: "7S-44W-SEC16",
    wi_signal: "Order-WI",
    evidence_link: "https://ecmc.state.co.us/documents/orders/2024/order-215.pdf",
    contact_email: "landservices@whiting.com",
    contact_phone: "(303) 837-1661",
    mailing_address: "1700 Broadway, Denver, CO 80290"
  },
  // Routt County - Northwest
  {
    owner_name: "Memorial Production Partners LP",
    county: "Routt",
    twp: "6N",
    rng: "89W",
    sec: 12,
    dsu_key: "6N-89W-SEC12",
    wi_signal: "Order-WI",
    evidence_link: "https://ecmc.state.co.us/documents/orders/2024/order-216.pdf",
    contact_email: "operations@memorialprod.com",
    contact_phone: "(713) 579-9128",
    mailing_address: "919 Milam St, Houston, TX 77002"
  },
  // Moffat County - Northwest
  {
    owner_name: "Antero Resources Corporation",
    county: "Moffat",
    twp: "8N",
    rng: "98W",
    sec: 20,
    dsu_key: "8N-98W-SEC20",
    wi_signal: "Order-WI",
    evidence_link: "https://ecmc.state.co.us/documents/orders/2024/order-217.pdf",
    contact_email: "land@anteroresources.com",
    contact_phone: "(303) 357-7310",
    mailing_address: "1615 Wynkoop St, Denver, CO 80202"
  },
  // Additional Weld County records - it's the biggest producer
  {
    owner_name: "Highpoint Operating Corporation",
    county: "Weld",
    twp: "4N",
    rng: "65W",
    sec: 28,
    dsu_key: "4N-65W-SEC28",
    wi_signal: "Order-WI",
    evidence_link: "https://ecmc.state.co.us/documents/orders/2024/order-218.pdf",
    contact_email: "landman@highpointop.com",
    contact_phone: "(303) 293-2900",
    mailing_address: "1675 Broadway, Denver, CO 80202"
  },
  {
    owner_name: "Great Western Operating Company LLC",
    county: "Weld",
    twp: "1N",
    rng: "64W",
    sec: 6,
    dsu_key: "1N-64W-SEC06",
    wi_signal: "Order-WI",
    evidence_link: "https://ecmc.state.co.us/documents/orders/2024/order-219.pdf",
    contact_email: "info@gwoc.com",
    contact_phone: "(303) 295-3995",
    mailing_address: "1700 Lincoln St, Denver, CO 80203"
  },
  // More Adams County
  {
    owner_name: "Terra Energy Partners LLC",
    county: "Adams",
    twp: "1S",
    rng: "65W",
    sec: 30,
    dsu_key: "1S-65W-SEC30",
    wi_signal: "Order-WI",
    evidence_link: "https://ecmc.state.co.us/documents/orders/2024/order-220.pdf",
    contact_email: "operations@terraenergy.com",
    contact_phone: "(303) 831-0507",
    mailing_address: "1225 17th St, Denver, CO 80202"
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