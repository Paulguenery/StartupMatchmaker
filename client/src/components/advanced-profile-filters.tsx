import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PROJECT_CATEGORIES, SKILLS_BY_CATEGORY } from "@/lib/constants";
import { searchCity } from "@/lib/geocoding";
import { useState, useEffect } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandGroup, CommandItem } from "@/components/ui/command";
import { Check, Loader2 } from "lucide-react";

interface FiltersProps {
  onFilterChange: (filters: any) => void;
  isPremium: boolean;
}

type City = {
  city: string;
  latitude: number;
  longitude: number;
  department: string;
  postalCode: string;
};

export function AdvancedProfileFilters({ onFilterChange, isPremium }: FiltersProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [availableSkills, setAvailableSkills] = useState<string[]>([]);
  const [citySearch, setCitySearch] = useState("");
  const [cities, setCities] = useState<City[]>([]);
  const [selectedCity, setSelectedCity] = useState<City | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (selectedCategory) {
      setAvailableSkills(SKILLS_BY_CATEGORY[selectedCategory] || []);
    } else {
      setAvailableSkills([]);
    }
  }, [selectedCategory]);

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
      }
    }, 300);

    return () => clearTimeout(searchTimeout);
  }, [citySearch]);

  const handleCitySelect = (city: City) => {
    setSelectedCity(city);
    setCitySearch(`${city.city} (${city.postalCode})`);
    onFilterChange({
      city: city.city,
      latitude: city.latitude,
      longitude: city.longitude,
      department: city.department,
      postalCode: city.postalCode
    });
  };

  if (!isPremium) {
    return (
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-4">
              Passez à Premium pour accéder aux filtres avancés et trouver les meilleurs talents pour votre projet !
            </p>
            <Button variant="outline" className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-white hover:from-yellow-500 hover:to-yellow-700" asChild>
              <a href="/subscribe">Devenir Premium</a>
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mb-6">
      <CardContent className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Ville</label>
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
                          onSelect={() => handleCitySelect(city)}
                          className="flex items-center justify-between"
                        >
                          <span>{city.city} ({city.postalCode}) - {city.department}</span>
                          {selectedCity?.city === city.city && (
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
            <label className="text-sm font-medium">Spécialité</label>
            <Select
              onValueChange={(value) => {
                setSelectedCategory(value);
                onFilterChange({ category: value });
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Sélectionnez une spécialité" />
              </SelectTrigger>
              <SelectContent className="max-h-[300px]">
                {PROJECT_CATEGORIES.map(category => (
                  <SelectItem key={category.value} value={category.value}>
                    {category.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Compétences recherchées</label>
            <Select onValueChange={(value) => onFilterChange({ skills: value === "none" ? [] : [value] })}>
              <SelectTrigger>
                <SelectValue placeholder="Sélectionnez des compétences" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Sans compétence spécifique</SelectItem>
                {availableSkills.map((skill) => (
                  <SelectItem key={skill} value={skill}>
                    {skill}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Distance maximale</label>
            <Select onValueChange={(value) => onFilterChange({ distance: parseInt(value, 10) })}>
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
          <div className="space-y-2">
            <label className="text-sm font-medium">Niveau d'expérience</label>
            <Select onValueChange={(value) => onFilterChange({ experienceLevel: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Sélectionnez un niveau" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="motivated">Je suis motivé et prêt à apprendre</SelectItem>
                <SelectItem value="junior">Junior</SelectItem>
                <SelectItem value="intermediate">Intermédiaire</SelectItem>
                <SelectItem value="senior">Senior</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Disponibilité</label>
            <Select onValueChange={(value) => onFilterChange({ availability: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Sélectionnez une disponibilité" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="immediate">Immédiate</SelectItem>
                <SelectItem value="one_month">Sous 1 mois</SelectItem>
                <SelectItem value="three_months">Sous 3 mois</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Type de collaboration</label>
            <Select onValueChange={(value) => onFilterChange({ collaborationType: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Sélectionnez un type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tout type de collaboration</SelectItem>
                <SelectItem value="full_time">Temps plein</SelectItem>
                <SelectItem value="part_time">Temps partiel</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}