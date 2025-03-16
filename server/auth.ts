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
  app.use(session({
    secret: process.env.SESSION_SECRET || 'mymate_secret_key_2024',
    resave: false,
    saveUninitialized: false,
    name: 'mymate.sid',
    cookie: {
      secure: false, // Pour le développement
      httpOnly: true,
      sameSite: 'lax',
      maxAge: 24 * 60 * 60 * 1000, // 24 heures
    }
  }));

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
      if (!user) {
        console.log('Utilisateur non trouvé lors de la désérialisation:', id);
        return done(null, false);
      }
      console.log('Utilisateur désérialisé avec succès:', user.email);
      done(null, user);
    } catch (err) {
      console.error('Erreur lors de la désérialisation:', err);
      done(err);
    }
  });

  app.post('/api/register', async (req, res) => {
    try {
      const { email, password, fullName, role } = req.body;
      console.log('Tentative d\'inscription:', email);

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
        accountStatus: "active"
      });

      req.login(user, (err) => {
        if (err) {
          console.error('Erreur lors de la connexion après inscription:', err);
          return res.status(500).json({ message: 'Erreur lors de la connexion' });
        }
        console.log('Inscription et connexion réussies pour:', email);
        res.json({ 
          id: user.id, 
          email: user.email, 
          fullName: user.fullName, 
          role: user.role 
        });
      });
    } catch (error) {
      console.error('Erreur lors de l\'inscription:', error);
      res.status(500).json({ message: 'Erreur lors de l\'inscription' });
    }
  });

  app.post('/api/login', (req, res, next) => {
    console.log('Tentative de connexion reçue:', req.body.email);
    passport.authenticate('local', (err: any, user: any, info: any) => {
      if (err) {
        console.error('Erreur lors de l\'authentification:', err);
        return res.status(500).json({ message: 'Erreur serveur' });
      }

      if (!user) {
        console.log('Échec de l\'authentification:', info?.message);
        return res.status(401).json({ message: info?.message || 'Email ou mot de passe incorrect' });
      }

      req.login(user, (err) => {
        if (err) {
          console.error('Erreur lors de la connexion:', err);
          return res.status(500).json({ message: 'Erreur lors de la connexion' });
        }
        console.log('Connexion réussie pour:', user.email);
        res.json({ 
          id: user.id, 
          email: user.email, 
          fullName: user.fullName, 
          role: user.role,
          isPremium: user.isPremium || user.role === 'project_owner' || user.role === 'admin'
        });
      });
    })(req, res, next);
  });

  app.get('/api/user', (req, res) => {
    console.log('Requête /api/user - Authentifié:', req.isAuthenticated());
    console.log('Session:', req.session);
    console.log('Utilisateur:', req.user);

    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: 'Non authentifié' });
    }
    const user = req.user as any;
    res.json({ 
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
      isPremium: user.isPremium || user.role === 'project_owner' || user.role === 'admin'
    });
  });
  app.post('/api/logout', (req, res) => {
    const userEmail = (req.user as any)?.email;
    console.log('Tentative de déconnexion pour:', userEmail);
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
        console.log('Déconnexion réussie pour:', userEmail);
        res.clearCookie('mymate.sid');
        res.sendStatus(200);
      });
    });
  });
  app.post('/api/reset-password', async (req, res) => {
    try {
      const { email } = req.body;
      console.log('Demande de réinitialisation pour:', email);

      const user = await storage.getUserByEmail(email);
      if (!user) {
        // Pour des raisons de sécurité, on renvoie toujours un succès
        return res.json({
          message: 'Si un compte existe avec cet email, vous recevrez un lien de réinitialisation.'
        });
      }

      // Générer un token unique
      const resetToken = randomBytes(32).toString('hex');
      const resetTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 heures

      // Stocker le token dans la base de données
      await storage.updateUser(user.id, {
        resetToken,
        resetTokenExpiry: resetTokenExpiry.toISOString(),
      });

      // Envoyer l'email avec le lien de réinitialisation
      //await sendPasswordResetEmail(email, resetToken); //Commented out as sendPasswordResetEmail is not defined

      res.json({
        message: 'Si un compte existe avec cet email, vous recevrez un lien de réinitialisation.'
      });
    } catch (error) {
      console.error('Erreur lors de la réinitialisation:', error);
      res.status(500).json({
        message: 'Une erreur est survenue lors de la réinitialisation du mot de passe'
      });
    }
  });

  // Route pour vérifier le token et réinitialiser le mot de passe
  app.post('/api/reset-password/:token', async (req, res) => {
    try {
      const { token } = req.params;
      const { password } = req.body;

      const user = await storage.getUserByResetToken(token);
      if (!user || !user.resetTokenExpiry) {
        return res.status(400).json({ message: 'Token invalide ou expiré' });
      }

      // Vérifier si le token n'a pas expiré
      const tokenExpiry = new Date(user.resetTokenExpiry);
      if (tokenExpiry < new Date()) {
        return res.status(400).json({ message: 'Token expiré' });
      }

      // Hasher le nouveau mot de passe
      const hashedPassword = await hashPassword(password);

      // Mettre à jour le mot de passe et supprimer le token
      await storage.updateUser(user.id, {
        password: hashedPassword,
        resetToken: null,
        resetTokenExpiry: null,
      });

      res.json({ message: 'Mot de passe réinitialisé avec succès' });
    } catch (error) {
      console.error('Erreur lors de la réinitialisation:', error);
      res.status(500).json({
        message: 'Une erreur est survenue lors de la réinitialisation du mot de passe'
      });
    }
  });

  // Nouvelle route pour récupérer les informations de parrainage
  app.get('/api/referrals', async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: 'Non authentifié' });
    }

    try {
      const referrals = await storage.getUserReferrals(req.user.id);
      res.json(referrals);
    } catch (error) {
      console.error('Erreur lors de la récupération des parrainages:', error);
      res.status(500).json({ message: 'Erreur serveur' });
    }
  });

  // Nouvelle route pour mettre à jour le rôle (admin seulement)
  app.patch('/api/user/role', async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: 'Non authentifié' });
    }

    const user = req.user as User;
    if (user.role !== 'admin') {
      return res.status(403).json({ message: 'Non autorisé' });
    }

    try {
      const { role } = req.body;
      if (!['project_owner', 'project_seeker'].includes(role)) {
        return res.status(400).json({ message: 'Rôle invalide' });
      }

      await storage.updateUser(user.id, {
        currentRole: role
      });

      // Mettre à jour la session
      const updatedUser = await storage.getUser(user.id);
      req.login(updatedUser, (err) => {
        if (err) {
          console.error('Erreur lors de la mise à jour de la session:', err);
          return res.status(500).json({ message: 'Erreur lors de la mise à jour de la session' });
        }
        res.json(updatedUser);
      });
    } catch (error) {
      console.error('Erreur lors de la mise à jour du rôle:', error);
      res.status(500).json({ message: 'Erreur lors de la mise à jour du rôle' });
    }
  });
}

interface User {
  id: number;
  email: string;
  password: string;
  fullName?: string;
  role?: string;
  currentRole?: string; // Ajout du champ currentRole pour les admins
  accountStatus?: string;
  documents?: { type: string; verified: boolean }[];
  resetToken?: string | null;
  resetTokenExpiry?: string | null;
  lastLoginAttempt?: Date;
  bio?: string;
  skills?: string[];
  location?: string | null;
  collaborationType?: string;
  experienceLevel?: string;
  availability?: string;
  isVerified?: boolean;
  isPremium?: boolean;
  premiumDiscount?: number;
  freeConversationCredits?: number;
  referralCode?: string;
  isAdult?: boolean;
}