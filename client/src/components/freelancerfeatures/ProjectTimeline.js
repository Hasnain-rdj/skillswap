import React, { useState } from 'react';
import axios from 'axios';
import { XMarkIcon, ClockIcon, CheckCircleIcon } from '@heroicons/react/24/outline';

const ProjectTimeline = ({ project, onClose, freelancerId }) => {
    const [progress, setProgress] = useState(project.progress || 0);
    const [milestones, setMilestones] = useState(project.milestones || []);
    const [milestoneTitle, setMilestoneTitle] = useState('');
    const [milestoneDue, setMilestoneDue] = useState('');
    const [timeLogs, setTimeLogs] = useState(project.timeLogs || []);
    const [timelog, setTimelog] = useState({ start: '', end: '', duration: '' });
    const [msg, setMsg] = useState('');

    const updateProgress = async () => {
        await axios.patch(process.env.REACT_APP_API_URL + `/api/projects/${project._id}/progress`, { progress });
        setMsg('Progress updated!');
    };

    const addMilestone = async () => {
        const res = await axios.post(process.env.REACT_APP_API_URL + `/api/projects/${project._id}/milestones`, { title: milestoneTitle, dueDate: milestoneDue });
        setMilestones(res.data.milestones);
        setMilestoneTitle('');
        setMilestoneDue('');
        setMsg('Milestone added!');
    };

    const updateMilestoneStatus = async (idx, status) => {
        const res = await axios.patch(process.env.REACT_APP_API_URL + `/api/projects/${project._id}/milestones/${idx}`, { status });
        const updated = [...milestones];
        updated[idx] = res.data.milestone;
        setMilestones(updated);
        setMsg('Milestone status updated!');
    };

    const addTimeLog = async () => {
        const res = await axios.post(process.env.REACT_APP_API_URL + `/api/projects/${project._id}/timelogs`, timelog);
        setTimeLogs(res.data.timeLogs);
        setTimelog({ start: '', end: '', duration: '' });
        setMsg('Time log added!');
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
            <div className="bg-white p-10 rounded-3xl shadow-2xl w-full max-w-xl relative animate-fadeIn border border-blue-100">
                <button className="absolute top-3 right-3 text-2xl text-blue-700 hover:text-red-500 transition" onClick={onClose}>
                    <XMarkIcon className="h-7 w-7" />
                </button>
                <h3 className="text-3xl font-bold text-blue-800 mb-6">Project Timeline: {project.title}</h3>
                <div className="mb-6 flex flex-col md:flex-row gap-4 items-center">
                    <label className="font-semibold text-blue-700">Progress (%):</label>
                    <input type="number" min="0" max="100" value={progress} onChange={e => setProgress(e.target.value)} className="border-2 border-blue-200 p-2 rounded-lg w-24 focus:ring-2 focus:ring-blue-400 transition" />
                    <button className="ml-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-700 text-white rounded-lg font-semibold shadow hover:from-blue-600 hover:to-blue-800 transition" onClick={updateProgress}>Update</button>
                </div>
                <div className="mb-6">
                    <label className="font-semibold text-blue-700">Add Milestone:</label>
                    <div className="flex flex-col md:flex-row gap-2 mt-2">
                        <input type="text" placeholder="Title" value={milestoneTitle} onChange={e => setMilestoneTitle(e.target.value)} className="border-2 border-blue-200 p-2 rounded-lg flex-1 focus:ring-2 focus:ring-blue-400 transition" />
                        <input type="date" value={milestoneDue} onChange={e => setMilestoneDue(e.target.value)} className="border-2 border-blue-200 p-2 rounded-lg flex-1 focus:ring-2 focus:ring-blue-400 transition" />
                        <button className="px-4 py-2 bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-lg font-semibold shadow hover:from-green-600 hover:to-blue-700 transition" onClick={addMilestone}>Add</button>
                    </div>
                </div>
                <div className="mb-6">
                    <strong className="text-blue-700">Milestones:</strong>
                    <ul className="mt-2 space-y-2">
                        {milestones.length === 0 && <li className="text-blue-400 italic">No milestones yet.</li>}
                        {milestones.map((m, idx) => (
                            <li key={idx} className="flex flex-wrap items-center gap-2 bg-blue-50 rounded-xl p-3 border border-blue-100">
                                <span className="font-semibold text-blue-800">{m.title}</span>
                                <span className={m.status === 'completed' ? 'text-green-600' : 'text-yellow-600'}>
                                    {m.status === 'completed' ? <CheckCircleIcon className="h-5 w-5 inline" /> : <ClockIcon className="h-5 w-5 inline" />} {m.status}
                                </span>
                                <span className="text-blue-500 text-xs">Due: {m.dueDate ? new Date(m.dueDate).toLocaleDateString() : 'N/A'}</span>
                                {m.status === 'pending' && (
                                    <button className="ml-2 text-green-600 underline font-semibold hover:text-green-800 transition" onClick={() => updateMilestoneStatus(idx, 'completed')}>Mark Complete</button>
                                )}
                                {m.status === 'completed' && <span className="ml-2 text-gray-500 text-xs">(Completed)</span>}
                            </li>
                        ))}
                    </ul>
                </div>
                <div className="mb-6">
                    <strong className="text-blue-700">Time Tracking:</strong>
                    <div className="flex flex-col md:flex-row gap-2 mb-2 mt-2">
                        <input type="datetime-local" value={timelog.start} onChange={e => setTimelog({ ...timelog, start: e.target.value })} className="border-2 border-blue-200 p-2 rounded-lg flex-1 focus:ring-2 focus:ring-blue-400 transition" />
                        <input type="datetime-local" value={timelog.end} onChange={e => setTimelog({ ...timelog, end: e.target.value })} className="border-2 border-blue-200 p-2 rounded-lg flex-1 focus:ring-2 focus:ring-blue-400 transition" />
                        <input type="number" placeholder="Duration (min)" value={timelog.duration} onChange={e => setTimelog({ ...timelog, duration: e.target.value })} className="border-2 border-blue-200 p-2 rounded-lg w-32 focus:ring-2 focus:ring-blue-400 transition" />
                        <button className="px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-700 text-white rounded-lg font-semibold shadow hover:from-blue-600 hover:to-blue-800 transition" onClick={addTimeLog}>Add</button>
                    </div>
                    <ul className="space-y-1">
                        {timeLogs.length === 0 && <li className="text-blue-400 italic">No time logs yet.</li>}
                        {timeLogs.map((t, idx) => (
                            <li key={idx} className="text-blue-700 text-sm">
                                {t.start && new Date(t.start).toLocaleString()} - {t.end && new Date(t.end).toLocaleString()} | {t.duration} min
                            </li>
                        ))}
                    </ul>
                </div>
                {msg && <div className="text-green-600 font-semibold mt-2">{msg}</div>}
            </div>
        </div>
    );
};

export default ProjectTimeline;
