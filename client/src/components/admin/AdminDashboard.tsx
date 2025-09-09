import React, { useState } from 'react';
import { Link } from 'react-router-dom';

// Mock user data for UI prototype
const mockUsers = [
  {
    id: '1',
    username: 'johndoe',
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    role: 'user',
    isActive: true,
    registrationDate: '2023-06-10T14:23:10Z',
    lastLogin: '2023-09-05T09:15:22Z',
    portfolioUrl: 'johndoe'
  },
  {
    id: '2',
    username: 'janesmith',
    firstName: 'Jane',
    lastName: 'Smith',
    email: 'jane.smith@example.com',
    role: 'user',
    isActive: true,
    registrationDate: '2023-07-05T10:11:23Z',
    lastLogin: '2023-09-04T15:42:11Z',
    portfolioUrl: 'janesmith'
  },
  {
    id: '3',
    username: 'mikebrown',
    firstName: 'Mike',
    lastName: 'Brown',
    email: 'mike.brown@example.com',
    role: 'user',
    isActive: false,
    registrationDate: '2023-05-22T08:30:15Z',
    lastLogin: '2023-07-19T11:23:45Z',
    portfolioUrl: 'mikebrown'
  },
  {
    id: '4',
    username: 'sarahwilson',
    firstName: 'Sarah',
    lastName: 'Wilson',
    email: 'sarah.wilson@example.com',
    role: 'user',
    isActive: true,
    registrationDate: '2023-08-14T16:19:33Z',
    lastLogin: '2023-09-07T14:32:10Z',
    portfolioUrl: 'sarahwilson'
  }
];

// Mock statistics for UI prototype
const mockStats = {
  totalUsers: 34,
  activeUsers: 28,
  newUsersThisMonth: 7,
  totalPortfolios: 34,
  portfolioViews: 1245,
  averageViewsPerPortfolio: 36.6
};

const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('users');
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredUsers, setFilteredUsers] = useState(mockUsers);
  const [selectedUser, setSelectedUser] = useState<typeof mockUsers[0] | null>(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [updateMessage, setUpdateMessage] = useState({ text: '', type: '' });

  // Search functionality
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value.toLowerCase();
    setSearchTerm(term);
    
    if (term.trim() === '') {
      setFilteredUsers(mockUsers);
      return;
    }
    
    const filtered = mockUsers.filter(user => 
      user.username.toLowerCase().includes(term) ||
      user.firstName.toLowerCase().includes(term) ||
      user.lastName.toLowerCase().includes(term) ||
      user.email.toLowerCase().includes(term)
    );
    
    setFilteredUsers(filtered);
  };

  const handleEditUser = (user: typeof mockUsers[0]) => {
    setSelectedUser(user);
    setShowUserModal(true);
  };

  const handleCloseModal = () => {
    setSelectedUser(null);
    setShowUserModal(false);
  };

  const handleCreateUser = () => {
    setSelectedUser({
      id: '',
      username: '',
      firstName: '',
      lastName: '',
      email: '',
      role: 'user',
      isActive: true,
      registrationDate: new Date().toISOString(),
      lastLogin: '',
      portfolioUrl: ''
    });
    setShowUserModal(true);
  };

  const handleToggleUserStatus = (userId: string, currentStatus: boolean) => {
    // In a real implementation, this would make an API call
    setUpdateMessage({ 
      text: `User ${currentStatus ? 'deactivated' : 'activated'} successfully!`, 
      type: 'success' 
    });
    setTimeout(() => setUpdateMessage({ text: '', type: '' }), 3000);
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
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
            >
              My Dashboard
            </Link>
            <button
              onClick={() => {}} // Mock function
              className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors"
            >
              Sign Out
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Sidebar */}
          <div className="w-full md:w-64 bg-gray-800 rounded-lg p-4">
            <div className="flex flex-col items-center mb-6">
              <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-blue-500 mb-3">
                <img
                  src="https://randomuser.me/api/portraits/men/1.jpg"
                  alt="Admin"
                  className="w-full h-full object-cover"
                />
              </div>
              <h3 className="text-lg font-semibold">Admin User</h3>
              <p className="text-gray-400 text-sm">Super Administrator</p>
            </div>
            
            <nav className="space-y-1">
              <button
                onClick={() => setActiveTab('dashboard')}
                className={`w-full text-left px-4 py-2 rounded-md transition-colors ${
                  activeTab === 'dashboard' ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-700'
                }`}
              >
                Dashboard
              </button>
              <button
                onClick={() => setActiveTab('users')}
                className={`w-full text-left px-4 py-2 rounded-md transition-colors ${
                  activeTab === 'users' ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-700'
                }`}
              >
                User Management
              </button>
              <button
                onClick={() => setActiveTab('portfolios')}
                className={`w-full text-left px-4 py-2 rounded-md transition-colors ${
                  activeTab === 'portfolios' ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-700'
                }`}
              >
                Portfolio Management
              </button>
              <button
                onClick={() => setActiveTab('settings')}
                className={`w-full text-left px-4 py-2 rounded-md transition-colors ${
                  activeTab === 'settings' ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-700'
                }`}
              >
                System Settings
              </button>
            </nav>
          </div>

          {/* Main Content Area */}
          <div className="flex-1">
            {updateMessage.text && (
              <div className={`mb-6 p-4 rounded-md ${
                updateMessage.type === 'error' 
                  ? 'bg-red-900/20 border border-red-500/50 text-red-300' 
                  : 'bg-green-900/20 border border-green-500/50 text-green-300'
              }`}>
                {updateMessage.text}
              </div>
            )}

            {/* Dashboard Tab */}
            {activeTab === 'dashboard' && (
              <div className="space-y-6">
                <div className="bg-gray-800 rounded-lg p-6">
                  <h2 className="text-xl font-semibold mb-6">Dashboard Overview</h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-gray-700 p-4 rounded-lg">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-gray-400 text-sm">Total Users</p>
                          <h3 className="text-2xl font-bold">{mockStats.totalUsers}</h3>
                          <p className="text-green-400 text-sm">{mockStats.newUsersThisMonth} new this month</p>
                        </div>
                        <div className="bg-blue-500 bg-opacity-20 p-3 rounded-full">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                          </svg>
                        </div>
                      </div>
                    </div>
                    <div className="bg-gray-700 p-4 rounded-lg">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-gray-400 text-sm">Active Users</p>
                          <h3 className="text-2xl font-bold">{mockStats.activeUsers}</h3>
                          <p className="text-green-400 text-sm">{Math.round(mockStats.activeUsers / mockStats.totalUsers * 100)}% of total users</p>
                        </div>
                        <div className="bg-green-500 bg-opacity-20 p-3 rounded-full">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      </div>
                    </div>
                    <div className="bg-gray-700 p-4 rounded-lg">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-gray-400 text-sm">Portfolio Views</p>
                          <h3 className="text-2xl font-bold">{mockStats.portfolioViews}</h3>
                          <p className="text-blue-400 text-sm">Avg. {mockStats.averageViewsPerPortfolio} per portfolio</p>
                        </div>
                        <div className="bg-purple-500 bg-opacity-20 p-3 rounded-full">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gray-800 rounded-lg p-6">
                  <h2 className="text-xl font-semibold mb-6">Recent User Activity</h2>
                  
                  <div className="overflow-x-auto">
                    <table className="min-w-full bg-gray-700 rounded-lg overflow-hidden">
                      <thead className="bg-gray-600">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                            User
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                            Action
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                            Date
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-600">
                        <tr>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-10 w-10 rounded-full overflow-hidden">
                                <img src="https://randomuser.me/api/portraits/women/33.jpg" alt="" className="h-10 w-10 object-cover" />
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-white">Sarah Wilson</div>
                                <div className="text-sm text-gray-400">sarahwilson</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                              Updated Profile
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                            Today, 14:32
                          </td>
                        </tr>
                        <tr>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-10 w-10 rounded-full overflow-hidden">
                                <img src="https://randomuser.me/api/portraits/men/54.jpg" alt="" className="h-10 w-10 object-cover" />
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-white">John Doe</div>
                                <div className="text-sm text-gray-400">johndoe</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                              Created Project
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                            Yesterday, 09:15
                          </td>
                        </tr>
                        <tr>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-10 w-10 rounded-full overflow-hidden">
                                <img src="https://randomuser.me/api/portraits/women/67.jpg" alt="" className="h-10 w-10 object-cover" />
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-white">Jane Smith</div>
                                <div className="text-sm text-gray-400">janesmith</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-purple-100 text-purple-800">
                              Registered
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                            2 days ago, 15:42
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* Users Tab */}
            {activeTab === 'users' && (
              <div className="bg-gray-800 rounded-lg p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-semibold">User Management</h2>
                  <button
                    onClick={handleCreateUser}
                    className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors"
                  >
                    Add New User
                  </button>
                </div>
                
                <div className="mb-6">
                  <div className="relative">
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={handleSearch}
                      className="w-full px-4 py-2 pl-10 bg-gray-700 border border-gray-600 rounded-md text-white focus:border-blue-500 focus:ring-blue-500"
                      placeholder="Search users by name, email or username..."
                    />
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </div>
                  </div>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="min-w-full bg-gray-700 rounded-lg overflow-hidden">
                    <thead className="bg-gray-600">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                          User
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                          Email
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                          Registered
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                          Last Login
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-600">
                      {filteredUsers.map(user => (
                        <tr key={user.id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-10 w-10 rounded-full overflow-hidden bg-gray-800">
                                <img 
                                  src={`https://ui-avatars.com/api/?name=${user.firstName}+${user.lastName}&background=1e293b&color=fff`} 
                                  alt="" 
                                  className="h-10 w-10 object-cover" 
                                />
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-white">{user.firstName} {user.lastName}</div>
                                <div className="text-sm text-gray-400">{user.username}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                            {user.email}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              user.isActive 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {user.isActive ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                            {new Date(user.registrationDate).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                            {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'Never'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300 space-x-2">
                            <button
                              onClick={() => handleEditUser(user)}
                              className="text-blue-400 hover:text-blue-300"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleToggleUserStatus(user.id, user.isActive)}
                              className={user.isActive ? "text-red-400 hover:text-red-300" : "text-green-400 hover:text-green-300"}
                            >
                              {user.isActive ? 'Deactivate' : 'Activate'}
                            </button>
                            <Link
                              to={`/u/${user.portfolioUrl}`}
                              target="_blank"
                              className="text-purple-400 hover:text-purple-300"
                            >
                              View
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                
                {filteredUsers.length === 0 && (
                  <div className="text-center py-8">
                    <p className="text-gray-400">No users found matching "{searchTerm}"</p>
                  </div>
                )}
              </div>
            )}

            {/* Portfolios Tab */}
            {activeTab === 'portfolios' && (
              <div className="bg-gray-800 rounded-lg p-6">
                <h2 className="text-xl font-semibold mb-6">Portfolio Management</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {mockUsers.map(user => (
                    <div key={user.id} className="bg-gray-700 rounded-lg overflow-hidden">
                      <div className="h-40 bg-gradient-to-r from-blue-900 to-purple-900 flex items-end">
                        <div className="p-4 flex items-center gap-4">
                          <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-white bg-gray-800">
                            <img 
                              src={`https://ui-avatars.com/api/?name=${user.firstName}+${user.lastName}&background=1e293b&color=fff`} 
                              alt="" 
                              className="h-16 w-16 object-cover" 
                            />
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-white">{user.firstName} {user.lastName}</h3>
                            <p className="text-gray-300 text-sm">@{user.username}</p>
                          </div>
                        </div>
                      </div>
                      <div className="p-4">
                        <div className="flex justify-between items-center mb-3">
                          <span className="text-sm text-gray-400">Portfolio URL:</span>
                          <span className="text-sm text-blue-400">yourdomain.com/u/{user.portfolioUrl}</span>
                        </div>
                        <div className="flex justify-between items-center mb-3">
                          <span className="text-sm text-gray-400">Projects:</span>
                          <span className="text-sm text-white">{Math.floor(Math.random() * 10) + 1}</span>
                        </div>
                        <div className="flex justify-between items-center mb-3">
                          <span className="text-sm text-gray-400">Status:</span>
                          <span className={`text-sm ${user.isActive ? 'text-green-400' : 'text-red-400'}`}>
                            {user.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                        <div className="flex justify-between items-center mb-3">
                          <span className="text-sm text-gray-400">Last Updated:</span>
                          <span className="text-sm text-white">{new Date(user.lastLogin || user.registrationDate).toLocaleDateString()}</span>
                        </div>
                        <div className="mt-4 flex justify-between">
                          <Link
                            to={`/u/${user.portfolioUrl}`}
                            target="_blank"
                            className="bg-blue-600 text-white px-3 py-1 rounded-md hover:bg-blue-700 transition-colors text-sm"
                          >
                            View Portfolio
                          </Link>
                          <button
                            onClick={() => {
                              setUpdateMessage({ text: 'Feature not available in prototype', type: 'error' });
                              setTimeout(() => setUpdateMessage({ text: '', type: '' }), 3000);
                            }}
                            className="bg-gray-600 text-white px-3 py-1 rounded-md hover:bg-gray-700 transition-colors text-sm"
                          >
                            Analytics
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Settings Tab */}
            {activeTab === 'settings' && (
              <div className="bg-gray-800 rounded-lg p-6">
                <h2 className="text-xl font-semibold mb-6">System Settings</h2>
                
                <div className="mb-6">
                  <h3 className="text-lg font-medium mb-4">General Settings</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-gray-300 text-sm font-medium mb-2">
                        Site Name
                      </label>
                      <input
                        type="text"
                        value="Portfolio Platform"
                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-gray-300 text-sm font-medium mb-2">
                        Domain
                      </label>
                      <input
                        type="text"
                        value="yourdomain.com"
                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-gray-300 text-sm font-medium mb-2">
                        Admin Email
                      </label>
                      <input
                        type="email"
                        value="admin@yourdomain.com"
                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-gray-300 text-sm font-medium mb-2">
                        Default Language
                      </label>
                      <select className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:border-blue-500 focus:ring-blue-500">
                        <option value="en">English</option>
                        <option value="de">German</option>
                        <option value="fr">French</option>
                        <option value="es">Spanish</option>
                      </select>
                    </div>
                  </div>
                </div>
                
                <div className="mb-6">
                  <h3 className="text-lg font-medium mb-4">Registration Settings</h3>
                  
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <input 
                        type="checkbox" 
                        id="allowRegistration" 
                        checked={true}
                        onChange={() => {}}
                        className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500 focus:ring-offset-gray-800"
                      />
                      <label htmlFor="allowRegistration" className="text-gray-300">Allow public registration</label>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <input 
                        type="checkbox" 
                        id="emailVerification" 
                        checked={true}
                        onChange={() => {}}
                        className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500 focus:ring-offset-gray-800"
                      />
                      <label htmlFor="emailVerification" className="text-gray-300">Require email verification</label>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <input 
                        type="checkbox" 
                        id="adminApproval" 
                        checked={false}
                        onChange={() => {}}
                        className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500 focus:ring-offset-gray-800"
                      />
                      <label htmlFor="adminApproval" className="text-gray-300">Require admin approval for new users</label>
                    </div>
                  </div>
                </div>
                
                <div className="mb-6">
                  <h3 className="text-lg font-medium mb-4">API Integration Settings</h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-gray-300 text-sm font-medium mb-2">
                        GitHub API Key
                      </label>
                      <input
                        type="password"
                        value="●●●●●●●●●●●●●●●●●●●●●●●●"
                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-gray-300 text-sm font-medium mb-2">
                        LinkedIn API Key
                      </label>
                      <input
                        type="password"
                        value="●●●●●●●●●●●●●●●●●●●●●●●●"
                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>
                
                <button
                  onClick={() => {
                    setUpdateMessage({ text: 'Settings saved successfully!', type: 'success' });
                    setTimeout(() => setUpdateMessage({ text: '', type: '' }), 3000);
                  }}
                  className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors"
                >
                  Save Settings
                </button>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* User Edit Modal */}
      {showUserModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <h3 className="text-xl font-semibold mb-4">
              {selectedUser.id ? 'Edit User' : 'Create New User'}
            </h3>
            
            <div className="mb-4">
              <label className="block text-gray-300 text-sm font-medium mb-2">
                First Name
              </label>
              <input
                type="text"
                value={selectedUser.firstName}
                onChange={(e) => setSelectedUser({...selectedUser, firstName: e.target.value})}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-gray-300 text-sm font-medium mb-2">
                Last Name
              </label>
              <input
                type="text"
                value={selectedUser.lastName}
                onChange={(e) => setSelectedUser({...selectedUser, lastName: e.target.value})}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-gray-300 text-sm font-medium mb-2">
                Email
              </label>
              <input
                type="email"
                value={selectedUser.email}
                onChange={(e) => setSelectedUser({...selectedUser, email: e.target.value})}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-gray-300 text-sm font-medium mb-2">
                Username
              </label>
              <input
                type="text"
                value={selectedUser.username}
                onChange={(e) => {
                  const username = e.target.value.toLowerCase().replace(/\s+/g, '');
                  setSelectedUser({
                    ...selectedUser, 
                    username, 
                    portfolioUrl: username
                  });
                }}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-gray-300 text-sm font-medium mb-2">
                Portfolio URL
              </label>
              <div className="flex">
                <span className="inline-flex items-center px-3 text-gray-400 bg-gray-600 rounded-l-md border border-r-0 border-gray-600">
                  yourdomain.com/u/
                </span>
                <input
                  type="text"
                  value={selectedUser.portfolioUrl}
                  onChange={(e) => setSelectedUser({...selectedUser, portfolioUrl: e.target.value.toLowerCase().replace(/\s+/g, '-')})}
                  className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-r-md text-white focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
            </div>
            
            <div className="mb-4">
              <label className="block text-gray-300 text-sm font-medium mb-2">
                Role
              </label>
              <select
                value={selectedUser.role}
                onChange={(e) => setSelectedUser({...selectedUser, role: e.target.value})}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            
            <div className="mb-6">
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={selectedUser.isActive}
                  onChange={(e) => setSelectedUser({...selectedUser, isActive: e.target.checked})}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500 focus:ring-offset-gray-800"
                />
                <span className="text-gray-300">Active Account</span>
              </label>
            </div>
            
            <div className="flex justify-end gap-3">
              <button
                onClick={handleCloseModal}
                className="px-4 py-2 bg-gray-700 text-white rounded-md hover:bg-gray-600 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  handleCloseModal();
                  setUpdateMessage({ 
                    text: selectedUser.id 
                      ? 'User updated successfully!' 
                      : 'New user created successfully!', 
                    type: 'success' 
                  });
                  setTimeout(() => setUpdateMessage({ text: '', type: '' }), 3000);
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                {selectedUser.id ? 'Update User' : 'Create User'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
