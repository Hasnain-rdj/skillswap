import React, { useState, useRef } from 'react';
import NavigationBar from '../NavigationBar';
import Chat from '../Chat';
import { getAuth } from '../auth';
import {
    MagnifyingGlassIcon,
    UserCircleIcon,
    EnvelopeIcon,
    XMarkIcon
} from '@heroicons/react/24/outline';
import { StarIcon } from '@heroicons/react/24/solid';
import { StarIcon as StarOutlineIcon } from '@heroicons/react/24/outline';
import FreelancerProfileView from './FreelancerProfileView';

const FreelancerRatingStars = ({ rating }) => {
    const filled = Math.round(Number(rating) || 0);
    return (
        <div className="flex justify-center mb-2">
            {[...Array(5)].map((_, i) =>
                i < filled ? (
                    <StarIcon key={i} className="h-5 w-5 text-yellow-400" />
                ) : (
                    <StarOutlineIcon key={i} className="h-5 w-5 text-gray-300" />
                )
            )}
        </div>
    );
};

const FreelancerSearch = () => {
    const [freelancers, setFreelancers] = useState([]);
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(false);
    const [chatUser, setChatUser] = useState(null);
    const [profileUser, setProfileUser] = useState(null);
    const [ratings, setRatings] = useState({});
    const debounceRef = useRef();

    const fetchFreelancers = async (query = '') => {
        setLoading(true);
        let url = process.env.REACT_APP_API_URL + '/api/auth/freelancers';
        if (query) url += `?name=${encodeURIComponent(query)}`;
        const { token } = getAuth();
        try {
            const res = await fetch(url, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!res.ok) {
                const errorData = await res.json();
                console.error('Error fetching freelancers:', errorData);
                setFreelancers([]);
                setLoading(false);
                return;
            }
            const data = await res.json();
            setFreelancers(data);
            const ratingsObj = {};
            await Promise.all(data.map(async (f) => {
                const res = await fetch(process.env.REACT_APP_API_URL + `/api/reviews/freelancer/${f._id}/average`);
                const d = await res.json();
                ratingsObj[f._id] = d.average || 0;
            }));
            setRatings(ratingsObj);
        } catch (err) {
            console.error('Network error:', err);
            setFreelancers([]);
        }
        setLoading(false);
    };

    React.useEffect(() => {
        fetchFreelancers('');
    }, []);

    const handleSearch = (e) => {
        setSearch(e.target.value);
        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => {

            fetchFreelancers(e.target.value.trim() === '' ? '' : e.target.value);
        }, 400);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-200">
            <NavigationBar />
            <div className="p-4 sm:p-8">
                <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-2xl p-6 sm:p-8 border-t-8 border-blue-600">
                    <h2 className="text-2xl font-bold text-blue-700 mb-4 flex items-center">
                        <UserCircleIcon className="h-6 w-6 mr-2" />
                        Find Freelancers
                    </h2>

                    <div className="relative mb-6">
                        <input
                            type="text"
                            value={search}
                            onChange={handleSearch}
                            placeholder="Search by name..."
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all duration-300"
                        />
                        <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 absolute top-2.5 left-3" />
                    </div>

                    {loading ? (
                        <div className="text-center text-blue-600 p-6 flex items-center justify-center">
                            <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Loading...
                        </div>
                    ) : (
                        <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {freelancers.map(freelancer => (
                                <li key={freelancer._id} className="rounded-2xl border border-blue-200 bg-gradient-to-br from-blue-100 to-blue-50 shadow-lg hover:shadow-2xl transition-all duration-300 p-6 flex flex-col items-center relative group max-w-full overflow-hidden">
                                    <div className="flex flex-col items-center mb-3 w-full">
                                        <div className="h-20 w-20 rounded-full bg-blue-200 flex items-center justify-center mb-2 overflow-hidden border-4 border-blue-300 shadow">
                                            {freelancer.image ? (
                                                <img src={freelancer.image.startsWith('http') ? freelancer.image : process.env.REACT_APP_API_URL + freelancer.image} alt={freelancer.name} className="h-full w-full object-cover" />
                                            ) : (
                                                <UserCircleIcon className="h-12 w-12 text-blue-500" />
                                            )}
                                        </div>
                                        <FreelancerRatingStars rating={ratings[freelancer._id]} />
                                        <div className="font-bold text-xl text-blue-800 mb-1 flex items-center truncate w-full text-center">
                                            {freelancer.name}
                                        </div>
                                        <div className="text-gray-500 text-sm flex items-center truncate w-full text-center">
                                            <EnvelopeIcon className="h-4 w-4 mr-1 text-gray-400" />
                                            {freelancer.email}
                                        </div>
                                    </div>
                                    <button
                                        className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 mt-2"
                                        onClick={() => setProfileUser(freelancer)}
                                    >
                                        View Profile
                                    </button>
                                </li>
                            ))}
                            {freelancers.length === 0 && (
                                <div className="text-gray-500 text-center p-8 border border-gray-200 rounded-lg bg-gray-50 col-span-3">
                                    No freelancers found.
                                </div>
                            )}
                        </ul>
                    )}

                    {/* Profile Modal */}
                    {profileUser && (
                        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 p-4">
                            <div className="relative w-full max-w-5xl mx-auto bg-white rounded-2xl shadow-2xl p-0 border-t-8 border-blue-600">
                                <button
                                    onClick={() => setProfileUser(null)}
                                    className="absolute top-2 right-2 bg-white rounded-full p-1 hover:bg-gray-100 transition-all duration-300 z-10"
                                >
                                    <XMarkIcon className="h-6 w-6 text-gray-600" />
                                </button>
                                <div className="p-0">
                                    <FreelancerProfileView
                                        freelancerId={profileUser._id}
                                        onBack={() => setProfileUser(null)}
                                        onChat={setChatUser}
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {chatUser && (
                        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 p-4">
                            <div className="relative w-full max-w-md">
                                <button
                                    onClick={() => setChatUser(null)}
                                    className="absolute top-2 right-2 bg-white rounded-full p-1 hover:bg-gray-100 transition-all duration-300"
                                >
                                    <XMarkIcon className="h-6 w-6 text-gray-600" />
                                </button>
                                <Chat receiverId={chatUser._id} receiverName={chatUser.name} />
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default FreelancerSearch;
