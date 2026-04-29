import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import RegistrationForm from './components/forms/RegistrationForm';
import Login from './components/auth/Login';
import Signup from './components/auth/Signup';
import ProtectedRoute from './components/auth/ProtectedRoute';
import { supabase } from './supabaseClient';
import './App.css';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user || null);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Chargement...</p>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={
          user ? <Navigate to="/" /> : <Login onLogin={setUser} onSwitchToSignup={() => {}} />
        } />
        <Route path="/signup" element={
          user ? <Navigate to="/" /> : <Signup onSignup={setUser} onSwitchToLogin={() => {}} />
        } />
        <Route path="/" element={
          <ProtectedRoute>
            <RegistrationForm onSuccess={() => {}} />
          </ProtectedRoute>
        } />
      </Routes>
    </BrowserRouter>
  );
}

export default App;