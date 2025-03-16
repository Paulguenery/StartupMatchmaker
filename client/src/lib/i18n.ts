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

      // Profile Swipe
      discoverTalents: "Discover Talents",
      swipeToFind: "Swipe to find the best profiles",
      noMoreProfiles: "No more profiles available!",
      comeBackLater: "Come back later to discover new talents.",
      restart: "Start Over",
      swipeRight: "Swipe right to like",
      swipeLeft: "Swipe left to pass",
      skills: "Skills",
      location: "Location",
      experience: "Experience",
      profileDetails: "Profile Details",
      noProfileSelected: "No profile selected",

      // Project Search
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
      distance: "Distance",
      maxDistance: "Maximum Distance",
      noProjects: "No projects found",

      // Profile Search & Filters
      searchProfiles: "Search Profiles",
      findTalents: "Find the best talents",
      experienceLevel: "Experience Level",
      experienceLevels: {
        motivated: "Motivated and ready to learn",
        junior: "Junior",
        intermediate: "Intermediate",
        senior: "Senior"
      },
      availability: "Availability",
      availabilityOptions: {
        immediate: "Immediate",
        oneMonth: "Within 1 month",
        threeMonths: "Within 3 months"
      },
      collaborationType: "Collaboration Type",
      collaborationTypes: {
        all: "All types",
        fullTime: "Full time",
        partTime: "Part time"
      },
      city: "City",
      searchCity: "Search for a city...",
      noCity: "No city found",
      selectSkills: "Select skills",

      // Filters Actions
      filters: "Filters",
      advancedFilters: "Advanced Filters",
      selectSector: "Select a sector",
      selectDuration: "Select duration",
      applyFilters: "Apply Filters",
      resetFilters: "Reset Filters",
      projectsFound: "projects found",
      searching: "Searching...",
      noResults: "No results found",
      tryAdjusting: "Try adjusting your filters"
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

      // Profile Swipe
      discoverTalents: "Découvrez des talents",
      swipeToFind: "Swipez pour trouver les meilleurs profils",
      noMoreProfiles: "Plus de profils disponibles !",
      comeBackLater: "Revenez plus tard pour découvrir de nouveaux talents.",
      restart: "Recommencer",
      swipeRight: "Swipez à droite pour liker",
      swipeLeft: "Swipez à gauche pour passer",
      skills: "Compétences",
      location: "Localisation",
      experience: "Expérience",
      profileDetails: "Détails du profil",
      noProfileSelected: "Aucun profil sélectionné",

      // Project Search
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
      distance: "Distance",
      maxDistance: "Distance maximale",
      noProjects: "Aucun projet trouvé",

      // Profile Search & Filters
      searchProfiles: "Rechercher des talents",
      findTalents: "Trouvez les meilleurs talents",
      experienceLevel: "Niveau d'expérience",
      experienceLevels: {
        motivated: "Motivé et prêt à apprendre",
        junior: "Junior",
        intermediate: "Intermédiaire",
        senior: "Senior"
      },
      availability: "Disponibilité",
      availabilityOptions: {
        immediate: "Immédiate",
        oneMonth: "Sous 1 mois",
        threeMonths: "Sous 3 mois"
      },
      collaborationType: "Type de collaboration",
      collaborationTypes: {
        all: "Tout type",
        fullTime: "Temps plein",
        partTime: "Temps partiel"
      },
      city: "Ville",
      searchCity: "Rechercher une ville...",
      noCity: "Aucune ville trouvée",
      selectSkills: "Sélectionner des compétences",

      // Filters Actions
      filters: "Filtres",
      advancedFilters: "Filtres avancés",
      selectSector: "Sélectionner un secteur",
      selectDuration: "Sélectionner une durée",
      applyFilters: "Appliquer les filtres",
      resetFilters: "Réinitialiser les filtres",
      projectsFound: "projets trouvés",
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