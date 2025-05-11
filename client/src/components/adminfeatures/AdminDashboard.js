import React from 'react';
import { CheckBadgeIcon, ChartBarIcon, BellIcon } from '@heroicons/react/24/outline';
import NavigationBar from '../NavigationBar';
import { getAuth } from '../auth';

const AdminDashboard = () => {
    const { user } = getAuth();
    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-100">
            <NavigationBar showProfile={true} />
            <div className="max-w-6xl mx-auto py-12 px-4">
                <div className="flex flex-col items-center mb-8">
                    {user?.image && (
                        <img src={user.image.startsWith('http') ? user.image : `http://localhost:5000${user.image}`} alt={user.name} className="h-20 w-20 rounded-full object-cover border-4 border-blue-300 mb-2" />
                    )}
                    <h1 className="text-4xl font-extrabold text-blue-800 mb-2 tracking-tight text-center drop-shadow">Admin Dashboard</h1>
                    <div className="text-lg text-blue-700 font-semibold">Welcome, {user?.name}</div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    <a href="/admin/verification" className="group bg-white rounded-2xl shadow-xl border-t-8 border-blue-600 p-8 flex flex-col items-center hover:shadow-2xl transition-transform hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-blue-400">
                        <CheckBadgeIcon className="h-12 w-12 text-blue-600 mb-4 group-hover:scale-110 transition-transform" />
                        <div className="text-2xl font-bold text-blue-700 mb-2">Freelancer Verification</div>
                        <div className="text-gray-500 text-center">Approve/reject freelancers, manage documents, and set verification levels.</div>
                    </a>
                    <a href="/admin/analytics" className="group bg-white rounded-2xl shadow-xl border-t-8 border-blue-600 p-8 flex flex-col items-center hover:shadow-2xl transition-transform hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-blue-400">
                        <ChartBarIcon className="h-12 w-12 text-blue-600 mb-4 group-hover:scale-110 transition-transform" />
                        <div className="text-2xl font-bold text-blue-700 mb-2">Platform Analytics</div>
                        <div className="text-gray-500 text-center">Monitor transactions, user growth, skills, and revenue trends.</div>
                    </a>
                    <a href="/admin/notifications" className="group bg-white rounded-2xl shadow-xl border-t-8 border-blue-600 p-8 flex flex-col items-center hover:shadow-2xl transition-transform hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-blue-400">
                        <BellIcon className="h-12 w-12 text-blue-600 mb-4 group-hover:scale-110 transition-transform" />
                        <div className="text-2xl font-bold text-blue-700 mb-2">Notification System</div>
                        <div className="text-gray-500 text-center">Manage templates, schedule notifications, and user preferences.</div>
                    </a>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
