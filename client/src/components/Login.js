import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import NavigationBar from './NavigationBar';
import { setAuth, clearAuth } from './auth';
import {
    EnvelopeIcon,
    LockClosedIcon,
    ArrowRightIcon,
    ExclamationCircleIcon,
    CheckCircleIcon
} from '@heroicons/react/24/outline';
import { GoogleLogin, GoogleOAuthProvider } from '@react-oauth/google';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [showForm, setShowForm] = useState(true);
    const [showRoleModal, setShowRoleModal] = useState(false);
    const [availableRoles, setAvailableRoles] = useState([]);
    const [pendingLogin, setPendingLogin] = useState({ email: '', password: '', credential: null, isGoogle: false });
    const navigate = useNavigate();

    useEffect(() => {
        clearAuth();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');
        try {
            const res = await fetch(process.env.REACT_APP_API_URL + '/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });
            const data = await res.json();

            if (data.roles && Array.isArray(data.roles)) {
                setAvailableRoles(data.roles);
                setPendingLogin({ email, password, credential: null, isGoogle: false });
                setShowRoleModal(true);
            } else if (!res.ok) {
                setError(data.message || 'Login failed');
            } else {
                setAuth(data.token, data.user);
                setSuccess('Login successful! Redirecting...');
                setTimeout(() => {
                    setShowForm(false);
                    setTimeout(() => {
                        if (data.user.role === 'client') {
                            navigate('/client/dashboard');
                        } else if (data.user.role === 'freelancer') {
                            navigate('/freelancer/dashboard');
                        } else if (data.user.role === 'admin') {
                            navigate('/admin/dashboard');
                        } else {
                            navigate('/');
                        }
                    }, 500);
                }, 1000);
            }
        } catch (err) {
            setError('Network error');
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleSuccess = async (credentialResponse) => {
        setLoading(true);
        setError('');
        setSuccess('');
        try {
            const res = await fetch(process.env.REACT_APP_API_URL + '/api/auth/google', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ credential: credentialResponse.credential, mode: 'login' })
            });
            const data = await res.json();
            if (data.roles && Array.isArray(data.roles)) {
                setAvailableRoles(data.roles);
                setPendingLogin({ email: data.email, password: '', credential: credentialResponse.credential, isGoogle: true });
                setShowRoleModal(true);
            } else if (!res.ok) {
                setError(data.message || 'Google login failed');
            } else {
                setAuth(data.token, data.user);
                setSuccess('Login successful! Redirecting...');
                setTimeout(() => {
                    setShowForm(false);
                    setTimeout(() => {
                        if (data.user.role === 'client') {
                            navigate('/client/dashboard');
                        } else if (data.user.role === 'freelancer') {
                            navigate('/freelancer/dashboard');
                        } else if (data.user.role === 'admin') {
                            navigate('/admin/dashboard');
                        } else {
                            navigate('/');
                        }
                    }, 500);
                }, 1000);
            }
        } catch (err) {
            setError('Google login error');
        } finally {
            setLoading(false);
        }
    };

    const handleRoleLogin = async (role) => {
        setLoading(true);
        setError('');
        setSuccess('');
        setShowRoleModal(false);
        try {
            let res, data;
            if (pendingLogin.isGoogle) {
                res = await fetch(process.env.REACT_APP_API_URL + '/api/auth/google', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ credential: pendingLogin.credential, mode: 'login-role', role })
                });
            } else {
                res = await fetch(process.env.REACT_APP_API_URL + '/api/auth/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email: pendingLogin.email, password: pendingLogin.password, role })
                });
            }
            data = await res.json();
            if (!res.ok) {
                setError(data.message || 'Login failed');
            } else {
                setAuth(data.token, data.user);
                setSuccess('Login successful! Redirecting...');
                setTimeout(() => {
                    setShowForm(false);
                    setTimeout(() => {
                        if (data.user.role === 'client') {
                            navigate('/client/dashboard');
                        } else if (data.user.role === 'freelancer') {
                            navigate('/freelancer/dashboard');
                        } else if (data.user.role === 'admin') {
                            navigate('/admin/dashboard');
                        } else {
                            navigate('/');
                        }
                    }, 500);
                }, 1000);
            }
        } catch (err) {
            setError('Login error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <GoogleOAuthProvider clientId={process.env.REACT_APP_GOOGLE_CLIENT_ID || '321137374833-tugdolhseei54osauna2oqiirnqga5ua.apps.googleusercontent.com'}>
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-200">
                <NavigationBar />
                <div className="flex items-center justify-center py-8 px-4 sm:px-6 lg:px-8">
                    <div
                        className="origin-top scale-[0.8] flex items-center justify-center w-full"
                        style={{ minHeight: '90vh' }}
                    >
                        <form
                            onSubmit={handleSubmit}
                            className={`bg-white rounded-2xl shadow-2xl p-6 sm:p-10 w-full max-w-md border-t-8 border-blue-600 transition-all duration-700 ${showForm ? 'fade-in' : 'fade-out'}`}
                        >
                            <div className="flex flex-col items-center mb-6 fade-in">
                                <img src="/logo.png" alt="SkillSwap Logo" className="h-28 w-28 mb-2 rounded-full border-4 border-blue-200 shadow-lg transition-transform duration-300 hover:scale-110" />
                                <h2 className="text-2xl sm:text-3xl font-extrabold text-blue-700 mb-1 text-center">Welcome Back</h2>
                                <p className="text-gray-500 text-center">Login to your SkillSwap account</p>
                            </div>

                            {error && (
                                <div className="mb-4 bg-red-100 text-red-700 px-4 py-2 rounded text-center text-sm fade-in flex items-center justify-center">
                                    <ExclamationCircleIcon className="h-5 w-5 mr-1 text-red-500" />
                                    {error}
                                </div>
                            )}

                            {success && (
                                <div className="mb-4 bg-green-100 text-green-700 px-4 py-2 rounded text-center text-sm fade-in flex items-center justify-center">
                                    <CheckCircleIcon className="h-5 w-5 mr-1 text-green-500" />
                                    {success}
                                </div>
                            )}

                            <div className="mb-4 relative">
                                <label className="block mb-2 text-sm font-semibold text-gray-700 flex items-center">
                                    <EnvelopeIcon className="h-5 w-5 mr-2 text-blue-600" />Email
                                </label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                    required
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all duration-300 hover:border-blue-400"
                                    placeholder="you@email.com"
                                />
                                <EnvelopeIcon className="h-5 w-5 text-gray-400 absolute bottom-2.5 left-3" />
                            </div>

                            <div className="mb-6 relative">
                                <label className="block mb-2 text-sm font-semibold text-gray-700 flex items-center">
                                    <LockClosedIcon className="h-5 w-5 mr-2 text-blue-600" />Password
                                </label>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    required
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all duration-300 hover:border-blue-400"
                                    placeholder="Your password"
                                />
                                <LockClosedIcon className="h-5 w-5 text-gray-400 absolute bottom-2.5 left-3" />
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-blue-600 text-white py-2.5 rounded-lg font-bold text-lg shadow hover:bg-gradient-to-r hover:from-blue-700 hover:to-blue-500 transition-all duration-300 hover:scale-105 disabled:opacity-50 flex items-center justify-center"
                            >
                                {loading ? (
                                    <div className="flex items-center">
                                        <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Logging in...
                                    </div>
                                ) : (
                                    <>
                                        Login
                                        <ArrowRightIcon className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform" />
                                    </>
                                )}
                            </button>

                            <div className="my-4 flex justify-center">
                                <div className="w-full">
                                    <GoogleLogin
                                        onSuccess={handleGoogleSuccess}
                                        onError={() => setError('Google login failed')}
                                        width="100%"
                                        shape="pill"
                                        theme="filled_blue"
                                        text="signin_with"
                                        useOneTap={false}
                                        className="w-full rounded-lg border border-blue-600 bg-white text-blue-700 font-bold py-2.5 mb-2 shadow hover:bg-blue-50 transition-all duration-300 flex items-center justify-center"
                                    />
                                </div>
                            </div>

                            {showRoleModal && (
                                <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
                                    <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-xs w-full relative flex flex-col items-center">
                                        <h3 className="text-xl font-bold text-blue-700 mb-4 text-center">Sign in as:</h3>
                                        <div className="flex gap-6 mb-4">
                                            {availableRoles.map(role => (
                                                <button
                                                    key={role}
                                                    className={`bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg shadow transition-all text-lg`}
                                                    onClick={() => handleRoleLogin(role)}
                                                >
                                                    {role.charAt(0).toUpperCase() + role.slice(1)}
                                                </button>
                                            ))}
                                        </div>
                                        <button className="absolute top-2 right-2 text-gray-400 hover:text-blue-600 text-2xl font-bold" onClick={() => setShowRoleModal(false)}>&times;</button>
                                    </div>
                                </div>
                            )}

                            <div className="mt-6 text-center">
                                <span className="text-gray-600">Don't have an account? </span>
                                <Link to="/signup" className="text-blue-600 font-semibold hover:underline transition-colors duration-300">Sign Up</Link>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </GoogleOAuthProvider>
    );
};

export default Login;