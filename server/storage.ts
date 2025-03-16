import { users, projects, matches, type User, type Project, type Match, type InsertUser, type InsertProject, type InsertMatch } from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";

const MemoryStore = createMemoryStore(session);

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUsers(): Promise<User[]>;
  createUser(user: InsertUser): Promise<User>;
  deleteUserByEmail(email: string): Promise<void>;
  verifyUser(userId: number): Promise<User>;
  upgradeToPremium(userId: number): Promise<User>;
  updateUser(userId: number, updates: Partial<User>): Promise<User>;

  // Project operations
  createProject(project: InsertProject): Promise<Project>;
  getProjects(): Promise<Project[]>;
  getProjectById(id: number): Promise<Project | undefined>;

  // Match operations
  createMatch(match: InsertMatch): Promise<Match>;
  getMatchesByUserId(userId: number): Promise<Match[]>;
  getMatchByProjectAndUser(projectId: number, userId: number): Promise<Match | undefined>;
  updateMatch(matchId: number, updates: Partial<Match>): Promise<Match>;

  sessionStore: session.Store;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private projects: Map<number, Project>;
  private matches: Map<number, Match>;
  private currentUserId: number;
  private currentProjectId: number;
  private currentMatchId: number;
  sessionStore: session.Store;

  constructor() {
    this.users = new Map();
    this.projects = new Map();
    this.matches = new Map();
    this.currentUserId = 1;
    this.currentProjectId = 1;
    this.currentMatchId = 1;
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

  async getMatchByProjectAndUser(projectId: number, userId: number): Promise<Match | undefined> {
    return Array.from(this.matches.values()).find(
      (match) => match.projectId === projectId && match.userId === userId
    );
  }

  async updateMatch(matchId: number, updates: Partial<Match>): Promise<Match> {
    const match = this.matches.get(matchId);
    if (!match) throw new Error("Match not found");

    const updatedMatch = { ...match, ...updates };
    this.matches.set(matchId, updatedMatch);
    return updatedMatch;
  }
}

export const storage = new MemStorage();