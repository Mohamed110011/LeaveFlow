import React, { useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import "../assets/css/ForgotPassword.css";
import config from '../config';

// Simplified version without reCAPTCHA for testing
const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const response = await fetch(`${config.API_URL}/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email })
      });

      const data = await response.json();
      
      if (response.ok) {
        setSuccess(true);
        toast.success("Un email de réinitialisation a été envoyé à votre adresse email");
        setEmail("");
      } else {
        toast.error(data.message || "Une erreur est survenue");
      }
    } catch (error) {
      console.error(error);
      toast.error("Une erreur est survenue lors de l'envoi de la demande");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="forgot-password-container">
      <h1>Réinitialisation du mot de passe</h1>
      
      {success ? (
        <div className="success-message">
          <p>Si cette adresse email existe dans notre système, vous recevrez un email avec les instructions pour réinitialiser votre mot de passe.</p>
          <p>Vérifiez votre boîte de réception (et éventuellement vos spams).</p>
          <Link to="/login" className="back-to-login">
            Retour à la connexion
          </Link>
        </div>
      ) : (
        <>
          <p className="instructions">
            Entrez votre adresse email pour recevoir un lien de réinitialisation de votre mot de passe.
          </p>
          
          <form onSubmit={handleSubmit}>
            <input
              type="email"
              className="input-field"
              placeholder="Adresse email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required        
            />
            
            <button 
              type="submit" 
              className="btn-reset"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Envoi en cours..." : "Envoyer le lien"}
            </button>
          </form>

          <Link to="/login" className="back-to-login">
            Retour à la connexion
          </Link>
        </>
      )}
    </div>
  );
};

export default ForgotPassword;
