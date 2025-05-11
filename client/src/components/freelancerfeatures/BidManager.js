import React, { useEffect, useState } from 'react';
import axios from 'axios';
import NavigationBar from '../NavigationBar';
import { BriefcaseIcon, ChartBarIcon } from '@heroicons/react/24/outline';
import { getAuth } from '../auth';

const BidManager = () => {
  const { user } = getAuth();
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [bid, setBid] = useState({ amount: '', message: '' });
  const [bids, setBids] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [statusMsg, setStatusMsg] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    axios.get(process.env.REACT_APP_API_URL + '/api/projects').then(res => {
      setProjects(res.data.filter(p => p.status === 'open'));
      setLoading(false);
    });
  }, []);

  const loadBids = async (projectId) => {
    setSelectedProject(projectId);
    setLoading(true);
    const { token } = getAuth();
    try {
      const res = await axios.get(process.env.REACT_APP_API_URL + `/api/projects/${projectId}/bids`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setBids(res.data.filter(b => b.freelancerId?._id === user.id));
      const analyticsRes = await axios.get(process.env.REACT_APP_API_URL + `/api/projects/${projectId}/bids/analytics`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAnalytics(analyticsRes.data);
    } catch (err) {
      if (err.response && err.response.status === 401) {
        setStatusMsg('You are not authorized. Please log in again.');
      } else {
        setStatusMsg('Failed to load bids.');
      }
    } finally {
      setLoading(false);
    }
  };

  const submitBid = async () => {
    const { token } = getAuth();
    await axios.post(
      process.env.REACT_APP_API_URL + `/api/projects/${selectedProject}/bids`,
      {
        freelancerId: user.id,
        amount: bid.amount,
        message: bid.message
      },
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );
    setStatusMsg('Bid submitted!');
    loadBids(selectedProject);
  };

  const editBid = async (bidId) => {
    const { token } = getAuth();
    await axios.put(
      process.env.REACT_APP_API_URL + `/api/projects/${selectedProject}/bids/${bidId}`,
      {
        amount: bid.amount,
        message: bid.message
      },
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );
    setStatusMsg('Bid updated!');
    loadBids(selectedProject);
  };

  return (
    <>
      <NavigationBar showProfile={true} />
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex flex-col items-center pt-12">
        <div className="origin-top scale-[0.8] flex items-center justify-center w-full" style={{ minHeight: '90vh' }}>
          <div className="w-full max-w-3xl bg-white rounded-3xl shadow-2xl p-10 flex flex-col items-center border border-blue-100">
            <h2 className="text-3xl font-extrabold text-blue-900 mb-8 flex items-center gap-3 tracking-tight drop-shadow">
              <BriefcaseIcon className="h-9 w-9 text-blue-500" /> Bid Management
            </h2>
            <div className="mb-8 w-full">
              <label className="block font-semibold mb-2 text-blue-700">Select Project to Bid:</label>
              <select onChange={e => loadBids(e.target.value)} value={selectedProject || ''} className="w-full border-2 border-blue-200 p-3 rounded-lg focus:ring-2 focus:ring-blue-400 transition">
                <option value="">--Select a project--</option>
                {projects.map(p => (
                  <option key={p._id} value={p._id}>{p.title}</option>
                ))}
              </select>
            </div>
            {selectedProject && (
              <>
                <div className="mb-6 w-full flex flex-col md:flex-row gap-3 items-center">
                  <input type="number" placeholder="Bid Amount" value={bid.amount} onChange={e => setBid({ ...bid, amount: e.target.value })} className="border-2 border-blue-200 p-3 rounded-lg flex-1 focus:ring-2 focus:ring-blue-400 transition" />
                  <input type="text" placeholder="Message" value={bid.message} onChange={e => setBid({ ...bid, message: e.target.value })} className="border-2 border-blue-200 p-3 rounded-lg flex-1 focus:ring-2 focus:ring-blue-400 transition" />
                  <button className="bg-gradient-to-r from-blue-500 to-blue-700 text-white px-6 py-3 rounded-lg font-bold shadow hover:from-blue-600 hover:to-blue-800 transition" onClick={submitBid}>Submit Bid</button>
                </div>
                <div className="mb-6 w-full">
                  <h3 className="font-semibold text-blue-800 mb-3 text-lg">Your Bids for this Project:</h3>
                  <ul className="space-y-3">
                    {bids.length === 0 && <li className="text-blue-400 italic">No bids yet for this project.</li>}
                    {bids.map(b => (
                      <li key={b._id} className="p-4 bg-blue-50 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-2 border border-blue-100 shadow-sm hover:shadow-md transition">
                        <span className="font-medium">Amount: <span className="font-bold text-blue-700">{b.amount}</span></span>
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-semibold ${b.status === 'accepted' ? 'bg-green-100 text-green-700' : b.status === 'rejected' ? 'bg-red-100 text-red-600' : 'bg-yellow-100 text-yellow-700'}`}>
                          {b.status.charAt(0).toUpperCase() + b.status.slice(1)}
                        </span>
                        <span className="text-gray-700">Message: {b.message}</span>
                        <button className="ml-2 text-blue-600 underline font-semibold hover:text-blue-800 transition" onClick={() => editBid(b._id)}>Edit</button>
                      </li>
                    ))}
                  </ul>
                </div>
                {analytics && (
                  <div className="mb-4 text-sm text-blue-700 flex items-center gap-2 bg-blue-50 rounded-lg px-4 py-2 border border-blue-100">
                    <ChartBarIcon className="h-5 w-5 text-blue-400" />
                    <span><strong>Bid Analytics:</strong> Avg. Bid: <span className="font-bold">{analytics.avgBid}</span>, Total Bids: <span className="font-bold">{analytics.count}</span></span>
                  </div>
                )}
                {statusMsg && <div className="text-green-600 font-semibold mt-2">{statusMsg}</div>}
              </>
            )}
            {loading && <div className="flex items-center gap-2 text-blue-600 mt-6"><svg className="animate-spin h-5 w-5 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path></svg> Loading...</div>}
          </div>
        </div>
      </div>
    </>
  );
};

export default BidManager;
