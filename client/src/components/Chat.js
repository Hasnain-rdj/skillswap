import React, { useEffect, useState, useRef } from 'react';
import { getAuth } from './auth';
import { io } from 'socket.io-client';
import {
    PaperAirplaneIcon,
    UserCircleIcon,
    CheckCircleIcon,
    ChatBubbleLeftRightIcon
} from '@heroicons/react/24/outline';

const socket = io(process.env.REACT_APP_API_URL);

const Chat = ({ receiverId, receiverName }) => {
    const { token, user } = getAuth();
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef(null);
    const [showOfferForm, setShowOfferForm] = useState(false);
    const [offer, setOffer] = useState({ projectId: '', price: '', deadline: '' });
    const [projects, setProjects] = useState([]);
    const [offerStatus, setOfferStatus] = useState(null);
    const [currentOffer, setCurrentOffer] = useState(null);
    const [editOfferForm, setEditOfferForm] = useState(false);
    const [editOffer, setEditOffer] = useState({ price: '', deadline: '' });

    useEffect(() => {
        socket.on('newMessage', (msg) => {
            if ((msg.sender === user.id && msg.receiver === receiverId) || (msg.sender === receiverId && msg.receiver === user.id)) {
                setMessages((prev) => [...prev, msg]);
            }
        });
        return () => {
            socket.off('newMessage');
        };

    }, [receiverId]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    useEffect(() => {
        if (user.role === 'client') {
            fetch(process.env.REACT_APP_API_URL + '/api/projects', {
                headers: { 'Authorization': `Bearer ${token}` }
            })
                .then(res => res.json())
                .then(data => setProjects(data.filter(p => p.clientId && (p.clientId._id === user.id || p.clientId === user.id) && p.status === 'open')));
        }
    }, [user, token]);

    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(() => {
        if (user.role === 'freelancer') {
            fetch(process.env.REACT_APP_API_URL + '/api/projects', {
                headers: { 'Authorization': `Bearer ${token}` }
            })
                .then(res => res.json())
                .then(data => {

                    const offerProject = data.find(p => p.contract && p.contract.freelancerId === user.id && p.clientId && (p.clientId._id === receiverId || p.clientId === receiverId));
                    setCurrentOffer(offerProject ? { ...offerProject.contract, projectTitle: offerProject.title, projectId: offerProject._id } : null);
                });
        }
    }, [user, token, receiverId]);

    const fetchMessages = async () => {
        setLoading(true);
        const res = await fetch(process.env.REACT_APP_API_URL + `/api/messages/${receiverId}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        setMessages(data);
        setLoading(false);

        await fetch(process.env.REACT_APP_API_URL + `/api/messages/read/${receiverId}`, {
            method: 'PUT',
            headers: { 'Authorization': `Bearer ${token}` }
        });
    };

    const fetchCurrentOffer = async () => {
        const res = await fetch(process.env.REACT_APP_API_URL + '/api/projects', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        const offerProject = data.find(p => p.contract && p.contract.freelancerId === receiverId && p.clientId && (p.clientId._id === user.id || p.clientId === user.id));
        setCurrentOffer(offerProject ? { ...offerProject.contract, projectTitle: offerProject.title, projectId: offerProject._id } : null);
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(() => {
        if (user && user.id) {
            fetchCurrentOffer();
            fetchMessages();
        }
    }, [user]);

    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(() => {
        fetchCurrentOffer();
        fetchMessages();
    }, []);

    const sendMessage = async (e) => {
        e.preventDefault();
        if (!input.trim()) return;
        const res = await fetch(process.env.REACT_APP_API_URL + '/api/messages', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ receiver: receiverId, content: input })
        });
        const data = await res.json();
        setMessages((prev) => [...prev, data]);
        setInput('');
    };

    const sendMessageWithContent = async (content) => {
        const res = await fetch(process.env.REACT_APP_API_URL + '/api/messages', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ receiver: receiverId, content })
        });
        const data = await res.json();
        setMessages((prev) => [...prev, data]);
    };

    const sendOffer = async (e) => {
        e.preventDefault();
        if (!offer.projectId || !offer.price || !offer.deadline) return;
        const res = await fetch(process.env.REACT_APP_API_URL + `/api/projects/${offer.projectId}/offer`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ freelancerId: receiverId, price: offer.price, deadline: offer.deadline })
        });
        const data = await res.json();
        if (res.ok) {
            setOfferStatus('Offer sent!');
            setShowOfferForm(false);
        } else {
            setOfferStatus(data.message || 'Error sending offer');
        }
    };

    const handleEditOffer = async (e) => {
        e.preventDefault();
        const res = await fetch(process.env.REACT_APP_API_URL + `/api/projects/${currentOffer.projectId}/offer`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ price: editOffer.price, deadline: editOffer.deadline })
        });
        const data = await res.json();
        if (res.ok) {
            setOfferStatus('Offer updated!');
            setEditOfferForm(false);
            fetchCurrentOffer();
        } else {
            setOfferStatus(data.message || 'Error updating offer');
        }
    };

    const handleCancelOffer = async () => {
        const res = await fetch(process.env.REACT_APP_API_URL + `/api/projects/${currentOffer.projectId}/offer/cancel`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        if (res.ok) {
            setOfferStatus('Offer cancelled.');
            fetchCurrentOffer();
        } else {
            setOfferStatus(data.message || 'Error cancelling offer');
        }
    };

    const handleAcceptOffer = async () => {
        const res = await fetch(process.env.REACT_APP_API_URL + `/api/projects/${currentOffer.projectId}/offer/respond`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({ action: 'accept' })
        });
        const data = await res.json();
        if (res.ok) {
            setOfferStatus('Offer accepted!');
            fetchCurrentOffer();
            await sendMessageWithContent('Thank you for the offer! I have accepted it.');
        } else {
            setOfferStatus(data.message || 'Error accepting offer');
        }
    };

    const handleRejectOffer = async () => {
        const res = await fetch(process.env.REACT_APP_API_URL + `/api/projects/${currentOffer.projectId}/offer/respond`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({ action: 'reject' })
        });
        const data = await res.json();
        if (res.ok) {
            setOfferStatus('Offer rejected.');
            fetchCurrentOffer();
            await sendMessageWithContent('Sorry, I have to reject this offer.');
        } else {
            setOfferStatus(data.message || 'Error rejecting offer');
        }
    };

    return (
        <div className="bg-white rounded-2xl shadow-2xl p-5 sm:p-6 border-t-8 border-blue-600 max-w-md mx-auto w-full">
            <h2 className="text-xl font-bold text-blue-700 mb-3 flex items-center">
                <ChatBubbleLeftRightIcon className="h-5 w-5 mr-2" />
                Chat with {receiverName}
            </h2>
            {user.role === 'client' && (
                <button
                    className="mb-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 font-semibold"
                    onClick={() => setShowOfferForm(v => !v)}
                >
                    {showOfferForm ? 'Cancel Offer' : 'Send Offer'}
                </button>
            )}
            {showOfferForm && (
                <form onSubmit={sendOffer} className="mb-4 bg-blue-50 p-3 rounded">
                    <div className="mb-2">
                        <select
                            className="w-full p-2 rounded border"
                            value={offer.projectId}
                            onChange={e => setOffer({ ...offer, projectId: e.target.value })}
                            required
                        >
                            <option value="">Select Project</option>
                            {projects.map(p => (
                                <option key={p._id} value={p._id}>{p.title}</option>
                            ))}
                        </select>
                    </div>
                    <div className="mb-2">
                        <input
                            type="number"
                            className="w-full p-2 rounded border"
                            placeholder="Offer Price"
                            value={offer.price}
                            onChange={e => setOffer({ ...offer, price: e.target.value })}
                            required
                        />
                    </div>
                    <div className="mb-2">
                        <input
                            type="date"
                            className="w-full p-2 rounded border"
                            value={offer.deadline}
                            onChange={e => setOffer({ ...offer, deadline: e.target.value })}
                            required
                        />
                    </div>
                    <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 font-semibold w-full">Send Offer</button>
                </form>
            )}
            {offerStatus && <div className="mb-2 text-center text-blue-700 font-semibold">{offerStatus}</div>}
            {currentOffer && (
                <div className="mb-4 p-3 rounded bg-yellow-50 border border-yellow-300">
                    <div className="font-bold text-yellow-800">Offer Details</div>
                    <div>Project: <span className="font-semibold">{currentOffer.projectTitle}</span></div>
                    <div>Price: <span className="font-semibold">${currentOffer.price}</span></div>
                    <div>Deadline: <span className="font-semibold">{new Date(currentOffer.deadline).toLocaleDateString()}</span></div>
                    <div>Status: <span className="font-semibold capitalize">{currentOffer.status}</span></div>
                    {currentOffer.status === 'pending' && user.role === 'client' && !editOfferForm && (
                        <div className="mt-2 flex gap-2">
                            <button className="bg-yellow-600 text-white px-3 py-1 rounded" onClick={() => { setEditOfferForm(true); setEditOffer({ price: currentOffer.price, deadline: currentOffer.deadline.substring(0, 10) }); }}>Edit</button>
                            <button className="bg-red-600 text-white px-3 py-1 rounded" onClick={handleCancelOffer}>Cancel</button>
                        </div>
                    )}
                    {currentOffer.status === 'pending' && user.role === 'freelancer' && (
                        <div className="mt-2 flex gap-2">
                            <button className="bg-green-600 text-white px-3 py-1 rounded" onClick={handleAcceptOffer}>Accept</button>
                            <button className="bg-red-600 text-white px-3 py-1 rounded" onClick={handleRejectOffer}>Reject</button>
                        </div>
                    )}
                    {editOfferForm && (
                        <form onSubmit={handleEditOffer} className="mt-2 flex flex-col gap-2">
                            <input type="number" className="p-2 rounded border" value={editOffer.price} onChange={e => setEditOffer({ ...editOffer, price: e.target.value })} required />
                            <input type="date" className="p-2 rounded border" value={editOffer.deadline} onChange={e => setEditOffer({ ...editOffer, deadline: e.target.value })} required />
                            <div className="flex gap-2">
                                <button type="submit" className="bg-blue-600 text-white px-3 py-1 rounded">Save</button>
                                <button type="button" className="bg-gray-300 text-gray-800 px-3 py-1 rounded" onClick={() => setEditOfferForm(false)}>Cancel</button>
                            </div>
                        </form>
                    )}
                </div>
            )}
            <div className="h-64 sm:h-72 overflow-y-auto bg-blue-50 p-3 rounded-lg mb-3 border border-blue-100">
                {loading ? (
                    <div className="flex items-center justify-center h-full text-blue-600">
                        <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Loading messages...
                    </div>
                ) : (
                    messages.map((msg, idx) => (
                        <div key={msg._id || idx} className={`mb-2 flex ${msg.sender === user.id ? 'justify-end' : 'justify-start'} animate-fade-in`}>
                            <div className={`px-4 py-2 rounded-lg max-w-xs break-words ${msg.sender === user.id
                                ? 'bg-blue-600 text-white rounded-br-none'
                                : 'bg-gray-200 text-gray-800 rounded-bl-none'
                                }`}>
                                {msg.sender !== user.id && (
                                    <div className="flex items-center text-xs mb-1 font-medium text-gray-600">
                                        <UserCircleIcon className="h-3 w-3 mr-1" />
                                        {receiverName}
                                    </div>
                                )}
                                {msg.content}
                                <div className="text-xs text-right mt-1 opacity-80 flex items-center justify-end">
                                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    {msg.read && msg.sender === user.id && (
                                        <CheckCircleIcon className="h-3 w-3 ml-1" title="Read" />
                                    )}
                                </div>
                            </div>
                        </div>
                    ))
                )}
                {messages.length === 0 && !loading && (
                    <div className="text-gray-500 text-center py-10">
                        No messages yet. Start the conversation!
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>
            <form onSubmit={sendMessage} className="flex space-x-2">
                <input
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all duration-300"
                    placeholder="Type a message..."
                />
                <button
                    type="submit"
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-blue-700 transition-all duration-300 flex items-center justify-center"
                    disabled={!input.trim()}
                >
                    <PaperAirplaneIcon className="h-5 w-5" />
                    <span className="sr-only">Send</span>
                </button>
            </form>
        </div>
    );
};

export default Chat;
