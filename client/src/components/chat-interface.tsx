import { useState } from "react";
import { Match, Project, User } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Video } from "lucide-react";
import { VideoChat } from "./video-chat";
import { useAuth } from "@/hooks/use-auth";

interface ChatInterfaceProps {
  match: Match;
  project: Project;
  otherUser: User;
}

export function ChatInterface({ match, project, otherUser }: ChatInterfaceProps) {
  const [isVideoChatOpen, setIsVideoChatOpen] = useState(false);
  const { user } = useAuth();

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Chat avec {otherUser.fullName}</CardTitle>
            <p className="text-sm text-gray-500">Projet : {project.title}</p>
          </div>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setIsVideoChatOpen(true)}
            title="Démarrer un appel vidéo"
          >
            <Video className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent>
          {/* Ici sera intégré le chat textuel */}
          <div className="h-96 bg-muted rounded-lg flex items-center justify-center">
            <p className="text-muted-foreground">Chat en cours de développement</p>
          </div>
        </CardContent>
      </Card>

      {isVideoChatOpen && user && (
        <VideoChat
          projectId={project.id}
          userId={user.id}
          onClose={() => setIsVideoChatOpen(false)}
        />
      )}
    </>
  );
}
