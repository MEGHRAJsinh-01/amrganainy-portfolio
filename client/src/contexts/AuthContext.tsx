import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../api/multiUserApi';
import { useLocation, useNavigate } from 'react-router-dom';

interface User {
    id: string;
    email: string;
    username: string;
    role: 'user' | 'admin';
    isEmailVerified: boolean;
}

interface AuthContextType {
    user: User | null;
    loading: boolean;
    error: string | null;
    login: (email: string, password: string) => Promise<void>;
    register: (userData: any) => Promise<void>;
    logout: () => Promise<void>;
    updatePassword: (passwordData: { currentPassword: string, newPassword: string }) => Promise<void>;
    clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();
    const location = useLocation();

    // Normalize server user payload to client User shape
    const normalizeUser = (payload: any): User => ({
        id: payload?.id || payload?._id || '',
        email: payload?.email || '',
        username: payload?.username || '',
        role: payload?.role === 'admin' ? 'admin' : 'user',
        isEmailVerified: Boolean(payload?.isEmailVerified)
    });

    // Check if user is logged in on mount
    useEffect(() => {
        const checkAuthStatus = async () => {
            try {
                const token = localStorage.getItem('token');
                if (token) {
                    const { data } = await authAPI.getCurrentUser();
                    // API shape: { status, data: { user } }
                    const apiUser = data?.data?.user;
                    if (apiUser) setUser(normalizeUser(apiUser));
                }
            } catch (err) {
                // Clear token if invalid
                localStorage.removeItem('token');
                console.error('Auth check failed:', err);
            } finally {
                setLoading(false);
            }
        };

        checkAuthStatus();
    }, []);

    // Ensure we always redirect away from auth pages when authenticated
    useEffect(() => {
        if (user && (location.pathname === '/login' || location.pathname === '/register')) {
            navigate('/', { replace: true });
        }
    }, [user, location.pathname, navigate]);

    const login = async (email: string, password: string) => {
        try {
            setLoading(true);
            setError(null);
            const { data } = await authAPI.login({ email, password });
            // API shape: { status, token, data: { user } }
            const token = data?.token;
            const apiUser = data?.data?.user;
            if (token) localStorage.setItem('token', token);
            if (apiUser) setUser(normalizeUser(apiUser));
            // Navigate to home on successful login
            navigate('/', { replace: true });
        } catch (err: any) {
            setError(err.response?.data?.message || 'Login failed');
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const register = async (userData: any) => {
        try {
            setLoading(true);
            setError(null);
            const { data } = await authAPI.register(userData);
            // API shape: { status, token, data: { user } }
            const token = data?.token;
            const apiUser = data?.data?.user;
            if (token) localStorage.setItem('token', token);
            if (apiUser) setUser(normalizeUser(apiUser));

            // Seed profile.socialLinks right after registration so Profile becomes the single source of truth
            try {
                const githubUrl = userData?.githubUrl;
                const linkedinUrl = userData?.linkedinUrl;
                if (githubUrl || linkedinUrl) {
                    await import('../api/multiUserApi').then(({ profileAPI }) =>
                        profileAPI.updateProfile({
                            socialLinks: {
                                ...(githubUrl ? { github: githubUrl } : {}),
                                ...(linkedinUrl ? { linkedin: linkedinUrl } : {})
                            }
                        })
                    );
                }
            } catch (seedErr) {
                // Non-fatal: continue even if seeding fails
                console.warn('Profile socialLinks seed failed:', seedErr);
            }
            // Navigate to home on successful registration
            navigate('/', { replace: true });
        } catch (err: any) {
            setError(err.response?.data?.message || 'Registration failed');
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const logout = async () => {
        try {
            setLoading(true);
            await authAPI.logout();
            localStorage.removeItem('token');
            setUser(null);
        } catch (err: any) {
            console.error('Logout error:', err);
        } finally {
            setLoading(false);
        }
    };

    const updatePassword = async (passwordData: { currentPassword: string, newPassword: string }) => {
        try {
            setLoading(true);
            setError(null);
            await authAPI.updatePassword(passwordData);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to update password');
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const clearError = () => setError(null);

    return (
        <AuthContext.Provider
            value={{
                user,
                loading,
                error,
                login,
                register,
                logout,
                updatePassword,
                clearError
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
