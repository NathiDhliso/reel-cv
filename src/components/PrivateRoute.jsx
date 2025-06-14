import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Navigate, Outlet } from 'react-router-dom';

export const PrivateRoute = () => {
    const { token, loading } = useAuth();
    
    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-xl text-gray-600 dark:text-gray-400">Loading...</div>
            </div>
        );
    }
    
    return token ? <Outlet /> : <Navigate to="/login" />;
};