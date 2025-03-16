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
  const allowedOrigins = ['http://localhost:5000', 'https://mymate.repl.co'];
  const origin = req.headers.origin;

  if (origin && allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }

  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');

  // Content Security Policy améliorée
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'self'; " +
    "style-src 'self' 'unsafe-inline'; " +
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com; " +
    "connect-src 'self' http://localhost:* https://api-adresse.data.gouv.fr https://api.stripe.com; " +
    "img-src 'self' data: blob:; " +
    "font-src 'self' data:; " +
    "frame-src https://js.stripe.com; " +
    "worker-src 'self' blob:;"
  );

  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// Logging amélioré pour le debugging
app.use((req, res, next) => {
  const start = Date.now();
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);

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
        timestamp: new Date().toISOString()
      });

      // Ne pas exposer les détails de l'erreur en production
      const isProduction = process.env.NODE_ENV === 'production';
      res.status(500).json({ 
        message: isProduction ? 'Une erreur est survenue' : err.message,
        code: err.code
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