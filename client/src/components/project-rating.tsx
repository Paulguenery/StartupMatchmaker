import { useState } from "react";
import { Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Rating } from "@shared/schema";
import { useQuery } from "@tanstack/react-query";

interface ProjectRatingProps {
  projectId: number;
}

export function ProjectRating({ projectId }: ProjectRatingProps) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const { toast } = useToast();

  const { data: ratings = [] } = useQuery<Rating[]>({
    queryKey: [`/api/projects/${projectId}/ratings`],
  });

  const averageRating = ratings.length
    ? ratings.reduce((acc, r) => acc + r.score, 0) / ratings.length
    : 0;

  const handleSubmitRating = async () => {
    try {
      await apiRequest("POST", `/api/projects/${projectId}/rate`, {
        score: rating,
        comment,
      });

      queryClient.invalidateQueries({ queryKey: [`/api/projects/${projectId}/ratings`] });
      
      toast({
        title: "Note envoyée",
        description: "Votre évaluation a été enregistrée avec succès.",
      });

      setRating(0);
      setComment("");
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible d'envoyer votre évaluation.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <div className="flex">
          {[1, 2, 3, 4, 5].map((score) => (
            <button
              key={score}
              onClick={() => setRating(score)}
              className="focus:outline-none"
            >
              <Star
                className={`h-6 w-6 ${
                  score <= rating
                    ? "fill-yellow-400 text-yellow-400"
                    : "text-gray-300"
                }`}
              />
            </button>
          ))}
        </div>
        <span className="text-sm text-gray-500">
          Note moyenne: {averageRating.toFixed(1)} ({ratings.length} avis)
        </span>
      </div>

      <Textarea
        placeholder="Votre commentaire (optionnel)"
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        className="h-24"
      />

      <Button
        onClick={handleSubmitRating}
        disabled={rating === 0}
      >
        Envoyer l'évaluation
      </Button>

      <div className="space-y-4 mt-6">
        <h3 className="font-semibold">Commentaires récents</h3>
        {ratings.map((r) => (
          <div key={r.id} className="border-b pb-4">
            <div className="flex items-center gap-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={`h-4 w-4 ${
                    i < r.score ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                  }`}
                />
              ))}
            </div>
            {r.comment && <p className="mt-2 text-gray-600">{r.comment}</p>}
          </div>
        ))}
      </div>
    </div>
  );
}
