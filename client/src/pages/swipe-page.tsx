import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Project } from "@shared/schema";
import { ProjectCard } from "@/components/project-card";
import { LocationFilter } from "@/components/location-filter";
import { LoadingAnimation } from "@/components/loading-animation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { motion, AnimatePresence } from "framer-motion";
import { ThumbsUp, ThumbsDown } from "lucide-react";
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

  const {
    data: projects = [],
    isLoading,
    error
  } = useQuery<Project[]>({
    queryKey: ["/api/projects/suggestions", userLocation, filters],
    queryFn: async () => {
      if (!userLocation) return [];
      return getSuggestedProjects(
        userLocation.latitude,
        userLocation.longitude,
        filters.distance,
        filters.city
      );
    },
    enabled: !!userLocation,
  });

  const handleFilterChange = (newFilters: Filters) => {
    setCurrentIndex(0);
    setFilters(newFilters);
  };

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

  if (!userLocation) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <LoadingAnimation 
          message="Récupération de votre position..." 
          size="lg"
        />
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <LoadingAnimation 
          message="Recherche des projets près de chez vous..." 
          size="lg"
        />
      </div>
    );
  }

  if (error) {
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
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-gray-900">Découvrir des projets</h1>
          <p className="text-gray-600">
            {userLocation 
              ? "Swipez à droite pour les projets qui vous intéressent"
              : "Activez la géolocalisation pour voir les projets près de chez vous"}
          </p>
        </div>

        <LocationFilter 
          onFilterChange={handleFilterChange} 
          projectCount={projects.length}
        />

        <AnimatePresence mode="wait">
          {currentProject ? (
            <motion.div
              className="relative"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              key="project-card"
            >
              <ProjectCard project={currentProject} showDistance={true} />

              <div className="flex justify-center gap-4 mt-6">
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    size="lg"
                    variant="outline"
                    className="rounded-full p-6"
                    onClick={() => handleSwipe(currentProject.id, 'pass')}
                  >
                    <ThumbsDown className="h-6 w-6" />
                  </Button>
                </motion.div>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    size="lg"
                    className="rounded-full p-6"
                    onClick={() => handleSwipe(currentProject.id, 'like')}
                  >
                    <ThumbsUp className="h-6 w-6" />
                  </Button>
                </motion.div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              key="no-projects"
            >
              <Card className="p-6 text-center">
                <p className="text-gray-600">Plus de projets à afficher pour le moment !</p>
                <p className="text-sm text-gray-500 mt-2">
                  Revenez plus tard pour découvrir de nouveaux projets.
                </p>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}