import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useLocation } from "wouter";
import { createContext, useContext, ReactNode } from "react";

interface AuthContextType {
  user: any;
  isProjectOwner: boolean;
  isProjectSeeker: boolean;
  isAdmin: boolean;
  loginMutation: any;
  logoutMutation: any;
  registerMutation: any;
  updateRoleMutation: any;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [, setLocation] = useLocation();

  const { data: user } = useQuery({
    queryKey: ["/api/user"],
    retry: false,
    refetchOnWindowFocus: true,
  });

  const loginMutation = useMutation({
    mutationFn: async (data: any) => {
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

  // Helper pour déterminer le rôle effectif
  const effectiveRole = user?.currentRole || user?.role;
  const isProjectOwner = effectiveRole === "project_owner";
  const isProjectSeeker = effectiveRole === "project_seeker";
  const isAdmin = user?.role === "admin";

  const value = {
    user,
    isProjectOwner,
    isProjectSeeker,
    isAdmin,
    loginMutation,
    logoutMutation,
    registerMutation,
    updateRoleMutation,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}