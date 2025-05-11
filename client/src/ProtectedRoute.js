import React from 'react';
import { Navigate } from 'react-router-dom';
import { isAuthenticated, hasRole } from './components/auth';


const ProtectedRoute = ({ children, role }) => {
    if (!isAuthenticated()) {
        return <Navigate to="/login" replace />;
    }
    if (role && !hasRole(role)) {
        return <Navigate to="/login" replace />;
    }
    return children;
};

export default ProtectedRoute;
