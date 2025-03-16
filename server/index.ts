import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic } from "./vite";
import { setupAuth } from "./auth";

const app = express();

// Configuration de base
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Initialiser l'authentification avant les autres middlewares
console.log('Démarrage du serveur MyMate...');
console.log('Initialisation de l\'authentification...');
setupAuth(app);

// Configuration CORS et sécurité
app.use((req, res, next) => {
  // Permettre les requêtes du serveur de développement
  res.setHeader('Access-Control-Allow-Origin', 'http://localhost:5000');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // Content Security Policy de base pour le développement
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'self'; " +
    "style-src 'self' 'unsafe-inline'; " +
    "script-src 'self' 'unsafe-inline' 'unsafe-eval'; " +
    "connect-src 'self' http://localhost:* https://api-adresse.data.gouv.fr; " +
    "img-src 'self' data: blob:; " +
    "font-src 'self' data:;"
  );

  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// Logging minimal pour le debugging
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

(async () => {
  try {
    console.log('Configuration des routes...');
    const server = await registerRoutes(app);

    // Error handling middleware
    app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
      console.error('Erreur critique:', err);
      res.status(500).json({ message: err.message });
    });

    if (app.get("env") === "development") {
      console.log('Configuration de Vite pour le développement...');
      await setupVite(app, server);
    } else {
      console.log('Configuration du serveur statique pour la production...');
      serveStatic(app);
    }

    const port = 5000;
    server.listen({
      port,
      host: "0.0.0.0",
    }, () => {
      console.log(`✅ Serveur démarré avec succès sur le port ${port}`);
    });

  } catch (error) {
    console.error('❌ Erreur fatale lors du démarrage du serveur:', error);
    process.exit(1);
  }
})();