import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface LocationFilterProps {
  onFilterChange: (filters: { 
    distance: number; 
    city?: string;
    postalCode?: string;
  }) => void;
  projectCount?: number;
}

export function LocationFilter({ onFilterChange, projectCount }: LocationFilterProps) {
  const [distance, setDistance] = useState(50);
  const [city, setCity] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [isCountUpdating, setIsCountUpdating] = useState(false);

  const handleDistanceChange = (values: number[]) => {
    const newDistance = values[0];
    setDistance(newDistance);
    setIsCountUpdating(true);
    onFilterChange({
      distance: newDistance,
      city: city.trim() || undefined,
      postalCode: postalCode.trim() || undefined
    });
    setTimeout(() => setIsCountUpdating(false), 300);
  };

  const handleCityChange = (value: string) => {
    setCity(value);
  };

  const handlePostalCodeChange = (value: string) => {
    setPostalCode(value);
  };

  const handleSearch = () => {
    setIsCountUpdating(true);
    onFilterChange({
      distance,
      city: city.trim() || undefined,
      postalCode: postalCode.trim() || undefined
    });
    setTimeout(() => setIsCountUpdating(false), 300);
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
                      scale: isCountUpdating ? 1.1 : 1,
                      transition: { 
                        scale: {
                          type: "spring",
                          stiffness: 300,
                          damping: 20
                        },
                        opacity: { duration: 0.2 }
                      }
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
            {/* Effets visuels du slider */}
            <motion.div
              className="absolute -bottom-3 left-0 right-0 h-1 bg-primary/10 rounded-full"
              style={{
                scaleX: distance / 150,
                transformOrigin: "left"
              }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            />
            <motion.div
              className="absolute -bottom-3 left-0 right-0 h-1 bg-primary/5 rounded-full"
              initial={{ scaleX: 0 }}
              animate={{ 
                scaleX: isDragging ? distance / 150 : 0,
                transition: { type: "spring", stiffness: 400, damping: 40 }
              }}
              style={{ transformOrigin: "left" }}
            />
            <motion.div
              className="absolute -bottom-3 left-0 right-0 h-1 bg-primary/20"
              initial={{ scaleX: 0, opacity: 0 }}
              animate={isDragging ? {
                scaleX: [0, 1, 0],
                opacity: [0, 0.5, 0],
                transition: {
                  duration: 1,
                  repeat: Infinity,
                  ease: "easeInOut"
                }
              } : { scaleX: 0, opacity: 0 }}
              style={{ transformOrigin: "left" }}
            />
            <motion.div
              className="absolute -bottom-3 left-0 h-1 bg-primary rounded-full"
              style={{
                width: "2px",
                left: `${(distance / 150) * 100}%`,
                transform: "translateX(-50%)"
              }}
              animate={{
                height: isDragging ? "4px" : "2px",
                opacity: isDragging ? 1 : 0.7,
                scale: isCountUpdating ? [1, 1.5, 1] : 1,
                transition: {
                  scale: {
                    duration: 0.3,
                    ease: "easeInOut"
                  }
                }
              }}
            />
            {[0, 50, 100, 150].map((value) => (
              <motion.div
                key={value}
                className="absolute -bottom-5 h-3 w-px bg-border"
                style={{
                  left: `${(value / 150) * 100}%`,
                }}
                animate={{
                  height: distance === value ? "12px" : "8px",
                  opacity: isDragging ? 0.8 : 0.4,
                  scale: distance === value ? 1.2 : 1,
                  transition: {
                    scale: {
                      type: "spring",
                      stiffness: 300,
                      damping: 20
                    }
                  }
                }}
              >
                <motion.span
                  className="absolute -bottom-5 left-1/2 transform -translate-x-1/2 text-xs text-muted-foreground"
                  animate={{
                    opacity: isDragging ? 1 : 0.7,
                    scale: distance === value ? 1.1 : 1,
                    color: distance === value ? "var(--primary)" : "var(--muted-foreground)"
                  }}
                >
                  {value}
                </motion.span>
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* Section Recherche par localisation */}
        <div className="space-y-4">
          <Label>Recherche par localisation</Label>
          <div className="grid gap-4">
            <Input 
              type="text" 
              placeholder="Saisissez le nom d'une ville"
              value={city}
              onChange={(e) => handleCityChange(e.target.value)}
            />
            <Input 
              type="text" 
              placeholder="Code postal"
              value={postalCode}
              onChange={(e) => handlePostalCodeChange(e.target.value)}
              maxLength={5}
              pattern="[0-9]*"
            />
            <Button 
              onClick={handleSearch}
              className="w-full"
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