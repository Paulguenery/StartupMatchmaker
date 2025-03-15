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

// Fonction pour générer un code de parrainage unique
function generateReferralCode() {
  return nanoid(8).toUpperCase(); // Génère un code de 8 caractères en majuscules
}

export function setupAuth(app: Express) {
  app.use(session({
    secret: 'mymate_secret_key_2024',
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true,
      sameSite: 'lax'
      // La durée sera définie dynamiquement lors de la connexion
    },
    name: 'mymate.sid'
  }));

  app.use(passport.initialize());
  app.use(passport.session());

  passport.use(new LocalStrategy(
    { usernameField: 'email', passReqToCallback: true },
    async (req, email, password, done) => {
      try {
        console.log('Tentative de connexion pour:', email);
        const user = await storage.getUserByEmail(email);

        if (!user) {
          console.log('Utilisateur non trouvé:', email);
          return done(null, false, { message: 'Email ou mot de passe incorrect' });
        }

        const isValid = await comparePasswords(password, user.password);
        console.log('Mot de passe valide:', isValid);

        if (!isValid) {
          return done(null, false, { message: 'Email ou mot de passe incorrect' });
        }

        // Si Remember Me est activé, on prolonge la session
        if (req.body.rememberMe) {
          req.session.cookie.maxAge = 30 * 24 * 60 * 60 * 1000; // 30 jours
        } else {
          req.session.cookie.maxAge = 24 * 60 * 60 * 1000; // 24 heures
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
      if (!user) {
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

      // Génération du code de parrainage unique
      const referralCode = generateReferralCode();

      // Vérification du code de parrainage si fourni
      let referrerId = null;
      if (req.body.referredBy) {
        const referrer = await storage.getUserByReferralCode(req.body.referredBy);
        if (!referrer) {
          return res.status(400).json({ message: 'Code de parrainage invalide' });
        }
        referrerId = referrer.id;
      }

      const hashedPassword = await hashPassword(req.body.password);
      const userData = {
        ...req.body,
        password: hashedPassword,
        bio: req.body.bio || "",
        skills: req.body.skills || [],
        location: req.body.location || null,
        collaborationType: req.body.collaborationType || "full_time",
        experienceLevel: req.body.experienceLevel || "junior",
        availability: req.body.availability || "immediate",
        isVerified: false,
        isPremium: false,
        referralCode, // Ajout du code de parrainage
      };

      const user = await storage.createUser(userData);

      // Création de la relation de parrainage si un code valide a été utilisé
      if (referrerId) {
        await storage.createReferral({
          referrerId,
          referredId: user.id,
          status: "pending"
        });
      }

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

        // Si Remember Me est activé, on prolonge la session
        if (req.body.rememberMe) {
          req.session.cookie.maxAge = 30 * 24 * 60 * 60 * 1000; // 30 jours
        } else {
          req.session.cookie.maxAge = 24 * 60 * 60 * 1000; // 24 heures
        }

        console.log('Connexion réussie pour:', user.email);
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
    console.log('Vérification de session, authentifié:', req.isAuthenticated());
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
}