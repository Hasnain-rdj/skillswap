import React, { useEffect, useState } from 'react';
import axios from 'axios';
import NavigationBar from '../NavigationBar';
import { ChartBarIcon } from '@heroicons/react/24/outline';
import { getAuth } from '../auth';

const ProjectManager = () => {
    const { user } = getAuth();
    const [projects, setProjects] = useState([]);
    const [filter, setFilter] = useState('all');
    const [loading, setLoading] = useState(false);
    const [selectedProject, setSelectedProject] = useState(null);

    useEffect(() => {
        setLoading(true);
        axios.get(process.env.REACT_APP_API_URL + '/api/projects')
            .then(res => {
                const myProjects = res.data.filter(p => p.assignedFreelancer === user.id || (p.assignedFreelancer && p.assignedFreelancer._id === user.id));
                setProjects(myProjects);
            })
            .catch(() => { })
            .finally(() => setLoading(false));
    }, [user.id]);

    const filtered = filter === 'all' ? projects : projects.filter(p => p.status === filter);

    return (
        <>
            <NavigationBar showProfile={true} />
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex flex-col items-center pt-12">
                <div className="origin-top scale-[0.8] flex items-center justify-center w-full" style={{ minHeight: '90vh' }}>
                    <div className="w-full max-w-4xl bg-white rounded-3xl shadow-2xl p-10 flex flex-col items-center border border-blue-100">
                        <h2 className="text-3xl font-extrabold text-blue-900 mb-8 flex items-center gap-3 tracking-tight drop-shadow">
                            <ChartBarIcon className="h-10 w-10 text-blue-500" /> My Projects
                        </h2>
                        <div className="mb-8 w-full flex flex-col md:flex-row gap-4 items-center justify-between">
                            <label className="font-semibold text-blue-700">Filter by Status:</label>
                            <select value={filter} onChange={e => setFilter(e.target.value)} className="border-2 border-blue-200 p-3 rounded-lg w-full md:w-48 focus:ring-2 focus:ring-blue-400 transition">
                                <option value="all">All</option>
                                <option value="open">Open</option>
                                <option value="in progress">In Progress</option>
                                <option value="completed">Completed</option>
                                <option value="cancelled">Cancelled</option>
                            </select>
                        </div>
                        <ul className="w-full grid grid-cols-1 md:grid-cols-2 gap-6">
                            {filtered.length === 0 && <li className="text-blue-400 italic">No projects found.</li>}
                            {filtered.map(p => (
                                <li key={p._id} className="p-6 bg-blue-50 rounded-2xl border border-blue-100 shadow-sm hover:shadow-lg transition flex flex-col gap-2 relative">
                                    <div className="font-bold text-xl text-blue-800 mb-1">{p.title}</div>
                                    <div className="flex flex-wrap gap-2 items-center text-sm">
                                        <span className={`px-2 py-1 rounded-full font-semibold ${p.status === 'completed' ? 'bg-green-100 text-green-700' : p.status === 'in progress' ? 'bg-yellow-100 text-yellow-700' : p.status === 'cancelled' ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-700'}`}>{p.status.charAt(0).toUpperCase() + p.status.slice(1)}</span>
                                        <span className="text-blue-500">Deadline: {p.deadline ? new Date(p.deadline).toLocaleDateString() : 'N/A'}</span>
                                        {p.contract && (
                                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${p.contract.status === 'accepted' ? 'bg-green-200 text-green-800' : p.contract.status === 'pending' ? 'bg-yellow-200 text-yellow-800' : 'bg-red-200 text-red-800'}`}>Contract: {p.contract.status}</span>
                                        )}
                                    </div>
                                    {/* Mark as Completed button for in-progress and accepted projects */}
                                    {p.status === 'in progress' && p.contract && p.contract.status === 'accepted' && (
                                        <button
                                            className="mt-2 bg-green-600 text-white px-4 py-2 rounded-lg font-semibold shadow hover:bg-green-700 transition self-end"
                                            onClick={async () => {
                                                try {
                                                    await axios.post(
                                                        `${process.env.REACT_APP_API_URL}/api/projects/${p._id}/complete`,
                                                        {},
                                                        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
                                                    );
                                                    setProjects(projects => projects.map(proj => proj._id === p._id ? { ...proj, status: 'completed' } : proj));
                                                } catch (err) {
                                                    alert('Failed to mark as completed.');
                                                }
                                            }}
                                        >
                                            Mark as Completed
                                        </button>
                                    )}
                                    <button className="mt-3 bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold shadow hover:bg-blue-700 transition self-end" onClick={() => setSelectedProject(p)}>View Details</button>
                                </li>
                            ))}
                        </ul>
                        {selectedProject && (
                            <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
                                <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-lg w-full relative">
                                    <button className="absolute top-2 right-2 text-gray-400 hover:text-blue-600 text-2xl font-bold" onClick={() => setSelectedProject(null)}>&times;</button>
                                    <h3 className="text-2xl font-bold text-blue-700 mb-4">Project Details</h3>
                                    <div className="mb-2"><span className="font-semibold">Title:</span> {selectedProject.title}</div>
                                    <div className="mb-2"><span className="font-semibold">Description:</span> {selectedProject.description}</div>
                                    <div className="mb-2"><span className="font-semibold">Requirements:</span> {selectedProject.requirements || 'N/A'}</div>
                                    <div className="mb-2"><span className="font-semibold">Deadline:</span> {selectedProject.deadline ? new Date(selectedProject.deadline).toLocaleDateString() : 'N/A'}</div>
                                    <div className="mb-2"><span className="font-semibold">Status:</span> {selectedProject.status}</div>
                                    <div className="mb-2"><span className="font-semibold">Client:</span> {selectedProject.clientId?.name || selectedProject.clientId || 'N/A'}</div>
                                    {selectedProject.contract && (
                                        <div className="mb-2"><span className="font-semibold">Contract Status:</span> {selectedProject.contract.status}</div>
                                    )}
                                    {selectedProject.price && (
                                        <div className="mb-2"><span className="font-semibold">Price:</span> ${selectedProject.price}</div>
                                    )}
                                    {selectedProject.progress !== undefined && (
                                        <div className="mb-2"><span className="font-semibold">Progress:</span> {selectedProject.status === 'completed' ? 100 : selectedProject.progress}%</div>
                                    )}
                                    <div className="mt-4 flex justify-end">
                                        <button className="bg-blue-600 text-white px-4 py-2 rounded font-bold hover:bg-blue-700" onClick={() => setSelectedProject(null)}>Close</button>
                                    </div>
                                </div>
                            </div>
                        )}
                        {loading && <div className="flex items-center gap-2 text-blue-600 mt-6"><svg className="animate-spin h-5 w-5 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path></svg> Loading...</div>}
                    </div>
                </div>
            </div>
        </>
    );
};

export default ProjectManager;
