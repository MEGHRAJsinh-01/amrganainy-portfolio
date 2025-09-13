import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAdmin } from '../contexts/AdminContext';
import { useAuth } from '../contexts/AuthContext';

const UserDetails: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const { user: currentUser } = useAuth();
    const {
        selectedUser: user,
        getUser,
        updateUser,
        deleteUser,
        loading,
        error,
        clearAdminError
    } = useAdmin();

    const [formData, setFormData] = useState<{
        username: string;
        email: string;
        role: 'user' | 'admin';
        isEmailVerified: boolean;
    }>({
        username: '',
        email: '',
        role: 'user',
        isEmailVerified: false
    });

    const [isEditing, setIsEditing] = useState(false);
    const [confirmDelete, setConfirmDelete] = useState('');
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [updateMessage, setUpdateMessage] = useState({ text: '', type: '' });

    // Load user data on component mount
    useEffect(() => {
        if (id) {
            getUser(id);
        }
    }, [id, getUser]);

    // Update form data when user data is loaded
    useEffect(() => {
        if (user) {
            setFormData({
                username: user.username || '',
                email: user.email || '',
                role: user.role || 'user',
                isEmailVerified: user.isEmailVerified || false
            });
        }
    }, [user]);

    // Handle input changes
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        const isCheckbox = type === 'checkbox';

        setFormData(prev => ({
            ...prev,
            [name]: isCheckbox ? (e.target as HTMLInputElement).checked : value
        }));
    };

    // Save user changes
    const handleSaveUser = async () => {
        if (!id || !user) return;

        try {
            await updateUser(id, formData);
            setIsEditing(false);
            setUpdateMessage({
                text: 'User updated successfully!',
                type: 'success'
            });
            setTimeout(() => setUpdateMessage({ text: '', type: '' }), 3000);
        } catch (err: any) {
            setUpdateMessage({
                text: 'Failed to update user: ' + (err.message || 'Unknown error'),
                type: 'error'
            });
        }
    };

    // Handle user deletion
    const handleDeleteUser = async () => {
        if (!id || !user) return;

        if (confirmDelete !== user.username) {
            setUpdateMessage({
                text: `Please type the username "${user.username}" to confirm deletion.`,
                type: 'error'
            });
            return;
        }

        try {
            await deleteUser(id);
            navigate('/admin');
        } catch (err) {
            setUpdateMessage({
                text: 'Failed to delete user. Please try again.',
                type: 'error'
            });
        }
    };

    if (loading && !user) {
        return (
            <div className="min-h-screen bg-gray-900 text-white p-6 flex items-center justify-center">
                <div className="flex items-center space-x-2">
                    <div className="w-6 h-6 border-t-2 border-b-2 border-purple-500 rounded-full animate-spin"></div>
                    <span>Loading user data...</span>
                </div>
            </div>
        );
    }

    if (error && !user) {
        return (
            <div className="min-h-screen bg-gray-900 text-white p-6">
                <div className="bg-red-900/20 border border-red-500/50 text-red-300 p-4 rounded-md">
                    {error}
                    <button
                        className="ml-2 text-red-300 hover:text-white"
                        onClick={clearAdminError}
                    >
                        ✕
                    </button>
                </div>
                <div className="mt-4">
                    <Link
                        to="/admin"
                        className="text-blue-400 hover:underline"
                    >
                        ← Back to Admin Dashboard
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-900 text-white">
            {/* Header */}
            <header className="bg-gray-800 border-b border-gray-700 px-6 py-4">
                <div className="flex justify-between items-center">
                    <h1 className="text-2xl font-bold">User Management</h1>
                    <div className="flex gap-4">
                        <Link
                            to="/admin"
                            className="bg-gray-700 text-white px-4 py-2 rounded-md hover:bg-gray-600 transition-colors"
                        >
                            Back to Dashboard
                        </Link>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="container mx-auto px-6 py-8">
                {updateMessage.text && (
                    <div className={`mb-6 p-4 rounded-md ${updateMessage.type === 'error'
                            ? 'bg-red-900/20 border border-red-500/50 text-red-300'
                            : 'bg-green-900/20 border border-green-500/50 text-green-300'
                        }`}>
                        {updateMessage.text}
                    </div>
                )}

                {user && (
                    <div className="bg-gray-800 rounded-lg p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-semibold">User Details</h2>
                            <div className="flex gap-3">
                                {!isEditing ? (
                                    <button
                                        onClick={() => setIsEditing(true)}
                                        className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                                    >
                                        Edit User
                                    </button>
                                ) : (
                                    <>
                                        <button
                                            onClick={handleSaveUser}
                                            className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors"
                                        >
                                            Save Changes
                                        </button>
                                        <button
                                            onClick={() => {
                                                setIsEditing(false);
                                                // Reset form data to original user data
                                                if (user) {
                                                    setFormData({
                                                        username: user.username || '',
                                                        email: user.email || '',
                                                        role: user.role || 'user',
                                                        isEmailVerified: user.isEmailVerified || false
                                                    });
                                                }
                                            }}
                                            className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 transition-colors"
                                        >
                                            Cancel
                                        </button>
                                    </>
                                )}

                                {currentUser?.id !== user.id && (
                                    <button
                                        onClick={() => setShowDeleteModal(true)}
                                        className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors"
                                    >
                                        Delete User
                                    </button>
                                )}
                            </div>
                        </div>

                        <div className="mb-6 flex gap-6">
                            <div className="w-32 h-32 rounded-full bg-gray-700 flex items-center justify-center text-4xl">
                                {user.username.substring(0, 2).toUpperCase()}
                            </div>
                            <div className="flex-1">
                                <h3 className="text-2xl font-semibold">{user.username}</h3>
                                <p className="text-gray-400">{user.email}</p>
                                <div className="mt-2 flex gap-3">
                                    <span className={`px-2 py-1 rounded-full text-xs ${user.role === 'admin'
                                            ? 'bg-purple-500/20 text-purple-300'
                                            : 'bg-blue-500/20 text-blue-300'
                                        }`}>
                                        {user.role}
                                    </span>
                                    <span className={`px-2 py-1 rounded-full text-xs ${user.isEmailVerified
                                            ? 'bg-green-500/20 text-green-300'
                                            : 'bg-yellow-500/20 text-yellow-300'
                                        }`}>
                                        {user.isEmailVerified ? 'Verified' : 'Unverified'}
                                    </span>
                                </div>
                                <div className="mt-4 text-sm text-gray-400">
                                    <p>Created: {new Date(user.createdAt).toLocaleString()}</p>
                                    {user.lastLogin && (
                                        <p>Last Login: {new Date(user.lastLogin).toLocaleString()}</p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {isEditing ? (
                            <div className="bg-gray-700 rounded-lg p-6">
                                <h3 className="text-lg font-medium mb-4">Edit User Information</h3>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-gray-300 text-sm font-medium mb-2">
                                            Username
                                        </label>
                                        <input
                                            type="text"
                                            name="username"
                                            value={formData.username}
                                            onChange={handleInputChange}
                                            className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded-md text-white focus:border-purple-500 focus:ring-purple-500"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-gray-300 text-sm font-medium mb-2">
                                            Email
                                        </label>
                                        <input
                                            type="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleInputChange}
                                            className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded-md text-white focus:border-purple-500 focus:ring-purple-500"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-gray-300 text-sm font-medium mb-2">
                                            Role
                                        </label>
                                        <select
                                            name="role"
                                            value={formData.role}
                                            onChange={handleInputChange}
                                            className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded-md text-white focus:border-purple-500 focus:ring-purple-500"
                                        >
                                            <option value="user">User</option>
                                            <option value="admin">Admin</option>
                                        </select>
                                    </div>

                                    <div className="flex items-center">
                                        <input
                                            type="checkbox"
                                            id="isEmailVerified"
                                            name="isEmailVerified"
                                            checked={formData.isEmailVerified}
                                            onChange={handleInputChange}
                                            className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500 focus:ring-offset-gray-800"
                                        />
                                        <label htmlFor="isEmailVerified" className="ml-2 text-gray-300">
                                            Email Verified
                                        </label>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                <div className="bg-gray-700 rounded-lg p-6">
                                    <h3 className="text-lg font-medium mb-4">Portfolio Statistics</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                        <div className="bg-gray-800 p-4 rounded-lg">
                                            <p className="text-gray-400 text-sm">Projects</p>
                                            <h4 className="text-xl font-bold">12</h4>
                                        </div>
                                        <div className="bg-gray-800 p-4 rounded-lg">
                                            <p className="text-gray-400 text-sm">Views</p>
                                            <h4 className="text-xl font-bold">487</h4>
                                        </div>
                                        <div className="bg-gray-800 p-4 rounded-lg">
                                            <p className="text-gray-400 text-sm">CV Downloads</p>
                                            <h4 className="text-xl font-bold">23</h4>
                                        </div>
                                        <div className="bg-gray-800 p-4 rounded-lg">
                                            <p className="text-gray-400 text-sm">Contact Requests</p>
                                            <h4 className="text-xl font-bold">8</h4>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-gray-700 rounded-lg p-6">
                                    <h3 className="text-lg font-medium mb-4">Recent Activity</h3>
                                    <div className="space-y-2">
                                        <div className="flex justify-between p-3 bg-gray-800 rounded">
                                            <span>Updated profile</span>
                                            <span className="text-gray-400 text-sm">2 days ago</span>
                                        </div>
                                        <div className="flex justify-between p-3 bg-gray-800 rounded">
                                            <span>Added new project</span>
                                            <span className="text-gray-400 text-sm">5 days ago</span>
                                        </div>
                                        <div className="flex justify-between p-3 bg-gray-800 rounded">
                                            <span>Uploaded new CV</span>
                                            <span className="text-gray-400 text-sm">1 week ago</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-gray-700 rounded-lg p-6">
                                    <h3 className="text-lg font-medium mb-4">Quick Actions</h3>
                                    <div className="flex gap-3">
                                        <Link
                                            to={`/u/${user.username}`}
                                            target="_blank"
                                            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                                        >
                                            View Portfolio
                                        </Link>
                                        <button
                                            onClick={() => {
                                                navigator.clipboard.writeText(`yourdomain.com/u/${user.username}`);
                                                setUpdateMessage({
                                                    text: 'Portfolio URL copied to clipboard!',
                                                    type: 'success'
                                                });
                                                setTimeout(() => setUpdateMessage({ text: '', type: '' }), 2000);
                                            }}
                                            className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 transition-colors"
                                        >
                                            Copy Portfolio URL
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </main>

            {/* Delete Confirmation Modal */}
            {showDeleteModal && user && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-gray-800 rounded-lg max-w-md w-full p-6">
                        <h3 className="text-xl font-semibold mb-4">Confirm Account Deletion</h3>
                        <p className="text-gray-300 mb-6">
                            Are you sure you want to delete the user <strong>{user.username}</strong>?
                            This action cannot be undone and will remove all the user's data including portfolio,
                            projects, and account information.
                        </p>

                        <div className="mb-4">
                            <label className="block text-gray-300 text-sm font-medium mb-2">
                                Type username <strong>{user.username}</strong> to confirm
                            </label>
                            <input
                                type="text"
                                value={confirmDelete}
                                onChange={(e) => setConfirmDelete(e.target.value)}
                                className="w-full px-3 py-2 bg-gray-700 border border-red-500/40 rounded-md text-white focus:border-red-500 focus:ring-red-500"
                                placeholder={user.username}
                            />
                        </div>

                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => {
                                    setShowDeleteModal(false);
                                    setConfirmDelete('');
                                }}
                                className="bg-gray-700 text-white px-4 py-2 rounded-md hover:bg-gray-600 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDeleteUser}
                                disabled={confirmDelete !== user.username}
                                className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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

export default UserDetails;
