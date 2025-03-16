import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";

interface LocationFilterProps {
  onFilterChange: (filters: { distance: number; city?: string }) => void;
}

export function LocationFilter({ onFilterChange }: LocationFilterProps) {
  const [distance, setDistance] = useState(50);
  const [cityInput, setCityInput] = useState("");

  const applyFilter = () => {
    onFilterChange({
      distance,
      city: cityInput.trim() || undefined
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Filtres de localisation</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Distance maximale ({distance} km)</Label>
            <Slider
              defaultValue={[distance]}
              max={150}
              step={10}
              onValueChange={(values) => {
                const newDistance = values[0];
                setDistance(newDistance);
                onFilterChange({
                  distance: newDistance,
                  city: cityInput.trim() || undefined
                });
              }}
            />
          </div>

          <div className="space-y-2">
            <Label>Rechercher par ville</Label>
            <div className="flex items-center gap-2">
              <Input 
                type="text" 
                placeholder="Entrez une ville"
                value={cityInput}
                onChange={(e) => setCityInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    applyFilter();
                  }
                }}
              />
              <Button 
                type="button"
                onClick={applyFilter}
                variant="secondary"
              >
                <Search className="h-4 w-4 mr-2" />
                Rechercher
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}