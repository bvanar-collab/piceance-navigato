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

# Install Chrome and dependencies using modern approach
RUN apt-get update && apt-get install -y --no-install-recommends \\
    fonts-dejavu-core \\
    wget \\
    curl \\
    gnupg \\
    unzip \\
    && wget -q -O - https://dl.google.com/linux/linux_signing_key.pub | gpg --dearmor -o /usr/share/keyrings/google-chrome-keyring.gpg \\
    && echo "deb [arch=amd64 signed-by=/usr/share/keyrings/google-chrome-keyring.gpg] http://dl.google.com/linux/chrome/deb/ stable main" > /etc/apt/sources.list.d/google-chrome.list \\
    && apt-get update \\
    && apt-get install -y google-chrome-stable \\
    && rm -rf /var/lib/apt/lists/*

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
    # Match exact column order: Owner_Name,Canonical_Name,Entity_Type,County,Twp,Twp_Dir,Rng,Rng_Dir,Sec,DSU_Key,WI_Signal,Evidence_Link
    row_data = [owner,owner,"LLC",county,str(t),td,str(r),rd,int(s),dsu,wi,url]
    ws.append(row_data)
    wb.save(xlsx)
    print(f"      ✅ Added row: {row_data}")
    
    # Verify what was written
    wb_verify = load_workbook(xlsx); ws_verify = wb_verify["OWNERS"]
    print(f"      📋 Excel now has {ws_verify.max_row} total rows (including header)")
    if ws_verify.max_row > 1:
        last_row = [cell.value for cell in ws_verify[ws_verify.max_row]]
        print(f"      📄 Last row data: {last_row}")
    wb_verify.close()

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
    opts=uc.ChromeOptions()
    opts.add_argument("--headless=new")
    opts.add_argument("--no-sandbox")
    opts.add_argument("--disable-dev-shm-usage") 
    opts.add_argument("--disable-gpu")
    opts.add_argument("--disable-extensions")
    opts.add_argument("--disable-plugins")
    opts.add_argument("--remote-debugging-port=9222")
    opts.binary_location = "/usr/bin/google-chrome-stable"
    
    d=uc.Chrome(options=opts)
    total_added = 0
    try:
        print(f"🔍 Processing {len(plss)} PLSS entries...")
        for i, tok in enumerate(plss):
            print(f"📍 Processing {i+1}/{len(plss)}: {tok}")
            try:
                t,td,r,rd,s=parse_plss(tok)
                urls = pdf_links_for_plss(d,t,td,r,rd,s)
                print(f"   Found {len(urls)} PDF links")
                
                if not urls:
                    print(f"   ⚠️  No PDFs found for {tok}")
                    continue
                    
                for j, url in enumerate(urls):
                    print(f"   📄 Processing PDF {j+1}/{len(urls)}: {url[:60]}...")
                    try:
                        resp=requests.get(url,timeout=30)
                        wi,names=analyze_pdf(resp.content)
                        print(f"      Found {len(names)} owners, WI signal: {wi}")
                        for nm in names: 
                            append_row(xlsx,nm,county,t,td,r,rd,s,wi,url)
                            total_added += 1
                            print(f"      ✅ Added: {nm}")
                        time.sleep(0.5)
                    except Exception as e:
                        print(f"      ❌ Error processing {url}: {e}")
            except Exception as e:
                print(f"   ❌ Error processing PLSS {tok}: {e}")
    except Exception as e:
        print(f"❌ Scraper error: {e}")
    finally: 
        d.quit()
        print(f"🏁 Scraping completed. Total owners found: {total_added}")
        
# Main function that gets called
if __name__=="__main__":
    import argparse
    p=argparse.ArgumentParser()
    p.add_argument("--xlsx",required=True)
    p.add_argument("--plss",required=True) 
    p.add_argument("--county",default="Garfield")
    a=p.parse_args()
    
    plss_list = [x.strip() for x in a.plss.split(",") if x.strip()]
    print(f"🚀 Starting ECMC scraper for {len(plss_list)} locations in {a.county} County")
    
    run_orders_to_excel(a.xlsx, a.county, plss_list)
    
    # Count actual rows in Excel to verify
    wb=load_workbook(a.xlsx); ws=wb["OWNERS"]
    data_rows = ws.max_row - 1  # Subtract header row
    print(f"📊 Excel file has {data_rows} data rows")
    wb.close()
PY

cat > run_all_selenium.py <<'PY'
import argparse,subprocess,shlex,time,sys,os
def sh(cmd): 
    print("→",cmd)
    result = subprocess.run(cmd, shell=True, capture_output=True, text=True)
    if result.stdout:
        print(result.stdout)
    if result.stderr:
        print("STDERR:", result.stderr)
    if result.returncode != 0:
        print(f"❌ Command failed with exit code {result.returncode}")
        return False
    return True

def main():
    p=argparse.ArgumentParser(); p.add_argument("--xlsx",required=True); p.add_argument("--plss",required=True); p.add_argument("--county",default="Garfield")
    a=p.parse_args()
    
    tokens=[x.strip() for x in a.plss.split(",") if x.strip()]
    print(f"🚀 Starting scraper for {len(tokens)} PLSS entries in batches of 10")
    
    for i in range(0,len(tokens),10):
        batch=",".join(tokens[i:i+10])
        print(f"📦 Processing batch {i//10+1}/{(len(tokens)+9)//10}: {len(batch.split(','))} entries")
        
        # Call the scraper script directly with proper arguments
        cmd = f"python ecmc_orders_selenium.py --xlsx '{a.xlsx}' --county '{a.county}' --plss '{batch}'"
        success = sh(cmd)
        
        if not success:
            print(f"❌ Batch {i//10+1} failed, continuing...")
        
        time.sleep(2)
    print("🎉 All batches completed!")
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
    a.download = `piceance_agent_bootstrap_${Date.now()}.sh`; // Add timestamp to force new download
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: "Script downloaded", 
      description: `piceance_agent_bootstrap_${Date.now()}.sh ready for execution`,
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