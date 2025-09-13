import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import UserDashboard from './components/UserDashboard';
import AdminDashboard from './components/AdminDashboard';
import UserDetails from './components/UserDetails';
import AdminAnalytics from './components/AdminAnalytics';
import LoginForm from './components/auth/LoginForm';
import RegisterForm from './components/auth/RegisterForm';
import ForgotPasswordForm from './components/auth/ForgotPasswordForm';
import ResetPasswordForm from './components/auth/ResetPasswordForm';
import UserPortfolio from './pages/UserPortfolio';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ProfileProvider } from './contexts/ProfileContext';
import { ProjectProvider } from './contexts/ProjectContext';
import { AdminProvider } from './contexts/AdminContext';

// Main App Component for the multi-user portfolio platform
// Note: Use BrowserRouter so clean URLs like /u/:username work (no hash).
// Netlify and Vite dev server both support SPA history fallback via _redirects.
const MultiUserApp: React.FC = () => {
    return (
        <Router>
            <AuthProvider>
                <ProfileProvider>
                    <ProjectProvider>
                        <AdminProvider>
                            <AppRoutes />
                        </AdminProvider>
                    </ProjectProvider>
                </ProfileProvider>
            </AuthProvider>
        </Router>
    );
};

// Routes component that uses the authentication context
const AppRoutes: React.FC = () => {
    const { user, loading } = useAuth();

    // Display a loading indicator when checking authentication
    if (loading) {
        return <div className="flex items-center justify-center h-screen">Loading...</div>;
    }

    // Protected route component
    const ProtectedRoute = ({
        element,
        requiredRole
    }: {
        element: React.ReactNode,
        requiredRole?: 'user' | 'admin'
    }) => {
        if (!user) {
            return <Navigate to="/login" />;
        }

        if (requiredRole && user.role !== requiredRole) {
            return <Navigate to="/dashboard" />;
        }

        return <>{element}</>;
    };

    return (
        <Routes>
            {/* Public routes */}
            <Route
                path="/"
                element={
                    user ? <UserDashboard /> : <Navigate to="/login" />
                }
            />
            <Route
                path="/login"
                element={
                    user
                        ? <Navigate to="/" replace={true} />
                        : <LoginForm />
                }
            />
            <Route
                path="/register"
                element={
                    user
                        ? <Navigate to="/" replace={true} />
                        : <RegisterForm />
                }
            />
            <Route
                path="/forgot-password"
                element={<ForgotPasswordForm />}
            />
            <Route
                path="/reset-password/:token"
                element={<ResetPasswordForm />}
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
            <Route
                path="/admin/users/:id"
                element={<ProtectedRoute element={<UserDetails />} requiredRole="admin" />}
            />
            <Route
                path="/admin/analytics"
                element={<ProtectedRoute element={<AdminAnalytics />} requiredRole="admin" />}
            />

            {/* Fallback route */}
            <Route path="*" element={<div>Page Not Found</div>} />
        </Routes>
    );
};

export default MultiUserApp;
