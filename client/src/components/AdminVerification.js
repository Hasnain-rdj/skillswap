import React, { useEffect, useState } from 'react';
import NavigationBar from './NavigationBar';

const AdminVerification = () => {
    const [pending, setPending] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [actionLoading, setActionLoading] = useState(false);
    const [successMsg, setSuccessMsg] = useState('');

    useEffect(() => {
        fetchPending();
    }, []);

    const fetchPending = async () => {
        setLoading(true);
        setError(null);
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(process.env.REACT_APP_API_URL + '/api/admin/freelancers/pending', {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (!res.ok) {
                const data = await res.json();
                setError(data.message || 'Failed to fetch pending freelancers.');
                setPending([]);
            } else {
                const data = await res.json();
                setPending(Array.isArray(data) ? data : []);
            }
        } catch (err) {
            setError('Failed to fetch pending freelancers.');
            setPending([]);
        }
        setLoading(false);
    };

    const handleVerify = async (id, status, level) => {
        setActionLoading(true);
        setSuccessMsg('');
        setError(null);
        try {
            const token = localStorage.getItem('token');
            let action = '';
            if (status === 'approved' && level === 'Premium') action = 'premium';
            else if (status === 'approved') action = 'approve';
            else if (status === 'rejected') action = 'reject';
            else action = status;
            const res = await fetch(process.env.REACT_APP_API_URL + `/api/admin/freelancers/${id}/verify`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ action })
            });
            const data = await res.json();
            if (res.ok) {
                setSuccessMsg('Freelancer updated successfully.');
                fetchPending();
            } else {
                setError(data.message || 'Error updating freelancer.');
            }
        } catch (err) {
            setError('Error updating freelancer.');
        }
        setActionLoading(false);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-100">
            <NavigationBar showProfile={true} />
            <div className="max-w-5xl mx-auto py-10 px-4">
                <h2 className="text-3xl font-extrabold text-blue-800 mb-8 text-center">Freelancer Verification</h2>
                {loading ? <div className="text-blue-600 text-center">Loading...</div> : null}
                {error && <div className="text-red-500 text-center mb-4">{error}</div>}
                {successMsg && <div className="text-green-600 text-center mb-4">{successMsg}</div>}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {pending.map(f => (
                        <div key={f._id} className="bg-white rounded-2xl shadow-xl p-6 border-t-8 border-blue-600 flex flex-col gap-2">
                            <div className="flex items-center gap-4 mb-2">
                                <img src={f.image ? (f.image.startsWith('http') ? f.image : process.env.REACT_APP_API_URL + f.image) : '/logo192.png'} alt={f.name} className="h-16 w-16 rounded-full object-cover border-2 border-blue-200" />
                                <div>
                                    <div className="font-bold text-xl text-blue-800">{f.name}</div>
                                    <div className="text-gray-500 text-sm">{f.email}</div>
                                </div>
                            </div>
                            <div className="mb-2">
                                <span className="font-semibold text-blue-700">Skills:</span> {f.skills && f.skills.length ? f.skills.join(', ') : 'N/A'}
                            </div>
                            <div className="mb-2">
                                <span className="font-semibold text-blue-700">Current Level:</span> {f.verificationLevel || 'Basic'}
                            </div>
                            <div className="mb-2">
                                <span className="font-semibold text-blue-700">Docs:</span>
                                <ul className="list-disc ml-6">
                                    {f.verificationDocs && f.verificationDocs.length > 0 ? f.verificationDocs.map((doc, idx) => (
                                        <li key={idx}>
                                            <a href={process.env.REACT_APP_API_URL + doc} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">View Document {idx + 1}</a>
                                        </li>
                                    )) : <li className="text-gray-400">No documents uploaded.</li>}
                                </ul>
                            </div>
                            <div className="flex flex-col gap-2 mt-2">
                                <button
                                    className="bg-green-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-green-700 transition"
                                    disabled={actionLoading}
                                    onClick={() => handleVerify(f._id, 'approved', 'Verified')}
                                >
                                    Approve as Verified
                                </button>
                                <button
                                    className="bg-yellow-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-yellow-700 transition"
                                    disabled={actionLoading}
                                    onClick={() => handleVerify(f._id, 'approved', 'Premium')}
                                >
                                    Approve as Premium
                                </button>
                                <button
                                    className="bg-red-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-red-700 transition"
                                    disabled={actionLoading}
                                    onClick={() => handleVerify(f._id, 'rejected', f.verificationLevel || 'Basic')}
                                >
                                    Reject
                                </button>
                            </div>
                        </div>
                    ))}
                    {pending.length === 0 && !loading && <div className="text-gray-500 text-center col-span-2">No pending freelancers for verification.</div>}
                </div>
            </div>
        </div>
    );
};

export default AdminVerification;
