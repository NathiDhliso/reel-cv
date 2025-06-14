import React from 'react';
import { Routes, Route, Link, Navigate } from 'react-router-dom';
import { useTheme } from './contexts/ThemeContext';
import { useAuth } from './contexts/AuthContext';
import { SkillSubmitForm } from './components/SkillSubmitForm';
import { PrivateRoute } from './components/PrivateRoute';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { CandidateDashboard } from './pages/CandidateDashboard';
import { ProctorDashboard } from './pages/ProctorDashboard';
import { RecruiterDashboard } from './pages/RecruiterDashboard';
import { AssessmentDetail } from './pages/AssessmentDetail';
import { Video, Zap, Shield, Users } from 'lucide-react';
import styles from './App.module.css';

function App() {
  const { theme, toggleTheme } = useTheme();
  const { user, logout, loading } = useAuth();

  // Show loading state while checking auth
  if (loading) {
    return (
      <div className={styles.appContainer}>
        <div className="min-h-screen flex items-center justify-center">
          <div className="flex flex-col items-center space-y-4">
            <div className="w-16 h-16 border-4 border-deep-ocean-blue border-t-transparent rounded-full animate-spin"></div>
            <div className="text-xl text-gray-600 dark:text-gray-400">Loading ReelCV...</div>
          </div>
        </div>
      </div>
    );
  }

  // Determine dashboard route based on user role
  const getDashboardRoute = () => {
    if (!user) return '/dashboard';
    switch (user.role) {
      case 'proctor':
        return '/proctor-dashboard';
      case 'recruiter':
        return '/recruiter-dashboard';
      default:
        return '/dashboard';
    }
  };

  return (
    <div className={styles.appContainer}>
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <div className={styles.brandSection}>
            <div className={styles.logo}>
              <Video className="w-8 h-8 text-deep-ocean-blue dark:text-hopeful-turquoise" />
              <span className={styles.brandName}>ReelCV</span>
            </div>
            <div className={styles.tagline}>
              Revolutionizing Talent Acquisition
            </div>
          </div>
          
          {user && (
            <div className={styles.userSection}>
              <span className={styles.welcomeText}>
                Welcome, {user.firstName || user.email}!
              </span>
              <Link 
                to={getDashboardRoute()} 
                className={styles.navLink}
              >
                {user.role === 'proctor' ? (
                  <Shield className="w-4 h-4 mr-1" />
                ) : user.role === 'recruiter' ? (
                  <Users className="w-4 h-4 mr-1" />
                ) : (
                  <Shield className="w-4 h-4 mr-1" />
                )}
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
                <Zap className="w-4 h-4 mr-2" />
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
          
          <Route path="/dashboard" element={
            <PrivateRoute>
              <CandidateDashboard />
            </PrivateRoute>
          } />
          
          <Route path="/proctor-dashboard" element={
            <PrivateRoute requiredRole="proctor">
              <ProctorDashboard />
            </PrivateRoute>
          } />
          
          <Route path="/recruiter-dashboard" element={
            <PrivateRoute requiredRole="recruiter">
              <RecruiterDashboard />
            </PrivateRoute>
          } />
          
          <Route path="/assessment/:id" element={
            <PrivateRoute>
              <AssessmentDetail />
            </PrivateRoute>
          } />
          
          <Route path="/submit-skill" element={
            <PrivateRoute>
              <SkillSubmitForm />
            </PrivateRoute>
          } />
          
          {/* Root route - now goes to appropriate dashboard based on role */}
          <Route path="/" element={<Navigate to={getDashboardRoute()} replace />} />
          
          {/* Catch-all route - now goes to appropriate dashboard based on role */}
          <Route path="*" element={<Navigate to={getDashboardRoute()} replace />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;