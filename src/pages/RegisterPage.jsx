import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { UserPlus, Mail, Lock, User } from 'lucide-react';
import styles from './AuthPage.module.css';

export const RegisterPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { register } = useAuth();
    const navigate = useNavigate();
    
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        
        try {
            await register(email, password, firstName, lastName);
            navigate('/login', { 
                state: { message: 'Account created successfully! Please log in.' }
            });
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to create account. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-modern-gray via-white to-hopeful-turquoise/10 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center py-12 px-4">
            <div className={styles.authContainer}>
                <div className="text-center mb-8">
                    <div className="mx-auto w-16 h-16 bg-gradient-to-r from-deep-ocean-blue to-hopeful-turquoise rounded-full flex items-center justify-center mb-4">
                        <UserPlus className="w-8 h-8 text-white" />
                    </div>
                    <h2 className={styles.title}>Create Your Account</h2>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">
                        Join ReelCV and showcase your skills with confidence
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {error && <div className={styles.error}>{error}</div>}
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="relative">
                            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input 
                                type="text" 
                                placeholder="First Name" 
                                value={firstName} 
                                onChange={(e) => setFirstName(e.target.value)} 
                                className={`${styles.input} pl-10`}
                                required 
                            />
                        </div>
                        <div className="relative">
                            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input 
                                type="text" 
                                placeholder="Last Name" 
                                value={lastName} 
                                onChange={(e) => setLastName(e.target.value)} 
                                className={`${styles.input} pl-10`}
                                required 
                            />
                        </div>
                    </div>

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
                            placeholder="Password (min. 6 characters)" 
                            value={password} 
                            onChange={(e) => setPassword(e.target.value)} 
                            className={`${styles.input} pl-10`}
                            required 
                            minLength="6"
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
                                Creating Account...
                            </>
                        ) : (
                            <>
                                <UserPlus className="w-5 h-5 mr-2" />
                                Create Account
                            </>
                        )}
                    </button>
                </form>

                <div className={styles.linkText}>
                    Already have an account? <Link to="/login" className={styles.link}>Sign In</Link>
                </div>

                <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                    <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                        By creating an account, you agree to our Terms of Service and Privacy Policy
                    </p>
                </div>
            </div>
        </div>
    );
};