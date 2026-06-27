import React, { useState } from 'react';
import { Mail, Lock, User, Calendar, Clock, BookOpen, ShieldAlert, ArrowRight, GraduationCap, Sparkles, Loader2, Check } from 'lucide-react';

const EXAMS = [
  { id: 'JEE', name: 'JEE (Main & Advanced)', category: 'Engineering', desc: 'Physics, Chemistry, & Mathematics focus' },
  { id: 'NEET', name: 'NEET (UG)', category: 'Medical', desc: 'Biology, Physics, & Chemistry recall' },
  { id: 'UPSC', name: 'UPSC Civil Services', category: 'Government', desc: 'General Studies & Syllabus marathon' },
  { id: 'CAT', name: 'CAT', category: 'Management', desc: 'Quantitative, Verbal, & Logical analysis' },
  { id: 'GATE', name: 'GATE', category: 'Post-Grad Engineering', desc: 'Technical specialization & Concepts' },
  { id: 'BOARDS', name: 'High School Boards', category: 'School Boards', desc: 'Curriculum mastery & Subjective writing' }
];

export default function Auth({ onAuthSuccess }) {
  const [activeTab, setActiveTab] = useState('signin'); // signin, signup
  const [error, setError] = useState('');
  const [statusMessage, setStatusMessage] = useState('');

  // Sign In inputs
  const [signInEmail, setSignInEmail] = useState('');
  const [signInPassword, setSignInPassword] = useState('');

  // Sign Up inputs
  const [signUpName, setSignUpName] = useState('');
  const [signUpEmail, setSignUpEmail] = useState('');
  const [signUpPassword, setSignUpPassword] = useState('');
  const [signUpConfirm, setSignUpConfirm] = useState('');
  const [selectedExam, setSelectedExam] = useState('');
  const [examDate, setExamDate] = useState('');
  const [studyHours, setStudyHours] = useState('8');
  const [emergencyName, setEmergencyName] = useState('');
  const [emergencyRel, setEmergencyRel] = useState('Parent');
  const [emergencyPhone, setEmergencyPhone] = useState('');
  const [emergencyConsent, setEmergencyConsent] = useState(false);

  // Google OAuth simulator states
  const [showGoogleModal, setShowGoogleModal] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [customGoogleEmail, setCustomGoogleEmail] = useState('');
  const [isGoogleLinked, setIsGoogleLinked] = useState(false);

  // Retrieve user database from localStorage
  const getUsersDB = () => {
    try {
      const db = localStorage.getItem('zenstudy_users_db');
      return db ? JSON.parse(db) : [];
    } catch (e) {
      return [];
    }
  };

  const saveUserToDB = (newUser) => {
    try {
      const db = getUsersDB();
      db.push(newUser);
      localStorage.setItem('zenstudy_users_db', JSON.stringify(db));
      return true;
    } catch (e) {
      setError('Database save error. Please check storage capacity.');
      return false;
    }
  };

  const handleSignIn = (e) => {
    e.preventDefault();
    setError('');
    setStatusMessage('');

    if (!signInEmail.trim() || !signInPassword.trim()) {
      return setError('Please fill in all email and password fields.');
    }

    const db = getUsersDB();
    const foundUser = db.find(
      u => u.email.toLowerCase() === signInEmail.trim().toLowerCase()
    );

    if (!foundUser || foundUser.password !== signInPassword) {
      return setError('Invalid email credentials or incorrect password.');
    }

    onAuthSuccess(foundUser);
  };

  const handleSignUp = (e) => {
    e.preventDefault();
    setError('');

    // Validations
    if (!signUpName.trim()) return setError('Please enter your name.');
    if (!signUpEmail.trim()) return setError('Please enter your email.');
    if (!signUpPassword.trim()) return setError('Please choose a secure password.');
    if (signUpPassword !== signUpConfirm) return setError('Passwords do not match.');
    if (!selectedExam) return setError('Please select your target competitive exam.');
    if (!examDate) return setError('Please select your target exam date.');
    if (!emergencyName.trim()) return setError('Please enter an emergency contact name.');
    if (!emergencyPhone.trim()) return setError('Please enter emergency contact phone details.');

    const db = getUsersDB();
    const emailExists = db.some(
      u => u.email.toLowerCase() === signUpEmail.trim().toLowerCase()
    );

    // Only block sign up if it is not an in-progress Google linking flow
    if (emailExists && !isGoogleLinked) {
      return setError('This email is already registered. Please login.');
    }

    const newUser = {
      name: signUpName.trim(),
      email: signUpEmail.trim().toLowerCase(),
      password: signUpPassword,
      exam: selectedExam,
      examDate,
      studyHours: parseInt(studyHours) || 8,
      emergencyContact: {
        name: emergencyName.trim(),
        relationship: emergencyRel,
        phone: emergencyPhone.trim(),
        consent: emergencyConsent
      },
      isGoogleAuth: isGoogleLinked
    };

    // If it was google linking, filter out older version of this user first
    let finalDB = db;
    if (isGoogleLinked) {
      finalDB = db.filter(u => u.email.toLowerCase() !== signUpEmail.trim().toLowerCase());
      localStorage.setItem('zenstudy_users_db', JSON.stringify(finalDB));
    }

    if (saveUserToDB(newUser)) {
      onAuthSuccess(newUser);
    }
  };

  // Google OAuth simulated selector handler
  const handleGoogleSelect = (email) => {
    if (!email.trim() || !email.includes('@')) {
      alert('Please enter a valid Google Account email.');
      return;
    }

    setIsGoogleLoading(true);
    setError('');
    setStatusMessage('');

    setTimeout(() => {
      const db = getUsersDB();
      const foundUser = db.find(u => u.email.toLowerCase() === email.toLowerCase());

      if (foundUser) {
        // Returning user: log in directly (perfect clean access)
        onAuthSuccess(foundUser);
        setIsGoogleLoading(false);
        setShowGoogleModal(false);
      } else {
        // New user: Pre-fill account credentials, lock them, and prompt exam goals setup
        const emailPrefix = email.split('@')[0];
        const formattedName = emailPrefix
          .split('.')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ');

        setSignUpName(formattedName);
        setSignUpEmail(email.toLowerCase());
        setSignUpPassword('google-oauth-dummy-pw');
        setSignUpConfirm('google-oauth-dummy-pw');
        setIsGoogleLinked(true);
        
        setActiveTab('signup');
        setStatusMessage('Google Account authenticated! Please complete your study goals and safety contacts to finish setting up.');
        
        setIsGoogleLoading(false);
        setShowGoogleModal(false);
      }
    }, 1200);
  };

  const handleResetForm = () => {
    setSignUpName('');
    setSignUpEmail('');
    setSignUpPassword('');
    setSignUpConfirm('');
    setIsGoogleLinked(false);
    setError('');
    setStatusMessage('');
  };

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      padding: '40px 24px',
      position: 'relative',
      overflow: 'hidden',
      background: 'linear-gradient(135deg, hsl(140, 20%, 4%) 0%, hsl(200, 15%, 5%) 50%, hsl(38, 15%, 5%) 100%)'
    }}>
      
      {/* Dynamic breathing background glow mesh nodes for Zen relaxation */}
      <div className="ambient-bg-glow glow-zen-sage" style={{
        position: 'absolute',
        width: '450px',
        height: '450px',
        borderRadius: '50%',
        filter: 'blur(120px)',
        zIndex: 0,
        pointerEvents: 'none',
        opacity: 0.3,
        top: '10%',
        left: '15%',
        background: 'var(--color-accent-teal)',
        animation: 'breathe-glow-nodes 8s ease-in-out infinite alternate'
      }} />
      <div className="ambient-bg-glow glow-zen-gold" style={{
        position: 'absolute',
        width: '450px',
        height: '450px',
        borderRadius: '50%',
        filter: 'blur(120px)',
        zIndex: 0,
        pointerEvents: 'none',
        opacity: 0.25,
        bottom: '10%',
        right: '15%',
        background: 'var(--color-accent-amber)',
        animation: 'breathe-glow-nodes 8s ease-in-out infinite alternate-reverse'
      }} />

      <div className="glass-panel animate-fade-in" style={{
        maxWidth: activeTab === 'signin' ? '460px' : '850px',
        width: '100%',
        padding: '40px',
        borderRadius: '28px',
        border: '1px solid rgba(20, 184, 166, 0.2)', 
        boxShadow: '0 12px 40px rgba(0,0,0,0.6), 0 0 20px rgba(20, 184, 166, 0.05)',
        transition: 'max-width 0.45s cubic-bezier(0.16, 1, 0.3, 1)',
        zIndex: 1,
        background: 'rgba(10, 20, 15, 0.65)' 
      }}>
        
        {/* Mood Boosting Intro Box */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(20, 184, 166, 0.08) 0%, rgba(245, 158, 11, 0.06) 100%)',
          border: '1px solid rgba(255,255,255,0.06)',
          padding: '16px 20px',
          borderRadius: '16px',
          marginBottom: '28px',
          display: 'flex',
          gap: '12px',
          alignItems: 'center',
          textAlign: 'left'
        }}>
          <Sparkles size={24} style={{ color: 'var(--color-accent-amber)', flexShrink: 0 }} />
          <p style={{ fontSize: '0.86rem', color: 'var(--text-muted)', lineHeight: '1.45', margin: 0 }}>
            <strong style={{ color: '#fff' }}>Breathe in, breathe out.</strong> Your study milestones are important, but your peace of mind is paramount. Welcome to your mindful study space.
          </p>
        </div>

        {/* Logo Title */}
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div style={{ 
            display: 'inline-flex', 
            padding: '12px', 
            background: 'rgba(20, 184, 166, 0.15)', 
            borderRadius: '16px',
            marginBottom: '10px',
            color: 'var(--color-accent-teal)',
            border: '1px solid rgba(20, 184, 166, 0.25)'
          }}>
            <GraduationCap size={32} />
          </div>
          <h1 style={{ fontSize: '2.2rem', marginBottom: '4px', color: '#fff', fontFamily: 'Outfit' }}>ZenStudy Portal</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            A calming environment to monitor prep load and protect emotional stability.
          </p>
        </div>

        {/* Auth selector Tabs */}
        <div style={{ 
          display: 'flex', 
          background: 'rgba(0,0,0,0.2)', 
          padding: '4px', 
          borderRadius: '12px', 
          border: '1px solid var(--border-glow)',
          marginBottom: '28px'
        }}>
          <button
            onClick={() => { setActiveTab('signin'); handleResetForm(); }}
            style={{
              flex: 1,
              padding: '10px',
              border: 'none',
              background: activeTab === 'signin' ? 'linear-gradient(135deg, var(--color-accent-teal) 0%, hsl(175, 80%, 40%) 100%)' : 'transparent',
              color: '#fff',
              borderRadius: '8px',
              fontFamily: 'Outfit',
              fontWeight: 'bold',
              cursor: 'pointer',
              transition: 'var(--transition-smooth)'
            }}
          >
            Sign In
          </button>
          <button
            onClick={() => { setActiveTab('signup'); handleResetForm(); }}
            style={{
              flex: 1,
              padding: '10px',
              border: 'none',
              background: activeTab === 'signup' ? 'linear-gradient(135deg, var(--color-accent-teal) 0%, hsl(175, 80%, 40%) 100%)' : 'transparent',
              color: '#fff',
              borderRadius: '8px',
              fontFamily: 'Outfit',
              fontWeight: 'bold',
              cursor: 'pointer',
              transition: 'var(--transition-smooth)'
            }}
          >
            Sign Up & Onboard
          </button>
        </div>

        {error && (
          <div style={{
            background: 'rgba(244, 63, 94, 0.1)',
            border: '1px solid rgba(244, 63, 94, 0.2)',
            padding: '10px 14px',
            borderRadius: '8px',
            color: 'var(--color-accent-rose)',
            fontSize: '0.85rem',
            marginBottom: '20px',
            textAlign: 'center'
          }}>
            {error}
          </div>
        )}

        {statusMessage && (
          <div style={{
            background: 'rgba(20, 184, 166, 0.1)',
            border: '1px solid rgba(20, 184, 166, 0.25)',
            padding: '12px 16px',
            borderRadius: '10px',
            color: 'var(--color-accent-teal)',
            fontSize: '0.88rem',
            marginBottom: '24px',
            textAlign: 'left',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <Check size={18} style={{ flexShrink: 0 }} />
            <span>{statusMessage}</span>
          </div>
        )}

        {/* Form rendering */}
        {activeTab === 'signin' ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <form onSubmit={handleSignIn} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div>
                <label htmlFor="auth-signin-email" style={{ display: 'block', marginBottom: '6px', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                  <Mail size={12} style={{ marginRight: '6px', verticalAlign: 'middle' }} /> Email Address
                </label>
                <input
                  id="auth-signin-email"
                  type="email"
                  placeholder="you@example.com"
                  value={signInEmail}
                  onChange={(e) => setSignInEmail(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '11px 14px',
                    borderRadius: '8px',
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid var(--border-glow)',
                    color: '#fff',
                    outline: 'none',
                    transition: 'var(--transition-smooth)'
                  }}
                  onFocus={(e) => e.target.style.borderColor = 'var(--color-accent-teal)'}
                  onBlur={(e) => e.target.style.borderColor = 'var(--border-glow)'}
                />
              </div>
              
              <div>
                <label htmlFor="auth-signin-password" style={{ display: 'block', marginBottom: '6px', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                  <Lock size={12} style={{ marginRight: '6px', verticalAlign: 'middle' }} /> Password
                </label>
                <input
                  id="auth-signin-password"
                  type="password"
                  placeholder="••••••••"
                  value={signInPassword}
                  onChange={(e) => setSignInPassword(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '11px 14px',
                    borderRadius: '8px',
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid var(--border-glow)',
                    color: '#fff',
                    outline: 'none',
                    transition: 'var(--transition-smooth)'
                  }}
                  onFocus={(e) => e.target.style.borderColor = 'var(--color-accent-teal)'}
                  onBlur={(e) => e.target.style.borderColor = 'var(--border-glow)'}
                />
              </div>

              <button type="submit" className="btn-primary" style={{
                width: '100%',
                justifyContent: 'center',
                marginTop: '8px',
                background: 'linear-gradient(135deg, var(--color-accent-teal) 0%, hsl(175, 80%, 40%) 100%)',
                boxShadow: '0 4px 15px var(--color-accent-teal-glow)'
              }}>
                Access ZenSpace <ArrowRight size={16} />
              </button>
            </form>

            {/* Separator line */}
            <div style={{ display: 'flex', alignItems: 'center', margin: '8px 0' }}>
              <div style={{ flex: 1, height: '1px', background: 'var(--border-glow)' }} />
              <span style={{ fontSize: '0.78rem', color: 'var(--text-dim)', padding: '0 12px' }}>or</span>
              <div style={{ flex: 1, height: '1px', background: 'var(--border-glow)' }} />
            </div>

            {/* Google Sign In button overlay */}
            <button
              onClick={() => setShowGoogleModal(true)}
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '8px',
                background: '#fff',
                color: 'rgba(0,0,0,0.65)',
                fontFamily: 'Outfit',
                fontWeight: 'bold',
                fontSize: '0.95rem',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'var(--transition-smooth)',
                boxShadow: '0 4px 15px rgba(255, 255, 255, 0.05)'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.background = '#f7f7f7';
                e.currentTarget.style.transform = 'translateY(-1px)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.background = '#fff';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              <svg viewBox="0 0 24 24" width="18" height="18" style={{ marginRight: '10px' }}>
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22c-.62-.62-1.07-1.37-1.34-2.18z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
              </svg>
              Continue with Google
            </button>
          </div>
        ) : (
          <form onSubmit={handleSignUp} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            
            {/* Account Credentials */}
            <div>
              <h3 style={{ fontSize: '1rem', color: '#fff', marginBottom: '12px', paddingBottom: '4px', borderBottom: '1px solid var(--border-glow)' }}>
                1. Account Credentials {isGoogleLinked && <span style={{ fontSize: '0.72rem', background: 'rgba(20, 184, 166, 0.15)', color: 'var(--color-accent-teal)', border: '1px solid rgba(20, 184, 166, 0.3)', padding: '2px 8px', borderRadius: '12px', marginLeft: '8px', verticalAlign: 'middle' }}>GOOGLE LINKED</span>}
              </h3>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '14px' }}>
                <div>
                  <label htmlFor="auth-signup-name" style={{ display: 'block', marginBottom: '6px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>Full Name</label>
                  <input
                    id="auth-signup-name"
                    type="text"
                    placeholder="Enter name"
                    value={signUpName}
                    onChange={(e) => setSignUpName(e.target.value)}
                    disabled={isGoogleLinked}
                    style={{ 
                      width: '100%', 
                      padding: '10px 12px', 
                      borderRadius: '6px', 
                      background: isGoogleLinked ? 'rgba(255,255,255,0.01)' : 'rgba(255,255,255,0.03)', 
                      border: '1px solid var(--border-glow)', 
                      color: isGoogleLinked ? 'var(--text-dim)' : '#fff', 
                      outline: 'none',
                      cursor: isGoogleLinked ? 'not-allowed' : 'text'
                    }}
                  />
                </div>
                <div>
                  <label htmlFor="auth-signup-email" style={{ display: 'block', marginBottom: '6px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>Email Address</label>
                  <input
                    id="auth-signup-email"
                    type="email"
                    placeholder="you@example.com"
                    value={signUpEmail}
                    onChange={(e) => setSignUpEmail(e.target.value)}
                    disabled={isGoogleLinked}
                    style={{ 
                      width: '100%', 
                      padding: '10px 12px', 
                      borderRadius: '6px', 
                      background: isGoogleLinked ? 'rgba(255,255,255,0.01)' : 'rgba(255,255,255,0.03)', 
                      border: '1px solid var(--border-glow)', 
                      color: isGoogleLinked ? 'var(--text-dim)' : '#fff', 
                      outline: 'none',
                      cursor: isGoogleLinked ? 'not-allowed' : 'text'
                    }}
                  />
                </div>
              </div>

              {!isGoogleLinked && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div>
                    <label htmlFor="auth-signup-password" style={{ display: 'block', marginBottom: '6px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>Password</label>
                    <input
                      id="auth-signup-password"
                      type="password"
                      placeholder="••••••••"
                      value={signUpPassword}
                      onChange={(e) => setSignUpPassword(e.target.value)}
                      style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-glow)', color: '#fff', outline: 'none' }}
                    />
                  </div>
                  <div>
                    <label htmlFor="auth-signup-confirm" style={{ display: 'block', marginBottom: '6px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>Confirm Password</label>
                    <input
                      id="auth-signup-confirm"
                      type="password"
                      placeholder="••••••••"
                      value={signUpConfirm}
                      onChange={(e) => setSignUpConfirm(e.target.value)}
                      style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-glow)', color: '#fff', outline: 'none' }}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Preparation Profile */}
            <div>
              <h3 style={{ fontSize: '1rem', color: '#fff', marginBottom: '12px', paddingBottom: '4px', borderBottom: '1px solid var(--border-glow)' }}>
                2. Preparation Profile
              </h3>
              
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '16px', marginBottom: '14px' }}>
                <div>
                  <label htmlFor="auth-signup-exam-date" style={{ display: 'block', marginBottom: '6px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>Target Exam Date</label>
                  <input
                    id="auth-signup-exam-date"
                    type="date"
                    value={examDate}
                    onChange={(e) => setExamDate(e.target.value)}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-glow)', color: '#fff', outline: 'none' }}
                  />
                </div>
                <div>
                  <label htmlFor="auth-signup-study-hours" style={{ display: 'block', marginBottom: '6px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>Study Hours Target</label>
                  <select
                    id="auth-signup-study-hours"
                    value={studyHours}
                    onChange={(e) => setStudyHours(e.target.value)}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-glow)', color: '#fff', cursor: 'pointer' }}
                  >
                    {[4,6,8,10,12,14].map(h => (
                      <option key={h} value={h} style={{ background: 'var(--bg-app)' }}>{h} hrs/day</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>Select Target Exam</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px', maxHeight: '140px', overflowY: 'auto', paddingRight: '4px' }}>
                  {EXAMS.map(exam => {
                    const isSelected = selectedExam === exam.id;
                    return (
                      <div
                        key={exam.id}
                        onClick={() => setSelectedExam(exam.id)}
                        style={{
                          padding: '12px',
                          borderRadius: '10px',
                          background: isSelected ? 'rgba(20, 184, 166, 0.15)' : 'rgba(255, 255, 255, 0.02)',
                          border: isSelected ? '2px solid var(--color-accent-teal)' : '1px solid var(--border-glow)',
                          cursor: 'pointer',
                          transition: 'var(--transition-smooth)',
                          boxShadow: isSelected ? '0 0 10px var(--color-accent-teal-glow)' : 'none'
                        }}
                      >
                        <h4 style={{ fontSize: '0.9rem', color: '#fff', display: 'flex', justifyContent: 'space-between' }}>
                          {exam.id} <span style={{ fontSize: '0.68rem', color: 'var(--color-accent-teal)' }}>{exam.category}</span>
                        </h4>
                        <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{exam.desc}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Emergency Support */}
            <div style={{ border: '1px solid rgba(244,63,94,0.2)', background: 'rgba(244,63,94,0.02)', padding: '16px', borderRadius: '12px' }}>
              <h3 style={{ fontSize: '1rem', color: '#fff', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '12px' }}>
                <ShieldAlert size={14} style={{ color: 'var(--color-accent-rose)' }} /> 3. Emergency Support Profile
              </h3>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                <div>
                  <label htmlFor="auth-signup-emergency-name" style={{ display: 'block', marginBottom: '4px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>Contact Name</label>
                  <input
                    id="auth-signup-emergency-name"
                    type="text"
                    placeholder="E.g. Parent"
                    value={emergencyName}
                    onChange={(e) => setEmergencyName(e.target.value)}
                    style={{ width: '100%', padding: '9px 10px', borderRadius: '6px', background: 'rgba(0,0,0,0.15)', border: '1px solid var(--border-glow)', color: '#fff', fontSize: '0.82rem', outline: 'none' }}
                  />
                </div>
                <div>
                  <label htmlFor="auth-signup-emergency-rel" style={{ display: 'block', marginBottom: '4px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>Relationship</label>
                  <select
                    id="auth-signup-emergency-rel"
                    value={emergencyRel}
                    onChange={(e) => setEmergencyRel(e.target.value)}
                    style={{ width: '100%', padding: '9px 10px', borderRadius: '6px', background: 'rgba(0,0,0,0.15)', border: '1px solid var(--border-glow)', color: '#fff', fontSize: '0.82rem', cursor: 'pointer' }}
                  >
                    {['Parent', 'Sibling', 'Friend', 'Guardian', 'Spouse', 'Other'].map(r => (
                      <option key={r} value={r} style={{ background: 'var(--bg-app)' }}>{r}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="auth-signup-emergency-phone" style={{ display: 'block', marginBottom: '4px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>Phone Number</label>
                  <input
                    id="auth-signup-emergency-phone"
                    type="text"
                    placeholder="+1 (555) 019-28"
                    value={emergencyPhone}
                    onChange={(e) => setEmergencyPhone(e.target.value)}
                    style={{ width: '100%', padding: '9px 10px', borderRadius: '6px', background: 'rgba(0,0,0,0.15)', border: '1px solid var(--border-glow)', color: '#fff', fontSize: '0.82rem', outline: 'none' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                <input
                  type="checkbox"
                  id="auth-signup-consent"
                  checked={emergencyConsent}
                  onChange={(e) => setEmergencyConsent(e.target.checked)}
                  style={{ marginTop: '3px', cursor: 'pointer', accentColor: 'var(--color-accent-rose)' }}
                />
                <label htmlFor="auth-signup-consent" style={{ fontSize: '0.75rem', color: 'var(--text-muted)', cursor: 'pointer', lineHeight: '1.3' }}>
                  Allow ZenStudy to notify my emergency contact if I trigger the safety alarm during high distress.
                </label>
              </div>
            </div>

            <button type="submit" className="btn-primary" style={{
              width: '100%',
              justifyContent: 'center',
              background: 'linear-gradient(135deg, var(--color-accent-teal) 0%, hsl(175, 80%, 40%) 100%)',
              boxShadow: '0 4px 15px var(--color-accent-teal-glow)'
            }}>
              Create Account & Enter ZenSpace <ArrowRight size={16} />
            </button>
          </form>
        )}
        
      </div>

      {/* Simulated Google OAuth Popup Overlay */}
      {showGoogleModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(5, 10, 8, 0.85)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px'
        }}>
          <div className="glass-panel animate-fade-in" style={{
            maxWidth: '440px',
            width: '100%',
            padding: '32px',
            borderRadius: '24px',
            border: '1px solid rgba(255,255,255,0.08)',
            boxShadow: '0 12px 40px rgba(0,0,0,0.6)',
            textAlign: 'center',
            background: 'rgba(12, 12, 12, 0.9)'
          }}>
            
            {/* Modal close */}
            <button 
              onClick={() => { setShowGoogleModal(false); setError(''); }}
              style={{
                position: 'absolute',
                top: '20px',
                right: '20px',
                background: 'transparent',
                border: 'none',
                color: 'var(--text-dim)',
                cursor: 'pointer'
              }}
              disabled={isGoogleLoading}
            >
              ✕
            </button>

            {/* Google Icon Header */}
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px' }}>
              <svg viewBox="0 0 24 24" width="40" height="40">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22c-.62-.62-1.07-1.37-1.34-2.18z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
              </svg>
            </div>

            <h3 style={{ fontSize: '1.25rem', color: '#fff', marginBottom: '6px', fontFamily: 'Outfit' }}>
              Sign in with Google
            </h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '24px' }}>
              to continue to <strong>ZenStudy</strong>
            </p>

            {isGoogleLoading ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', padding: '30px 0', color: 'var(--text-muted)' }}>
                <Loader2 size={36} className="spinner" style={{ animation: 'spin 1s linear infinite', color: 'var(--color-accent-teal)' }} />
                <span>Verifying credentials with Google...</span>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', textAlign: 'left' }}>
                
                {/* Account card 1 */}
                <div 
                  onClick={() => handleGoogleSelect('sonam.student@gmail.com')}
                  className="google-account-card"
                  style={{
                    padding: '12px 16px',
                    borderRadius: '8px',
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid var(--border-glow)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    transition: 'var(--transition-smooth)'
                  }}
                >
                  <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'rgba(20, 184, 166, 0.15)', color: 'var(--color-accent-teal)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '0.85rem' }}>
                    S
                  </div>
                  <div>
                    <h5 style={{ color: '#fff', fontSize: '0.88rem', margin: 0 }}>Sonam Student</h5>
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>sonam.student@gmail.com</span>
                  </div>
                </div>

                {/* Account card 2 */}
                <div 
                  onClick={() => handleGoogleSelect('guest.scholar@gmail.com')}
                  className="google-account-card"
                  style={{
                    padding: '12px 16px',
                    borderRadius: '8px',
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid var(--border-glow)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    transition: 'var(--transition-smooth)'
                  }}
                >
                  <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'rgba(138, 43, 226, 0.15)', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '0.85rem' }}>
                    G
                  </div>
                  <div>
                    <h5 style={{ color: '#fff', fontSize: '0.88rem', margin: 0 }}>Guest Scholar</h5>
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>guest.scholar@gmail.com</span>
                  </div>
                </div>

                {/* Separator */}
                <div style={{ display: 'flex', alignItems: 'center', margin: '8px 0' }}>
                  <div style={{ flex: 1, height: '1px', background: 'var(--border-glow)' }} />
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)', padding: '0 10px' }}>or use another account</span>
                  <div style={{ flex: 1, height: '1px', background: 'var(--border-glow)' }} />
                </div>

                {/* Custom Email Input */}
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input 
                    type="email" 
                    placeholder="Enter other google email"
                    value={customGoogleEmail}
                    onChange={(e) => setCustomGoogleEmail(e.target.value)}
                    style={{
                      flex: 1,
                      padding: '8px 12px',
                      borderRadius: '6px',
                      background: 'rgba(0,0,0,0.2)',
                      border: '1px solid var(--border-glow)',
                      color: '#fff',
                      fontSize: '0.85rem',
                      outline: 'none'
                    }}
                  />
                  <button 
                    onClick={() => handleGoogleSelect(customGoogleEmail)}
                    className="btn-primary"
                    style={{ padding: '8px 16px', fontSize: '0.8rem', background: 'linear-gradient(135deg, var(--color-accent-teal) 0%, hsl(175, 80%, 40%) 100%)' }}
                  >
                    Continue
                  </button>
                </div>

              </div>
            )}

          </div>
        </div>
      )}
      
      {/* CSS Animation Keyframes Injector */}
      <style>{`
        @keyframes breathe-glow-nodes {
          0% { transform: scale(1); opacity: 0.2; }
          100% { transform: scale(1.15); opacity: 0.35; filter: blur(140px); }
        }
        .google-account-card:hover {
          background: rgba(255, 255, 255, 0.08) !important;
          border-color: var(--text-muted) !important;
          transform: translateY(-1px);
        }
      `}</style>

    </div>
  );
}
