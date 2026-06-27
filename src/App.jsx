import React, { useState, useEffect, useMemo } from 'react';
import { 
  LayoutDashboard, PenTool, MessageSquare, Wind, 
  Settings, Brain, Sparkles, ShieldAlert, Award, FileText,
  Volume2, Heart, AlertOctagon, RefreshCw, X, Check, LogOut
} from 'lucide-react';
import Auth from './components/Auth';
import Dashboard from './components/Dashboard';
import Journal from './components/Journal';
import AuraChat from './components/AuraChat';
import Mindfulness from './components/Mindfulness';
import SettingsView from './components/Settings';
import { GeminiService } from './services/gemini';
import { NotificationService } from './services/notifications';

export default function App() {
  // --- 1. Global Application State ---
  const [currentUser, setCurrentUser] = useState(null);
  const [apiKey, setApiKey] = useState('');
  
  // Transactional user data (isolated by email namespace)
  const [logs, setLogs] = useState([]);
  const [chatLog, setChatLog] = useState([]);
  const [weeklyReports, setWeeklyReports] = useState(null);
  
  const [activeView, setActiveView] = useState('dashboard');
  const [isLoading, setIsLoading] = useState(true);

  // Safety overlay states
  const [safetyTriggered, setSafetyTriggered] = useState(false);
  const [isSendingSMS, setIsSendingSMS] = useState(false);
  const [smsStatusMessage, setSmsStatusMessage] = useState('');

  // Initialize session and global settings
  useEffect(() => {
    try {
      const activeSession = localStorage.getItem('zenstudy_current_user');
      const storedKey = localStorage.getItem('zenstudy_apikey');

      if (activeSession) {
        const userObj = JSON.parse(activeSession);
        // Only restore if emergency contact data is present (validation check)
        if (userObj.emergencyContact) {
          setCurrentUser(userObj);
        }
      }
      if (storedKey) setApiKey(storedKey);
    } catch (e) {
      console.error('LocalStorage load session failed:', e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Sync transactional user database when currentUser changes
  useEffect(() => {
    if (!currentUser) {
      setLogs([]);
      setChatLog([]);
      setWeeklyReports(null);
      return;
    }

    try {
      const email = currentUser.email;
      const storedLogs = localStorage.getItem(`zenstudy_logs_${email}`);
      const storedChat = localStorage.getItem(`zenstudy_chat_${email}`);
      const storedWeekly = localStorage.getItem(`zenstudy_weekly_${email}`);

      setLogs(storedLogs ? JSON.parse(storedLogs) : []);
      setChatLog(storedChat ? JSON.parse(storedChat) : []);
      setWeeklyReports(storedWeekly ? JSON.parse(storedWeekly) : null);
    } catch (e) {
      console.error('Failed to load user transaction databases:', e);
    }
  }, [currentUser]);

  // --- 2. Instantiate Gemini AI Service ---
  const geminiService = useMemo(() => {
    return new GeminiService(apiKey);
  }, [apiKey]);

  // --- 3. Auto-calculate Stress Patterns ---
  const [patternsData, setPatternsData] = useState({
    patterns: [{ title: 'Collecting Baselines', description: 'Log daily journals to unlock comparison metrics.', severity: 'low' }],
    correlation: 'Calculating stress trend triggers...',
    recommendations: ['Daily reflections help Aura identify patterns.']
  });

  useEffect(() => {
    const computePatterns = async () => {
      if (!currentUser) return;
      const patterns = await geminiService.detectStressPatterns(logs, currentUser.exam);
      setPatternsData(patterns);
    };
    computePatterns();
  }, [logs, currentUser, geminiService]);

  // --- 4. Safety Interception Logic ---
  const handleCheckDistress = (currentScore) => {
    if (!currentUser?.emergencyContact?.consent) return; // Must have consent checked

    const isHighCurrent = currentScore > 80;
    const isConsecutiveHigh = logs.length > 0 && 
                              (logs[0].analysis?.stressScore || 0) > 80 && 
                              currentScore > 80;

    if (isHighCurrent || isConsecutiveHigh) {
      setSafetyTriggered(true);
    }
  };

  const handleNotifyEmergency = async () => {
    if (!currentUser?.emergencyContact) return;
    setIsSendingSMS(true);
    setSmsStatusMessage('');

    try {
      const response = await NotificationService.sendEmergencySMS(
        currentUser.emergencyContact,
        currentUser.name,
        currentUser.exam
      );
      if (response.success) {
        setSmsStatusMessage(`SMS dispatch successful! Alert message ID: ${response.messageId}.`);
      }
    } catch(err) {
      console.error(err);
      setSmsStatusMessage('Simulated dispatch failed. Please check contact details.');
    } finally {
      setIsSendingSMS(false);
    }
  };

  // --- 5. Auth Success Coordinator ---
  const handleAuthSuccess = (userData) => {
    setCurrentUser(userData);
    localStorage.setItem('zenstudy_current_user', JSON.stringify(userData));
    setActiveView('dashboard');
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('zenstudy_current_user');
    setActiveView('dashboard');
  };

  // --- 6. Log Book transaction managers ---
  const handleLogAdded = (newLog) => {
    if (!currentUser) return;
    const email = currentUser.email;
    const updated = [newLog, ...logs];
    setLogs(updated);
    localStorage.setItem(`zenstudy_logs_${email}`, JSON.stringify(updated));
  };

  const handleSendMessage = (newMsg) => {
    if (!currentUser) return;
    const email = currentUser.email;
    const updated = [...chatLog, newMsg];
    setChatLog(updated);
    localStorage.setItem(`zenstudy_chat_${email}`, JSON.stringify(updated));
  };

  const handleClearChat = () => {
    if (!currentUser) return;
    const email = currentUser.email;
    setChatLog([]);
    localStorage.removeItem(`zenstudy_chat_${email}`);
  };

  const handleRegenerateWeeklyReport = async () => {
    if (!currentUser) return;
    const email = currentUser.email;
    const report = await geminiService.generateWeeklyReport(logs, currentUser);
    setWeeklyReports(report);
    localStorage.setItem(`zenstudy_weekly_${email}`, JSON.stringify(report));
  };

  const handleSaveSettings = ({ user: updatedUser, apiKey: updatedKey }) => {
    if (!currentUser) return;
    
    // Save to session
    setCurrentUser(updatedUser);
    localStorage.setItem('zenstudy_current_user', JSON.stringify(updatedUser));
    
    // Update central credentials DB
    try {
      const dbStr = localStorage.getItem('zenstudy_users_db');
      if (dbStr) {
        const db = JSON.parse(dbStr);
        const idx = db.findIndex(u => u.email.toLowerCase() === currentUser.email.toLowerCase());
        if (idx !== -1) {
          db[idx] = { ...db[idx], ...updatedUser };
          localStorage.setItem('zenstudy_users_db', JSON.stringify(db));
        }
      }
    } catch(e) {
      console.error('Failed to sync settings with user credentials database:', e);
    }

    // Save key
    setApiKey(updatedKey);
    if (updatedKey) {
      localStorage.setItem('zenstudy_apikey', updatedKey);
    } else {
      localStorage.removeItem('zenstudy_apikey');
    }
  };

  const handleClearAllData = () => {
    if (!currentUser) return;
    const email = currentUser.email;

    // Erase transaction logs under user namespace
    localStorage.removeItem(`zenstudy_logs_${email}`);
    localStorage.removeItem(`zenstudy_chat_${email}`);
    localStorage.removeItem(`zenstudy_weekly_${email}`);
    
    // Remove from global credentials DB
    try {
      const dbStr = localStorage.getItem('zenstudy_users_db');
      if (dbStr) {
        const db = JSON.parse(dbStr);
        const filtered = db.filter(u => u.email.toLowerCase() !== email.toLowerCase());
        localStorage.setItem('zenstudy_users_db', JSON.stringify(filtered));
      }
    } catch(e){}

    // Trigger logout
    handleLogout();
  };

  // Render loading state
  if (isLoading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        color: 'var(--text-muted)'
      }}>
        Loading ZenSpace...
      </div>
    );
  }

  // Intercept with Auth gateway if no active user session
  if (!currentUser) {
    return <Auth onAuthSuccess={handleAuthSuccess} />;
  }

  // View Routing Switcher
  const renderActiveView = () => {
    switch (activeView) {
      case 'dashboard':
        return (
          <Dashboard 
            user={currentUser} 
            logs={logs} 
            patternsData={patternsData} 
            weeklyReports={weeklyReports}
            onRegenerateWeeklyReport={handleRegenerateWeeklyReport}
            onViewChange={setActiveView} 
          />
        );
      case 'journal':
        return (
          <Journal 
            geminiService={geminiService} 
            user={currentUser} 
            onLogAdded={handleLogAdded} 
            onCheckDistress={handleCheckDistress}
          />
        );
      case 'chat':
        return (
          <AuraChat 
            geminiService={geminiService} 
            user={currentUser} 
            chatLog={chatLog} 
            onSendMessage={handleSendMessage}
            onClearChat={handleClearChat}
            logs={logs}
            patternsData={patternsData}
          />
        );
      case 'mindfulness':
        return (
          <Mindfulness 
            geminiService={geminiService} 
            user={currentUser} 
          />
        );
      case 'settings':
        return (
          <SettingsView 
            user={currentUser} 
            apiKey={apiKey} 
            onSaveSettings={handleSaveSettings} 
            onClearData={handleClearAllData} 
          />
        );
      default:
        return <Dashboard user={currentUser} logs={logs} patternsData={patternsData} onViewChange={setActiveView} />;
    }
  };

  return (
    <div className="app-container">
      
      {/* Background glow node decorations */}
      <div className="ambient-bg-glow glow-purple" />
      <div className="ambient-bg-glow glow-teal" style={{ bottom: '10%', right: '10%' }} />

      {/* Navigation Sidebar */}
      <aside className="sidebar">
        
        {/* Brand Logo Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '32px', padding: '0 8px' }}>
          <div style={{
            background: 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-accent-teal) 100%)',
            padding: '8px',
            borderRadius: '10px',
            color: '#fff',
            display: 'flex'
          }}>
            <Brain size={20} />
          </div>
          <span style={{ fontSize: '1.25rem', fontWeight: 'bold', fontFamily: 'Outfit', color: '#fff', letterSpacing: '-0.5px' }}>
            ZenStudy
          </span>
        </div>

        {/* Navigation list */}
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
          <button 
            onClick={() => setActiveView('dashboard')}
            className={`btn-nav ${activeView === 'dashboard' ? 'active' : ''}`}
          >
            <LayoutDashboard size={18} /> Dashboard
          </button>
          
          <button 
            onClick={() => setActiveView('journal')}
            className={`btn-nav ${activeView === 'journal' ? 'active' : ''}`}
          >
            <PenTool size={18} /> Journaling
          </button>
          
          <button 
            onClick={() => setActiveView('chat')}
            className={`btn-nav ${activeView === 'chat' ? 'active' : ''}`}
          >
            <MessageSquare size={18} /> Aura Chat
          </button>
          
          <button 
            onClick={() => setActiveView('mindfulness')}
            className={`btn-nav ${activeView === 'mindfulness' ? 'active' : ''}`}
          >
            <Wind size={18} /> Mindfulness
          </button>
          
          <button 
            onClick={() => setActiveView('settings')}
            className={`btn-nav ${activeView === 'settings' ? 'active' : ''}`}
          >
            <Settings size={18} /> Settings
          </button>
        </nav>

        {/* Sidebar Footer: Student Summary Card */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: 'auto' }}>
          
          <div className="glass-panel" style={{ padding: '12px 14px', borderRadius: '10px', background: 'rgba(255,255,255,0.02)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                background: 'var(--color-primary-glow)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--color-primary)',
                fontWeight: 'bold',
                fontSize: '0.85rem'
              }}>
                {currentUser.name.charAt(0).toUpperCase()}
              </div>
              <div style={{ overflow: 'hidden' }}>
                <div style={{ fontSize: '0.85rem', fontWeight: 'bold', color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{currentUser.name}</div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>Target: {currentUser.exam}</div>
              </div>
            </div>
          </div>

          <button 
            onClick={handleLogout}
            className="btn-nav"
            style={{ 
              color: 'var(--color-accent-rose)', 
              background: 'rgba(244, 63, 94, 0.05)',
              border: '1px solid rgba(244, 63, 94, 0.1)',
              padding: '10px 14px',
              borderRadius: '8px'
            }}
          >
            <LogOut size={16} /> Log Out
          </button>

        </div>

        {/* AI Mode Banner */}
        <div style={{
          marginTop: '16px',
          textAlign: 'center',
          fontSize: '0.7rem',
          color: apiKey ? 'var(--color-accent-teal)' : 'var(--color-accent-amber)',
          background: 'rgba(255,255,255,0.02)',
          padding: '6px',
          borderRadius: '6px',
          border: '1px solid var(--border-glow)'
        }}>
          Mode: {apiKey ? 'Live Gemini AI' : 'Offline Simulator'}
        </div>

      </aside>

      {/* Main Panel Content Window */}
      <main className="main-content">
        {renderActiveView()}
      </main>

      {/* Phase 7 - Safety De-escalation Screen Overlay */}
      {safetyTriggered && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(5, 5, 12, 0.85)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px'
        }}>
          <div className="glass-panel-accent animate-fade-in" style={{
            maxWidth: '600px',
            width: '100%',
            padding: '40px',
            border: '2px solid var(--color-accent-rose)',
            boxShadow: '0 8px 45px rgba(244, 63, 94, 0.25)',
            textAlign: 'center',
            borderRadius: '24px'
          }}>
            <div style={{ 
              display: 'inline-flex', 
              padding: '16px', 
              background: 'rgba(244, 63, 94, 0.15)', 
              borderRadius: '50%',
              marginBottom: '20px',
              color: 'var(--color-accent-rose)',
              border: '1px solid rgba(244, 63, 94, 0.3)'
            }}>
              <ShieldAlert size={48} />
            </div>

            <h2 style={{ fontSize: '1.8rem', color: '#fff', marginBottom: '16px', fontFamily: 'Outfit' }}>
              We're Here For You
            </h2>
            
            <p style={{ color: 'var(--text-muted)', fontSize: '1.05rem', lineHeight: '1.6', marginBottom: '28px' }}>
              I've noticed you're going through a particularly difficult time. Navigating {currentUser.exam} can feel like a heavy weight, but you don't have to handle this alone. Let's take a moment to steady your pacing.
            </p>

            {/* Action buttons */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              
              <button 
                onClick={() => {
                  setSafetyTriggered(false);
                  setActiveView('mindfulness');
                }}
                className="btn-primary"
                style={{ 
                  width: '100%', 
                  justifyContent: 'center', 
                  padding: '14px',
                  background: 'linear-gradient(135deg, var(--color-accent-teal) 0%, hsl(175, 80%, 40%) 100%)',
                  boxShadow: '0 4px 15px var(--color-accent-teal-glow)'
                }}
              >
                <Wind size={16} /> Start Breathing Exercise
              </button>

              <button 
                onClick={() => {
                  setSafetyTriggered(false);
                  setActiveView('chat');
                }}
                className="btn-primary"
                style={{ 
                  width: '100%', 
                  justifyContent: 'center', 
                  padding: '14px'
                }}
              >
                <MessageSquare size={16} /> Talk to Aura
              </button>

              {currentUser?.emergencyContact?.consent && (
                <button 
                  onClick={handleNotifyEmergency}
                  style={{
                    width: '100%',
                    padding: '14px',
                    borderRadius: '10px',
                    background: 'rgba(244, 63, 94, 0.1)',
                    border: '1px solid rgba(244, 63, 94, 0.3)',
                    color: 'var(--color-accent-rose)',
                    fontFamily: 'Outfit',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    transition: 'var(--transition-smooth)'
                  }}
                  onMouseOver={(e) => e.target.style.background = 'rgba(244, 63, 94, 0.18)'}
                  onMouseOut={(e) => e.target.style.background = 'rgba(244, 63, 94, 0.1)'}
                  disabled={isSendingSMS}
                >
                  {isSendingSMS ? (
                    <><RefreshCw size={16} className="spinner" style={{ animation: 'spin 1s linear infinite' }} /> Alerting contact...</>
                  ) : (
                    <><Heart size={16} /> Notify Emergency Contact (${currentUser.emergencyContact.name})</>
                  )}
                </button>
              )}

              <button 
                onClick={() => {
                  setSafetyTriggered(false);
                  setSmsStatusMessage('');
                }}
                className="btn-secondary"
                style={{ width: '100%', justifyContent: 'center', padding: '14px' }}
                disabled={isSendingSMS}
              >
                Close Safety Console
              </button>

            </div>

            {smsStatusMessage && (
              <div style={{
                marginTop: '16px',
                padding: '12px',
                borderRadius: '8px',
                fontSize: '0.85rem',
                background: 'rgba(20, 184, 166, 0.1)',
                border: '1px solid rgba(20, 184, 166, 0.2)',
                color: 'var(--color-accent-teal)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px'
              }}>
                <Check size={14} /> {smsStatusMessage}
              </div>
            )}

          </div>
        </div>
      )}

      {/* Navigation Button Styling Injected */}
      <style>{`
        .btn-nav {
          display: flex;
          align-items: center;
          gap: 12px;
          width: 100%;
          padding: 12px 16px;
          border: none;
          background: transparent;
          color: var(--text-muted);
          border-radius: 10px;
          font-family: 'Outfit', sans-serif;
          font-weight: 500;
          font-size: 0.95rem;
          cursor: pointer;
          transition: var(--transition-smooth);
          text-align: left;
        }

        .btn-nav:hover {
          background: rgba(255, 255, 255, 0.04);
          color: #fff;
        }

        .btn-nav.active {
          background: var(--color-primary-glow);
          color: #fff;
          border-left: 3px solid var(--color-primary);
        }
      `}</style>

    </div>
  );
}
