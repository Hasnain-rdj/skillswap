import React, { useEffect, useState } from 'react';
import NavigationBar from '../NavigationBar';
import { UserIcon, BriefcaseIcon, ChartBarIcon, StarIcon, ChatBubbleLeftRightIcon } from '@heroicons/react/24/outline';
import { getAuth } from '../auth';
import axios from 'axios';

const FreelancerDashboard = () => {
    const [user] = useState(() => getAuth().user);
    const [profile, setProfile] = useState(null);
    const [completeness, setCompleteness] = useState(0);
    const [avgRating, setAvgRating] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!user || !(user.id || user._id)) return;
        const freelancerId = user.id || user._id;
        setLoading(true);
        setError(null);
        axios.get(`/api/auth/freelancers/${freelancerId}`)
            .then(res => {
                setProfile(res.data);
                setCompleteness(res.data.profileCompleteness || 0);
                setLoading(false);
            })
            .catch(err => {
                setProfile(null);
                setCompleteness(0);
                setError('Profile not found. Please contact support if this persists.');
                setLoading(false);
            });
        axios.get(`/api/analytics/freelancer/${freelancerId}`)
            .then(res => setAvgRating(res.data.avgRating))
            .catch(() => setAvgRating(null));
    }, [user]);

    if (loading) {
        return <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-blue-200">
            <NavigationBar showProfile={false} />
            <div className="flex items-center gap-2 text-blue-600 mt-12 text-xl">
                <svg className="animate-spin h-6 w-6 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path></svg>
                Loading your dashboard...
            </div>
        </div>;
    }
    if (error) {
        return <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-blue-200">
            <NavigationBar showProfile={false} />
            <div className="text-center mt-12 text-red-500 text-lg font-semibold bg-white rounded-xl px-8 py-6 shadow">{error}</div>
        </div>;
    }
    if (!user || !(user.id || user._id)) {
        return <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-blue-200">
            <NavigationBar showProfile={false} />
            <div className="text-center mt-12 text-red-500 text-lg font-semibold bg-white rounded-xl px-8 py-6 shadow">User not found. Please log in again.</div>
        </div>;
    }
    if (!profile) {
        return <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-blue-200">
            <NavigationBar showProfile={false} />
            <div className="text-center mt-12 text-red-500 text-lg font-semibold bg-white rounded-xl px-8 py-6 shadow">Profile not found. Please contact support.</div>
        </div>;
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-200">
            <NavigationBar showProfile={false} />
            <div className="flex items-center justify-center py-12 px-4">
                <div className="origin-top scale-[0.8] flex items-center justify-center w-full" style={{ minHeight: '90vh' }}>
                    <div className="max-w-6xl w-full">
                        <div className="flex items-center mb-10 bg-white rounded-2xl shadow-xl p-8 border border-blue-100">
                            {profile?.image && (
                                <img
                                    src={profile.image.startsWith('http') ? profile.image : process.env.REACT_APP_API_URL + profile.image}
                                    alt="Profile"
                                    className="h-20 w-20 rounded-full border-4 border-blue-200 mr-6 object-cover shadow-lg"
                                />
                            )}
                            <div>
                                <h1 className="text-4xl font-extrabold text-blue-700 mb-2 tracking-tight">Welcome{profile?.name ? `, ${profile.name}` : ''}</h1>
                                <div className="flex gap-4 items-center mb-2 flex-wrap">
                                    <span className="flex items-center gap-1 text-blue-700 bg-blue-100 px-4 py-1 rounded-full text-base font-semibold shadow-sm">
                                        <StarIcon className="h-5 w-5 text-yellow-400" />
                                        {avgRating !== null ? `${avgRating} / 5` : 'No rating'}
                                    </span>
                                    <span className="flex items-center gap-1 text-blue-700 bg-blue-100 px-4 py-1 rounded-full text-base font-semibold shadow-sm">
                                        Profile Complete: <span className="font-bold ml-1">{completeness}%</span>
                                    </span>
                                </div>
                                <p className="text-gray-600 mb-2 text-lg">Manage your profile, bids, and projects all in one place.</p>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                            <a href="/freelancer/profile" className="group bg-white rounded-2xl shadow-xl border-t-8 border-blue-600 p-8 flex flex-col items-center hover:shadow-2xl transition-transform hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-blue-400">
                                <UserIcon className="h-12 w-12 text-blue-600 mb-4 group-hover:scale-110 transition-transform" />
                                <div className="text-2xl font-bold text-blue-700 mb-2">Profile Management</div>
                                <div className="text-gray-500 text-center">View and edit your profile, skills, and portfolio.</div>
                            </a>
                            <a href="/freelancer/bids" className="group bg-white rounded-2xl shadow-xl border-t-8 border-blue-600 p-8 flex flex-col items-center hover:shadow-2xl transition-transform hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-blue-400">
                                <BriefcaseIcon className="h-12 w-12 text-blue-600 mb-4 group-hover:scale-110 transition-transform" />
                                <div className="text-2xl font-bold text-blue-700 mb-2">Bid Management</div>
                                <div className="text-gray-500 text-center">Submit, edit, and track your project bids.</div>
                            </a>
                            <a href="/freelancer/projects" className="group bg-white rounded-2xl shadow-xl border-t-8 border-blue-600 p-8 flex flex-col items-center hover:shadow-2xl transition-transform hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-blue-400">
                                <ChartBarIcon className="h-12 w-12 text-blue-600 mb-4 group-hover:scale-110 transition-transform" />
                                <div className="text-2xl font-bold text-blue-700 mb-2">Project Management</div>
                                <div className="text-gray-500 text-center">Track and manage your active/completed projects.</div>
                            </a>
                            <a href="/freelancer/offers" className="group bg-white rounded-2xl shadow-xl border-t-8 border-yellow-500 p-8 flex flex-col items-center hover:shadow-2xl transition-transform hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-yellow-400">
                                <StarIcon className="h-12 w-12 text-yellow-500 mb-4 group-hover:scale-110 transition-transform" />
                                <div className="text-2xl font-bold text-yellow-700 mb-2">Project Offers</div>
                                <div className="text-gray-500 text-center">View, accept, or reject project offers from clients.</div>
                            </a>
                            <a href="/freelancer/chats" className="group bg-white rounded-2xl shadow-xl border-t-8 border-blue-600 p-8 flex flex-col items-center hover:shadow-2xl transition-transform hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-blue-400">
                                <ChatBubbleLeftRightIcon className="h-12 w-12 text-blue-600 mb-4 group-hover:scale-110 transition-transform" />
                                <div className="text-2xl font-bold text-blue-700 mb-2">Chats</div>
                                <div className="text-gray-500 text-center">View and reply to client messages.</div>
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FreelancerDashboard;