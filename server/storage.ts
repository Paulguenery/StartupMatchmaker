import { users, projects, matches, type User, type Project, type Match, type InsertUser, type InsertProject, type InsertMatch } from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";
import { ratings, type Rating, type InsertRating } from "@shared/schema";

const MemoryStore = createMemoryStore(session);

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
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
  
  sessionStore: session.SessionStore;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private projects: Map<number, Project>;
  private matches: Map<number, Match>;
  private ratings: Map<number, Rating>;
  private currentUserId: number;
  private currentProjectId: number;
  private currentMatchId: number;
  private currentRatingId: number;
  sessionStore: session.SessionStore;

  constructor() {
    this.users = new Map();
    this.projects = new Map();
    this.matches = new Map();
    this.ratings = new Map();
    this.currentUserId = 1;
    this.currentProjectId = 1;
    this.currentMatchId = 1;
    this.currentRatingId = 1;
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000,
    });

    // Ajout de projets de test
    this.createProject({
      userId: 1,
      title: "Développement Application Mobile",
      description: "Création d'une application mobile innovante dans le secteur de la santé",
      category: "Informatique et technologie",
      duration: "medium",
      requiredSkills: ["React Native", "TypeScript", "API REST"],
      location: {
        latitude: 48.8566,
        longitude: 2.3522,
        city: "Paris",
        department: "Île-de-France"
      }
    });

    this.createProject({
      userId: 1,
      title: "Refonte Site E-commerce",
      description: "Modernisation complète d'une plateforme de vente en ligne",
      category: "Marketing et Publicité",
      duration: "long",
      requiredSkills: ["React", "Node.js", "UX Design"],
      location: {
        latitude: 45.7578,
        longitude: 4.8320,
        city: "Lyon",
        department: "Rhône"
      }
    });

    // Ajout d'un match de test
    this.createMatch({
      projectId: 1,
      userId: 1,
      status: "accepted"
    });
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.email === email,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { ...insertUser, id, isVerified: false, isPremium: false, createdAt: new Date() };
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
    // Récupérer les projets notés par l'utilisateur
    const userRatings = Array.from(this.ratings.values()).filter(
      (rating) => rating.userId === userId
    );

    // Récupérer tous les projets
    const allProjects = await this.getProjects();

    // Exclure les projets déjà notés par l'utilisateur
    const ratedProjectIds = new Set(userRatings.map(r => r.projectId));
    const unratedProjects = allProjects.filter(p => !ratedProjectIds.has(p.id));

    // Trier les projets en fonction des compétences correspondantes de l'utilisateur
    const user = await this.getUser(userId);
    if (!user || !user.skills) return unratedProjects;

    const userSkillSet = new Set(user.skills);

    return unratedProjects.sort((a, b) => {
      const aMatches = a.requiredSkills?.filter(skill => userSkillSet.has(skill)).length || 0;
      const bMatches = b.requiredSkills?.filter(skill => userSkillSet.has(skill)).length || 0;
      return bMatches - aMatches;
    });
  }
}

export const storage = new MemStorage();