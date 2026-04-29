import React, { useState } from 'react';
import ReCAPTCHA from 'react-google-recaptcha';
import { supabase } from '../../supabaseClient';
import './Auth.css';

const Signup = ({ onSignup, onSwitchToLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [captchaValue, setCaptchaValue] = useState(null);

  // Password validation function
  const validatePassword = (pwd) => {
    if (pwd.length < 8) {
      return "Le mot de passe doit contenir au moins 8 caractères";
    }
    if (!/[A-Z]/.test(pwd)) {
      return "Le mot de passe doit contenir au moins une majuscule";
    }
    if (!/[a-z]/.test(pwd)) {
      return "Le mot de passe doit contenir au moins une minuscule";
    }
    if (!/[0-9]/.test(pwd)) {
      return "Le mot de passe doit contenir au moins un chiffre";
    }
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(pwd)) {
      return "Le mot de passe doit contenir au moins un caractère spécial (!@#$%^&*)";
    }
    return null;
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    // Validate password
    const passwordError = validatePassword(password);
    if (passwordError) {
      setError(passwordError);
      setLoading(false);
      return;
    }

    // Validate CAPTCHA
    if (!captchaValue) {
      setError("Veuillez vérifier que vous n'êtes pas un robot");
      setLoading(false);
      return;
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        }
      }
    });

    if (error) {
      setError(error.message);
    } else {
      setSuccess('Compte créé avec succès! Veuillez vérifier votre email pour confirmer votre compte.');
      setTimeout(() => {
        onSwitchToLogin();
      }, 3000);
    }
    setLoading(false);
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <img src="/onip-logo.png" alt="Logo ONIP" />
          <h2>Inscription</h2>
          <p>Créez votre compte</p>
        </div>

        <form onSubmit={handleSignup} className="auth-form">
          <div className="form-group">
            <label>Nom complet</label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              placeholder="Votre nom"
            />
          </div>

          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="votre@email.com"
            />
          </div>

          <div className="form-group">
            <label>Mot de passe</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••"
            />
            <small className="password-hint">
              Minimum 8 caractères, une majuscule, une minuscule, un chiffre et un caractère spécial
            </small>
          </div>

          <div className="form-group">
            <ReCAPTCHA
              sitekey="6Lcy46ksAAAAAGgZYtVpWdjt7qux4FTXYBmy08Rc"
              onChange={(value) => setCaptchaValue(value)}
            />
          </div>

          {error && <div className="error-message">{error}</div>}
          {success && <div className="success-message">{success}</div>}

          <button type="submit" className="auth-button" disabled={loading}>
            {loading ? 'Inscription...' : "S'inscrire"}
          </button>
        </form>

        <div className="auth-footer">
          Déjà un compte?
          <button onClick={onSwitchToLogin}>Se connecter</button>
        </div>
      </div>
    </div>
  );
};

export default Signup;