import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { setupAuth } from "./auth";

const app = express();

// Configuration de base
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Initialiser l'authentification avant les autres middlewares
console.log('Démarrage du serveur MyMate...');
console.log('Initialisation de l\'authentification...');
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
    console.log('Configuration des routes...');
    const server = await registerRoutes(app);

    // Error handling middleware
    app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
      console.error('Erreur critique:', err);
      res.status(500).json({ message: err.message });
    });

    if (app.get("env") === "development") {
      console.log('Configuration de Vite pour le développement...');
      try {
        await setupVite(app, server);
        console.log('Configuration Vite terminée avec succès');
      } catch (viteError) {
        console.error('Erreur lors de la configuration de Vite:', viteError);
        throw viteError;
      }
    } else {
      console.log('Configuration du serveur statique pour la production...');
      serveStatic(app);
    }

    const port = 5000;
    console.log(`Tentative de démarrage du serveur sur le port ${port}...`);

    server.listen({
      port,
      host: "0.0.0.0",
    }, () => {
      console.log(`✅ Serveur démarré avec succès sur le port ${port}`);
      console.log('URL de l\'application:', `http://0.0.0.0:${port}`);
    });

    // Gestion des erreurs de serveur
    server.on('error', (error: any) => {
      console.error('❌ Erreur du serveur:', error);
      if (error.code === 'EADDRINUSE') {
        console.error(`Le port ${port} est déjà utilisé`);
        process.exit(1);
      }
    });

  } catch (error) {
    console.error('❌ Erreur fatale lors du démarrage du serveur:', error);
    process.exit(1);
  }
})();