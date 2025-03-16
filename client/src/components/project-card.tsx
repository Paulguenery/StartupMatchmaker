import { Project } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Building2 } from "lucide-react";

interface ProjectCardProps {
  project: Project;
  showDistance?: boolean;
}

export function ProjectCard({ project, showDistance = false }: ProjectCardProps) {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="space-y-2">
        <div className="flex items-start justify-between">
          <CardTitle className="text-xl">{project.title}</CardTitle>
          <Badge variant="secondary">{project.sector}</Badge>
        </div>
        <div className="flex gap-2 text-sm text-gray-500">
          {project.location && (
            <div className="flex items-center gap-1">
              <MapPin className="h-4 w-4" />
              <span>{project.location.city}, {project.location.department}</span>
            </div>
          )}
          {showDistance && project.distance && (
            <Badge variant="outline">
              {Math.round(project.distance)}km
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-gray-600">{project.description}</p>

        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Building2 className="h-4 w-4" />
          <span>{project.sector}</span>
        </div>
      </CardContent>
    </Card>
  );
}