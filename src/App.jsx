import React from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import { useTheme } from './contexts/ThemeContext';
import { useAuth } from './contexts/AuthContext';
import { SkillSubmitForm } from './components/SkillSubmitForm';
import { PrivateRoute } from './components/PrivateRoute';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { CandidateDashboard } from './pages/CandidateDashboard';
import { ProctorDashboard } from './pages/ProctorDashboard';
import { AssessmentDetail } from './pages/AssessmentDetail';
import styles from './App.module.css';

function App() {
  const { theme, toggleTheme } = useTheme();
  const { user, logout } = useAuth();

  return (
    <div className={styles.appContainer}>
      <header className={styles.header}>
        <div className={styles.headerContent}>
          {user && (
            <div className={styles.userSection}>
              <span className={styles.welcomeText}>
                Welcome, {user.firstName || user.email}!
              </span>
              <Link 
                to={user.role === 'proctor' ? "/proctor-dashboard" : "/dashboard"} 
                className={styles.navLink}
              >
                Dashboard
              </Link>
            </div>
          )}
          <div className={styles.buttonGroup}>
            {user ? (
              <button onClick={logout} className={styles.authButton}>
                Logout
              </button>
            ) : (
              <Link to="/login" className={styles.authButton}>
                Login
              </Link>
            )}
            <button onClick={toggleTheme} className={styles.themeToggleButton}>
              {theme === 'light' ? '🌙' : '☀️'}
            </button>
          </div>
        </div>
      </header>
      <main className={styles.mainContent}>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/" element={<PrivateRoute />}>
            <Route path="/" element={
              <div className={styles.welcomeContainer}>
                <h1 className={styles.welcomeTitle}>Welcome to ReelCV</h1>
                <p className={styles.welcomeSubtitle}>
                  Showcase your skills through video assessments with AI analysis and professional proctoring.
                </p>
                <Link 
                  to={user?.role === 'proctor' ? "/proctor-dashboard" : "/dashboard"} 
                  className={styles.ctaButton}
                >
                  Go to Dashboard
                </Link>
              </div>
            } />
            <Route path="/submit-skill" element={<SkillSubmitForm />} />
            <Route path="/dashboard" element={<CandidateDashboard />} />
            <Route path="/proctor-dashboard" element={<ProctorDashboard />} />
            <Route path="/assessment/:id" element={<AssessmentDetail />} />
          </Route>
        </Routes>
      </main>
    </div>
  );
}

export default App;