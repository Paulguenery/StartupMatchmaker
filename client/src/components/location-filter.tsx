import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface LocationFilterProps {
  onFilterChange: (filters: { distance: number; city?: string }) => void;
  projectCount?: number;
}

export function LocationFilter({ onFilterChange, projectCount }: LocationFilterProps) {
  const [distance, setDistance] = useState(50);
  const [city, setCity] = useState("");
  const [isDragging, setIsDragging] = useState(false);

  // Appliquer les filtres de manière indépendante
  const handleDistanceChange = (values: number[]) => {
    const newDistance = values[0];
    setDistance(newDistance);
    onFilterChange({
      distance: newDistance,
      city: city.trim() || undefined
    });
  };

  const handleCityChange = (value: string) => {
    setCity(value);
  };

  const handleSearch = () => {
    onFilterChange({
      distance,
      city: city.trim() || undefined
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
            <AnimatePresence>
              <motion.div
                key={distance}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                className="flex items-center gap-2"
              >
                <span className="text-sm font-medium text-muted-foreground">
                  {distance} km
                </span>
                {projectCount !== undefined && (
                  <span className="text-sm text-muted-foreground">
                    ({projectCount} projet{projectCount !== 1 ? 's' : ''})
                  </span>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
          <motion.div
            whileTap={{ scale: 1.02 }}
            whileHover={{ scale: 1.01 }}
          >
            <Slider
              value={[distance]}
              max={150}
              step={10}
              onValueChange={handleDistanceChange}
              onValueCommit={() => setIsDragging(false)}
              onPointerDown={() => setIsDragging(true)}
              className={isDragging ? "cursor-grabbing" : "cursor-grab"}
            />
          </motion.div>
        </div>

        {/* Section Ville */}
        <div className="space-y-4">
          <Label>Rechercher par ville</Label>
          <div className="flex gap-2">
            <div className="flex-1">
              <Input 
                type="text" 
                placeholder="Entrez une ville"
                value={city}
                onChange={(e) => handleCityChange(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleSearch();
                  }
                }}
              />
            </div>
            <Button 
              onClick={handleSearch}
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