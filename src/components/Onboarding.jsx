import React, { useState } from 'react';
import { BookOpen, User, Clock, Calendar, ArrowRight, ShieldAlert, GraduationCap } from 'lucide-react';

const EXAMS = [
  { id: 'JEE', name: 'JEE (Main & Advanced)', category: 'Engineering', desc: 'Physics, Chemistry, & Mathematics focus' },
  { id: 'NEET', name: 'NEET (UG)', category: 'Medical', desc: 'Biology, Physics, & Chemistry recall' },
  { id: 'UPSC', name: 'UPSC Civil Services', category: 'Government', desc: 'General Studies & Syllabus marathon' },
  { id: 'CAT', name: 'CAT', category: 'Management', desc: 'Quantitative, Verbal, & Logical analysis' },
  { id: 'GATE', name: 'GATE', category: 'Post-Grad Engineering', desc: 'Technical specialization & Concepts' },
  { id: 'BOARDS', name: 'High School Boards', category: 'School Boards', desc: 'Curriculum mastery & Subjective writing' }
];

export default function Onboarding({ onComplete }) {
  const [name, setName] = useState('');
  const [selectedExam, setSelectedExam] = useState('');
  const [examDate, setExamDate] = useState('');
  const [studyHours, setStudyHours] = useState('8');
  
  // Emergency Contact States
  const [emergencyName, setEmergencyName] = useState('');
  const [emergencyRel, setEmergencyRel] = useState('Parent');
  const [emergencyPhone, setEmergencyPhone] = useState('');
  const [emergencyConsent, setEmergencyConsent] = useState(false);

  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return setError('Please enter your name.');
    if (!selectedExam) return setError('Please select a target competitive exam.');
    if (!examDate) return setError('Please select your target exam date.');
    if (!emergencyName.trim()) return setError('Please enter an emergency contact name.');
    if (!emergencyPhone.trim()) return setError('Please enter an emergency contact phone number.');

    onComplete({
      name: name.trim(),
      exam: selectedExam,
      examDate,
      studyHours: parseInt(studyHours) || 8,
      emergencyContact: {
        name: emergencyName.trim(),
        relationship: emergencyRel,
        phone: emergencyPhone.trim(),
        consent: emergencyConsent
      }
    });
  };

  return (
    <div className="onboarding-wrapper" style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      padding: '40px 24px',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Background glow meshes */}
      <div className="ambient-bg-glow glow-purple" />
      <div className="ambient-bg-glow glow-teal" style={{ bottom: '5%', right: '5%' }} />

      <div className="glass-panel animate-fade-in" style={{
        maxWidth: '850px',
        width: '100%',
        padding: '40px',
        boxShadow: 'var(--glass-shadow)',
        borderRadius: '24px'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div style={{ 
            display: 'inline-flex', 
            padding: '12px', 
            background: 'var(--color-primary-glow)', 
            borderRadius: '16px',
            marginBottom: '12px',
            color: 'var(--color-primary)'
          }}>
            <GraduationCap size={40} />
          </div>
          <h1 style={{ fontSize: '2.4rem', marginBottom: '6px', color: '#fff' }}>Welcome to ZenStudy</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '1.05rem' }}>
            Your GenAI mental wellness companion for navigating competitive exam preparation.
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Name & Study Hours */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div>
              <label htmlFor="onboarding-name" style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                <User size={14} style={{ marginRight: '6px', verticalAlign: 'middle' }} /> Name
              </label>
              <input
                id="onboarding-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="What should we call you?"
                style={{
                  width: '100%',
                  padding: '11px 14px',
                  borderRadius: '8px',
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid var(--border-glow)',
                  color: '#fff',
                  fontSize: '0.95rem',
                  outline: 'none',
                  transition: 'var(--transition-smooth)'
                }}
                onFocus={(e) => e.target.style.borderColor = 'var(--color-primary)'}
                onBlur={(e) => e.target.style.borderColor = 'var(--border-glow)'}
              />
            </div>
            <div>
              <label htmlFor="onboarding-study-hours" style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                <Clock size={14} style={{ marginRight: '6px', verticalAlign: 'middle' }} /> Daily Study Target (Hours)
              </label>
              <select
                id="onboarding-study-hours"
                value={studyHours}
                onChange={(e) => setStudyHours(e.target.value)}
                style={{
                  width: '100%',
                  padding: '11px 14px',
                  borderRadius: '8px',
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid var(--border-glow)',
                  color: '#fff',
                  fontSize: '0.95rem',
                  outline: 'none',
                  cursor: 'pointer'
                }}
              >
                {[4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14].map(h => (
                  <option key={h} value={h} style={{ background: 'var(--bg-app)' }}>{h} Hours / Day</option>
                ))}
              </select>
            </div>
          </div>

          {/* Exam Selection */}
          <div>
            <label style={{ display: 'block', marginBottom: '10px', fontWeight: '500', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              <BookOpen size={14} style={{ marginRight: '6px', verticalAlign: 'middle' }} /> Select Target Entrance/Board Exam
            </label>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
              gap: '14px',
              maxHeight: '190px',
              overflowY: 'auto',
              paddingRight: '6px'
            }}>
              {EXAMS.map(exam => {
                const isSelected = selectedExam === exam.id;
                return (
                  <div
                    key={exam.id}
                    onClick={() => setSelectedExam(exam.id)}
                    style={{
                      padding: '12px 14px',
                      borderRadius: '10px',
                      background: isSelected ? 'rgba(138, 43, 226, 0.15)' : 'rgba(255, 255, 255, 0.03)',
                      border: isSelected ? '2px solid var(--color-primary)' : '1px solid var(--border-glow)',
                      cursor: 'pointer',
                      transition: 'var(--transition-smooth)',
                      position: 'relative'
                    }}
                  >
                    <span style={{
                      position: 'absolute',
                      top: '10px',
                      right: '10px',
                      fontSize: '0.65rem',
                      fontWeight: 'bold',
                      color: isSelected ? 'var(--color-primary)' : 'var(--color-accent-teal)',
                      background: 'rgba(255, 255, 255, 0.05)',
                      padding: '1px 6px',
                      borderRadius: '8px'
                    }}>
                      {exam.category}
                    </span>
                    <h3 style={{ fontSize: '0.98rem', color: '#fff', marginBottom: '2px' }}>{exam.id}</h3>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{exam.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Exam Date */}
          <div>
            <label htmlFor="onboarding-exam-date" style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              <Calendar size={14} style={{ marginRight: '6px', verticalAlign: 'middle' }} /> Target Exam Date
            </label>
            <input
              id="onboarding-exam-date"
              type="date"
              value={examDate}
              onChange={(e) => setExamDate(e.target.value)}
              style={{
                width: '100%',
                padding: '11px 14px',
                borderRadius: '8px',
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid var(--border-glow)',
                color: '#fff',
                fontSize: '0.95rem',
                outline: 'none'
              }}
            />
          </div>

          {/* Emergency Contact safety panel */}
          <div style={{
            border: '1px solid rgba(244, 63, 94, 0.25)',
            background: 'rgba(244, 63, 94, 0.03)',
            padding: '18px',
            borderRadius: '12px'
          }}>
            <h3 style={{ fontSize: '1rem', color: '#fff', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
              <ShieldAlert size={16} style={{ color: 'var(--color-accent-rose)' }} /> Emergency Contact (Safety Support)
            </h3>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '14px', marginBottom: '14px' }}>
              <div>
                <label htmlFor="onboarding-emergency-name" style={{ display: 'block', marginBottom: '6px', fontSize: '0.78rem', color: 'var(--text-muted)' }}>Contact Name</label>
                <input
                  id="onboarding-emergency-name"
                  type="text"
                  placeholder="E.g., Parent Name"
                  value={emergencyName}
                  onChange={(e) => setEmergencyName(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '6px',
                    background: 'rgba(0,0,0,0.2)',
                    border: '1px solid var(--border-glow)',
                    color: '#fff',
                    fontSize: '0.85rem',
                    outline: 'none'
                  }}
                />
              </div>
              <div>
                <label htmlFor="onboarding-emergency-rel" style={{ display: 'block', marginBottom: '6px', fontSize: '0.78rem', color: 'var(--text-muted)' }}>Relationship</label>
                <select
                  id="onboarding-emergency-rel"
                  value={emergencyRel}
                  onChange={(e) => setEmergencyRel(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '6px',
                    background: 'rgba(0,0,0,0.2)',
                    border: '1px solid var(--border-glow)',
                    color: '#fff',
                    fontSize: '0.85rem',
                    cursor: 'pointer'
                  }}
                >
                  {['Parent', 'Sibling', 'Friend', 'Guardian', 'Spouse', 'Other'].map(r => (
                    <option key={r} value={r} style={{ background: 'var(--bg-app)' }}>{r}</option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="onboarding-emergency-phone" style={{ display: 'block', marginBottom: '6px', fontSize: '0.78rem', color: 'var(--text-muted)' }}>Phone Number</label>
                <input
                  id="onboarding-emergency-phone"
                  type="text"
                  placeholder="+1 (555) 019-2834"
                  value={emergencyPhone}
                  onChange={(e) => setEmergencyPhone(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '6px',
                    background: 'rgba(0,0,0,0.2)',
                    border: '1px solid var(--border-glow)',
                    color: '#fff',
                    fontSize: '0.85rem',
                    outline: 'none'
                  }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
              <input
                type="checkbox"
                id="onboarding-emergency-consent"
                checked={emergencyConsent}
                onChange={(e) => setEmergencyConsent(e.target.checked)}
                style={{ marginTop: '4px', cursor: 'pointer', accentColor: 'var(--color-accent-rose)' }}
              />
              <label htmlFor="onboarding-emergency-consent" style={{ fontSize: '0.8rem', color: 'var(--text-muted)', cursor: 'pointer', lineHeight: '1.4' }}>
                Allow ZenStudy to notify my emergency contact if I choose to during severe emotional distress. 
                <span style={{ color: 'var(--color-accent-rose)', marginLeft: '4px' }}>*MindMate will never alert anyone without your explicit action.</span>
              </label>
            </div>
          </div>

          {error && (
            <p style={{ color: 'var(--color-accent-rose)', fontSize: '0.9rem', textAlign: 'center', fontWeight: '500' }}>
              {error}
            </p>
          )}

          <button type="submit" className="btn-primary" style={{ alignSelf: 'center', marginTop: '4px', padding: '12px 36px', fontSize: '1.05rem' }}>
            Enter ZenSpace <ArrowRight size={16} />
          </button>
        </form>
      </div>
    </div>
  );
}
