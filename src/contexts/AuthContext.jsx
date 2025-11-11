import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [sessionTimeout, setSessionTimeout] = useState(30 * 60); // 30 minutes
  const navigate = useNavigate();

  // Check for existing session on mount
  useEffect(() => {
    const checkExistingSession = () => {
      const token = localStorage.getItem('authToken');
      const userRole = localStorage.getItem('userRole');
      const userName = localStorage.getItem('userName');
      const userEmail = localStorage.getItem('userEmail');
      const sessionStart = localStorage.getItem('sessionStart');

      if (token && userRole && sessionStart) {
        const sessionAge = (new Date() - new Date(sessionStart)) / 1000;
        if (sessionAge < sessionTimeout) {
          setUser({
            token,
            role: userRole,
            name: userName || 'User',
            email: userEmail || '',
          });
        } else {
          // Session expired
          clearAuthData();
        }
      }
      setIsLoading(false);
    };

    checkExistingSession();
  }, [sessionTimeout]);

  const login = async (credentials) => {
    setIsLoading(true);
    
    // Validate credentials (your existing validation logic)
    const validAccounts = {
      'doctor@healthsync.com': { 
        password: 'doctor123', 
        role: 'doctor', 
        name: 'Dr. Sarah Johnson' 
      },
      'patient@healthsync.com': { 
        password: 'patient123', 
        role: 'patient', 
        name: 'Rakesh Sharma' 
      },
      'pharmacy@healthsync.com': { 
        password: 'pharmacy123', 
        role: 'pharmacy', 
        name: 'MediCare Pharmacy' 
      },
      'admin@healthsync.com': { 
        password: 'admin123', 
        role: 'admin', 
        name: 'System Administrator' 
      }
    };

    const account = validAccounts[credentials.email?.toLowerCase()];
    
    if (!account || account.password !== credentials.password || account.role !== credentials.role) {
      setIsLoading(false);
      throw new Error('Invalid credentials');
    }

    // Generate token and store session
    const token = `token_${Date.now()}_${Math.random()}`;
    const sessionStart = new Date().toISOString();
    
    localStorage.setItem('authToken', token);
    localStorage.setItem('userRole', account.role);
    localStorage.setItem('userName', account.name);
    localStorage.setItem('userEmail', credentials.email);
    localStorage.setItem('sessionStart', sessionStart);

    const userData = {
      token,
      role: account.role,
      name: account.name,
      email: credentials.email,
    };

    setUser(userData);
    redirectToRoleDashboard(account.role);
    setIsLoading(false);
    
    return userData;
  };

  const logout = () => {
    clearAuthData();
    setUser(null);
    navigate('/login');
  };

  const clearAuthData = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userName');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('sessionStart');
  };

  const redirectToRoleDashboard = (role) => {
    const roleRoutes = {
      doctor: '/doctor-dashboard',
      patient: '/patient-portal',
      pharmacy: '/pharmacy-dashboard',
      admin: '/admin-analytics'
    };
    navigate(roleRoutes[role] || '/doctor-dashboard');
  };

  const extendSession = () => {
    localStorage.setItem('sessionStart', new Date().toISOString());
  };

  const value = {
    user,
    isLoading,
    login,
    logout,
    extendSession,
    sessionTimeout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
