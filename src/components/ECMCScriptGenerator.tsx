import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Copy, Download, Terminal, FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ECMCScriptGeneratorProps {
  plssEntries: string[];
  county: string;
}

export const ECMCScriptGenerator = ({ plssEntries, county }: ECMCScriptGeneratorProps) => {
  const [scriptContent] = useState(`#!/usr/bin/env bash
set -euo pipefail

PLSS_BATCH=""
COUNTY="Garfield"
PRESET=""

while [[ $# -gt 0 ]]; do
  case "$1" in
    --plss)   PLSS_BATCH="$2"; shift 2 ;;
    --county) COUNTY="$2"; shift 2 ;;
    --preset) PRESET="$2"; shift 2 ;;
    *) echo "Unknown arg: $1"; exit 1 ;;
  esac
done

ROOT="\${PWD}/piceance-nowi"
mkdir -p "\${ROOT}"
cd "\${ROOT}"

cat > requirements.txt <<'REQ'
requests
pdfminer.six
rapidfuzz
openpyxl
selenium
undetected-chromedriver
REQ

cat > Dockerfile <<'DOCKER'
FROM python:3.11-slim
WORKDIR /app
RUN apt-get update && apt-get install -y --no-install-recommends fonts-dejavu-core && rm -rf /var/lib/apt/lists/*
COPY requirements.txt /app/requirements.txt
RUN pip install --no-cache-dir -r /app/requirements.txt
COPY . /app
CMD ["python", "run_all_selenium.py", "--help"]
DOCKER

cat > generate_piceance_nowis_template.py <<'PY'
from openpyxl import Workbook
wb = Workbook(); ws = wb.active; ws.title="OWNERS"
ws.append(["Owner_Name","Canonical_Name","Entity_Type","County","Twp","Twp_Dir","Rng","Rng_Dir","Sec","DSU_Key","WI_Signal","Evidence_Link"])
wb.save("Piceance_NOWI_Template.xlsx")
print("Created Piceance_NOWI_Template.xlsx")
PY

cat > ecmc_orders_selenium.py <<'PY'
import re,time,argparse,requests
from io import BytesIO
from pdfminer.high_level import extract_text
from openpyxl import load_workbook
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
import undetected_chromedriver as uc

ORDERS_URL="https://ecmc.state.co.us/Orders/Orders.aspx"
WI_POS=[r"working\\\\s+interest",r"elected\\\\s+to\\\\s+participate",r"cost[-\\\\s]?bearing",r"non[-\\\\s]?consent(ing)?",r"party\\\\s+to\\\\s+joa",r"joint\\\\s+operating\\\\s+agreement"]
NON_WI=[r"overriding\\\\s+royalty",r"royalty\\\\s+deed",r"production\\\\s+payment",r"\\\\bnpri\\\\b"]

def append_row(xlsx, owner, county, t,td,r,rd,s, wi, url):
    wb=load_workbook(xlsx); ws=wb["OWNERS"]
    dsu=f"{t}{td}-{r}{rd}-SEC{s:02d}".upper()
    ws.append([owner,"","LLC",county,t,td,r,rd,s,dsu,wi,url]); wb.save(xlsx)

def analyze_pdf(content:bytes):
    text=extract_text(BytesIO(content)) or ""; tl=text.lower()
    wi="Order-WI" if any(re.search(p,tl) for p in WI_POS) else ("Exclude—Royalty/ORRI" if any(re.search(p,tl) for p in NON_WI) else "Unknown")
    names=[]; seen=set()
    for line in text.splitlines():
        if re.search(r"\\\\b(LLC|INC|LP|TRUST|CORP|COMPANY|HOLDINGS|PARTNERS)\\\\b",line,re.I):
            nm=line.strip()
            if nm not in seen: seen.add(nm); names.append(nm)
    return wi,names

def parse_plss(token):
    m=re.match(r"(\\\\d+)([NS])-(\\\\d+)([EW])-(\\\\d+)",token)
    if not m: raise ValueError(f"Bad PLSS: {token}")
    return int(m.group(1)),m.group(2),int(m.group(3)),m.group(4),int(m.group(5))

def pdf_links_for_plss(driver,t,td,r,rd,s):
    driver.get(ORDERS_URL); wait=WebDriverWait(driver,20)
    def fill(id,v):
        try: el=wait.until(EC.presence_of_element_located((By.ID,id))); el.clear(); el.send_keys(str(v)); return True
        except: return False
    fill("txtTownship",t); wait.until(EC.presence_of_element_located((By.ID,"ddlTwpDir"))).send_keys(td)
    fill("txtRange",r); wait.until(EC.presence_of_element_located((By.ID,"ddlRngDir"))).send_keys(rd)
    fill("txtSection",s)
    wait.until(EC.element_to_be_clickable((By.ID,"btnSearch"))).click(); time.sleep(1.5)
    links=driver.find_elements(By.XPATH,"//a[contains(@href,'.pdf')]")
    return list({a.get_attribute("href") for a in links if a.get_attribute("href")})
    
def run_orders_to_excel(xlsx,county,plss):
    opts=uc.ChromeOptions(); opts.add_argument("--headless=new"); opts.add_argument("--no-sandbox")
    d=uc.Chrome(options=opts)
    try:
        for tok in plss:
            t,td,r,rd,s=parse_plss(tok)
            for url in pdf_links_for_plss(d,t,td,r,rd,s):
                resp=requests.get(url,timeout=30); wi,names=analyze_pdf(resp.content)
                for nm in names: append_row(xlsx,nm,county,t,td,r,rd,s,wi,url); time.sleep(0.5)
    finally: d.quit()
PY

cat > run_all_selenium.py <<'PY'
import argparse,subprocess,shlex,time
def sh(cmd): print("→",cmd); subprocess.run(shlex.split(cmd),check=True)
def main():
    p=argparse.ArgumentParser(); p.add_argument("--xlsx",required=True); p.add_argument("--plss",required=True); p.add_argument("--county",default="Garfield")
    a=p.parse_args()
    sh("python generate_piceance_nowis_template.py")
    tokens=[x.strip() for x in a.plss.split(",") if x.strip()]
    for i in range(0,len(tokens),10):
        batch=",".join(tokens[i:i+10])
        sh(f"python ecmc_orders_selenium.py --xlsx {a.xlsx} --county {a.county} --plss '{batch}'")
        time.sleep(2)
if __name__=="__main__": main()
PY

cat > make_presets.py <<'PY'
def token(t,td,r,rd,s): return f"{t}{td}-{r}{rd}-{s}"
def grid(t1,t2,r1,r2,secs=(1,6,12,18,24,30,36),td="S",rd="W"):
    out=[]
    for t in range(t1,t2+1):
        for r in range(r1,r2+1):
            for s in secs: out.append(token(t,td,r,rd,s))
    return out
def piceance_preset():
    seen=set(); out=[]
    for tok in grid(5,9,94,98): 
        if tok not in seen: seen.add(tok); out.append(tok)
    return out
if __name__=="__main__": print(",".join(piceance_preset()))
PY

echo "⏳ Building Docker image ..."
docker build -t piceance-agent .
echo "⏳ Creating Excel workbook ..."
docker run --rm -v "$(pwd)":/app piceance-agent python generate_piceance_nowis_template.py

# Handle preset or custom PLSS entries
if [[ "$PRESET" == "piceance" ]]; then
  echo "🎯 Using Piceance Basin preset..."
  PLSS_BATCH="$(docker run --rm -v "$(pwd)":/app piceance-agent python make_presets.py)"
  COUNTY="Garfield"
  echo "Generated PLSS entries: $PLSS_BATCH"
elif [[ -n "$PLSS_BATCH" ]]; then
  echo "📍 Using custom PLSS entries: $PLSS_BATCH"
else
  echo "❌ ERROR: Please provide either --preset piceance or --plss 'entries'"
  exit 1
fi

echo "🔍 Running scraper with PLSS entries..."
docker run --rm -v "$(pwd)":/app piceance-agent \\
  python run_all_selenium.py --xlsx Piceance_NOWI_Template.xlsx --plss "$PLSS_BATCH" --county "$COUNTY"
echo "✅ Done. Deliverable: \${ROOT}/Piceance_NOWI_Template.xlsx"`);

  const { toast } = useToast();

  const generateCommand = () => {
    if (plssEntries.length === 0) return "";
    
    const plssString = plssEntries.join(",");
    return `./piceance_agent_bootstrap.sh --plss "${plssString}" --county ${county}`;
  };

  const generatePresetCommand = () => {
    return `./piceance_agent_bootstrap.sh --preset piceance`;
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied to clipboard",
      description: "Command copied successfully",
    });
  };

  const downloadScript = () => {
    const blob = new Blob([scriptContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'piceance_agent_bootstrap.sh';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: "Script downloaded",
      description: "piceance_agent_bootstrap.sh ready for execution",
    });
  };

  const customCommand = generateCommand();
  const presetCommand = generatePresetCommand();

  return (
    <section className="py-16 px-6 bg-muted/10">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">ECMC Scraper Script Generator</h2>
          <p className="text-muted-foreground text-lg max-w-3xl mx-auto">
            Download and execute the Docker-based Python script to scrape ECMC Orders portal for NOWI data
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Download Script Card */}
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Bootstrap Script
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Complete Docker-first solution that creates project structure, writes Python scripts, and runs ECMC queries safely.
              </p>
              
              <div className="space-y-3">
                <Button 
                  onClick={downloadScript}
                  variant="accent" 
                  size="lg" 
                  className="w-full"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download piceance_agent_bootstrap.sh
                </Button>

                <div className="p-4 bg-muted/30 rounded-md border">
                  <h4 className="font-medium mb-2 text-sm">Setup Instructions:</h4>
                  <div className="space-y-1 text-xs text-muted-foreground font-mono">
                    <div>1. chmod +x piceance_agent_bootstrap.sh</div>
                    <div>2. Run command below ↓</div>
                    <div>3. Import resulting Excel file ↑</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Execute Commands Card */}
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Terminal className="w-5 h-5" />
                Execution Commands
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Preset Command */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-sm">Piceance Basin Preset</h4>
                  <Badge variant="secondary">5S–9S, 94W–98W</Badge>
                </div>
                <div className="relative">
                  <Textarea
                    value={presetCommand}
                    readOnly
                    className="font-mono text-xs resize-none bg-muted/50"
                    rows={2}
                  />
                  <Button
                    onClick={() => copyToClipboard(presetCommand)}
                    variant="ghost"
                    size="sm"
                    className="absolute top-2 right-2 h-6 w-6 p-0"
                  >
                    <Copy className="w-3 h-3" />
                  </Button>
                </div>
              </div>

              {/* Custom Command */}
              {plssEntries.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-sm">Custom PLSS Query</h4>
                    <Badge variant="outline">{plssEntries.length} locations</Badge>
                  </div>
                  <div className="relative">
                    <Textarea
                      value={customCommand}
                      readOnly
                      className="font-mono text-xs resize-none bg-muted/50"
                      rows={3}
                    />
                    <Button
                      onClick={() => copyToClipboard(customCommand)}
                      variant="ghost"
                      size="sm"
                      className="absolute top-2 right-2 h-6 w-6 p-0"
                    >
                      <Copy className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              )}

              <div className="p-4 bg-primary/5 border border-primary/20 rounded-md">
                <h4 className="font-medium text-sm mb-2">Requirements:</h4>
                <ul className="text-xs text-muted-foreground space-y-1">
                  <li>• Docker Desktop (Mac/Windows) or Docker Engine (Linux)</li>
                  <li>• Internet connection for ECMC portal access</li>
                  <li>• Estimated time: 2-15 minutes depending on PLSS count</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="mt-8">
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle>Expected Output</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium mb-3">Generated Files:</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-earth-green rounded-full"></div>
                      <span className="font-mono">piceance-nowi/Piceance_NOWI_Template.xlsx</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-muted-foreground rounded-full"></div>
                      <span className="font-mono">Docker container logs</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-muted-foreground rounded-full"></div>
                      <span className="font-mono">Python scraping scripts</span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium mb-3">Excel Columns:</h4>
                  <div className="text-xs font-mono space-y-1 text-muted-foreground">
                    <div>Owner_Name, Canonical_Name, Entity_Type</div>
                    <div>County, Twp, Twp_Dir, Rng, Rng_Dir, Sec</div>
                    <div>DSU_Key, WI_Signal, Evidence_Link</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};