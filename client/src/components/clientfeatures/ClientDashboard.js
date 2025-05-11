import React from 'react';
import NavigationBar from '../NavigationBar';
import { UsersIcon, BriefcaseIcon, ChartBarIcon } from '@heroicons/react/24/outline';
import { getAuth } from '../auth';

const ClientDashboard = () => {
    const user = getAuth().user;
    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-200">
            <NavigationBar showProfile={false} />
            <div className="max-w-6xl mx-auto py-12 px-4">
                <div className="flex items-center mb-8">
                    {user?.image && (
                        <img
                            src={user.image.startsWith('http') ? user.image : process.env.REACT_APP_API_URL + user.image}
                            alt="Profile"
                            className="h-16 w-16 rounded-full border-4 border-blue-200 mr-4 object-cover"
                        />
                    )}
                    <div>
                        <h1 className="text-4xl font-bold text-blue-700 mb-2">Welcome{user?.name ? `, ${user.name}` : ''}</h1>
                        <p className="text-gray-600 mb-2 text-lg">Manage your projects, connect with freelancers, and track your progress all in one place.</p>
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    <a href="/client/freelancers" className="group bg-white rounded-2xl shadow-xl border-t-8 border-blue-600 p-8 flex flex-col items-center hover:shadow-2xl transition-transform hover:-translate-y-1">
                        <UsersIcon className="h-10 w-10 text-blue-600 mb-4 group-hover:scale-110 transition-transform" />
                        <div className="text-xl font-bold text-blue-700 mb-2">Freelancer Search & Chat</div>
                        <div className="text-gray-500 text-center">Find and connect with top freelancers for your projects.</div>
                    </a>
                    <a href="/client/projects" className="group bg-white rounded-2xl shadow-xl border-t-8 border-blue-600 p-8 flex flex-col items-center hover:shadow-2xl transition-transform hover:-translate-y-1">
                        <BriefcaseIcon className="h-10 w-10 text-blue-600 mb-4 group-hover:scale-110 transition-transform" />
                        <div className="text-xl font-bold text-blue-700 mb-2">Project Management</div>
                        <div className="text-gray-500 text-center">Create, edit, and manage your projects efficiently.</div>
                    </a>
                    <a href="/client/projects" className="group bg-white rounded-2xl shadow-xl border-t-8 border-blue-600 p-8 flex flex-col items-center hover:shadow-2xl transition-transform hover:-translate-y-1">
                        <BriefcaseIcon className="h-10 w-10 text-blue-600 mb-4 group-hover:scale-110 transition-transform" />
                        <div className="text-xl font-bold text-blue-700 mb-2">Bid Management</div>
                        <div className="text-gray-500 text-center">Review and manage bids from freelancers.</div>
                    </a>
                    <a href="/client/analytics" className="group bg-white rounded-2xl shadow-xl border-t-8 border-blue-600 p-8 flex flex-col items-center hover:shadow-2xl transition-transform hover:-translate-y-1">
                        <ChartBarIcon className="h-10 w-10 text-blue-600 mb-4 group-hover:scale-110 transition-transform" />
                        <div className="text-xl font-bold text-blue-700 mb-2">Analytics Dashboard</div>
                        <div className="text-gray-500 text-center">Track your project stats and performance visually.</div>
                    </a>
                    <a href="/client/reviews" className="group bg-white rounded-2xl shadow-xl border-t-8 border-blue-600 p-8 flex flex-col items-center hover:shadow-2xl transition-transform hover:-translate-y-1">
                        <UsersIcon className="h-10 w-10 text-blue-600 mb-4 group-hover:scale-110 transition-transform" />
                        <div className="text-xl font-bold text-blue-700 mb-2">Review & Rating System</div>
                        <div className="text-gray-500 text-center">View and provide feedback for freelancers.</div>
                    </a>
                </div>
            </div>
        </div>
    );
};

export default ClientDashboard;
