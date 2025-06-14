import React from 'react';
import { Link } from 'react-router-dom';
import { User, Star, Award, Eye, CheckCircle } from 'lucide-react';
import styles from './CandidateCard.module.css';

export const CandidateCard = ({ candidate, assessments }) => {
    // Calculate candidate stats
    const totalAssessments = assessments.length;
    const averageRating = assessments.length > 0 
        ? (assessments.reduce((sum, a) => sum + (a.proctorRating || 0), 0) / assessments.length).toFixed(1)
        : 'N/A';
    const topSkills = assessments.map(a => a.Skill.name).slice(0, 3);
    const highestRatedAssessment = assessments.reduce((highest, current) => 
        (current.proctorRating || 0) > (highest.proctorRating || 0) ? current : highest
    , assessments[0]);

    return (
        <div className={styles.candidateCard}>
            <div className={styles.candidateHeader}>
                <div className={styles.candidateAvatar}>
                    <User className="w-8 h-8 text-deep-ocean-blue dark:text-hopeful-turquoise" />
                </div>
                <div className={styles.candidateInfo}>
                    <h3 className={styles.candidateName}>
                        {candidate.firstName} {candidate.lastName}
                    </h3>
                    <p className={styles.candidateEmail}>{candidate.email}</p>
                </div>
                <div className={styles.verifiedBadge}>
                    <CheckCircle className="w-5 h-5 text-growth-green" />
                </div>
            </div>

            <div className={styles.candidateStats}>
                <div className={styles.statItem}>
                    <Award className="w-4 h-4 text-innovation-purple" />
                    <span className={styles.statLabel}>Assessments:</span>
                    <span className={styles.statValue}>{totalAssessments}</span>
                </div>
                <div className={styles.statItem}>
                    <Star className="w-4 h-4 text-optimistic-yellow" />
                    <span className={styles.statLabel}>Avg Rating:</span>
                    <span className={styles.statValue}>{averageRating}/5.0</span>
                </div>
            </div>

            <div className={styles.skillsSection}>
                <h4 className={styles.skillsTitle}>Verified Skills</h4>
                <div className={styles.skillsList}>
                    {topSkills.map((skill, index) => (
                        <span key={index} className={styles.skillTag}>
                            {skill}
                        </span>
                    ))}
                    {totalAssessments > 3 && (
                        <span className={styles.moreSkills}>
                            +{totalAssessments - 3} more
                        </span>
                    )}
                </div>
            </div>

            {highestRatedAssessment && (
                <div className={styles.highlightSection}>
                    <h4 className={styles.highlightTitle}>Top Performance</h4>
                    <div className={styles.highlightContent}>
                        <span className={styles.highlightSkill}>
                            {highestRatedAssessment.Skill.name}
                        </span>
                        <span className={styles.highlightRating}>
                            {highestRatedAssessment.proctorRating}/5.0
                        </span>
                    </div>
                </div>
            )}

            <div className={styles.candidateActions}>
                <Link 
                    to={`/assessment/${highestRatedAssessment.id}`}
                    className={styles.viewProfileButton}
                >
                    <Eye className="w-4 h-4 mr-2" />
                    View Profile
                </Link>
            </div>
        </div>
    );
};