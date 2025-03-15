import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Link, useLocation } from "wouter";
import { ArrowLeft, User } from "lucide-react";

export function Header() {
  const [location] = useLocation();
  const { user } = useAuth();
  
  const showBackButton = location !== "/" && location !== "/auth";

  if (!user || location === "/auth") return null;

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <div className="flex flex-1 items-center justify-between">
          <div className="flex items-center gap-2">
            {showBackButton && (
              <Button variant="ghost" size="icon" asChild>
                <Link href="/">
                  <ArrowLeft className="h-5 w-5" />
                </Link>
              </Button>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" asChild>
              <Link href="/profile">
                <User className="h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
