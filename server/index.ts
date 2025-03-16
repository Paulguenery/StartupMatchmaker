import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic } from "./vite";
import { setupAuth } from "./auth";

const app = express();

// Configuration de base
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configuration CORS et sécurité
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', 'http://localhost:5000');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// Initialiser l'authentification avant les autres middlewares
console.log('Démarrage du serveur MyMate...');
console.log('Initialisation de l\'authentification...');
setupAuth(app);

// Logging détaillé pour le debugging
app.use((req, res, next) => {
  const start = Date.now();
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  console.log('Headers:', req.headers);
  console.log('Body:', req.body);
  console.log('Session:', req.session);

  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path} - ${res.statusCode} (${duration}ms)`);
  });

  next();
});

(async () => {
  try {
    console.log('Configuration des routes...');
    const server = await registerRoutes(app);

    // Gestion d'erreurs améliorée
    app.use((err: any, req: Request, res: Response, _next: NextFunction) => {
      console.error('Erreur critique:', {
        message: err.message,
        stack: err.stack,
        path: req.path,
        method: req.method,
        timestamp: new Date().toISOString(),
        sessionId: req.sessionID,
        isAuthenticated: req.isAuthenticated,
        user: req.user
      });

      res.status(500).json({ 
        message: process.env.NODE_ENV === 'production' 
          ? 'Une erreur est survenue' 
          : err.message
      });
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
      console.log(`📡 L'application est accessible sur http://localhost:${port}`);
    });

  } catch (error) {
    console.error('❌ Erreur fatale lors du démarrage du serveur:', error);
    process.exit(1);
  }
})();