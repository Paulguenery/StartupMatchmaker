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
  // Add more categories as needed
];

const durations = [
  { value: "short", label: "Short Term (< 3 months)" },
  { value: "medium", label: "Medium Term (3-6 months)" },
  { value: "long", label: "Long Term (> 6 months)" },
];

export function FiltersDialog({ filters, onFiltersChange }: FiltersDialogProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <SlidersHorizontal className="h-4 w-4" />
          Filters
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Filter Projects</DialogTitle>
        </DialogHeader>
        <div className="space-y-6 py-4">
          <div className="space-y-2">
            <Label>Category</Label>
            <Select
              value={filters.category}
              onValueChange={(value) =>
                onFiltersChange({ ...filters, category: value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Categories</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Maximum Distance (km)</Label>
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
            <Label>Project Duration</Label>
            <Select
              value={filters.duration}
              onValueChange={(value) =>
                onFiltersChange({ ...filters, duration: value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select duration" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Any Duration</SelectItem>
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
