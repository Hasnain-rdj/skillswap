import React, { useEffect, useState } from 'react';
import axios from 'axios';
import SkillList from '../freelancerfeatures/SkillList';
import PortfolioList from '../freelancerfeatures/PortfolioList';
import { StarIcon } from '@heroicons/react/24/solid';
import { ArrowLeftIcon, ChatBubbleLeftRightIcon } from '@heroicons/react/24/outline';

const FreelancerProfileView = ({ freelancerId, onBack, onChat }) => {
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [avgRating, setAvgRating] = useState(null);

    useEffect(() => {
        if (!freelancerId) return;
        const fetchProfile = async () => {
            try {
                const res = await axios.get(`/api/auth/freelancers/${freelancerId}`);
                setProfile(res.data);
                setLoading(false);
            } catch (err) {
                setError('Failed to load profile');
                setLoading(false);
            }
        };
        fetchProfile();
        axios.get(`/api/analytics/freelancer/${freelancerId}`).then(res => setAvgRating(res.data.avgRating));
    }, [freelancerId]);

    if (loading) return <div className="text-center mt-12">Loading...</div>;
    if (error) return <div className="text-center text-red-500 mt-12">{error}</div>;
    if (!profile) return <div className="text-center mt-12">No profile found.</div>;

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex flex-col items-center pt-12">
            <div className="w-full max-w-3xl bg-white rounded-3xl shadow-2xl p-10 flex flex-col items-center border border-blue-100">
                <div className="flex gap-4 w-full justify-start mb-6">
                    <button onClick={onBack} className="flex items-center gap-2 px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 font-semibold">
                        <ArrowLeftIcon className="h-5 w-5" />
                        <span className="sr-only">Back</span>
                    </button>
                    {profile && (
                        <button
                            onClick={() => onChat ? onChat(profile) : alert('Chat feature not implemented.')}
                            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 font-semibold"
                        >
                            <ChatBubbleLeftRightIcon className="h-5 w-5" />
                            <span className="hidden sm:inline">Chat</span>
                        </button>
                    )}
                </div>
                <div className="flex flex-col items-center mb-8 w-full">
                    {profile.image && (
                        <img
                            src={profile.image.startsWith('http') ? profile.image : `http://localhost:5000${profile.image}`}
                            alt="Profile"
                            className="h-32 w-32 rounded-full object-cover border-4 border-blue-300 shadow mb-3"
                        />
                    )}
                    <div className="text-4xl font-extrabold text-blue-800 text-center mb-2 w-full break-words">
                        {profile.name}
                    </div>
                    <div className="flex gap-4 mt-2 flex-wrap items-center justify-center">
                        <div className="flex items-center gap-1 text-blue-700 bg-blue-100 px-4 py-1 rounded-full text-lg font-semibold shadow-sm">
                            <StarIcon className="h-6 w-6 text-yellow-400" />
                            {avgRating !== null ? `${avgRating} / 5` : 'No rating'}
                        </div>
                        <span className={`flex items-center gap-1 px-3 py-1 rounded-full text-base font-semibold shadow-sm ${profile.verified ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>{profile.verified ? (<><svg xmlns='http://www.w3.org/2000/svg' className='h-5 w-5' fill='none' viewBox='0 0 24 24' stroke='currentColor'><path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M5 13l4 4L19 7' /></svg>Verified</>) : (<><svg xmlns='http://www.w3.org/2000/svg' className='h-5 w-5' fill='none' viewBox='0 0 24 24' stroke='currentColor'><path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M6 18L18 6M6 6l12 12' /></svg>Not Verified</>)}
                        </span>
                    </div>
                </div>
                <div className="w-full flex flex-col md:flex-row gap-8 mt-4">
                    <div className="w-full md:w-1/2 bg-blue-50 rounded-2xl p-6 shadow border border-blue-100">
                        <div className="flex items-center gap-2 mb-4 text-blue-700 font-bold text-xl">
                            Skills
                        </div>
                        <SkillList skills={profile.skills} readOnly />
                    </div>
                    <div className="w-full md:w-1/2 bg-blue-50 rounded-2xl p-6 shadow border border-blue-100">
                        <div className="flex items-center gap-2 mb-4 text-blue-700 font-bold text-xl">
                            Portfolio
                        </div>
                        <PortfolioList portfolio={profile.portfolio} readOnly />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FreelancerProfileView;
