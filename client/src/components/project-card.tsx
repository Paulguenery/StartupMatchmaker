import { Project } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Clock, Briefcase } from "lucide-react";
import { ProjectRating } from "./project-rating";

interface ProjectCardProps {
  project: Project;
  showRating?: boolean;
}

export function ProjectCard({ project, showRating = false }: ProjectCardProps) {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="space-y-2">
        <div className="flex items-start justify-between">
          <CardTitle className="text-xl">{project.title}</CardTitle>
          <Badge>
            {project.duration === "short" ? "Court terme" :
              project.duration === "medium" ? "Moyen terme" : "Long terme"}
          </Badge>
        </div>
        <div className="flex gap-2 text-sm text-gray-500">
          <div className="flex items-center gap-1">
            <MapPin className="h-4 w-4" />
            <span>{project.location?.city || "Non spécifié"}</span>
          </div>
          <div className="flex items-center gap-1">
            <Briefcase className="h-4 w-4" />
            <span>{project.category}</span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-gray-600">{project.description}</p>

        <div>
          <h4 className="font-semibold mb-2">Compétences requises</h4>
          <div className="flex flex-wrap gap-2">
            {project.requiredSkills?.map((skill, index) => (
              <Badge key={index} variant="secondary">{skill}</Badge>
            )) || <span className="text-gray-500">Aucune compétence spécifiée</span>}
          </div>
        </div>

        {showRating && (
          <div className="mt-6 pt-6 border-t">
            <h4 className="font-semibold mb-4">Évaluations</h4>
            <ProjectRating projectId={project.id} />
          </div>
        )}
      </CardContent>
    </Card>
  );
}