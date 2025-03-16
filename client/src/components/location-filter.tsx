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

  const handleClick = () => {
    console.log("Application des nouveaux filtres:", { distance, city: cityInput });
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
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>Ville</Label>
          <div className="flex items-center gap-4">
            <Input 
              type="text" 
              placeholder="Entrez une ville"
              value={cityInput}
              onChange={(e) => setCityInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleClick();
                }
              }}
            />
            <Button 
              type="button" 
              variant="secondary"
              onClick={handleClick}
            >
              <Search className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label>Distance maximale</Label>
            <span className="text-sm text-muted-foreground">{distance} km</span>
          </div>
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
      </CardContent>
    </Card>
  );
}