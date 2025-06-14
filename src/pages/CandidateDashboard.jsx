import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Video, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { supabase } from '../supabaseClient';
import { useAuth } from '../contexts/AuthContext';
import styles from './Dashboard.module.css';

export const CandidateDashboard = () => {
    const [assessments, setAssessments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const { user } = useAuth();

    useEffect(() => {
        if (user) {
            fetchAssessments();
        }
    }, [user]);

    const fetchAssessments = async () => {
        try {
            const { data, error } = await supabase
                .from('Assessment')
                .select(`
                    *,
                    Skill (
                        name
                    )
                `)
                .eq('candidateId', user.id)
                .order('created_at', { ascending: false });
            
            if (error) throw error;
            
            setAssessments(data || []);
        } catch (err) {
            console.error('Error fetching assessments:', err);
            setError('Failed to load assessments');
        } finally {
            setLoading(false);
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'pending_AI_analysis':
                return <Clock className="w-5 h-5 text-optimistic-yellow" />;
            case 'AI_rated':
                return <CheckCircle className="w-5 h-5 text-growth-green" />;
            case 'proctor_requested':
                return <AlertCircle className="w-5 h-5 text-innovation-purple" />;
            case 'proctor_verified':
                return <CheckCircle className="w-5 h-5 text-deep-ocean-blue" />;
            default:
                return <Clock className="w-5 h-5 text-gray-400" />;
        }
    };

    const getStatusText = (status) => {
        switch (status) {
            case 'pending_AI_analysis':
                return 'AI Analysis Pending';
            case 'AI_rated':
                return 'AI Analysis Complete';
            case 'proctor_requested':
                return 'Proctor Review Requested';
            case 'proctor_verified':
                return 'Proctor Verified';
            default:
                return status;
        }
    };

    if (loading) {
        return (
            <div className={styles.loadingContainer}>
                <div className={styles.loadingSpinner}></div>
                <p className={styles.loadingText}>Loading your assessments...</p>
            </div>
        );
    }

    return (
        <div className={styles.dashboardContainer}>
            <div className={styles.dashboardHeader}>
                <h1 className={styles.dashboardTitle}>My Assessment Dashboard</h1>
                <Link to="/submit-skill" className={styles.submitButton}>
                    <Plus className="w-5 h-5 mr-2" />
                    Submit New Skill
                </Link>
            </div>

            {error && (
                <div className={styles.errorMessage}>
                    {error}
                </div>
            )}

            <div className={styles.statsGrid}>
                <div className={styles.statCard}>
                    <h3 className={styles.statTitle}>Total Assessments</h3>
                    <p className={styles.statValue}>{assessments.length}</p>
                </div>
                <div className={styles.statCard}>
                    <h3 className={styles.statTitle}>AI Analyzed</h3>
                    <p className={styles.statValue}>
                        {assessments.filter(a => a.status !== 'pending_AI_analysis').length}
                    </p>
                </div>
                <div className={styles.statCard}>
                    <h3 className={styles.statTitle}>Proctor Verified</h3>
                    <p className={styles.statValue}>
                        {assessments.filter(a => a.status === 'proctor_verified').length}
                    </p>
                </div>
                <div className={styles.statCard}>
                    <h3 className={styles.statTitle}>Average AI Rating</h3>
                    <p className={styles.statValue}>
                        {assessments.filter(a => a.AI_rating).length > 0
                            ? (assessments.reduce((sum, a) => sum + (a.AI_rating || 0), 0) / 
                               assessments.filter(a => a.AI_rating).length).toFixed(1)
                            : 'N/A'
                        }
                    </p>
                </div>
            </div>

            <div className={styles.assessmentsSection}>
                <h2 className={styles.sectionTitle}>Your Assessments</h2>
                {assessments.length === 0 ? (
                    <div className={styles.emptyState}>
                        <Video className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <h3 className={styles.emptyTitle}>No assessments yet</h3>
                        <p className={styles.emptyDescription}>
                            Start by submitting your first skill assessment to showcase your abilities.
                        </p>
                        <Link to="/submit-skill" className={styles.emptyButton}>
                            Submit Your First Assessment
                        </Link>
                    </div>
                ) : (
                    <div className={styles.assessmentGrid}>
                        {assessments.map(assessment => (
                            <Link 
                                to={`/assessment/${assessment.id}`} 
                                key={assessment.id} 
                                className={styles.assessmentCard}
                            >
                                <div className={styles.assessmentHeader}>
                                    <h3 className={styles.assessmentTitle}>
                                        {assessment.Skill?.name || 'Unknown Skill'}
                                    </h3>
                                    <div className={styles.statusBadge}>
                                        {getStatusIcon(assessment.status)}
                                        <span className={styles.statusText}>
                                            {getStatusText(assessment.status)}
                                        </span>
                                    </div>
                                </div>
                                <div className={styles.assessmentDetails}>
                                    <div className={styles.ratingSection}>
                                        <span className={styles.ratingLabel}>AI Rating:</span>
                                        <span className={styles.ratingValue}>
                                            {assessment.AI_rating ? `${assessment.AI_rating}/5.0` : 'Pending'}
                                        </span>
                                    </div>
                                    {assessment.proctorRating && (
                                        <div className={styles.ratingSection}>
                                            <span className={styles.ratingLabel}>Proctor Rating:</span>
                                            <span className={styles.ratingValue}>
                                                {assessment.proctorRating}/5.0
                                            </span>
                                        </div>
                                    )}
                                    <div className={styles.submissionDate}>
                                        Submitted: {new Date(assessment.created_at).toLocaleDateString()}
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};