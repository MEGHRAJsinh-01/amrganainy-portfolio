import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAdmin } from '../contexts/AdminContext';

const AdminAnalytics: React.FC = () => {
    const { stats, getStats, loading, error } = useAdmin();
    const [timeRange, setTimeRange] = useState('7days');

    useEffect(() => {
        getStats();
    }, []);

    // Sample data for the charts
    const visitorData = {
        '7days': [120, 140, 110, 180, 190, 210, 200],
        '30days': [120, 140, 110, 180, 190, 210, 200, 220, 240, 180, 190, 210, 180, 160,
            180, 190, 210, 190, 180, 160, 170, 180, 190, 210, 240, 210, 190, 210, 220, 230],
        '90days': Array.from({ length: 90 }, () => Math.floor(Math.random() * 100) + 100)
    };

    const popularPortfolios = [
        { username: 'janedoe', views: 1240, projects: 8 },
        { username: 'johnsmith', views: 980, projects: 12 },
        { username: 'alexwilson', views: 890, projects: 6 },
        { username: 'sarahparker', views: 780, projects: 15 },
        { username: 'mikejones', views: 650, projects: 9 }
    ];

    const recentSignups = [
        { username: 'newuser1', date: '2023-09-08', verified: true },
        { username: 'developer42', date: '2023-09-07', verified: true },
        { username: 'webdesigner', date: '2023-09-07', verified: false },
        { username: 'codemaster', date: '2023-09-06', verified: true },
        { username: 'uideveloper', date: '2023-09-05', verified: false }
    ];

    const getDateLabels = () => {
        const today = new Date();
        const labels = [];
        const days = timeRange === '7days' ? 7 : timeRange === '30days' ? 30 : 90;

        for (let i = days - 1; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            labels.push(date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
        }

        return labels;
    };

    return (
        <div className="min-h-screen bg-gray-900 text-white">
            {/* Header */}
            <header className="bg-gray-800 border-b border-gray-700 px-6 py-4">
                <div className="flex justify-between items-center">
                    <h1 className="text-2xl font-bold">Analytics Dashboard</h1>
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
                {error && (
                    <div className="bg-red-900/20 border border-red-500/50 text-red-300 p-4 rounded-md mb-6">
                        {error}
                    </div>
                )}

                {loading ? (
                    <div className="flex justify-center my-12">
                        <div className="flex items-center space-x-2">
                            <div className="w-6 h-6 border-t-2 border-b-2 border-purple-500 rounded-full animate-spin"></div>
                            <span>Loading analytics data...</span>
                        </div>
                    </div>
                ) : (
                    <>
                        {/* Stats Summary */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-gray-400 text-sm">Total Users</p>
                                        <h3 className="text-2xl font-bold">{stats?.totalUsers || 0}</h3>
                                    </div>
                                    <div className="p-3 bg-blue-500/20 rounded-full">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                                        </svg>
                                    </div>
                                </div>
                                <div className="mt-2 text-sm">
                                    <span className="text-green-400">↑ 12%</span> from last month
                                </div>
                            </div>

                            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-gray-400 text-sm">Active Users</p>
                                        <h3 className="text-2xl font-bold">{stats?.activeUsers || 0}</h3>
                                    </div>
                                    <div className="p-3 bg-green-500/20 rounded-full">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    </div>
                                </div>
                                <div className="mt-2 text-sm">
                                    <span className="text-green-400">↑ 8%</span> from last month
                                </div>
                            </div>

                            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-gray-400 text-sm">Total Projects</p>
                                        <h3 className="text-2xl font-bold">{stats?.totalProjects || 0}</h3>
                                    </div>
                                    <div className="p-3 bg-yellow-500/20 rounded-full">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                                        </svg>
                                    </div>
                                </div>
                                <div className="mt-2 text-sm">
                                    <span className="text-green-400">↑ 15%</span> from last month
                                </div>
                            </div>

                            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-gray-400 text-sm">Total Visitors</p>
                                        <h3 className="text-2xl font-bold">24,892</h3>
                                    </div>
                                    <div className="p-3 bg-purple-500/20 rounded-full">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                        </svg>
                                    </div>
                                </div>
                                <div className="mt-2 text-sm">
                                    <span className="text-green-400">↑ 22%</span> from last month
                                </div>
                            </div>
                        </div>

                        {/* Visitors Chart */}
                        <div className="bg-gray-800 rounded-lg p-6 mb-8">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-xl font-semibold">Visitor Statistics</h2>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => setTimeRange('7days')}
                                        className={`px-3 py-1 rounded ${timeRange === '7days' ? 'bg-purple-600' : 'bg-gray-700'}`}
                                    >
                                        7 Days
                                    </button>
                                    <button
                                        onClick={() => setTimeRange('30days')}
                                        className={`px-3 py-1 rounded ${timeRange === '30days' ? 'bg-purple-600' : 'bg-gray-700'}`}
                                    >
                                        30 Days
                                    </button>
                                    <button
                                        onClick={() => setTimeRange('90days')}
                                        className={`px-3 py-1 rounded ${timeRange === '90days' ? 'bg-purple-600' : 'bg-gray-700'}`}
                                    >
                                        90 Days
                                    </button>
                                </div>
                            </div>

                            <div className="h-80">
                                {/* Chart would go here - using a placeholder */}
                                <div className="w-full h-full bg-gray-700 rounded-lg flex items-center justify-center">
                                    <div className="relative w-full h-full p-4">
                                        <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gray-600"></div>
                                        <div className="absolute top-0 bottom-0 left-0 w-[1px] bg-gray-600"></div>

                                        <div className="flex h-full items-end">
                                            {visitorData[timeRange as keyof typeof visitorData].map((value, index) => (
                                                <div key={index} className="flex-1 flex flex-col items-center">
                                                    <div
                                                        className="w-4/5 bg-purple-500/50 hover:bg-purple-500/70 transition-all cursor-pointer rounded-t"
                                                        style={{ height: `${(value / 250) * 100}%` }}
                                                        title={`${getDateLabels()[index]}: ${value} visitors`}
                                                    ></div>
                                                    {(timeRange === '7days' || (timeRange === '30days' && index % 5 === 0) || (timeRange === '90days' && index % 15 === 0)) && (
                                                        <div className="text-xs text-gray-400 mt-2">
                                                            {getDateLabels()[index]}
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                            {/* Popular Portfolios */}
                            <div className="bg-gray-800 rounded-lg p-6">
                                <h2 className="text-xl font-semibold mb-6">Most Popular Portfolios</h2>
                                <div className="space-y-4">
                                    {popularPortfolios.map((portfolio, index) => (
                                        <div key={index} className="flex items-center justify-between bg-gray-700 p-4 rounded-lg">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-purple-700 flex items-center justify-center text-lg font-semibold">
                                                    {index + 1}
                                                </div>
                                                <div>
                                                    <h3 className="font-medium">{portfolio.username}</h3>
                                                    <p className="text-sm text-gray-400">{portfolio.projects} projects</p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <span className="block font-semibold">{portfolio.views.toLocaleString()}</span>
                                                <span className="text-sm text-gray-400">views</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Recent Signups */}
                            <div className="bg-gray-800 rounded-lg p-6">
                                <h2 className="text-xl font-semibold mb-6">Recent Signups</h2>
                                <div className="space-y-4">
                                    {recentSignups.map((signup, index) => (
                                        <div key={index} className="flex items-center justify-between bg-gray-700 p-4 rounded-lg">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-blue-700 flex items-center justify-center">
                                                    {signup.username.substring(0, 2).toUpperCase()}
                                                </div>
                                                <div>
                                                    <h3 className="font-medium">{signup.username}</h3>
                                                    <p className="text-sm text-gray-400">{signup.date}</p>
                                                </div>
                                            </div>
                                            <div>
                                                <span className={`px-2 py-1 rounded-full text-xs ${signup.verified
                                                        ? 'bg-green-500/20 text-green-300'
                                                        : 'bg-yellow-500/20 text-yellow-300'
                                                    }`}>
                                                    {signup.verified ? 'Verified' : 'Pending'}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Storage Usage */}
                        <div className="bg-gray-800 rounded-lg p-6">
                            <h2 className="text-xl font-semibold mb-6">Platform Storage Usage</h2>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="bg-gray-700 p-4 rounded-lg">
                                    <div className="flex justify-between items-center mb-2">
                                        <h3 className="font-medium">Total Storage</h3>
                                        <span className="text-xs bg-gray-600 px-2 py-1 rounded">
                                            {stats?.storage?.total ? (stats.storage.total / 1024 / 1024 / 1024).toFixed(2) : 0} GB
                                        </span>
                                    </div>
                                    <div className="w-full bg-gray-600 rounded-full h-2.5">
                                        <div
                                            className="bg-blue-600 h-2.5 rounded-full"
                                            style={{ width: stats?.storage?.total && stats?.storage?.used ? `${(stats.storage.used / stats.storage.total) * 100}%` : '0%' }}
                                        ></div>
                                    </div>
                                    <div className="mt-2 text-sm text-gray-400">
                                        {stats?.storage?.used ? (stats.storage.used / 1024 / 1024 / 1024).toFixed(2) : 0} GB used of {stats?.storage?.total ? (stats.storage.total / 1024 / 1024 / 1024).toFixed(2) : 0} GB
                                    </div>
                                </div>

                                <div className="bg-gray-700 p-4 rounded-lg">
                                    <div className="flex justify-between items-center mb-2">
                                        <h3 className="font-medium">Images</h3>
                                        <span className="text-xs bg-gray-600 px-2 py-1 rounded">
                                            4.2 GB
                                        </span>
                                    </div>
                                    <div className="w-full bg-gray-600 rounded-full h-2.5">
                                        <div
                                            className="bg-purple-600 h-2.5 rounded-full"
                                            style={{ width: '45%' }}
                                        ></div>
                                    </div>
                                    <div className="mt-2 text-sm text-gray-400">
                                        45% of total storage
                                    </div>
                                </div>

                                <div className="bg-gray-700 p-4 rounded-lg">
                                    <div className="flex justify-between items-center mb-2">
                                        <h3 className="font-medium">CV Documents</h3>
                                        <span className="text-xs bg-gray-600 px-2 py-1 rounded">
                                            1.8 GB
                                        </span>
                                    </div>
                                    <div className="w-full bg-gray-600 rounded-full h-2.5">
                                        <div
                                            className="bg-green-600 h-2.5 rounded-full"
                                            style={{ width: '20%' }}
                                        ></div>
                                    </div>
                                    <div className="mt-2 text-sm text-gray-400">
                                        20% of total storage
                                    </div>
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </main>
        </div>
    );
};

export default AdminAnalytics;
