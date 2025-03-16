import { useState } from "react";
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
import { SlidersHorizontal } from "lucide-react";

interface FiltersDialogProps {
  filters: {
    category: string;
    distance: number;
    duration: string;
    city: string;
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
  const [isOpen, setIsOpen] = useState(false);
  const [tempFilters, setTempFilters] = useState(filters);

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
            <Input
              placeholder="Entrez une ville"
              value={tempFilters.city}
              onChange={(e) =>
                setTempFilters({
                  ...tempFilters,
                  city: e.target.value,
                })
              }
            />
          </div>

          <div className="space-y-2">
            <Label>Catégorie</Label>
            <Select
              value={tempFilters.category || "all"}
              onValueChange={(value) =>
                setTempFilters({
                  ...tempFilters,
                  category: value === "all" ? "" : value,
                })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Sélectionnez une catégorie" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes les catégories</SelectItem>
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

          <div className="space-y-2">
            <Label>Durée du projet</Label>
            <Select
              value={tempFilters.duration || "all"}
              onValueChange={(value) =>
                setTempFilters({
                  ...tempFilters,
                  duration: value === "all" ? "" : value,
                })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Sélectionnez une durée" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes les durées</SelectItem>
                {durations.map((duration) => (
                  <SelectItem key={duration.value} value={duration.value}>
                    {duration.label}
                  </SelectItem>
                ))}
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