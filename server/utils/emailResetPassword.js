const nodemailer = require('nodemailer');
require('dotenv').config();

// Log the email environment variables (without showing the actual password)
console.log('EMAIL_USER environment variable is set:', !!process.env.EMAIL_USER);
console.log('EMAIL_PASSWORD environment variable is set:', !!process.env.EMAIL_PASSWORD);

// Configuration du transporteur d'email
let transporter;

try {
  transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER || 'test@example.com', // Default for testing
      pass: process.env.EMAIL_PASSWORD || 'testpassword'  // Default for testing
    },
    tls: {
      rejectUnauthorized: false
    }
  });
} catch (error) {
  console.error('Error creating email transporter:', error);
}

const sendResetPasswordEmail = async (email, resetToken) => {
  try {
    // For testing in development without real email
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
      console.log('=== RESET PASSWORD EMAIL WOULD BE SENT ===');
      console.log('To:', email);
      console.log('Reset Link:', `${process.env.CLIENT_URL || 'http://localhost:3000'}/reset-password/${resetToken}`);
      console.log('======================================');
      return true;
    }
    
    const resetLink = `${process.env.CLIENT_URL || 'http://localhost:3000'}/reset-password/${resetToken}`;
    
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Réinitialisation de votre mot de passe',
      html: `
        <h1>Réinitialisation de votre mot de passe</h1>
        <p>Vous avez demandé la réinitialisation de votre mot de passe.</p>
        <p>Cliquez sur le lien ci-dessous pour réinitialiser votre mot de passe :</p>
        <a href="${resetLink}">${resetLink}</a>
        <p>Ce lien expirera dans 1 heure.</p>
        <p>Si vous n'avez pas demandé cette réinitialisation, vous pouvez ignorer cet email.</p>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email envoyé:', info.response);
    return true;
  } catch (error) {
    console.error('Erreur lors de l\'envoi de l\'email:', error);
    throw new Error('Erreur lors de l\'envoi de l\'email de réinitialisation');
  }
};

module.exports = { sendResetPasswordEmail };
