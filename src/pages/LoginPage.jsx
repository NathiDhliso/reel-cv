import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { LogIn, Mail, Lock, CheckCircle, Video, Zap } from 'lucide-react';
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
        <div className={styles.pageContainer}>
            <div className={styles.authContainer}>
                <div className={styles.brandHeader}>
                    <div className={styles.logoContainer}>
                        <Video className="w-10 h-10 text-deep-ocean-blue dark:text-hopeful-turquoise" />
                        <span className={styles.brandTitle}>ReelCV</span>
                    </div>
                    <h2 className={styles.title}>Welcome Back</h2>
                    <p className={styles.subtitle}>
                        Continue your journey in revolutionizing talent acquisition
                    </p>
                </div>

                <form onSubmit={handleSubmit} className={styles.form}>
                    {successMessage && (
                        <div className={styles.successMessage}>
                            <CheckCircle className="w-5 h-5 mr-2" />
                            {successMessage}
                        </div>
                    )}
                    
                    {error && <div className={styles.error}>{error}</div>}
                    
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
                            placeholder="Password" 
                            value={password} 
                            onChange={(e) => setPassword(e.target.value)} 
                            className={styles.input}
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
                                <div className={styles.spinner}></div>
                                Authenticating...
                            </>
                        ) : (
                            <>
                                <Zap className="w-5 h-5 mr-2" />
                                Sign In
                            </>
                        )}
                    </button>
                </form>

                <div className={styles.linkSection}>
                    <p className={styles.linkText}>
                        New to ReelCV? <Link to="/register" className={styles.link}>Create Your Account</Link>
                    </p>
                </div>

                <div className={styles.demoSection}>
                    <div className={styles.demoTitle}>Demo Accounts</div>
                    <div className={styles.demoCredentials}>
                        <div className={styles.demoItem}>
                            <span className={styles.demoRole}>Candidate:</span>
                            <span className={styles.demoEmail}>candidate@demo.com</span>
                        </div>
                        <div className={styles.demoItem}>
                            <span className={styles.demoRole}>Proctor:</span>
                            <span className={styles.demoEmail}>proctor@demo.com</span>
                        </div>
                        <div className={styles.demoPassword}>Password: password</div>
                    </div>
                </div>
            </div>
        </div>
    );
};