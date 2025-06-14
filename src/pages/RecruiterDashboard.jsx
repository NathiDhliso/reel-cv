import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Filter, Users, Star, Eye, CheckCircle, Award } from 'lucide-react';
import { supabase } from '../supabaseClient';
import { useAuth } from '../contexts/AuthContext';
import { CandidateCard } from '../components/CandidateCard';
import styles from './RecruiterDashboard.module.css';

export const RecruiterDashboard = () => {
    const [assessments, setAssessments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [skillFilter, setSkillFilter] = useState('');
    const [availableSkills, setAvailableSkills] = useState([]);
    const { user } = useAuth();

    useEffect(() => {
        fetchVerifiedAssessments();
        fetchAvailableSkills();
    }, []);

    const fetchVerifiedAssessments = async () => {
        try {
            const { data, error } = await supabase
                .from('Assessment')
                .select(`
                    *,
                    Skill (
                        id,
                        name
                    ),
                    User!Assessment_candidateId_fkey (
                        id,
                        firstName,
                        lastName,
                        email
                    )
                `)
                .eq('status', 'proctor_verified')
                .order('created_at', { ascending: false });
            
            if (error) throw error;
            
            setAssessments(data || []);
        } catch (err) {
            console.error('Error fetching verified assessments:', err);
            setError('Failed to load verified candidates');
        } finally {
            setLoading(false);
        }
    };

    const fetchAvailableSkills = async () => {
        try {
            const { data, error } = await supabase
                .from('Skill')
                .select('id, name')
                .order('name');
            
            if (error) throw error;
            
            setAvailableSkills(data || []);
        } catch (err) {
            console.error('Error fetching skills:', err);
        }
    };

    // Group assessments by candidate and filter
    const getFilteredCandidates = () => {
        // Group assessments by candidate
        const candidateMap = new Map();
        
        assessments.forEach(assessment => {
            const candidateId = assessment.candidateId;
            if (!candidateMap.has(candidateId)) {
                candidateMap.set(candidateId, {
                    candidate: assessment.User,
                    assessments: []
                });
            }
            candidateMap.get(candidateId).assessments.push(assessment);
        });

        // Convert to array and apply filters
        let candidates = Array.from(candidateMap.values());

        // Apply search filter
        if (searchTerm) {
            candidates = candidates.filter(({ candidate }) => {
                const fullName = `${candidate.firstName} ${candidate.lastName}`.toLowerCase();
                return fullName.includes(searchTerm.toLowerCase());
            });
        }

        // Apply skill filter
        if (skillFilter) {
            candidates = candidates.filter(({ assessments }) => {
                return assessments.some(assessment => 
                    assessment.Skill.name.toLowerCase().includes(skillFilter.toLowerCase())
                );
            });
        }

        return candidates;
    };

    const filteredCandidates = getFilteredCandidates();

    // Calculate stats
    const totalCandidates = new Set(assessments.map(a => a.candidateId)).size;
    const totalAssessments = assessments.length;
    const averageRating = assessments.length > 0 
        ? (assessments.reduce((sum, a) => sum + (a.proctorRating || 0), 0) / assessments.length).toFixed(1)
        : 'N/A';
    const topSkills = [...new Set(assessments.map(a => a.Skill.name))].slice(0, 5);

    if (loading) {
        return (
            <div className={styles.loadingContainer}>
                <div className={styles.loadingSpinner}></div>
                <p className={styles.loadingText}>Loading verified talent pool...</p>
            </div>
        );
    }

    return (
        <div className={styles.dashboardContainer}>
            <div className={styles.dashboardHeader}>
                <div className={styles.headerContent}>
                    <h1 className={styles.dashboardTitle}>Verified Talent Pool</h1>
                    <div className={styles.recruiterBadge}>
                        <Award className="w-5 h-5 mr-2" />
                        Talent Recruiter
                    </div>
                </div>
                <p className={styles.dashboardSubtitle}>
                    Discover and connect with professionally verified candidates
                </p>
            </div>

            {error && (
                <div className={styles.errorMessage}>
                    {error}
                </div>
            )}

            {/* Stats Grid */}
            <div className={styles.statsGrid}>
                <div className={styles.statCard}>
                    <div className={styles.statIcon}>
                        <Users className="w-6 h-6 text-deep-ocean-blue" />
                    </div>
                    <div className={styles.statContent}>
                        <h3 className={styles.statTitle}>Verified Candidates</h3>
                        <p className={styles.statValue}>{totalCandidates}</p>
                    </div>
                </div>
                <div className={styles.statCard}>
                    <div className={styles.statIcon}>
                        <CheckCircle className="w-6 h-6 text-growth-green" />
                    </div>
                    <div className={styles.statContent}>
                        <h3 className={styles.statTitle}>Total Assessments</h3>
                        <p className={styles.statValue}>{totalAssessments}</p>
                    </div>
                </div>
                <div className={styles.statCard}>
                    <div className={styles.statIcon}>
                        <Star className="w-6 h-6 text-optimistic-yellow" />
                    </div>
                    <div className={styles.statContent}>
                        <h3 className={styles.statTitle}>Average Rating</h3>
                        <p className={styles.statValue}>{averageRating}</p>
                    </div>
                </div>
                <div className={styles.statCard}>
                    <div className={styles.statIcon}>
                        <Award className="w-6 h-6 text-innovation-purple" />
                    </div>
                    <div className={styles.statContent}>
                        <h3 className={styles.statTitle}>Skills Available</h3>
                        <p className={styles.statValue}>{availableSkills.length}</p>
                    </div>
                </div>
            </div>

            {/* Search and Filter Controls */}
            <div className={styles.controlsSection}>
                <div className={styles.searchContainer}>
                    <Search className="w-5 h-5 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search candidates by name..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className={styles.searchInput}
                    />
                </div>
                <div className={styles.filterContainer}>
                    <Filter className="w-5 h-5 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Filter by skill..."
                        value={skillFilter}
                        onChange={(e) => setSkillFilter(e.target.value)}
                        className={styles.filterInput}
                    />
                </div>
            </div>

            {/* Results Section */}
            <div className={styles.resultsSection}>
                <div className={styles.resultsHeader}>
                    <h2 className={styles.sectionTitle}>
                        Candidates ({filteredCandidates.length})
                    </h2>
                    {(searchTerm || skillFilter) && (
                        <button 
                            onClick={() => {
                                setSearchTerm('');
                                setSkillFilter('');
                            }}
                            className={styles.clearFiltersButton}
                        >
                            Clear Filters
                        </button>
                    )}
                </div>

                {filteredCandidates.length === 0 ? (
                    <div className={styles.emptyState}>
                        {searchTerm || skillFilter ? (
                            <>
                                <Search className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                                <h3 className={styles.emptyTitle}>No candidates match your criteria</h3>
                                <p className={styles.emptyDescription}>
                                    Try adjusting your search terms or filters to find more candidates.
                                </p>
                            </>
                        ) : (
                            <>
                                <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                                <h3 className={styles.emptyTitle}>No verified candidates yet</h3>
                                <p className={styles.emptyDescription}>
                                    Verified candidates will appear here once assessments are completed and approved.
                                </p>
                            </>
                        )}
                    </div>
                ) : (
                    <div className={styles.candidatesGrid}>
                        {filteredCandidates.map(({ candidate, assessments }) => (
                            <CandidateCard 
                                key={candidate.id}
                                candidate={candidate}
                                assessments={assessments}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};