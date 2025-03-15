import { z } from "zod";

export const PROJECT_CATEGORIES = [
  { value: "tech", label: "Informatique et technologie" },
  { value: "mobile", label: "Application mobile" },
  { value: "web", label: "Site internet" },
  { value: "cloud", label: "Informatique Cloud et Big Data" },
  { value: "ai", label: "Intelligence Artificielle et Machine Learning" },
  { value: "blockchain", label: "Blockchain et Cryptomonnaies" },
  { value: "marketing", label: "Marketing et Publicité" },
  { value: "design", label: "Design et Création" },
  { value: "hr", label: "Ressources humaines" },
  { value: "finance", label: "Finance et Comptabilité" },
  { value: "sales", label: "Vente et Développement Commercial" },
  { value: "health", label: "Santé" },
  { value: "engineering", label: "Ingénierie" },
  { value: "education", label: "Éducation" },
  { value: "legal", label: "Droit" },
  { value: "entrepreneurship", label: "Entrepreneuriat" },
  { value: "architecture", label: "Architecture" },
  { value: "media", label: "Médias et Communication" },
  { value: "logistics", label: "Logistique et Transport" },
  { value: "research", label: "Recherche et développement" },
  { value: "project", label: "Gestion de Projet" },
  { value: "industry", label: "Industrie et Production" },
  { value: "consulting", label: "Conseil" },
  { value: "tourism", label: "Hôtellerie et Tourisme" },
  { value: "agriculture", label: "Agriculture et Agroalimentaire" },
  { value: "energy", label: "Énergie et environnement" },
  { value: "realestate", label: "Immobilier" },
  { value: "culture", label: "Art et Culture" },
  { value: "social", label: "Sciences Sociales" },
  { value: "telecom", label: "Télécommunications" },
  { value: "security", label: "Sécurité et Défense" },
  { value: "public", label: "Administration publique" },
  { value: "biotech", label: "Biotechnologie et Pharmaceutique" },
  { value: "sports", label: "Sports et Loisirs" },
  { value: "robotics", label: "Robotique"},
  { value: "pr", label: "Relations Publiques"},
  { value: "transport", label: "Transports et Mobilité"},
  { value: "medical", label: "Médical et paramédical"},
  { value: "it", label: "Systèmes d'information"},
  { value: "retail", label: "Commerce de détail"},
  { value: "food", label: "Restauration"},
  { value: "fashion", label: "Mode et Textile"},
  { value: "trade", label: "Commerce international"},
  { value: "ecommerce", label: "Commerce électronique"},
  { value: "gaming", label: "Jeux vidéo et eSports"},
  { value: "social_media", label: "Réseaux Sociaux et Influenceurs"},
  { value: "aerospace", label: "Aéronautique et Spatiale"}
] as const;

export const SKILLS_BY_CATEGORY: Record<string, string[]> = {
  tech: [
    "Python",
    "Java",
    "C++",
    "Cybersécurité",
    "Bases de données SQL",
    "Bases de données NoSQL",
    "Linux",
    "Windows",
    "DevOps",
    "Automatisation"
  ],
  web: [
    "HTML/CSS",
    "JavaScript",
    "React.js",
    "Node.js",
    "TypeScript",
    "Vue.js",
    "Angular",
    "PHP",
    "WordPress"
  ],
  mobile: [
    "React Native",
    "Flutter",
    "iOS (Swift)",
    "Android (Kotlin)",
    "UI/UX Mobile",
    "Tests Mobile",
    "Performance Mobile"
  ],
  cloud: [
    "AWS",
    "Azure",
    "Google Cloud",
    "Gestion d'infrastructure cloud",
    "Analyse de données massives",
    "Sécurité des données"
  ],
  ai: [
    "Machine Learning",
    "Deep Learning",
    "TensorFlow",
    "PyTorch",
    "NLP",
    "Computer Vision",
    "Data Science"
  ],
  design: [
    "UX/UI Design",
    "Photoshop",
    "Illustrator",
    "Figma",
    "Motion Design",
    "Typographie",
    "Modélisation 3D",
    "Blender",
    "Maya"
  ],
  marketing: [
    "SEO",
    "SEA",
    "Marketing Digital",
    "Social Media",
    "Content Marketing",
    "Google Ads",
    "Analytics",
    "Branding",
    "Copywriting"
  ],
  hr: [
    "Recrutement",
    "Gestion des talents",
    "Droit du travail",
    "Formation",
    "GPEC",
    "Administration RH",
    "Paie"
  ],
  finance: [
    "Analyse financière",
    "Comptabilité",
    "Contrôle de gestion",
    "Audit",
    "Trading",
    "Gestion de portefeuille",
    "Blockchain"
  ],
  engineering: [
    "CAD",
    "SolidWorks",
    "Mathématiques appliquées",
    "Physique",
    "Robotique",
    "Matériaux",
    "Procédés industriels"
  ],
  media: [
    "Journalisme",
    "Storytelling",
    "Relations presse",
    "Production audiovisuelle",
    "Montage vidéo",
    "Animation"
  ],
  project: [
    "Méthodologie Agile",
    "Scrum",
    "MS Project",
    "Jira",
    "Trello",
    "Gestion des risques",
    "Planification"
  ]
};

// Schema pour la validation des projets
export const projectSchema = z.object({
  title: z.string().min(1, "Le titre est requis"),
  description: z.string().min(1, "La description est requise"),
  category: z.string().min(1, "La catégorie est requise"),
  duration: z.string().min(1, "La durée est requise"),
  requiredSkills: z.array(z.string()),
  collaborationType: z.string().min(1, "Le type de collaboration est requis"),
});