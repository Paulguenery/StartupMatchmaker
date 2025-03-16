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
            <Label>Rayon de recherche</Label>
            <AnimatePresence mode="wait">
              <motion.div
                key={`${distance}-${projectCount}`}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ 
                  scale: 1, 
                  opacity: 1,
                  transition: { type: "spring", stiffness: 200, damping: 20 }
                }}
                exit={{ scale: 0.8, opacity: 0 }}
                className="flex items-center gap-2"
              >
                <motion.span 
                  className="text-sm font-medium"
                  key={distance}
                  initial={{ y: -10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  {distance} km
                </motion.span>
                {projectCount !== undefined && (
                  <motion.div
                    key={projectCount}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ 
                      opacity: 1, 
                      scale: 1,
                      transition: { delay: 0.1 }
                    }}
                    className="px-2 py-1 bg-secondary rounded-full"
                  >
                    <span className="text-sm text-secondary-foreground">
                      {projectCount} projet{projectCount !== 1 ? 's' : ''}
                    </span>
                  </motion.div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
          <motion.div
            whileTap={{ scale: 1.02 }}
            whileHover={{ scale: 1.01 }}
            className="relative"
          >
            <Slider
              value={[distance]}
              max={150}
              step={10}
              onValueChange={handleDistanceChange}
              onValueCommit={() => setIsDragging(false)}
              onPointerDown={() => setIsDragging(true)}
              className={`${isDragging ? "cursor-grabbing" : "cursor-grab"} transition-all duration-200`}
            />
            {isDragging && (
              <motion.div
                className="absolute -bottom-6 left-0 right-0 text-center text-sm text-muted-foreground"
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
              >
                Faites glisser pour ajuster le rayon
              </motion.div>
            )}
          </motion.div>
        </div>

        {/* Section Ville */}
        <div className="space-y-4">
          <Label>Rechercher par ville</Label>
          <div className="flex gap-2">
            <div className="flex-1">
              <Input 
                type="text" 
                placeholder="Saisissez le nom d'une ville"
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