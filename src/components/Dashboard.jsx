import React, { useMemo, useState } from 'react';
import { 
  Calendar, Flame, TrendingUp, Sparkles, Heart, AlertTriangle, 
  ChevronRight, Brain, Clock, ShieldAlert, Award, FileText,
  TrendingDown, BookOpen, RefreshCw, Star, HelpCircle, Activity
} from 'lucide-react';

export default function Dashboard({ user, logs, patternsData, weeklyReports, onRegenerateWeeklyReport, onViewChange }) {
  const [activeChartTab, setActiveChartTab] = useState('stress'); // stress, sleep, study
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);

  // 1. Calculate Countdown
  const daysRemaining = useMemo(() => {
    if (!user?.examDate) return 0;
    const today = new Date();
    const target = new Date(user.examDate);
    const difference = target.getTime() - today.getTime();
    const days = Math.ceil(difference / (1000 * 60 * 60 * 24));
    return days > 0 ? days : 0;
  }, [user?.examDate]);

  // 2. Extract Today's/Latest Metrics
  const latestLog = logs[0] || null;
  const todayMetrics = useMemo(() => {
    if (!latestLog) {
      return {
        mood: 'None',
        stress: 0,
        wellness: 0,
        burnout: 'low',
        rec: 'Write your first journal reflection to generate AI coaching recommendations.'
      };
    }
    const a = latestLog.analysis || {};
    return {
      mood: a.primaryEmotion || 'Steady',
      stress: a.stressScore || 0,
      wellness: a.wellnessScore || 0,
      burnout: a.burnoutRisk || 'low',
      rec: a.copingStrategies?.[0] || 'Take regular study breaks and focus on active recall.'
    };
  }, [latestLog]);

  // 3. Compute Averages
  const stats = useMemo(() => {
    if (logs.length === 0) {
      return { avgStress: 0, avgWellness: 0, status: 'No Data Yet', color: 'var(--color-accent-teal)' };
    }
    const sumStress = logs.reduce((acc, curr) => acc + (curr.analysis?.stressScore || 0), 0);
    const sumWellness = logs.reduce((acc, curr) => acc + (curr.analysis?.wellnessScore || 0), 0);
    
    const avgStress = Math.round(sumStress / logs.length);
    const avgWellness = Math.round(sumWellness / logs.length);

    let status = 'Mental Balanced';
    let color = 'var(--color-accent-teal)';

    if (avgStress > 75) {
      status = 'Burnout Risk';
      color = 'var(--color-accent-rose)';
    } else if (avgStress > 45) {
      status = 'Mild Stress';
      color = 'var(--color-accent-amber)';
    }

    return { avgStress, avgWellness, status, color };
  }, [logs]);

  // 4. Calculate Badges Earned
  const badges = useMemo(() => {
    const list = [];
    
    // Consistency Badge
    if (logs.length >= 5) {
      list.push({ id: 'consist', name: 'Reflective Scholar', desc: '5+ Daily Reflections', icon: '🏆', color: 'var(--color-accent-teal)' });
    } else if (logs.length >= 2) {
      list.push({ id: 'consist', name: 'Steady Starter', desc: 'Logged 2+ check-ins', icon: '🌱', color: 'var(--color-accent-blue)' });
    }

    // Stress Control Badge
    if (logs.length >= 3 && stats.avgStress < 45) {
      list.push({ id: 'stress', name: 'Zen Master', desc: 'Avg stress < 45', icon: '🧘', color: 'var(--color-primary)' });
    }

    // Sleep Priority Badge
    const exhaustedLogsCount = logs.filter(l => l.analysis?.hiddenStressTriggers?.some(t => t.includes('Sleep'))).length;
    if (logs.length >= 3 && exhaustedLogsCount === 0) {
      list.push({ id: 'sleep', name: 'REM Optimizer', desc: 'Consistent Rest Pacing', icon: '⚡', color: 'var(--color-accent-amber)' });
    }

    // Onboarding Badge
    list.push({ id: 'onboard', name: 'MindMate Cadet', desc: 'Initialized Profile', icon: '🛡️', color: 'var(--color-accent-rose)' });

    return list;
  }, [logs, stats]);

  // 5. Weekly Summary Trigger
  const handleRegenReport = async () => {
    setIsGeneratingReport(true);
    try {
      await onRegenerateWeeklyReport();
    } catch(e) {
      console.error(e);
    } finally {
      setIsGeneratingReport(false);
    }
  };

  // 6. SVG Render Paths based on Active Tab
  const svgChart = useMemo(() => {
    if (logs.length < 2) return null;
    
    const chartLogs = [...logs].slice(-7).reverse(); // Chronological
    const width = 500;
    const height = 160;
    const padding = 30;
    
    const xStep = (width - padding * 2) / (chartLogs.length - 1);
    
    let points = [];
    let pathD = '';
    let areaD = '';
    let yMax = 100;
    let yMin = 0;
    let label = 'Stress Score';
    let strokeColor = 'var(--color-primary)';
    let areaColor = 'var(--color-primary-glow)';

    if (activeChartTab === 'stress') {
      points = chartLogs.map((log, index) => {
        const score = log.analysis?.stressScore || 40;
        const x = padding + index * xStep;
        const y = height - padding - (score / 100) * (height - padding * 2);
        return { x, y, value: score, date: new Date(log.timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) };
      });
    } else if (activeChartTab === 'sleep') {
      label = 'Sleep Quality (Est)';
      strokeColor = 'var(--color-accent-blue)';
      areaColor = 'var(--color-accent-blue-glow)';
      points = chartLogs.map((log, index) => {
        const sleepTriggered = log.analysis?.hiddenStressTriggers?.some(t => t.includes('Sleep'));
        const sleepHours = sleepTriggered ? 5.5 : 7.5;
        const x = padding + index * xStep;
        const y = height - padding - (sleepHours / 10) * (height - padding * 2);
        return { x, y, value: `${sleepHours} hrs`, date: new Date(log.timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) };
      });
    } else if (activeChartTab === 'study') {
      label = 'Wellness Pacing';
      strokeColor = 'var(--color-accent-teal)';
      areaColor = 'var(--color-accent-teal-glow)';
      points = chartLogs.map((log, index) => {
        const score = log.analysis?.wellnessScore || 50;
        const x = padding + index * xStep;
        const y = height - padding - (score / 100) * (height - padding * 2);
        return { x, y, value: score, date: new Date(log.timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) };
      });
    }

    pathD = points.reduce((acc, curr, idx) => {
      return idx === 0 ? `M ${curr.x} ${curr.y}` : `${acc} L ${curr.x} ${curr.y}`;
    }, '');

    areaD = `${pathD} L ${points[points.length - 1].x} ${height - padding} L ${points[0].x} ${height - padding} Z`;

    return { points, pathD, areaD, width, height, padding, label, strokeColor, areaColor };
  }, [logs, activeChartTab]);

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
      
      {/* Welcome Banner */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '2.2rem', color: '#fff', marginBottom: '4px' }}>Welcome back, {user?.name}!</h1>
          <p style={{ color: 'var(--text-muted)' }}>Empowering your mental preparation for <strong style={{ color: 'var(--color-primary)' }}>{user?.exam}</strong>.</p>
        </div>
        
        {/* Countdown */}
        <div className="glass-panel animate-float" style={{
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
          padding: '12px 24px',
          borderLeft: '4px solid var(--color-accent-rose)',
          borderRadius: '12px'
        }}>
          <Calendar size={28} style={{ color: 'var(--color-accent-rose)' }} />
          <div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>Days to {user?.exam}</div>
            <div style={{ fontSize: '1.6rem', fontWeight: 'bold', color: '#fff', fontFamily: 'Outfit' }}>
              {daysRemaining} Days
            </div>
          </div>
        </div>
      </div>

      {/* Phase 5 Core - Today's Wellness Metric Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '20px'
      }}>
        {/* Today's Mood */}
        <div className="glass-panel" style={{ padding: '20px', borderTop: '3px solid var(--color-accent-teal)' }}>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-dim)', textTransform: 'uppercase' }}>Today's Mood</span>
          <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#fff', margin: '8px 0', fontFamily: 'Outfit', textTransform: 'capitalize' }}>
            {todayMetrics.mood}
          </div>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Detected from latest log</span>
        </div>

        {/* Today's Stress */}
        <div className="glass-panel" style={{ padding: '20px', borderTop: '3px solid var(--color-primary)' }}>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-dim)', textTransform: 'uppercase' }}>Today's Stress</span>
          <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#fff', margin: '8px 0', fontFamily: 'Outfit' }}>
            {todayMetrics.stress} <span style={{ fontSize: '1rem', color: 'var(--text-dim)' }}>/100</span>
          </div>
          <span style={{ fontSize: '0.78rem', color: todayMetrics.stress > 70 ? 'var(--color-accent-rose)' : 'var(--text-muted)' }}>
            {todayMetrics.stress > 70 ? 'High baseline stress' : 'Normal stress range'}
          </span>
        </div>

        {/* Wellness Score */}
        <div className="glass-panel" style={{ padding: '20px', borderTop: '3px solid var(--color-accent-blue)' }}>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-dim)', textTransform: 'uppercase' }}>Wellness Score</span>
          <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#fff', margin: '8px 0', fontFamily: 'Outfit' }}>
            {todayMetrics.wellness} <span style={{ fontSize: '1rem', color: 'var(--text-dim)' }}>/100</span>
          </div>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Cognitive recovery score</span>
        </div>

        {/* Burnout Risk */}
        <div className="glass-panel" style={{ padding: '20px', borderTop: '3px solid var(--color-accent-rose)' }}>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-dim)', textTransform: 'uppercase' }}>Burnout Risk</span>
          <div style={{ 
            fontSize: '1.5rem', 
            fontWeight: 'bold', 
            margin: '8px 0', 
            fontFamily: 'Outfit',
            color: todayMetrics.burnout === 'high' ? 'var(--color-accent-rose)' : todayMetrics.burnout === 'medium' ? 'var(--color-accent-amber)' : 'var(--color-accent-teal)'
          }}>
            {todayMetrics.burnout.toUpperCase()}
          </div>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Accumulated exhaustion level</span>
        </div>
      </div>

      {/* SVG Trends & Trigger Metrics */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
        gap: '24px'
      }}>
        
        {/* Trend line SVG with Tabs */}
        <div className="glass-panel" style={{ padding: '28px', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
            <h2 style={{ fontSize: '1.25rem', color: '#fff', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <TrendingUp size={20} style={{ color: 'var(--color-primary)' }} /> Visual Wellness Analytics
            </h2>
            
            {/* Chart Tabs */}
            <div style={{ display: 'flex', background: 'rgba(0,0,0,0.15)', padding: '3px', borderRadius: '8px', border: '1px solid var(--border-glow)' }}>
              <button 
                onClick={() => setActiveChartTab('stress')}
                style={{
                  background: activeChartTab === 'stress' ? 'var(--color-primary)' : 'transparent',
                  border: 'none',
                  color: '#fff',
                  padding: '6px 12px',
                  borderRadius: '6px',
                  fontSize: '0.78rem',
                  cursor: 'pointer',
                  fontWeight: activeChartTab === 'stress' ? 'bold' : 'normal',
                  transition: 'var(--transition-smooth)'
                }}
              >
                Stress
              </button>
              <button 
                onClick={() => setActiveChartTab('sleep')}
                style={{
                  background: activeChartTab === 'sleep' ? 'var(--color-accent-blue)' : 'transparent',
                  border: 'none',
                  color: '#fff',
                  padding: '6px 12px',
                  borderRadius: '6px',
                  fontSize: '0.78rem',
                  cursor: 'pointer',
                  fontWeight: activeChartTab === 'sleep' ? 'bold' : 'normal',
                  transition: 'var(--transition-smooth)'
                }}
              >
                Sleep
              </button>
              <button 
                onClick={() => setActiveChartTab('study')}
                style={{
                  background: activeChartTab === 'study' ? 'var(--color-accent-teal)' : 'transparent',
                  border: 'none',
                  color: '#fff',
                  padding: '6px 12px',
                  borderRadius: '6px',
                  fontSize: '0.78rem',
                  cursor: 'pointer',
                  fontWeight: activeChartTab === 'study' ? 'bold' : 'normal',
                  transition: 'var(--transition-smooth)'
                }}
              >
                Wellness
              </button>
            </div>
          </div>

          {svgChart ? (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ fontSize: '0.8rem', color: svgChart.strokeColor, fontWeight: 'bold', alignSelf: 'flex-start', marginBottom: '8px' }}>
                {svgChart.label} Curve
              </div>
              <svg 
                viewBox={`0 0 ${svgChart.width} ${svgChart.height}`} 
                style={{ width: '100%', height: 'auto', overflow: 'visible' }}
              >
                {/* Horizontal guide grids */}
                <line x1={svgChart.padding} y1={svgChart.padding} x2={svgChart.width - svgChart.padding} y2={svgChart.padding} stroke="hsla(260, 20%, 40%, 0.12)" strokeDasharray="4 4" />
                <line x1={svgChart.padding} y1={(svgChart.height) / 2} x2={svgChart.width - svgChart.padding} y2={(svgChart.height) / 2} stroke="hsla(260, 20%, 40%, 0.12)" strokeDasharray="4 4" />
                <line x1={svgChart.padding} y1={svgChart.height - svgChart.padding} x2={svgChart.width - svgChart.padding} y2={svgChart.height - svgChart.padding} stroke="hsla(260, 20%, 40%, 0.22)" />
                
                {/* Gradient mapping */}
                <defs>
                  <linearGradient id="curveGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={svgChart.strokeColor} stopOpacity="0.35" />
                    <stop offset="100%" stopColor={svgChart.strokeColor} stopOpacity="0" />
                  </linearGradient>
                </defs>

                {/* Area */}
                <path d={svgChart.areaD} fill="url(#curveGradient)" />

                {/* Line */}
                <path 
                  d={svgChart.pathD} 
                  fill="none" 
                  stroke={svgChart.strokeColor} 
                  strokeWidth="3" 
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />

                {/* Nodes */}
                {svgChart.points.map((pt, i) => (
                  <g key={i}>
                    <circle 
                      cx={pt.x} 
                      cy={pt.y} 
                      r="4.5" 
                      fill="var(--bg-app)" 
                      stroke={svgChart.strokeColor} 
                      strokeWidth="2.5" 
                    />
                    <text 
                      x={pt.x} 
                      y={pt.y - 10} 
                      fill="#fff" 
                      fontSize="9" 
                      fontWeight="bold" 
                      textAnchor="middle"
                    >
                      {pt.value}
                    </text>
                    <text 
                      x={pt.x} 
                      y={svgChart.height - 8} 
                      fill="var(--text-dim)" 
                      fontSize="7" 
                      textAnchor="middle"
                    >
                      {pt.date}
                    </text>
                  </g>
                ))}
              </svg>
            </div>
          ) : (
            <div style={{ 
              flex: 1, 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center', 
              justifyContent: 'center', 
              padding: '40px 0',
              textAlign: 'center',
              border: '1px dashed var(--border-glow)',
              borderRadius: '12px'
            }}>
              <Activity size={36} style={{ color: 'var(--text-dim)', marginBottom: '12px' }} />
              <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>Insufficient data to plot trendlines.</p>
              <p style={{ color: 'var(--text-dim)', fontSize: '0.8rem', marginTop: '4px' }}>Log at least 2 reflections to map active trends.</p>
            </div>
          )}
        </div>

        {/* Achievement Badges Drawer */}
        <div className="glass-panel" style={{ padding: '28px', display: 'flex', flexDirection: 'column' }}>
          <h2 style={{ fontSize: '1.25rem', color: '#fff', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
            <Star size={20} style={{ color: 'var(--color-accent-amber)' }} /> Achievement Credentials
          </h2>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))',
            gap: '16px',
            flex: 1
          }}>
            {badges.map(b => (
              <div 
                key={b.id} 
                className="glass-panel" 
                style={{
                  padding: '16px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  textAlign: 'center',
                  background: 'rgba(255,255,255,0.01)',
                  borderRadius: '12px',
                  borderTop: `3px solid ${b.color}`
                }}
              >
                <span style={{ fontSize: '2rem', marginBottom: '8px' }}>{b.icon}</span>
                <h4 style={{ fontSize: '0.9rem', color: '#fff', fontWeight: 'bold', marginBottom: '4px' }}>{b.name}</h4>
                <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{b.desc}</p>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* AI Stress Pattern Detection Feature */}
      <div className="glass-panel-accent" style={{ padding: '32px', position: 'relative', overflow: 'hidden' }}>
        
        {/* Background Sparkle Decorator */}
        <div style={{ position: 'absolute', top: '16px', right: '16px', opacity: 0.15, pointerEvents: 'none' }}>
          <Sparkles size={120} style={{ color: 'var(--color-primary)' }} />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
          <div style={{
            display: 'inline-flex',
            padding: '10px',
            background: 'rgba(138, 43, 226, 0.2)',
            borderRadius: '12px',
            color: '#fff',
            border: '1px solid var(--color-primary)'
          }}>
            <ShieldAlert size={24} />
          </div>
          <div>
            <h2 style={{ fontSize: '1.4rem', color: '#fff', display: 'flex', alignItems: 'center', gap: '8px' }}>
              AI Stress Pattern Analysis
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Comparative GenAI analytics matching daily diaries against historical baselines.</p>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          <div style={{
            background: 'rgba(255, 255, 255, 0.03)',
            borderLeft: '3px solid var(--color-primary)',
            padding: '14px 20px',
            borderRadius: '0 8px 8px 0',
            fontSize: '0.95rem',
            color: 'var(--text-main)',
            lineHeight: '1.45'
          }}>
            <strong style={{ color: '#fff', marginRight: '6px' }}>Stress Correlation:</strong>
            {patternsData.correlation}
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '20px'
          }}>
            
            {/* List of Detected Patterns */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <h3 style={{ fontSize: '1rem', color: '#fff', borderBottom: '1px solid var(--border-glow)', paddingBottom: '8px', display: 'flex', gap: '8px', alignItems: 'center' }}>
                <Clock size={16} style={{ color: 'var(--color-accent-teal)' }} /> Cycles & Delta Comparisons
              </h3>
              
              {patternsData.patterns && patternsData.patterns.map((pt, i) => (
                <div key={i} className="glass-panel" style={{ padding: '16px', background: 'rgba(255, 255, 255, 0.02)', borderRadius: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px', gap: '8px' }}>
                    <h4 style={{ fontSize: '0.95rem', color: '#fff', fontWeight: '600' }}>{pt.title}</h4>
                    {pt.severity === 'high' ? (
                      <span style={{ background: 'rgba(244, 63, 94, 0.15)', color: 'var(--color-accent-rose)', border: '1px solid rgba(244, 63, 94, 0.3)', padding: '2px 8px', borderRadius: '8px', fontSize: '0.68rem', fontWeight: 'bold' }}>HIGH</span>
                    ) : pt.severity === 'medium' ? (
                      <span style={{ background: 'rgba(245, 158, 11, 0.15)', color: 'var(--color-accent-amber)', border: '1px solid rgba(245, 158, 11, 0.3)', padding: '2px 8px', borderRadius: '8px', fontSize: '0.68rem', fontWeight: 'bold' }}>MEDIUM</span>
                    ) : (
                      <span style={{ background: 'rgba(20, 184, 166, 0.15)', color: 'var(--color-accent-teal)', border: '1px solid rgba(20, 184, 166, 0.3)', padding: '2px 8px', borderRadius: '8px', fontSize: '0.68rem', fontWeight: 'bold' }}>LOW</span>
                    )}
                  </div>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: '1.4' }}>{pt.description}</p>
                </div>
              ))}
            </div>

            {/* Recommendations */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <h3 style={{ fontSize: '1rem', color: '#fff', borderBottom: '1px solid var(--border-glow)', paddingBottom: '8px', display: 'flex', gap: '8px', alignItems: 'center' }}>
                <Heart size={16} style={{ color: 'var(--color-accent-rose)' }} /> Actionable Lifestyle Coping
              </h3>
              
              <ul style={{ listStyleType: 'none', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {patternsData.recommendations && patternsData.recommendations.map((rec, i) => (
                  <li key={i} style={{ 
                    fontSize: '0.88rem', 
                    color: 'var(--text-muted)', 
                    lineHeight: '1.45',
                    position: 'relative',
                    paddingLeft: '20px'
                  }}>
                    <span style={{ 
                      position: 'absolute', 
                      left: '0', 
                      top: '6px', 
                      width: '6px', 
                      height: '6px', 
                      borderRadius: '50%', 
                      background: 'var(--color-accent-rose)' 
                    }} />
                    {rec}
                  </li>
                ))}
              </ul>
            </div>

          </div>

        </div>

      </div>

      {/* Phase 8 - Weekly AI Report Dashboard Component */}
      <div className="glass-panel" style={{ padding: '28px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h2 style={{ fontSize: '1.3rem', color: '#fff', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FileText size={20} style={{ color: 'var(--color-accent-teal)' }} /> Weekly AI Wellness Review
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: '2px' }}>Generates statistical reviews, burnout pacing graphs, and milestones recommendations.</p>
          </div>
          
          <button
            onClick={handleRegenReport}
            className="btn-primary"
            style={{ 
              padding: '10px 20px', 
              fontSize: '0.85rem',
              background: 'linear-gradient(135deg, var(--color-accent-teal) 0%, hsl(175, 80%, 40%) 100%)',
              boxShadow: '0 4px 12px var(--color-accent-teal-glow)'
            }}
            disabled={isGeneratingReport || logs.length === 0}
          >
            {isGeneratingReport ? (
              <><RefreshCw size={12} className="spinner" style={{ animation: 'spin 1s linear infinite' }} /> Generating...</>
            ) : (
              <><RefreshCw size={12} /> Compile Weekly Report</>
            )}
          </button>
        </div>

        {weeklyReports ? (
          <div className="animate-fade-in" style={{
            background: 'rgba(255, 255, 255, 0.01)',
            border: '1px solid var(--border-glow)',
            borderRadius: '12px',
            padding: '24px',
            display: 'flex',
            flexDirection: 'column',
            gap: '20px'
          }}>
            
            {/* Stats row */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
              gap: '16px',
              borderBottom: '1px solid var(--border-glow)',
              paddingBottom: '20px'
            }}>
              <div>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-dim)' }}>Avg Stress Score</span>
                <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#fff', marginTop: '4px' }}>
                  {weeklyReports.avgStress}/100
                </div>
              </div>
              
              <div>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-dim)' }}>Avg Mood State</span>
                <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--color-accent-teal)', marginTop: '4px' }}>
                  {weeklyReports.avgMood}
                </div>
              </div>

              <div>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-dim)' }}>Avg Sleep Hours</span>
                <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--color-accent-blue)', marginTop: '4px' }}>
                  {weeklyReports.avgSleep} hrs
                </div>
              </div>

              <div>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-dim)' }}>Top Stress Trigger</span>
                <div style={{ fontSize: '1.1rem', fontWeight: 'bold', color: 'var(--color-accent-rose)', marginTop: '6px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={weeklyReports.topTrigger}>
                  {weeklyReports.topTrigger}
                </div>
              </div>
            </div>

            {/* Structured details */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', flexWrap: 'wrap' }}>
              
              {/* Achievements Column */}
              <div>
                <h4 style={{ fontSize: '0.9rem', color: '#fff', marginBottom: '10px', display: 'flex', gap: '6px', alignItems: 'center' }}>
                  <Star size={14} style={{ color: 'var(--color-accent-amber)' }} /> Weekly Achievements
                </h4>
                <ul style={{ listStyleType: 'none', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {weeklyReports.achievements?.map((ach, idx) => (
                    <li key={idx} style={{ fontSize: '0.82rem', color: 'var(--text-muted)', display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <span style={{ color: 'var(--color-accent-teal)', fontWeight: 'bold' }}>✓</span> {ach}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Areas to improve Column */}
              <div>
                <h4 style={{ fontSize: '0.9rem', color: '#fff', marginBottom: '10px', display: 'flex', gap: '6px', alignItems: 'center' }}>
                  <AlertTriangle size={14} style={{ color: 'var(--color-accent-rose)' }} /> Focus Action Areas
                </h4>
                <ul style={{ listStyleType: 'none', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {weeklyReports.areasToImprove?.map((area, idx) => (
                    <li key={idx} style={{ fontSize: '0.82rem', color: 'var(--text-muted)', display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <span style={{ color: 'var(--color-accent-rose)' }}>•</span> {area}
                    </li>
                  ))}
                </ul>
              </div>

            </div>

            {/* Recommendation block */}
            <div style={{
              background: 'rgba(255,255,255,0.02)',
              border: '1px solid var(--border-glow)',
              padding: '16px',
              borderRadius: '8px',
              marginTop: '8px'
            }}>
              <strong style={{ display: 'block', fontSize: '0.88rem', color: '#fff', marginBottom: '6px' }}>Weekly AI Coping Strategy:</strong>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: '1.45' }}>{weeklyReports.recommendation}</p>
            </div>

            {/* Closing text */}
            <p style={{ fontSize: '0.82rem', color: 'var(--text-dim)', fontStyle: 'italic', textAlign: 'center', marginTop: '4px' }}>
              "{weeklyReports.motivationalMessage}"
            </p>

          </div>
        ) : (
          <div style={{
            padding: '30px',
            textAlign: 'center',
            border: '1px dashed var(--border-glow)',
            borderRadius: '12px',
            color: 'var(--text-muted)',
            fontSize: '0.9rem'
          }}>
            {logs.length === 0 
              ? 'Compile your first journal logs to unlock weekly wellness analysis reports.'
              : 'Press the compile button to generate a structured weekly analysis summary.'
            }
          </div>
        )}
      </div>

    </div>
  );
}
