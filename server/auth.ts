import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Express } from "express";
import session from "express-session";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { storage } from "./storage";
import { User as SelectUser } from "@shared/schema";

declare global {
  namespace Express {
    interface User extends SelectUser {}
  }
}

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

async function comparePasswords(supplied: string, stored: string) {
  const [hashed, salt] = stored.split(".");
  const hashedBuf = Buffer.from(hashed, "hex");
  const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
  return timingSafeEqual(hashedBuf, suppliedBuf);
}

export function setupAuth(app: Express) {
  // Configuration de la session
  const sessionSettings: session.SessionOptions = {
    secret: 'mymate_secret_key_2024',
    resave: true,
    saveUninitialized: true,
    store: storage.sessionStore,
    cookie: {
      secure: false, // En développement, pas besoin de HTTPS
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000 // 24 heures
    },
    name: 'mymate.sid'
  };

  app.use(session(sessionSettings));
  app.use(passport.initialize());
  app.use(passport.session());

  // Configuration de passport
  passport.use(
    new LocalStrategy({ 
      usernameField: 'email',
      passwordField: 'password'
    }, async (email, password, done) => {
      try {
        console.log("Tentative de connexion avec:", email);
        const user = await storage.getUserByEmail(email);

        if (!user) {
          console.log("Utilisateur non trouvé:", email);
          return done(null, false, { message: "Email ou mot de passe incorrect" });
        }

        const isValid = await comparePasswords(password, user.password);
        console.log("Mot de passe valide:", isValid);

        if (!isValid) {
          return done(null, false, { message: "Email ou mot de passe incorrect" });
        }

        return done(null, user);
      } catch (error) {
        console.error("Erreur d'authentification:", error);
        return done(error);
      }
    })
  );

  passport.serializeUser((user: Express.User, done) => {
    console.log("Sérialisation utilisateur:", user.id);
    done(null, user.id);
  });

  passport.deserializeUser(async (id: number, done) => {
    try {
      console.log("Désérialisation utilisateur:", id);
      const user = await storage.getUser(id);
      if (!user) {
        return done(null, false);
      }
      done(null, user);
    } catch (error) {
      console.error("Erreur de désérialisation:", error);
      done(error);
    }
  });

  // Routes d'authentification
  app.post("/api/register", async (req, res, next) => {
    try {
      console.log("Tentative d'inscription:", req.body.email);
      const existingUser = await storage.getUserByEmail(req.body.email);

      if (existingUser) {
        return res.status(400).json({ message: "Cette adresse email est déjà utilisée" });
      }

      const hashedPassword = await hashPassword(req.body.password);
      const user = await storage.createUser({
        ...req.body,
        password: hashedPassword,
      });

      req.login(user, (err) => {
        if (err) return next(err);
        res.status(201).json(user);
      });
    } catch (error) {
      console.error("Erreur d'inscription:", error);
      next(error);
    }
  });

  app.post("/api/login", (req, res, next) => {
    console.log("Tentative de connexion:", req.body);
    passport.authenticate("local", (err, user, info) => {
      if (err) {
        console.error("Erreur d'authentification:", err);
        return next(err);
      }
      if (!user) {
        console.log("Authentification échouée:", info?.message);
        return res.status(401).json({ message: info?.message || "Email ou mot de passe incorrect" });
      }
      req.login(user, (err) => {
        if (err) {
          console.error("Erreur de login:", err);
          return next(err);
        }
        console.log("Connexion réussie pour:", user.email);
        res.json(user);
      });
    })(req, res, next);
  });

  app.post("/api/logout", (req, res, next) => {
    const email = req.user?.email;
    console.log("Déconnexion de l'utilisateur:", email);
    req.logout((err) => {
      if (err) {
        console.error("Erreur de déconnexion:", err);
        return next(err);
      }
      console.log("Déconnexion réussie pour:", email);
      res.sendStatus(200);
    });
  });

  app.get("/api/user", (req, res) => {
    console.log("Vérification de l'utilisateur:", req.isAuthenticated());
    if (!req.isAuthenticated()) return res.sendStatus(401);
    res.json(req.user);
  });
}