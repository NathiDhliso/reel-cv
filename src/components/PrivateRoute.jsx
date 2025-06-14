import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Navigate, Outlet } from 'react-router-dom';

export const PrivateRoute = ({ children, requiredRole, requiredPermission }) => {
    const { token, user, loading, hasPermission } = useAuth();
    
    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="flex flex-col items-center space-y-4">
                    <div className="w-16 h-16 border-4 border-deep-ocean-blue border-t-transparent rounded-full animate-spin"></div>
                    <div className="text-xl text-gray-600 dark:text-gray-400">Authenticating...</div>
                </div>
            </div>
        );
    }
    
    if (!token || !user) {
        return <Navigate to="/login" replace />;
    }
    
    // Check role-based access (legacy support)
    if (requiredRole && user?.role !== requiredRole) {
        return <Navigate to="/dashboard" replace />;
    }
    
    // Check permission-based access (new RBAC system)
    if (requiredPermission && !hasPermission(requiredPermission)) {
        return <Navigate to="/dashboard" replace />;
    }
    
    return children || <Outlet />;
};