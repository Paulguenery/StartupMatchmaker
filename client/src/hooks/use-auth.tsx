import { createContext, ReactNode, useContext } from "react";
import {
  useQuery,
  useMutation,
  UseMutationResult,
} from "@tanstack/react-query";
import { insertUserSchema, User as SelectUser, InsertUser } from "@shared/schema";
import { getQueryFn, apiRequest, queryClient } from "../lib/queryClient";
import { useToast } from "@/hooks/use-toast";

type AuthContextType = {
  user: SelectUser | null;
  isLoading: boolean;
  error: Error | null;
  loginMutation: UseMutationResult<SelectUser, Error, LoginData>;
  logoutMutation: UseMutationResult<void, Error, void>;
  registerMutation: UseMutationResult<SelectUser, Error, InsertUser>;
};

type LoginData = {
  email: string;
  password: string;
};

export const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();

  const {
    data: user,
    error,
    isLoading,
  } = useQuery<SelectUser | undefined, Error>({
    queryKey: ["/api/user"],
    queryFn: getQueryFn({ on401: "returnNull" }),
    retry: 0,
  });

  const loginMutation = useMutation({
    mutationFn: async (credentials: LoginData) => {
      console.log("Tentative de connexion avec:", credentials.email);
      const res = await apiRequest("POST", "/api/login", credentials);
      const data = await res.json();

      if (!res.ok) {
        console.error("Erreur de connexion:", data);
        throw new Error(data.message || "Erreur de connexion");
      }

      return data;
    },
    onSuccess: (user: SelectUser) => {
      console.log("Connexion réussie pour:", user.email);
      queryClient.setQueryData(["/api/user"], user);
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      toast({
        title: "Connexion réussie",
        description: `Bienvenue ${user.fullName}`,
      });
    },
    onError: (error: Error) => {
      console.error("Erreur de connexion:", error);
      toast({
        title: "Échec de la connexion",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const registerMutation = useMutation({
    mutationFn: async (credentials: InsertUser) => {
      console.log("Tentative d'inscription pour:", credentials.email);
      const res = await apiRequest("POST", "/api/register", credentials);
      const data = await res.json();

      if (!res.ok) {
        console.error("Erreur d'inscription:", data);
        throw new Error(data.message || "Erreur lors de l'inscription");
      }

      return data;
    },
    onSuccess: (user: SelectUser) => {
      console.log("Inscription réussie pour:", user.email);
      queryClient.setQueryData(["/api/user"], user);
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      toast({
        title: "Inscription réussie",
        description: "Votre compte a été créé avec succès",
      });
    },
    onError: (error: Error) => {
      console.error("Erreur d'inscription:", error);
      toast({
        title: "Échec de l'inscription",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/logout");
      if (!res.ok) {
        throw new Error("Erreur lors de la déconnexion");
      }
    },
    onSuccess: () => {
      console.log("Déconnexion réussie");
      queryClient.setQueryData(["/api/user"], null);
      queryClient.clear();
      toast({
        title: "Déconnexion réussie",
        description: "À bientôt !",
      });
    },
    onError: (error: Error) => {
      console.error("Erreur de déconnexion:", error);
      toast({
        title: "Échec de la déconnexion",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return (
    <AuthContext.Provider
      value={{
        user: user ?? null,
        isLoading,
        error,
        loginMutation,
        logoutMutation,
        registerMutation,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}