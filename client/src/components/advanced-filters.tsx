import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";
import { RotateCcw } from "lucide-react";

interface AdvancedFiltersProps {
  onFilterChange: (filters: {
    sector?: string;
    duration?: string;
    maxDistance: number;
  }) => void;
  projectCount?: number;
  defaultFilters?: {
    sector?: string;
    duration?: string;
    maxDistance?: number;
  };
}

export function AdvancedFilters({ 
  onFilterChange, 
  projectCount,
  defaultFilters 
}: AdvancedFiltersProps) {
  const { t } = useTranslation();
  const [filters, setFilters] = useState({
    sector: defaultFilters?.sector || "",
    duration: defaultFilters?.duration || "",
    maxDistance: defaultFilters?.maxDistance || 50,
  });

  const handleFilterChange = (key: string, value: any) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleReset = () => {
    const defaultValues = {
      sector: "",
      duration: "",
      maxDistance: 50,
    };
    setFilters(defaultValues);
    onFilterChange(defaultValues);
  };

  return (
    <Card>
      <CardContent className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">{t('advancedFilters')}</h3>
          <Button
            variant="outline"
            size="sm"
            onClick={handleReset}
            className="flex items-center gap-2"
          >
            <RotateCcw className="h-4 w-4" />
            {t('resetFilters')}
          </Button>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>{t('sector')}</Label>
            <Select
              value={filters.sector}
              onValueChange={(value) => handleFilterChange("sector", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder={t('selectSector')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="technology">{t('sectors.technology')}</SelectItem>
                <SelectItem value="business">{t('sectors.business')}</SelectItem>
                <SelectItem value="creative">{t('sectors.creative')}</SelectItem>
                <SelectItem value="other">{t('sectors.other')}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>{t('duration')}</Label>
            <Select
              value={filters.duration}
              onValueChange={(value) => handleFilterChange("duration", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder={t('selectDuration')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="short">{t('durations.short')}</SelectItem>
                <SelectItem value="medium">{t('durations.medium')}</SelectItem>
                <SelectItem value="long">{t('durations.long')}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between">
              <Label>{t('maxDistance')}</Label>
              <span className="text-sm text-muted-foreground">
                {filters.maxDistance}km
              </span>
            </div>
            <Slider
              value={[filters.maxDistance]}
              onValueChange={([value]) => handleFilterChange("maxDistance", value)}
              max={100}
              step={5}
              className="mt-2"
            />
          </div>
        </div>

        {projectCount !== undefined && (
          <div className="pt-4 border-t">
            <p className="text-sm text-muted-foreground">
              {projectCount} {t('projectsFound')}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}