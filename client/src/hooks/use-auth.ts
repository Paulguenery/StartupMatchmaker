import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useLocation } from "wouter";

type User = {
  id: number;
  email: string;
  role: string;
  fullName?: string;
  isPremium?: boolean;
};

export function useAuth() {
  const [, setLocation] = useLocation();

  const { data: user } = useQuery<User>({
    queryKey: ["/api/user"],
    retry: false,
    refetchOnWindowFocus: true,
  });

  const loginMutation = useMutation({
    mutationFn: async (data: { email: string; password: string }) => {
      const res = await apiRequest("POST", "/api/login", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      setLocation("/");
    },
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/logout");
      if (!res.ok) {
        throw new Error('Échec de la déconnexion');
      }
      return res;
    },
    onSuccess: () => {
      queryClient.clear();
      setLocation("/auth");
    },
    onError: () => {
      queryClient.clear();
      setLocation("/auth");
    },
  });

  const registerMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("POST", "/api/register", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      setLocation("/");
    },
  });

  // Détermine les accès et rôles
  const isProjectOwner = user?.role === "project_owner";
  const isProjectSeeker = user?.role === "project_seeker";
  const isAdmin = user?.role === "admin";

  // Les porteurs de projet et les admins ont automatiquement accès aux fonctionnalités premium
  const isPremium = user?.isPremium || isProjectOwner || isAdmin;

  return {
    user,
    isProjectOwner,
    isProjectSeeker,
    isAdmin,
    isPremium,
    loginMutation,
    logoutMutation,
    registerMutation,
  };
}