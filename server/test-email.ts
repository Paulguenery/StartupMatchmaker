import nodemailer from 'nodemailer';

// Configuration Gmail optimisée
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: "jecontactmymate@gmail.com",
    pass: "pymt lhgd onbb agee"
  }
});

async function testEmail() {
  try {
    // Test de connexion
    console.log('Vérification de la connexion SMTP...');
    await transporter.verify();
    console.log('Connexion SMTP réussie !');

    // Envoi d'un email de test
    console.log('Tentative d\'envoi d\'un email de test...');
    const info = await transporter.sendMail({
      from: '"Mymate Support" <jecontactmymate@gmail.com>',
      to: "jecontactmymate@gmail.com", // envoi à la même adresse pour le test
      subject: "Test Email Mymate",
      text: "Si vous recevez cet email, la configuration SMTP fonctionne correctement.",
      html: "<p>Si vous recevez cet email, la configuration SMTP fonctionne correctement.</p>"
    });

    console.log('Email de test envoyé avec succès !');
    console.log('Message ID:', info.messageId);
    console.log('Preview URL:', nodemailer.getTestMessageUrl(info));

  } catch (error) {
    console.error('Erreur détaillée:', error);
    if (error instanceof Error) {
      console.error('Message:', error.message);
      console.error('Stack:', error.stack);
    }
  }
}

// Exécuter le test
testEmail();
