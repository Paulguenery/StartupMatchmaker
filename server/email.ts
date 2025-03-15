import nodemailer from 'nodemailer';

// Créer le transporteur avec les options de débogage
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false, // true pour 465, false pour les autres ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  tls: {
    rejectUnauthorized: false // Pour le développement, à supprimer en production
  },
  debug: true,
  logger: true
});

// Vérifier la connexion au démarrage
transporter.verify(function(error, success) {
  if (error) {
    console.error('Erreur de configuration SMTP:', error);
  } else {
    console.log('Serveur SMTP prêt à envoyer des emails');
    console.log('Configuration SMTP:', {
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      user: process.env.SMTP_USER
    });
  }
});

export async function sendPasswordResetEmail(email: string, resetToken: string) {
  try {
    console.log('Préparation de l\'envoi d\'email à:', email);

    const resetLink = `${process.env.NODE_ENV === 'production' 
      ? 'https://' + process.env.REPL_SLUG + '.repl.co'
      : 'http://localhost:5000'}/reset-password/${resetToken}`;

    console.log('Lien de réinitialisation généré:', resetLink);

    const mailOptions = {
      from: {
        name: 'Mymate Support',
        address: process.env.SMTP_USER || ''
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

    console.log('Tentative d\'envoi avec les options:', {
      to: mailOptions.to,
      subject: mailOptions.subject,
      from: mailOptions.from
    });

    const info = await transporter.sendMail(mailOptions);

    console.log('Email envoyé avec succès:', {
      messageId: info.messageId,
      response: info.response,
      accepted: info.accepted,
      rejected: info.rejected
    });

    return info;
  } catch (error) {
    console.error('Erreur détaillée lors de l\'envoi de l\'email:', error);
    if (error instanceof Error) {
      console.error('Message d\'erreur:', error.message);
      console.error('Stack trace:', error.stack);
    }
    throw new Error('Erreur lors de l\'envoi de l\'email de réinitialisation');
  }
}