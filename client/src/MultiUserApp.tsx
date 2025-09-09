import React, { useState } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import UserDashboard from './components/UserDashboard';
import AdminDashboard from './components/admin/AdminDashboard';
import LoginForm from './components/auth/LoginForm';
import RegisterForm from './components/auth/RegisterForm';
import ForgotPasswordForm from './components/auth/ForgotPasswordForm';
import ResetPasswordForm from './components/auth/ResetPasswordForm';
import UserPortfolio from './pages/UserPortfolio';

// Main App Component for the multi-user portfolio platform
const MultiUserApp: React.FC = () => {
  // Mock authentication state for the prototype
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState<{
    id: string;
    username: string;
    role: 'user' | 'admin';
  } | null>(null);

  // Mock authentication functions
  const handleLogin = (email: string, password: string) => {
    console.log('Login attempt with:', email, password);
    // In a real implementation, this would make an API call
    
    // For the prototype, just set authenticated with mock user data
    setIsAuthenticated(true);
    
    // Set mock user based on email (for demo purposes)
    if (email.includes('admin')) {
      setCurrentUser({
        id: '999',
        username: 'admin',
        role: 'admin'
      });
    } else {
      setCurrentUser({
        id: '123',
        username: 'johndoe',
        role: 'user'
      });
    }
  };

  const handleRegister = (firstName: string, lastName: string, email: string, password: string, username: string) => {
    console.log('Register attempt with:', { firstName, lastName, email, password, username });
    // In a real implementation, this would make an API call
    
    // For the prototype, just set authenticated with the new user data
    setIsAuthenticated(true);
    setCurrentUser({
      id: '123',
      username,
      role: 'user'
    });
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setCurrentUser(null);
  };

  const handleForgotPassword = (email: string) => {
    console.log('Password reset requested for:', email);
    // In a real implementation, this would make an API call
  };

  const handleResetPassword = (password: string, token: string) => {
    console.log('Password reset with token:', token, 'New password:', password);
    // In a real implementation, this would make an API call
  };

  // Protected route component
  const ProtectedRoute = ({ 
    element, 
    requiredRole 
  }: { 
    element: React.ReactNode, 
    requiredRole?: 'user' | 'admin' 
  }) => {
    if (!isAuthenticated) {
      return <Navigate to="/login" />;
    }

    if (requiredRole && currentUser?.role !== requiredRole) {
      return <Navigate to="/dashboard" />;
    }

    return <>{element}</>;
  };

  return (
    <Router>
      <Routes>
        {/* Public routes */}
        <Route 
          path="/" 
          element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} />} 
        />
        <Route 
          path="/login" 
          element={
            isAuthenticated 
              ? <Navigate to="/dashboard" /> 
              : <LoginForm onLogin={handleLogin} />
          } 
        />
        <Route 
          path="/register" 
          element={
            isAuthenticated 
              ? <Navigate to="/dashboard" /> 
              : <RegisterForm onRegister={handleRegister} />
          } 
        />
        <Route 
          path="/forgot-password" 
          element={<ForgotPasswordForm onSubmit={handleForgotPassword} />} 
        />
        <Route 
          path="/reset-password/:token" 
          element={<ResetPasswordForm onSubmit={handleResetPassword} token="sample-token" />} 
        />
        
        {/* User portfolios - public */}
        <Route path="/u/:username" element={<UserPortfolio />} />
        
        {/* Protected routes */}
        <Route 
          path="/dashboard" 
          element={<ProtectedRoute element={<UserDashboard />} />} 
        />
        <Route 
          path="/admin" 
          element={<ProtectedRoute element={<AdminDashboard />} requiredRole="admin" />} 
        />
        
        {/* Fallback route */}
        <Route path="*" element={<div>Page Not Found</div>} />
      </Routes>
    </Router>
  );
};

export default MultiUserApp;
