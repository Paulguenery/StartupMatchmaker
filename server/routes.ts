import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { setupWebSocket } from "./websocket";
import { insertProjectSchema, insertMatchSchema, insertRatingSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  setupAuth(app);

  // Projects
  app.get("/api/projects", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);

    const { category, distance, duration } = req.query;
    let projects = await storage.getProjects();

    // Appliquer les filtres
    if (category) {
      projects = projects.filter(p => p.category === category);
    }

    if (duration) {
      projects = projects.filter(p => p.duration === duration);
    }

    if (distance && req.user?.location) {
      const maxDistance = parseInt(distance as string);
      projects = projects.filter(p => {
        if (!p.location || !req.user?.location) return false;

        // Calcul de la distance (en km) entre deux points
        const R = 6371; // Rayon de la Terre en km
        const lat1 = req.user.location.latitude * Math.PI / 180;
        const lat2 = p.location.latitude * Math.PI / 180;
        const dLat = (p.location.latitude - req.user.location.latitude) * Math.PI / 180;
        const dLon = (p.location.longitude - req.user.location.longitude) * Math.PI / 180;

        const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                 Math.cos(lat1) * Math.cos(lat2) *
                 Math.sin(dLon/2) * Math.sin(dLon/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        const distance = R * c;

        return distance <= maxDistance;
      });
    }

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
  setupWebSocket(httpServer);

  return httpServer;
}