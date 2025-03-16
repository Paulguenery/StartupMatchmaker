import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { Project } from "@shared/schema";
import { getDistance } from "geolib";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Fonction de nettoyage des messages pour la sécurité
export function sanitizeMessage(message: string): string {
  const patterns = [
    /\b\d{2}[-.\s]?\d{2}[-.\s]?\d{2}[-.\s]?\d{2}\b/g, // Numéros de téléphone
    /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/g, // Emails
    /\b(?:https?|ftp):\/\/[^\s/$.?#].[^\s]*\b/g, // Liens
    /\b(?:\+33|0)\s*[1-9](?:[\s.-]*\d{2}){4}\b/g, // Format international français
  ];

  let sanitizedMessage = message;
  patterns.forEach((pattern) => {
    sanitizedMessage = sanitizedMessage.replace(pattern, "[CONTENU MASQUÉ]");
  });

  return sanitizedMessage;
}

// Interface pour les critères de filtrage avancé
export interface AdvancedFilterCriteria {
  sector?: string;
  duration?: string;
  maxDistance?: number;
  userLocation?: {
    latitude: number;
    longitude: number;
  };
  city?: string;
  postalCode?: string;
  department?: string;
}

// Fonction de filtrage avancé des projets
export function filterProjects(
  projects: Project[],
  criteria: AdvancedFilterCriteria
): Project[] {
  let filteredProjects = [...projects];

  // Filtre par secteur
  if (criteria.sector) {
    filteredProjects = filteredProjects.filter(
      project => project.sector === criteria.sector
    );
  }

  // Filtre par durée (si ajouté au modèle Project)
  if (criteria.duration) {
    filteredProjects = filteredProjects.filter(
      project => (project as any).duration === criteria.duration
    );
  }

  // Filtre par localisation
  if (criteria.userLocation && criteria.maxDistance) {
    filteredProjects = filteredProjects
      .map(project => {
        if (!project.location) return { ...project, distance: undefined };

        const distance = getDistance(
          criteria.userLocation!,
          {
            latitude: project.location.latitude,
            longitude: project.location.longitude
          }
        ) / 1000; // Convertir en kilomètres

        return { ...project, distance };
      })
      .filter(project => {
        if (!project.distance) return false;
        return project.distance <= criteria.maxDistance!;
      });
  }

  // Filtre par ville
  if (criteria.city) {
    filteredProjects = filteredProjects.filter(project =>
      project.location?.city.toLowerCase().includes(criteria.city!.toLowerCase())
    );
  }

  // Filtre par code postal
  if (criteria.postalCode) {
    filteredProjects = filteredProjects.filter(project =>
      project.location?.postalCode?.includes(criteria.postalCode!)
    );
  }

  // Filtre par département
  if (criteria.department) {
    filteredProjects = filteredProjects.filter(project =>
      project.location?.department.includes(criteria.department!)
    );
  }

  // Trier par distance si disponible
  return filteredProjects.sort((a, b) => {
    if (!a.distance) return 1;
    if (!b.distance) return -1;
    return a.distance - b.distance;
  });
}