import i18n from "i18next";
import { initReactI18next } from "react-i18next";

const resources = {
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

      // Search
      searchProfiles: "Rechercher des talents",
      findTalents: "Trouvez les meilleurs talents",
      filters: "Filtres",
      advancedFilters: "Filtres avancés",

      // Filter Components
      location: "Localisation",
      city: "Ville",
      searchCity: "Rechercher une ville...",
      noCity: "Aucune ville trouvée",
      skills: "Compétences",
      selectSkills: "Sélectionner des compétences",
      experienceLevel: "Niveau d'expérience",
      levels: {
        motivated: "Motivé et prêt à apprendre",
        junior: "Junior",
        intermediate: "Intermédiaire",
        senior: "Senior"
      },
      availability: "Disponibilité",
      availabilities: {
        immediate: "Immédiate",
        oneMonth: "Sous 1 mois",
        threeMonths: "Sous 3 mois"
      },
      collaborationType: "Type de collaboration",
      collaborationTypes: {
        fullTime: "Temps plein",
        partTime: "Temps partiel"
      },
      distance: "Distance",
      maxDistance: "Distance maximale",

      // Actions
      search: "Rechercher",
      apply: "Appliquer",
      reset: "Réinitialiser les filtres",

      // Messages
      loading: "Chargement...",
      noResults: "Aucun résultat trouvé",
      error: "Une erreur est survenue",
      success: "Opération réussie",
    }
  },
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

      // Search
      searchProfiles: "Search Talents",
      findTalents: "Find the best talents",
      filters: "Filters",
      advancedFilters: "Advanced Filters",

      // Filter Components
      location: "Location",
      city: "City",
      searchCity: "Search for a city...",
      noCity: "No city found",
      skills: "Skills",
      selectSkills: "Select skills",
      experienceLevel: "Experience level",
      levels: {
        motivated: "Motivated and ready to learn",
        junior: "Junior",
        intermediate: "Intermediate",
        senior: "Senior"
      },
      availability: "Availability",
      availabilities: {
        immediate: "Immediate",
        oneMonth: "Within 1 month",
        threeMonths: "Within 3 months"
      },
      collaborationType: "Collaboration type",
      collaborationTypes: {
        fullTime: "Full time",
        partTime: "Part time"
      },
      distance: "Distance",
      maxDistance: "Maximum distance",

      // Actions
      search: "Search",
      apply: "Apply",
      reset: "Reset filters",

      // Messages
      loading: "Loading...",
      noResults: "No results found",
      error: "An error occurred",
      success: "Operation successful",
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