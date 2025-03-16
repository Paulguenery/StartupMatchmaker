import { useState, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useDebouncedCallback } from "use-debounce";

interface LocationFilterProps {
  onFilterChange: (filters: { distance: number; city?: string }) => void;
}

export function LocationFilter({ onFilterChange }: LocationFilterProps) {
  const [distance, setDistance] = useState(50);
  const [city, setCity] = useState("");

  const debouncedFilterChange = useDebouncedCallback((newFilters: { distance: number; city?: string }) => {
    onFilterChange(newFilters);
  }, 300);

  const handleDistanceChange = (values: number[]) => {
    const newDistance = values[0];
    setDistance(newDistance);
    debouncedFilterChange({ distance: newDistance, city });
  };

  const handleCityChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    event.preventDefault();
    const newCity = event.target.value;
    setCity(newCity);
    debouncedFilterChange({ distance, city: newCity });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Filtres de localisation</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>Ville</Label>
          <Input 
            type="text" 
            placeholder="Entrez une ville"
            value={city}
            onChange={handleCityChange}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
              }
            }}
          />
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
            onValueChange={handleDistanceChange}
          />
        </div>
      </CardContent>
    </Card>
  );
}