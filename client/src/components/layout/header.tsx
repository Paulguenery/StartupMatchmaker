import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Link, useLocation } from "wouter";
import { ArrowLeft, Menu, User, List } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export function Header() {
  const [location] = useLocation();
  const { user, updateRoleMutation } = useAuth();

  const showBackButton = location !== "/" && location !== "/auth";

  if (!user || location === "/auth") return null;

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur">
      <div className="container flex h-14 items-center">
        <div className="flex flex-1 items-center justify-between">
          <div>
            {showBackButton && (
              <Button variant="ghost" size="icon" asChild>
                <Link href="/">
                  <ArrowLeft className="h-5 w-5" />
                </Link>
              </Button>
            )}
          </div>

          <div className="flex items-center gap-4">
            {user.role === 'admin' && (
              <Select 
                value={user.currentRole || 'project_owner'} 
                onValueChange={(value) => updateRoleMutation.mutate(value)}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Sélectionner un rôle" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="project_owner">Porteur de projet</SelectItem>
                  <SelectItem value="project_seeker">Chercheur de projet</SelectItem>
                </SelectContent>
              </Select>
            )}

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                  <Link href="/profile" className="flex items-center">
                    <User className="h-4 w-4 mr-2" />
                    Mon profil
                  </Link>
                </DropdownMenuItem>

                {(user.role === 'project_owner' || user.currentRole === 'project_owner') && (
                  <DropdownMenuItem asChild>
                    <Link href="/my-projects" className="flex items-center">
                      <List className="h-4 w-4 mr-2" />
                      Mes projets
                    </Link>
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  );
}