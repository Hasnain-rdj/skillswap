import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { isAuthenticated, getAuth, clearAuth } from './auth';
import {
    UserIcon,
    BriefcaseIcon,
    UsersIcon,
    ChartBarIcon,
    ArrowRightOnRectangleIcon,
    HomeIcon,
    Bars3Icon,
    XMarkIcon,
    ChatBubbleLeftRightIcon,
    CheckBadgeIcon,
    BellIcon,
    StarIcon
} from '@heroicons/react/24/outline';

const NavigationBar = ({ showProfile = true }) => {
    const { user } = getAuth();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [authState, setAuthState] = useState({ authenticated: isAuthenticated(), user });
    const location = useLocation();
    const navigate = useNavigate();

    useEffect(() => {
        const handleStorage = () => {
            setAuthState({ authenticated: isAuthenticated(), user: getAuth().user });
        };
        window.addEventListener('storage', handleStorage);
        return () => window.removeEventListener('storage', handleStorage);
    }, []);

    useEffect(() => {
        setAuthState({ authenticated: isAuthenticated(), user: getAuth().user });
    }, [location]);

    const handleLogout = () => {
        clearAuth();
        setAuthState({ authenticated: false, user: null });
        navigate('/login');
    };

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    const closeMenu = () => {
        setIsMenuOpen(false);
    };

    const handleLogoClick = (e) => {
        e.preventDefault();
        if (!authState.authenticated || !authState.user) {
            navigate('/login');
        } else if (authState.user.role === 'client') {
            navigate('/client/dashboard');
        } else if (authState.user.role === 'freelancer') {
            navigate('/freelancer/dashboard');
        } else if (authState.user.role === 'admin') {
            navigate('/admin/dashboard');
        } else {
            navigate('/');
        }
    };

    const NavLink = ({ to, icon, children, className = "" }) => {
        const isActive = location.pathname === to;
        return (
            <Link
                to={to}
                className={`flex items-center text-blue-700 text-lg font-medium hover:text-blue-900 transition-all duration-300 group ${isActive ? 'underline' : ''} ${className}`}
                onClick={closeMenu}
            >
                {icon}
                {children}
            </Link>
        );
    };

    return (
        <nav className="bg-white shadow-md border-b border-blue-100 sticky top-0 z-40">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
                <div className="flex items-center">
                    <button onClick={handleLogoClick} className="flex items-center focus:outline-none bg-transparent border-none p-0 m-0">
                        <img src="/logo192.png" alt="SkillSwap Logo" className="h-8 w-8 mr-2" />
                        <span className="font-bold text-xl text-blue-700">SkillSwap</span>
                    </button>
                </div>
                <div className="flex items-center space-x-4">
                    {/* Mobile menu button */}
                    <button
                        className="md:hidden text-blue-700"
                        onClick={toggleMenu}
                    >
                        {isMenuOpen ?
                            <XMarkIcon className="h-8 w-8 text-blue-700 transition-all duration-300" /> :
                            <Bars3Icon className="h-8 w-8 text-blue-700 transition-all duration-300" />
                        }
                    </button>

                    {/* Desktop Navigation Links */}
                    <div className="hidden md:flex space-x-6 items-center">
                        {!authState.authenticated && (
                            <>
                                <NavLink
                                    to="/login"
                                    icon={<ArrowRightOnRectangleIcon className="h-5 w-5 mr-1 group-hover:scale-110 transition-transform duration-300" />}
                                    className="text-blue-700 hover:text-blue-900"
                                >
                                    Login
                                </NavLink>
                                <NavLink
                                    to="/signup"
                                    icon={<UserIcon className="h-5 w-5 mr-1 group-hover:scale-110 transition-transform duration-300" />}
                                    className="text-blue-700 hover:text-blue-900"
                                >
                                    Sign Up
                                </NavLink>
                            </>
                        )}

                        {authState.authenticated && authState.user && authState.user.role === 'client' && (
                            <>
                                <NavLink
                                    to="/client/dashboard"
                                    icon={<HomeIcon className="h-5 w-5 mr-1 group-hover:scale-110 transition-transform duration-300" />}
                                    className="text-blue-700 hover:text-blue-900"
                                >
                                    Dashboard
                                </NavLink>
                                <NavLink
                                    to="/client/projects"
                                    icon={<BriefcaseIcon className="h-5 w-5 mr-1 group-hover:scale-110 transition-transform duration-300" />}
                                    className="text-blue-700 hover:text-blue-900"
                                >
                                    Projects
                                </NavLink>
                                <NavLink
                                    to="/client/freelancers"
                                    icon={<UsersIcon className="h-5 w-5 mr-1 group-hover:scale-110 transition-transform duration-300" />}
                                    className="text-blue-700 hover:text-blue-900"
                                >
                                    Freelancers
                                </NavLink>
                                <NavLink
                                    to="/client/analytics"
                                    icon={<ChartBarIcon className="h-5 w-5 mr-1 group-hover:scale-110 transition-transform duration-300" />}
                                    className="text-blue-700 hover:text-blue-900"
                                >
                                    Analytics
                                </NavLink>
                                <button
                                    onClick={handleLogout}
                                    className="flex items-center text-blue-700 text-lg font-medium hover:text-red-500 transition-all duration-300 ml-4 group"
                                >
                                    <ArrowRightOnRectangleIcon className="h-5 w-5 mr-1 group-hover:scale-110 transition-transform duration-300" />
                                    Logout
                                </button>
                            </>
                        )}
                        {authState.authenticated && authState.user && authState.user.role === 'freelancer' && (
                            <>
                                <NavLink
                                    to="/freelancer/dashboard"
                                    icon={<HomeIcon className="h-5 w-5 mr-1 group-hover:scale-110 transition-transform duration-300" />}
                                    className="text-blue-700 hover:text-blue-900"
                                >
                                    Dashboard
                                </NavLink>
                                <NavLink
                                    to="/freelancer/profile"
                                    icon={<UserIcon className="h-5 w-5 mr-1 group-hover:scale-110 transition-transform duration-300" />}
                                    className="text-blue-700 hover:text-blue-900"
                                >
                                    Profile
                                </NavLink>
                                <NavLink
                                    to="/freelancer/bids"
                                    icon={<BriefcaseIcon className="h-5 w-5 mr-1 group-hover:scale-110 transition-transform duration-300" />}
                                    className="text-blue-700 hover:text-blue-900"
                                >
                                    Bids
                                </NavLink>
                                <NavLink
                                    to="/freelancer/projects"
                                    icon={<ChartBarIcon className="h-5 w-5 mr-1 group-hover:scale-110 transition-transform duration-300" />}
                                    className="text-blue-700 hover:text-blue-900"
                                >
                                    Projects
                                </NavLink>
                                <NavLink
                                    to="/freelancer/chats"
                                    icon={<ChatBubbleLeftRightIcon className="h-5 w-5 mr-1 group-hover:scale-110 transition-transform duration-300" />}
                                    className="text-blue-700 hover:text-blue-900"
                                >
                                    Chat
                                </NavLink>
                                <NavLink
                                    to="/freelancer/offers"
                                    icon={<StarIcon className="h-5 w-5 mr-1 group-hover:scale-110 transition-transform duration-300 text-yellow-500" />}
                                    className="text-yellow-700 hover:text-yellow-900"
                                >
                                    Offers
                                </NavLink>
                                <button
                                    onClick={handleLogout}
                                    className="flex items-center text-blue-700 text-lg font-medium hover:text-red-500 transition-all duration-300 ml-4 group"
                                >
                                    <ArrowRightOnRectangleIcon className="h-5 w-5 mr-1 group-hover:scale-110 transition-transform duration-300" />
                                    Logout
                                </button>
                            </>
                        )}
                        {authState.authenticated && authState.user && authState.user.role === 'admin' && (
                            <>
                                <NavLink
                                    to="/admin/dashboard"
                                    icon={<HomeIcon className="h-5 w-5 mr-1 group-hover:scale-110 transition-transform duration-300" />}
                                    className="text-blue-700 hover:text-blue-900"
                                >
                                    Admin Dashboard
                                </NavLink>
                                <NavLink
                                    to="/admin/verification"
                                    icon={<CheckBadgeIcon className="h-5 w-5 mr-1 group-hover:scale-110 transition-transform duration-300" />}
                                    className="text-blue-700 hover:text-blue-900"
                                >
                                    Freelancer Verification
                                </NavLink>
                                <NavLink
                                    to="/admin/analytics"
                                    icon={<ChartBarIcon className="h-5 w-5 mr-1 group-hover:scale-110 transition-transform duration-300" />}
                                    className="text-blue-700 hover:text-blue-900"
                                >
                                    Platform Analytics
                                </NavLink>
                                <NavLink
                                    to="/admin/notifications"
                                    icon={<BellIcon className="h-5 w-5 mr-1 group-hover:scale-110 transition-transform duration-300" />}
                                    className="text-blue-700 hover:text-blue-900"
                                >
                                    Notification System
                                </NavLink>
                                <button
                                    onClick={handleLogout}
                                    className="flex items-center text-blue-700 text-lg font-medium hover:text-red-500 transition-all duration-300 ml-4 group"
                                >
                                    <ArrowRightOnRectangleIcon className="h-5 w-5 mr-1 group-hover:scale-110 transition-transform duration-300" />
                                    Logout
                                </button>
                            </>
                        )}
                    </div>

                    {showProfile && user && (
                        <div className="flex items-center space-x-2 pl-4 border-l border-blue-100">
                            {user.image && (
                                <img
                                    src={user.image.startsWith('http') ? user.image : process.env.REACT_APP_API_URL + user.image}
                                    alt="Profile"
                                    className="h-8 w-8 rounded-full object-cover border-2 border-blue-200"
                                />
                            )}
                            <span className="font-semibold text-blue-700">{user.name}</span>
                        </div>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default NavigationBar;