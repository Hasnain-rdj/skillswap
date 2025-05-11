import React, { useState, useEffect } from 'react';
import {
    PencilIcon,
    TrashIcon,
    EyeIcon,
    CalendarIcon,
    DocumentTextIcon,
    ClipboardDocumentListIcon,
    PlusIcon
} from '@heroicons/react/24/outline';
import NavigationBar from '../NavigationBar';
import BidList from '../BidList';
import { getAuth } from '../auth';

const API = 'http://localhost:5000/api/projects';

const statusColors = {
    open: 'bg-green-100 text-green-700',
    'in progress': 'bg-yellow-100 text-yellow-700',
    completed: 'bg-blue-100 text-blue-700',
    cancelled: 'bg-red-100 text-red-700',
};

const ProjectManager = () => {
    const [projects, setProjects] = useState([]);
    const [form, setForm] = useState({ title: '', description: '', requirements: '', deadline: '' });
    const [editing, setEditing] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [showBids, setShowBids] = useState(null);
    const [showForm, setShowForm] = useState(false);

    const { token, user } = getAuth();

    useEffect(() => {
        fetchProjects();
    }, []);

    const fetchProjects = async () => {
        setLoading(true);
        if (!user || !user.id) {
            setProjects([]);
            setLoading(false);
            return;
        }
        const res = await fetch(API, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        setProjects(data.filter(p => p.clientId && p.clientId._id === user.id));
        setLoading(false);
    };

    const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

    const handleSubmit = async e => {
        e.preventDefault();
        setError('');
        setSuccess('');
        if (!form.title || !form.description) {
            setError('Title and description are required.');
            return;
        }
        setLoading(true);
        const method = editing ? 'PUT' : 'POST';
        const url = editing ? `${API}/${editing}` : API;
        const res = await fetch(url, {
            method,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ ...form, clientId: user.id })
        });
        const data = await res.json();
        if (!res.ok) setError(data.message || 'Error');
        else {
            setSuccess(editing ? 'Project updated.' : 'Project created.');
            setForm({ title: '', description: '', requirements: '', deadline: '' });
            setEditing(null);
            fetchProjects();
        }
        setLoading(false);
    };

    const handleEdit = p => {
        setForm({
            title: p.title,
            description: p.description,
            requirements: p.requirements || '',
            deadline: p.deadline ? p.deadline.substring(0, 10) : ''
        });
        setEditing(p._id);
    };

    const handleDelete = async id => {
        if (!window.confirm('Delete this project?')) return;
        setLoading(true);
        const res = await fetch(`${API}/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) fetchProjects();
        setLoading(false);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-200">
            <NavigationBar />
            <div className="p-4 sm:p-8">
                <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-2xl p-6 sm:p-8 border-t-8 border-blue-600 mb-8 flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-blue-700 mb-4 flex items-center">
                        {editing ? <PencilIcon className="h-6 w-6 mr-2" /> : <PlusIcon className="h-6 w-6 mr-2" />}
                        {editing ? 'Edit Project' : 'Post a New Project'}
                    </h2>
                    {projects.length > 0 && (
                        <button
                            onClick={() => { setEditing(null); setForm({ title: '', description: '', requirements: '', deadline: '' }); setShowForm(true); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                            className="ml-auto bg-blue-600 text-white px-4 py-2 rounded-lg font-bold shadow hover:bg-blue-700 transition-all duration-300"
                        >
                            Upload Project
                        </button>
                    )}
                </div>

                {/* Project Form (show only if editing, no projects, or Upload Project clicked) */}
                {(editing !== null || projects.length === 0 || showForm) && (
                    <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-2xl p-6 sm:p-8 border-t-8 border-blue-600 mb-8">
                        {error && (
                            <div className="mb-2 bg-red-100 text-red-700 px-4 py-2 rounded text-sm">
                                {error}
                            </div>
                        )}

                        {success && (
                            <div className="mb-2 bg-green-100 text-green-700 px-4 py-2 rounded text-sm">
                                {success}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="relative">
                                <DocumentTextIcon className="h-5 w-5 absolute top-3 left-3 text-gray-400" />
                                <input
                                    name="title"
                                    value={form.title}
                                    onChange={handleChange}
                                    required
                                    placeholder="Title"
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all duration-300"
                                />
                            </div>

                            <div className="relative">
                                <ClipboardDocumentListIcon className="h-5 w-5 absolute top-3 left-3 text-gray-400" />
                                <textarea
                                    name="description"
                                    value={form.description}
                                    onChange={handleChange}
                                    required
                                    placeholder="Description"
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all duration-300"
                                    rows="3"
                                ></textarea>
                            </div>

                            <div className="relative">
                                <DocumentTextIcon className="h-5 w-5 absolute top-3 left-3 text-gray-400" />
                                <input
                                    name="requirements"
                                    value={form.requirements}
                                    onChange={handleChange}
                                    placeholder="Requirements"
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all duration-300"
                                />
                            </div>

                            <div className="relative">
                                <CalendarIcon className="h-5 w-5 absolute top-3 left-3 text-gray-400" />
                                <input
                                    name="deadline"
                                    type="date"
                                    value={form.deadline}
                                    onChange={handleChange}
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all duration-300"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-blue-600 text-white py-2.5 rounded-lg font-bold text-lg shadow hover:bg-blue-700 disabled:opacity-50 transition-all duration-300 flex items-center justify-center"
                            >
                                {loading ? (
                                    <div className="flex items-center">
                                        <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        {editing ? 'Updating...' : 'Creating...'}
                                    </div>
                                ) : (
                                    <>{editing ? 'Update' : 'Post'} Project</>
                                )}
                            </button>
                            {(editing || showForm) && (
                                <button
                                    type="button"
                                    onClick={() => { setEditing(null); setForm({ title: '', description: '', requirements: '', deadline: '' }); setShowForm(false); }}
                                    className="w-full mt-2 bg-gray-200 text-gray-700 py-2.5 rounded-lg font-bold text-lg shadow hover:bg-gray-300 transition-all duration-300"
                                >
                                    Cancel
                                </button>
                            )}
                        </form>
                    </div>
                )}

                <div className="max-w-6xl mx-auto bg-white rounded-2xl shadow-2xl p-6 sm:p-8 border-t-8 border-blue-600">
                    <h2 className="text-xl font-bold text-blue-700 mb-4">Your Projects</h2>
                    {loading ? (
                        <div className="text-blue-600 flex items-center justify-center p-4">
                            <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Loading...
                        </div>
                    ) : (
                        projects.length === 0 ? (
                            <div className="text-gray-500 text-center p-4">No projects found.</div>
                        ) : (
                            <ul className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {projects.map(p => (
                                    <li key={p._id} className="mb-4 p-4 rounded-lg border border-gray-200 bg-blue-50 flex flex-col transition-all duration-300 hover:shadow-md">
                                        <div className="font-semibold text-lg text-blue-800">{p.title}</div>
                                        <div className="text-gray-600 mb-1">{p.description}</div>
                                        <div className="text-xs text-gray-500 flex items-center">
                                            <CalendarIcon className="h-4 w-4 mr-1" />
                                            Deadline: {p.deadline ? p.deadline.substring(0, 10) : 'N/A'}
                                        </div>
                                        <span className={`inline-block mt-2 px-3 py-1 rounded-full text-xs font-bold ${statusColors[p.status] || 'bg-gray-100 text-gray-700'}`}>{p.status}</span>
                                        <div className="flex flex-row space-x-2 mt-4">
                                            <button
                                                onClick={() => { handleEdit(p); setShowForm(true); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                                                className="bg-yellow-400 text-white px-3 py-2 rounded-lg font-bold hover:bg-yellow-500 transition-all duration-300 flex items-center justify-center"
                                            >
                                                <PencilIcon className="h-5 w-5" />
                                                <span className="sr-only md:not-sr-only md:ml-2">Edit</span>
                                            </button>
                                            <button
                                                onClick={() => handleDelete(p._id)}
                                                className="bg-red-500 text-white px-3 py-2 rounded-lg font-bold hover:bg-red-600 transition-all duration-300 flex items-center justify-center"
                                            >
                                                <TrashIcon className="h-5 w-5" />
                                                <span className="sr-only md:not-sr-only md:ml-2">Delete</span>
                                            </button>
                                            <button
                                                onClick={() => setShowBids(showBids === p._id ? null : p._id)}
                                                className="bg-blue-500 text-white px-3 py-2 rounded-lg font-bold hover:bg-blue-600 transition-all duration-300 flex items-center justify-center"
                                            >
                                                <EyeIcon className="h-5 w-5" />
                                                <span className="sr-only md:not-sr-only md:ml-2">
                                                    {showBids === p._id ? 'Hide Bids' : 'View Bids'}
                                                </span>
                                            </button>
                                        </div>
                                        {showBids === p._id && (
                                            <div className="w-full mt-4 overflow-x-auto">
                                                <div className="min-w-[320px] max-w-full">
                                                    <BidList projectId={p._id} />
                                                </div>
                                            </div>
                                        )}
                                    </li>
                                ))}
                            </ul>
                        )
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProjectManager;
