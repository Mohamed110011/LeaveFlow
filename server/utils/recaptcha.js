const axios = require('axios');

const verifyRecaptcha = async (token) => {
  try {
    console.log('Début de la vérification reCAPTCHA');
    
    // Skip reCAPTCHA verification in development mode with bypass token
    if (process.env.NODE_ENV === 'development' && token === 'dev-bypass-token') {
      console.log('⚠️  DEVELOPMENT MODE: Bypassing reCAPTCHA verification');
      return true;
    }
    
    if (!token) {
      console.error('Pas de token reCAPTCHA fourni');
      return false;
    }

    const secretKey = process.env.RECAPTCHA_SECRET_KEY;
    console.log('Secret key configured:', !!secretKey);
    
    if (!secretKey) {
      console.error('RECAPTCHA_SECRET_KEY non définie dans les variables d\'environnement');
      throw new Error('reCAPTCHA secret key not configured');
    }

    // Check if secret key is still a placeholder
    if (secretKey.includes('votre_recaptcha') || secretKey.includes('your_recaptcha')) {
      console.error('RECAPTCHA_SECRET_KEY semble être une valeur de placeholder');
      throw new Error('reCAPTCHA secret key not properly configured - placeholder value detected');
    }

    // Log les premiers caractères de la clé secrète pour debug (sécurité)
    console.log('Secret key starts with:', secretKey.substring(0, 6) + '...');
    console.log('Token starts with:', token.substring(0, 20) + '...');

    const verifyURL = 'https://www.google.com/recaptcha/api/siteverify';
    
    // Utilisation de URLSearchParams pour formater les données
    const params = new URLSearchParams();
    params.append('secret', secretKey);
    params.append('response', token);

    const response = await axios.post(verifyURL, params, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });

    console.log('Réponse complète de Google:', JSON.stringify(response.data, null, 2));

    if (response.data.success) {
      console.log('Vérification reCAPTCHA réussie');
      return true;
    } else {
      console.error('Échec de la vérification reCAPTCHA');
      if (response.data['error-codes']) {
        console.error('Codes d\'erreur:', response.data['error-codes']);
        
        // Provide more specific error messages
        const errors = response.data['error-codes'];
        if (errors.includes('invalid-input-secret')) {
          throw new Error('Invalid reCAPTCHA secret key');
        }
        if (errors.includes('invalid-input-response')) {
          throw new Error('Invalid reCAPTCHA response token');
        }
        if (errors.includes('timeout-or-duplicate')) {
          throw new Error('reCAPTCHA token has expired or been used already');
        }
      }
      return false;
    }
  } catch (error) {
    console.error('Erreur lors de la vérification reCAPTCHA:', error.message);
    if (error.response) {
      console.error('Données de la réponse:', error.response.data);
      console.error('Statut de la réponse:', error.response.status);
    }
    throw error;
  }
};

module.exports = { verifyRecaptcha };
