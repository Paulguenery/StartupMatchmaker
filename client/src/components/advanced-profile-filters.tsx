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
            <label className="text-sm font-medium">Compétences recherchées</label>
            <Input 
              placeholder="ex: React, Node.js, UX Design"
              onChange={(e) => onFilterChange({ skills: e.target.value.split(',').map(s => s.trim()) })}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Spécialité</label>
            <Select onValueChange={(value) => onFilterChange({ category: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Sélectionnez une spécialité" />
              </SelectTrigger>
              <SelectContent className="max-h-[300px]">
                <SelectItem value="tech">Informatique et technologie</SelectItem>
                <SelectItem value="mobile">Application mobile</SelectItem>
                <SelectItem value="web">Site internet</SelectItem>
                <SelectItem value="cloud">Informatique Cloud et Big Data</SelectItem>
                <SelectItem value="ai">Intelligence Artificielle et Machine Learning</SelectItem>
                <SelectItem value="blockchain">Blockchain et Cryptomonnaies</SelectItem>
                <SelectItem value="robotics">Robotique</SelectItem>
                <SelectItem value="marketing">Marketing et Publicité</SelectItem>
                <SelectItem value="design">Design et Création</SelectItem>
                <SelectItem value="hr">Ressources humaines</SelectItem>
                <SelectItem value="finance">Finance et Comptabilité</SelectItem>
                <SelectItem value="sales">Vente et Développement Commercial</SelectItem>
                <SelectItem value="health">Santé</SelectItem>
                <SelectItem value="engineering">Ingénierie</SelectItem>
                <SelectItem value="education">Éducation</SelectItem>
                <SelectItem value="legal">Droit</SelectItem>
                <SelectItem value="entrepreneurship">Entrepreneuriat</SelectItem>
                <SelectItem value="architecture">Architecture</SelectItem>
                <SelectItem value="media">Médias et Communication</SelectItem>
                <SelectItem value="logistics">Logistique et Transport</SelectItem>
                <SelectItem value="research">Recherche et développement</SelectItem>
                <SelectItem value="project">Gestion de Projet</SelectItem>
                <SelectItem value="industry">Industrie et Production</SelectItem>
                <SelectItem value="consulting">Conseil</SelectItem>
                <SelectItem value="tourism">Hôtellerie et Tourisme</SelectItem>
                <SelectItem value="agriculture">Agriculture et Agroalimentaire</SelectItem>
                <SelectItem value="energy">Énergie et environnement</SelectItem>
                <SelectItem value="realestate">Immobilier</SelectItem>
                <SelectItem value="culture">Art et Culture</SelectItem>
                <SelectItem value="social">Sciences Sociales</SelectItem>
                <SelectItem value="telecom">Télécommunications</SelectItem>
                <SelectItem value="security">Sécurité et Défense</SelectItem>
                <SelectItem value="public">Administration publique</SelectItem>
                <SelectItem value="pr">Relations Publiques</SelectItem>
                <SelectItem value="biotech">Biotechnologie et Pharmaceutique</SelectItem>
                <SelectItem value="sports">Sports et Loisirs</SelectItem>
                <SelectItem value="events">Événementiel</SelectItem>
                <SelectItem value="transport">Transports et Mobilité</SelectItem>
                <SelectItem value="medical">Médical et paramédical</SelectItem>
                <SelectItem value="it">Systèmes d'information</SelectItem>
                <SelectItem value="retail">Commerce de détail</SelectItem>
                <SelectItem value="food">Restauration</SelectItem>
                <SelectItem value="fashion">Mode et Textile</SelectItem>
                <SelectItem value="trade">Commerce international</SelectItem>
                <SelectItem value="hightech">Haute technologie</SelectItem>
                <SelectItem value="ecommerce">Commerce électronique</SelectItem>
                <SelectItem value="gaming">Jeux vidéo et eSports</SelectItem>
                <SelectItem value="social_media">Réseaux Sociaux et Influenceurs</SelectItem>
                <SelectItem value="aerospace">Aéronautique et Spatiale</SelectItem>
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
        </div>
      </CardContent>
    </Card>
  );
}