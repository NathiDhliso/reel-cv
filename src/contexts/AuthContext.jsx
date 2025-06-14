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
    const [permissions, setPermissions] = useState([]);

    // API base URL - will be AWS Lambda after migration
    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

    const syncUserData = async (authUser) => {
        if (!authUser) return null;

        try {
            // Check if user exists in our User table with role information
            const { data: existingUser, error: fetchError } = await supabase
                .from('User')
                .select(`
                    *,
                    roles (
                        id,
                        name,
                        description
                    )
                `)
                .eq('id', authUser.id)
                .single();

            if (fetchError && fetchError.code !== 'PGRST116') {
                console.error('Error fetching user:', fetchError);
                return null;
            }

            // If user doesn't exist, create them with role_id
            if (!existingUser) {
                const defaultRole = authUser.user_metadata?.role || 'candidate';
                
                // Get role_id for the default role
                const { data: roleData, error: roleError } = await supabase
                    .from('roles')
                    .select('id')
                    .eq('name', defaultRole)
                    .single();

                if (roleError) {
                    console.error('Error fetching role:', roleError);
                    return null;
                }

                const { data: newUser, error: insertError } = await supabase
                    .from('User')
                    .insert([{
                        id: authUser.id,
                        email: authUser.email,
                        firstName: authUser.user_metadata?.firstName || authUser.user_metadata?.first_name || '',
                        lastName: authUser.user_metadata?.lastName || authUser.user_metadata?.last_name || '',
                        role: defaultRole,
                        role_id: roleData.id
                    }])
                    .select(`
                        *,
                        roles (
                            id,
                            name,
                            description
                        )
                    `)
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

    const fetchUserPermissions = async (userId) => {
        try {
            const { data, error } = await supabase
                .rpc('get_user_permissions', { user_id: userId });

            if (error) {
                console.error('Error fetching permissions:', error);
                return [];
            }

            return data.map(p => p.permission_name);
        } catch (error) {
            console.error('Error fetching permissions:', error);
            return [];
        }
    };

    useEffect(() => {
        // Check for an active session
        supabase.auth.getSession().then(async ({ data: { session } }) => {
            if (session?.user) {
                const userData = await syncUserData(session.user);
                if (userData) {
                    const userPermissions = await fetchUserPermissions(userData.id);
                    setUser({
                        id: userData.id,
                        email: userData.email,
                        firstName: userData.firstName,
                        lastName: userData.lastName,
                        role: userData.role,
                        role_id: userData.role_id,
                        roleInfo: userData.roles
                    });
                    setPermissions(userPermissions);
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
                        const userPermissions = await fetchUserPermissions(userData.id);
                        setUser({
                            id: userData.id,
                            email: userData.email,
                            firstName: userData.firstName,
                            lastName: userData.lastName,
                            role: userData.role,
                            role_id: userData.role_id,
                            roleInfo: userData.roles
                        });
                        setPermissions(userPermissions);
                        setToken(session.access_token);
                    }
                } else {
                    setUser(null);
                    setPermissions([]);
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
        // Use Supabase Auth for now, but this could be migrated to AWS Lambda
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
        // Use Supabase Auth for now, but this could be migrated to AWS Lambda
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
        setPermissions([]);
        setToken(null);
    };

    const hasPermission = (permission) => {
        return permissions.includes(permission);
    };

    const value = {
        user,
        token,
        loading,
        permissions,
        login,
        register,
        logout,
        hasPermission,
        API_BASE_URL
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};