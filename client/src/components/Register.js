import React, { Fragment, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { toast } from "react-toastify";
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import { jwtDecode } from "jwt-decode";
import ReCAPTCHA from "react-google-recaptcha";
import config from "../config";
import "../assets/css/Registre.css";

const Register = ({ setAuth }) => {
    const clientId = process.env.REACT_APP_GOOGLE_CLIENT_ID;
    const [inputs, setInputs] = useState({
        email: "",
        password: "",
        confirmPassword: "",
        name: "",
        role: "employee"
    });
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [captchaToken, setCaptchaToken] = useState(null);

    const { email, password, confirmPassword, name, role } = inputs;

    const onChange = (e) => {
        setInputs({ ...inputs, [e.target.name]: e.target.value });
    };

    const onCaptchaChange = (token) => {
        setCaptchaToken(token);
    };

    const onSubmitForm = async (e) => {
        e.preventDefault();
        
        if (!captchaToken) {
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

        // Check if passwords match
        if (password !== confirmPassword) {
            toast.error("Les mots de passe ne correspondent pas");
            return;
        }
        
        try {
            const body = { email, password, name, role, captchaToken };
            const response = await fetch(`${config.API_URL}/auth/register`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body)
            });
            const parseRes = await response.json();
            if (parseRes.token) {
                localStorage.setItem("token", parseRes.token);
                localStorage.setItem("role", parseRes.role);
                localStorage.setItem("name", parseRes.name);
                setAuth(true, parseRes.role);
                setIsAuthenticated(true);
                toast.success("Inscription réussie");
            } else {
                setAuth(false);
                toast.error(parseRes);
            }
        } catch (err) {
            console.error(err.message);
            toast.error("L'inscription a échoué");
        }
    };

    const handleGoogleSuccess = async (credentialResponse) => {
        try {
            const decoded = jwtDecode(credentialResponse.credential);
            
            const body = { 
                name: decoded.name,
                email: decoded.email,
                google_id: decoded.sub,
                role: "employee" // default role for Google sign up
            };

            const response = await fetch(`${config.API_URL}/auth/google`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body)
            });

            const parseRes = await response.json();
            
            if (parseRes.token) {
                localStorage.setItem("token", parseRes.token);
                setAuth(true);
                toast.success("Registered Successfully with Google!");
            } else {
                setAuth(false);
                toast.error(parseRes);
            }
        } catch (err) {
            console.error(err.message);
            toast.error("Google registration failed");
        }
    };

    const handleGoogleFailure = () => {
        toast.error("Google sign in was unsuccessful");
    };

    if (isAuthenticated) {
        if (role === "manager") {
            return <Navigate to="/dashboard-manager" />;
        } else if (role === "rh") {
            return <Navigate to="/dashboard-hr" />;
        } else if (role === "employee") {
            return <Navigate to="/dashboard-employee" />;
        } else {
            return <Navigate to="/dashboard-user" />;
        }
    }

    return (
        <Fragment>
            <div className="register-container">
                <h1>Register</h1>
                <form onSubmit={onSubmitForm}>
                    <input
                        type="text"
                        name="name"
                        placeholder="Name"
                        value={name}
                        onChange={onChange}
                        required
                        className="input-field"
                    />
                    <input
                        type="email"
                        name="email"
                        placeholder="Email"
                        value={email}
                        onChange={onChange}
                        required
                        className="input-field"
                    />
                    
                    <div className="role-selection">
                        <h3>Select Your Role</h3>
                        <div className="select-container">
                            <select
                                name="role"
                                value={role}
                                onChange={onChange}
                                required
                                className="input-field"
                            >
                                <option value="employee">Employee</option>
                                <option value="rh">HR</option>
                                <option value="manager">Manager</option>
                            </select>
                            <div className="select-icon">
                                <i className={
                                    role === "employee" ? "fas fa-user-tie" : 
                                    role === "rh" ? "fas fa-users-cog" : 
                                    role === "manager" ? "fas fa-user-shield" : ""
                                }></i>
                            </div>
                        </div>
                    </div>

                    <input
                        type="password"
                        name="password"
                        placeholder="Password"
                        value={password}
                        onChange={onChange}
                        required
                        className="input-field"
                    />
                    <input
                        type="password"
                        name="confirmPassword"
                        placeholder="Confirm Password"
                        value={confirmPassword}
                        onChange={onChange}
                        required
                        className="input-field"
                    />
                    
                    {/* Visual indicator for password match */}
                    {password && confirmPassword && (
                        <div className={`password-match ${password === confirmPassword ? 'match' : 'mismatch'}`}
                            style={{
                                padding: '8px',
                                marginTop: '10px',
                                borderRadius: '4px',
                                textAlign: 'center',
                                backgroundColor: password === confirmPassword ? '#e8f5e9' : '#ffebee',
                                color: password === confirmPassword ? '#2e7d32' : '#d32f2f',
                                border: `1px solid ${password === confirmPassword ? '#66bb6a' : '#ef5350'}`,
                                fontSize: '14px',
                                fontWeight: 'bold'
                            }}>
                            {password === confirmPassword ? '✓ Les mots de passe correspondent' : '✗ Les mots de passe ne correspondent pas'}
                        </div>
                    )}

                    <div className="recaptcha-container" style={{ marginTop: '20px', textAlign: 'center' }}>
                        <ReCAPTCHA
                            sitekey={config.RECAPTCHA_SITE_KEY}
                            onChange={onCaptchaChange}
                        />
                    </div>
                    
                    <button 
                        type="submit" 
                        style={{
                            marginTop: '20px',
                            padding: '12px 24px',
                            fontSize: '16px',
                            borderRadius: '4px',
                            backgroundColor: captchaToken && password === confirmPassword ? '#4CAF50' : '#9e9e9e',
                            color: 'white',
                            border: 'none',
                            cursor: captchaToken && password === confirmPassword ? 'pointer' : 'not-allowed',
                            transition: 'all 0.3s ease',
                            width: '100%',
                            fontWeight: 'bold',
                            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                        }}
                        disabled={!captchaToken || password !== confirmPassword}
                    >
                        {!captchaToken ? '🔒 Validation du captcha requise' : 
                         password !== confirmPassword ? '🔒 Les mots de passe doivent correspondre' :
                         'S\'inscrire'}
                    </button>
                </form>

                <Link to="/" style={{ marginTop: '20px', display: 'inline-block' }}>Login</Link>
                
                <div className="google-login-container" style={{ marginTop: '20px', textAlign: 'center' }}>
                    <p style={{ marginBottom: '10px' }}>Ou inscrivez-vous avec :</p>
                    <GoogleLogin
                        clientId={clientId}
                        onSuccess={handleGoogleSuccess}
                        onError={handleGoogleFailure}
                        theme="filled_blue"
                        size="large"
                        text="signup_with"
                        shape="rectangular"
                        width="300"
                        useOneTap={false}
                    />
                </div>
            </div>
        </Fragment>
    );
};

export default Register;