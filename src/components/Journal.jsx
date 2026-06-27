import React, { useState } from 'react';
import { 
  PenTool, Brain, Sparkles, AlertCircle, 
  Smile, CheckCircle2, Loader2, Zap
} from 'lucide-react';

const WRITING_PROMPTS = [
  "How did today's mock tests or study schedule feel? What concept was hardest?",
  "Did you catch yourself comparing your scoring metrics to peers today? How did you respond?",
  "Write down the single largest worry you have right now about your exam. Let's get it out of your head.",
  "How did your energy levels hold up today? Did you take breaks or sleep well last night?"
];

export default function Journal({ geminiService, user, onLogAdded, onCheckDistress }) {
  const [text, setText] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [activePromptIndex, setActivePromptIndex] = useState(0);
  const [statusMessage, setStatusMessage] = useState('');

  const handleNextPrompt = () => {
    setActivePromptIndex((prev) => (prev + 1) % WRITING_PROMPTS.length);
  };

  const handleAnalyze = async () => {
    if (!text.trim()) return;
    if (text.trim().length < 15) {
      setStatusMessage('Please write at least 15 characters to allow GenAI to detect emotional depth.');
      return;
    }

    setIsAnalyzing(true);
    setStatusMessage('');
    setAnalysisResult(null);

    try {
      // Call service
      const result = await geminiService.analyzeJournal(text, user.exam);
      
      setAnalysisResult(result);
      
      // Save log entry to history
      const newLog = {
        id: Date.now().toString(),
        timestamp: new Date().toISOString(),
        text: text.trim(),
        analysis: result
      };

      onLogAdded(newLog);
      
      // Safety Check intercept trigger
      onCheckDistress(result.stressScore);

      setStatusMessage('Reflection log analyzed and saved successfully!');
    } catch (err) {
      setStatusMessage('Failed to complete AI review. Please check your credentials or try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleClear = () => {
    setText('');
    setAnalysisResult(null);
    setStatusMessage('');
  };

  // Color code stress category
  const getCategoryColor = (category) => {
    switch (category) {
      case 'Burnout Risk': return 'var(--color-accent-rose)';
      case 'Mild Stress': return 'var(--color-accent-amber)';
      default: return 'var(--color-accent-teal)';
    }
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      <div>
        <h1 style={{ fontSize: '2.2rem', color: '#fff', marginBottom: '4px' }}>Zen Reflection Journal</h1>
        <p style={{ color: 'var(--text-muted)' }}>Venting out preparation stress is a proven way to clear mental RAM. Write freely below.</p>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(440px, 1fr))',
        gap: '24px',
        alignItems: 'start'
      }}>
        
        {/* Left Side: Writing Space */}
        <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          {/* Daily Prompt Cards */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.02)',
            border: '1px solid var(--border-glow)',
            padding: '16px',
            borderRadius: '12px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '12px'
          }}>
            <div>
              <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--color-accent-teal)', fontWeight: 'bold', marginBottom: '4px', letterSpacing: '0.5px' }}>Mindful Writing Prompt</div>
              <p style={{ fontSize: '0.9rem', color: '#fff', lineHeight: '1.4' }}>"{WRITING_PROMPTS[activePromptIndex]}"</p>
            </div>
            <button 
              onClick={handleNextPrompt}
              aria-label="Get next journaling prompt suggestion"
              style={{
                background: 'rgba(255, 255, 255, 0.05)',
                border: 'none',
                color: 'var(--text-muted)',
                padding: '6px 12px',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '0.8rem',
                whiteSpace: 'nowrap',
                transition: 'var(--transition-smooth)'
              }}
              onMouseOver={(e) => e.target.style.background = 'rgba(255, 255, 255, 0.1)'}
              onMouseOut={(e) => e.target.style.background = 'rgba(255, 255, 255, 0.05)'}
            >
              Next Prompt
            </button>
          </div>

          {/* Text Editor */}
          <div style={{ position: 'relative' }}>
            <label htmlFor="journal-editor-text" style={{ position: 'absolute', width: '1px', height: '1px', padding: '0', margin: '-1px', overflow: 'hidden', clip: 'rect(0, 0, 0, 0)', border: '0' }}>Type study reflections here</label>
            <textarea
              id="journal-editor-text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Start typing your study logs, worries, mock exam concerns, or daily recap here..."
              aria-label="Write study reflections"
              style={{
                width: '100%',
                height: '280px',
                background: 'rgba(0,0,0,0.2)',
                border: '1px solid var(--border-glow)',
                borderRadius: '12px',
                padding: '18px',
                color: '#fff',
                fontSize: '1rem',
                fontFamily: 'Inter, sans-serif',
                lineHeight: '1.6',
                resize: 'none',
                outline: 'none',
                transition: 'var(--transition-smooth)'
              }}
              onFocus={(e) => e.target.style.borderColor = 'var(--color-primary)'}
              onBlur={(e) => e.target.style.borderColor = 'var(--border-glow)'}
              disabled={isAnalyzing}
            />
            <div style={{
              position: 'absolute',
              bottom: '12px',
              right: '18px',
              fontSize: '0.78rem',
              color: text.trim().length >= 15 ? 'var(--text-dim)' : 'var(--color-accent-amber)'
            }}>
              {text.length} characters {text.trim().length < 15 && '(Need at least 15)'}
            </div>
          </div>

          {/* Action buttons */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
            <button 
              onClick={handleClear}
              className="btn-secondary"
              aria-label="Clear all text from journal editor"
              style={{ padding: '10px 20px', fontSize: '0.9rem' }}
              disabled={isAnalyzing || !text}
            >
              Clear Text
            </button>
            
            <button
              onClick={handleAnalyze}
              className="btn-primary"
              aria-label="Analyze journal entry sentiment and save to history"
              style={{ 
                padding: '10px 24px', 
                fontSize: '0.95rem',
                opacity: (isAnalyzing || text.trim().length < 15) ? 0.6 : 1,
                cursor: (isAnalyzing || text.trim().length < 15) ? 'not-allowed' : 'pointer'
              }}
              disabled={isAnalyzing || text.trim().length < 15}
            >
              {isAnalyzing ? (
                <>
                  <Loader2 size={16} className="spinner" style={{ animation: 'spin 1s linear infinite' }} /> Analyzing sentiment...
                </>
              ) : (
                <>
                  Analyze & Save <Sparkles size={16} />
                </>
              )}
            </button>
          </div>

          {statusMessage && (
            <div style={{
              marginTop: '12px',
              padding: '12px',
              borderRadius: '8px',
              fontSize: '0.88rem',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              background: statusMessage.includes('Save') ? 'rgba(20, 184, 166, 0.1)' : 'rgba(245, 158, 11, 0.1)',
              border: statusMessage.includes('Save') ? '1px solid rgba(20, 184, 166, 0.2)' : '1px solid rgba(245, 158, 11, 0.2)',
              color: statusMessage.includes('Save') ? 'var(--color-accent-teal)' : 'var(--color-accent-amber)'
            }}>
              {statusMessage.includes('Save') ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
              {statusMessage}
            </div>
          )}

        </div>

        {/* Right Side: Upgraded 18-Field GenAI Insights Panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          <div className="glass-panel" style={{ padding: '24px', minHeight: '380px', display: 'flex', flexDirection: 'column' }}>
            <h2 style={{ fontSize: '1.25rem', color: '#fff', borderBottom: '1px solid var(--border-glow)', paddingBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
              <Brain size={20} style={{ color: 'var(--color-primary)' }} /> GenAI Analysis Panel
            </h2>

            {isAnalyzing && (
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '16px', color: 'var(--text-muted)' }}>
                <Loader2 size={40} style={{ animation: 'spin 1.5s linear infinite', color: 'var(--color-primary)' }} />
                <div style={{ textAlign: 'center' }}>
                  <h4 style={{ color: '#fff', marginBottom: '4px' }}>Consulting Aura...</h4>
                  <p style={{ fontSize: '0.85rem' }}>Extracting stress indexes and latent preparational triggers.</p>
                </div>
              </div>
            )}

            {!isAnalyzing && !analysisResult && (
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--text-dim)', textAlign: 'center', padding: '24px' }}>
                <PenTool size={36} style={{ marginBottom: '12px' }} />
                <h4 style={{ color: 'var(--text-muted)', marginBottom: '4px' }}>Awaiting Reflection Entry</h4>
                <p style={{ fontSize: '0.82rem' }}>Write details about your study load and press "Analyze & Save" to view live cognitive breakdowns.</p>
              </div>
            )}

            {!isAnalyzing && analysisResult && (
              <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
                
                {/* 1. Core Summary Score row */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
                  
                  {/* Stress Score */}
                  <div className="glass-panel" style={{ padding: '12px', background: 'rgba(255, 255, 255, 0.02)', textAlign: 'center' }}>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>STRESS SCORE</span>
                    <div style={{ fontSize: '1.6rem', fontWeight: 'bold', color: '#fff', margin: '4px 0', fontFamily: 'Outfit' }}>
                      {analysisResult.stressScore}
                    </div>
                    <span style={{ fontSize: '0.7rem', color: getCategoryColor(analysisResult.burnoutRisk === 'high' ? 'Burnout Risk' : 'Safe'), fontWeight: 'bold' }}>
                      {analysisResult.burnoutRisk.toUpperCase()} RISK
                    </span>
                  </div>

                  {/* Wellness Score */}
                  <div className="glass-panel" style={{ padding: '12px', background: 'rgba(255, 255, 255, 0.02)', textAlign: 'center' }}>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>WELLNESS</span>
                    <div style={{ fontSize: '1.6rem', fontWeight: 'bold', color: 'var(--color-accent-teal)', margin: '4px 0', fontFamily: 'Outfit' }}>
                      {analysisResult.wellnessScore}
                    </div>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                      {analysisResult.emotionalStability.toUpperCase()}
                    </span>
                  </div>

                  {/* Anxiety rating */}
                  <div className="glass-panel" style={{ padding: '12px', background: 'rgba(255, 255, 255, 0.02)', textAlign: 'center' }}>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>ANXIETY LEVEL</span>
                    <div style={{ 
                      fontSize: '1.6rem', 
                      fontWeight: 'bold', 
                      margin: '4px 0', 
                      fontFamily: 'Outfit',
                      color: analysisResult.anxietyLevel === 'high' ? 'var(--color-accent-rose)' : 'var(--text-muted)'
                    }}>
                      {analysisResult.anxietyLevel.toUpperCase()}
                    </div>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                      Stability check
                    </span>
                  </div>

                </div>

                {/* 2. Emotional stability summary text */}
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: '1.4', background: 'rgba(255,255,255,0.01)', padding: '10px 14px', borderRadius: '8px', borderLeft: '3px solid var(--color-primary)' }}>
                  {analysisResult.summary}
                </p>

                {/* 3. Double Emotion tag box */}
                <div>
                  <h4 style={{ fontSize: '0.78rem', color: 'var(--text-dim)', textTransform: 'uppercase', marginBottom: '8px', letterSpacing: '0.5px' }}>Sentiment Tones</h4>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <span style={{ background: 'rgba(138, 43, 226, 0.1)', border: '1px solid var(--border-glow)', color: 'var(--text-main)', padding: '4px 12px', borderRadius: '12px', fontSize: '0.78rem', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                      <Smile size={12} style={{ color: 'var(--color-primary)' }} /> Primary: {analysisResult.primaryEmotion}
                    </span>
                    {analysisResult.secondaryEmotion && (
                      <span style={{ background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border-glow)', color: 'var(--text-muted)', padding: '4px 12px', borderRadius: '12px', fontSize: '0.78rem' }}>
                        Secondary: {analysisResult.secondaryEmotion}
                      </span>
                    )}
                  </div>
                </div>

                {/* 4. Sliders Grid: Focus, Motivation, Confidence */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <h4 style={{ fontSize: '0.78rem', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Performance Indexes</h4>
                  
                  {/* Confidence */}
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
                      <span>Academic Confidence</span>
                      <span style={{ color: '#fff', fontWeight: 'bold' }}>{analysisResult.confidence}%</span>
                    </div>
                    <div style={{ background: 'rgba(255, 255, 255, 0.05)', height: '6px', borderRadius: '3px', overflow: 'hidden' }}>
                      <div style={{ width: `${analysisResult.confidence}%`, height: '100%', background: 'var(--color-accent-teal)' }} />
                    </div>
                  </div>

                  {/* Motivation */}
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
                      <span>Syllabus Motivation</span>
                      <span style={{ color: '#fff', fontWeight: 'bold' }}>{analysisResult.motivation}%</span>
                    </div>
                    <div style={{ background: 'rgba(255, 255, 255, 0.05)', height: '6px', borderRadius: '3px', overflow: 'hidden' }}>
                      <div style={{ width: `${analysisResult.motivation}%`, height: '100%', background: 'var(--color-primary)' }} />
                    </div>
                  </div>

                  {/* Focus */}
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
                      <span>Retention Focus</span>
                      <span style={{ color: '#fff', fontWeight: 'bold' }}>{analysisResult.focus}%</span>
                    </div>
                    <div style={{ background: 'rgba(255, 255, 255, 0.05)', height: '6px', borderRadius: '3px', overflow: 'hidden' }}>
                      <div style={{ width: `${analysisResult.focus}%`, height: '100%', background: 'var(--color-accent-blue)' }} />
                    </div>
                  </div>

                </div>

                {/* 5. Habit Audit Cards */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div style={{ background: 'rgba(20, 184, 166, 0.03)', border: '1px solid rgba(20, 184, 166, 0.15)', padding: '12px', borderRadius: '8px' }}>
                    <span style={{ fontSize: '0.72rem', color: 'var(--color-accent-teal)', fontWeight: 'bold', display: 'block', marginBottom: '6px' }}>POSSITIVE HABITS</span>
                    <ul style={{ listStyleType: 'none', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      {analysisResult.positiveHabits.map((h) => (
                        <li key={h} style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>✓ {h}</li>
                      ))}
                    </ul>
                  </div>

                  <div style={{ background: 'rgba(244, 63, 94, 0.03)', border: '1px solid rgba(244, 63, 94, 0.15)', padding: '12px', borderRadius: '8px' }}>
                    <span style={{ fontSize: '0.72rem', color: 'var(--color-accent-rose)', fontWeight: 'bold', display: 'block', marginBottom: '6px' }}>BURN OVER WARNINGS</span>
                    <ul style={{ listStyleType: 'none', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      {analysisResult.negativeHabits.map((h) => (
                        <li key={h} style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>• {h}</li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* 6. Observations */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', background: 'rgba(0,0,0,0.1)', padding: '12px', borderRadius: '8px' }}>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-dim)' }}>
                    <strong style={{ color: 'var(--color-accent-blue)' }}>Sleep:</strong> {analysisResult.sleepObservations}
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-dim)' }}>
                    <strong style={{ color: 'var(--color-accent-teal)' }}>Study:</strong> {analysisResult.studyObservations}
                  </div>
                </div>

                {/* 7. Coping Strategies list */}
                <div>
                  <h4 style={{ fontSize: '0.78rem', color: 'var(--text-dim)', textTransform: 'uppercase', marginBottom: '8px' }}>Coping Strategies</h4>
                  <ul style={{ listStyleType: 'none', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {analysisResult.copingStrategies.map((rec) => (
                      <li key={rec} style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', gap: '8px' }}>
                        <span style={{ color: 'var(--color-accent-teal)' }}>✓</span>
                        {rec}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* 8. Motivational closure Card */}
                <div className="glass-panel" style={{ padding: '14px', background: 'rgba(255,255,255,0.01)', borderLeft: '3px solid var(--color-accent-rose)' }}>
                  <h5 style={{ fontSize: '0.8rem', color: '#fff', marginBottom: '4px', display: 'flex', gap: '4px', alignItems: 'center' }}>
                    <Zap size={12} style={{ color: 'var(--color-accent-amber)' }} /> Guidance Message
                  </h5>
                  <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontStyle: 'italic', lineHeight: '1.45' }}>
                    "{analysisResult.motivationalMessage}"
                  </p>
                </div>

              </div>
            )}

          </div>

        </div>

      </div>

    </div>
  );
}
