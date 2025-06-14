import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { LogIn, Mail, Lock, CheckCircle } from 'lucide-react';
import styles from './AuthPage.module.css';

export const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    
    // Check for success message from registration
    const successMessage = location.state?.message;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        
        try {
            await login(email, password);
            navigate('/');
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to log in. Please check your credentials.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-modern-gray via-white to-deep-ocean-blue/10 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center py-12 px-4">
            <div className={styles.authContainer}>
                <div className="text-center mb-8">
                    <div className="mx-auto w-16 h-16 bg-gradient-to-r from-deep-ocean-blue to-growth-green rounded-full flex items-center justify-center mb-4">
                        <LogIn className="w-8 h-8 text-white" />
                    </div>
                    <h2 className={styles.title}>Welcome Back</h2>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">
                        Sign in to continue your skill assessment journey
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {successMessage && (
                        <div className="mb-4 p-4 bg-growth-green/10 text-growth-green rounded-lg border border-growth-green/20 flex items-center">
                            <CheckCircle className="w-5 h-5 mr-2" />
                            {successMessage}
                        </div>
                    )}
                    
                    {error && <div className={styles.error}>{error}</div>}
                    
                    <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input 
                            type="email" 
                            placeholder="Email Address" 
                            value={email} 
                            onChange={(e) => setEmail(e.target.value)} 
                            className={`${styles.input} pl-10`}
                            required 
                        />
                    </div>

                    <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input 
                            type="password" 
                            placeholder="Password" 
                            value={password} 
                            onChange={(e) => setPassword(e.target.value)} 
                            className={`${styles.input} pl-10`}
                            required 
                        />
                    </div>

                    <button 
                        type="submit" 
                        disabled={loading}
                        className={styles.submitButton}
                    >
                        {loading ? (
                            <>
                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                                Signing In...
                            </>
                        ) : (
                            <>
                                <LogIn className="w-5 h-5 mr-2" />
                                Sign In
                            </>
                        )}
                    </button>
                </form>

                <div className={styles.linkText}>
                    Don't have an account? <Link to="/register" className={styles.link}>Create Account</Link>
                </div>

                <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                    <div className="text-center">
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                            Demo Accounts:
                        </p>
                        <div className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
                            <div>Candidate: candidate@demo.com / password</div>
                            <div>Proctor: proctor@demo.com / password</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};