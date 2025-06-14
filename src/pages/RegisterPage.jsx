import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { UserPlus, Mail, Lock, User, Video, Sparkles } from 'lucide-react';
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
                state: { message: 'Account created successfully! Welcome to the future of talent acquisition.' }
            });
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to create account. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.pageContainer}>
            <div className={styles.authContainer}>
                <div className={styles.brandHeader}>
                    <div className={styles.logoContainer}>
                        <Video className="w-10 h-10 text-deep-ocean-blue dark:text-hopeful-turquoise" />
                        <span className={styles.brandTitle}>ReelCV</span>
                    </div>
                    <h2 className={styles.title}>Join the Revolution</h2>
                    <p className={styles.subtitle}>
                        Create your account and experience the future of authentic skill showcasing
                    </p>
                </div>

                <form onSubmit={handleSubmit} className={styles.form}>
                    {error && <div className={styles.error}>{error}</div>}
                    
                    <div className={styles.nameGrid}>
                        <div className={styles.inputGroup}>
                            <User className={styles.inputIcon} />
                            <input 
                                type="text" 
                                placeholder="First Name" 
                                value={firstName} 
                                onChange={(e) => setFirstName(e.target.value)} 
                                className={styles.input}
                                required 
                            />
                        </div>
                        <div className={styles.inputGroup}>
                            <User className={styles.inputIcon} />
                            <input 
                                type="text" 
                                placeholder="Last Name" 
                                value={lastName} 
                                onChange={(e) => setLastName(e.target.value)} 
                                className={styles.input}
                                required 
                            />
                        </div>
                    </div>

                    <div className={styles.inputGroup}>
                        <Mail className={styles.inputIcon} />
                        <input 
                            type="email" 
                            placeholder="Email Address" 
                            value={email} 
                            onChange={(e) => setEmail(e.target.value)} 
                            className={styles.input}
                            required 
                        />
                    </div>

                    <div className={styles.inputGroup}>
                        <Lock className={styles.inputIcon} />
                        <input 
                            type="password" 
                            placeholder="Password (min. 6 characters)" 
                            value={password} 
                            onChange={(e) => setPassword(e.target.value)} 
                            className={styles.input}
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
                                <div className={styles.spinner}></div>
                                Creating Your Future...
                            </>
                        ) : (
                            <>
                                <Sparkles className="w-5 h-5 mr-2" />
                                Create Account
                            </>
                        )}
                    </button>
                </form>

                <div className={styles.linkSection}>
                    <p className={styles.linkText}>
                        Already part of the revolution? <Link to="/login" className={styles.link}>Sign In</Link>
                    </p>
                </div>

                <div className={styles.featuresSection}>
                    <div className={styles.featuresTitle}>What awaits you:</div>
                    <div className={styles.featuresList}>
                        <div className={styles.feature}>✨ AI-powered skill verification</div>
                        <div className={styles.feature}>🎯 Authentic talent showcasing</div>
                        <div className={styles.feature}>🚀 Revolutionary career growth</div>
                    </div>
                </div>
            </div>
        </div>
    );
};