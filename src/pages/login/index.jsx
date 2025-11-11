import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import WelcomeHeader from './components/WelcomeHeader';
import LoginForm from './components/LoginForm';
import TestCredentials from './components/TestCredentials';

const LoginPage = () => {
  const { login, isLoading } = useAuth();
  const [error, setError] = useState('');

  const handleLogin = async (credentials) => {
    try {
      setError('');
      await login(credentials);
    } catch (err) {
      setError(err.message || 'Login failed');
    }
  };

  const handleCredentialSelect = (credentials) => {
    handleLogin(credentials);
  };

  return (
    <div className="min-h-screen bg-gradient-medical flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-6">
        <WelcomeHeader />
        <div className="bg-card rounded-xl shadow-medical-lg border border-border p-8">
          <LoginForm 
            onLogin={handleLogin}
            isLoading={isLoading}
            error={error}
          />
          <TestCredentials onCredentialSelect={handleCredentialSelect} />
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
