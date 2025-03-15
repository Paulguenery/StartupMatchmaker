import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";

const app = express();

// Configuration de base
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Content Security Policy
app.use((req, res, next) => {
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'self'; " +
    "style-src 'self' 'unsafe-inline'; " + // Permettre les styles inline
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com https://*.stripe.com; " + // Permettre Stripe.js
    "connect-src 'self' https://api.stripe.com; " + // Permettre les appels API Stripe
    "frame-src 'self' https://*.stripe.com; " + // Permettre les iframes Stripe
    "img-src 'self' data: blob: https:; " + // Permettre les images depuis diverses sources
    "font-src 'self' data:;" // Permettre les polices
  );
  next();
});

// Logging middleware
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  // Log les en-têtes pour le debugging
  console.log('Headers:', req.headers);
  // Log les cookies pour le debugging de session
  console.log('Cookies:', req.cookies);
  next();
});


(async () => {
  const server = await registerRoutes(app);

  // Error handling middleware
  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    console.error(err);
    res.status(500).json({ message: err.message });
  });

  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  const port = 5000;
  server.listen({
    port,
    host: "0.0.0.0",
  }, () => {
    log(`Server running on port ${port}`);
  });
})();