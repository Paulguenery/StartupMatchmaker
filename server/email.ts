import nodemailer from 'nodemailer';

// Créer le transporteur avec les options de débogage
let transporter: nodemailer.Transporter | null = null;

// Initialiser le transporteur de manière asynchrone
async function initializeTransporter() {
  try {
    // En développement, désactiver l'email
    if (process.env.NODE_ENV !== 'production') {
      console.log('Mode développement : service d\'email désactivé');
      return;
    }

    // En production, configurer le transporteur
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      secure: true,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
      debug: true,
      logger: true
    });

    // Vérifier la configuration
    await transporter.verify();
    console.log('Serveur SMTP prêt à envoyer des emails');
  } catch (error) {
    console.error('Erreur de configuration SMTP:', error);
    transporter = null;
  }
}

// Initialiser au démarrage
initializeTransporter().catch(console.error);

export async function sendPasswordResetEmail(email: string, resetToken: string) {
  try {
    // Simuler l'envoi en développement
    if (!transporter) {
      console.log('Mode développement : simulation d\'envoi d\'email');
      console.log('Email destiné à:', email);
      console.log('Token de réinitialisation:', resetToken);
      return;
    }

    const resetLink = `${process.env.NODE_ENV === 'production' 
      ? 'https://' + process.env.REPL_SLUG + '.repl.co'
      : 'http://localhost:5000'}/reset-password/${resetToken}`;

    const mailOptions = {
      from: {
        name: 'Mymate Support',
        address: process.env.SMTP_USER || 'no-reply@mymate.com'
      },
      to: email,
      subject: 'Réinitialisation de votre mot de passe Mymate',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #333; text-align: center;">Réinitialisation de votre mot de passe</h1>
          <p>Vous avez demandé la réinitialisation de votre mot de passe.</p>
          <p>Cliquez sur le lien ci-dessous pour choisir un nouveau mot de passe :</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetLink}" 
               style="display: inline-block; padding: 12px 24px; 
                      background-color: #0077FF; color: white; 
                      text-decoration: none; border-radius: 5px;
                      font-weight: bold;">
              Réinitialiser mon mot de passe
            </a>
          </div>
          <p style="color: #666; font-size: 14px;">Ce lien expirera dans 24 heures.</p>
          <p style="color: #666; font-size: 14px;">Si vous n'avez pas demandé cette réinitialisation, ignorez cet email.</p>
          <hr style="border: 1px solid #eee; margin: 30px 0;" />
          <p style="color: #999; font-size: 12px; text-align: center;">
            Cet email a été envoyé automatiquement par Mymate. Merci de ne pas y répondre.
          </p>
        </div>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email envoyé avec succès:', info.messageId);
    return info;
  } catch (error) {
    console.error('Erreur lors de l\'envoi de l\'email:', error);
    return;
  }
}