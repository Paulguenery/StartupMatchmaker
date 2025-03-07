import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { insertProjectSchema, insertMatchSchema } from "@shared/schema";
import { insertRatingSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  setupAuth(app);

  // Projects
  app.get("/api/projects", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const projects = await storage.getProjects();
    res.json(projects);
  });

  app.post("/api/projects", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const validation = insertProjectSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json(validation.error);
    }
    const project = await storage.createProject({
      ...validation.data,
      userId: req.user!.id,
    });
    res.status(201).json(project);
  });

  // Matches
  app.post("/api/matches", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const validation = insertMatchSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json(validation.error);
    }
    const match = await storage.createMatch({
      ...validation.data,
      userId: req.user!.id,
    });
    res.status(201).json(match);
  });

  app.get("/api/matches", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const matches = await storage.getMatchesByUserId(req.user!.id);
    res.json(matches);
  });

  // Ratings
  app.post("/api/projects/:projectId/rate", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);

    const validation = insertRatingSchema.safeParse({
      ...req.body,
      userId: req.user!.id,
      projectId: parseInt(req.params.projectId),
    });

    if (!validation.success) {
      return res.status(400).json(validation.error);
    }

    const rating = await storage.createRating(validation.data);
    res.status(201).json(rating);
  });

  app.get("/api/projects/:projectId/ratings", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const ratings = await storage.getProjectRatings(parseInt(req.params.projectId));
    res.json(ratings);
  });

  app.get("/api/projects/recommended", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const recommendedProjects = await storage.getRecommendedProjects(req.user!.id);
    res.json(recommendedProjects);
  });


  // User verification
  app.post("/api/verify", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const user = await storage.verifyUser(req.user!.id);
    res.json(user);
  });

  // Premium subscription
  app.post("/api/subscribe", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const user = await storage.upgradeToPremium(req.user!.id);
    res.json(user);
  });

  const httpServer = createServer(app);
  return httpServer;
}