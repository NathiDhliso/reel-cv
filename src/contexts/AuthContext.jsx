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

    const syncUserData = async (authUser) => {
        if (!authUser) return null;

        try {
            // Check if user exists in our User table
            const { data: existingUser, error: fetchError } = await supabase
                .from('User')
                .select('*')
                .eq('id', authUser.id)
                .single();

            if (fetchError && fetchError.code !== 'PGRST116') {
                console.error('Error fetching user:', fetchError);
                return null;
            }

            // If user doesn't exist, create them
            if (!existingUser) {
                const { data: newUser, error: insertError } = await supabase
                    .from('User')
                    .insert([{
                        id: authUser.id,
                        email: authUser.email,
                        firstName: authUser.user_metadata?.firstName || authUser.user_metadata?.first_name || '',
                        lastName: authUser.user_metadata?.lastName || authUser.user_metadata?.last_name || '',
                        role: authUser.user_metadata?.role || 'candidate'
                    }])
                    .select()
                    .single();

                if (insertError) {
                    console.error('Error creating user:', insertError);
                    return null;
                }

                return newUser;
            }

            return existingUser;
        } catch (error) {
            console.error('Error syncing user data:', error);
            return null;
        }
    };

    useEffect(() => {
        // Check for an active session
        supabase.auth.getSession().then(async ({ data: { session } }) => {
            if (session?.user) {
                const userData = await syncUserData(session.user);
                if (userData) {
                    setUser({
                        id: userData.id,
                        email: userData.email,
                        firstName: userData.firstName,
                        lastName: userData.lastName,
                        role: userData.role
                    });
                    setToken(session.access_token);
                }
            }
            setLoading(false);
        });

        // Listen for changes in auth state (login, logout)
        const { data: authListener } = supabase.auth.onAuthStateChange(
            async (event, session) => {
                if (session?.user) {
                    const userData = await syncUserData(session.user);
                    if (userData) {
                        setUser({
                            id: userData.id,
                            email: userData.email,
                            firstName: userData.firstName,
                            lastName: userData.lastName,
                            role: userData.role
                        });
                        setToken(session.access_token);
                    }
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