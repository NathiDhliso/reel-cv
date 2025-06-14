import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(() => localStorage.getItem('token'));
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (token) {
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            // You could add a route to verify token and get user info here
            // For now, we'll just trust the stored token
        }
        setLoading(false);
    }, [token]);

    const login = async (email, password) => {
        try {
            const { data } = await axios.post('/api/auth/login', { email, password });
            localStorage.setItem('token', data.accessToken);
            setToken(data.accessToken);
            setUser(data.user);
            axios.defaults.headers.common['Authorization'] = `Bearer ${data.accessToken}`;
            return data;
        } catch (error) {
            throw error;
        }
    };

    const register = async (email, password, firstName, lastName) => {
        try {
            const { data } = await axios.post('/api/auth/register', { 
                email, 
                password, 
                firstName, 
                lastName 
            });
            return data;
        } catch (error) {
            throw error;
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        setToken(null);
        setUser(null);
        delete axios.defaults.headers.common['Authorization'];
    };

    const value = { 
        user, 
        token, 
        loading,
        login, 
        register,
        logout 
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};