import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Upload, Video, CheckCircle } from 'lucide-react';
import styles from './SkillSubmitForm.module.css';

const API_URL = '/api';

export const SkillSubmitForm = () => {
    const [file, setFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [message, setMessage] = useState('');
    const [skills, setSkills] = useState([]);
    const [selectedSkill, setSelectedSkill] = useState('');
    const [loadingSkills, setLoadingSkills] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        fetchSkills();
    }, []);

    const fetchSkills = async () => {
        try {
            const response = await axios.get(`${API_URL}/skills`);
            setSkills(response.data);
            if (response.data.length > 0) {
                setSelectedSkill(response.data[0].id);
            }
        } catch (error) {
            setMessage('Failed to load skills. Please try again.');
        } finally {
            setLoadingSkills(false);
        }
    };

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        setFile(selectedFile);
        if (selectedFile) {
            setMessage(`Selected: ${selectedFile.name}`);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!file) {
            setMessage('Please select a video file to showcase your skill.');
            return;
        }
        if (!selectedSkill) {
            setMessage('Please select a skill to assess.');
            return;
        }

        setUploading(true);
        setMessage('Preparing secure upload...');
        
        try {
            // Get signed URL for upload
            const { data: { signedUrl, publicUrl } } = await axios.post(`${API_URL}/get-signed-url`, {
                fileName: file.name,
                fileType: file.type,
            });

            setMessage('Uploading video...');
            
            // Upload file to S3
            await axios.put(signedUrl, file, { 
                headers: { 'Content-Type': file.type } 
            });

            setMessage('Finalizing submission...');
            
            // Submit assessment
            const { data: assessment } = await axios.post(`${API_URL}/skills/submit`, {
                skillId: selectedSkill,
                videoUrl: publicUrl,
            });

            setMessage('Success! Assessment submitted. AI analysis is now in progress...');
            
            // Redirect to assessment detail after a short delay
            setTimeout(() => {
                navigate(`/assessment/${assessment.id}`);
            }, 2000);
            
        } catch (error) {
            console.error('Upload error:', error);
            setMessage('Upload failed. Please check your connection and try again.');
        } finally {
            setUploading(false);
        }
    };

    if (loadingSkills) {
        return (
            <div className={styles.loadingContainer}>
                <div className={styles.loadingSpinner}></div>
                <p className={styles.loadingText}>Loading skills...</p>
            </div>
        );
    }

    return (
        <div className={styles.formContainer}>
            <div className={styles.formHeader}>
                <Video className="w-8 h-8 text-deep-ocean-blue dark:text-hopeful-turquoise mb-4" />
                <h2 className={styles.title}>
                    Showcase Your Skill
                </h2>
                <p className={styles.subtitle}>
                    Upload a short video demonstrating your abilities. Our AI will analyze your performance 
                    and provide detailed feedback.
                </p>
            </div>

            <form onSubmit={handleSubmit} className={styles.form}>
                <div className={styles.formGroup}>
                    <label htmlFor="skill" className={styles.label}>
                        Select Skill to Assess
                    </label>
                    <select
                        id="skill"
                        value={selectedSkill}
                        onChange={(e) => setSelectedSkill(e.target.value)}
                        className={styles.skillSelect}
                        required
                    >
                        <option value="">Choose a skill...</option>
                        {skills.map(skill => (
                            <option key={skill.id} value={skill.id}>
                                {skill.name}
                            </option>
                        ))}
                    </select>
                    {skills.length === 0 && (
                        <p className={styles.noSkillsMessage}>
                            No skills available. Please contact an administrator.
                        </p>
                    )}
                </div>

                <div className={styles.formGroup}>
                    <label htmlFor="video" className={styles.label}>
                        Upload Video Assessment
                    </label>
                    <div className={styles.fileInputContainer}>
                        <input 
                            type="file" 
                            id="video" 
                            accept="video/*" 
                            onChange={handleFileChange} 
                            className={styles.fileInput}
                            required
                        />
                        <div className={styles.fileInputLabel}>
                            <Upload className="w-6 h-6 mb-2" />
                            <span className={styles.fileInputText}>
                                {file ? file.name : 'Choose video file or drag and drop'}
                            </span>
                            <span className={styles.fileInputSubtext}>
                                MP4, MOV, AVI up to 100MB
                            </span>
                        </div>
                    </div>
                </div>

                <button 
                    type="submit" 
                    disabled={uploading || !selectedSkill || skills.length === 0} 
                    className={styles.submitButton}
                >
                    {uploading ? (
                        <>
                            <div className={styles.buttonSpinner}></div>
                            Processing...
                        </>
                    ) : (
                        <>
                            <CheckCircle className="w-5 h-5 mr-2" />
                            Submit for AI Analysis
                        </>
                    )}
                </button>
            </form>

            {message && (
                <div className={`${styles.feedbackMessage} ${
                    message.includes('Success') ? styles.successMessage : 
                    message.includes('failed') || message.includes('Failed') ? styles.errorMessage : 
                    styles.infoMessage
                }`}>
                    {message}
                </div>
            )}

            <div className={styles.infoSection}>
                <h3 className={styles.infoTitle}>What happens next?</h3>
                <div className={styles.processSteps}>
                    <div className={styles.step}>
                        <div className={styles.stepNumber}>1</div>
                        <div className={styles.stepContent}>
                            <h4 className={styles.stepTitle}>AI Analysis</h4>
                            <p className={styles.stepDescription}>
                                Our AI analyzes your video for communication skills, confidence, and technical competency.
                            </p>
                        </div>
                    </div>
                    <div className={styles.step}>
                        <div className={styles.stepNumber}>2</div>
                        <div className={styles.stepContent}>
                            <h4 className={styles.stepTitle}>Instant Feedback</h4>
                            <p className={styles.stepDescription}>
                                Receive detailed feedback and a rating within minutes of submission.
                            </p>
                        </div>
                    </div>
                    <div className={styles.step}>
                        <div className={styles.stepNumber}>3</div>
                        <div className={styles.stepContent}>
                            <h4 className={styles.stepTitle}>Professional Verification</h4>
                            <p className={styles.stepDescription}>
                                Optionally request human proctor verification for enhanced credibility.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};