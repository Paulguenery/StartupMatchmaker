import { pgTable, text, serial, integer, boolean, timestamp, json } from "drizzle-orm/pg-core";
import { z } from "zod";

// Types de documents acceptés pour la vérification
export const documentTypes = {
  PROJECT_OWNER: [
    "business_registration",
    "company_id",
    "professional_license"
  ],
  PROJECT_SEEKER: [
    "id_card",
    "resume",
    "portfolio",
    "professional_certifications"
  ]
} as const;

// Ajout des champs pour gérer les récompenses de parrainage
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  fullName: text("full_name").notNull(),
  bio: text("bio"),
  skills: text("skills").array(),
  isVerified: boolean("is_verified").default(false),
  isPremium: boolean("is_premium").default(false),
  role: text("role").notNull(), // 'project_owner' ou 'project_seeker'
  experienceLevel: text("experience_level"), // 'motivated', 'junior', 'intermediate', 'senior'
  availability: text("availability"), // 'immediate', 'one_month', 'three_months'
  collaborationType: text("collaboration_type"), // 'full_time', 'part_time'
  location: json("location").$type<{
    latitude: number;
    longitude: number;
    city: string;
    department: string;
  }>(),
  referralCode: text("referral_code").unique(), // Code de parrainage unique de l'utilisateur
  referredBy: text("referred_by"), // Code de parrainage utilisé lors de l'inscription
  freeConversationCredits: integer("free_conversation_credits").default(0), // Nombre de conversations gratuites
  premiumDiscount: integer("premium_discount").default(0), // Pourcentage de réduction sur l'abonnement premium
  documents: json("documents").$type<{
    type: keyof typeof documentTypes;
    url: string;
    verified: boolean;
    verifiedAt?: Date;
  }[]>(),
  accountStatus: text("account_status").default("pending"), // 'pending', 'active', 'suspended', 'rejected'
  verificationNotes: text("verification_notes"), // Notes sur la vérification des documents
  lastLoginAttempt: timestamp("last_login_attempt"), // Pour limiter les tentatives de connexion
  createdAt: timestamp("created_at").defaultNow(),
});

// Mise à jour du schéma des relations de parrainage pour inclure plus de détails
export const referrals = pgTable("referrals", {
  id: serial("id").primaryKey(),
  referrerId: integer("referrer_id").notNull(), // ID du parrain
  referredId: integer("referred_id").notNull(), // ID du filleul
  status: text("status").notNull(), // 'pending', 'active', 'completed'
  rewardClaimed: boolean("reward_claimed").default(false), // Si la récompense a été réclamée
  createdAt: timestamp("created_at").defaultNow(),
  activatedAt: timestamp("activated_at"), // Date à laquelle le filleul devient actif
  completedAt: timestamp("completed_at"), // Date à laquelle le filleul devient premium
});

// Schéma pour les relations de parrainage
export const insertReferralSchema = z.object({
  referrerId: z.number().int().min(1),
  referredId: z.number().int().min(1),
  status: z.enum(["pending", "active", "completed"]),
  rewardClaimed: z.boolean().default(false),
});

// Mise à jour du schéma d'insertion avec les nouveaux champs
export const insertUserSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  fullName: z.string().min(1),
  bio: z.string().optional(),
  skills: z.array(z.string()).optional(),
  location: z.object({
    latitude: z.number(),
    longitude: z.number(),
    city: z.string(),
    department: z.string(),
  }).optional(),
  role: z.enum(["project_owner", "project_seeker"]),
  experienceLevel: z.enum(["motivated", "junior", "intermediate", "senior"]).optional(),
  availability: z.enum(["immediate", "one_month", "three_months"]).optional(),
  collaborationType: z.enum(["full_time", "part_time"]).optional(),
  referredBy: z.string().optional(),
  documents: z.array(z.object({
    type: z.enum(["business_registration", "company_id", "professional_license", "id_card", "resume", "portfolio", "professional_certifications"]),
    url: z.string().url(),
  })).optional(),
});

export const insertProjectSchema = z.object({
  title: z.string().min(1, "Le titre est requis"),
  description: z.string().min(10, "La description doit contenir au moins 10 caractères"),
  category: z.string().min(1, "La catégorie est requise"),
  requiredSkills: z.array(z.string()).min(1, "Au moins une compétence est requise"),
  collaborationType: z.enum(["full_time", "part_time"], {
    errorMap: () => ({ message: "Le type de collaboration est requis (temps plein ou temps partiel)" })
  }),
  location: z.null(),
});

export const insertMatchSchema = z.object({
  projectId: z.number().int().min(1),
  status: z.enum(["pending", "accepted", "rejected"]),
});

export const insertRatingSchema = z.object({
  userId: z.number().int().min(1),
  projectId: z.number().int().min(1),
  score: z.number().min(1).max(5),
  comment: z.string().optional(),
});

export const insertSuggestionSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(10),
  status: z.enum(["pending", "approved", "implemented"]),
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertProject = z.infer<typeof insertProjectSchema>;
export type InsertMatch = z.infer<typeof insertMatchSchema>;
export type InsertRating = z.infer<typeof insertRatingSchema>;
export type InsertSuggestion = z.infer<typeof insertSuggestionSchema>;
export type User = typeof users.$inferSelect;
export type Project = typeof projects.$inferSelect;
export type Match = typeof matches.$inferSelect;
export type Rating = typeof ratings.$inferSelect;
export type Suggestion = typeof suggestions.$inferSelect;
export type SuggestionVote = typeof suggestionVotes.$inferSelect;
export type Referral = typeof referrals.$inferSelect;

export const matches = pgTable("matches", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").notNull(),
  userId: integer("user_id").notNull(),
  status: text("status").notNull(), // pending/accepted/rejected
  createdAt: timestamp("created_at").defaultNow(),
});

export const ratings = pgTable("ratings", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  projectId: integer("project_id").notNull(),
  score: json("score").$type<{score:number}>().notNull(), // Score de 1 à 5
  comment: text("comment"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const projects = pgTable("projects", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  category: text("category").notNull(),
  location: json("location").$type<{
    latitude: number;
    longitude: number;
    city: string;
    department: string;
  }>(),
  requiredSkills: text("required_skills").array(),
  collaborationType: text("collaboration_type").notNull(), // 'full_time', 'part_time'
  createdAt: timestamp("created_at").defaultNow(),
});

export const suggestions = pgTable("suggestions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  status: text("status").notNull(), // 'pending', 'approved', 'implemented'
  votes: integer("votes").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

export const suggestionVotes = pgTable("suggestion_votes", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  suggestionId: integer("suggestion_id").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});