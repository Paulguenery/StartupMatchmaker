import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { AdvancedProfileFilters } from "@/components/advanced-profile-filters";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import { useState } from "react";
import { useLocation } from "wouter";

export default function SearchProfilesPage() {
  const { user, isPremium } = useAuth();
  const { t } = useTranslation();
  const [filters, setFilters] = useState({});
  const [, setLocation] = useLocation();

  const handleFilterChange = (newFilters: any) => {
    setFilters(newFilters);
  };

  const handleSearch = () => {
    localStorage.setItem('profileFilters', JSON.stringify(filters));
    setLocation('/swipe-profiles');
  };

  if (!user || user.role !== 'project_owner') {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Rechercher des talents</h1>
          <p className="text-gray-600">Trouvez les meilleurs profils pour vos projets</p>
        </div>

        <Card>
          <CardContent className="p-6">
            <AdvancedProfileFilters onFilterChange={handleFilterChange} isPremium={isPremium} />
            <div className="mt-6 flex justify-end">
              <Button 
                onClick={handleSearch}
                className="flex items-center gap-2"
                size="lg"
              >
                <Search className="h-4 w-4" />
                Rechercher
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}