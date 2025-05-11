import { useEffect, useState } from 'react';
import { getAuth } from '../auth';
import NavigationBar from '../NavigationBar';

const ReviewSection = () => {
    const { token, user } = getAuth();
    const [projects, setProjects] = useState([]);
    const [success, setSuccess] = useState('');
    const [error, setError] = useState('');
    const [form, setForm] = useState({});

    useEffect(() => {
        const fetchProjects = async () => {
            const res = await fetch('http://localhost:5000/api/projects/completed/unreviewed', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            setProjects(data);
        };
        fetchProjects();
    }, [token, user]);

    const handleChange = (projectId, field, value) => {
        setForm(f => ({ ...f, [projectId]: { ...f[projectId], [field]: value } }));
    };

    const handleSubmit = async (e, project) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        const { rating = 5, comment = '' } = form[project._id] || {};
        if (!rating) return setError('Rating required');
        const res = await fetch('http://localhost:5000/api/reviews', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ projectId: project._id, freelancerId: project.assignedFreelancer._id || project.assignedFreelancer, rating, comment })
        });
        if (res.ok) {
            setSuccess('Review submitted!');
            setForm(f => ({ ...f, [project._id]: { rating: 5, comment: '' } }));
        } else {
            const data = await res.json();
            setError(data.message || 'Error');
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100">
            <NavigationBar showProfile={true} />
            <div className="max-w-3xl mx-auto p-6">
                <div className="bg-white rounded-2xl shadow p-6 mt-6">
                    <h3 className="text-2xl font-bold text-blue-700 mb-4">Completed Projects - Give Reviews</h3>
                    {success && <div className="text-green-600 mb-2">{success}</div>}
                    {error && <div className="text-red-600 mb-2">{error}</div>}
                    <ul>
                        {projects.map(project => (
                            <li key={project._id} className="mb-6 p-4 rounded border bg-blue-50">
                                <div className="font-bold text-blue-800 text-lg">{project.title}</div>
                                <div>Freelancer: <span className="font-semibold">{project.assignedFreelancer.name || project.assignedFreelancer}</span></div>
                                <form onSubmit={e => handleSubmit(e, project)} className="flex flex-col md:flex-row md:items-center md:space-x-4 mt-2">
                                    <select value={form[project._id]?.rating || 5} onChange={e => handleChange(project._id, 'rating', Number(e.target.value))} className="border rounded px-2 py-1 mb-2 md:mb-0">
                                        {[5, 4, 3, 2, 1].map(r => <option key={r} value={r}>{r} Star{r > 1 ? 's' : ''}</option>)}
                                    </select>
                                    <input value={form[project._id]?.comment || ''} onChange={e => handleChange(project._id, 'comment', e.target.value)} placeholder="Add a comment..." className="flex-1 border rounded px-2 py-1 mb-2 md:mb-0" />
                                    <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded font-bold hover:bg-blue-700">Submit</button>
                                </form>
                            </li>
                        ))}
                        {projects.length === 0 && <div className="text-gray-500">No completed projects to review yet.</div>}
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default ReviewSection;
