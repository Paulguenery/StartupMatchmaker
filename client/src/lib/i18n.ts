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
      location: "Location",
      distance: "Distance",
      noProjects: "No projects found",
      discoverProjects: "Discover Projects",
      swipeInstructions: "Swipe right for projects you're interested in",
      enableLocation: "Enable location to see projects near you",
      noMoreProjects: "No more projects to display for now!",
      checkBackLater: "Check back later to discover new projects",
      loadingLocation: "Getting your location...",
      loadingProjects: "Searching for projects near you...",
      projectLoadError: "An error occurred while loading projects",

      // Filters
      filters: "Filters",
      locationFilters: "Location Filters",
      searchRadius: "Search Radius",
      city: "City",
      postalCode: "Postal Code",
      department: "Department",

      // Actions
      submit: "Submit",
      cancel: "Cancel",
      save: "Save",
      delete: "Delete",
      edit: "Edit",
      like: "Like",
      pass: "Pass",

      // Messages
      loading: "Loading...",
      error: "An error occurred",
      success: "Success",
      locationError: "Could not get your location. Some features may be limited.",
      swipeError: "Could not process your action.",
      matchSuccess: "Great!",
      matchNotification: "You liked this project. You'll be notified if it's a match!",

      // Notifications
      notificationTitle: "New Match!",
      notificationBody: "Someone liked your project",
      enableNotifications: "Enable Notifications",
    },
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
      location: "Localisation",
      distance: "Distance",
      noProjects: "Aucun projet trouvé",
      discoverProjects: "Découvrir des projets",
      swipeInstructions: "Swipez à droite pour les projets qui vous intéressent",
      enableLocation: "Activez la géolocalisation pour voir les projets près de chez vous",
      noMoreProjects: "Plus de projets à afficher pour le moment !",
      checkBackLater: "Revenez plus tard pour découvrir de nouveaux projets",
      loadingLocation: "Récupération de votre position...",
      loadingProjects: "Recherche des projets près de chez vous...",
      projectLoadError: "Une erreur est survenue lors du chargement des projets",

      // Filters
      filters: "Filtres",
      locationFilters: "Filtres de localisation",
      searchRadius: "Rayon de recherche",
      city: "Ville",
      postalCode: "Code postal",
      department: "Département",

      // Actions
      submit: "Valider",
      cancel: "Annuler",
      save: "Enregistrer",
      delete: "Supprimer",
      edit: "Modifier",
      like: "J'aime",
      pass: "Passer",

      // Messages
      loading: "Chargement...",
      error: "Une erreur est survenue",
      success: "Succès",
      locationError: "Impossible d'obtenir votre position. Certaines fonctionnalités peuvent être limitées.",
      swipeError: "Impossible de traiter votre action.",
      matchSuccess: "Super !",
      matchNotification: "Vous avez liké ce projet. Vous serez notifié si c'est un match !",

      // Notifications
      notificationTitle: "Nouveau Match !",
      notificationBody: "Quelqu'un a aimé votre projet",
      enableNotifications: "Activer les notifications",
    },
  },
};

i18n.use(initReactI18next).init({
  resources,
  lng: "fr", // Langue par défaut
  fallbackLng: "en",
  interpolation: { escapeValue: false },
});

export default i18n;