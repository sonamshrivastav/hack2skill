import React, { useState } from 'react';
import { Key, User, Trash2, ShieldCheck, AlertOctagon, Save, ShieldAlert } from 'lucide-react';

export default function Settings({ user, apiKey, onSaveSettings, onClearData }) {
  const [keyInput, setKeyInput] = useState(apiKey || '');
  const [name, setName] = useState(user?.name || '');
  const [exam, setExam] = useState(user?.exam || 'JEE');
  const [examDate, setExamDate] = useState(user?.examDate || '');
  const [studyHours, setStudyHours] = useState(user?.studyHours || 8);
  
  // Emergency Contact States
  const [emergencyName, setEmergencyName] = useState(user?.emergencyContact?.name || '');
  const [emergencyRel, setEmergencyRel] = useState(user?.emergencyContact?.relationship || 'Parent');
  const [emergencyPhone, setEmergencyPhone] = useState(user?.emergencyContact?.phone || '');
  const [emergencyConsent, setEmergencyConsent] = useState(user?.emergencyContact?.consent || false);

  const [status, setStatus] = useState('');
  const [showConfirmReset, setShowConfirmReset] = useState(false);

  const handleSave = (e) => {
    e.preventDefault();
    if (!name.trim()) return setStatus('Name cannot be empty.');
    if (!examDate) return setStatus('Please select an exam date.');
    if (!emergencyName.trim()) return setStatus('Emergency contact name cannot be empty.');
    if (!emergencyPhone.trim()) return setStatus('Emergency contact phone cannot be empty.');

    onSaveSettings({
      user: {
        name: name.trim(),
        exam,
        examDate,
        studyHours: parseInt(studyHours) || 8,
        emergencyContact: {
          name: emergencyName.trim(),
          relationship: emergencyRel,
          phone: emergencyPhone.trim(),
          consent: emergencyConsent
        }
      },
      apiKey: keyInput.trim()
    });

    setStatus('Configurations updated successfully!');
    setTimeout(() => setStatus(''), 3000);
  };

  const handleResetData = () => {
    onClearData();
    setShowConfirmReset(false);
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '800px' }}>
      
      <div>
        <h1 style={{ fontSize: '2.2rem', color: '#fff', marginBottom: '4px' }}>Control Panel & Settings</h1>
        <p style={{ color: 'var(--text-muted)' }}>Configure your API credentials, customize schedules, or manage safety profiles.</p>
      </div>

      <div className="glass-panel" style={{ padding: '28px' }}>
        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
          
          {/* Section 1: Gemini API Key */}
          <div>
            <h2 style={{ fontSize: '1.25rem', color: '#fff', borderBottom: '1px solid var(--border-glow)', paddingBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
              <Key size={18} style={{ color: 'var(--color-primary)' }} /> Google Gemini API Credentials
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginBottom: '12px', lineHeight: '1.45' }}>
              By default, the wellness application runs in <strong>Offline Simulator Mode</strong>. 
              To activate high-fidelity Generative AI analysis, paste your <strong>Google Gemini API Key</strong> below.
            </p>
            <input
              type="password"
              value={keyInput}
              onChange={(e) => setKeyInput(e.target.value)}
              placeholder="Paste your AIzaSy... API Key here"
              style={{
                width: '100%',
                padding: '12px 16px',
                borderRadius: '10px',
                background: 'rgba(0,0,0,0.15)',
                border: '1px solid var(--border-glow)',
                color: '#fff',
                fontSize: '0.92rem',
                outline: 'none',
                fontFamily: 'monospace'
              }}
            />
            {apiKey && (
              <div style={{ marginTop: '8px', fontSize: '0.8rem', color: 'var(--color-accent-teal)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <ShieldCheck size={14} /> Live Gemini Engine is active.
              </div>
            )}
          </div>

          {/* Section 2: Profile Update */}
          <div>
            <h2 style={{ fontSize: '1.25rem', color: '#fff', borderBottom: '1px solid var(--border-glow)', paddingBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
              <User size={18} style={{ color: 'var(--color-accent-teal)' }} /> Prep Profile Information
            </h2>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.82rem', color: 'var(--text-muted)' }}>Student Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '8px',
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid var(--border-glow)',
                    color: '#fff'
                  }}
                />
              </div>
              
              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.82rem', color: 'var(--text-muted)' }}>Target Entrance Exam</label>
                <select
                  value={exam}
                  onChange={(e) => setExam(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '8px',
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid var(--border-glow)',
                    color: '#fff',
                    cursor: 'pointer'
                  }}
                >
                  {['JEE', 'NEET', 'UPSC', 'CAT', 'GATE', 'BOARDS'].map(ex => (
                    <option key={ex} value={ex} style={{ background: 'var(--bg-app)' }}>{ex}</option>
                  ))}
                </select>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.82rem', color: 'var(--text-muted)' }}>Exam Target Date</label>
                <input
                  type="date"
                  value={examDate}
                  onChange={(e) => setExamDate(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '8px',
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid var(--border-glow)',
                    color: '#fff'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.82rem', color: 'var(--text-muted)' }}>Daily Study Hours Target</label>
                <input
                  type="number"
                  min="1"
                  max="20"
                  value={studyHours}
                  onChange={(e) => setStudyHours(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '8px',
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid var(--border-glow)',
                    color: '#fff'
                  }}
                />
              </div>
            </div>
          </div>

          {/* Section 3: Emergency Contact Safety details */}
          <div>
            <h2 style={{ fontSize: '1.25rem', color: '#fff', borderBottom: '1px solid var(--border-glow)', paddingBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
              <ShieldAlert size={18} style={{ color: 'var(--color-accent-rose)' }} /> Emergency Contact (Safety Settings)
            </h2>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', marginBottom: '16px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.82rem', color: 'var(--text-muted)' }}>Contact Name</label>
                <input
                  type="text"
                  value={emergencyName}
                  onChange={(e) => setEmergencyName(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '8px',
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid var(--border-glow)',
                    color: '#fff'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.82rem', color: 'var(--text-muted)' }}>Relationship</label>
                <select
                  value={emergencyRel}
                  onChange={(e) => setEmergencyRel(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '8px',
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid var(--border-glow)',
                    color: '#fff',
                    cursor: 'pointer'
                  }}
                >
                  {['Parent', 'Sibling', 'Friend', 'Guardian', 'Spouse', 'Other'].map(r => (
                    <option key={r} value={r} style={{ background: 'var(--bg-app)' }}>{r}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.82rem', color: 'var(--text-muted)' }}>Phone Number</label>
                <input
                  type="text"
                  value={emergencyPhone}
                  onChange={(e) => setEmergencyPhone(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '8px',
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid var(--border-glow)',
                    color: '#fff'
                  }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
              <input
                type="checkbox"
                id="settingsConsentCheck"
                checked={emergencyConsent}
                onChange={(e) => setEmergencyConsent(e.target.checked)}
                style={{ marginTop: '4px', cursor: 'pointer', accentColor: 'var(--color-accent-rose)' }}
              />
              <label htmlFor="settingsConsentCheck" style={{ fontSize: '0.8rem', color: 'var(--text-muted)', cursor: 'pointer' }}>
                Allow ZenStudy to notify my emergency contact if I choose to during severe emotional distress alerts.
              </label>
            </div>
          </div>

          {status && (
            <div style={{ 
              padding: '12px', 
              borderRadius: '8px', 
              fontSize: '0.88rem', 
              background: 'rgba(20, 184, 166, 0.1)', 
              border: '1px solid rgba(20, 184, 166, 0.2)', 
              color: 'var(--color-accent-teal)',
              textAlign: 'center'
            }}>
              {status}
            </div>
          )}

          <button type="submit" className="btn-primary" style={{ alignSelf: 'flex-start', padding: '12px 28px' }}>
            <Save size={16} /> Save Configurations
          </button>

        </form>
      </div>

      {/* Danger Zone */}
      <div className="glass-panel" style={{ padding: '28px', borderLeft: '4px solid var(--color-accent-rose)' }}>
        <h2 style={{ fontSize: '1.25rem', color: 'var(--color-accent-rose)', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
          <AlertOctagon size={20} /> Danger Control Zone
        </h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem', marginBottom: '16px', lineHeight: '1.45' }}>
          Clearing local configuration resets your exam countdown profile and erases all historical daily reflections, stress indexes, and chat records permanently. This action cannot be undone.
        </p>

        {showConfirmReset ? (
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--color-accent-rose)', fontWeight: 'bold' }}>Are you sure?</span>
            <button 
              onClick={handleResetData}
              style={{
                background: 'var(--color-accent-rose)',
                border: 'none',
                color: '#fff',
                padding: '8px 16px',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '0.8rem',
                fontWeight: 'bold'
              }}
            >
              Yes, Delete All
            </button>
            <button 
              onClick={() => setShowConfirmReset(false)}
              className="btn-secondary"
              style={{ padding: '8px 16px', fontSize: '0.8rem' }}
            >
              Cancel
            </button>
          </div>
        ) : (
          <button 
            onClick={() => setShowConfirmReset(true)}
            style={{
              background: 'rgba(244, 63, 94, 0.1)',
              border: '1px solid rgba(244, 63, 94, 0.2)',
              color: 'var(--color-accent-rose)',
              padding: '10px 20px',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '0.85rem',
              fontWeight: '550',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'var(--transition-smooth)'
            }}
            onMouseOver={(e) => e.target.style.background = 'rgba(244, 63, 94, 0.18)'}
            onMouseOut={(e) => e.target.style.background = 'rgba(244, 63, 94, 0.1)'}
          >
            <Trash2 size={14} /> Reset Local Application
          </button>
        )}
      </div>

    </div>
  );
}
