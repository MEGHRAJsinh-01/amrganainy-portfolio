import React, { createContext, useContext, useState } from 'react';
import { adminAPI } from '../api/multiUserApi';
import { useAuth } from './AuthContext';

interface User {
    id: string;
    username: string;
    email: string;
    role: 'user' | 'admin';
    isEmailVerified: boolean;
    createdAt: string;
    updatedAt: string;
    lastLogin?: string;
}

interface AdminStats {
    totalUsers: number;
    totalProfiles: number;
    totalProjects: number;
    activeUsers: number;
    storage: {
        total: number;
        used: number;
    };
}

interface PaginatedResult<T> {
    data: T[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

interface AdminContextType {
    users: User[];
    stats: AdminStats | null;
    selectedUser: User | null;
    loading: boolean;
    error: string | null;
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
    getUsers: (page?: number, limit?: number, search?: string) => Promise<void>;
    getUser: (id: string) => Promise<User | null>;
    createUser: (userData: Partial<User>) => Promise<User>;
    updateUser: (id: string, userData: Partial<User>) => Promise<User>;
    deleteUser: (id: string) => Promise<void>;
    getStats: () => Promise<AdminStats>;
    clearAdminError: () => void;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export const AdminProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { user } = useAuth();
    const [users, setUsers] = useState<User[]>([]);
    const [stats, setStats] = useState<AdminStats | null>(null);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0
    });

    // Only admin users should be able to use these functions
    const isAdmin = user?.role === 'admin';

    const getUsers = async (page = 1, limit = 10, search = '') => {
        if (!isAdmin) {
            setError('Unauthorized access');
            return;
        }

        try {
            setLoading(true);
            setError(null);

            const params = { page, limit, search };
            const response = await adminAPI.getAllUsers(params);
            const result: PaginatedResult<User> = response.data;

            setUsers(result.data);
            setPagination({
                page: result.page,
                limit: result.limit,
                total: result.total,
                totalPages: result.totalPages
            });
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to load users');
        } finally {
            setLoading(false);
        }
    };

    const getUser = async (id: string) => {
        if (!isAdmin) {
            setError('Unauthorized access');
            return null;
        }

        try {
            setLoading(true);
            setError(null);

            const response = await adminAPI.getUser(id);
            const user = response.data;
            setSelectedUser(user);
            return user;
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to load user');
            return null;
        } finally {
            setLoading(false);
        }
    };

    const createUser = async (userData: Partial<User>) => {
        if (!isAdmin) {
            setError('Unauthorized access');
            throw new Error('Unauthorized access');
        }

        try {
            setLoading(true);
            setError(null);

            const response = await adminAPI.createUser(userData);
            const newUser = response.data;

            // Update the users list with the new user
            setUsers(prev => [...prev, newUser]);

            return newUser;
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to create user');
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const updateUser = async (id: string, userData: Partial<User>) => {
        if (!isAdmin) {
            setError('Unauthorized access');
            throw new Error('Unauthorized access');
        }

        try {
            setLoading(true);
            setError(null);

            const response = await adminAPI.updateUser(id, userData);
            const updatedUser = response.data;

            // Update the users list with the updated user
            setUsers(prev => prev.map(user => user.id === id ? updatedUser : user));

            // Update selected user if it's the one being updated
            if (selectedUser && selectedUser.id === id) {
                setSelectedUser(updatedUser);
            }

            return updatedUser;
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to update user');
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const deleteUser = async (id: string) => {
        if (!isAdmin) {
            setError('Unauthorized access');
            throw new Error('Unauthorized access');
        }

        try {
            setLoading(true);
            setError(null);

            await adminAPI.deleteUser(id);

            // Remove the deleted user from the users list
            setUsers(prev => prev.filter(user => user.id !== id));

            // Clear selected user if it's the one being deleted
            if (selectedUser && selectedUser.id === id) {
                setSelectedUser(null);
            }
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to delete user');
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const getStats = async () => {
        if (!isAdmin) {
            setError('Unauthorized access');
            throw new Error('Unauthorized access');
        }

        try {
            setLoading(true);
            setError(null);

            const response = await adminAPI.getStats();
            const adminStats = response.data;
            setStats(adminStats);

            return adminStats;
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to load admin statistics');
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const clearAdminError = () => setError(null);

    return (
        <AdminContext.Provider
            value={{
                users,
                stats,
                selectedUser,
                loading,
                error,
                pagination,
                getUsers,
                getUser,
                createUser,
                updateUser,
                deleteUser,
                getStats,
                clearAdminError
            }}
        >
            {children}
        </AdminContext.Provider>
    );
};

export const useAdmin = () => {
    const context = useContext(AdminContext);
    if (context === undefined) {
        throw new Error('useAdmin must be used within an AdminProvider');
    }
    return context;
};
