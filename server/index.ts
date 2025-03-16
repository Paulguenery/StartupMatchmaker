import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { setupAuth } from "./auth";

const app = express();

// Configuration de base
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Initialiser l'authentification avant les autres middlewares
setupAuth(app);

// Content Security Policy
app.use((req, res, next) => {
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'self'; " +
    "style-src 'self' 'unsafe-inline'; " +
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com https://*.stripe.com; " +
    "connect-src 'self' https://api.stripe.com; " +
    "frame-src 'self' https://*.stripe.com; " +
    "img-src 'self' data: blob: https:; " +
    "font-src 'self' data:;"
  );
  next();
});

// Logging middleware pour le debugging
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  console.log('Headers:', req.headers);
  console.log('Cookies:', req.cookies);
  console.log('Session:', req.session);
  console.log('Authenticated:', req.isAuthenticated());
  next();
});

(async () => {
  try {
    console.log('Démarrage du serveur...');
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
      log(`Serveur démarré avec succès sur le port ${port}`);
    });

    // Gestion des erreurs de serveur
    server.on('error', (error: any) => {
      console.error('Erreur du serveur:', error);
      if (error.code === 'EADDRINUSE') {
        console.error(`Le port ${port} est déjà utilisé`);
        process.exit(1);
      }
    });

  } catch (error) {
    console.error('Erreur lors du démarrage du serveur:', error);
    process.exit(1);
  }
})();