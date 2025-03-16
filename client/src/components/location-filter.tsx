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

  // Mise à jour de la distance uniquement
  const handleDistanceChange = (values: number[]) => {
    const newDistance = values[0];
    setDistance(newDistance);
    onFilterChange({
      distance: newDistance,
      city: cityInput.trim() || undefined
    });
  };

  // Recherche par ville
  const handleCitySearch = () => {
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
        {/* Section Distance */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label>Distance maximale</Label>
            <span className="text-sm text-muted-foreground font-medium">
              {distance} km
            </span>
          </div>
          <Slider
            defaultValue={[distance]}
            max={150}
            step={10}
            onValueChange={handleDistanceChange}
          />
        </div>

        {/* Section Ville */}
        <div className="space-y-4">
          <Label>Rechercher par ville</Label>
          <div className="flex gap-2">
            <div className="flex-1">
              <Input 
                type="text" 
                placeholder="Entrez une ville"
                value={cityInput}
                onChange={(e) => setCityInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleCitySearch();
                  }
                }}
              />
            </div>
            <Button 
              onClick={handleCitySearch}
              className="px-6"
            >
              <Search className="h-4 w-4 mr-2" />
              Rechercher
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}