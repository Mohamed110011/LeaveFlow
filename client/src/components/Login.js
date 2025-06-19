import React, { Fragment, useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import { jwtDecode } from "jwt-decode";
import ReCAPTCHA from 'react-google-recaptcha';
import "../assets/css/Login.css";
import config from "../config";

const Login = ({ setAuth }) => {
  const navigate = useNavigate();
  const [inputs, setInputs] = useState({
    email: "",
    password: ""
  });
  const [captchaToken, setCaptchaToken] = useState(null);
  const [captchaError, setCaptchaError] = useState(false);
  const [showCaptchaWarning, setShowCaptchaWarning] = useState(false);
  const recaptchaRef = useRef(null);

  const { email, password } = inputs;

  // Gestionnaire de connexion Google
  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const decoded = jwtDecode(credentialResponse.credential);
      console.log('Google sign-in successful:', {
        name: decoded.name,
        email: decoded.email
      });

      const body = {
        email: decoded.email,
        google_id: decoded.sub,
        name: decoded.name
      };

      const response = await fetch(`${config.API_URL}/auth/google`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      });

      const parseRes = await response.json();

      if (parseRes.token) {
        localStorage.setItem("token", parseRes.token);
        localStorage.setItem("role", parseRes.role);
        setAuth(true, parseRes.role);
        toast.success("Connexion avec Google réussie");

        // Redirection en fonction du rôle
        switch(parseRes.role) {
          case "admin":
            navigate("/dashboard-admin");
            break;
          case "manager":
            navigate("/dashboard-manager");
            break;
          case "rh":
            navigate("/dashboard-hr");
            break;
          case "employee":
            navigate("/dashboard-employee");
            break;
          default:
            navigate("/dashboard-user");
        }
      } else {
        setAuth(false);
        toast.error(parseRes);
      }
    } catch (err) {
      console.error('Google sign-in error:', err);
      toast.error("La connexion avec Google a échoué");
    }
  };

  const handleGoogleFailure = () => {
    toast.error("La connexion avec Google a échoué");
  };

  const onChange = (e) => {
    setInputs({ ...inputs, [e.target.name]: e.target.value });
  };

  const handleCaptchaChange = (token) => {
    setCaptchaToken(token);
    setCaptchaError(false);
    setShowCaptchaWarning(false);
  };

  const onSubmitForm = async (e) => {
    e.preventDefault();
    
    if (!captchaToken) {
      setCaptchaError(true);
      setShowCaptchaWarning(true);
      toast.error("⚠️ Validation du captcha requise", {
        position: "top-center",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        style: {
          backgroundColor: '#ffebee',
          color: '#d32f2f',
          border: '1px solid #ef5350',
          borderRadius: '8px',
          fontSize: '16px',
          fontWeight: 'bold'
        }
      });
      return;
    }
    
    try {
      const body = { email, password, captchaToken };
      const response = await fetch(`${config.API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      });

      const parseRes = await response.json();
      if (parseRes.token) {
        localStorage.setItem("token", parseRes.token);
        localStorage.setItem("role", parseRes.role);
        setAuth(true, parseRes.role);
        toast.success("Connexion réussie");

        // Redirection en fonction du rôle
        if (parseRes.role === "admin") {
          navigate("/dashboard-admin");
        } else if (parseRes.role === "manager") {
          navigate("/dashboard-manager");
        } else if (parseRes.role === "rh") {
          navigate("/dashboard-hr"); 
        } else if (parseRes.role === "employee") {
          navigate("/dashboard-employee");
        } else {
          navigate("/dashboard-user");
        }
      } else {
        setAuth(false);
        toast.error(parseRes);
      }
    } catch (err) {
      console.error(err.message);
      toast.error("Erreur lors de la connexion");
    }
  };

  return (
    <Fragment>
      <div className="login-container">
        <h1>Login</h1>
        <form onSubmit={onSubmitForm}>
          <input
            className="input-field"
            type="email"
            name="email"
            placeholder="Email"
            value={email}
            onChange={onChange}
            required
          />
          <input
            className="input-field"
            type="password"
            name="password"
            placeholder="Password"
            value={password}
            onChange={onChange}
            required
          />
          
          <div className="recaptcha-container" style={{ marginTop: '20px', textAlign: 'center' }}>
            <ReCAPTCHA
              ref={recaptchaRef}
              sitekey={config.RECAPTCHA_SITE_KEY}
              onChange={handleCaptchaChange}
            />
          </div>

          <button 
            type="submit" 
            style={{
              marginTop: '20px',
              padding: '12px 24px',
              fontSize: '16px',
              borderRadius: '4px',
              backgroundColor: captchaToken ? '#4CAF50' : '#9e9e9e',
              color: 'white',
              border: 'none',
              cursor: captchaToken ? 'pointer' : 'not-allowed',
              transition: 'all 0.3s ease',
              width: '100%',
              fontWeight: 'bold',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}
            disabled={!captchaToken}
          >
            {captchaToken ? 'Se connecter' : '🔒 Validation du captcha requise'}
          </button>
        </form>

        <div style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '10px', alignItems: 'center' }}>
          <Link to="/register">Register</Link>
          <Link to="/forgot-password">Forgot Password?</Link>
          <div className="google-login-container" style={{ marginTop: '20px', textAlign: 'center' }}>
            <p style={{ marginBottom: '10px' }}>Or login with:</p>
            <GoogleLogin
              clientId={config.GOOGLE_CLIENT_ID}
              onSuccess={handleGoogleSuccess}
              onError={handleGoogleFailure}
              theme="filled_blue"
              size="large"
              text="signin_with"
              shape="rectangular"
              width="300"
              useOneTap={false}
            />
          </div>
        </div>
      </div>
    </Fragment>
  );
};

export default Login;