import i18n from "i18next";
import { initReactI18next } from "react-i18next";

const resources = {
  en: {
    translation: {
      // Auth
      welcome: "Welcome to MyMate",
      login: "Login",
      register: "Register",
      email: "Email",
      password: "Password",
      fullName: "Full Name",

      // Projects
      search: "Search",
      searchProjects: "Search Projects",
      projectDetails: "Project Details",
      sector: "Sector",
      sectors: {
        technology: "Technology",
        business: "Business",
        creative: "Creative",
        other: "Other"
      },
      duration: "Duration",
      durations: {
        short: "Short term (< 3 months)",
        medium: "Medium term (3-6 months)",
        long: "Long term (> 6 months)"
      },
      location: "Location",
      distance: "Distance",
      maxDistance: "Maximum Distance",
      noProjects: "No projects found",

      // Advanced Filters
      filters: "Filters",
      advancedFilters: "Advanced Filters",
      selectSector: "Select a sector",
      selectDuration: "Select duration",
      projectsFound: "projects found",
      applyFilters: "Apply Filters",
      resetFilters: "Reset Filters",

      // Actions and Messages
      apply: "Apply",
      reset: "Reset",
      searching: "Searching...",
      noResults: "No results found",
      tryAdjusting: "Try adjusting your filters",
    }
  },
  fr: {
    translation: {
      // Auth
      welcome: "Bienvenue sur MyMate",
      login: "Connexion",
      register: "Inscription",
      email: "Email",
      password: "Mot de passe",
      fullName: "Nom complet",

      // Projects
      search: "Rechercher",
      searchProjects: "Rechercher des projets",
      projectDetails: "Détails du projet",
      sector: "Secteur",
      sectors: {
        technology: "Technologie",
        business: "Business",
        creative: "Créatif",
        other: "Autre"
      },
      duration: "Durée",
      durations: {
        short: "Court terme (< 3 mois)",
        medium: "Moyen terme (3-6 mois)",
        long: "Long terme (> 6 mois)"
      },
      location: "Localisation",
      distance: "Distance",
      maxDistance: "Distance maximale",
      noProjects: "Aucun projet trouvé",

      // Advanced Filters
      filters: "Filtres",
      advancedFilters: "Filtres avancés",
      selectSector: "Sélectionner un secteur",
      selectDuration: "Sélectionner une durée",
      projectsFound: "projets trouvés",
      applyFilters: "Appliquer les filtres",
      resetFilters: "Réinitialiser les filtres",

      // Actions and Messages
      apply: "Appliquer",
      reset: "Réinitialiser",
      searching: "Recherche en cours...",
      noResults: "Aucun résultat trouvé",
      tryAdjusting: "Essayez d'ajuster vos filtres"
    }
  }
};

i18n.use(initReactI18next).init({
  resources,
  lng: "fr", // Langue par défaut
  fallbackLng: "en",
  interpolation: { escapeValue: false },
});

export default i18n;