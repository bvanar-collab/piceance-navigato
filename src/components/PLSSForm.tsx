import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Plus, X } from "lucide-react";

interface PLSSFormProps {
  onPLSSChange?: (entries: string[], county: string) => void;
}

export const PLSSForm = ({ onPLSSChange }: PLSSFormProps = {}) => {
  const [plssEntries, setPLSSEntries] = useState<string[]>([]);
  const [township, setTownship] = useState("");
  const [range, setRange] = useState("");
  const [section, setSection] = useState("");
  const [county, setCounty] = useState("");

  const addPLSSEntry = () => {
    if (township && range && section && county) {
      const entry = `${township}S-${range}W-${section}`;
      if (!plssEntries.includes(entry)) {
        const newEntries = [...plssEntries, entry];
        setPLSSEntries(newEntries);
        onPLSSChange?.(newEntries, county);
      }
      setTownship("");
      setRange("");
      setSection("");
    }
  };

  const removePLSSEntry = (entry: string) => {
    const newEntries = plssEntries.filter(e => e !== entry);
    setPLSSEntries(newEntries);
    onPLSSChange?.(newEntries, county);
  };

  const loadPreset = () => {
    // Piceance Basin preset: 5S–9S, 94W–98W
    const presetEntries = [];
    for (let t = 5; t <= 9; t++) {
      for (let r = 94; r <= 98; r++) {
        for (const s of [1, 6, 12, 18, 24, 30, 36]) {
          presetEntries.push(`${t}S-${r}W-${s}`);
        }
      }
    }
    setPLSSEntries(presetEntries);
    setCounty("Garfield");
    onPLSSChange?.(presetEntries, "Garfield");
  };

  return (
    <section className="py-16 px-6">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Configure PLSS Query</h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Enter Public Land Survey System coordinates to query ECMC Orders for working interest owners
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Manual Entry
                <Button 
                  variant="accent" 
                  size="sm" 
                  onClick={loadPreset}
                  className="text-sm"
                >
                  Load Piceance Preset
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="county">County</Label>
                  <Select value={county} onValueChange={setCounty}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select county" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Garfield">Garfield</SelectItem>
                      <SelectItem value="Rio Blanco">Rio Blanco</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="township">Township</Label>
                  <Input
                    id="township"
                    placeholder="e.g., 6"
                    value={township}
                    onChange={(e) => setTownship(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground mt-1">5S-9S</p>
                </div>
                <div>
                  <Label htmlFor="range">Range</Label>
                  <Input
                    id="range"
                    placeholder="e.g., 95"
                    value={range}
                    onChange={(e) => setRange(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground mt-1">94W-98W</p>
                </div>
                <div>
                  <Label htmlFor="section">Section</Label>
                  <Input
                    id="section"
                    placeholder="e.g., 12"
                    value={section}
                    onChange={(e) => setSection(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground mt-1">1-36</p>
                </div>
              </div>

              <Button 
                onClick={addPLSSEntry} 
                className="w-full"
                disabled={!township || !range || !section || !county}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add PLSS Entry
              </Button>
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardHeader>
              <CardTitle>
                PLSS Queue ({plssEntries.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex flex-wrap gap-2 min-h-[200px] p-4 border border-border rounded-md bg-muted/30">
                  {plssEntries.length === 0 ? (
                    <p className="text-muted-foreground text-sm">No PLSS entries added yet</p>
                  ) : (
                    plssEntries.map((entry, index) => (
                      <Badge 
                        key={index} 
                        variant="secondary" 
                        className="flex items-center gap-2 px-3 py-1"
                      >
                        {entry}
                        <X 
                          className="w-3 h-3 cursor-pointer hover:text-destructive" 
                          onClick={() => removePLSSEntry(entry)}
                        />
                      </Badge>
                    ))
                  )}
                </div>

                {plssEntries.length > 0 && (
                  <div className="space-y-3">
                    <div className="text-sm text-muted-foreground">
                      <p><strong>County:</strong> {county}</p>
                      <p><strong>Estimated Processing Time:</strong> {Math.ceil(plssEntries.length / 10) * 2} minutes</p>
                    </div>
                    
                    <Button variant="professional" size="lg" className="w-full">
                      Execute ECMC Query ({plssEntries.length} locations)
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};