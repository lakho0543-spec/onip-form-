import React, { useEffect, useState } from 'react';
import { supabase } from '../../supabaseClient';
import Login from './Login';
import Signup from './Signup';

const ProtectedRoute = ({ children }) => {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showLogin, setShowLogin] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogin = (user) => {
    setSession(user);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setSession(null);
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Chargement...</p>
      </div>
    );
  }

  if (!session) {
    return showLogin ? (
      <Login 
        onLogin={handleLogin} 
        onSwitchToSignup={() => setShowLogin(false)} 
      />
    ) : (
      <Signup 
        onSignup={handleLogin} 
        onSwitchToLogin={() => setShowLogin(true)} 
      />
    );
  }

  return React.cloneElement(children, { onLogout: handleLogout, user: session.user });
};

export default ProtectedRoute;