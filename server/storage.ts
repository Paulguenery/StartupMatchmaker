import { users, projects, matches, type User, type Project, type Match, type InsertUser, type InsertProject, type InsertMatch } from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";
import { ratings, type Rating, type InsertRating } from "@shared/schema";
import { suggestions, type Suggestion, type InsertSuggestion } from "@shared/schema";
import { referrals, type Referral, type InsertReferral } from "@shared/schema";

const MemoryStore = createMemoryStore(session);

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserByReferralCode(code: string): Promise<User | undefined>;
  getUsers(): Promise<User[]>;
  createUser(user: InsertUser): Promise<User>;
  deleteUserByEmail(email: string): Promise<void>;
  verifyUser(userId: number): Promise<User>;
  upgradeToPremium(userId: number): Promise<User>;
  updateUser(userId: number, updates: Partial<User>): Promise<User>;

  // Referral operations
  createReferral(referral: InsertReferral): Promise<Referral>;
  getUserReferrals(userId: number): Promise<Referral[]>;

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
  voteSuggestion(suggestionId: number, userId: number): Promise<Suggestion>;

  sessionStore: session.Store;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private projects: Map<number, Project>;
  private matches: Map<number, Match>;
  private ratings: Map<number, Rating>;
  private suggestions: Map<number, Suggestion>;
  private referrals: Map<number, Referral>;
  private currentUserId: number;
  private currentProjectId: number;
  private currentMatchId: number;
  private currentRatingId: number;
  private currentSuggestionId: number;
  private currentReferralId: number;
  private suggestionVotes: Map<string, boolean>;
  sessionStore: session.Store;

  constructor() {
    this.users = new Map();
    this.projects = new Map();
    this.matches = new Map();
    this.ratings = new Map();
    this.suggestions = new Map();
    this.referrals = new Map();
    this.currentUserId = 1;
    this.currentProjectId = 1;
    this.currentMatchId = 1;
    this.currentRatingId = 1;
    this.currentSuggestionId = 1;
    this.currentReferralId = 1;
    this.suggestionVotes = new Map();
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000,
    });
  }

  async deleteUserByEmail(email: string): Promise<void> {
    const userToDelete = Array.from(this.users.values()).find(user => user.email === email);
    if (userToDelete) {
      this.users.delete(userToDelete.id);
    }
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

  async getUserByReferralCode(code: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.referralCode === code,
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

  async updateUser(userId: number, updates: Partial<User>): Promise<User> {
    const user = await this.getUser(userId);
    if (!user) throw new Error("User not found");

    const updatedUser = { ...user, ...updates };
    this.users.set(userId, updatedUser);
    return updatedUser;
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

  async createReferral(insertReferral: InsertReferral): Promise<Referral> {
    const id = this.currentReferralId++;
    const referral: Referral = { 
      ...insertReferral, 
      id, 
      createdAt: new Date(),
      completedAt: null
    };
    this.referrals.set(id, referral);
    return referral;
  }

  async getUserReferrals(userId: number): Promise<Referral[]> {
    return Array.from(this.referrals.values()).filter(
      (referral) => referral.referrerId === userId
    );
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

  async voteSuggestion(suggestionId: number, userId: number): Promise<Suggestion> {
    const suggestion = this.suggestions.get(suggestionId);
    if (!suggestion) throw new Error("Suggestion not found");

    const voteKey = `${userId}_${suggestionId}`;
    if (this.suggestionVotes.has(voteKey)) {
      // Si l'utilisateur a déjà voté, on retire son vote
      const updatedSuggestion = {
        ...suggestion,
        votes: Math.max(0, (suggestion.votes || 0) - 1),
      };
      this.suggestions.set(suggestionId, updatedSuggestion);
      this.suggestionVotes.delete(voteKey);
      return updatedSuggestion;
    } else {
      // Sinon, on ajoute son vote
      const updatedSuggestion = {
        ...suggestion,
        votes: (suggestion.votes || 0) + 1,
      };
      this.suggestions.set(suggestionId, updatedSuggestion);
      this.suggestionVotes.set(voteKey, true);
      return updatedSuggestion;
    }
  }
}

export const storage = new MemStorage();