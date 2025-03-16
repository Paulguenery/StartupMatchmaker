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
  // Configuration de la session
  const sessionConfig = {
    secret: process.env.SESSION_SECRET || 'mymate_secret_key_2024',
    resave: false,
    saveUninitialized: false,
    name: 'mymate.sid',
    cookie: {
      secure: false, // Pour le développement local
      httpOnly: true,
      sameSite: 'lax' as const,
      path: '/',
      maxAge: 24 * 60 * 60 * 1000 // 24 heures
    },
    store: storage.sessionStore
  };

  // Configuration du CSP
  app.use((req, res, next) => {
    res.setHeader(
      'Content-Security-Policy',
      "default-src 'self'; style-src 'self' 'unsafe-inline'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com; connect-src 'self' https://api.stripe.com; frame-src 'self' https://js.stripe.com; img-src 'self' data: https://*.stripe.com;"
    );
    next();
  });

  app.set("trust proxy", 1);
  app.use(session(sessionConfig));
  app.use(passport.initialize());
  app.use(passport.session());

  passport.use(new LocalStrategy(
    { usernameField: 'email' },
    async (email, password, done) => {
      try {
        console.log('Tentative de connexion pour:', email);
        const user = await storage.getUserByEmail(email);
        if (!user) {
          console.log('Utilisateur non trouvé:', email);
          return done(null, false, { message: 'Email ou mot de passe incorrect' });
        }

        const isValid = await comparePasswords(password, user.password);
        console.log('Validation du mot de passe:', isValid);
        if (!isValid) {
          return done(null, false, { message: 'Email ou mot de passe incorrect' });
        }

        console.log('Connexion réussie pour:', email);
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
      console.log('Utilisateur désérialisé:', user);
      done(null, user);
    } catch (err) {
      console.error('Erreur lors de la désérialisation:', err);
      done(err);
    }
  });

  // Routes d'authentification
  app.post('/api/register', async (req, res) => {
    try {
      console.log('Tentative d\'inscription:', req.body);
      const { email, password, fullName, role } = req.body;

      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        return res.status(400).json({ message: 'Email déjà utilisé' });
      }

      const hashedPassword = await hashPassword(password);
      const user = await storage.createUser({
        email,
        password: hashedPassword,
        fullName,
        role,
        isPremium: role === 'project_owner'
      });

      req.login(user, (err) => {
        if (err) {
          console.error('Erreur lors de la connexion après inscription:', err);
          return res.status(500).json({ message: 'Erreur lors de la connexion' });
        }
        console.log('Inscription réussie pour:', user.email);
        res.json(user);
      });
    } catch (error) {
      console.error('Erreur lors de l\'inscription:', error);
      res.status(500).json({ message: 'Erreur lors de l\'inscription' });
    }
  });

  app.post('/api/login', (req, res, next) => {
    console.log('Tentative de connexion avec:', req.body);
    passport.authenticate('local', (err: any, user: any, info: any) => {
      if (err) {
        console.error('Erreur lors de la connexion:', err);
        return res.status(500).json({ message: 'Erreur serveur' });
      }

      if (!user) {
        return res.status(401).json({ message: info?.message || 'Email ou mot de passe incorrect' });
      }

      req.login(user, (err) => {
        if (err) {
          console.error('Erreur lors de la connexion après authentification:', err);
          return res.status(500).json({ message: 'Erreur lors de la connexion' });
        }
        console.log('Connexion réussie pour:', user.email);
        res.json(user);
      });
    })(req, res, next);
  });

  app.get('/api/user', (req, res) => {
    console.log('Vérification de l\'authentification:', req.isAuthenticated(), req.user);
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: 'Non authentifié' });
    }
    res.json(req.user);
  });

  app.post('/api/logout', (req, res) => {
    req.logout((err) => {
      if (err) {
        console.error('Erreur lors de la déconnexion:', err);
        return res.status(500).json({ message: 'Erreur lors de la déconnexion' });
      }
      req.session.destroy((err) => {
        if (err) {
          console.error('Erreur lors de la destruction de la session:', err);
          return res.status(500).json({ message: 'Erreur lors de la déconnexion' });
        }
        res.clearCookie('mymate.sid');
        res.sendStatus(200);
      });
    });
  });
}