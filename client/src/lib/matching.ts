import { apiRequest } from "./queryClient";
import { getDistance } from "geolib";

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
    postalCode?: string;
  };
  distance?: number;
}

// Calcul de distance amélioré utilisant geolib
export function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const distanceInMeters = getDistance(
    { latitude: lat1, longitude: lon1 },
    { latitude: lat2, longitude: lon2 }
  );
  return distanceInMeters / 1000; // Convertir en kilomètres
}

export function filterProjectsByLocation(
  projects: Project[],
  filters: {
    userLat: number;
    userLon: number;
    maxDistance?: number;
    city?: string;
    postalCode?: string;
    department?: string;
  }
): Project[] {
  return projects
    .map(project => {
      if (!project.location) return { ...project, distance: null };

      const distance = calculateDistance(
        filters.userLat,
        filters.userLon,
        project.location.latitude,
        project.location.longitude
      );

      return { ...project, distance };
    })
    .filter(project => {
      // Filtrer par distance si spécifié
      if (filters.maxDistance && project.distance) {
        if (project.distance > filters.maxDistance) return false;
      }

      // Filtrer par ville si spécifié
      if (filters.city && project.location.city) {
        if (!project.location.city.toLowerCase().includes(filters.city.toLowerCase())) {
          return false;
        }
      }

      // Filtrer par code postal si spécifié
      if (filters.postalCode && project.location.postalCode) {
        if (project.location.postalCode !== filters.postalCode) {
          return false;
        }
      }

      // Filtrer par département si spécifié
      if (filters.department && project.location.department) {
        if (project.location.department !== filters.department) {
          return false;
        }
      }

      return true;
    })
    .sort((a, b) => {
      if (a.distance === null) return 1;
      if (b.distance === null) return -1;
      return a.distance - b.distance;
    });
}

// Fonction pour liker ou passer un projet
export async function matchWithProject(projectId: number, action: 'like' | 'pass'): Promise<MatchResult> {
  const response = await apiRequest("POST", "/api/matches", { projectId, action });
  return response.json();
}

// Fonction pour obtenir les suggestions de projets basées sur la localisation
export async function getSuggestedProjects(
  latitude: number, 
  longitude: number, 
  distance: number,
  city?: string,
  postalCode?: string,
  department?: string
): Promise<Project[]> {
  const params = new URLSearchParams({
    latitude: latitude.toString(),
    longitude: longitude.toString(),
    distance: distance.toString()
  });

  if (city?.trim()) params.append('city', city.trim());
  if (postalCode?.trim()) params.append('postalCode', postalCode.trim());
  if (department?.trim()) params.append('department', department.trim());

  try {
    const response = await apiRequest("GET", `/api/projects/suggestions?${params.toString()}`);
    const projects = await response.json();
    return filterProjectsByLocation(projects, {
      userLat: latitude,
      userLon: longitude,
      maxDistance: distance,
      city,
      postalCode,
      department
    });
  } catch (error) {
    console.error('Erreur dans getSuggestedProjects:', error);
    throw error;
  }
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
  city?: string;
  postalCode?: string;
  department?: string;
  latitude?: number;
  longitude?: number;
}): Promise<Project[]> {
  const searchParams = new URLSearchParams();
  if (params.sector) searchParams.append('sector', params.sector);
  if (params.distance) searchParams.append('distance', params.distance.toString());
  if (params.city) searchParams.append('city', params.city);
  if (params.postalCode) searchParams.append('postalCode', params.postalCode);
  if (params.department) searchParams.append('department', params.department);
  if (params.latitude) searchParams.append('latitude', params.latitude.toString());
  if (params.longitude) searchParams.append('longitude', params.longitude.toString());

  const response = await apiRequest("GET", `/api/projects?${searchParams.toString()}`);
  const projects = await response.json();

  if (params.latitude && params.longitude) {
    return filterProjectsByLocation(projects, {
      userLat: params.latitude,
      userLon: params.longitude,
      maxDistance: params.distance,
      city: params.city,
      postalCode: params.postalCode,
      department: params.department
    });
  }

  return projects;
}