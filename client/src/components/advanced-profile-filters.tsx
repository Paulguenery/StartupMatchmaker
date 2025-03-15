import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Search, X } from "lucide-react";

interface FiltersProps {
  onFilterChange: (filters: any) => void;
  isPremium: boolean;
}

export function AdvancedProfileFilters({ onFilterChange, isPremium }: FiltersProps) {
  if (!isPremium) {
    return (
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-4">
              Passez à Premium pour accéder aux filtres avancés et trouver les meilleurs talents pour votre projet !
            </p>
            <Button variant="premium">Devenir Premium</Button>
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
            <label className="text-sm font-medium">Compétences</label>
            <Input 
              placeholder="ex: React, Node.js"
              onChange={(e) => onFilterChange({ skills: e.target.value.split(',') })}
            />
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
                <SelectItem value="freelance">Freelance</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Statut de vérification</label>
            <Select onValueChange={(value) => onFilterChange({ isVerified: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Sélectionnez un statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="true">Profils vérifiés uniquement</SelectItem>
                <SelectItem value="false">Tous les profils</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
