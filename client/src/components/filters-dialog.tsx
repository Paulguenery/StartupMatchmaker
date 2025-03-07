import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { SlidersHorizontal } from "lucide-react";

interface FiltersDialogProps {
  filters: {
    category: string;
    distance: number;
    duration: string;
  };
  onFiltersChange: (filters: FiltersDialogProps["filters"]) => void;
}

const categories = [
  "Informatique et technologie",
  "Marketing et Publicité",
  "Design et Création",
  "Ressources humaines",
  "Finance et Comptabilité",
  "Vente et Développement Commercial",
  "Santé",
  "Ingénierie",
  "Éducation",
  "Droit",
  "Entrepreneuriat",
  "Architecture",
  "Médias et Communication",
  "Logistique et Transport",
  "Recherche et développement",
  "Gestion de projet",
  "Industrie et Production",
  "Services Financiers"
];

const durations = [
  { value: "short", label: "Court terme (< 3 mois)" },
  { value: "medium", label: "Moyen terme (3-6 mois)" },
  { value: "long", label: "Long terme (> 6 mois)" },
];

export function FiltersDialog({ filters, onFiltersChange }: FiltersDialogProps) {
  return (
    <Dialog>
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
            <Label>Catégorie</Label>
            <Select
              value={filters.category}
              onValueChange={(value) =>
                onFiltersChange({ ...filters, category: value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Sélectionnez une catégorie" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Toutes les catégories</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Distance maximale (km)</Label>
            <div className="pt-2">
              <Slider
                value={[filters.distance]}
                onValueChange={(value) =>
                  onFiltersChange({ ...filters, distance: value[0] })
                }
                max={100}
                step={5}
              />
              <div className="mt-1 text-sm text-gray-500">{filters.distance} km</div>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Durée du projet</Label>
            <Select
              value={filters.duration}
              onValueChange={(value) =>
                onFiltersChange({ ...filters, duration: value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Sélectionnez une durée" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Toutes les durées</SelectItem>
                {durations.map((duration) => (
                  <SelectItem key={duration.value} value={duration.value}>
                    {duration.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}