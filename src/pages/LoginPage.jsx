import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import styles from './AuthPage.module.css';

export const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

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
        <div className={styles.authContainer}>
            <h2 className={styles.title}>Welcome Back</h2>
            <form onSubmit={handleSubmit}>
                {error && <p className={styles.error}>{error}</p>}
                <input 
                    type="email" 
                    placeholder="Email" 
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)} 
                    className={styles.input} 
                    required 
                />
                <input 
                    type="password" 
                    placeholder="Password" 
                    value={password} 
                    onChange={(e) => setPassword(e.target.value)} 
                    className={styles.input} 
                    required 
                />
                <button 
                    type="submit" 
                    disabled={loading}
                    className={styles.submitButton}
                >
                    {loading ? 'Logging in...' : 'Log In'}
                </button>
            </form>
            <p className={styles.linkText}>
                Don't have an account? <Link to="/register" className={styles.link}>Sign Up</Link>
            </p>
        </div>
    );
};