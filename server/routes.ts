import type { Express } from "express";
import { createServer, type Server } from "http";
import Stripe from "stripe";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { setupWebSocket } from "./websocket";
import { insertProjectSchema, insertMatchSchema, insertRatingSchema, insertSuggestionSchema } from "@shared/schema";

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('Clé secrète Stripe manquante: STRIPE_SECRET_KEY');
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2024-02-24",
});

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

  app.post("/api/projects", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);

    try {
      // Exemple d'offre près de Rouen
      const exampleProject = {
        title: "Développement d'une application mobile",
        description: "Recherche développeur React Native pour une application de livraison locale",
        category: "Informatique et technologie",
        collaborationType: "full_time",
        location: {
          city: "Rouen",
          department: "Seine-Maritime",
          latitude: 49.443232,
          longitude: 1.099971
        },
        requiredSkills: ["React Native", "TypeScript", "Mobile Development"],
        userId: req.user!.id,
      };

      const project = await storage.createProject(exampleProject);
      res.status(201).json(project);
    } catch (error) {
      console.error('Erreur lors de la création du projet:', error);
      res.status(500).json({ message: 'Erreur lors de la création du projet' });
    }
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

  // Stripe subscription route
  app.post('/api/get-or-create-subscription', async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.sendStatus(401);
    }

    if (!process.env.STRIPE_PRICE_ID || !process.env.STRIPE_PRICE_ID.startsWith('price_')) {
      console.error('ID de prix Stripe invalide:', process.env.STRIPE_PRICE_ID);
      return res.status(400).json({ 
        error: { message: "L'ID de prix doit commencer par 'price_'. Veuillez configurer un ID de prix valide dans les paramètres Stripe." }
      });
    }

    try {
      // Créer un client Stripe s'il n'existe pas déjà
      let user = req.user;

      console.log('Création du client Stripe avec ID de prix:', process.env.STRIPE_PRICE_ID);

      const customer = await stripe.customers.create({
        email: user.email,
        name: user.fullName,
      });

      // Créer l'abonnement
      const subscription = await stripe.subscriptions.create({
        customer: customer.id,
        items: [{
          price: process.env.STRIPE_PRICE_ID.trim(),
        }],
        payment_behavior: 'default_incomplete',
        expand: ['latest_invoice.payment_intent'],
      });

      // Mettre à jour l'utilisateur avec les informations Stripe
      await storage.upgradeToPremium(user.id);

      res.json({
        subscriptionId: subscription.id,
        clientSecret: (subscription.latest_invoice as any).payment_intent.client_secret,
      });
    } catch (error: any) {
      console.error('Erreur Stripe:', error);
      res.status(400).json({ 
        error: { 
          message: error.message === "No such price" 
            ? "L'ID de prix Stripe n'existe pas. Veuillez vérifier la configuration."
            : error.message 
        } 
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

  // Ajouter cette nouvelle route pour la recherche de profils
  app.get("/api/users/search", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);

    const {
      skills,
      distance,
      experienceLevel,
      availability,
      collaborationType,
      isVerified
    } = req.query;

    let users = await storage.getUsers();

    // Appliquer les filtres
    if (skills) {
      const requiredSkills = (skills as string).split(',');
      users = users.filter(user => 
        user.skills?.some(skill => 
          requiredSkills.includes(skill.toLowerCase())
        )
      );
    }

    if (experienceLevel) {
      users = users.filter(user => user.experienceLevel === experienceLevel);
    }

    if (availability) {
      users = users.filter(user => user.availability === availability);
    }

    if (collaborationType) {
      users = users.filter(user => user.collaborationType === collaborationType);
    }

    if (isVerified === 'true') {
      users = users.filter(user => user.isVerified);
    }

    if (distance && req.user?.location) {
      const maxDistance = parseInt(distance as string);
      users = users.filter(user => {
        if (!user.location || !req.user?.location) return false;

        // Calcul de la distance (en km) entre deux points
        const R = 6371; // Rayon de la Terre en km
        const lat1 = req.user.location.latitude * Math.PI / 180;
        const lat2 = user.location.latitude * Math.PI / 180;
        const dLat = (user.location.latitude - req.user.location.latitude) * Math.PI / 180;
        const dLon = (user.location.longitude - req.user.location.longitude) * Math.PI / 180;

        const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                 Math.cos(lat1) * Math.cos(lat2) *
                 Math.sin(dLon/2) * Math.sin(dLon/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        const distance = R * c;

        return distance <= maxDistance;
      });
    }

    res.json(users);
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