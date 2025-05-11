import React, { useEffect, useState } from 'react';
import { getAuth } from './auth';
import { io } from 'socket.io-client';

const socket = io(process.env.REACT_APP_API_URL);

const BidList = ({ projectId }) => {
    const [bids, setBids] = useState([]);
    const [sort, setSort] = useState('latest');
    const [filter, setFilter] = useState('all');
    const [loading, setLoading] = useState(false);
    const [showOfferForm, setShowOfferForm] = useState(null);
    const [offer, setOffer] = useState({ price: '', deadline: '' });
    const [offerStatus, setOfferStatus] = useState('');
    const { token, user } = getAuth();

    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(() => {
        fetchBids();
        socket.emit('joinProjectRoom', projectId);
        socket.on('bidUpdate', (data) => {
            if (data.projectId === projectId) setBids(data.bids);
        });
        return () => {
            socket.emit('leaveProjectRoom', projectId);
            socket.off('bidUpdate');
        };
    }, [projectId]);

    const fetchBids = async () => {
        setLoading(true);
        const res = await fetch(process.env.REACT_APP_API_URL + `/api/projects/${projectId}/bids`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        setBids(data);
        setLoading(false);
    };

    const sendOffer = async (freelancerId) => {
        if (!offer.price || !offer.deadline) return;
        const res = await fetch(process.env.REACT_APP_API_URL + `/api/projects/${projectId}/offer`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ freelancerId, price: offer.price, deadline: offer.deadline })
        });
        const data = await res.json();
        if (res.ok) {
            setOfferStatus('Offer sent!');
            setShowOfferForm(null);
        } else {
            setOfferStatus(data.message || 'Error sending offer');
        }
    };

    const handleSort = (e) => setSort(e.target.value);
    const handleFilter = (e) => setFilter(e.target.value);

    let filteredBids = bids;
    if (filter !== 'all') filteredBids = bids.filter(b => b.status === filter);
    if (sort === 'latest') filteredBids = [...filteredBids].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    if (sort === 'amount') filteredBids = [...filteredBids].sort((a, b) => a.amount - b.amount);

    return (
        <div className="bg-white rounded-2xl shadow-2xl p-8 border-t-8 border-blue-600 mt-8">
            <h2 className="text-xl font-bold text-blue-700 mb-4">Bids</h2>
            <div className="flex space-x-4 mb-4">
                <select value={sort} onChange={handleSort} className="px-3 py-2 border rounded-lg">
                    <option value="latest">Sort by Latest</option>
                    <option value="amount">Sort by Amount</option>
                </select>
                <select value={filter} onChange={handleFilter} className="px-3 py-2 border rounded-lg">
                    <option value="all">All</option>
                    <option value="pending">Pending</option>
                    <option value="accepted">Accepted</option>
                    <option value="rejected">Rejected</option>
                </select>
            </div>
            {loading ? <div className="text-blue-600">Loading...</div> : (
                <ul>
                    {filteredBids.map(bid => (
                        <li key={bid._id} className="mb-4 p-4 rounded-lg border border-gray-200 bg-blue-50">
                            <div className="font-semibold text-lg text-blue-800">{bid.freelancerId?.name || 'Freelancer'}</div>
                            <div className="text-gray-600">Bid: <span className="font-bold">${bid.amount}</span></div>
                            <div className="text-gray-500 text-sm">{bid.message}</div>
                            <div className="text-xs text-gray-500">Status: {bid.status}</div>
                            {user?.role === 'client' && bid.status === 'pending' && (
                                <>
                                    <button
                                        className="mt-2 bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
                                        onClick={() => setShowOfferForm(bid._id)}
                                    >
                                        Send Offer
                                    </button>
                                    {showOfferForm === bid._id && (
                                        <form
                                            onSubmit={e => { e.preventDefault(); sendOffer(bid.freelancerId._id); }}
                                            className="mt-2 bg-blue-100 p-2 rounded"
                                        >
                                            <input
                                                type="number"
                                                className="w-full p-1 mb-1 rounded border"
                                                placeholder="Offer Price"
                                                value={offer.price}
                                                onChange={e => setOffer({ ...offer, price: e.target.value })}
                                                required
                                            />
                                            <input
                                                type="date"
                                                className="w-full p-1 mb-1 rounded border"
                                                value={offer.deadline}
                                                onChange={e => setOffer({ ...offer, deadline: e.target.value })}
                                                required
                                            />
                                            <button type="submit" className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 w-full">Send</button>
                                            <button type="button" className="w-full mt-1 bg-gray-200 text-gray-700 px-3 py-1 rounded" onClick={() => setShowOfferForm(null)}>Cancel</button>
                                        </form>
                                    )}
                                </>
                            )}
                        </li>
                    ))}
                    {filteredBids.length === 0 && <div className="text-gray-500">No bids found.</div>}
                </ul>
            )}
            {offerStatus && <div className="text-center text-blue-700 font-semibold mt-2">{offerStatus}</div>}
        </div>
    );
};

export default BidList;
