import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { User } from "@shared/schema";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { BriefcaseIcon, MapPinIcon, Check, X, Loader2 } from "lucide-react";
import { useState } from "react";
import { MOCK_PROFILES } from "@/lib/constants";
import { motion, AnimatePresence } from "framer-motion";

export default function SwipeProfilesPage() {
  const { user } = useAuth();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState<string | null>(null);

  // Pour le moment, on utilise les profils mock
  const { data: profiles = MOCK_PROFILES, isLoading } = useQuery<User[]>({
    queryKey: ["/api/users/search"],
    enabled: user?.role === 'project_owner',
  });

  const currentProfile = profiles[currentIndex];

  const handleSwipe = (swipeDirection: string) => {
    setDirection(swipeDirection);
    // Ici, vous pouvez ajouter la logique pour gérer les likes/dislikes
    setTimeout(() => {
      setDirection(null);
      setCurrentIndex(prev => prev + 1);
    }, 300);
  };

  if (!user || user.role !== 'project_owner') {
    return null;
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (currentIndex >= profiles.length) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <h2 className="text-2xl font-bold mb-4">Plus de profils disponibles !</h2>
        <p className="text-gray-600 mb-8">Revenez plus tard pour découvrir de nouveaux talents.</p>
        <Button onClick={() => setCurrentIndex(0)}>
          Recommencer
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-2xl mx-auto space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">Découvrez des talents</h1>
          <p className="text-gray-600">Swipez pour trouver les meilleurs profils</p>
        </div>

        <div className="relative h-[600px]">
          <AnimatePresence>
            {currentProfile && (
              <motion.div
                key={currentProfile.id}
                initial={{ scale: 1 }}
                animate={{
                  x: direction === "right" ? 1000 : direction === "left" ? -1000 : 0,
                  scale: direction ? 1.1 : 1,
                }}
                exit={{ scale: 0.5, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="absolute w-full"
              >
                <Card className="overflow-hidden">
                  <CardContent className="p-6 space-y-6">
                    <div className="flex items-start space-x-4">
                      <Avatar className="h-16 w-16">
                        <AvatarImage src={currentProfile.profilePicture || ''} />
                        <AvatarFallback>{currentProfile.fullName?.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="text-2xl font-semibold">{currentProfile.fullName}</h3>
                        <p className="text-gray-500 flex items-center gap-1">
                          <BriefcaseIcon className="h-4 w-4" />
                          {currentProfile.experienceLevel}
                        </p>
                        {currentProfile.location && (
                          <p className="text-gray-500 flex items-center gap-1">
                            <MapPinIcon className="h-4 w-4" />
                            {currentProfile.location.city}
                          </p>
                        )}
                      </div>
                    </div>

                    {currentProfile.skills && (
                      <div>
                        <h4 className="font-medium mb-2">Compétences</h4>
                        <div className="flex flex-wrap gap-2">
                          {currentProfile.skills.map(skill => (
                            <span
                              key={skill}
                              className="px-3 py-1 bg-gray-100 rounded-full text-sm text-gray-700"
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="flex justify-center gap-4">
          <Button
            size="lg"
            variant="outline"
            className="rounded-full h-16 w-16"
            onClick={() => handleSwipe("left")}
          >
            <X className="h-8 w-8 text-red-500" />
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="rounded-full h-16 w-16"
            onClick={() => handleSwipe("right")}
          >
            <Check className="h-8 w-8 text-green-500" />
          </Button>
        </div>
      </div>
    </div>
  );
}
