import React, { useEffect, useState, useCallback } from 'react';
import NavigationBar from '../NavigationBar';
import {
    BellIcon,
    EnvelopeIcon,
    DevicePhoneMobileIcon,
    TrashIcon,
    PencilSquareIcon,
    PlusCircleIcon,
    ClockIcon
} from '@heroicons/react/24/outline';

const API = process.env.REACT_APP_API_URL + '/api/admin/notifications';

const AdminNotifications = () => {
    const [templates, setTemplates] = useState([]);
    const [scheduled, setScheduled] = useState([]);
    const [preferences, setPreferences] = useState({});
    const [users, setUsers] = useState([]);
    const [selectedUser, setSelectedUser] = useState('');
    const [form, setForm] = useState({ name: '', type: 'email', subject: '', body: '' });
    const [editId, setEditId] = useState(null);
    const [send, setSend] = useState({ userId: '', templateId: '', channel: 'email' });
    const [schedule, setSchedule] = useState({ userId: '', templateId: '', channel: 'email', sendAt: '' });
    const [msg, setMsg] = useState('');
    const [error, setError] = useState('');
    const token = localStorage.getItem('token');

    const fetchTemplates = useCallback(async () => {
        const res = await fetch(`${API}/templates`, { headers: { Authorization: `Bearer ${token}` } });
        setTemplates(await res.json());
    }, [token]);

    const fetchScheduled = useCallback(async () => {
        const res = await fetch(`${API}/scheduled`, { headers: { Authorization: `Bearer ${token}` } });
        setScheduled(await res.json());
    }, [token]);

    const fetchUsers = useCallback(async () => {
        const res = await fetch(process.env.REACT_APP_API_URL + '/api/auth/freelancers', { headers: { Authorization: `Bearer ${token}` } });
        setUsers(await res.json());
    }, [token]);

    const fetchPreferences = async (userId) => {
        const res = await fetch(`${API}/preferences/${userId}`, { headers: { Authorization: `Bearer ${token}` } });
        setPreferences(await res.json());
    };

    useEffect(() => {
        fetchTemplates();
        fetchScheduled();
        fetchUsers();
    }, [token, fetchTemplates, fetchScheduled, fetchUsers]);

    const handleForm = e => setForm({ ...form, [e.target.name]: e.target.value });
    const saveTemplate = async e => {
        e.preventDefault();
        setMsg(''); setError('');
        const method = editId ? 'PUT' : 'POST';
        const url = editId ? `${API}/templates/${editId}` : `${API}/templates`;
        const res = await fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
            body: JSON.stringify(form)
        });
        if (res.ok) {
            setMsg('Template saved!');
            setForm({ name: '', type: 'email', subject: '', body: '' });
            setEditId(null);
            fetchTemplates();
        } else setError('Error saving template.');
    };
    const editTemplate = t => setForm(t) || setEditId(t._id);
    const deleteTemplate = async id => {
        if (!window.confirm('Delete this template?')) return;
        await fetch(`${API}/templates/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
        fetchTemplates();
    };

    const sendNotif = async e => {
        e.preventDefault();
        setMsg(''); setError('');
        const res = await fetch(`${API}/send`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
            body: JSON.stringify(send)
        });
        const data = await res.json();
        if (res.ok) setMsg(data.message);
        else setError(data.message || 'Error sending notification.');
    };

    const scheduleNotif = async e => {
        e.preventDefault();
        setMsg(''); setError('');
        const res = await fetch(`${API}/scheduled`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
            body: JSON.stringify(schedule)
        });
        if (res.ok) {
            setMsg('Notification scheduled!');
            fetchScheduled();
        } else setError('Error scheduling notification.');
    };

    const handlePref = e => setPreferences({ ...preferences, [e.target.name]: e.target.checked });
    const savePref = async e => {
        e.preventDefault();
        await fetch(`${API}/preferences/${selectedUser}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
            body: JSON.stringify(preferences)
        });
        setMsg('Preferences updated!');
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-100">
            <NavigationBar showProfile={true} />
            <div className="max-w-6xl mx-auto py-10 px-4">
                <h2 className="text-3xl font-extrabold text-blue-800 mb-8 text-center flex items-center gap-2 justify-center">
                    <BellIcon className="h-8 w-8 text-blue-600" /> Notification System
                </h2>
                {msg && <div className="text-green-600 text-center mb-2">{msg}</div>}
                {error && <div className="text-red-500 text-center mb-2">{error}</div>}
                {/* Templates */}
                <div className="bg-white rounded-2xl shadow-xl p-6 border-t-8 border-blue-600 mb-10">
                    <h3 className="text-xl font-bold text-blue-700 mb-4 flex items-center gap-2"><EnvelopeIcon className="h-6 w-6" /> Templates</h3>
                    <form onSubmit={saveTemplate} className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                        <input name="name" value={form.name} onChange={handleForm} placeholder="Name" className="px-3 py-2 border rounded-lg" required />
                        <select name="type" value={form.type} onChange={handleForm} className="px-3 py-2 border rounded-lg">
                            <option value="email">Email</option>
                            <option value="sms">SMS</option>
                        </select>
                        <input name="subject" value={form.subject} onChange={handleForm} placeholder="Subject" className="px-3 py-2 border rounded-lg" required={form.type === 'email'} />
                        <input name="body" value={form.body} onChange={handleForm} placeholder="Body" className="px-3 py-2 border rounded-lg" required />
                        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-blue-700 transition flex items-center gap-1">
                            <PlusCircleIcon className="h-5 w-5" /> {editId ? 'Update' : 'Add'}
                        </button>
                    </form>
                    <div className="overflow-x-auto">
                        <table className="min-w-full text-sm">
                            <thead>
                                <tr className="bg-blue-50">
                                    <th className="p-2">Name</th>
                                    <th className="p-2">Type</th>
                                    <th className="p-2">Subject</th>
                                    <th className="p-2">Body</th>
                                    <th className="p-2">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {templates.map(t => (
                                    <tr key={t._id} className="border-b">
                                        <td className="p-2">{t.name}</td>
                                        <td className="p-2">{t.type}</td>
                                        <td className="p-2">{t.subject}</td>
                                        <td className="p-2">{t.body}</td>
                                        <td className="p-2 flex gap-2">
                                            <button onClick={() => editTemplate(t)} className="text-blue-600 hover:text-blue-900"><PencilSquareIcon className="h-5 w-5" /></button>
                                            <button onClick={() => deleteTemplate(t._id)} className="text-red-600 hover:text-red-900"><TrashIcon className="h-5 w-5" /></button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
                {/* Send Notification */}
                <div className="bg-white rounded-2xl shadow-xl p-6 border-t-8 border-green-500 mb-10">
                    <h3 className="text-xl font-bold text-green-700 mb-4 flex items-center gap-2"><DevicePhoneMobileIcon className="h-6 w-6" /> Send Notification</h3>
                    <form onSubmit={sendNotif} className="flex flex-wrap gap-4 items-center">
                        <select name="userId" value={send.userId} onChange={e => setSend({ ...send, userId: e.target.value })} className="px-3 py-2 border rounded-lg" required>
                            <option value="">Select User</option>
                            {users.map(u => <option key={u._id} value={u._id}>{u.name} ({u.email})</option>)}
                        </select>
                        <select name="templateId" value={send.templateId} onChange={e => setSend({ ...send, templateId: e.target.value })} className="px-3 py-2 border rounded-lg" required>
                            <option value="">Select Template</option>
                            {templates.map(t => <option key={t._id} value={t._id}>{t.name}</option>)}
                        </select>
                        <select name="channel" value={send.channel} onChange={e => setSend({ ...send, channel: e.target.value })} className="px-3 py-2 border rounded-lg">
                            <option value="email">Email</option>
                            <option value="sms">SMS</option>
                        </select>
                        <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-green-700 transition">Send</button>
                    </form>
                </div>
                {/* Schedule Notification */}
                <div className="bg-white rounded-2xl shadow-xl p-6 border-t-8 border-yellow-500 mb-10">
                    <h3 className="text-xl font-bold text-yellow-700 mb-4 flex items-center gap-2"><ClockIcon className="h-6 w-6" /> Schedule Notification</h3>
                    <form onSubmit={scheduleNotif} className="flex flex-wrap gap-4 items-center">
                        <select name="userId" value={schedule.userId} onChange={e => setSchedule({ ...schedule, userId: e.target.value })} className="px-3 py-2 border rounded-lg" required>
                            <option value="">Select User</option>
                            {users.map(u => <option key={u._id} value={u._id}>{u.name} ({u.email})</option>)}
                        </select>
                        <select name="templateId" value={schedule.templateId} onChange={e => setSchedule({ ...schedule, templateId: e.target.value })} className="px-3 py-2 border rounded-lg" required>
                            <option value="">Select Template</option>
                            {templates.map(t => <option key={t._id} value={t._id}>{t.name}</option>)}
                        </select>
                        <select name="channel" value={schedule.channel} onChange={e => setSchedule({ ...schedule, channel: e.target.value })} className="px-3 py-2 border rounded-lg">
                            <option value="email">Email</option>
                            <option value="sms">SMS</option>
                        </select>
                        <input type="datetime-local" name="sendAt" value={schedule.sendAt} onChange={e => setSchedule({ ...schedule, sendAt: e.target.value })} className="px-3 py-2 border rounded-lg" required />
                        <button type="submit" className="bg-yellow-500 text-white px-4 py-2 rounded-lg font-bold hover:bg-yellow-600 transition">Schedule</button>
                    </form>
                    <div className="mt-4">
                        <h4 className="font-semibold mb-2">Scheduled Notifications</h4>
                        <ul className="list-disc ml-6">
                            {scheduled.map(s => (
                                <li key={s.id} className="mb-1 text-gray-700">
                                    User: {users.find(u => u._id === s.userId)?.name || s.userId}, Template: {templates.find(t => t._id === s.templateId)?.name || s.templateId}, Channel: {s.channel}, Send At: {s.sendAt}
                                </li>
                            ))}
                            {scheduled.length === 0 && <li className="text-gray-400">No scheduled notifications.</li>}
                        </ul>
                    </div>
                </div>
                {/* User Preferences */}
                <div className="bg-white rounded-2xl shadow-xl p-6 border-t-8 border-purple-500 mb-10">
                    <h3 className="text-xl font-bold text-purple-700 mb-4 flex items-center gap-2"><BellIcon className="h-6 w-6" /> User Notification Preferences</h3>
                    <form onSubmit={savePref} className="flex flex-wrap gap-4 items-center mb-4">
                        <select value={selectedUser} onChange={e => { setSelectedUser(e.target.value); fetchPreferences(e.target.value); }} className="px-3 py-2 border rounded-lg" required>
                            <option value="">Select User</option>
                            {users.map(u => <option key={u._id} value={u._id}>{u.name} ({u.email})</option>)}
                        </select>
                        <label className="flex items-center gap-2">
                            <input type="checkbox" name="email" checked={preferences.email || false} onChange={handlePref} /> Email
                        </label>
                        <label className="flex items-center gap-2">
                            <input type="checkbox" name="sms" checked={preferences.sms || false} onChange={handlePref} /> SMS
                        </label>
                        <button type="submit" className="bg-purple-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-purple-700 transition">Save</button>
                    </form>
                    {selectedUser && (
                        <div className="text-gray-700">Current: {preferences.email ? 'Email' : ''} {preferences.sms ? 'SMS' : ''}</div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminNotifications;
