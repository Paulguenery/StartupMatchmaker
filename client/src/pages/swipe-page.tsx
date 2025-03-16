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
import { useTranslation } from "react-i18next";
import { notificationService } from "@/lib/notifications";

interface Filters {
  distance: number;
  city?: string;
  postalCode?: string;
}

export default function SwipePage() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userLocation, setUserLocation] = useState<{latitude: number; longitude: number} | null>(null);
  const [filters, setFilters] = useState<Filters>({ distance: 50 });
  const { toast } = useToast();
  const { t } = useTranslation();

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
            title: t("error"),
            description: t("locationError"),
            variant: "destructive",
          });
        }
      );
    }

    // Initialiser les notifications
    notificationService.init().catch(console.error);
  }, [toast, t]);

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
        filters.city,
        filters.postalCode
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
      const result = await matchWithProject(projectId, action);
      setCurrentIndex(prev => prev + 1);

      if (action === 'like') {
        toast({
          title: t("matchSuccess"),
          description: t("matchNotification"),
        });

        // Envoyer une notification push si c'est un match
        if (result.status === 'matched') {
          await notificationService.sendNotification(
            t("notificationTitle"),
            t("notificationBody")
          );
        }
      }
    } catch (error) {
      console.error("Erreur lors du swipe:", error);
      toast({
        title: t("error"),
        description: t("swipeError"),
        variant: "destructive",
      });
    }
  };

  const currentProject = projects[currentIndex];

  if (!userLocation) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <LoadingAnimation 
          message={t("loadingLocation")}
          size="lg"
        />
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <LoadingAnimation 
          message={t("loadingProjects")}
          size="lg"
        />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center text-red-500">
          {t("projectLoadError")}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-gray-900">{t("discoverProjects")}</h1>
          <p className="text-gray-600">
            {userLocation 
              ? t("swipeInstructions")
              : t("enableLocation")}
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
                <p className="text-gray-600">{t("noMoreProjects")}</p>
                <p className="text-sm text-gray-500 mt-2">
                  {t("checkBackLater")}
                </p>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}