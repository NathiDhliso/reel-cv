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
import { AssessmentDetail } from './pages/AssessmentDetail';
import styles from './App.module.css';

function App() {
  const { theme, toggleTheme } = useTheme();
  const { user, logout, loading } = useAuth();

  // Show loading state while checking auth
  if (loading) {
    return (
      <div className={styles.appContainer}>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-xl text-gray-600 dark:text-gray-400">Loading...</div>
        </div>
      </div>
    );
  }

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
          <Route path="/login" element={
            user ? (
              <Navigate to={user.role === 'proctor' ? "/proctor-dashboard" : "/dashboard"} replace />
            ) : (
              <LoginPage />
            )
          } />
          <Route path="/register" element={
            user ? (
              <Navigate to={user.role === 'proctor' ? "/proctor-dashboard" : "/dashboard"} replace />
            ) : (
              <RegisterPage />
            )
          } />
          
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
          
          {/* Root route */}
          <Route path="/" element={
            user ? (
              <Navigate to={user.role === 'proctor' ? "/proctor-dashboard" : "/dashboard"} replace />
            ) : (
              <Navigate to="/login" replace />
            )
          } />
          
          {/* Catch-all route */}
          <Route path="*" element={
            user ? (
              <Navigate to={user.role === 'proctor' ? "/proctor-dashboard" : "/dashboard"} replace />
            ) : (
              <Navigate to="/login" replace />
            )
          } />
        </Routes>
      </main>
    </div>
  );
}

export default App;