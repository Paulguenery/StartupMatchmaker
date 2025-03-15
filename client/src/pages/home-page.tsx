import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { User, Project, Match } from "@shared/schema";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ProjectCard } from "@/components/project-card";
import { UserCircle, SearchCode, Briefcase, Star, PlusCircle } from "lucide-react";
import { AdvancedProfileFilters } from "@/components/advanced-profile-filters";

export default function HomePage() {
  const { user } = useAuth();

  const { data: matches = [], isLoading: isLoadingMatches } = useQuery<Match[]>({
    queryKey: ["/api/matches"],
  });

  const { data: projects = [], isLoading: isLoadingProjects } = useQuery<Project[]>({
    queryKey: ["/api/projects"],
  });

  const { data: profiles } = useQuery<User[]>({
    queryKey: ["/api/users/search"],
    enabled: user?.role === 'project_owner',
  });

  const matchedProjects = projects?.filter(project =>
    matches?.some(match => match.projectId === project.id && match.status === "accepted")
  );

  if (user?.role === 'project_owner') {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Bienvenue, {user?.fullName}</h1>
              <p className="text-gray-600">Trouvez les meilleurs talents pour vos projets</p>
            </div>
            <div className="flex gap-4">
              {user.role === 'project_owner' && (
                <>
                  <Button variant="outline" asChild>
                    <Link href="/new-project" className="flex items-center gap-2">
                      <PlusCircle className="h-4 w-4" />
                      Nouvelle annonce
                    </Link>
                  </Button>
                  {!user.isPremium && (
                    <Button variant="outline" className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-white hover:from-yellow-500 hover:to-yellow-700" asChild>
                      <Link href="/subscribe">Devenir Premium</Link>
                    </Button>
                  )}
                </>
              )}
            </div>
          </div>

          <AdvancedProfileFilters onFilterChange={() => {}} isPremium={user.isPremium || false} />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Profils consultés</CardTitle>
                <UserCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">0</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Projets actifs</CardTitle>
                <Briefcase className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{projects?.length || 0}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Type de compte</CardTitle>
                <Star className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{user?.isPremium ? "Premium" : "Basic"}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Profils correspondants</CardTitle>
                <SearchCode className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{profiles?.length || 0}</div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  // Vue pour les chercheurs de projet
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Bienvenue, {user?.fullName}</h1>
            <p className="text-gray-600">Trouvez et connectez-vous avec des projets passionnants</p>
          </div>
          <div className="flex gap-4">
            <Button asChild>
              <Link href="/swipe">Commencer à matcher</Link>
            </Button>
            {!user?.isPremium && (
              <Button variant="outline" className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-white hover:from-yellow-500 hover:to-yellow-700" asChild>
                <Link href="/subscribe">Devenir Premium</Link>
              </Button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Matchs totaux</CardTitle>
              <Star className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{matchedProjects?.length || 0}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Statut du profil</CardTitle>
              <UserCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{user?.isVerified ? "Vérifié" : "Non vérifié"}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Type de compte</CardTitle>
              <SearchCode className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{user?.isPremium ? "Premium" : "Basic"}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Projets actifs</CardTitle>
              <Briefcase className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{projects?.length || 0}</div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-900">Vos projets matchés</h2>
          {matchedProjects?.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-center text-gray-600">
                <p>Pas encore de projets matchés. Commencez à swiper pour trouver votre prochaine opportunité !</p>
                <Button className="mt-4" asChild>
                  <Link href="/swipe">Aller au swipe</Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {matchedProjects?.map(project => (
                <ProjectCard key={project.id} project={project} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}