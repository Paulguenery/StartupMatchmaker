import { pgTable, text, serial, integer, boolean, timestamp, json, real } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

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
  score: real("score").notNull(), // Score de 1 à 5
  comment: text("comment"),
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

export const insertUserSchema = createInsertSchema(users).pick({
  email: true,
  password: true,
  fullName: true,
  bio: true,
  skills: true,
  location: true,
  role: true,
  experienceLevel: true,
  availability: true,
  collaborationType: true
});

export const insertProjectSchema = createInsertSchema(projects).omit({
  id: true,
  createdAt: true,
});

export const insertMatchSchema = createInsertSchema(matches).omit({
  id: true,
  userId: true,
  createdAt: true,
});

export const insertRatingSchema = createInsertSchema(ratings).omit({
  id: true,
  createdAt: true,
});

export const insertSuggestionSchema = createInsertSchema(suggestions).omit({
  id: true,
  userId: true,
  votes: true,
  createdAt: true,
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