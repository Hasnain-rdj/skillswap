import React, { useEffect, useState } from 'react';
import axios from 'axios';
import NavigationBar from '../NavigationBar';
import SkillList from './SkillList';
import PortfolioList from './PortfolioList';
import { StarIcon } from '@heroicons/react/24/solid';
import { getAuth } from '../auth';

const FreelancerProfile = () => {
    const { user } = getAuth();
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [avgRating, setAvgRating] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [editingName, setEditingName] = useState(false);
    const [newName, setNewName] = useState('');
    const [nameLoading, setNameLoading] = useState(false);
    const [nameSuccess, setNameSuccess] = useState('');

    const handleImageChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const formData = new FormData();
        formData.append('image', file);
        setUploading(true);
        setError(null);
        try {
            const { token } = getAuth();
            const res = await axios.post(`/api/auth/freelancers/${user.id || user._id}/upload-image`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    Authorization: `Bearer ${token}`
                }
            });
            setProfile({ ...profile, image: res.data.image });
        } catch (err) {
            setError('Failed to upload image');
        } finally {
            setUploading(false);
        }
    };

    useEffect(() => {
        if (!user || !(user.id || user._id)) return;
        const freelancerId = user.id || user._id;
        const fetchProfile = async () => {
            try {
                const res = await axios.get(`/api/auth/freelancers/${freelancerId}`);
                setProfile(res.data);
                setNewName(prev => editingName ? prev : res.data.name);
                setLoading(false);
            } catch (err) {
                setError('Failed to load profile');
                setLoading(false);
            }
        };
        fetchProfile();
        axios.get(`/api/analytics/freelancer/${freelancerId}`).then(res => setAvgRating(res.data.avgRating));
    }, [user, editingName]);

    const handleProfileUpdate = async (updates) => {
        try {
            const { token } = getAuth();
            const res = await axios.put(
                `/api/auth/freelancers/${user.id || user._id}`,
                updates,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );
            setProfile(res.data.user);
        } catch (err) {
            setError('Failed to update profile');
        }
    };

    const handleNameUpdate = async () => {
        setNameLoading(true);
        setNameSuccess('');
        setError(null);
        try {
            const { token } = getAuth();
            const res = await axios.put(
                `/api/auth/freelancers/${user.id || user._id}`,
                { name: newName },
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );
            setProfile(res.data.user);

            const auth = getAuth();
            const updatedUser = { ...auth.user, name: newName };
            localStorage.setItem('user', JSON.stringify(updatedUser));
            setNameSuccess('Name updated!');
            setEditingName(false);
        } catch (err) {
            setError('Failed to update name');
        }
        setNameLoading(false);
    };

    if (loading) return <div className="text-center mt-12">Loading...</div>;
    if (error) return <div className="text-center text-red-500 mt-12">{error}</div>;
    if (!profile) return <div className="text-center mt-12">No profile found.</div>;
    if (!user || !(user.id || user._id)) {
        return <div className="text-center mt-12 text-red-500">User not found. Please log in again.</div>;
    }

    return (
        <>
            <NavigationBar showProfile={true} />
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex flex-col items-center pt-12">
                <div className="origin-top scale-[0.8] flex items-center justify-center w-full" style={{ minHeight: '90vh' }}>
                    <div className="w-full max-w-5xl bg-white rounded-3xl shadow-2xl p-12 flex flex-col items-center border border-blue-100">
                        <div className="flex flex-col md:flex-row items-center mb-10 w-full gap-8">
                            <div className="relative flex flex-col items-center md:items-start w-full md:w-1/3">
                                {profile.image && (
                                    <img
                                        src={profile.image.startsWith('http') ? profile.image : `http://localhost:5000${profile.image}`}
                                        alt="Profile"
                                        className="h-32 w-32 rounded-full object-cover border-4 border-blue-300 shadow mb-3"
                                    />
                                )}
                                <label className="cursor-pointer bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-base font-semibold shadow hover:bg-blue-200 transition mb-2 flex items-center gap-2">
                                    <svg xmlns='http://www.w3.org/2000/svg' className='h-5 w-5' fill='none' viewBox='0 0 24 24' stroke='currentColor'><path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M5 20h14M12 4v16m8-8H4' /></svg>
                                    {uploading ? 'Uploading...' : 'Change Photo'}
                                    <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} disabled={uploading} />
                                </label>
                            </div>
                            <div className="flex-1 flex flex-col items-center md:items-start w-full">
                                {editingName ? (
                                    <div className="flex items-center gap-2 w-full max-w-lg">
                                        <input
                                            className="text-4xl font-extrabold text-blue-800 text-center md:text-left bg-transparent border-b-2 border-blue-200 focus:outline-none focus:border-blue-500 mb-2 w-full max-w-lg transition"
                                            value={newName}
                                            onChange={e => setNewName(e.target.value)}
                                            placeholder="Your Name"
                                            disabled={nameLoading}
                                            autoFocus
                                        />
                                        <button
                                            className="ml-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center"
                                            onClick={handleNameUpdate}
                                            disabled={nameLoading || !newName.trim() || newName === profile.name}
                                            title="Save Name"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                                        </button>
                                        <button
                                            className="ml-1 px-2 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition flex items-center"
                                            onClick={() => { setEditingName(false); setNewName(profile.name); }}
                                            title="Cancel"
                                            type="button"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                        </button>
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-2 w-full max-w-lg">
                                        <span
                                            className="text-4xl font-extrabold text-blue-800 text-center md:text-left mb-2 w-full max-w-lg break-words cursor-pointer hover:bg-blue-50 rounded px-2"
                                            onClick={() => setEditingName(true)}
                                            title="Click to edit name"
                                        >
                                            {profile.name}
                                        </span>
                                        <button
                                            className="ml-2 px-2 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition flex items-center"
                                            onClick={() => setEditingName(true)}
                                            title="Edit Name"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536M9 13h3l8-8a2.828 2.828 0 00-4-4l-8 8v3h3z" /></svg>
                                        </button>
                                    </div>
                                )}
                                {nameSuccess && <div className="text-green-600 text-sm mt-1">{nameSuccess}</div>}
                                <div className="flex gap-4 mt-2 flex-wrap items-center">
                                    <div className="flex items-center gap-1 text-blue-700 bg-blue-100 px-4 py-1 rounded-full text-lg font-semibold shadow-sm">
                                        <StarIcon className="h-6 w-6 text-yellow-400" />
                                        {avgRating !== null ? `${avgRating} / 5` : 'No rating'}
                                    </div>
                                    <span className={`flex items-center gap-1 px-3 py-1 rounded-full text-base font-semibold shadow-sm ${profile.verified ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>{profile.verified ? (<><svg xmlns='http://www.w3.org/2000/svg' className='h-5 w-5' fill='none' viewBox='0 0 24 24' stroke='currentColor'><path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M5 13l4 4L19 7' /></svg>Verified</>) : (<><svg xmlns='http://www.w3.org/2000/svg' className='h-5 w-5' fill='none' viewBox='0 0 24 24' stroke='currentColor'><path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M6 18L18 6M6 6l12 12' /></svg>Not Verified</>)}
                                    </span>
                                </div>
                                <div className="mt-4 text-gray-600 text-lg text-center md:text-left max-w-xl">Showcase your skills, portfolio, and achievements to attract more clients!</div>
                            </div>
                        </div>
                        <div className="w-full flex flex-col md:flex-row gap-8 mt-4">
                            <div className="w-full md:w-1/2 bg-blue-50 rounded-2xl p-6 shadow border border-blue-100">
                                <div className="flex items-center gap-2 mb-4 text-blue-700 font-bold text-xl">
                                    <svg xmlns='http://www.w3.org/2000/svg' className='h-6 w-6' fill='none' viewBox='0 0 24 24' stroke='currentColor'><path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M9 17v-6a2 2 0 012-2h2a2 2 0 012 2v6' /><path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M7 17v-2a2 2 0 012-2h6a2 2 0 012 2v2' /></svg>
                                    Skills
                                </div>
                                <SkillList skills={profile.skills} onChange={skills => handleProfileUpdate({ skills })} />
                            </div>
                            <div className="w-full md:w-1/2 bg-blue-50 rounded-2xl p-6 shadow border border-blue-100">
                                <div className="flex items-center gap-2 mb-4 text-blue-700 font-bold text-xl">
                                    <svg xmlns='http://www.w3.org/2000/svg' className='h-6 w-6' fill='none' viewBox='0 0 24 24' stroke='currentColor'><path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M12 8c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 10c-2.21 0-4-1.79-4-4h2a2 2 0 004 0h2c0 2.21-1.79-4-4-4z' /></svg>
                                    Portfolio
                                </div>
                                <PortfolioList portfolio={profile.portfolio} onChange={portfolio => handleProfileUpdate({ portfolio })} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default FreelancerProfile;
