import { users, projects, matches, type User, type Project, type Match, type InsertUser, type InsertProject, type InsertMatch } from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";
import { ratings, type Rating, type InsertRating } from "@shared/schema";
import { suggestions, type Suggestion, type InsertSuggestion } from "@shared/schema"; // Added import for suggestions


const MemoryStore = createMemoryStore(session);

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUsers(): Promise<User[]>;
  createUser(user: InsertUser): Promise<User>;
  verifyUser(userId: number): Promise<User>;
  upgradeToPremium(userId: number): Promise<User>;

  // Project operations
  createProject(project: InsertProject): Promise<Project>;
  getProjects(): Promise<Project[]>;
  getProjectById(id: number): Promise<Project | undefined>;

  // Match operations
  createMatch(match: InsertMatch): Promise<Match>;
  getMatchesByUserId(userId: number): Promise<Match[]>;

  // Rating operations
  createRating(rating: InsertRating): Promise<Rating>;
  getProjectRatings(projectId: number): Promise<Rating[]>;
  getRecommendedProjects(userId: number): Promise<Project[]>;

  // Suggestion operations
  createSuggestion(suggestion: InsertSuggestion): Promise<Suggestion>;
  getSuggestions(): Promise<Suggestion[]>;
  voteSuggestion(suggestionId: number): Promise<Suggestion>;

  sessionStore: session.Store;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private projects: Map<number, Project>;
  private matches: Map<number, Match>;
  private ratings: Map<number, Rating>;
  private suggestions: Map<number, Suggestion>; // Added suggestions map
  private currentUserId: number;
  private currentProjectId: number;
  private currentMatchId: number;
  private currentRatingId: number;
  private currentSuggestionId: number; // Added currentSuggestionId
  sessionStore: session.Store;

  constructor() {
    this.users = new Map();
    this.projects = new Map();
    this.matches = new Map();
    this.ratings = new Map();
    this.suggestions = new Map(); // Initialize suggestions map
    this.currentUserId = 1;
    this.currentProjectId = 1;
    this.currentMatchId = 1;
    this.currentRatingId = 1;
    this.currentSuggestionId = 1; // Initialize currentSuggestionId
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000,
    });
  }

  async getUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.email === email,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = {
      id,
      isVerified: false,
      isPremium: false,
      createdAt: new Date(),
      ...insertUser,
    };
    this.users.set(id, user);
    return user;
  }

  async verifyUser(userId: number): Promise<User> {
    const user = await this.getUser(userId);
    if (!user) throw new Error("User not found");

    const updatedUser = { ...user, isVerified: true };
    this.users.set(userId, updatedUser);
    return updatedUser;
  }

  async upgradeToPremium(userId: number): Promise<User> {
    const user = await this.getUser(userId);
    if (!user) throw new Error("User not found");

    const updatedUser = { ...user, isPremium: true };
    this.users.set(userId, updatedUser);
    return updatedUser;
  }

  async createProject(insertProject: InsertProject): Promise<Project> {
    const id = this.currentProjectId++;
    const project: Project = { ...insertProject, id, createdAt: new Date() };
    this.projects.set(id, project);
    return project;
  }

  async getProjects(): Promise<Project[]> {
    return Array.from(this.projects.values());
  }

  async getProjectById(id: number): Promise<Project | undefined> {
    return this.projects.get(id);
  }

  async createMatch(insertMatch: InsertMatch): Promise<Match> {
    const id = this.currentMatchId++;
    const match: Match = { ...insertMatch, id, createdAt: new Date() };
    this.matches.set(id, match);
    return match;
  }

  async getMatchesByUserId(userId: number): Promise<Match[]> {
    return Array.from(this.matches.values()).filter(
      (match) => match.userId === userId
    );
  }

  async createRating(insertRating: InsertRating): Promise<Rating> {
    const id = this.currentRatingId++;
    const rating: Rating = { ...insertRating, id, createdAt: new Date() };
    this.ratings.set(id, rating);
    return rating;
  }

  async getProjectRatings(projectId: number): Promise<Rating[]> {
    return Array.from(this.ratings.values()).filter(
      (rating) => rating.projectId === projectId
    );
  }

  async getRecommendedProjects(userId: number): Promise<Project[]> {
    const user = await this.getUser(userId);
    if (!user || !user.skills) return this.getProjects();

    const userSkillSet = new Set(user.skills);
    const allProjects = await this.getProjects();

    return allProjects.sort((a, b) => {
      const aMatches = a.requiredSkills?.filter(skill => userSkillSet.has(skill)).length || 0;
      const bMatches = b.requiredSkills?.filter(skill => userSkillSet.has(skill)).length || 0;
      return bMatches - aMatches;
    });
  }

  async createSuggestion(insertSuggestion: InsertSuggestion): Promise<Suggestion> {
    const id = this.currentSuggestionId++;
    const suggestion: Suggestion = {
      id,
      votes: 0,
      createdAt: new Date(),
      ...insertSuggestion,
    };
    this.suggestions.set(id, suggestion);
    return suggestion;
  }

  async getSuggestions(): Promise<Suggestion[]> {
    return Array.from(this.suggestions.values());
  }

  async voteSuggestion(suggestionId: number): Promise<Suggestion> {
    const suggestion = this.suggestions.get(suggestionId);
    if (!suggestion) throw new Error("Suggestion not found");

    const updatedSuggestion = {
      ...suggestion,
      votes: suggestion.votes + 1,
    };
    this.suggestions.set(suggestionId, updatedSuggestion);
    return updatedSuggestion;
  }
}

export const storage = new MemStorage();