import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
    ArrowRightIcon,
    ExclamationCircleIcon,
    CheckCircleIcon,
    UserIcon,
    EnvelopeIcon,
    LockClosedIcon
} from '@heroicons/react/24/outline';
import { GoogleLogin, GoogleOAuthProvider } from '@react-oauth/google';
import NavigationBar from './NavigationBar';

const Signup = () => {
    const [form, setForm] = useState({
        name: '',
        email: '',
        password: '',
        role: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [image, setImage] = useState(null);
    const [emailVerified, setEmailVerified] = useState(false);
    const [otpSent, setOtpSent] = useState(false);
    const [otp, setOtp] = useState('');
    const [otpError, setOtpError] = useState('');
    const [otpSuccess, setOtpSuccess] = useState('');
    const [showRoleModal, setShowRoleModal] = useState(false);
    const [googleCredential, setGoogleCredential] = useState(null);
    const [googleLoginEmail, setGoogleLoginEmail] = useState('');
    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm(prevForm => ({ ...prevForm, [name]: value }));
    };

    const handleImageChange = (e) => {
        setImage(e.target.files[0]);
    };

    const handleSendOtp = async () => {
        setOtpError(''); setOtpSuccess('');
        if (!form.email) return setOtpError('Please enter your email first.');
        try {
            const res = await fetch('http://localhost:5000/api/auth/send-otp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: form.email })
            });
            const data = await res.json();
            if (!res.ok) setOtpError(data.message || 'Failed to send OTP');
            else {
                setOtpSent(true);
                setOtpSuccess('OTP sent to your email.');
            }
        } catch {
            setOtpError('Failed to send OTP');
        }
    };

    const handleVerifyOtp = async () => {
        setOtpError(''); setOtpSuccess('');
        if (!otp) return setOtpError('Enter the OTP sent to your email.');
        try {
            const res = await fetch('http://localhost:5000/api/auth/verify-otp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: form.email, otp })
            });
            const data = await res.json();
            if (!res.ok) setOtpError(data.message || 'Invalid OTP');
            else {
                setEmailVerified(true);
                setOtpSuccess('Email verified!');
            }
        } catch {
            setOtpError('Failed to verify OTP');
        }
    };

    const handleGoogleSuccess = async (credentialResponse) => {
        setLoading(true);
        setError('');
        setSuccess('');
        setGoogleCredential(credentialResponse.credential);

        setShowRoleModal(true);
    };


    const handleGoogleRoleSignup = async (role) => {
        setLoading(true);
        setError('');
        setSuccess('');
        setShowRoleModal(false);
        try {
            const res = await fetch('http://localhost:5000/api/auth/google', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ credential: googleCredential, mode: 'signup', role })
            });
            const data = await res.json();
            if (!res.ok) {

                if (data.message && data.message.includes('already exists')) {
                    setError(data.message);
                    setTimeout(() => navigate('/login'), 1500);
                } else {
                    setError(data.message || 'Google signup failed');
                }
            } else {

                if (role === 'freelancer') {
                    setSuccess('Freelancer account created! Pending admin approval. Please log in after approval.');
                } else {
                    setSuccess('Account created successfully! Please log in.');
                }
                setTimeout(() => navigate('/login'), 1500);
            }
        } catch (err) {
            setError('Google signup error');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');
        try {
            const formData = new FormData();
            formData.append('name', form.name);
            formData.append('email', form.email);
            formData.append('password', form.password);
            formData.append('role', form.role);
            if (image) formData.append('image', image);
            const res = await fetch('http://localhost:5000/api/auth/register', {
                method: 'POST',
                body: formData
            });
            const data = await res.json();
            if (!res.ok) {
                setError(data.message || 'Signup failed');
            } else {
                if (form.role === 'freelancer') {
                    setSuccess('Signup successful! Your request is pending admin approval. You will be able to log in once approved.');
                } else {
                    setSuccess('Signup successful! Redirecting to login...');
                    setTimeout(() => {
                        setTimeout(() => navigate('/login'), 500);
                    }, 1000);
                }
            }
        } catch (err) {
            setError('Network error');
        } finally {
            setLoading(false);
        }
    };



    return (
        <GoogleOAuthProvider clientId={process.env.REACT_APP_GOOGLE_CLIENT_ID || '321137374833-tugdolhseei54osauna2oqiirnqga5ua.apps.googleusercontent.com'}>
            <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-100 to-blue-300">
                <NavigationBar showProfile={false} />
                <div className="flex flex-1 items-center justify-center">
                    <div
                        className="origin-top scale-[0.75] flex items-center justify-center w-full"
                        style={{ minHeight: '90vh' }}
                    >
                        <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-6 sm:p-8 border-t-8 border-blue-600">
                            <div className="flex flex-col items-center mb-4">
                                <img src="/logo.png" alt="SkillSwap Logo" className="h-16 w-16 mb-2 rounded-full border-4 border-blue-200 shadow-lg" />
                                <h2 className="text-2xl sm:text-3xl font-extrabold text-blue-700 mb-1 text-center">Create Account</h2>
                                <p className="text-gray-500 text-center">Sign up to join SkillSwap</p>
                            </div>
                            {error && (
                                <div className="mb-4 bg-red-100 text-red-700 px-4 py-2 rounded text-center text-sm flex items-center justify-center">
                                    <ExclamationCircleIcon className="h-5 w-5 mr-1 text-red-500" />
                                    {error}
                                </div>
                            )}
                            {success && (
                                <div className="mb-4 bg-green-100 text-green-700 px-4 py-2 rounded text-center text-sm flex items-center justify-center">
                                    <CheckCircleIcon className="h-5 w-5 mr-1 text-green-500" />
                                    {success}
                                </div>
                            )}
                            <form onSubmit={handleSubmit} className="space-y-5">
                                <div>
                                    <label className="block mb-1 text-sm font-semibold text-gray-700 font-sans flex items-center gap-1">
                                        <UserIcon className="h-5 w-5 text-blue-500" /> Full Name
                                    </label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={form.name}
                                        onChange={handleChange}
                                        required
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 transition font-sans text-base"
                                        placeholder="Your name"
                                    />
                                </div>
                                <div>
                                    <label className="block mb-1 text-sm font-semibold text-gray-700 font-sans flex items-center gap-1">
                                        <EnvelopeIcon className="h-5 w-5 text-blue-500" /> Email
                                    </label>
                                    <div className="flex gap-2 items-center">
                                        <input
                                            type="email"
                                            name="email"
                                            value={form.email}
                                            onChange={handleChange}
                                            required
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 transition font-sans text-base"
                                            placeholder="you@email.com"
                                            disabled={emailVerified}
                                        />
                                        {!emailVerified && (
                                            <button
                                                type="button"
                                                onClick={handleSendOtp}
                                                className="w-fit rounded-lg border border-blue-600 bg-white text-blue-700 font-bold py-2 px-4 shadow hover:bg-blue-50 transition-all duration-300 flex items-center justify-center disabled:opacity-50"
                                                disabled={otpSent}
                                            >
                                                Verify Email
                                            </button>
                                        )}
                                        {emailVerified && <span className="text-green-600 font-bold ml-2">Verified</span>}
                                    </div>
                                    {otpSent && !emailVerified && (
                                        <div className="mt-2 flex gap-2 items-center">
                                            <input type="text" value={otp} onChange={e => setOtp(e.target.value)} maxLength={6} placeholder="Enter OTP" className="px-3 py-1 border rounded w-32" />
                                            <button type="button" onClick={handleVerifyOtp} className="bg-green-600 text-white px-3 py-1 rounded font-bold hover:bg-green-700 transition">Submit OTP</button>
                                        </div>
                                    )}
                                    {otpError && <div className="text-red-600 text-sm mt-1">{otpError}</div>}
                                    {otpSuccess && <div className="text-green-600 text-sm mt-1">{otpSuccess}</div>}
                                </div>
                                <div>
                                    <label className="block mb-1 text-sm font-semibold text-gray-700 font-sans flex items-center gap-1">
                                        <LockClosedIcon className="h-5 w-5 text-blue-500" /> Password
                                    </label>
                                    <input
                                        type="password"
                                        name="password"
                                        value={form.password}
                                        onChange={handleChange}
                                        required
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 transition font-sans text-base"
                                        placeholder="Create a password"
                                    />
                                </div>
                                <div>
                                    <label className="block mb-1 text-sm font-semibold text-gray-700 font-sans flex items-center gap-1">
                                        <UserIcon className="h-5 w-5 text-blue-500" /> Role
                                    </label>
                                    <select
                                        name="role"
                                        value={form.role || ''}
                                        onChange={handleChange}
                                        required
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 transition font-sans text-base"
                                    >
                                        <option value="">Select role</option>
                                        <option value="client">Client</option>
                                        <option value="freelancer">Freelancer</option>
                                        <option value="admin">Admin</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block mb-1 text-sm font-semibold text-gray-700 font-sans flex items-center gap-1">
                                        <UserIcon className="h-5 w-5 text-blue-500" /> Profile Image
                                    </label>
                                    <label className="w-full flex items-center px-4 py-2 bg-white text-blue-700 rounded-lg shadow border border-blue-300 cursor-pointer hover:bg-blue-50 transition">
                                        <span className="mr-2 font-semibold">Choose File</span>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleImageChange}
                                            className="hidden"
                                        />
                                        {image && <span className="ml-2 text-xs text-gray-600">{image.name}</span>}
                                    </label>
                                </div>
                                <button
                                    type="submit"
                                    disabled={loading || !emailVerified}
                                    className="w-full bg-blue-600 text-white py-2.5 rounded-lg font-bold text-lg shadow hover:bg-blue-700 transition-all duration-300 hover:scale-105 disabled:opacity-50 flex items-center justify-center"
                                >
                                    {loading ? (
                                        <>
                                            <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Signing up...
                                        </>
                                    ) : (
                                        <>
                                            Sign Up
                                            <ArrowRightIcon className="h-5 w-5 ml-2" />
                                        </>
                                    )}
                                </button>
                            </form>
                            <div className="my-6 flex justify-center">
                                <GoogleLogin
                                    onSuccess={handleGoogleSuccess}
                                    onError={() => setError('Google signup failed')}
                                    shape="pill"
                                    theme="filled_blue"
                                    text="signup_with"
                                    useOneTap={false}
                                    className="w-full rounded-lg border border-blue-600 bg-white text-blue-700 font-bold py-2.5 mb-2 shadow hover:bg-blue-50 transition-all duration-300 flex items-center justify-center"
                                />
                            </div>
                            {showRoleModal && (
                                <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
                                    <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-xs w-full relative flex flex-col items-center">
                                        <h3 className="text-xl font-bold text-blue-700 mb-4 text-center">Want to join us as a?</h3>
                                        <div className="flex gap-6 mb-4">
                                            <button
                                                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg shadow transition-all text-lg"
                                                onClick={() => handleGoogleRoleSignup('client')}
                                            >
                                                Client
                                            </button>
                                            <button
                                                className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-6 rounded-lg shadow transition-all text-lg"
                                                onClick={() => handleGoogleRoleSignup('freelancer')}
                                            >
                                                Freelancer
                                            </button>
                                        </div>
                                        <button className="absolute top-2 right-2 text-gray-400 hover:text-blue-600 text-2xl font-bold" onClick={() => setShowRoleModal(false)}>&times;</button>
                                    </div>
                                </div>
                            )}
                            <div className="mt-6 text-center">
                                <span className="text-gray-600">Already have an account? </span>
                                <Link to="/login" className="text-blue-600 font-semibold hover:underline transition-colors duration-300">Login</Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </GoogleOAuthProvider>
    );
};

export default Signup;