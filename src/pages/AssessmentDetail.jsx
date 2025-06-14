import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { ArrowLeft, Play, Star, Eye, CheckCircle, AlertTriangle, Shield } from 'lucide-react';
import { supabase } from '../supabaseClient';
import styles from './AssessmentDetail.module.css';

export const AssessmentDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [assessment, setAssessment] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [submitting, setSubmitting] = useState(false);
    
    // Proctor verification form state
    const [proctorRating, setProctorRating] = useState('');
    const [proctorComments, setProctorComments] = useState('');
    const [integrityStatus, setIntegrityStatus] = useState('clear');

    useEffect(() => {
        fetchAssessment();
    }, [id]);

    const fetchAssessment = async () => {
        try {
            const { data, error } = await supabase
                .from('Assessment')
                .select(`
                    *,
                    Skill (
                        name
                    ),
                    User!Assessment_candidateId_fkey (
                        firstName,
                        lastName
                    )
                `)
                .eq('id', id)
                .single();
            
            if (error) throw error;
            
            // Check access permissions
            if (user.role === 'candidate' && data.candidateId !== user.id) {
                setError('Access denied');
                return;
            }
            
            setAssessment(data);
        } catch (err) {
            console.error('Error fetching assessment:', err);
            setError('Failed to load assessment details');
        } finally {
            setLoading(false);
        }
    };

    const handleRequestProctoring = async () => {
        setSubmitting(true);
        try {
            const { error } = await supabase
                .from('Assessment')
                .update({ status: 'proctor_requested' })
                .eq('id', id)
                .eq('candidateId', user.id);
            
            if (error) throw error;
            
            setAssessment(prev => ({ ...prev, status: 'proctor_requested' }));
        } catch (err) {
            console.error('Error requesting proctor:', err);
            setError('Failed to request proctor verification');
        } finally {
            setSubmitting(false);
        }
    };

    const handleProctorVerification = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const { error } = await supabase
                .from('Assessment')
                .update({
                    status: 'proctor_verified',
                    proctorId: user.id,
                    proctorRating: parseFloat(proctorRating),
                    proctorComments,
                    integrityStatus
                })
                .eq('id', id);
            
            if (error) throw error;
            
            await fetchAssessment(); // Refresh the data
        } catch (err) {
            console.error('Error submitting verification:', err);
            setError('Failed to submit verification');
        } finally {
            setSubmitting(false);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'pending_AI_analysis':
                return 'text-optimistic-yellow';
            case 'AI_rated':
                return 'text-growth-green';
            case 'proctor_requested':
                return 'text-innovation-purple';
            case 'proctor_verified':
                return 'text-deep-ocean-blue';
            default:
                return 'text-gray-500';
        }
    };

    const getIntegrityColor = (status) => {
        switch (status) {
            case 'clear':
                return 'text-growth-green bg-growth-green/10';
            case 'minor_flags_reviewed':
                return 'text-optimistic-yellow bg-optimistic-yellow/10';
            case 'major_flags':
                return 'text-red-600 bg-red-100 dark:bg-red-900/20';
            default:
                return 'text-gray-500 bg-gray-100 dark:bg-gray-800';
        }
    };

    if (loading) {
        return (
            <div className={styles.loadingContainer}>
                <div className={styles.loadingSpinner}></div>
                <p className={styles.loadingText}>Loading assessment details...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className={styles.errorContainer}>
                <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                <h2 className={styles.errorTitle}>Error Loading Assessment</h2>
                <p className={styles.errorMessage}>{error}</p>
                <button onClick={() => navigate(-1)} className={styles.backButton}>
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Go Back
                </button>
            </div>
        );
    }

    if (!assessment) {
        return (
            <div className={styles.errorContainer}>
                <h2 className={styles.errorTitle}>Assessment Not Found</h2>
                <button onClick={() => navigate(-1)} className={styles.backButton}>
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Go Back
                </button>
            </div>
        );
    }

    return (
        <div className={styles.detailContainer}>
            <div className={styles.detailHeader}>
                <button onClick={() => navigate(-1)} className={styles.backButton}>
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Dashboard
                </button>
                <div className={styles.headerInfo}>
                    <h1 className={styles.detailTitle}>
                        {assessment.Skill?.name || 'Unknown Skill'} Assessment
                    </h1>
                    <div className={`${styles.statusBadge} ${getStatusColor(assessment.status)}`}>
                        {assessment.status.replace(/_/g, ' ').toUpperCase()}
                    </div>
                </div>
            </div>

            <div className={styles.contentGrid}>
                {/* Video Section */}
                <div className={styles.videoSection}>
                    <h2 className={styles.sectionTitle}>
                        <Play className="w-5 h-5 mr-2" />
                        Assessment Video
                    </h2>
                    {assessment.videoUrl ? (
                        <div className={styles.videoContainer}>
                            <video 
                                controls 
                                className={styles.videoPlayer}
                                poster="/api/placeholder/640/360"
                            >
                                <source src={assessment.videoUrl} type="video/mp4" />
                                Your browser does not support the video tag.
                            </video>
                        </div>
                    ) : (
                        <div className={styles.noVideo}>
                            <Play className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                            <p>No video available</p>
                        </div>
                    )}
                </div>

                {/* AI Analysis Section */}
                <div className={styles.analysisSection}>
                    <h2 className={styles.sectionTitle}>
                        <Star className="w-5 h-5 mr-2" />
                        AI Analysis
                    </h2>
                    <div className={styles.analysisCard}>
                        <div className={styles.ratingDisplay}>
                            <span className={styles.ratingLabel}>AI Rating</span>
                            <span className={styles.ratingValue}>
                                {assessment.AI_rating ? `${assessment.AI_rating}/5.0` : 'Pending'}
                            </span>
                        </div>
                        <div className={styles.feedbackSection}>
                            <h4 className={styles.feedbackTitle}>AI Feedback</h4>
                            <p className={styles.feedbackText}>
                                {assessment.AI_feedback || 'AI analysis is still in progress...'}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Proctor Section */}
                <div className={styles.proctorSection}>
                    <h2 className={styles.sectionTitle}>
                        <Eye className="w-5 h-5 mr-2" />
                        Professional Verification
                    </h2>

                    {assessment.status === 'AI_rated' && user.role === 'candidate' && (
                        <div className={styles.requestSection}>
                            <p className={styles.requestDescription}>
                                Your assessment has been analyzed by AI. Request professional proctor verification 
                                for enhanced credibility and detailed feedback.
                            </p>
                            <button 
                                onClick={handleRequestProctoring}
                                disabled={submitting}
                                className={styles.requestButton}
                            >
                                {submitting ? 'Requesting...' : 'Request Proctor Verification'}
                            </button>
                        </div>
                    )}

                    {assessment.status === 'proctor_requested' && user.role === 'candidate' && (
                        <div className={styles.pendingSection}>
                            <CheckCircle className="w-8 h-8 text-innovation-purple mx-auto mb-4" />
                            <h3 className={styles.pendingTitle}>Proctor Verification Requested</h3>
                            <p className={styles.pendingDescription}>
                                Your assessment is in the queue for professional review. 
                                You'll be notified once verification is complete.
                            </p>
                        </div>
                    )}

                    {assessment.status === 'proctor_requested' && user.role === 'proctor' && (
                        <form onSubmit={handleProctorVerification} className={styles.verificationForm}>
                            <div className={styles.formGroup}>
                                <label className={styles.formLabel}>Proctor Rating (1-5)</label>
                                <input
                                    type="number"
                                    min="1"
                                    max="5"
                                    step="0.1"
                                    value={proctorRating}
                                    onChange={(e) => setProctorRating(e.target.value)}
                                    className={styles.formInput}
                                    required
                                />
                            </div>
                            <div className={styles.formGroup}>
                                <label className={styles.formLabel}>Integrity Assessment</label>
                                <select
                                    value={integrityStatus}
                                    onChange={(e) => setIntegrityStatus(e.target.value)}
                                    className={styles.formSelect}
                                    required
                                >
                                    <option value="clear">Clear - No integrity concerns</option>
                                    <option value="minor_flags_reviewed">Minor flags reviewed and addressed</option>
                                    <option value="major_flags">Major integrity concerns identified</option>
                                </select>
                            </div>
                            <div className={styles.formGroup}>
                                <label className={styles.formLabel}>Proctor Comments</label>
                                <textarea
                                    value={proctorComments}
                                    onChange={(e) => setProctorComments(e.target.value)}
                                    className={styles.formTextarea}
                                    rows="4"
                                    placeholder="Provide detailed feedback on the candidate's performance..."
                                    required
                                />
                            </div>
                            <button 
                                type="submit" 
                                disabled={submitting}
                                className={styles.submitButton}
                            >
                                {submitting ? 'Submitting...' : 'Submit Verification'}
                            </button>
                        </form>
                    )}

                    {assessment.status === 'proctor_verified' && (
                        <div className={styles.verifiedSection}>
                            <div className={styles.verifiedHeader}>
                                <Shield className="w-8 h-8 text-deep-ocean-blue mx-auto mb-4" />
                                <h3 className={styles.verifiedTitle}>Professionally Verified</h3>
                            </div>
                            <div className={styles.verificationResults}>
                                <div className={styles.ratingDisplay}>
                                    <span className={styles.ratingLabel}>Proctor Rating</span>
                                    <span className={styles.ratingValue}>
                                        {assessment.proctorRating}/5.0
                                    </span>
                                </div>
                                <div className={styles.integrityBadge}>
                                    <span className={`${styles.integrityStatus} ${getIntegrityColor(assessment.integrityStatus)}`}>
                                        Integrity: {assessment.integrityStatus?.replace(/_/g, ' ').toUpperCase()}
                                    </span>
                                </div>
                                <div className={styles.proctorFeedback}>
                                    <h4 className={styles.feedbackTitle}>Proctor Comments</h4>
                                    <p className={styles.feedbackText}>
                                        {assessment.proctorComments}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Candidate Info (for proctors) */}
                {user.role === 'proctor' && assessment.User && (
                    <div className={styles.candidateSection}>
                        <h2 className={styles.sectionTitle}>Candidate Information</h2>
                        <div className={styles.candidateCard}>
                            <p><strong>Name:</strong> {assessment.User.firstName} {assessment.User.lastName}</p>
                            <p><strong>Submitted:</strong> {new Date(assessment.created_at).toLocaleString()}</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};