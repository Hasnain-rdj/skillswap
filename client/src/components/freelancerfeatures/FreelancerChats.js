import React, { useEffect, useState } from 'react';
import { getAuth } from '../auth';
import Chat from '../Chat';
import { ChatBubbleLeftRightIcon, UserCircleIcon } from '@heroicons/react/24/outline';
import NavigationBar from '../NavigationBar';

const FreelancerChats = () => {
    const { token } = getAuth();
    const [threads, setThreads] = useState([]);
    const [selectedClient, setSelectedClient] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchThreads = async () => {
            setLoading(true);
            setError(null);
            try {
                const res = await fetch('http://localhost:5000/api/messages/threads', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                let data = await res.json();
                console.log('Fetched threads:', data);
                if (!Array.isArray(data)) data = [];
                setThreads(data);
            } catch (err) {
                setError('Failed to load chats.');
                setThreads([]);
            } finally {
                setLoading(false);
            }
        };
        fetchThreads();
    }, [token]);

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex flex-col items-center pt-12">
            <NavigationBar showProfile={true} />
            <div className="w-full max-w-4xl bg-white rounded-3xl shadow-2xl p-10 flex flex-col md:flex-row gap-8 border border-blue-100">
                <div className="w-full md:w-1/3">
                    <h2 className="text-2xl font-bold text-blue-700 mb-4 flex items-center gap-2">
                        <ChatBubbleLeftRightIcon className="h-7 w-7 text-blue-500" /> Chats
                    </h2>
                    {loading && <div className="text-blue-600">Loading chats...</div>}
                    {error && <div className="text-red-500">{error}</div>}
                    <ul className="space-y-3">
                        {threads.length === 0 && !loading && <li className="text-blue-400 italic">No client chats yet.</li>}
                        {threads.map(client => (
                            <li key={client._id}>
                                <button
                                    className={`w-full flex items-center gap-3 p-3 rounded-lg border border-blue-100 shadow-sm hover:bg-blue-50 transition ${selectedClient && selectedClient._id === client._id ? 'bg-blue-100' : ''}`}
                                    onClick={() => setSelectedClient(client)}
                                >
                                    {client.image ? (
                                        <img src={client.image.startsWith('http') ? client.image : `http://localhost:5000${client.image}`} alt={client.name} className="h-10 w-10 rounded-full object-cover border-2 border-blue-200" />
                                    ) : (
                                        <UserCircleIcon className="h-10 w-10 text-blue-400" />
                                    )}
                                    <span className="font-semibold text-blue-800">{client.name}</span>
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>
                <div className="flex-1">
                    {selectedClient ? (
                        <Chat receiverId={selectedClient._id} receiverName={selectedClient.name} />
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full text-blue-400 text-lg font-semibold">
                            <ChatBubbleLeftRightIcon className="h-12 w-12 mb-2" />
                            Select a client to view and reply to messages.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default FreelancerChats;