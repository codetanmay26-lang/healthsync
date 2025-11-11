import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Routes from './Routes';
import ErrorBoundary from './components/ErrorBoundary';
import Toast from './components/ui/Toast'; // Add this import
import './styles/index.css';

const App = () => {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <AuthProvider>
          <Routes />
          <Toast /> {/* Add this line */}
        </AuthProvider>
      </BrowserRouter>
    </ErrorBoundary>
  );
};

export default App;
