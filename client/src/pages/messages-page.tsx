import { useQuery } from "@tanstack/react-query";
import { Match, Project, User } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChatInterface } from "@/components/chat-interface";
import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";

export default function MessagesPage() {
  const { user } = useAuth();

  const { data: matches = [], isLoading: isLoadingMatches } = useQuery<Match[]>({
    queryKey: ["/api/matches"],
  });

  const { data: projects = [], isLoading: isLoadingProjects } = useQuery<Project[]>({
    queryKey: ["/api/projects"],
  });

  const acceptedMatches = matches.filter(match => match.status === "accepted");

  if (isLoadingMatches || isLoadingProjects) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-border" />
      </div>
    );
  }

  if (acceptedMatches.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-3xl mx-auto">
          <Card>
            <CardContent className="p-6 text-center">
              <h2 className="text-xl font-semibold mb-2">Pas encore de matches</h2>
              <p className="text-gray-600">
                Commencez à matcher avec des projets pour démarrer des conversations !
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-3xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Messages</h1>
          <p className="text-gray-600">Vos conversations avec les matches</p>
        </div>

        <div className="space-y-4">
          {acceptedMatches.map(match => {
            const project = projects.find(p => p.id === match.projectId);
            if (!project) return null;

            return (
              <Card key={match.id}>
                <ChatInterface
                  match={match}
                  project={project}
                  otherUser={project.userId === user?.id ? user : { id: project.userId } as User}
                />
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}