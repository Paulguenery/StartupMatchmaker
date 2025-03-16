import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { User } from "@shared/schema";
import { Card, CardContent } from "@/components/ui/card";
import { AdvancedProfileFilters } from "@/components/advanced-profile-filters";
import { useTranslation } from "react-i18next";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { BriefcaseIcon, MapPinIcon, StarIcon, MessageCircle, UserPlus, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useState } from "react";

export default function SearchProfilesPage() {
  const { user, isPremium } = useAuth();
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState("");

  const { data: profiles = [], isLoading } = useQuery<User[]>({
    queryKey: ["/api/users/search"],
    enabled: user?.role === 'project_owner',
  });

  const handleFilterChange = (filters: any) => {
    // TODO: Implémenter le filtrage des profils
    console.log("Filtres appliqués:", filters);
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

        <div className="flex gap-4">
          <Input
            type="text"
            placeholder="Rechercher par nom, compétence..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="max-w-md"
          />
        </div>

        <AdvancedProfileFilters onFilterChange={handleFilterChange} isPremium={isPremium} />

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : profiles.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-gray-600">Aucun profil ne correspond à vos critères de recherche.</p>
              <p className="text-sm text-gray-500 mt-2">Essayez d'ajuster vos filtres pour voir plus de résultats.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {profiles.map(profile => (
              <Card key={profile.id} className="overflow-hidden">
                <CardContent className="p-6">
                  <div className="flex items-start space-x-4">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={profile.profilePicture || ''} />
                      <AvatarFallback>{profile.fullName?.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">{profile.fullName}</h3>
                      {profile.experienceLevel && (
                        <p className="text-sm text-gray-500 flex items-center gap-1">
                          <BriefcaseIcon className="h-4 w-4" />
                          {profile.experienceLevel}
                        </p>
                      )}
                      {profile.location && (
                        <p className="text-sm text-gray-500 flex items-center gap-1">
                          <MapPinIcon className="h-4 w-4" />
                          {profile.location.city}
                        </p>
                      )}
                    </div>
                  </div>

                  {profile.skills && profile.skills.length > 0 && (
                    <div className="mt-4">
                      <div className="flex flex-wrap gap-2">
                        {profile.skills.slice(0, 3).map(skill => (
                          <span
                            key={skill}
                            className="px-2 py-1 bg-gray-100 rounded-full text-xs text-gray-700"
                          >
                            {skill}
                          </span>
                        ))}
                        {profile.skills.length > 3 && (
                          <span className="px-2 py-1 bg-gray-100 rounded-full text-xs text-gray-700">
                            +{profile.skills.length - 3}
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="mt-4 flex justify-between items-center gap-2">
                    <Button variant="outline" size="sm" className="flex-1">
                      <UserPlus className="h-4 w-4 mr-2" />
                      Inviter
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1">
                      <MessageCircle className="h-4 w-4 mr-2" />
                      Message
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}