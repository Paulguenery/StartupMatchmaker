import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Express } from "express";
import session from "express-session";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { storage } from "./storage";

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
  // Configuration simple de la session
  app.use(session({
    secret: 'mymate_secret_key_2024',
    resave: false,
    saveUninitialized: false,
    cookie: { 
      maxAge: 24 * 60 * 60 * 1000,
      secure: false
    }
  }));

  app.use(passport.initialize());
  app.use(passport.session());

  // Configuration de base de Passport
  passport.use(new LocalStrategy(
    { usernameField: 'email' },
    async (email, password, done) => {
      try {
        console.log('Tentative de connexion pour:', email);
        const user = await storage.getUserByEmail(email);

        if (!user) {
          console.log('Utilisateur non trouvé:', email);
          return done(null, false);
        }

        const isValid = await comparePasswords(password, user.password);
        console.log('Mot de passe valide:', isValid);

        if (!isValid) {
          return done(null, false);
        }

        return done(null, user);
      } catch (err) {
        console.error('Erreur lors de l\'authentification:', err);
        return done(err);
      }
    }
  ));

  passport.serializeUser((user: any, done) => {
    console.log('Sérialisation de l\'utilisateur:', user.id);
    done(null, user.id);
  });

  passport.deserializeUser(async (id: number, done) => {
    try {
      console.log('Désérialisation de l\'utilisateur:', id);
      const user = await storage.getUser(id);
      done(null, user);
    } catch (err) {
      console.error('Erreur lors de la désérialisation:', err);
      done(err);
    }
  });

  // Routes d'authentification simplifiées
  app.post('/api/register', async (req, res) => {
    try {
      console.log('Données d\'inscription reçues:', req.body);
      const existingUser = await storage.getUserByEmail(req.body.email);

      if (existingUser) {
        return res.status(400).json({ message: 'Email déjà utilisé' });
      }

      const hashedPassword = await hashPassword(req.body.password);
      const user = await storage.createUser({
        ...req.body,
        password: hashedPassword
      });

      req.login(user, (err) => {
        if (err) {
          console.error('Erreur lors de la connexion après inscription:', err);
          return res.status(500).json({ message: 'Erreur lors de la connexion' });
        }
        res.json(user);
      });
    } catch (error) {
      console.error('Erreur lors de l\'inscription:', error);
      res.status(500).json({ message: 'Erreur lors de l\'inscription' });
    }
  });

  app.post('/api/login', (req, res, next) => {
    console.log('Tentative de connexion avec:', req.body);

    passport.authenticate('local', (err, user, info) => {
      if (err) {
        console.error('Erreur d\'authentification:', err);
        return res.status(500).json({ message: 'Erreur serveur' });
      }

      if (!user) {
        return res.status(401).json({ message: 'Email ou mot de passe incorrect' });
      }

      req.login(user, (err) => {
        if (err) {
          console.error('Erreur de login:', err);
          return res.status(500).json({ message: 'Erreur lors de la connexion' });
        }

        console.log('Connexion réussie pour:', user.email);
        res.json(user);
      });
    })(req, res, next);
  });

  app.post('/api/logout', (req, res) => {
    const userEmail = req.user?.email;
    console.log('Déconnexion pour:', userEmail);

    req.logout((err) => {
      if (err) {
        console.error('Erreur de déconnexion:', err);
        return res.status(500).json({ message: 'Erreur lors de la déconnexion' });
      }
      res.sendStatus(200);
    });
  });

  app.get('/api/user', (req, res) => {
    console.log('Vérification de session, authentifié:', req.isAuthenticated());
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: 'Non authentifié' });
    }
    res.json(req.user);
  });
}