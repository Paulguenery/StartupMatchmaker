import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { Project } from "@shared/schema";
import { ProjectCard } from "@/components/project-card";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { PlusCircle } from "lucide-react";

export default function MyProjectsPage() {
  const { user } = useAuth();

  const { data: projects } = useQuery<Project[]>({
    queryKey: ["/api/projects"],
  });

  const myProjects = projects?.filter(project => project.userId === user?.id);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Mes annonces</h1>
            <p className="text-gray-600">Gérez vos annonces de projet</p>
          </div>
          <Button asChild>
            <Link href="/new-project">
              <PlusCircle className="h-5 w-5 mr-2" />
              Nouvelle annonce
            </Link>
          </Button>
        </div>

        {!myProjects?.length ? (
          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-gray-600 mb-4">Vous n'avez pas encore créé d'annonce.</p>
              <Button asChild>
                <Link href="/new-project">
                  <PlusCircle className="h-5 w-5 mr-2" />
                  Créer ma première annonce
                </Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {myProjects.map(project => (
              <ProjectCard key={project.id} project={project} showRating />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
