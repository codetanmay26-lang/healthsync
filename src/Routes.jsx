import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

// Import your pages
import LoginPage from './pages/login';
import DoctorDashboard from './pages/doctor-dashboard';
import WelcomePage from './pages/welcome';
import PatientPortal from './pages/patient-portal';
import PatientProfile from './pages/patient-profile';
import PharmacyDashboard from './pages/pharmacy-dashboard';
import AdminAnalytics from './pages/admin-analytics';
import NotFound from './pages/NotFound';
import AnalysisReportsPanel from './pages/doctor-dashboard/components/AnalysisReportsPanel';
import ReviewedReportsPage from './pages/doctor-dashboard/components/ReviewedReportsPage';

const AppRoutes = () => {
  const { user } = useAuth();

  return (
    <Routes>
      {/* Public Routes */}
      <Route 
        path="/login" 
        element={
          user ? <Navigate to={getRoleRoute(user.role)} replace /> : <LoginPage />
        } 
      />
      
      {/* Protected Routes */}
      <Route 
        path="/doctor-dashboard" 
        element={
          <ProtectedRoute allowedRoles={['doctor']}>
            <DoctorDashboard />
          </ProtectedRoute>
        } 
      />
      
      {/* 🆕 NEW: Doctor Dashboard Nested Routes */}
      <Route 
        path="/doctor-dashboard/analysis-reports" 
        element={
          <ProtectedRoute allowedRoles={['doctor']}>
            <AnalysisReportsPanel />
          </ProtectedRoute>
        } 
      />
      
      <Route 
        path="/doctor-dashboard/reviewed-reports" 
        element={
          <ProtectedRoute allowedRoles={['doctor']}>
            <ReviewedReportsPage />
          </ProtectedRoute>
        } 
      />
      
      <Route 
        path="/patient-portal" 
        element={
          <ProtectedRoute allowedRoles={['patient']}>
            <PatientPortal />
          </ProtectedRoute>
        } 
      />
      
      <Route 
        path="/patient-profile" 
        element={
          <ProtectedRoute allowedRoles={['doctor', 'admin']}>
            <PatientProfile />
          </ProtectedRoute>
        } 
      />
      
      <Route 
        path="/pharmacy-dashboard" 
        element={
          <ProtectedRoute allowedRoles={['pharmacy']}>
            <PharmacyDashboard />
          </ProtectedRoute>
        } 
      />
      
      <Route 
        path="/admin-analytics" 
        element={
          <ProtectedRoute allowedRoles={['admin', 'doctor']}>
            <AdminAnalytics />
          </ProtectedRoute>
        } 
      />

      {/* Root redirect */}
<Route path="/" element={<WelcomePage />} />

      
      <Route path="/unauthorized" element={<div>Unauthorized Access</div>} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const getRoleRoute = (role) => {
  const roleRoutes = {
    doctor: '/doctor-dashboard',
    patient: '/patient-portal',
    pharmacy: '/pharmacy-dashboard',
    admin: '/admin-analytics'
  };
  return roleRoutes[role] || '/doctor-dashboard';
};

export default AppRoutes;
