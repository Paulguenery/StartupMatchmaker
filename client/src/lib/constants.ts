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
  blockchain: [
    "Smart contracts",
    "NFT",
    "Sécurité et cryptographie",
    "Finances décentralisées (DeFi)",
    "Web3",
    "Ethereum",
    "Solidity"
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
  sales: [
    "Prospection",
    "Négociation commerciale",
    "CRM",
    "Stratégies de vente",
    "Closing",
    "Analyse de marché",
    "Fidélisation client"
  ],
  health: [
    "Connaissances médicales",
    "Gestion des dossiers patients",
    "Protocoles d'urgence",
    "Bioéthique",
    "Technologies médicales",
    "Confidentialité"
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
  education: [
    "Pédagogie",
    "Méthodologie d'enseignement",
    "Psychologie cognitive",
    "Outils numériques éducatifs",
    "Communication adaptative"
  ],
  legal: [
    "Droit national",
    "Droit international",
    "Rédaction juridique",
    "Plaidoyer",
    "Gestion des litiges",
    "Médiation"
  ],
  entrepreneurship: [
    "Business model",
    "Planification stratégique",
    "Gestion financière",
    "Levée de fonds",
    "Leadership",
    "Growth hacking"
  ],
  architecture: [
    "AutoCAD",
    "SketchUp",
    "Normes urbaines",
    "Maquette numérique",
    "BIM",
    "Écoconstruction"
  ],
  media: [
    "Journalisme",
    "Storytelling",
    "Relations presse",
    "Production audiovisuelle",
    "Montage vidéo",
    "Animation",
    "Gestion des réseaux sociaux"
  ],
  logistics: [
    "Gestion des flux",
    "Chaîne d'approvisionnement",
    "Transport international",
    "Douanes",
    "Gestion des fournisseurs"
  ],
  research: [
    "Veille technologique",
    "Innovation",
    "Méthodologie scientifique",
    "Expérimentation",
    "Tests"
  ],
  project: [
    "Méthodologie Agile",
    "Scrum",
    "MS Project",
    "Jira",
    "Trello",
    "Gestion des risques",
    "Planification"
  ],
  industry: [
    "Processus de fabrication",
    "Maintenance industrielle",
    "Automatisation",
    "Lean management",
    "Qualité"
  ],
  consulting: [
    "Stratégie d'entreprise",
    "Analyse des besoins",
    "Diagnostic",
    "Gestion du changement",
    "Conseil en organisation"
  ],
  tourism: [
    "Accueil client",
    "Gestion des réservations",
    "Événementiel",
    "Marketing touristique",
    "Relations clients"
  ],
  agriculture: [
    "Techniques agricoles modernes",
    "Normes alimentaires",
    "Sécurité alimentaire",
    "Agriculture durable",
    "Agroécologie"
  ],
  energy: [
    "Énergies renouvelables",
    "Bilan carbone",
    "Éco-conception",
    "Réglementations environnementales",
    "Gestion énergétique"
  ],
  realestate: [
    "Estimation immobilière",
    "Négociation immobilière",
    "Droit immobilier",
    "Gestion locative",
    "Transactions"
  ],
  culture: [
    "Création artistique",
    "Performance",
    "Gestion de projets culturels",
    "Histoire de l'art",
    "Patrimoine"
  ],
  social: [
    "Analyse comportementale",
    "Recherche sociale",
    "Communication",
    "Médiation",
    "Études sociologiques"
  ],
  telecom: [
    "Réseaux",
    "Protocoles de communication",
    "Sécurité des infrastructures",
    "5G",
    "Innovations réseau"
  ],
  security: [
    "Cyberdéfense",
    "Sécurité informatique",
    "Gestion de crise",
    "Protection des populations",
    "Renseignement"
  ],
  public: [
    "Droit administratif",
    "Finances publiques",
    "Relations institutionnelles",
    "Politiques publiques",
    "Administration"
  ],
  biotech: [
    "Bio-informatique",
    "Génomique",
    "Recherche clinique",
    "Réglementations médicales",
    "Développement médicaments"
  ],
  sports: [
    "Coaching",
    "Préparation physique",
    "Gestion d'événements sportifs",
    "Psychologie du sport",
    "Performance"
  ]
};

// Mock profiles for testing
export const MOCK_PROFILES = [
  {
    id: 1,
    fullName: "Sophie Martin",
    experienceLevel: "senior",
    skills: ["React.js", "TypeScript", "Node.js"],
    location: {
      city: "Paris",
      department: "Île-de-France",
      latitude: 48.8566,
      longitude: 2.3522
    },
    availability: "immediate",
    collaborationType: "full_time"
  },
  {
    id: 2,
    fullName: "Thomas Dubois",
    experienceLevel: "intermediate",
    skills: ["Python", "Machine Learning", "Data Science"],
    location: {
      city: "Lyon",
      department: "Rhône",
      latitude: 45.7578,
      longitude: 4.8320
    },
    availability: "one_month",
    collaborationType: "part_time"
  },
  {
    id: 3,
    fullName: "Marie Laurent",
    experienceLevel: "junior",
    skills: ["UI/UX Design", "Figma", "Adobe XD"],
    location: {
      city: "Bordeaux",
      department: "Gironde",
      latitude: 44.8378,
      longitude: -0.5792
    },
    availability: "three_months",
    collaborationType: "full_time"
  },
  {
    id: 4,
    fullName: "Lucas Bernard",
    experienceLevel: "senior",
    skills: ["Java", "Spring Boot", "DevOps"],
    location: {
      city: "Toulouse",
      department: "Haute-Garonne",
      latitude: 43.6047,
      longitude: 1.4442
    },
    availability: "immediate",
    collaborationType: "part_time"
  },
  {
    id: 5,
    fullName: "Emma Petit",
    experienceLevel: "intermediate",
    skills: ["Marketing Digital", "SEO", "Social Media"],
    location: {
      city: "Nantes",
      department: "Loire-Atlantique",
      latitude: 47.2184,
      longitude: -1.5536
    },
    availability: "one_month",
    collaborationType: "full_time"
  }
];

// Ajout du schema de validation du projet sans la durée
export const projectSchema = z.object({
  title: z.string().min(1, "Le titre est requis"),
  description: z.string().min(1, "La description est requise"),
  category: z.string().min(1, "La catégorie est requise"),
  requiredSkills: z.array(z.string()),
  collaborationType: z.string().min(1, "Le type de collaboration est requis"),
});