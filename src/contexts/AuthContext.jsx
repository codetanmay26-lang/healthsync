import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { initializeDefaultUsers, getAllUsers } from '../services/localStorageUserManagement';

// Create context with default value
const AuthContext = createContext(null);

// Export useAuth hook
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
  const [sessionTimeout] = useState(30 * 60); // 30 minutes
  const navigate = useNavigate();

  // Initialize default users including Rakesh Sharma
  useEffect(() => {
    initializeDefaultUsers();
  }, []);

  // Check for existing session on mount
  useEffect(() => {
    const checkExistingSession = () => {
      const token = localStorage.getItem('authToken');
      const userId = localStorage.getItem('userId');
      const sessionStart = localStorage.getItem('sessionStart');

      if (token && userId && sessionStart) {
        const sessionAge = (new Date() - new Date(sessionStart)) / 1000;
        if (sessionAge < sessionTimeout) {
          // Get user from users database
          const users = getAllUsers();
          const currentUser = users.find(u => u.id === userId);
          
          if (currentUser) {
            setUser(currentUser);
          } else {
            clearAuthData();
          }
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

    try {
      // Get all users from localStorage
      const users = getAllUsers();
      
      // Find matching user
      const account = users.find(u => 
        u.email.toLowerCase() === credentials.email?.toLowerCase() &&
        u.password === credentials.password &&
        u.role === credentials.role &&
        u.active === true
      );

      if (!account) {
        setIsLoading(false);
        throw new Error('Invalid credentials');
      }

      // Generate token and store session
      const token = `token-${Date.now()}-${Math.random()}`;
      const sessionStart = new Date().toISOString();

      localStorage.setItem('authToken', token);
      localStorage.setItem('userId', account.id);
      localStorage.setItem('userRole', account.role);
      localStorage.setItem('userName', account.name);
      localStorage.setItem('userEmail', account.email);
      localStorage.setItem('sessionStart', sessionStart);

      setUser(account);
      redirectToRoleDashboard(account.role);
      setIsLoading(false);

      return account;
    } catch (error) {
      setIsLoading(false);
      throw error;
    }
  };

  const logout = () => {
    clearAuthData();
    setUser(null);
    navigate('/login');
  };

  const clearAuthData = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userId');
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

// Default export (optional, but good practice)
export default AuthContext;
