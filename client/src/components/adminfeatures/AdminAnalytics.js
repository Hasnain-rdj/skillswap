import React, { useEffect, useState } from 'react';
import NavigationBar from '../NavigationBar';
import {
    UserGroupIcon,
    CurrencyDollarIcon,
    ChartBarIcon
} from '@heroicons/react/24/outline';
import {
    Bar,
    Line,
    Pie
} from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    PointElement,
    LineElement,
    ArcElement,
    Tooltip,
    Legend
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, PointElement, LineElement, ArcElement, Tooltip, Legend);

const AdminAnalytics = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        setLoading(true);
        setError('');
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(process.env.REACT_APP_API_URL + '/api/admin/stats', {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (!res.ok) throw new Error('Failed to fetch analytics');
            const data = await res.json();
            setStats(data);
        } catch (err) {
            setError('Failed to load analytics.');
        }
        setLoading(false);
    };

    const colorPalette = [
        '#10b981', // emerald
        '#3b82f6', // blue
        '#f59e42', // orange
        '#f43f5e', // rose
        '#a78bfa', // purple
        '#fbbf24', // yellow
        '#6366f1', // indigo
        '#34d399', // green
        '#f87171', // red
        '#38bdf8'  // sky
    ];

    const userGrowthData = stats ? {
        labels: stats.userGrowth.map(u => u._id),
        datasets: [{
            label: 'Users Joined',
            data: stats.userGrowth.map(u => u.count),
            backgroundColor: '#2563eb',
        }]
    } : null;
    const projectTrendsData = stats ? {
        labels: stats.projectTrends.map(p => p._id),
        datasets: [{
            label: 'Projects Created',
            data: stats.projectTrends.map(p => p.count),
            backgroundColor: '#f59e42',
        }]
    } : null;
    const skillsData = stats ? {
        labels: stats.popularSkills.map(s => s._id),
        datasets: [{
            label: 'Freelancers',
            data: stats.popularSkills.map(s => s.count),
            backgroundColor: colorPalette.slice(0, stats.popularSkills.length),
        }]
    } : null;

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-100">
            <NavigationBar showProfile={true} />
            <div className="max-w-6xl mx-auto py-10 px-4">
                <h2 className="text-3xl font-extrabold text-blue-800 mb-8 text-center flex items-center justify-center gap-2">
                    <ChartBarIcon className="h-8 w-8 text-blue-600" /> Platform Analytics
                </h2>
                {loading && <div className="text-blue-600 text-center">Loading analytics...</div>}
                {error && <div className="text-red-500 text-center mb-4">{error}</div>}
                {stats && (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
                            <div className="bg-white rounded-2xl shadow-xl p-6 border-t-8 border-blue-600 flex flex-col items-center">
                                <UserGroupIcon className="h-10 w-10 text-blue-600 mb-2" />
                                <div className="text-2xl font-bold text-blue-800">{stats.totalUsers}</div>
                                <div className="text-gray-500">Total Users</div>
                            </div>
                            <div className="bg-white rounded-2xl shadow-xl p-6 border-t-8 border-green-500 flex flex-col items-center">
                                <UserGroupIcon className="h-10 w-10 text-green-500 mb-2" />
                                <div className="text-2xl font-bold text-green-700">{stats.totalFreelancers}</div>
                                <div className="text-gray-500">Freelancers</div>
                            </div>
                            <div className="bg-white rounded-2xl shadow-xl p-6 border-t-8 border-yellow-500 flex flex-col items-center">
                                <UserGroupIcon className="h-10 w-10 text-yellow-500 mb-2" />
                                <div className="text-2xl font-bold text-yellow-700">{stats.totalClients}</div>
                                <div className="text-gray-500">Clients</div>
                            </div>
                            <div className="bg-white rounded-2xl shadow-xl p-6 border-t-8 border-purple-500 flex flex-col items-center">
                                <CurrencyDollarIcon className="h-10 w-10 text-purple-500 mb-2" />
                                <div className="text-2xl font-bold text-purple-700">${stats.totalRevenue.toLocaleString()}</div>
                                <div className="text-gray-500">Total Revenue</div>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
                            <div className="bg-white rounded-2xl shadow-xl p-6 border-t-8 border-blue-600">
                                <h3 className="text-xl font-bold text-blue-700 mb-4">User Growth (Monthly)</h3>
                                {userGrowthData && <Bar data={userGrowthData} options={{ plugins: { legend: { display: false } } }} />}
                            </div>
                            <div className="bg-white rounded-2xl shadow-xl p-6 border-t-8 border-orange-400">
                                <h3 className="text-xl font-bold text-orange-600 mb-4">Project Trends</h3>
                                {projectTrendsData && <Line data={projectTrendsData} options={{ plugins: { legend: { display: false } } }} />}
                            </div>
                        </div>
                        <div className="bg-white rounded-2xl shadow-xl p-6 border-t-8 border-green-500 mb-10">
                            <h3 className="text-xl font-bold text-green-700 mb-4">Top 10 Popular Skills</h3>
                            {skillsData && <Pie data={skillsData} options={{ plugins: { legend: { position: 'right' } } }} />}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default AdminAnalytics;
