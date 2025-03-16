import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Project } from "@shared/schema";
import { ProjectCard } from "@/components/project-card";
import { LocationFilter } from "@/components/location-filter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { motion, AnimatePresence } from "framer-motion";
import { ThumbsUp, ThumbsDown, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { matchWithProject, getSuggestedProjects } from "@/lib/matching";

interface Filters {
  distance: number;
  city?: string;
}

export default function SwipePage() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userLocation, setUserLocation] = useState<{latitude: number; longitude: number} | null>(null);
  const [filters, setFilters] = useState<Filters>({ distance: 50 });
  const { toast } = useToast();

  // Get user's location
  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          });
        },
        (error) => {
          console.error("Erreur de géolocalisation:", error);
          toast({
            title: "Erreur de localisation",
            description: "Impossible d'obtenir votre position. Certaines fonctionnalités peuvent être limitées.",
            variant: "destructive",
          });
        }
      );
    }
  }, [toast]);

  // Fetch suggested projects
  const { data: projects = [], isLoading, error } = useQuery<Project[]>({
    queryKey: ["/api/projects/suggestions", userLocation, filters],
    queryFn: async () => {
      if (!userLocation) return [];
      console.log("Appel API avec les filtres:", filters);
      try {
        const results = await getSuggestedProjects(
          userLocation.latitude,
          userLocation.longitude,
          filters.distance,
          filters.city
        );
        console.log("Résultats de l'API:", results);
        return results;
      } catch (error) {
        console.error("Erreur API:", error);
        throw error;
      }
    },
    enabled: !!userLocation,
  });

  const handleSwipe = async (projectId: number, action: 'like' | 'pass') => {
    try {
      await matchWithProject(projectId, action);
      setCurrentIndex(prev => prev + 1);

      if (action === 'like') {
        toast({
          title: "Super !",
          description: "Vous avez liké ce projet. Vous serez notifié si c'est un match !",
        });
      }
    } catch (error) {
      console.error("Erreur lors du swipe:", error);
      toast({
        title: "Erreur",
        description: "Impossible de traiter votre action.",
        variant: "destructive",
      });
    }
  };

  const currentProject = projects[currentIndex];

  if (isLoading || !userLocation) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-gray-400" />
          <p className="text-gray-600">Chargement des projets...</p>
        </div>
      </div>
    );
  }

  if (error) {
    console.error("Erreur de chargement:", error);
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center text-red-500">
          Une erreur est survenue lors du chargement des projets.
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Découvrir des projets</h1>
          <p className="text-gray-600">
            {userLocation 
              ? "Swipez à droite pour les projets qui vous intéressent"
              : "Activez la géolocalisation pour voir les projets près de chez vous"}
          </p>
        </div>

        <LocationFilter 
          onFilterChange={(newFilters) => {
            console.log("Nouveaux filtres appliqués:", newFilters);
            setFilters(newFilters);
            setCurrentIndex(0); // Reset index when filters change
          }} 
        />

        {currentProject ? (
          <div className="relative">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentProject.id}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <ProjectCard project={currentProject} showDistance={true} />
              </motion.div>
            </AnimatePresence>

            <div className="flex justify-center gap-4 mt-6">
              <Button
                size="lg"
                variant="outline"
                className="rounded-full p-6"
                onClick={() => handleSwipe(currentProject.id, 'pass')}
              >
                <ThumbsDown className="h-6 w-6" />
              </Button>
              <Button
                size="lg"
                className="rounded-full p-6"
                onClick={() => handleSwipe(currentProject.id, 'like')}
              >
                <ThumbsUp className="h-6 w-6" />
              </Button>
            </div>
          </div>
        ) : (
          <Card className="p-6 text-center">
            <p className="text-gray-600">Plus de projets à afficher pour le moment !</p>
            <p className="text-sm text-gray-500 mt-2">Revenez plus tard pour découvrir de nouveaux projets.</p>
          </Card>
        )}
      </div>
    </div>
  );
}