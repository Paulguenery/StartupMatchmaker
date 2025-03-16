import { pgTable, text, serial, integer, timestamp, json, boolean } from "drizzle-orm/pg-core";
import { z } from "zod";

// Types de base pour l'application
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  fullName: text("full_name").notNull(),
  role: text("role").notNull(), // 'project_owner' ou 'project_seeker'
  isPremium: boolean("is_premium").default(false),
  location: json("location").$type<{
    latitude: number;
    longitude: number;
    city: string;
    department: string;
    postalCode?: string;
  }>(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const projects = pgTable("projects", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  sector: text("sector").notNull(),
  location: json("location").$type<{
    latitude: number;
    longitude: number;
    city: string;
    department: string;
    postalCode?: string;
  }>(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const matches = pgTable("matches", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  projectId: integer("project_id").notNull(),
  status: text("status").notNull(), // 'pending', 'matched', 'passed'
  createdAt: timestamp("created_at").defaultNow(),
});

// Schémas d'insertion avec validation
export const insertUserSchema = z.object({
  email: z.string().email("Email invalide"),
  password: z.string().min(8, "Le mot de passe doit contenir au moins 8 caractères"),
  fullName: z.string().min(1, "Le nom est requis"),
  role: z.enum(["project_owner", "project_seeker"]),
  location: z.object({
    latitude: z.number(),
    longitude: z.number(),
    city: z.string(),
    department: z.string(),
    postalCode: z.string().optional(),
  }).optional(),
});

export const insertProjectSchema = z.object({
  userId: z.number().int().min(1),
  title: z.string().min(1, "Le titre est requis"),
  description: z.string().min(10, "La description doit contenir au moins 10 caractères"),
  sector: z.string().min(1, "Le secteur est requis"),
  location: z.object({
    latitude: z.number(),
    longitude: z.number(),
    city: z.string(),
    department: z.string(),
    postalCode: z.string().optional(),
  }).optional(),
});

export const insertMatchSchema = z.object({
  projectId: z.number().int().min(1),
  userId: z.number().int().min(1),
  status: z.enum(["pending", "matched", "passed"]),
});

// Types d'inférence
export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertProject = z.infer<typeof insertProjectSchema>;
export type InsertMatch = z.infer<typeof insertMatchSchema>;
export type User = typeof users.$inferSelect;
export type Project = typeof projects.$inferSelect & {
  distance?: number | null;
};
export type Match = typeof matches.$inferSelect;

// Ajout du stub manquant à la fin du fichier
export const insertSuggestionSchema = z.object({});