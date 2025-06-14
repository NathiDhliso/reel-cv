import React, { createContext, useState, useContext, useEffect } from 'react';
import { supabase } from '../supabaseClient';

const AuthContext = createContext();

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check for an active session
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (session?.user) {
                setUser({
                    id: session.user.id,
                    email: session.user.email,
                    firstName: session.user.user_metadata?.firstName || session.user.user_metadata?.first_name,
                    lastName: session.user.user_metadata?.lastName || session.user.user_metadata?.last_name,
                    role: session.user.user_metadata?.role || 'candidate'
                });
                setToken(session.access_token);
            }
            setLoading(false);
        });

        // Listen for changes in auth state (login, logout)
        const { data: authListener } = supabase.auth.onAuthStateChange(
            async (event, session) => {
                if (session?.user) {
                    setUser({
                        id: session.user.id,
                        email: session.user.email,
                        firstName: session.user.user_metadata?.firstName || session.user.user_metadata?.first_name,
                        lastName: session.user.user_metadata?.lastName || session.user.user_metadata?.last_name,
                        role: session.user.user_metadata?.role || 'candidate'
                    });
                    setToken(session.access_token);
                } else {
                    setUser(null);
                    setToken(null);
                }
                setLoading(false);
            }
        );

        // Cleanup the listener when the component unmounts
        return () => {
            authListener.subscription.unsubscribe();
        };
    }, []);

    const login = async (email, password) => {
        const { data, error } = await supabase.auth.signInWithPassword({ 
            email, 
            password 
        });
        
        if (error) {
            throw new Error(error.message);
        }
        
        return data;
    };

    const register = async (email, password, firstName, lastName) => {
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    firstName,
                    lastName,
                    first_name: firstName,
                    last_name: lastName,
                    role: 'candidate'
                }
            }
        });
        
        if (error) {
            throw new Error(error.message);
        }
        
        return data;
    };

    const logout = async () => {
        await supabase.auth.signOut();
        setUser(null);
        setToken(null);
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