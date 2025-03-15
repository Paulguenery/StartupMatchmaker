import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Express } from "express";
import session from "express-session";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { storage } from "./storage";
import { sendPasswordResetEmail } from './email';
import { nanoid } from 'nanoid';

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

// Admin account credentials
const ADMIN_EMAIL = 'admin@mymate.com';
const ADMIN_PASSWORD = 'admin123!';

export function setupAuth(app: Express) {
  // Créer le compte admin s'il n'existe pas
  async function createAdminAccount() {
    try {
      const existingAdmin = await storage.getUserByEmail(ADMIN_EMAIL);
      if (!existingAdmin) {
        const hashedPassword = await hashPassword(ADMIN_PASSWORD);
        await storage.createUser({
          email: ADMIN_EMAIL,
          password: hashedPassword,
          fullName: 'Admin',
          role: 'admin',
          isVerified: true,
          accountStatus: 'active',
          documents: []
        });
        console.log('Compte admin créé avec succès');
      }
    } catch (error) {
      console.error('Erreur lors de la création du compte admin:', error);
    }
  }

  // Créer le compte admin au démarrage
  createAdminAccount();

  // Configuration de la session
  app.use(session({
    secret: 'mymate_secret_key_2024',
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false, // En développement, pas de HTTPS
      httpOnly: true,
      sameSite: 'lax',
      maxAge: 24 * 60 * 60 * 1000, // 24 heures
      path: '/'
    },
    name: 'mymate.sid'
  }));

  app.use(passport.initialize());
  app.use(passport.session());

  // Fonction pour vérifier les restrictions de connexion
  async function checkLoginRestrictions(user: User): Promise<{ allowed: boolean; message?: string }> {
    console.log('Vérification des restrictions pour:', user.email);

    // Les admins contournent toutes les restrictions
    if (user.role === 'admin') {
      console.log('Utilisateur admin, pas de restrictions');
      return { allowed: true };
    }

    // Vérifier le statut du compte
    if (user.accountStatus === "suspended") {
      return { allowed: false, message: "Votre compte est suspendu. Contactez le support." };
    }
    if (user.accountStatus === "rejected") {
      return { allowed: false, message: "Votre compte n'a pas été approuvé." };
    }

    // Vérifier la pièce d'identité pour les utilisateurs non-admin
    const userDocs = user.documents || [];
    const hasIdCard = userDocs.some(doc => doc.type === "id_card");
    if (!hasIdCard) {
      return {
        allowed: false,
        message: "Vous devez fournir une pièce d'identité valide pour accéder à la plateforme."
      };
    }

    // Restrictions spécifiques pour les freelances (project_seeker)
    if (user.role === "project_seeker" && !user.isAdult) {
      return {
        allowed: false,
        message: "Vous devez certifier être majeur pour accéder à la plateforme."
      };
    }

    return { allowed: true };
  }

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

        if (user.role !== 'admin') {
          // Vérifier les restrictions de connexion seulement pour les non-admins
          const loginCheck = await checkLoginRestrictions(user);
          if (!loginCheck.allowed) {
            console.log('Restrictions de connexion pour:', email, loginCheck.message);
            return done(null, false, { message: loginCheck.message });
          }
        }

        const isValid = await comparePasswords(password, user.password);
        console.log('Validation du mot de passe:', isValid);

        if (!isValid) {
          return done(null, false, { message: 'Email ou mot de passe incorrect' });
        }

        // Mettre à jour la dernière tentative de connexion
        await storage.updateUser(user.id, {
          lastLoginAttempt: new Date()
        });

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
      done(null, user);
    } catch (err) {
      console.error('Erreur lors de la désérialisation:', err);
      done(err);
    }
  });

  // Routes d'authentification
  app.post('/api/register', async (req, res) => {
    try {
      console.log('Données d\'inscription reçues:', req.body);

      const existingUser = await storage.getUserByEmail(req.body.email);
      if (existingUser) {
        return res.status(400).json({ message: 'Email déjà utilisé' });
      }

      const hashedPassword = await hashPassword(req.body.password);
      const userData = {
        ...req.body,
        password: hashedPassword,
        accountStatus: "active", // Pour les admins
        documents: []
      };

      const user = await storage.createUser(userData);

      // Connecter l'utilisateur automatiquement après l'inscription
      req.login(user, (err) => {
        if (err) {
          console.error('Erreur lors de la connexion après inscription:', err);
          return res.status(500).json({ message: 'Erreur lors de la connexion' });
        }

        res.json({
          message: 'Inscription réussie',
          user: {
            id: user.id,
            email: user.email,
            fullName: user.fullName,
            role: user.role
          }
        });
      });
    } catch (error) {
      console.error('Erreur lors de l\'inscription:', error);
      res.status(500).json({ message: 'Erreur lors de l\'inscription' });
    }
  });

  app.post('/api/login', (req, res, next) => {
    console.log('Tentative de connexion avec:', req.body);
    console.log('Remember Me:', req.body.rememberMe);

    passport.authenticate('local', (err: any, user: any, info: any) => {
      if (err) {
        console.error('Erreur d\'authentification:', err);
        return res.status(500).json({ message: 'Erreur serveur' });
      }

      if (!user) {
        return res.status(401).json({ message: info?.message || 'Email ou mot de passe incorrect' });
      }

      req.login(user, (err) => {
        if (err) {
          console.error('Erreur de login:', err);
          return res.status(500).json({ message: 'Erreur lors de la connexion' });
        }

        if (req.body.rememberMe) {
          req.session.cookie.maxAge = 30 * 24 * 60 * 60 * 1000; // 30 jours
        }

        console.log('Connexion réussie pour:', user.email);
        console.log('Session ID:', req.sessionID);
        console.log('Cookie:', req.session.cookie);

        res.json(user);
      });
    })(req, res, next);
  });

  app.post('/api/logout', (req, res) => {
    console.log('Déconnexion pour:', req.user);
    req.logout((err) => {
      if (err) {
        console.error('Erreur de déconnexion:', err);
        return res.status(500).json({ message: 'Erreur lors de la déconnexion' });
      }
      res.sendStatus(200);
    });
  });

  app.get('/api/user', (req, res) => {
    console.log('Vérification de session:', req.sessionID);
    console.log('Utilisateur authentifié:', req.isAuthenticated());
    console.log('Session:', req.session);
    console.log('User:', req.user);

    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: 'Non authentifié' });
    }
    res.json(req.user);
  });
  // Updated reset password route with email sending
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
      await sendPasswordResetEmail(email, resetToken);

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

// Fonction pour générer un code de parrainage unique
function generateReferralCode() {
  return nanoid(8).toUpperCase();
}