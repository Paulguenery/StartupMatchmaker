import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Search, X } from "lucide-react";
import { PROJECT_CATEGORIES, SKILLS_BY_CATEGORY } from "@/lib/constants";
import { useState, useEffect } from "react";

interface FiltersProps {
  onFilterChange: (filters: any) => void;
  isPremium: boolean;
}

export function AdvancedProfileFilters({ onFilterChange, isPremium }: FiltersProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [availableSkills, setAvailableSkills] = useState<string[]>([]);

  useEffect(() => {
    if (selectedCategory) {
      setAvailableSkills(SKILLS_BY_CATEGORY[selectedCategory] || []);
    } else {
      setAvailableSkills([]);
    }
  }, [selectedCategory]);

  if (!isPremium) {
    return (
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-4">
              Passez à Premium pour accéder aux filtres avancés et trouver les meilleurs talents pour votre projet !
            </p>
            <Button variant="outline" className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-white hover:from-yellow-500 hover:to-yellow-700">
              Devenir Premium
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
            <Select onValueChange={(value) => onFilterChange({ distance: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Sélectionnez une distance" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10 km</SelectItem>
                <SelectItem value="25">25 km</SelectItem>
                <SelectItem value="50">50 km</SelectItem>
                <SelectItem value="100">100 km</SelectItem>
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