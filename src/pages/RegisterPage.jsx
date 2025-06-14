import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
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
        <div className={styles.authContainer}>
            <h2 className={styles.title}>Create Your Account</h2>
            <form onSubmit={handleSubmit}>
                {error && <p className={styles.error}>{error}</p>}
                <input 
                    type="text" 
                    placeholder="First Name" 
                    value={firstName} 
                    onChange={(e) => setFirstName(e.target.value)} 
                    className={styles.input} 
                    required 
                />
                <input 
                    type="text" 
                    placeholder="Last Name" 
                    value={lastName} 
                    onChange={(e) => setLastName(e.target.value)} 
                    className={styles.input} 
                    required 
                />
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
                    minLength="6"
                />
                <button 
                    type="submit" 
                    disabled={loading}
                    className={styles.submitButton}
                >
                    {loading ? 'Creating Account...' : 'Register'}
                </button>
            </form>
            <p className={styles.linkText}>
                Already have an account? <Link to="/login" className={styles.link}>Log In</Link>
            </p>
        </div>
    );
};