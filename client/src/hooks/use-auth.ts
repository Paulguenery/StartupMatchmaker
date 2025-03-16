import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useLocation } from "wouter";

type User = {
  id: number;
  email: string;
  role: string;
  currentRole?: string;
  fullName?: string;
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
      await apiRequest("POST", "/api/logout");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
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

  const updateRoleMutation = useMutation({
    mutationFn: async (role: string) => {
      const res = await apiRequest("PATCH", "/api/user/role", { role });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
    },
  });

  // Déterminer le rôle effectif
  const effectiveRole = user?.currentRole || user?.role;
  const isProjectOwner = effectiveRole === "project_owner";
  const isProjectSeeker = effectiveRole === "project_seeker";
  const isAdmin = user?.role === "admin";

  return {
    user,
    isProjectOwner,
    isProjectSeeker,
    isAdmin,
    loginMutation,
    logoutMutation,
    registerMutation,
    updateRoleMutation,
  };
}
