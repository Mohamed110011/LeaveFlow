import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import '../assets/css/ResetPassword.css';
import config from '../config';

// Simplified version without reCAPTCHA for testing
const ResetPassword = () => {
  const [passwords, setPasswords] = useState({
    password: '',
    confirmPassword: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [tokenStatus, setTokenStatus] = useState('validating'); // 'validating', 'valid', 'invalid'
  const { token } = useParams();
  const navigate = useNavigate();

  // Validate token on component mount
  useEffect(() => {
    const validateToken = async () => {
      try {
        const response = await fetch(`${config.API_URL}/auth/validate-token`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ token })
        });

        if (response.ok) {
          setTokenStatus('valid');
        } else {
          setTokenStatus('invalid');
          toast.error("Le lien de réinitialisation est invalide ou a expiré");
          setTimeout(() => {
            navigate('/login');
          }, 5000);
        }
      } catch (error) {
        console.error('Error validating token:', error);
        setTokenStatus('invalid');
        toast.error("Erreur lors de la validation du lien de réinitialisation");
      }
    };

    validateToken();
  }, [token, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setPasswords(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (passwords.password !== passwords.confirmPassword) {
      toast.error("Les mots de passe ne correspondent pas");
      return;
    }

    if (passwords.password.length < 6) {
      toast.error("Le mot de passe doit contenir au moins 6 caractères");
      return;
    }
    
    try {
      setIsSubmitting(true);
      const response = await fetch(`${config.API_URL}/auth/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          token,
          newPassword: passwords.password
        })
      });

      const data = await response.json();

      if (response.ok) {
        toast.success("Votre mot de passe a été réinitialisé avec succès");
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      } else {
        toast.error(data.message || "Une erreur est survenue");
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error("Une erreur est survenue lors de la réinitialisation");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (tokenStatus === 'validating') {
    return (
      <div className="reset-password-container">
        <h1>Vérification du lien de réinitialisation</h1>
        <div className="loading-indicator">Veuillez patienter...</div>
      </div>
    );
  }

  if (tokenStatus === 'invalid') {
    return (
      <div className="reset-password-container">
        <h1>Lien invalide ou expiré</h1>
        <p className="error-message">
          Le lien de réinitialisation que vous avez utilisé est invalide ou a expiré.
          Vous allez être redirigé vers la page de connexion dans quelques secondes.
        </p>
      </div>
    );
  }

  return (
    <div className="reset-password-container">
      <h1>Réinitialisation du mot de passe</h1>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="password">Nouveau mot de passe</label>
          <input
            type="password"
            id="password"
            name="password"
            className="input-field"
            value={passwords.password}
            onChange={handleChange}
            required
            minLength="6"
            placeholder="Entrez votre nouveau mot de passe"
          />
        </div>

        <div className="form-group">
          <label htmlFor="confirmPassword">Confirmez le mot de passe</label>
          <input
            type="password"
            id="confirmPassword"
            name="confirmPassword"
            className="input-field"
            value={passwords.confirmPassword}
            onChange={handleChange}
            required
            minLength="6"
            placeholder="Confirmez votre nouveau mot de passe"
          />
        </div>

        <button 
          type="submit" 
          className="btn-reset"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Réinitialisation..." : "Réinitialiser le mot de passe"}
        </button>
      </form>
    </div>
  );
};

export default ResetPassword;
