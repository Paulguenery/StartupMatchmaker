import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Project } from "@shared/schema";
import { ProjectCard } from "@/components/project-card";
import { FiltersDialog } from "@/components/filters-dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { motion, AnimatePresence } from "framer-motion";
import { ThumbsUp, ThumbsDown } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function SwipePage() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [filters, setFilters] = useState({
    category: "",
    distance: 50,
    duration: "",
  });
  const { toast } = useToast();

  const { data: projects = [] } = useQuery<Project[]>({
    queryKey: ["/api/projects", filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters.category) params.append("category", filters.category);
      if (filters.distance) params.append("distance", filters.distance.toString());
      if (filters.duration) params.append("duration", filters.duration);

      const res = await fetch(`/api/projects?${params.toString()}`);
      if (!res.ok) throw new Error("Erreur lors du chargement des projets");
      return res.json();
    },
  });

  const matchMutation = useMutation({
    mutationFn: async ({ projectId, status }: { projectId: number, status: "accepted" | "rejected" }) => {
      await apiRequest("POST", "/api/matches", {
        projectId,
        status,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/matches"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Erreur",
        description: "Impossible de traiter votre réponse.",
        variant: "destructive",
      });
    },
  });

  const handleSwipe = async (projectId: number, status: "accepted" | "rejected") => {
    try {
      await matchMutation.mutateAsync({ projectId, status });
      setCurrentIndex(prev => prev + 1);

      if (status === "accepted") {
        toast({
          title: "C'est un match !",
          description: "Vous avez matché avec ce projet.",
        });
      }
    } catch (error) {
      console.error("Erreur lors du swipe:", error);
    }
  };

  const currentProject = projects[currentIndex];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Trouver des projets</h1>
            <p className="text-gray-600">Swipez à droite sur les projets qui vous intéressent</p>
          </div>
          <FiltersDialog filters={filters} onFiltersChange={setFilters} />
        </div>

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
                <ProjectCard project={currentProject} />
              </motion.div>
            </AnimatePresence>

            <div className="flex justify-center gap-4 mt-6">
              <Button
                size="lg"
                variant="outline"
                className="rounded-full p-6"
                onClick={() => handleSwipe(currentProject.id, "rejected")}
              >
                <ThumbsDown className="h-6 w-6" />
              </Button>
              <Button
                size="lg"
                className="rounded-full p-6"
                onClick={() => handleSwipe(currentProject.id, "accepted")}
              >
                <ThumbsUp className="h-6 w-6" />
              </Button>
            </div>
          </div>
        ) : (
          <Card className="p-6 text-center">
            <p className="text-gray-600">Plus de projets à afficher. Revenez plus tard !</p>
          </Card>
        )}
      </div>
    </div>
  );
}