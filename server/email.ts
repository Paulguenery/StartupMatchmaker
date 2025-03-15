import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false, // true pour 465, false pour les autres ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  debug: true, // Active les logs de débogage
  logger: true // Active le logger
});

export async function sendPasswordResetEmail(email: string, resetToken: string) {
  const resetLink = `${process.env.NODE_ENV === 'production' 
    ? 'https://' + process.env.REPL_SLUG + '.repl.co'
    : 'http://localhost:5000'}/reset-password/${resetToken}`;

  console.log('Configuration SMTP:', {
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    user: process.env.SMTP_USER,
    // Ne pas logger le mot de passe
  });

  const mailOptions = {
    from: process.env.SMTP_USER,
    to: email,
    subject: 'Réinitialisation de votre mot de passe Mymate',
    html: `
      <h1>Réinitialisation de votre mot de passe</h1>
      <p>Vous avez demandé la réinitialisation de votre mot de passe.</p>
      <p>Cliquez sur le lien ci-dessous pour choisir un nouveau mot de passe :</p>
      <a href="${resetLink}" style="display: inline-block; padding: 10px 20px; background-color: #0077FF; color: white; text-decoration: none; border-radius: 5px;">
        Réinitialiser mon mot de passe
      </a>
      <p>Ce lien expirera dans 24 heures.</p>
      <p>Si vous n'avez pas demandé cette réinitialisation, ignorez cet email.</p>
    `,
  };

  try {
    console.log('Tentative d\'envoi d\'email à:', email);
    console.log('Lien de réinitialisation:', resetLink);

    const info = await transporter.sendMail(mailOptions);
    console.log('Email envoyé avec succès:', info.response);
    console.log('ID du message:', info.messageId);

    return info;
  } catch (error) {
    console.error('Erreur détaillée lors de l\'envoi de l\'email:', error);
    throw new Error('Erreur lors de l\'envoi de l\'email de réinitialisation');
  }
}