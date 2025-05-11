import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { getAuth } from '../auth';
import NavigationBar from '../NavigationBar';

const OffersPage = () => {
    const { user, token } = getAuth();
    const [offers, setOffers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [statusMsg, setStatusMsg] = useState('');

    const fetchOffers = async () => {
        setLoading(true);
        try {
            const res = await axios.get('/api/projects', {
                headers: { Authorization: `Bearer ${token}` }
            });

            const pendingOffers = res.data.filter(p => p.contract && p.contract.freelancerId === user.id && p.contract.status === 'pending');
            setOffers(pendingOffers);
        } catch (err) {
            setStatusMsg('Failed to load offers.');
        } finally {
            setLoading(false);
        }
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(() => {
        fetchOffers();
    }, []);

    const handleAccept = async (projectId) => {
        try {
            await axios.post(`/api/projects/${projectId}/offer/respond`, { action: 'accept' }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setStatusMsg('Offer accepted!');
            fetchOffers();
        } catch (err) {
            setStatusMsg('Failed to accept offer.');
        }
    };

    const handleReject = async (projectId) => {
        try {
            await axios.post(`/api/projects/${projectId}/offer/respond`, { action: 'reject' }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setStatusMsg('Offer rejected.');
            fetchOffers();
        } catch (err) {
            setStatusMsg('Failed to reject offer.');
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex flex-col items-center pt-12">
            <div className="origin-top scale-[0.8] flex flex-col items-center justify-center w-full" style={{ minHeight: '90vh' }}>
                <div className="w-full flex justify-center mb-4">
                    <div className="w-full" style={{ maxWidth: '1200px' }}>
                        <div className="origin-top scale-[0.8]">
                            <NavigationBar showProfile={true} />
                        </div>
                    </div>
                </div>
                <div className="w-full max-w-3xl bg-white rounded-3xl shadow-2xl p-10 flex flex-col items-center border border-blue-100 mt-8">
                    <h2 className="text-2xl font-extrabold text-blue-900 mb-8">Project Offers</h2>
                    {statusMsg && <div className="mb-4 text-blue-700 font-semibold">{statusMsg}</div>}
                    {loading ? (
                        <div className="text-blue-600">Loading offers...</div>
                    ) : offers.length === 0 ? (
                        <div className="text-blue-400 italic">No pending offers at the moment.</div>
                    ) : (
                        <ul className="w-full flex flex-col gap-6">
                            {offers.map(offer => (
                                <li key={offer._id} className="p-6 bg-yellow-50 rounded-2xl border border-yellow-300 shadow-sm flex flex-col gap-2">
                                    <div className="font-bold text-lg text-yellow-800">{offer.title}</div>
                                    <div>Price: <span className="font-semibold">${offer.contract.price}</span></div>
                                    <div>Deadline: <span className="font-semibold">{new Date(offer.contract.deadline).toLocaleDateString()}</span></div>
                                    <div>Status: <span className="font-semibold capitalize">{offer.contract.status}</span></div>
                                    <div className="mt-2 flex gap-2">
                                        <button className="bg-green-600 text-white px-3 py-1 rounded" onClick={() => handleAccept(offer._id)}>Accept</button>
                                        <button className="bg-red-600 text-white px-3 py-1 rounded" onClick={() => handleReject(offer._id)}>Reject</button>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>
        </div>
    );
};

export default OffersPage;
