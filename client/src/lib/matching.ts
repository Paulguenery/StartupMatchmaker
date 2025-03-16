import { apiRequest } from "./queryClient";

export interface MatchResult {
  id: number;
  userId: number;
  projectId: number;
  status: 'pending' | 'matched' | 'passed';
  createdAt: string;
}

export interface Project {
  id: number;
  title: string;
  description: string;
  sector: string;
  location: {
    latitude: number;
    longitude: number;
    city: string;
    department: string;
  };
  distance?: number;
}

// Fonction pour liker ou passer un projet
export async function matchWithProject(projectId: number, action: 'like' | 'pass'): Promise<MatchResult> {
  const response = await apiRequest("POST", "/api/matches", { projectId, action });
  return response.json();
}

// Fonction pour obtenir les suggestions de projets basées sur la localisation
export async function getSuggestedProjects(latitude: number, longitude: number): Promise<Project[]> {
  const response = await apiRequest(
    "GET", 
    `/api/projects/suggestions?latitude=${latitude}&longitude=${longitude}`
  );
  return response.json();
}

// Fonction pour récupérer les matches d'un utilisateur
export async function getUserMatches(): Promise<MatchResult[]> {
  const response = await apiRequest("GET", "/api/matches");
  return response.json();
}

// Fonction pour rechercher des projets avec filtres
export async function searchProjects(params: {
  sector?: string;
  distance?: number;
  latitude?: number;
  longitude?: number;
}): Promise<Project[]> {
  const searchParams = new URLSearchParams();
  if (params.sector) searchParams.append('sector', params.sector);
  if (params.distance) searchParams.append('distance', params.distance.toString());
  if (params.latitude) searchParams.append('latitude', params.latitude.toString());
  if (params.longitude) searchParams.append('longitude', params.longitude.toString());

  const response = await apiRequest("GET", `/api/projects?${searchParams.toString()}`);
  return response.json();
}