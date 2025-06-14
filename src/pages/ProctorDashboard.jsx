import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { Eye, CheckCircle, Clock, Users } from 'lucide-react';
import styles from './Dashboard.module.css';

export const ProctorDashboard = () => {
    const [pendingRequests, setPendingRequests] = useState([]);
    const [completedVerifications, setCompletedVerifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [activeTab, setActiveTab] = useState('pending');

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [pendingResponse, completedResponse] = await Promise.all([
                axios.get('/api/proctor/requests/pending'),
                axios.get('/api/proctor/verifications')
            ]);
            setPendingRequests(pendingResponse.data);
            setCompletedVerifications(completedResponse.data);
        } catch (err) {
            setError('Failed to load proctor data');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className={styles.loadingContainer}>
                <div className={styles.loadingSpinner}></div>
                <p className={styles.loadingText}>Loading proctor dashboard...</p>
            </div>
        );
    }

    return (
        <div className={styles.dashboardContainer}>
            <div className={styles.dashboardHeader}>
                <h1 className={styles.dashboardTitle}>Proctor Dashboard</h1>
                <div className={styles.proctorBadge}>
                    <Eye className="w-5 h-5 mr-2" />
                    Professional Proctor
                </div>
            </div>

            {error && (
                <div className={styles.errorMessage}>
                    {error}
                </div>
            )}

            <div className={styles.statsGrid}>
                <div className={styles.statCard}>
                    <h3 className={styles.statTitle}>Pending Reviews</h3>
                    <p className={styles.statValue}>{pendingRequests.length}</p>
                </div>
                <div className={styles.statCard}>
                    <h3 className={styles.statTitle}>Completed Verifications</h3>
                    <p className={styles.statValue}>{completedVerifications.length}</p>
                </div>
                <div className={styles.statCard}>
                    <h3 className={styles.statTitle}>Average Rating Given</h3>
                    <p className={styles.statValue}>
                        {completedVerifications.length > 0
                            ? (completedVerifications.reduce((sum, v) => sum + (v.proctorRating || 0), 0) / 
                               completedVerifications.length).toFixed(1)
                            : 'N/A'
                        }
                    </p>
                </div>
                <div className={styles.statCard}>
                    <h3 className={styles.statTitle}>Candidates Helped</h3>
                    <p className={styles.statValue}>
                        {new Set(completedVerifications.map(v => v.candidateId)).size}
                    </p>
                </div>
            </div>

            <div className={styles.tabContainer}>
                <div className={styles.tabButtons}>
                    <button 
                        className={`${styles.tabButton} ${activeTab === 'pending' ? styles.activeTab : ''}`}
                        onClick={() => setActiveTab('pending')}
                    >
                        <Clock className="w-4 h-4 mr-2" />
                        Pending Reviews ({pendingRequests.length})
                    </button>
                    <button 
                        className={`${styles.tabButton} ${activeTab === 'completed' ? styles.activeTab : ''}`}
                        onClick={() => setActiveTab('completed')}
                    >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Completed ({completedVerifications.length})
                    </button>
                </div>

                <div className={styles.tabContent}>
                    {activeTab === 'pending' && (
                        <div className={styles.assessmentsSection}>
                            {pendingRequests.length === 0 ? (
                                <div className={styles.emptyState}>
                                    <Clock className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                                    <h3 className={styles.emptyTitle}>No pending reviews</h3>
                                    <p className={styles.emptyDescription}>
                                        All caught up! New assessment requests will appear here.
                                    </p>
                                </div>
                            ) : (
                                <div className={styles.assessmentGrid}>
                                    {pendingRequests.map(assessment => (
                                        <Link 
                                            to={`/assessment/${assessment.id}`} 
                                            key={assessment.id} 
                                            className={styles.assessmentCard}
                                        >
                                            <div className={styles.assessmentHeader}>
                                                <h3 className={styles.assessmentTitle}>
                                                    {assessment.Skill?.name || 'Unknown Skill'}
                                                </h3>
                                                <div className={styles.urgentBadge}>
                                                    <Clock className="w-4 h-4 mr-1" />
                                                    Review Needed
                                                </div>
                                            </div>
                                            <div className={styles.assessmentDetails}>
                                                <div className={styles.candidateInfo}>
                                                    <Users className="w-4 h-4 mr-2" />
                                                    {assessment.User?.firstName} {assessment.User?.lastName}
                                                </div>
                                                <div className={styles.ratingSection}>
                                                    <span className={styles.ratingLabel}>AI Rating:</span>
                                                    <span className={styles.ratingValue}>
                                                        {assessment.AI_rating}/5.0
                                                    </span>
                                                </div>
                                                <div className={styles.submissionDate}>
                                                    Submitted: {new Date(assessment.created_at).toLocaleDateString()}
                                                </div>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'completed' && (
                        <div className={styles.assessmentsSection}>
                            {completedVerifications.length === 0 ? (
                                <div className={styles.emptyState}>
                                    <CheckCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                                    <h3 className={styles.emptyTitle}>No completed verifications</h3>
                                    <p className={styles.emptyDescription}>
                                        Your completed assessment verifications will appear here.
                                    </p>
                                </div>
                            ) : (
                                <div className={styles.assessmentGrid}>
                                    {completedVerifications.map(assessment => (
                                        <Link 
                                            to={`/assessment/${assessment.id}`} 
                                            key={assessment.id} 
                                            className={styles.assessmentCard}
                                        >
                                            <div className={styles.assessmentHeader}>
                                                <h3 className={styles.assessmentTitle}>
                                                    {assessment.Skill?.name || 'Unknown Skill'}
                                                </h3>
                                                <div className={styles.completedBadge}>
                                                    <CheckCircle className="w-4 h-4 mr-1" />
                                                    Verified
                                                </div>
                                            </div>
                                            <div className={styles.assessmentDetails}>
                                                <div className={styles.candidateInfo}>
                                                    <Users className="w-4 h-4 mr-2" />
                                                    {assessment.User?.firstName} {assessment.User?.lastName}
                                                </div>
                                                <div className={styles.ratingSection}>
                                                    <span className={styles.ratingLabel}>Your Rating:</span>
                                                    <span className={styles.ratingValue}>
                                                        {assessment.proctorRating}/5.0
                                                    </span>
                                                </div>
                                                <div className={styles.submissionDate}>
                                                    Verified: {new Date(assessment.created_at).toLocaleDateString()}
                                                </div>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};