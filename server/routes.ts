import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { setupWebSocket } from "./websocket";

// Calculate distance between two points using Haversine formula
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function filterProjectsByDistance(userLat: number, userLon: number, maxDistance: number, projects: any[]) {
  return projects.map(project => {
    if (!project.location) return { ...project, distance: null };

    const distance = calculateDistance(
      userLat,
      userLon,
      project.location.latitude,
      project.location.longitude
    );

    return { ...project, distance };
  }).filter(project => project.distance === null || project.distance <= maxDistance)
    .sort((a, b) => {
      if (a.distance === null) return 1;
      if (b.distance === null) return -1;
      return a.distance - b.distance;
    });
}

export async function registerRoutes(app: Express): Promise<Server> {
  setupAuth(app);

  // Recherche de projets avec filtres
  app.get("/api/projects", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);

    try {
      const { distance, latitude, longitude, sector, city } = req.query;
      let projects = await storage.getProjects();

      // Filtrer par secteur si spécifié
      if (sector) {
        projects = projects.filter(project => project.sector === sector);
      }

      // Filtrer par ville si spécifiée
      if (city) {
        projects = projects.filter(project =>
          project.location?.city.toLowerCase().includes((city as string).toLowerCase())
        );
      }

      // Filtrer par distance si des coordonnées sont fournies
      if (distance && latitude && longitude) {
        const maxDistance = parseInt(distance as string);
        const userLat = parseFloat(latitude as string);
        const userLon = parseFloat(longitude as string);

        projects = projects
          .filter(project => {
            if (!project.location) return false;
            const dist = calculateDistance(
              userLat,
              userLon,
              project.location.latitude,
              project.location.longitude
            );
            return dist <= maxDistance;
          })
          .map(project => ({
            ...project,
            distance: project.location ? calculateDistance(
              userLat,
              userLon,
              project.location.latitude,
              project.location.longitude
            ) : null
          }))
          .sort((a, b) => {
            if (a.distance === null) return 1;
            if (b.distance === null) return -1;
            return a.distance - b.distance;
          });
      }

      res.json(projects);
    } catch (error) {
      console.error('Erreur lors de la recherche des projets:', error);
      res.status(500).json({ message: 'Erreur lors de la recherche des projets' });
    }
  });

  // Filter projects by distance and city
  app.get("/api/projects/suggestions", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);

    try {
      const { latitude, longitude, distance, city } = req.query;

      if (!latitude || !longitude) {
        return res.status(400).json({ message: 'Coordonnées requises' });
      }

      const userLat = parseFloat(latitude as string);
      const userLon = parseFloat(longitude as string);
      const maxDistance = distance ? parseInt(distance as string) : 50;

      // Get all projects
      let projects = await storage.getProjects();

      // Filter out already matched projects
      const userMatches = await storage.getMatchesByUserId(req.user!.id);
      const matchedProjectIds = userMatches.map(m => m.projectId);
      projects = projects.filter(p => !matchedProjectIds.includes(p.id));

      // Apply distance filter first
      projects = filterProjectsByDistance(userLat, userLon, maxDistance, projects);

      // Then apply city filter if specified
      if (city && typeof city === 'string' && city.trim()) {
        const cityFilter = city.trim().toLowerCase();
        projects = projects.filter(project =>
          project.location?.city.toLowerCase().includes(cityFilter)
        );
      }

      res.json(projects);
    } catch (error) {
      console.error('Erreur lors de la récupération des suggestions:', error);
      res.status(500).json({ message: 'Erreur lors de la récupération des suggestions' });
    }
  });

  // Matching
  app.post("/api/matches", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);

    try {
      const { projectId, action } = req.body;

      if (action === 'like') {
        const match = await storage.createMatch({
          userId: req.user!.id,
          projectId,
          status: 'pending'
        });

        // Vérifier si c'est un match mutuel
        const projectOwnerMatch = await storage.getMatchByProjectAndUser(projectId, req.user!.id);
        if (projectOwnerMatch && projectOwnerMatch.status === 'liked') {
          await storage.updateMatch(match.id, { status: 'matched' });
          await storage.updateMatch(projectOwnerMatch.id, { status: 'matched' });
        }

        res.status(201).json(match);
      } else if (action === 'pass') {
        await storage.createMatch({
          userId: req.user!.id,
          projectId,
          status: 'passed'
        });
        res.status(200).json({ message: 'Projet passé' });
      }
    } catch (error) {
      console.error('Erreur lors de la création du match:', error);
      res.status(500).json({ message: 'Erreur lors de la création du match' });
    }
  });

  // Récupérer les matches d'un utilisateur
  app.get("/api/matches", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);

    try {
      const matches = await storage.getMatchesByUserId(req.user!.id);
      res.json(matches);
    } catch (error) {
      console.error('Erreur lors de la récupération des matches:', error);
      res.status(500).json({ message: 'Erreur lors de la récupération des matches' });
    }
  });
  // Recherche de profils
  app.get("/api/users/search", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);

    const { distance, latitude, longitude } = req.query;
    let users = await storage.getUsers();

    // Filtrer par distance si des coordonnées sont fournies
    if (distance && latitude && longitude) {
      const maxDistance = parseInt(distance as string);
      const userLat = parseFloat(latitude as string);
      const userLon = parseFloat(longitude as string);

      users = users.filter(user => {
        if (!user.location) return false;

        const dist = calculateDistance(
          userLat,
          userLon,
          user.location.latitude,
          user.location.longitude
        );
        return dist <= maxDistance;
      });
    }

    res.json(users);
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

  // Stripe subscription route
  app.post('/api/get-or-create-subscription', async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.sendStatus(401);
    }

    // Les porteurs de projet et les admins ont automatiquement accès premium
    const user = req.user as any;
    if (user.role === 'project_owner' || user.role === 'admin') {
      await storage.upgradeToPremium(user.id);
      return res.json({ isPremium: true });
    }

    try {
      // Créer un client Stripe s'il n'existe pas déjà
      const customer = await stripe.customers.create({
        email: user.email,
        name: user.fullName,
      });

      const subscription = await stripe.subscriptions.create({
        customer: customer.id,
        items: [{
          price: process.env.STRIPE_PRICE_ID!,
        }],
        payment_behavior: 'default_incomplete',
        expand: ['latest_invoice.payment_intent'],
      });

      await storage.upgradeToPremium(user.id);

      res.json({
        subscriptionId: subscription.id,
        clientSecret: (subscription.latest_invoice as any).payment_intent.client_secret,
      });
    } catch (error: any) {
      console.error('Erreur Stripe:', error);
      res.status(400).json({
        error: { message: error.message }
      });
    }
  });

  // Webhook Stripe pour gérer les événements d'abonnement
  app.post('/api/stripe-webhook', async (req, res) => {
    const sig = req.headers['stripe-signature'];

    try {
      const event = stripe.webhooks.constructEvent(
        req.body,
        sig as string,
        'whsec_your_webhook_secret' // Remplacer par votre vrai secret de webhook
      );

      // Gérer les différents événements
      switch (event.type) {
        case 'customer.subscription.created':
          // Gérer la création d'abonnement
          break;
        case 'customer.subscription.deleted':
          // Gérer la suppression d'abonnement
          break;
        case 'invoice.payment_failed':
          // Gérer l'échec de paiement
          break;
      }

      res.json({ received: true });
    } catch (err: any) {
      res.status(400).send(`Webhook Error: ${err.message}`);
    }
  });

  // Suggestions
  app.get("/api/suggestions", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const suggestions = await storage.getSuggestions();
    res.json(suggestions);
  });

  app.post("/api/suggestions", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const validation = insertSuggestionSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json(validation.error);
    }
    const suggestion = await storage.createSuggestion({
      ...validation.data,
      userId: req.user!.id,
    });
    res.status(201).json(suggestion);
  });

  app.post("/api/suggestions/:id/vote", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    try {
      const suggestion = await storage.voteSuggestion(parseInt(req.params.id), req.user!.id);
      res.json(suggestion);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  const httpServer = createServer(app);
  setupWebSocket(httpServer);

  return httpServer;
}