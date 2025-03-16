import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SlidersHorizontal, Check, Loader2 } from "lucide-react";
import { searchCity } from "@/lib/geocoding";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandGroup, CommandItem } from "@/components/ui/command";

interface FiltersDialogProps {
  filters: {
    category: string;
    distance: number;
    city: string;
    latitude?: number;
    longitude?: number;
    department?: string;
    postalCode?: string;
  };
  onFiltersChange: (filters: FiltersDialogProps["filters"]) => void;
}

type City = {
  city: string;
  latitude: number;
  longitude: number;
  department: string;
  postalCode: string;
};

export function FiltersDialog({ filters, onFiltersChange }: FiltersDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [tempFilters, setTempFilters] = useState(filters);
  const [citySearch, setCitySearch] = useState("");
  const [cities, setCities] = useState<City[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const searchTimeout = setTimeout(async () => {
      if (citySearch.length >= 2) {
        setIsLoading(true);
        try {
          const results = await searchCity(citySearch);
          setCities(results);
        } catch (error) {
          console.error('Erreur lors de la recherche:', error);
        } finally {
          setIsLoading(false);
        }
      } else {
        setCities([]);
      }
    }, 300);

    return () => clearTimeout(searchTimeout);
  }, [citySearch]);

  const handleCitySelect = (city: City) => {
    setTempFilters({
      ...tempFilters,
      city: city.city,
      latitude: city.latitude,
      longitude: city.longitude,
      department: city.department,
      postalCode: city.postalCode
    });
    setCitySearch(`${city.city} (${city.postalCode})`);
  };

  const handleApplyFilters = () => {
    onFiltersChange(tempFilters);
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <SlidersHorizontal className="h-4 w-4" />
          Filtres
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Filtrer les projets</DialogTitle>
        </DialogHeader>
        <div className="space-y-6 py-4">
          <div className="space-y-2">
            <Label>Ville</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Input
                  placeholder="Rechercher une ville..."
                  value={citySearch}
                  onChange={(e) => setCitySearch(e.target.value)}
                />
              </PopoverTrigger>
              <PopoverContent className="w-[300px] p-0" align="start">
                <Command>
                  <CommandGroup>
                    {isLoading ? (
                      <div className="flex items-center justify-center p-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                      </div>
                    ) : cities.length > 0 ? (
                      cities.map((city) => (
                        <CommandItem
                          key={`${city.city}-${city.postalCode}`}
                          value={`${city.city} (${city.postalCode})`}
                          onSelect={() => handleCitySelect(city)}
                          className="flex items-center justify-between cursor-pointer"
                        >
                          <span>
                            {city.city} ({city.postalCode}) - {city.department}
                          </span>
                          {tempFilters.city === city.city && (
                            <Check className="h-4 w-4" />
                          )}
                        </CommandItem>
                      ))
                    ) : (
                      citySearch.length >= 2 && (
                        <div className="p-2 text-sm text-gray-500">
                          Aucune ville trouvée
                        </div>
                      )
                    )}
                  </CommandGroup>
                </Command>
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-2">
            <Label>Distance maximale (km)</Label>
            <Select
              value={tempFilters.distance?.toString() || "50"}
              onValueChange={(value) =>
                setTempFilters({
                  ...tempFilters,
                  distance: parseInt(value),
                })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Sélectionnez une distance" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10 km</SelectItem>
                <SelectItem value="25">25 km</SelectItem>
                <SelectItem value="50">50 km</SelectItem>
                <SelectItem value="100">100 km</SelectItem>
                <SelectItem value="200">200 km</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button
            className="w-full"
            onClick={handleApplyFilters}
          >
            Appliquer les filtres
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}