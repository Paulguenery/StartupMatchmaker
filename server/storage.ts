import { users, projects, matches, type User, type Project, type Match, type InsertUser, type InsertProject, type InsertMatch } from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";
import { scrypt, randomBytes } from "crypto";
import { promisify } from "util";

const MemoryStore = createMemoryStore(session);
const scryptAsync = promisify(scrypt);

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
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

    // Ajouter des utilisateurs de test
    this.initializeTestData();
  }

  private async initializeTestData() {
    // Utilisateur chercheur de projet
    const seeker: InsertUser = {
      email: "seeker@test.com",
      password: await hashPassword("password123"),
      fullName: "John Doe",
      role: "project_seeker",
      location: {
        latitude: 48.8566,
        longitude: 2.3522,
        city: "Paris",
        department: "75"
      }
    };
    await this.createUser(seeker);

    // Utilisateur porteur de projet
    const owner: InsertUser = {
      email: "owner@test.com",
      password: await hashPassword("password123"),
      fullName: "Jane Smith",
      role: "project_owner",
      location: {
        latitude: 45.7640,
        longitude: 4.8357,
        city: "Lyon",
        department: "69"
      }
    };
    await this.createUser(owner);

    // Créer plusieurs projets de test
    const projectsData = [
      {
        title: "Startup Tech Innovante",
        description: "Développement d'une application mobile révolutionnaire dans le domaine de la santé connectée",
        sector: "Technologie",
        location: {
          latitude: 48.8566,
          longitude: 2.3522,
          city: "Paris",
          department: "75"
        }
      },
      {
        title: "Restaurant Bio Local",
        description: "Création d'un restaurant utilisant uniquement des produits bio et locaux",
        sector: "Restauration",
        location: {
          latitude: 45.7640,
          longitude: 4.8357,
          city: "Lyon",
          department: "69"
        }
      },
      {
        title: "Studio de Design",
        description: "Studio de design spécialisé dans la création d'identités visuelles éco-responsables",
        sector: "Design",
        location: {
          latitude: 43.2965,
          longitude: 5.3698,
          city: "Marseille",
          department: "13"
        }
      },
      {
        title: "Boutique Mode Éthique",
        description: "Création d'une boutique de mode éthique et durable",
        sector: "Mode",
        location: {
          latitude: 43.6047,
          longitude: 1.4442,
          city: "Toulouse",
          department: "31"
        }
      },
      {
        title: "Centre de Formation Numérique",
        description: "Centre de formation aux métiers du numérique pour les personnes en reconversion",
        sector: "Formation",
        location: {
          latitude: 47.2184,
          longitude: -1.5536,
          city: "Nantes",
          department: "44"
        }
      }
    ];

    for (const projectData of projectsData) {
      await this.createProject({ ...projectData, userId: 2 });
    }
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
    console.log('Recherche de l\'utilisateur avec l\'ID:', id);
    const user = this.users.get(id);
    console.log('Utilisateur trouvé:', user);
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    console.log('Recherche de l\'utilisateur avec l\'email:', email);
    const user = Array.from(this.users.values()).find(
      (user) => user.email === email,
    );
    console.log('Utilisateur trouvé:', user);
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = {
      id,
      createdAt: new Date(),
      isPremium: false,
      ...insertUser,
    };
    this.users.set(id, user);
    console.log('Nouvel utilisateur créé:', user);
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