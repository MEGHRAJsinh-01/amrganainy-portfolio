import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useAdmin } from '../contexts/AdminContext';

interface User {
    id: string;
    username: string;
    email: string;
    role: 'user' | 'admin';
    createdAt: string;
    isEmailVerified: boolean;
    lastLogin?: string;
}

interface Stats {
    totalUsers: number;
    activeUsers: number;
    projectsCount: number;
    profilesCount: number;
}

const AdminDashboard: React.FC = () => {
    const [activeTab, setActiveTab] = useState('users');
    const [searchTerm, setSearchTerm] = useState('');
    const [userToDelete, setUserToDelete] = useState<User | null>(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    // Get auth context
    const { user, logout } = useAuth();

    // Get admin context
    const {
        users,
        stats: adminStats,
        loading: isLoading,
        error,
        getUsers,
        deleteUser,
        updateUser,
        getStats,
        clearAdminError
    } = useAdmin();

    // Transform stats for the UI
    const stats: Stats = {
        totalUsers: adminStats?.totalUsers || 0,
        activeUsers: adminStats?.activeUsers || 0,
        projectsCount: adminStats?.totalProjects || 0,
        profilesCount: adminStats?.totalProfiles || 0
    };

    // Fetch users and stats on component mount
    useEffect(() => {
        getUsers();
        getStats();
    }, []);

    // Handle user deletion
    const handleDeleteUser = async (userId: string) => {
        try {
            await deleteUser(userId);
            setShowDeleteModal(false);
            setUserToDelete(null);
            // Refresh stats
            getStats();
        } catch (err: any) {
            console.error('Error deleting user:', err);
        }
    };

    // Toggle user role (admin/user)
    const toggleUserRole = async (userId: string, currentRole: 'user' | 'admin') => {
        try {
            const newRole = currentRole === 'admin' ? 'user' : 'admin';
            await updateUser(userId, { role: newRole });
            // Data is updated via context
        } catch (err: any) {
            console.error('Error updating user role:', err);
        }
    };

    // Filter users based on search term
    const filteredUsers = users.filter(user =>
        user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Handle logout
    const handleLogout = async () => {
        try {
            await logout();
            window.location.href = '/login'; // Redirect to login page
        } catch (error) {
            console.error('Logout failed:', error);
        }
    };

    return (
        <div className="min-h-screen bg-gray-900 text-white">
            {/* Header */}
            <header className="bg-gray-800 border-b border-gray-700 px-6 py-4">
                <div className="flex justify-between items-center">
                    <h1 className="text-2xl font-bold">Admin Dashboard</h1>
                    <div className="flex gap-4">
                        <Link
                            to="/dashboard"
                            className="bg-gray-700 text-white px-4 py-2 rounded-md hover:bg-gray-600 transition-colors"
                        >
                            My Dashboard
                        </Link>
                        <button
                            onClick={handleLogout}
                            className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors"
                        >
                            Sign Out
                        </button>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="container mx-auto px-6 py-8">
                {error && (
                    <div className="bg-red-900/20 border border-red-500/50 text-red-300 p-4 rounded-md mb-6">
                        {error}
                        <button
                            className="ml-2 text-red-300 hover:text-white"
                            onClick={() => clearAdminError()}
                        >
                            ✕
                        </button>
                    </div>
                )}

                <div className="flex flex-col md:flex-row gap-6">
                    {/* Sidebar */}
                    <div className="w-full md:w-64 bg-gray-800 rounded-lg p-4">
                        <div className="flex flex-col items-center mb-6">
                            <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-purple-500 mb-3 flex items-center justify-center bg-purple-800">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-purple-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                                </svg>
                            </div>
                            <h3 className="text-lg font-semibold">Admin Control Panel</h3>
                            <p className="text-gray-400 text-sm">{user?.username} (Administrator)</p>
                        </div>

                        <nav className="space-y-1">
                            <button
                                onClick={() => setActiveTab('dashboard')}
                                className={`w-full text-left px-4 py-2 rounded-md transition-colors ${activeTab === 'dashboard' ? 'bg-purple-600 text-white' : 'text-gray-300 hover:bg-gray-700'
                                    }`}
                            >
                                Dashboard
                            </button>
                            <button
                                onClick={() => setActiveTab('users')}
                                className={`w-full text-left px-4 py-2 rounded-md transition-colors ${activeTab === 'users' ? 'bg-purple-600 text-white' : 'text-gray-300 hover:bg-gray-700'
                                    }`}
                            >
                                User Management
                            </button>
                            <button
                                onClick={() => setActiveTab('settings')}
                                className={`w-full text-left px-4 py-2 rounded-md transition-colors ${activeTab === 'settings' ? 'bg-purple-600 text-white' : 'text-gray-300 hover:bg-gray-700'
                                    }`}
                            >
                                System Settings
                            </button>
                            <Link
                                to="/admin/analytics"
                                className="block w-full text-left px-4 py-2 rounded-md transition-colors text-gray-300 hover:bg-gray-700"
                            >
                                Advanced Analytics
                            </Link>
                        </nav>
                    </div>

                    {/* Main Content Area */}
                    <div className="flex-1">
                        {isLoading && (
                            <div className="flex justify-center mb-6">
                                <div className="flex items-center space-x-2">
                                    <div className="w-6 h-6 border-t-2 border-b-2 border-purple-500 rounded-full animate-spin"></div>
                                    <span>Loading...</span>
                                </div>
                            </div>
                        )}

                        {/* Dashboard Tab */}
                        {activeTab === 'dashboard' && (
                            <div className="bg-gray-800 rounded-lg p-6">
                                <h2 className="text-xl font-semibold mb-6">Dashboard Overview</h2>

                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                                    <div className="bg-gray-700 rounded-lg p-4 border border-gray-600">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-gray-400 text-sm">Total Users</p>
                                                <h3 className="text-2xl font-bold">{stats.totalUsers}</h3>
                                            </div>
                                            <div className="p-3 bg-blue-500/20 rounded-full">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                                                </svg>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-gray-700 rounded-lg p-4 border border-gray-600">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-gray-400 text-sm">Active Users</p>
                                                <h3 className="text-2xl font-bold">{stats.activeUsers}</h3>
                                            </div>
                                            <div className="p-3 bg-green-500/20 rounded-full">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-gray-700 rounded-lg p-4 border border-gray-600">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-gray-400 text-sm">Total Projects</p>
                                                <h3 className="text-2xl font-bold">{stats.projectsCount}</h3>
                                            </div>
                                            <div className="p-3 bg-yellow-500/20 rounded-full">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                                                </svg>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-gray-700 rounded-lg p-4 border border-gray-600">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-gray-400 text-sm">Complete Profiles</p>
                                                <h3 className="text-2xl font-bold">{stats.profilesCount}</h3>
                                            </div>
                                            <div className="p-3 bg-purple-500/20 rounded-full">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                </svg>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="mb-8">
                                    <h3 className="text-lg font-medium mb-4">Recent Activity</h3>
                                    <div className="bg-gray-700 rounded-lg overflow-hidden">
                                        <table className="w-full">
                                            <thead className="bg-gray-800">
                                                <tr>
                                                    <th className="px-4 py-2 text-left">Event</th>
                                                    <th className="px-4 py-2 text-left">User</th>
                                                    <th className="px-4 py-2 text-left">Date</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-600">
                                                <tr>
                                                    <td className="px-4 py-3">New user registered</td>
                                                    <td className="px-4 py-3">user123</td>
                                                    <td className="px-4 py-3 text-gray-400">{new Date().toLocaleDateString()}</td>
                                                </tr>
                                                <tr>
                                                    <td className="px-4 py-3">Profile updated</td>
                                                    <td className="px-4 py-3">devsmith</td>
                                                    <td className="px-4 py-3 text-gray-400">{new Date().toLocaleDateString()}</td>
                                                </tr>
                                                <tr>
                                                    <td className="px-4 py-3">New project added</td>
                                                    <td className="px-4 py-3">codemaster</td>
                                                    <td className="px-4 py-3 text-gray-400">{new Date().toLocaleDateString()}</td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                </div>

                                <div>
                                    <h3 className="text-lg font-medium mb-4">Quick Actions</h3>
                                    <div className="flex gap-4">
                                        <button
                                            onClick={() => setActiveTab('users')}
                                            className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 transition-colors"
                                        >
                                            Manage Users
                                        </button>
                                        <Link
                                            to="/admin/analytics"
                                            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                                        >
                                            View Analytics
                                        </Link>
                                        <button
                                            className="bg-gray-700 text-white px-4 py-2 rounded-md hover:bg-gray-600 transition-colors"
                                            onClick={() => getStats()}
                                        >
                                            Refresh Stats
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Users Tab */}
                        {activeTab === 'users' && (
                            <div className="bg-gray-800 rounded-lg p-6">
                                <div className="flex items-center justify-between mb-6">
                                    <h2 className="text-xl font-semibold">User Management</h2>
                                    <button
                                        onClick={() => getUsers()}
                                        className="bg-gray-700 text-white px-3 py-1 rounded-md hover:bg-gray-600 transition-colors text-sm"
                                    >
                                        Refresh
                                    </button>
                                </div>

                                <div className="mb-6">
                                    <div className="relative">
                                        <input
                                            type="text"
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            placeholder="Search users by name or email..."
                                            className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:border-purple-500 focus:ring-purple-500 pl-10"
                                        />
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400 absolute left-3 top-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                        </svg>
                                    </div>
                                </div>

                                {filteredUsers.length > 0 ? (
                                    <div className="bg-gray-700 rounded-lg overflow-hidden">
                                        <table className="w-full">
                                            <thead className="bg-gray-800">
                                                <tr>
                                                    <th className="px-4 py-2 text-left">Username</th>
                                                    <th className="px-4 py-2 text-left">Email</th>
                                                    <th className="px-4 py-2 text-left">Role</th>
                                                    <th className="px-4 py-2 text-left">Joined</th>
                                                    <th className="px-4 py-2 text-left">Status</th>
                                                    <th className="px-4 py-2 text-left">Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-600">
                                                {filteredUsers.map((user) => (
                                                    <tr key={user.id}>
                                                        <td className="px-4 py-3">{user.username}</td>
                                                        <td className="px-4 py-3">{user.email}</td>
                                                        <td className="px-4 py-3">
                                                            <span className={`px-2 py-1 rounded-full text-xs ${user.role === 'admin' ? 'bg-purple-500/20 text-purple-300' : 'bg-blue-500/20 text-blue-300'}`}>
                                                                {user.role}
                                                            </span>
                                                        </td>
                                                        <td className="px-4 py-3 text-gray-400">{new Date(user.createdAt).toLocaleDateString()}</td>
                                                        <td className="px-4 py-3">
                                                            <span className={`px-2 py-1 rounded-full text-xs ${user.isEmailVerified ? 'bg-green-500/20 text-green-300' : 'bg-yellow-500/20 text-yellow-300'}`}>
                                                                {user.isEmailVerified ? 'Verified' : 'Pending'}
                                                            </span>
                                                        </td>
                                                        <td className="px-4 py-3">
                                                            <div className="flex gap-2">
                                                                <button
                                                                    onClick={() => toggleUserRole(user.id, user.role)}
                                                                    className="text-xs bg-gray-600 hover:bg-gray-500 text-white px-2 py-1 rounded"
                                                                    disabled={user.id === user?.id}
                                                                >
                                                                    {user.role === 'admin' ? 'Make User' : 'Make Admin'}
                                                                </button>
                                                                <Link
                                                                    to={`/admin/users/${user.id}`}
                                                                    className="text-xs bg-blue-600 hover:bg-blue-500 text-white px-2 py-1 rounded"
                                                                >
                                                                    View
                                                                </Link>
                                                                <button
                                                                    onClick={() => {
                                                                        setUserToDelete(user);
                                                                        setShowDeleteModal(true);
                                                                    }}
                                                                    className="text-xs bg-red-600 hover:bg-red-500 text-white px-2 py-1 rounded"
                                                                    disabled={user.id === user?.id}
                                                                >
                                                                    Delete
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                ) : (
                                    <div className="bg-gray-700 p-6 rounded-lg text-center">
                                        <p className="text-gray-400">No users found matching your search criteria.</p>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Settings Tab */}
                        {activeTab === 'settings' && (
                            <div className="bg-gray-800 rounded-lg p-6">
                                <h2 className="text-xl font-semibold mb-6">System Settings</h2>

                                <div className="mb-8">
                                    <h3 className="text-lg font-medium mb-4">Registration Settings</h3>
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between bg-gray-700 p-4 rounded-lg">
                                            <div>
                                                <h4 className="font-medium">Enable Public Registration</h4>
                                                <p className="text-sm text-gray-400">Allow new users to register without invitation</p>
                                            </div>
                                            <div className="relative inline-block w-12 h-6 transition duration-200 ease-in-out rounded-full bg-green-600">
                                                <span className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform duration-200 ease-in-out translate-x-6"></span>
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between bg-gray-700 p-4 rounded-lg">
                                            <div>
                                                <h4 className="font-medium">Require Email Verification</h4>
                                                <p className="text-sm text-gray-400">Users must verify email before accessing portfolios</p>
                                            </div>
                                            <div className="relative inline-block w-12 h-6 transition duration-200 ease-in-out rounded-full bg-green-600">
                                                <span className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform duration-200 ease-in-out translate-x-6"></span>
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between bg-gray-700 p-4 rounded-lg">
                                            <div>
                                                <h4 className="font-medium">User-created Portfolios</h4>
                                                <p className="text-sm text-gray-400">Allow users to create portfolios without admin approval</p>
                                            </div>
                                            <div className="relative inline-block w-12 h-6 transition duration-200 ease-in-out rounded-full bg-green-600">
                                                <span className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform duration-200 ease-in-out translate-x-6"></span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="mb-8">
                                    <h3 className="text-lg font-medium mb-4">Site Configuration</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-gray-300 text-sm font-medium mb-2">
                                                Site Name
                                            </label>
                                            <input
                                                type="text"
                                                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:border-purple-500 focus:ring-purple-500"
                                                defaultValue="Portfolio Platform"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-gray-300 text-sm font-medium mb-2">
                                                Support Email
                                            </label>
                                            <input
                                                type="email"
                                                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:border-purple-500 focus:ring-purple-500"
                                                defaultValue="support@portfolioplatform.com"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="flex gap-3">
                                    <button
                                        className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 transition-colors"
                                    >
                                        Save Settings
                                    </button>
                                    <button
                                        className="bg-gray-700 text-white px-4 py-2 rounded-md hover:bg-gray-600 transition-colors"
                                    >
                                        Reset to Defaults
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </main>

            {/* Delete Confirmation Modal */}
            {showDeleteModal && userToDelete && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-gray-800 rounded-lg max-w-md w-full p-6">
                        <h3 className="text-xl font-semibold mb-4">Confirm Deletion</h3>
                        <p className="text-gray-300 mb-6">
                            Are you sure you want to delete the user <strong>{userToDelete.username}</strong>?
                            This action cannot be undone and will remove all the user's data including portfolio,
                            projects, and account information.
                        </p>
                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setShowDeleteModal(false)}
                                className="bg-gray-700 text-white px-4 py-2 rounded-md hover:bg-gray-600 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => handleDeleteUser(userToDelete.id)}
                                className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors"
                            >
                                Delete User
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminDashboard;
