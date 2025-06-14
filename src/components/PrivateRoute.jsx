import React from 'react';
import { Outlet } from 'react-router-dom';

export const PrivateRoute = ({ children }) => {
    // This component now simply renders the protected content,
    // bypassing all authentication checks.
    return children || <Outlet />;
};